import { exec, ExecException } from "child_process";
import path from "path";

const downloadYoutubeAudio = async (
  youtubeUrl: string, 
  audioDownloadPath: string,
  uuid: string,
  onComplete: (audioFilePath: string) => void,
  onError: (stderr: string) => void,
) => {
  console.log(`📥 [${uuid}] Download started for: ${youtubeUrl}`);
  const audioFilePath = path.join(audioDownloadPath, `audio_${uuid}.mp3`);

  exec(`yt-dlp -x --audio-format mp3 -o "${audioFilePath}" "${youtubeUrl}"`, 
    // callback function
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ [${uuid}] Download error: ${stderr}`);
        onError(stderr);
        return;
      }

      console.log(`✅ [${uuid}] Download complete: ${audioFilePath}`);
      onComplete(audioFilePath);
    }
  );
}

export default downloadYoutubeAudio;