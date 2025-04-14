import { JobStatus } from '@/lib/models/jobStatus';

export interface Job {
  id: string;
  yotubeTitle: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  audioFilePath: string | null;
  subtitleFilePath: string | null;
  priority: number;
  status: JobStatus;
  createdAt: Date;
  summary: string | null;
}