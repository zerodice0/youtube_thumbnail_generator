import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import path from 'path';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /downloads로 시작하는 경로는 정적 파일로 처리
  if (pathname.startsWith('/downloads')) {
    // 여기서는 Next.js의 정적 파일 제공 기능을 사용하므로 별도 처리 필요 없음
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/downloads/:path*'],
}; 