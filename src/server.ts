import express, { Request, RequestHandler, Response } from "express";
import path from "path";
import fs from "fs-extra";
import { randomUUID } from "crypto";

import downloadYoutubeAudio from "./modules/youtube/downloadYoutubeAudio";
import transcribeAudio from "./modules/whisper/transcribeAudio";
import { cleanUpDownloads, cleanUpOldDownloads } from "./modules/cleanUp/cleanUp";

import { DonwloadStatus, DonwloadStatusType } from "./models/DownloadStatusType";

const app = express();
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '..', 'public')));
const PORT = process.env.PORT || 3000;

const PROJECT_ROOT = process.cwd();
const AUDIO_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'audio');
const SUBTITLE_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'subtitle');
const CLEAN_UP_INTERVAL = 1000 * 60 * 60; // 1 hour

const downloadStatus: Record<string, DonwloadStatusType> = {};

app.post("/download/youtube/audio", (req: Request, res: Response) => {
  const { youtubeUrl } = req.body;
  const uuid = randomUUID();

  downloadStatus[uuid] = {
    status: DonwloadStatus.pending,
  };

  downloadYoutubeAudio(
    youtubeUrl,
    AUDIO_DOWNLOAD_PATH,
    uuid,
    // success callback
    (audioFilePath) => {
      downloadStatus[uuid] = {
        status: DonwloadStatus.transcribing,
        audioFilePath,
        completedAt: Date.now(),
      };

      transcribeAudio(
        audioFilePath,
        SUBTITLE_DOWNLOAD_PATH,
        uuid,
        (subtitleFilePath) => {
          downloadStatus[uuid] = {
            status: DonwloadStatus.completed,
            audioFilePath,
            subtitleFilePath,
            completedAt: Date.now(),
          };
        }, (stderr) => {
          downloadStatus[uuid] = {
            status: DonwloadStatus.failed,
            error: stderr,
            completedAt: Date.now(),
          };
        });

      },
    // error callback
    (stderr) => {
      downloadStatus[uuid] = {
        status: DonwloadStatus.failed,
        error: stderr,
        completedAt: Date.now(),
      };
    }
  );

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

const initDownloadDirectories = () => {
  // Ensure download directories exist
  const audioDir = path.join(__dirname, "..", "downloads", "audio");
  const subtitleDir = path.join(__dirname, "..", "downloads", "subtitle");
  
  // Create directories if they don't exist
  fs.ensureDirSync(audioDir);
  fs.ensureDirSync(subtitleDir);
}

// clean up old downloads every 'CLEAN_UP_INTERVAL'
setInterval(() => {
  console.log("🧹 Running cleanup task");
  console.log(downloadStatus);
  cleanUpOldDownloads(downloadStatus);
}, CLEAN_UP_INTERVAL);

// clean up downloads when server starts
initDownloadDirectories();
cleanUpDownloads(AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH); 

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
