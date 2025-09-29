// interfaces/cron-job.interface.ts
export interface CronJobStatus {
    name: string;
    isRunning: boolean;
    lastExecution?: Date;
    nextExecution?: Date;
    executionCount: number;
    lastError?: string;
}

export interface ICronJobManager {
    getJobStatus(name: string): CronJobStatus | null;
    startJob(name: string): boolean;
    stopJob(name: string): boolean;
    getAllJobsStatus(): CronJobStatus[];
}