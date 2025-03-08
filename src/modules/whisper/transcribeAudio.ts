import { exec } from "child_process";
import path from "path";

const transcribeAudio = async (
  audioFilePath: string,
  subtitleDownloadPath: string,
  uuid: string,
  onComplete: (subtitleFilePath: string) => void,
  onError: (stderr: string) => void,
) => {
  console.log(`📝 [${uuid}] Transcribing started for: ${audioFilePath}`);
  const subtitleFilePath = path.join(subtitleDownloadPath, `subtitle_${uuid}.srt`);
  
  exec(`${process.env.WHISPER_BIN_PATH}/whisper-cli -m ${process.env.WHISPER_MODEL_PATH}/ggml-large-v3-turbo.bin -l auto -f "${audioFilePath}" -osrt -of "${subtitleFilePath}"`,
    (error, _, stderr) => {
      if (error) {
        console.error(`❌ [${uuid}] Transcribing error: ${stderr}`);
        onError(stderr);
        return;
      }

      console.log(`✅ [${uuid}] Transcribing complete: ${subtitleFilePath}`);
      onComplete(subtitleFilePath);
    }
  );
}

export default transcribeAudio;