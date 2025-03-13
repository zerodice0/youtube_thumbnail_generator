import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';
import { PROJECT_ROOT } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(PROJECT_ROOT, 'downloads', ...params.path);
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // 파일 읽기
    const fileBuffer = await fs.readFile(filePath);
    
    // MIME 타입 결정
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (filePath.endsWith('.srt')) {
      contentType = 'text/plain';
    }
    
    // 응답 반환
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 