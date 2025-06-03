import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from '../tickets/ticket.model';
import { User } from '../users/user.model';
import { Raffle } from './raffle.model';
import { RafflesController } from './raffles.controller';
import { RafflesService } from './raffles.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Raffle, Ticket]),
  ],
  providers: [RafflesService],
  controllers: [RafflesController]
})
export class RafflesModule { }
