import axios from "axios";

const summarizeText = async (text: string): Promise<string | null> => {
  try {
    const summary = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        "model": "gemma3:1b",
        "prompt": `다음은 유튜브 영상의 자막 파일이야. 이 자막을 기반으로 영상의 내용을 다섯 문장 이내로 요약해줘. 답변을 줄 때는 요약된 내용만 출력해줘. :\n\n ${text.trim().replace(/\n/g, ' ').substring(0, 2800)}`,
        "stream": false
      }
    );

    return summary.data.response.replace(/\n/g, '').trim();
  } catch (error) {
    throw new Error(`❌ Summarizing error: ${error}`);
  }
};

export { summarizeText };
