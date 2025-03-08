import express, { Request, Response } from "express";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";

import { randomUUID } from "crypto";

import { downloadYoutubeAudio } from "./modules/youtube/downloadYoutubeAudio";
import { transcribeAudio } from "./modules/whisper/transcribeAudio";
import { cleanUpDownloads, cleanUpOldDownloads } from "./modules/fileManage/cleanUp";

import { DonwloadStatus, DonwloadStatusType } from "./models/DownloadStatusType";
import { summarizeText } from "./modules/openai/openai";

const app = express();
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '..', 'public')));
dotenv.config();

const PORT = process.env.PORT || 3000;

const PROJECT_ROOT = process.cwd();
const AUDIO_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'audio');
const SUBTITLE_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'subtitle');
const CLEAN_UP_INTERVAL = 1000 * 60 * 60; // 1 hour

const downloadStatus: Record<string, DonwloadStatusType> = {};

const requestYoutubeAudioTranscribe = async (youtubeUrl: string, uuid: string) => {
  downloadStatus[uuid] = {
    status: DonwloadStatus.pending,
  };

  try {
    const audioFilePath = await downloadYoutubeAudio(
      youtubeUrl,
      AUDIO_DOWNLOAD_PATH,
      uuid,
    );
  
    downloadStatus[uuid] = {
      status: DonwloadStatus.transcribing,
      audioFilePath,
      completedAt: Date.now(),
    };

    downloadStatus[uuid] = {
      status: DonwloadStatus.transcribing,
      audioFilePath,
      completedAt: Date.now(),
    };
  
    const subtitleFilePath = await transcribeAudio(
      audioFilePath,
      SUBTITLE_DOWNLOAD_PATH,
      uuid,
    );
    
    downloadStatus[uuid] = {
      status: DonwloadStatus.completed,
      audioFilePath,
      subtitleFilePath,
      completedAt: Date.now(),
    };

  } catch (error) {
    downloadStatus[uuid] = {
      status: DonwloadStatus.failed,
      error: (error as Error).message,
      completedAt: Date.now(),
    };
  }
}

app.post("/download/youtube/audio", async (req: Request, res: Response) => {
  const { youtubeUrl } = req.body;
  const uuid = randomUUID();
  
  requestYoutubeAudioTranscribe(youtubeUrl, uuid);

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

app.get("/contents/digest/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  console.log(`🔍 [${uuid}] Checking digest`);
  const status = downloadStatus[uuid];
  if (!status) {
    res.status(404).json({ error: "Download not found" });
    return;
  }

  const { subtitleFilePath } = status;
  const subtitleData = subtitleFilePath && fs.readFileSync(subtitleFilePath, "utf-8");

  if (!subtitleData) {
    res.status(404).json({ error: "Subtitle not found" });
    return;
  }

  const summary = await summarizeText(subtitleData);
  if (!summary) {
    res.status(404).json({ error: "Summary not found" });
    return;
  }

  res.status(200).json({ uuid, status: DonwloadStatus.completed, summary });
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
