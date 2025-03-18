'use client';

import { useState } from 'react';

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
    <>
      <header>
        <h1>YouTube Audio Transcriptor</h1>
        <p>
          This application allows you to download audio from YouTube videos, transcribe it, and generate summaries.
        </p>
      </header>
      <main>
        <div >
          <input type="text"
            placeholder="YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)} />
          <button onClick={handleTranscribe}>Transcribe!</button>
        </div>
        {error && <p>{error}</p>}
      </main>
    </>
  );
} 