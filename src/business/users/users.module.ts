import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OTP } from '../../core/otp/otp.model';
import { Raffle } from '../raffles/raffle.model';
import { Ticket } from '../tickets/ticket.model';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Raffle, Ticket, OTP])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
