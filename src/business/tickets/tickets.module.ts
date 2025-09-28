import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Raffle } from '../raffles/raffle.model';
import { User } from '../users/user.model';
import { Ticket } from './ticket.model';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Raffle, Ticket])],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule { }
