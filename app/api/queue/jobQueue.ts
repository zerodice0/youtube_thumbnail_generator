import { PriorityQueue } from '@/lib/modules/dataStructures/PriorityQueue';

export interface Job {
  id: string;
  youtubeUrl: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

class JobQueue {
  private static instance: JobQueue;
  private queue: PriorityQueue<Job>;
  private processing: boolean = false;

  private constructor() {
    this.queue = new PriorityQueue<Job>((a, b) => a - b);
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  public addJob(job: Job): void {
    this.queue.enqueue(job, job.priority);
    this.processNextJob(); // 새 작업이 추가되면 처리 시도
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
    } catch (error) {
      job.status = 'failed';
      console.error(`Failed to process job ${job.id}:`, error);
    }
  }
}

// 싱글톤 인스턴스 export
export const jobQueue = JobQueue.getInstance();