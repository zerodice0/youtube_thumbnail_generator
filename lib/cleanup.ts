import { cleanUpDownloads, cleanUpOldDownloads } from "@/src/modules/fileManage/cleanUp";
import { AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH } from "./utils";

// 초기 정리 작업 실행
export const runInitialCleanup = () => {
  console.log("🧹 Running initial cleanup task");
  cleanUpDownloads(AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH);
};

// 정기적인 정리 작업 설정
let cleanupInterval: NodeJS.Timeout | null = null;

export const startCleanupInterval = (intervalMs = 1000 * 60 * 60) => { // 기본값 1시간
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(() => {
    console.log("🧹 Running scheduled cleanup task");
    cleanUpOldDownloads();
  }, intervalMs);
  
  return cleanupInterval;
};

export const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}; 