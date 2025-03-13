import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">YouTube Thumbnail Generator</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          This application allows you to download audio from YouTube videos, transcribe it, and generate summaries.
        </p>
        
        <p className="mb-4">
          The API endpoints are:
        </p>
        
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            <code className="bg-gray-100 px-2 py-1 rounded">POST /api/download/youtube/audio</code> - Download and transcribe a YouTube video
          </li>
          <li className="mb-2">
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/download/youtube/audio/status/:uuid</code> - Check the status of a download
          </li>
          <li className="mb-2">
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/download/youtube/audio/summary/:uuid</code> - Get a summary of the transcribed content
          </li>
        </ul>
        
        <p>
          For more information, please check the <Link href="/docs" className="text-blue-500 hover:underline">documentation</Link>.
        </p>
      </div>
    </div>
  );
} 