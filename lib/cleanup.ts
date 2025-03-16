import { AUDIO_DOWNLOAD_PATH, SUBTITLE_DOWNLOAD_PATH } from "./utils";
import prisma from "./prisma";
import fs from "fs-extra";
import path from "path";

// 정기적인 정리 작업 설정
let cleanupInterval: NodeJS.Timeout | null = null;

export const startCleanupInterval = (intervalMs = 1000 * 60 * 60) => { // 기본값 1시간
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(() => {
    console.log("🧹 Running scheduled cleanup task");
    cleanupOldFiles();
  }, intervalMs);
  
  return cleanupInterval;
};

/**
 * 7일 이전에 완료된 파일들을 삭제하는 함수
 */
export const cleanupOldFiles = async () => {
  try {
    // 7일 전 날짜 계산
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // completedAt이 7일 이전인 레코드 조회
    const oldRecords = await prisma.youtubeAudioDownload.findMany({
      where: {
        completedAt: {
          lt: sevenDaysAgo
        },
        status: "completed"
      }
    });
    
    console.log(`Found ${oldRecords.length} records older than 7 days to clean up`);
    
    // 각 레코드에 대해 파일 삭제 및 DB 업데이트
    for (const record of oldRecords) {
      try {
        // 오디오 파일 삭제
        if (record.audioFilePath) {
          const audioPath = path.join(AUDIO_DOWNLOAD_PATH, path.basename(record.audioFilePath));
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
            console.log(`Deleted audio file: ${audioPath}`);
          }
        }
        
        // 자막 파일 삭제
        if (record.subtitleFilePath) {
          const subtitlePath = path.join(SUBTITLE_DOWNLOAD_PATH, path.basename(record.subtitleFilePath));
          if (fs.existsSync(subtitlePath)) {
            fs.unlinkSync(subtitlePath);
            console.log(`Deleted subtitle file: ${subtitlePath}`);
          }
        }
        
        // 데이터베이스에서 레코드 삭제
        await prisma.youtubeAudioDownload.delete({
          where: { id: record.id }
        });
        
        console.log(`Deleted database record with ID: ${record.id}`);
      } catch (error) {
        console.error(`Error cleaning up record ${record.id}:`, error);
      }
    }
    
    console.log(`Cleanup completed: ${oldRecords.length} records processed`);
  } catch (error) {
    console.error("Error during cleanup process:", error);
  }
};