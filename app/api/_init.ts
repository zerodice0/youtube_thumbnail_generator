import { initDownloadDirectories } from "@/lib/utils";
import { runInitialCleanup, startCleanupInterval } from "@/lib/cleanup";

// 앱 초기화 함수
const initApp = () => {
  // 다운로드 디렉토리 초기화
  initDownloadDirectories();
  
  // 초기 정리 작업 실행
  runInitialCleanup();
  
  // 정기적인 정리 작업 설정 (1시간마다)
  startCleanupInterval();
  
  console.log("🚀 App initialization completed");
};

// 앱 초기화 실행
initApp();

export {}; 