import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  response: NextResponse,
) {
  const params = await request.json();
  const url: string | null = params.url;

  if (!url) {
    return NextResponse.json(
      { error: 'Missing URL parameter' },
      { status: 400 }
    );
  }
}