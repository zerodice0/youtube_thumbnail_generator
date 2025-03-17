import prisma from "@/lib/prisma";
import { PROJECT_ROOT } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs-extra";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { uuid } = await params;

  const download = await prisma.youtubeAudioDownload.findUnique({
    where: { id: uuid },
  });

  if (!download || !download.status) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(PROJECT_ROOT, 'downloads', 'audio', `audio_${uuid}.mp3`);
    const fileBuffer = await fs.readFile(filePath);
    let contentType = 'audio/mpeg';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } 
}