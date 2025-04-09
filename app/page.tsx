'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Job } from '@/lib/modules/events/jobQueue';
import JobStateCard from '@/components/jobStateCard/jobStateCard';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [queueState, setQueueState] = useState<Job[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/queue`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('onmessage', data);
    };

    eventSource.addEventListener('queueState', (event) => {
      const data = JSON.parse(event.data);
      const processedData = data.map((job: Job) => {
        return {
          ...job,
          createdAt: new Date(job.createdAt),
        };
      });

      console.log('queueState', processedData);
      setQueueState(processedData);
    });

    eventSource.addEventListener('jobAdded', (event) => {
      const data = JSON.parse(event.data);
      console.log('added', data);
    });

    return () => {
      eventSource.close();
    };
  }, []);
  // const [uuid, setUuid] = useState('');
  // const [title, setTitle] = useState('');
  // const [thumbnail, setThumbnail] = useState('');
  // const [status, setStatus] = useState('');
  // const [audioFilePath, setAudioFilePath] = useState('');
  // const [subtitleFilePath, setSubtitleFilePath] = useState('');
  // const [summary, setSummary] = useState('');
  // const eventSourceRef = useRef<EventSource | null>(null);

  const validateYoutubeUrl = (url: string) => {
    return YOUTUBE_URL_REGEX.test(url);
  };

  // const handleDownloadAudio = () => {
  //   if (audioFilePath) {
  //     const link = document.createElement('a');
  //     link.href = audioFilePath;
  //     link.setAttribute('download', `${title}.mp3`);
  //     link.setAttribute('target', '_blank');
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  // const handleDownloadSubtitle = () => {
  //   if (subtitleFilePath) {
  //     const link = document.createElement('a');
  //     link.href = subtitleFilePath;
  //     link.setAttribute('download', `${title}.srt`);
  //     link.setAttribute('target', '_blank');
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  const handleTranscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYoutubeUrl(url)) {
      setError('Invalid YouTube URL');
      return;
    }

    setError('');

    try {
      axios.post('/api/queue', {
        url,
      });
    } catch (error) {
      setError('Failed to transcribe');
    }
    
  }

  // const handleTranscribe = () => {
  //   if (!url.trim()) {
  //     setError('Please enter a YouTube URL');
  //     return;
  //   }

  //   if (!validateYoutubeUrl(url)) {
  //     setError('Invalid YouTube URL');
  //     return;
  //   }

  //   setError('');
  //   setStatus('');
  //   setUuid('');
  //   setAudioFilePath('');
  //   setSubtitleFilePath('');
  //   setSummary('');
    
  //   const apiUrl = `/api/download/youtube/transcribe?url=${encodeURIComponent(url)}`;
    
  //   // 이미 연결된 이벤트 소스가 있다면 닫기
  //   if (eventSourceRef.current) {
  //     eventSourceRef.current.close();
  //   }
    
  //   eventSourceRef.current = new EventSource(apiUrl);

  //   eventSourceRef.current.addEventListener('information', (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     setTitle(data.title);
  //     setThumbnail(data.thumbnail);
  //     console.log('Information event received: ', data);
  //   });

  //   eventSourceRef.current.addEventListener('downloading', (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     setStatus(`⏳ downloading...`);
  //     setUuid(data.uuid);
  //     console.log('Downloading event received: ', data);
  //   });

  //   eventSourceRef.current.addEventListener('transcribing', (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     setStatus(`📝 transcribing...`);
  //     setAudioFilePath(data.audioFile);
  //     console.log('Transcribing event received: ', data);
  //   });

  //   eventSourceRef.current.addEventListener('summarizing', (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     setStatus(`🤔 summarizing...`);
  //     setSubtitleFilePath(data.subtitleFile);
  //     console.log('Summarizing event received: ', data);
  //   });

  //   eventSourceRef.current.addEventListener('completed', (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     setStatus(`✅ completed`);
  //     setSummary(data.summary);
  //     console.log('Completed event received: ', data);
  //   });

  //   eventSourceRef.current.addEventListener('close', (event: MessageEvent) => {
  //     console.log('Close event received: ', JSON.parse(event.data));
  //     eventSourceRef.current?.close();
  //   });

  //   eventSourceRef.current.addEventListener('error', (event: MessageEvent) => {
  //     console.error('Error event: ', event.data ? JSON.parse(event.data) : 'Connection error');
  //     setStatus(`❌ error`);
  //     setError(event.data ? JSON.parse(event.data).message : 'Connection error');
  //     eventSourceRef.current?.close();
  //   });
  // };

  return (
    <div>
      <header className={styles.header}>
        <h1>YouTube 오디오 다운로드 및 자막 생성 툴</h1>
        <p>
          YouTube 주소를 입력하면 오디오 파일을 다운로드하고, 자막을 생성합니다.
        </p>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          <label htmlFor="youtube-url" className={styles.labelYoutubeUrl}>
            YouTube URL:
          </label>
          <form 
            className={styles.inputGroup}
            onSubmit={(e) => handleTranscribe(e)}
          >
            <input
              id="youtube-url"
              type="text"
              className={styles.inputYoutubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={
                (e) => {
                  setUrl(e.target.value);
                  setError(''); // 입력이 변경될 때 에러 메시지 초기화
                }
              }
            />
            <button type="submit"
              aria-label="Transcribe"
              className={styles.transcribeButton}
            >
              Transcribe
            </button>
          </form>

          {
            error && <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              {error}
            </div>
          }
        </div>
        {
          queueState.map(
            (job: Job) => (
              <JobStateCard key={job.id} job={job} />
            )
          )
        }
      </main>
    </div>
  );
} 