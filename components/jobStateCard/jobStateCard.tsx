import { Job } from "@/lib/models/job";
import styles from './jobStateCard.module.css';
import { ExternalLink, FileAudio, FileText, RefreshCwIcon } from "lucide-react";

const JobStateCard = ({ job }: { job: Job }) => {
	const formattedCreatedAt = `${job.createdAt.getFullYear()}년 ${job.createdAt.getMonth() + 1}월 ${job.createdAt.getDate()}일 ${job.createdAt.getHours()}:${job.createdAt.getMinutes()}:${job.createdAt.getSeconds()}`;
	
	return (
		<div className={styles.container + ' ' + styles[job.status]}>
			<div className={styles.youtubeTitleContainer}>
				<div className={styles.youtubeTitle}>{job.yotubeTitle || 'Loading...'}</div>
				<div className={styles.status + ' ' + styles[job.status]}>{job.status}</div>
			</div>
			<div className={styles.createdAt}>
				requested at {formattedCreatedAt}
			</div>
			<div className={styles.contentContainer}>
				<div>
					{job.thumbnailUrl ? (
						<img src={job.thumbnailUrl} 
							alt="youtube thumbnail" 
							width="225" 
							height="150"
						/>
					) : (
						<div className={styles.thumbnailPlaceholder}>
							<span className={styles.thumbnailPlaceholderText}>
								Loading...
							</span>
						</div>
					)}
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
						<button 
							disabled={!job.audioFilePath}
							title={job.audioFilePath ? '오디오 다운로드' : '오디오 다운로드 준비중...'}
						>
							<FileAudio size={12}/>
							오디오 다운로드
						</button>
						<button 
							disabled={!job.subtitleFilePath}
							title={job.subtitleFilePath ? '자막 다운로드' : '자막 다운로드 준비중...'}
						>
							<FileText size={12}/>
							자막 다운로드
						</button>
					</div>

					{/* 요약 내용 */}
					<div className={styles.summary}>
						<div className={styles.summaryHeader}>
							<div className={styles.summaryTitle}>요약:</div>
							<button
								disabled={!job.summary}
								title={job.summary ? '다시 요약하기' : '요약 준비중...'}
							>
								<RefreshCwIcon size={12}/>
								다시 요약하기
							</button>
						</div>
						<div className={styles.summaryContent}>
							{job.summary || 'Loading...'}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default JobStateCard;