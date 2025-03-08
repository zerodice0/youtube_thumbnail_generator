const DonwloadStatus = {
  pending: "pending",
  downloading: "downloading",
  transcribing: "transcribing",
  completed: "completed",
  failed: "failed",
} as const;

type DonwloadStatusType = {
  status: typeof DonwloadStatus[keyof typeof DonwloadStatus];
  audioFilePath?: string;
  subtitleFilePath?: string;
  error?: string;
  completedAt?: number;
};

export { DonwloadStatus, DonwloadStatusType };
