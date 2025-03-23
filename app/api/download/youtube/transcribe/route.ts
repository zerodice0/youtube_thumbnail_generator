import { DonwloadStatus } from "@/lib/models/DownloadStatusType";
import { transcribeAudio } from "@/lib/modules/whisper/transcribeAudio";
import { downloadYoutubeAudio } from "@/lib/modules/youtube/downloadYoutubeAudio";
import { AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs-extra";
import { summarizeText } from "@/lib/modules/openai/openai";
import { getYoutubeInformation } from "@/lib/modules/youtube/getInformation";

interface TranscribingData {
  status: 'downloading' | 'transcribing' | 'complete' | 'error';
  audioFilePath: string | null;
  subtitleFilePath: string | null;
  summary: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const youtubeUrl = searchParams.get('url');

  if (!youtubeUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }
  
  // const existingDownload = await prisma.youtubeAudioDownload.findFirst({
  //   where: {
  //     youtubeUrl,
  //   },
  // });

  // if (existingDownload) {
      
  // }
  
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (eventType: string, data: any) => {
        const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      }

      try {
        const information = await getYoutubeInformation(youtubeUrl);

        sendEvent('information', {
          title: information.title,
          thumbnail: information.thumbnail,
        });
      } catch (error) {
        sendEvent('error', { message: 'Internal Server Error' });
      }

      try {
        // generate task
        const task = await prisma.youtubeAudioDownload.create({
          data: {
            youtubeUrl,
            audioFilePath: "",
            subtitleFilePath: "",
            summary: "",
          },
        });

        // update status to database
        await prisma.youtubeAudioDownload.update({
          where: { id: task.id },
          data: {
            status: DonwloadStatus.downloading,
          },
        });

        // send event to client
        sendEvent('downloading', {
          status: 'downloading',
          uuid: task.id,
        });

        // start download audio
        const audioFilePath = await downloadYoutubeAudio(
          youtubeUrl,
          AUDIO_DOWNLOAD_PATH,
          task.id,
        );

        // update status to database
        await prisma.youtubeAudioDownload.update({
          where: { id: task.id },
          data: {
            audioFilePath: `/api/download/youtube/audio/${task.id}`,
            status: DonwloadStatus.downloading,
          },
        });

        // send event to client
        sendEvent('transcribing', {
          status: 'transcribing',
          uuid: task.id,
          audioFile: `/api/download/youtube/audio/${task.id}`,
        });
        
        // start transcribe audio
        const subtitleFilePath = await transcribeAudio(
          audioFilePath,
          SUBTITLE_DOWNLOAD_PATH,
          task.id,
        );

        // update status to database
        await prisma.youtubeAudioDownload.update({
          where: { id: task.id },
          data: {
            subtitleFilePath: `/api/download/youtube/subtitle/${task.id}`,
            status: DonwloadStatus.completed,
            completedAt: new Date(),
          },
        });

        // summarize subtitle
        sendEvent('summarizing', {
          status: 'summarizing',
          uuid: task.id,
          subtitleFile: `/api/download/youtube/subtitle/${task.id}`,
        });

        const subtitleData = subtitleFilePath && fs.readFileSync(`${subtitleFilePath}`, "utf-8");
        const summary = await summarizeText(subtitleData);

        sendEvent('completed', {
          status: 'completed',
          uuid: task.id,
          summary: summary,
        });
        
        sendEvent('close', { 
          message: 'close' 
        });
      } catch (error) {
        sendEvent('error', { message: 'Internal Server Error' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  })
}
