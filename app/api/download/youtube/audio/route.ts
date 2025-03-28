import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DonwloadStatus } from "@/lib/models/DownloadStatusType";
import { getFullUrl, AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH } from "@/lib/utils";
import { downloadYoutubeAudio } from "@/lib/modules/youtube/downloadYoutubeAudio";
import { transcribeAudio } from "@/lib/modules/whisper/transcribeAudio";
import { PROJECT_ROOT } from "@/lib/utils";

const requestYoutubeAudioTranscribe = async (youtubeUrl: string, uuid: string) => {
  const download = await prisma.youtubeAudioDownload.findUnique({
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

    await prisma.youtubeAudioDownload.update({
      where: { id: uuid },
      data: {
        audioFilePath: `/api/download/youtube/audio/${uuid}`,
        status: DonwloadStatus.transcribing,
      },
    });

    await transcribeAudio(
      `${PROJECT_ROOT}/downloads/audio/audio_${uuid}.mp3`,
      SUBTITLE_DOWNLOAD_PATH,
      uuid,
    );

    await prisma.youtubeAudioDownload.update({
      where: { id: uuid },
      data: {
        subtitleFilePath: `/api/download/youtube/subtitle/${uuid}`,
        status: DonwloadStatus.completed,
        completedAt: new Date(),
      },
    });

  } catch (error) {
    await prisma.youtubeAudioDownload.update({
      where: { id: uuid },
      data: {
        status: DonwloadStatus.failed,
        completedAt: new Date(),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { youtubeUrl } = body;  

  if (!youtubeUrl) {
    return NextResponse.json({ error: "Youtube URL is required" }, { status: 400 });
  }

  const existingDownload = await prisma.youtubeAudioDownload.findFirst({
    where: {
      youtubeUrl,
    },
  });
  
  if (existingDownload) {
    return NextResponse.json({ 
      uuid: existingDownload.id, 
      status: existingDownload.status,
      audioFilePath: getFullUrl(existingDownload.audioFilePath),
      subtitleFilePath: getFullUrl(existingDownload.subtitleFilePath),
      summary: existingDownload.summary,
    });
  }

  const download = await prisma.youtubeAudioDownload.create({
    data: { 
      youtubeUrl,
      audioFilePath: "",
      subtitleFilePath: "",
      summary: ""
    },
  });
  
  // 비동기로 처리
  requestYoutubeAudioTranscribe(youtubeUrl, download.id);
  
  return NextResponse.json(
    { uuid: download.id, status: download.status },
    { status: 202 }
  );
} 