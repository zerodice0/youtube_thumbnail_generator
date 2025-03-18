import React from 'react';

export const metadata = {
  title: 'YouTube Audio Transcriptor',
  description: 'Transcribe YouTube videos to text',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="next-app">
      <head />
      <body className="next-body bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
