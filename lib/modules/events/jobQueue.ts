import { PriorityQueue } from '@/lib/modules/dataStructures/PriorityQueue';
import EventEmitter from '@/lib/modules/events/eventEmitter';
export interface Job {
  id: string;
  yotubeTitle: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  audioFilePath: string;
  transcriptFilePath: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  summary: string;
}

class JobQueue {
  private static instance: JobQueue;
  private queue: PriorityQueue<Job>;
  private processing: boolean = false;

  private constructor() {
    this.queue = new PriorityQueue<Job>((a, b) => a - b);

    if (process.env.USE_DUMMY_DATA === 'true') {
      console.log('USE_DUMMY_DATA is true');
      this.addJob({
        id: '1',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        yotubeTitle: '[test] Youtube 타이틀',
        thumbnailUrl: 'https://placehold.co/600x400',
        audioFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        transcriptFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        priority: 1,
        status: 'queued',
        createdAt: new Date(Date.now()),
        summary: 'test',
      });
      this.addJob({
        id: '2',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        yotubeTitle: '[test] Youtube 타이틀2',
        thumbnailUrl: 'https://placehold.co/600x400',
        audioFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        transcriptFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        priority: 1,
        status: 'queued',
        createdAt: new Date(Date.now()),
        summary: 'test2',
      });
      this.addJob({
        id: '3',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        yotubeTitle: '[test] Youtube 타이틀3',
        thumbnailUrl: 'https://placehold.co/600x400',
        audioFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        transcriptFilePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        priority: 1,
        status: 'queued',
        createdAt: new Date(Date.now()),
        summary: 'test3',
      });
    }
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  public addJob(job: Job): void {
    this.queue.enqueue(job, job.priority);
    if (process.env.USE_DUMMY_DATA !== 'true') {
      this.processNextJob(); // 새 작업이 추가되면 처리 시도
    }
    EventEmitter.emit('jobAdded', job);
  }

  public getQueueStatus(): Job[] {
    return this.queue.toArray();
  }

  private async processNextJob(): Promise<void> {
    if (this.processing || this.queue.isEmpty()) {
      return;
    }

    this.processing = true;
    try {
      const job = this.queue.dequeue();
      if (job) {
        job.status = 'processing';
        // 작업 처리 로직
        await this.processJob(job);
      }
    } finally {
      this.processing = false;
      // 큐에 더 많은 작업이 있다면 계속 처리
      if (!this.queue.isEmpty()) {
        this.processNextJob();
      }
    }
  }

  private async processJob(job: Job): Promise<void> {
    try {
      // 실제 작업 처리 로직
      // 예: 유튜브 다운로드, 트랜스크립션 등
      job.status = 'completed';
      EventEmitter.emit('jobCompleted', job);
    } catch (error) {
      job.status = 'failed';
      console.error(`Failed to process job ${job.id}:`, error);
      EventEmitter.emit('jobFailed', job);
    }
  }
}

// 싱글톤 인스턴스 export
export const jobQueue = JobQueue.getInstance();