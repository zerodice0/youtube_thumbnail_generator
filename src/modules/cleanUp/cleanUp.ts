import path from "path";
import fs from "fs-extra";

import { DonwloadStatus, DonwloadStatusType } from "../../models/DownloadStatusType";

const FILE_EXPIRATION_TIME = 1000 * 60 * 60 * 3; // 3 hours

const cleanUpDownloads = async (
  audioDownloadPath: string,
  subtitleDownloadPath: string,
) => {
  console.log("🧹 Running cleanup task");

  try {
    const audioFiles = fs.readdirSync(audioDownloadPath);
    audioFiles.forEach((file) => {
      const filePath = path.join(audioDownloadPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    const subtitleFiles = fs.readdirSync(subtitleDownloadPath);
    subtitleFiles.forEach((file) => {
      const filePath = path.join(subtitleDownloadPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("❌ Failed to clean up downloads", error);
  }
}

const cleanUpOldDownloads = async (
  downloadStatus: Record<string, DonwloadStatusType>
) => {
  console.log("🧹 Running cleanup task");
  
  const now = Date.now();
  Object.keys(downloadStatus).forEach((uuid) => {
    const status = downloadStatus[uuid];
    status.completedAt && console.log(now - status.completedAt);
    if (
      (status.status === DonwloadStatus.completed || status.status === DonwloadStatus.failed)
      && (status.completedAt && ((now - status.completedAt) > FILE_EXPIRATION_TIME))
    ) {
      console.log (status.audioFilePath, status.subtitleFilePath);

      if (status.audioFilePath && fs.existsSync(status.audioFilePath)) {
        console.log(`🧹 [${uuid}] Deleting file: ${status.audioFilePath}`);
        try {
          // remove old file
          status.audioFilePath && fs.unlinkSync(status.audioFilePath);
          // remove record from downloadStatus
          delete downloadStatus[uuid];
        } catch (error) {
          console.error(`❌ [${uuid}] Failed to delete file: ${status.audioFilePath}`);
        }
      }
      if (status.subtitleFilePath && fs.existsSync(status.subtitleFilePath)) {
        console.log(`🧹 [${uuid}] Deleting file: ${status.subtitleFilePath}`);
        try {
          // remove old file
          status.subtitleFilePath && fs.unlinkSync(status.subtitleFilePath);
        } catch (error) {
          console.error(`❌ [${uuid}] Failed to delete file: ${status.subtitleFilePath}`);
        }
      }
    }
  });
}

export { cleanUpDownloads, cleanUpOldDownloads };