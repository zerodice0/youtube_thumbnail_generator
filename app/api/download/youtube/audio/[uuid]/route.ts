import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { uuid } = await params;

  console.log(uuid);

  const download = await prisma.youtubeAudioDownload.findUnique({
    where: { id: uuid },
  });

  return new NextResponse('hello', { 
    headers: {
      'Content-Type': 'text/plain',
      // 'Content-Disposition': `attachment; filename="${download?.audioFilePath}"`,
      'Cache-Control': 'public, max-age=31536000',
    },
    status: 200, 
  });
}