import path from "path";
import fs from "fs-extra";

import { DonwloadStatus, DonwloadStatusType } from "../../models/DownloadStatusType";
import prisma from "../../prisma";

const FILE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 14; // 14 days

const cleanUpDownloads = async (
  audioDownloadPath: string,
  subtitleDownloadPath: string,
) => {
  console.log("🧹 Running cleanup task");

  const downloads = await prisma.download.findMany({
    where: {
      status: DonwloadStatus.failed,
    },
  });

  downloads.forEach(async (download) => {
    if (download.audioFilePath && fs.existsSync(download.audioFilePath)) {
      fs.unlinkSync(download.audioFilePath);
    }
    if (download.subtitleFilePath && fs.existsSync(download.subtitleFilePath)) {
      fs.unlinkSync(download.subtitleFilePath);
    }
  });
}

const cleanUpOldDownloads = async () => {
  console.log("🧹 Running cleanup task");
  
  const now = Date.now();
  const downloads = await prisma.download.findMany({
    where: {
      status: {
        in: [DonwloadStatus.failed, DonwloadStatus.completed],
      },
    },
  });

  downloads.forEach(async (download) => {
    if ((now - (download.completedAt?.getTime() ?? 0)) > FILE_EXPIRATION_TIME) {
      if (download.audioFilePath && fs.existsSync(download.audioFilePath)) {
        fs.unlinkSync(download.audioFilePath);
      }
      if (download.subtitleFilePath && fs.existsSync(download.subtitleFilePath)) {
        fs.unlinkSync(download.subtitleFilePath);
      }
      await prisma.download.delete({
        where: {
          id: download.id,
        },
      });
    }
  });
}

export { cleanUpDownloads, cleanUpOldDownloads };