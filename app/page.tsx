'use client';

import { useState } from 'react';
import styles from './page.module.css';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateYoutubeUrl = (url: string) => {
    return YOUTUBE_URL_REGEX.test(url);
  };

  const handleTranscribe = () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYoutubeUrl(url)) {
      setError('Invalid YouTube URL');
      return;
    }

    setError('');
    
    console.log('Transcribe button clicked', url);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>YouTube Transcribe Tool</h1>
        <p>
          This application allows you to download audio from YouTube videos, transcribe it, and generate summaries.
        </p>
      </header>
      <main className={styles.main}>
        <div className={styles.mainContainer}>
          <label htmlFor="youtube-url" className={styles.labelYoutubeUrl}>
            YouTube URL:
          </label>
          <div className={styles.inputGroup}>
            <input
              id="youtube-url"
              type="text"
              className={styles.inputYoutubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={
                (e) => {
                  setUrl(e.target.value);
                  setError(''); // 입력이 변경될 때 에러 메시지 초기화
                }
              }
            />
            {error && (
              <p className={styles.errorMessage}>{error}</p>
            )}
            <button 
              onClick={handleTranscribe}
              className={styles.transcribeButton}
            >
              Transcribe
            </button>
          </div>

          <div className={styles.errorMessage}>
            {error}
          </div>
        </div>
      </main>
    </div>
  );
} 