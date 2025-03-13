import React from 'react';
import '@/app/api/_init';

export const metadata = {
  title: 'YouTube Thumbnail Generator',
  description: 'Generate thumbnails from YouTube videos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
