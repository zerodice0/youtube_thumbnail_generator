'use client';

import { useRef, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;


export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [subtitleFilePath, setSubtitleFilePath] = useState('');
  const [summary, setSummary] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

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
    setStatus('');
    setUuid('');
    setAudioFilePath('');
    setSubtitleFilePath('');
    setSummary('');
    
    const apiUrl = `/api/download/youtube/transcribe?url=${encodeURIComponent(url)}`;
    
    // 이미 연결된 이벤트 소스가 있다면 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    eventSourceRef.current = new EventSource(apiUrl);

    eventSourceRef.current.addEventListener('downloading', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setStatus(`⏳ downloading...`);
      setUuid(data.uuid);
      console.log('Downloading event received: ', data);
    });

    eventSourceRef.current.addEventListener('transcribing', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setStatus(`📝 transcribing...`);
      setAudioFilePath(data.audioFile);
      console.log('Transcribing event received: ', data);
    });

    eventSourceRef.current.addEventListener('summarizing', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setStatus(`🤔 summarizing...`);
      setSubtitleFilePath(data.subtitleFile);
      console.log('Summarizing event received: ', data);
    });

    eventSourceRef.current.addEventListener('completed', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setStatus(`✅ completed (${data.uuid})`);
      setSummary(data.summary);
      console.log('Completed event received: ', data);
    });

    eventSourceRef.current.addEventListener('close', (event: MessageEvent) => {
      console.log('Close event received: ', JSON.parse(event.data));
      eventSourceRef.current?.close();
    });

    eventSourceRef.current.addEventListener('error', (event: MessageEvent) => {
      console.error('Error event: ', event.data ? JSON.parse(event.data) : 'Connection error');
      eventSourceRef.current?.close();
    });
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

          {uuid && <div className={styles.status}>
            <label htmlFor='uuid_text'>UUID:</label>
            <span id='uuid_text'>🔑 {uuid}</span>
          </div>}
          {status && <div className={styles.status}>
            <label htmlFor='status_text'>Status:</label>
            <span id='status_text'>{status}</span>
          </div>}

          {audioFilePath && <div className={styles.status}>
            <label htmlFor='audio_file_path'>Audio File Path:</label>
            <Link id='audio_file_path' target='_blank' href={audioFilePath}>🔉 Download Audio</Link>
          </div>}

          {subtitleFilePath && <div className={styles.status}>
            <label htmlFor='subtitle_file_path'>Subtitle File Path:</label>
            <Link id='subtitle_file_path' target='_blank' href={subtitleFilePath}>📝 Download Subtitle</Link>
          </div>}

          {summary && <div className={styles.status}>
            <label htmlFor='summary'>Summary:</label>
            <span id='summary'>{summary}</span>
          </div>}
        </div>
      </main>
    </div>
  );
} 