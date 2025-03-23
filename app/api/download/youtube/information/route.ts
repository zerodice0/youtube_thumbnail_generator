import { getYoutubeInformation } from "@/lib/modules/youtube/getInformation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const { url } = await request.json();

  try {
    const information = await getYoutubeInformation(url);
    
    return NextResponse.json({
      'title': information.title,
      'thumbnail': information.thumbnail,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Video not found") {
      return NextResponse.json({
        error: "Video not found",
      }, { status: 404 });
    } else if (error instanceof Error && error.message === "Invalid YouTube URL") {
      return NextResponse.json({
        error: "Invalid YouTube URL",
      }, { status: 400 });
    } else {
      return NextResponse.json({
        error: "Failed to get YouTube information",
      }, { status: 500 });
    }
  }

}