import axios from "axios";

/**
 * YouTube URL에서 동영상 ID를 추출합니다.
 * 지원하는 URL 형식:
 * - 일반 동영상: https://www.youtube.com/watch?v=VIDEO_ID
 * - 단축 URL: https://youtu.be/VIDEO_ID
 * - Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - 라이브: https://www.youtube.com/live/VIDEO_ID
 * 
 * @param url YouTube URL 문자열
 * @returns 추출된 동영상 ID 또는 유효하지 않은 URL일 경우 null
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // 1. URL 객체로 파싱 시도
  try {
    // URL이 유효한 형식인지 확인
    const urlObj = new URL(url);
    
    // 도메인이 youtube.com 또는 youtu.be인지 확인
    if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname)) {
      return null;
    }
    
    // youtu.be 단축 URL 처리
    if (urlObj.hostname === 'youtu.be') {
      // 경로에서 첫 번째 세그먼트 추출 (URL의 '/' 다음 부분)
      const id = urlObj.pathname.split('/')[1];
      return id || null;
    }
    
    // youtube.com 형식 처리
    
    // 1. watch?v= 형식 처리
    if (urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      return videoId;
    }
    
    // 2. shorts 형식 처리
    if (urlObj.pathname.startsWith('/shorts/')) {
      const id = urlObj.pathname.split('/shorts/')[1];
      // 추가 경로 세그먼트나 쿼리 파라미터 제거
      return id?.split('/')[0] || null;
    }
    
    // 3. live 형식 처리
    if (urlObj.pathname.startsWith('/live/')) {
      const id = urlObj.pathname.split('/live/')[1];
      // 추가 경로 세그먼트나 쿼리 파라미터 제거
      return id?.split('/')[0] || null;
    }
    
    // 지원되지 않는 YouTube URL 형식
    return null;
    
  } catch (error) {
    // URL 파싱에 실패한 경우
    
    // 2. 정규식으로 ID 추출 시도
    const patterns = [
      // 일반 동영상 URL
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/user\/.*\/.*v=?)([^#&?\/\s]*)/i,
      // Shorts URL
      /(?:youtube\.com\/shorts\/)([^#&?\/\s]*)/i,
      // Live URL
      /(?:youtube\.com\/live\/)([^#&?\/\s]*)/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
}

interface YoutubeInformation {
  title: string;
  thumbnail: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
}

export async function getYoutubeInformation(url: string): Promise<YoutubeInformation> {
  const videoId = extractYoutubeVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const youtubeResponse = await axios.get(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
  );

  console.log(youtubeResponse);

  const items = youtubeResponse.data.items;
  if (items.length === 0) {
    throw new Error("Video not found");
  }

  const item = items[0];
  const snippet = item.snippet;
  const title = snippet.title;
  const thumbnail = snippet.thumbnails.high.url;
  const thumbnailWidth = snippet.thumbnails.high.width;
  const thumbnailHeight = snippet.thumbnails.high.height;

  return {
    title,
    thumbnail,
    thumbnailWidth,
    thumbnailHeight,
  };
}