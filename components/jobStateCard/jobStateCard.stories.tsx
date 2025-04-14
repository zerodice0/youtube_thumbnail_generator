import type { Meta, StoryObj } from '@storybook/react';

import JobStateCard from './jobStateCard';

const meta = {
  component: JobStateCard,
} satisfies Meta<typeof JobStateCard>;

export default meta;

type DefaultStory = StoryObj<typeof meta>;
export const Default: DefaultStory = {
  args: {
    job: {
			id: '1',
			createdAt: new Date(),
			status: 'queued',
			thumbnailUrl: null,
			audioFilePath: null,
			summary: null,
			youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			yotubeTitle: null,
			subtitleFilePath: null,
			priority: 1,
		},
  }
};

type DownloadingStory = StoryObj<typeof meta>;

export const Downloading: DownloadingStory = {
  args: {
    job: {
			id: '1',
			createdAt: new Date(),
			status: 'downloading',
			thumbnailUrl: 'https://placehold.co/600x400',
			audioFilePath: 'https://placehold.co/600x400',
			summary: 'This is a summary',
			youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			yotubeTitle: 'This is a title',
			subtitleFilePath: 'https://placehold.co/600x400',
			priority: 1,
		},
  }
};

type CompletedStory = StoryObj<typeof meta>;

export const Completed: CompletedStory = {
  args: {
    job: {
			id: '1',
			createdAt: new Date(),
			status: 'completed',
			thumbnailUrl: 'https://placehold.co/600x400',
			audioFilePath: 'https://placehold.co/600x400',
			summary: 'This is a summary',
			youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			yotubeTitle: 'This is a title',
			subtitleFilePath: 'https://placehold.co/600x400',
			priority: 1,
		},
  }
};

type FailedStory = StoryObj<typeof meta>;

export const Failed: FailedStory = {
  args: {
    job: {
			id: '1',
			createdAt: new Date(),
			status: 'failed',
			thumbnailUrl: 'https://placehold.co/600x400',
			audioFilePath: 'https://placehold.co/600x400',
			summary: 'This is a summary',
			youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			yotubeTitle: 'This is a title',
			subtitleFilePath: 'https://placehold.co/600x400',
			priority: 1,
		},
  }
};
