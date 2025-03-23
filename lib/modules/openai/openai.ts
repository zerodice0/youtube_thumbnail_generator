import axios from "axios";

/**
 * SRT 자막 파일에서 타임스탬프와 인덱스 번호를 제거하고 텍스트만 추출합니다.
 * @param srtContent SRT 파일의 내용
 * @returns 타임스탬프가 제거된 자막 텍스트
 */
function extractTextFromSRT(srtContent: string): string {
  // 1. 줄 단위로 분할
  const lines = srtContent.split('\n');
  const textLines: string[] = [];
  
  // 2. 타임스탬프 패턴 정의 (00:00:00,000 --> 00:00:00,000 형식)
  const timestampPattern = /^\d{2}:\d{2}:\d{2},\d{3}\s-->\s\d{2}:\d{2}:\d{2},\d{3}$/;
  // 3. 숫자만 있는 인덱스 줄 패턴 정의
  const indexPattern = /^\d+$/;
  
  // 4. 각 줄을 검사하여 타임스탬프와 인덱스가 아닌 줄만 추출
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 빈 줄, 타임스탬프 줄, 인덱스 줄은 건너뜁니다
    if (
      line === '' || 
      timestampPattern.test(line) || 
      indexPattern.test(line)
    ) {
      continue;
    }
    
    // 자막 텍스트만 추가
    textLines.push(line);
  }
  
  // 5. 추출된 텍스트 줄을 결합하여 반환
  return textLines.join('\n');
}

const summarizeText = async (text: string): Promise<string | null> => {
  try {
    const trimmedText = extractTextFromSRT(text).trim().replace(/\n/g, ' ').substring(0, 2500);
    console.log(`🔍 Summarizing text: ${trimmedText}`);

    const summary = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        "model": "gemma3:4b",
        "prompt": `다음은 유튜브 영상의 자막 파일이야. 이 자막을 기반으로 영상의 내용을 300자 이내로 요약해줘. 답변을 줄 때는 요약된 내용만 출력해주고, 마크다운 형식은 사용하지 말아줘. :\n\n ${trimmedText}`,
        "stream": false
      }
    );

    return summary.data.response.replace(/\n/g, '').trim();
  } catch (error) {
    throw new Error(`❌ Summarizing error: ${error}`);
  }
};

export { summarizeText };
