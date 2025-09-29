import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { OTP } from '../otp/otp.model';
import { OTPService } from '../otp/otp.service';
import { CronJobsController } from './cronJobs.controller';
import {
    CronJobsService
} from './cronJobs.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        SequelizeModule.forFeature([OTP]),
        ConfigModule
    ],
    providers: [
        OTPService,
        CronJobsService,
    ],
    controllers: [CronJobsController],
    exports: [
        CronJobsService
    ]
})
export class CronJobsModule { }