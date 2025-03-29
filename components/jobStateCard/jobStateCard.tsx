import { Job } from "@/lib/modules/events/jobQueue";
import styles from './jobStateCard.module.css';
import { ExternalLink, FileAudio, FileText, RefreshCwIcon } from "lucide-react";

const JobStateCard = ({ job }: { job: Job }) => {
	const formattedCreatedAt = `${job.createdAt.getFullYear()}년 ${job.createdAt.getMonth() + 1}월 ${job.createdAt.getDate()}일 ${job.createdAt.getHours()}:${job.createdAt.getMinutes()}:${job.createdAt.getSeconds()}`;
	
	return (
		<div className={styles.container}>
			<div className={styles.youtubeTitleContainer}>
				<div className={styles.youtubeTitle}>{job.yotubeTitle}</div>
				<div className={styles.status}>{job.status}</div>
			</div>
			<div className={styles.createdAt}>{formattedCreatedAt}</div>
			<div className={styles.contentContainer}>
				<div className={styles.youtubeThumnbail}>
					<img src={job.thumbnailUrl} 
						alt="youtube thumbnail" 
						width="225" 
						height="150"
					/>
				</div>
				<div className={styles.content}>
					{/* 유튜브 영상 링크 */}
					<div className={styles.youtubeUrl}>
						<a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer">
							{job.youtubeUrl}
						</a>
						<ExternalLink size={12}/>
					</div>

					{/* 파일 다운로드 링크 */}
					<div className={styles.fileDownloadButtons}>
						<button>
							<FileAudio size={12}/>
							<span>오디오 다운로드</span>
						</button>
						<button>
							<FileText size={12}/>
							<span>자막 다운로드</span>
						</button>
					</div>

					{/* 요약 내용 */}
					<div className={styles.summary}>
						<div className={styles.summaryHeader}>
							<div className={styles.summaryTitle}>요약:</div>
							<button>
								<RefreshCwIcon size={12}/>
								<span>다시 요약하기</span>
							</button>
						</div>
						<div className={styles.summaryContent}>{job.summary}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default JobStateCard;