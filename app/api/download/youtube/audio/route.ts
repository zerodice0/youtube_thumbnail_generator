import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DonwloadStatus } from "@/lib/models/DownloadStatusType";
import { getFullUrl, AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH } from "@/lib/utils";
import { downloadYoutubeAudio } from "@/src/modules/youtube/downloadYoutubeAudio";
import { transcribeAudio } from "@/src/modules/whisper/transcribeAudio";
import { PROJECT_ROOT } from "@/lib/utils";

const requestYoutubeAudioTranscribe = async (youtubeUrl: string, uuid: string) => {
  const download = await prisma.YoutubeAudioDownload.findUnique({
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

    await prisma.YoutubeAudioDownload.update({
      where: { id: uuid },
      data: {
        audioFilePath: `/downloads/audio/audio_${uuid}.mp3`,
        status: DonwloadStatus.transcribing,
      },
    });

    await transcribeAudio(
      `${PROJECT_ROOT}/public/downloads/audio/audio_${uuid}.mp3`,
      SUBTITLE_DOWNLOAD_PATH,
      uuid,
    );

    await prisma.YoutubeAudioDownload.update({
      where: { id: uuid },
      data: {
        subtitleFilePath: `/downloads/subtitle/subtitle_${uuid}.srt`,
        status: DonwloadStatus.completed,
        completedAt: new Date(),
      },
    });

  } catch (error) {
    await prisma.YoutubeAudioDownload.update({
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

  const existingDownload = await prisma.YoutubeAudioDownload.findFirst({
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

  const download = await prisma.YoutubeAudioDownload.create({
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