import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const youtubeUrl = searchParams.get('url');

  if (!youtubeUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }
  
  const existingDownload = await prisma.youtubeAudioDownload.findFirst({
    where: {
      youtubeUrl,
    },
  });

  // if (existingDownload) {
    
  // }
  
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (eventType: string, data: any) => {
        // 올바른 SSE 형식으로 수정: 이벤트 타입 지정 및 데이터 직접 전달
        const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      }

      try {
        // 메시지 타입에 맞는 이벤트 발송
        sendEvent('ping', { message: 'pong' });
        sendEvent('close', { message: 'close' });
      } catch (error) {
        console.error('Error: ', error);
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