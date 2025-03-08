import { exec, ExecException } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

const downloadYoutubeAudio = async (
  youtubeUrl: string, 
  audioDownloadPath: string,
  uuid: string,
): Promise<string> => {
  console.log(`📥 [${uuid}] Download started for: ${youtubeUrl}`);
  const audioFilePath = path.join(audioDownloadPath, `audio_${uuid}.mp3`);

  try {
    await execAsync(`yt-dlp -x --audio-format mp3 -o "${audioFilePath}" "${youtubeUrl}"`);
  } catch (error) {
    throw new Error(`❌ [${uuid}] Download error: ${error}`);
  }

  console.log(`✅ [${uuid}] Download complete: ${audioFilePath}`);
  return audioFilePath;
}

export { downloadYoutubeAudio };