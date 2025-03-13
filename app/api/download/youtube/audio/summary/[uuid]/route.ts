import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import prisma from "@/lib/prisma";
import { DonwloadStatus } from "@/lib/models/DownloadStatusType";
import { PROJECT_ROOT } from "@/lib/utils";
import { summarizeText } from "@/src/modules/openai/openai";

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { uuid } = params;
  console.log(`🔍 [${uuid}] Checking digest`);

  const download = await prisma.download.findUnique({
    where: { id: uuid },
  });

  if (!download) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  const { subtitleFilePath } = download;
  const subtitleData = subtitleFilePath && fs.readFileSync(`${PROJECT_ROOT}${subtitleFilePath}`, "utf-8");

  if (!subtitleData) {
    return NextResponse.json({ error: "Subtitle not found" }, { status: 404 });
  }

  const summary = await summarizeText(subtitleData);
  if (!summary) {
    return NextResponse.json({ error: "Summary not found" }, { status: 404 });
  }

  await prisma.download.update({
    where: { id: uuid },
    data: { summary },
  });

  return NextResponse.json({ 
    uuid, 
    status: DonwloadStatus.completed, 
    audioFilePath: download.audioFilePath,
    subtitleFilePath: download.subtitleFilePath,
    summary,
  });
} 