import express, { Request, Response } from "express";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import prisma from "./prisma";

import { downloadYoutubeAudio } from "./modules/youtube/downloadYoutubeAudio";
import { transcribeAudio } from "./modules/whisper/transcribeAudio";
import { cleanUpDownloads, cleanUpOldDownloads } from "./modules/fileManage/cleanUp";

import { DonwloadStatus, DonwloadStatusType } from "./models/DownloadStatusType";
import { summarizeText } from "./modules/openai/openai";

const app = express();
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));
dotenv.config();

const PORT = process.env.PORT || 3000;

const PROJECT_ROOT = process.cwd();
const AUDIO_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'audio');
const SUBTITLE_DOWNLOAD_PATH = path.join(PROJECT_ROOT, 'downloads', 'subtitle');
const CLEAN_UP_INTERVAL = 1000 * 60 * 60; // 1 hour

const requestYoutubeAudioTranscribe = async (youtubeUrl: string, uuid: string) => {
  const download = await prisma.download.findUnique({
    where: { id: uuid },
  });

  if (!download) {
    throw new Error("Download not found");
  }

  try {
    await downloadYoutubeAudio(
      youtubeUrl,
      AUDIO_DOWNLOAD_PATH,
      uuid,
    );

    await prisma.download.update({
      where: { id: uuid },
      data: {
        audioFilePath: `/downloads/audio/audio_${uuid}.mp3`,
        status: DonwloadStatus.transcribing,
      },
    });

    await transcribeAudio(
      `${PROJECT_ROOT}/downloads/audio/audio_${uuid}.mp3`,
      SUBTITLE_DOWNLOAD_PATH,
      uuid,
    );

    await prisma.download.update({
      where: { id: uuid },
      data: {
        subtitleFilePath: `/downloads/subtitle/subtitle_${uuid}.srt`,
        status: DonwloadStatus.completed,
        completedAt: new Date(),
      },
    });

  } catch (error) {
    await prisma.download.update({
      where: { id: uuid },
      data: {
        status: DonwloadStatus.failed,
        completedAt: new Date(),
      },
    });
  }
}

app.post("/download/youtube/audio", async (req: Request, res: Response) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl) {
    res.status(400).json({ error: "Youtube URL is required" });
    return;
  }

  const existingDownload = await prisma.download.findFirst({
    where: {
      youtubeUrl,
    },
  });
  
  if (existingDownload) {
    res.status(200).json({ 
      uuid: existingDownload.id, 
      status: existingDownload.status,
      audioFilePath: `${process.env.BASE_URL}:${process.env.PORT}${existingDownload.audioFilePath}`,
      subtitleFilePath: `${process.env.BASE_URL}:${process.env.PORT}${existingDownload.subtitleFilePath}`,
      summary: existingDownload.summary,
    });
    return;
  }

  const download = await prisma.download.create({
    data: { 
      youtubeUrl,
      audioFilePath: "",
      subtitleFilePath: "",
      summary: ""
    },
  });
  
  requestYoutubeAudioTranscribe(youtubeUrl, download.id);
  
  res.status(202).json({ uuid: download.id, status: download.status });
});

app.get("/download/youtube/audio/status/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  console.log(`🔍 [${uuid}] Checking download status`);

  const download = await prisma.download.findUnique({
    where: { id: uuid },
  });

  if (!download || !download.status) {
    res.status(404).json({ error: "Download not found" });
    return;
  }

  res.status(200).json({ 
    uuid,
    status: download.status,
    audioFilePath: `${process.env.BASE_URL}:${process.env.PORT}${download.audioFilePath}`,
    subtitleFilePath: `${process.env.BASE_URL}:${process.env.PORT}${download.subtitleFilePath}`,
    summary: download.summary,
  });
});

app.get("/download/youtube/audio/summary/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  console.log(`🔍 [${uuid}] Checking digest`);

  const download = await prisma.download.findUnique({
    where: { id: uuid },
  });

  if (!download) {
    res.status(404).json({ error: "Download not found" });
    return;
  }

  const { subtitleFilePath } = download;
  const subtitleData = subtitleFilePath && fs.readFileSync(`${PROJECT_ROOT}/${subtitleFilePath}`, "utf-8");

  if (!subtitleData) {
    res.status(404).json({ error: "Subtitle not found" });
    return;
  }

  const summary = await summarizeText(subtitleData);
  if (!summary) {
    res.status(404).json({ error: "Summary not found" });
    return;
  }

  await prisma.download.update({
    where: { id: uuid },
    data: { summary },
  });

  res.status(200).json({ 
    uuid, 
    status: DonwloadStatus.completed, 
    audioFilePath: download.audioFilePath,
    subtitleFilePath: download.subtitleFilePath,
    summary,
  });
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
  cleanUpOldDownloads();
}, CLEAN_UP_INTERVAL);

// clean up downloads when server starts
initDownloadDirectories();
cleanUpDownloads(AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH); 

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
