// cron-jobs/cron-jobs.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { OTPService } from '../otp/otp.service';
import { CronJobStatus, ICronJobManager } from './interfaces/cronJob.interface';

@Injectable()
export class CronJobsService implements OnModuleInit, ICronJobManager {
    private readonly logger = new Logger(CronJobsService.name);
    private jobStats: Map<string, CronJobStatus> = new Map();

    constructor(
        private readonly otpService: OTPService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    onModuleInit() {
        this.initializeJobs();
        this.logger.log('CronJobsService initialized');
    }

    private initializeJobs() {
        // Inicializar estadísticas para todos los jobs conocidos
        const knownJobs = ['cleanupExpiredOTPs'];
        knownJobs.forEach(jobName => {
            this.jobStats.set(jobName, {
                name: jobName,
                isRunning: false,
                executionCount: 0,
            });
        });
    }

    @Cron('0 0 16 * * *', {
        name: 'cleanupExpiredOTPs',
        timeZone: 'America/Mexico_City' // Ajusta tu zona horaria
    })
    async handleCleanupExpiredOTPs() {
        const jobName = 'cleanupExpiredOTPs';

        try {
            this.updateJobStatus(jobName, { isRunning: true });
            this.logger.log(`🚀 Iniciando tarea programada: ${jobName}`);

            const startTime = Date.now();
            const deletedCount = await this.otpService.cleanupExpiredOTPs();
            const executionTime = Date.now() - startTime;

            this.logger.log(`✅ ${jobName} completado en ${executionTime}ms. Registros eliminados: ${deletedCount}`);

            this.updateJobStatus(jobName, {
                isRunning: false,
                lastExecution: new Date(),
                executionCount: (this.jobStats.get(jobName)?.executionCount || 0) + 1
            });

        } catch (error) {
            this.logger.error(`❌ Error en ${jobName}:`, error);

            this.updateJobStatus(jobName, {
                isRunning: false,
                lastExecution: new Date(),
                executionCount: (this.jobStats.get(jobName)?.executionCount || 0) + 1,
                lastError: error instanceof Error ? error.message : 'Unknown error'
            });

            // Aquí podrías notificar a un servicio de monitoring
            this.notifyError(jobName, error);
        }
    }

    // Método para detener la tarea de manera segura
    stopCleanupExpiredOTPsJob(): { success: boolean; message: string } {
        const jobName = 'cleanupExpiredOTPs';

        try {
            if (!this.jobExists(jobName)) {
                return {
                    success: false,
                    message: `La tarea ${jobName} no existe`
                };
            }

            const job = this.schedulerRegistry.getCronJob(jobName);


            if (!job.isActive) {
                return {
                    success: false,
                    message: `La tarea ${jobName} ya está detenida`
                };
            }

            job.stop();
            this.updateJobStatus(jobName, { isRunning: false });

            this.logger.log(`⏸️ Tarea ${jobName} detenida manualmente`);
            return {
                success: true,
                message: `Tarea ${jobName} detenida exitosamente`
            };

        } catch (error) {
            const errorMessage = `Error al detener ${jobName}: ${error}`;
            this.logger.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    // Método para reiniciar la tarea de manera segura
    startCleanupExpiredOTPsJob(): { success: boolean; message: string } {
        const jobName = 'cleanupExpiredOTPs';

        try {
            if (!this.jobExists(jobName)) {
                return {
                    success: false,
                    message: `La tarea ${jobName} no existe`
                };
            }

            const job = this.schedulerRegistry.getCronJob(jobName);

            if (job.isActive) {
                return {
                    success: false,
                    message: `La tarea ${jobName} ya está en ejecución`
                };
            }

            job.start();
            this.updateJobStatus(jobName, { isRunning: true });

            this.logger.log(`▶️ Tarea ${jobName} iniciada manualmente`);
            return {
                success: true,
                message: `Tarea ${jobName} iniciada exitosamente`
            };

        } catch (error) {
            const errorMessage = `Error al iniciar ${jobName}: ${error}`;
            this.logger.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    }

    // Implementación de la interfaz ICronJobManager
    getJobStatus(name: string): CronJobStatus | null {
        return this.jobStats.get(name) || null;
    }

    startJob(name: string): boolean {
        if (name === 'cleanupExpiredOTPs') {
            return this.startCleanupExpiredOTPsJob().success;
        }
        return false;
    }

    stopJob(name: string): boolean {
        if (name === 'cleanupExpiredOTPs') {
            return this.stopCleanupExpiredOTPsJob().success;
        }
        return false;
    }

    getAllJobsStatus(): CronJobStatus[] {
        return Array.from(this.jobStats.values());
    }

    // Métodos auxiliares privados
    private jobExists(jobName: string): boolean {
        try {
            this.schedulerRegistry.getCronJob(jobName);
            return true;
        } catch {
            return false;
        }
    }

    private updateJobStatus(jobName: string, updates: Partial<CronJobStatus>): void {
        const currentStatus = this.jobStats.get(jobName) || {
            name: jobName,
            isRunning: false,
            executionCount: 0,
        };

        this.jobStats.set(jobName, {
            ...currentStatus,
            ...updates,
        });
    }

    private notifyError(jobName: string, error: unknown): void {
        // Aquí puedes implementar notificaciones a:
        // - Slack
        // - Email
        // - Sistema de monitoring
        // - etc.

        this.logger.error(`📢 Notificación de error en ${jobName}: ${error}`);

        // Ejemplo básico de notificación
        // this.alertService.sendAlert({
        //   type: 'CRON_JOB_ERROR',
        //   job: jobName,
        //   error: error instanceof Error ? error.message : 'Unknown error',
        //   timestamp: new Date(),
        // });
    }

    // Método para obtener información detallada del job
    getJobDetails(jobName: string) {
        try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            const status = this.jobStats.get(jobName);

            return {
                name: jobName,
                cronTime: job.cronTime.source,
                running: job.isActive,
                lastExecution: job.lastDate(),
                nextExecution: job.nextDates(1)[0],
                stats: status,
            };
        } catch {
            return null;
        }
    }
}