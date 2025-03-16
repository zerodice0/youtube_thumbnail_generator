import { initDownloadDirectories } from "@/lib/utils";
import { startCleanupInterval } from "@/lib/cleanup";

// 앱 초기화 함수
const initApp = () => {
  // 다운로드 디렉토리 초기화
  initDownloadDirectories();
  
  // 정기적인 정리 작업 설정 (1시간마다)
  startCleanupInterval();
  
  console.log("🚀 App initialization completed");
};

// 앱 초기화 실행
initApp();

export default function init() {
  return null;
}; 