'use client';

import { useRef, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { ExternalLink, FileAudio, FileText } from 'lucide-react';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;


export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [uuid, setUuid] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState('');
  const [audioFilePath, setAudioFilePath] = useState('');
  const [subtitleFilePath, setSubtitleFilePath] = useState('');
  const [summary, setSummary] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const validateYoutubeUrl = (url: string) => {
    return YOUTUBE_URL_REGEX.test(url);
  };

  const handleDownloadAudio = () => {
    if (audioFilePath) {
      const link = document.createElement('a');
      link.href = audioFilePath;
      link.setAttribute('download', `${title}.mp3`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSubtitle = () => {
    if (subtitleFilePath) {
      const link = document.createElement('a');
      link.href = subtitleFilePath;
      link.setAttribute('download', `${title}.srt`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

    eventSourceRef.current.addEventListener('information', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setTitle(data.title);
      setThumbnail(data.thumbnail);
      console.log('Information event received: ', data);
    });

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
      setStatus(`✅ completed`);
      setSummary(data.summary);
      console.log('Completed event received: ', data);
    });

    eventSourceRef.current.addEventListener('close', (event: MessageEvent) => {
      console.log('Close event received: ', JSON.parse(event.data));
      eventSourceRef.current?.close();
    });

    eventSourceRef.current.addEventListener('error', (event: MessageEvent) => {
      console.error('Error event: ', event.data ? JSON.parse(event.data) : 'Connection error');
      setStatus(`❌ error`);
      eventSourceRef.current?.close();
    });
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>YouTube Transcribe Tool</h1>
        <p>
          This application allows you to download audio from YouTube videos, transcribe it, and generate summaries.
        </p>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
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
        {uuid && <div className={styles.container}>
          <div className={styles.youtubeTitleContainer}>
            <label htmlFor='status' className={styles.youtubeTitle}>{title}</label>
            {
              status && 
              <div className={styles.status} id='status'>
                {status}
              </div>
            }
          </div>
          <div className={styles.youtubeInformationContainer}>
            <img src={thumbnail} alt="Thumbnail" width="240" height="180"/>
            <div className={styles.youtubeInformation}>
              <label htmlFor='url'>URL: </label>
              <Link id='url' target='_blank' href={url}>{url} <ExternalLink size={16} /></Link>
              <div className={styles.youtubeInformationButtonContainer}>
                {
                  audioFilePath && 
                  <button onClick={handleDownloadAudio}>
                    <FileAudio size={16} />
                    <span>MP3 다운로드</span>
                  </button>
                }
                {
                  subtitleFilePath && 
                  <button onClick={handleDownloadSubtitle}>
                    <FileText size={16} />
                    <span>SRT 자막 다운로드</span>
                  </button>
                }
              </div>
              {
                summary && 
                <div className={styles.youtubeInformationSummary}>
                  <label htmlFor='summary'>요약: </label>
                  <span id='summary'>{summary}</span>
                </div>
              }
            </div>
          </div>
        </div>}
      </main>
    </div>
  );
} 