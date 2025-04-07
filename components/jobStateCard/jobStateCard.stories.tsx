import type { Meta, StoryObj } from '@storybook/react';

import JobStateCard from './jobStateCard';

const meta = {
  component: JobStateCard,
} satisfies Meta<typeof JobStateCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    job: {
			id: '1',
			createdAt: new Date(),
			status: 'queued',
			thumbnailUrl: 'https://via.placeholder.com/150',
			audioFilePath: 'https://via.placeholder.com/150',
			summary: 'This is a summary',
			youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			yotubeTitle: 'This is a title',
			transcriptFilePath: 'https://via.placeholder.com/150',
			priority: 1,
		},
  }
};