import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFullUrl } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: any
) {
  const { uuid } = await params;

  console.log(`🔍 [${uuid}] Checking download status`);

  const download = await prisma.youtubeAudioDownload.findUnique({
    where: { id: uuid },
  });

  if (!download || !download.status) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  return NextResponse.json({ 
    uuid,
    status: download.status,
    audioFilePath: getFullUrl(download.audioFilePath),
    subtitleFilePath: getFullUrl(download.subtitleFilePath),
    summary: download.summary,
  });
} 