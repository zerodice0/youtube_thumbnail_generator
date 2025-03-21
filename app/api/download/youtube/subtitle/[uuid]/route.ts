import prisma from "@/lib/prisma";
import { PROJECT_ROOT } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs-extra";

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
    const filePath = path.join(PROJECT_ROOT, 'downloads', 'subtitle', `subtitle_${uuid}.srt`);
    
    // 파일을 UTF-8 인코딩으로 직접 읽음
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // 텍스트/SRT 형식으로 제공하고 UTF-8 인코딩 명시
    return new Response(fileContent, {
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving subtitle file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
