// cron-jobs/cron-jobs.controller.ts
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CronJobsService } from './cronJobs.service';

@Controller('cron-jobs')
export class CronJobsController {
    constructor(private readonly cronJobsService: CronJobsService) { }

    @Get()
    getAllJobs() {
        return this.cronJobsService.getAllJobsStatus();
    }

    @Get(':name')
    getJobStatus(@Param('name') name: string) {
        const status = this.cronJobsService.getJobStatus(name);
        const details = this.cronJobsService.getJobDetails(name);

        if (!status) {
            return { error: `Tarea ${name} no encontrada` };
        }

        return {
            ...status,
            details,
        };
    }

    @Post(':name/start')
    startJob(@Param('name') name: string) {
        const success = this.cronJobsService.startJob(name);
        return {
            success,
            message: success ? `Tarea ${name} iniciada` : `No se pudo iniciar la tarea ${name}`
        };
    }

    @Delete(':name/stop')
    stopJob(@Param('name') name: string) {
        const success = this.cronJobsService.stopJob(name);
        return {
            success,
            message: success ? `Tarea ${name} detenida` : `No se pudo detener la tarea ${name}`
        };
    }

    @Post('cleanup-expired-otps/execute-now')
    async executeCleanupNow() {
        // Ejecutar la tarea manualmente
        await this.cronJobsService['handleCleanupExpiredOTPs']();
        return { message: 'Limpieza de OTPs ejecutada manualmente' };
    }
}