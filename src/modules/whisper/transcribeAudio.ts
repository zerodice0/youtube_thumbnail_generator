import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

const transcribeAudio = async (
  audioFilePath: string,
  subtitleDownloadPath: string,
  uuid: string,
):Promise<string> => {
  console.log(`📝 [${uuid}] Transcribing started for: ${audioFilePath}`);
  const subtitleFilePath = path.join(subtitleDownloadPath, `subtitle_${uuid}.srt`);
  
  try {
    await execAsync(`${process.env.WHISPER_BIN_PATH}/whisper-cli -m ${process.env.WHISPER_MODEL_PATH}/ggml-large-v3-turbo.bin -l auto -f "${audioFilePath}" -osrt -of "${subtitleFilePath}"`);
  } catch (error) {
    throw new Error(`❌ [${uuid}] Transcribing error: ${error}`);
  }

  console.log(`✅ [${uuid}] Transcribing complete: ${subtitleFilePath}`);
  return subtitleFilePath;
}

export { transcribeAudio };