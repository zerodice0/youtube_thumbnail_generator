import express, { Request, RequestHandler, Response } from "express";
import { exec } from "child_process";
import path from "path";
import fs from "fs-extra";
import { promisify } from "util";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const CLEAN_UP_INTERVAL = 1000 * 60 * 60; // 1 hour
const FILE_EXPIRATION_TIME = 1000 * 60 * 60 * 3; // 3 hours

const DonwloadStatus = {
  pending: "pending",
  downloading: "downloading",
  transcribing: "transcribing",
  completed: "completed",
  failed: "failed",
} as const;

type DonwloadStatusType = {
  status: typeof DonwloadStatus[keyof typeof DonwloadStatus];
  audioFilePath?: string;
  subtitleFilePath?: string;
  error?: string;
  completedAt?: number;
};

const downloadStatus: Record<string, DonwloadStatusType> = {};

app.post("/download/youtube/audio", (req: Request, res: Response) => {
  if (!req.body.youtubeUrl) {
    res.status(400).json({ error: "YouTube URL is required" });
    return;
  }

  const { youtubeUrl } = req.body;
  const uuid = randomUUID();
  
  const AUDIO_FILE_PATH = path.join(__dirname, "..", "downloads", "audio", `audio_${uuid}.mp3`);
  const SUBTITLE_FILE_PATH = path.join(__dirname, "..", "downloads", "subtitle", `subtitle_${uuid}.srt`);

  downloadStatus[uuid] = {
    status: DonwloadStatus.pending,
  };

  console.log(`📥 [${uuid}] Download started for: ${youtubeUrl}`);

  exec(
    `yt-dlp -x --audio-format mp3 -o "${AUDIO_FILE_PATH}" "${youtubeUrl}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ [${uuid}] Download error: ${stderr}`);
        downloadStatus[uuid] = {
          status: DonwloadStatus.failed,
          error: stderr,
          completedAt: Date.now(),
        };
        return;
      }

      console.log(`✅ [${uuid}] Download complete: ${AUDIO_FILE_PATH}`);
      downloadStatus[uuid] = {
        status: DonwloadStatus.transcribing,
        audioFilePath: AUDIO_FILE_PATH,
        completedAt: Date.now(),
      };

      exec(`${process.env.WHISPER_BIN_PATH}/whisper-cli -m ${process.env.WHISPER_MODEL_PATH}/ggml-large-v3-turbo.bin -l auto -f "${AUDIO_FILE_PATH}" -osrt -of "${SUBTITLE_FILE_PATH}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ [${uuid}] Transcribing error: ${stderr}`);
          downloadStatus[uuid] = {
            status: DonwloadStatus.failed,
            audioFilePath: AUDIO_FILE_PATH,
            subtitleFilePath: SUBTITLE_FILE_PATH,
            error: stderr,
            completedAt: Date.now(),
          };
          return;
        }

        console.log(`✅ [${uuid}] Transcribing complete: ${SUBTITLE_FILE_PATH}`);
        downloadStatus[uuid] = {
          status: DonwloadStatus.completed,
          audioFilePath: AUDIO_FILE_PATH,
          subtitleFilePath: SUBTITLE_FILE_PATH,
          completedAt: Date.now(),
        };
      });
    });

  // Return the uuid to the user immediately
  res.status(202).json({ uuid, status: DonwloadStatus.pending });
});

app.get("/download/youtube/audio/status/:uuid", (req: Request, res: Response) => {
  const { uuid } = req.params;
  console.log(`🔍 [${uuid}] Checking download status`);
  const status = downloadStatus[uuid];
  if (!status) {
    res.status(404).json({ error: "Download not found" });
    return;
  }
  res.status(200).json({ uuid, status });
});

const cleanUpOldDownloads = () => {
  console.log("🧹 Running cleanup task");

  const now = Date.now();
  Object.keys(downloadStatus).forEach((uuid) => {
    const status = downloadStatus[uuid];
    if (
      (status.status === DonwloadStatus.completed || status.status === DonwloadStatus.failed)
      && (status.completedAt && ((now - status.completedAt) > FILE_EXPIRATION_TIME))
    ) {
      if (status.audioFilePath && fs.existsSync(status.audioFilePath)) {
        console.log(`🧹 [${uuid}] Deleting file: ${status.audioFilePath}`);
        try {
          // remove old file
          status.audioFilePath && fs.unlinkSync(status.audioFilePath);
          // remove record from downloadStatus
          delete downloadStatus[uuid];
        } catch (error) {
          console.error(`❌ [${uuid}] Failed to delete file: ${status.audioFilePath}`);
        }
      }
      if (status.subtitleFilePath && fs.existsSync(status.subtitleFilePath)) {
        console.log(`🧹 [${uuid}] Deleting file: ${status.subtitleFilePath}`);
        try {
          // remove old file
          status.subtitleFilePath && fs.unlinkSync(status.subtitleFilePath);
        } catch (error) {
          console.error(`❌ [${uuid}] Failed to delete file: ${status.subtitleFilePath}`);
        }
      }
    }
  });
}

const initDownloadDirectories = () => {
  // Ensure download directories exist
  const audioDir = path.join(__dirname, "..", "downloads", "audio");
  const subtitleDir = path.join(__dirname, "..", "downloads", "subtitle");
  
  // Create directories if they don't exist
  fs.ensureDirSync(audioDir);
  fs.ensureDirSync(subtitleDir);
}

const cleanUpDownloads = async () => {
  console.log("🧹 Running cleanup task");

  const AUDIO_FILE_PATH = path.join(__dirname, "..", "downloads", "audio");
  const SUBTITLE_FILE_PATH = path.join(__dirname, "..", "downloads", "subtitle");

  try {
    const audioFiles = fs.readdirSync(AUDIO_FILE_PATH);
    audioFiles.forEach((file) => {
      const filePath = path.join(AUDIO_FILE_PATH, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    const subtitleFiles = fs.readdirSync(SUBTITLE_FILE_PATH);
    subtitleFiles.forEach((file) => {
      const filePath = path.join(SUBTITLE_FILE_PATH, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("❌ Failed to clean up downloads", error);
  }
}

// clean up old downloads every 'CLEAN_UP_INTERVAL'
setInterval(cleanUpOldDownloads, CLEAN_UP_INTERVAL);

// clean up downloads when server starts
initDownloadDirectories();
cleanUpDownloads(); 

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});