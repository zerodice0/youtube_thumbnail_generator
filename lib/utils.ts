import path from "path";
import fs from "fs-extra";

export const PROJECT_ROOT = process.cwd();
export const AUDIO_DOWNLOAD_PATH = path.join(PROJECT_ROOT, '/downloads', 'audio');
export const SUBTITLE_DOWNLOAD_PATH = path.join(PROJECT_ROOT, '/downloads', 'subtitle');

export const initDownloadDirectories = () => {
  // Ensure download directories exist
  const audioDir = path.join(PROJECT_ROOT, "/downloads", "audio");
  const subtitleDir = path.join(PROJECT_ROOT, "/downloads", "subtitle");
  
  // Create directories if they don't exist
  fs.ensureDirSync(audioDir);
  fs.ensureDirSync(subtitleDir);
}

export const getFullUrl = (partialPath: string) => {
  if (!partialPath) return "";
  return `${process.env.BASE_URL}:${process.env.PORT}${partialPath}`;
} 