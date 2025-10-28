import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from '../tickets/ticket.model';
import { User } from '../users/user.model';
import { RaffleHistory } from './raffle-history.model';
import { Raffle } from './raffle.model';
import { RafflesController } from './raffles.controller';
import { RafflesService } from './raffles.service';

@Module({
  imports: [SequelizeModule.forFeature([User, RaffleHistory, Raffle, Ticket])],
  providers: [RafflesService],
  controllers: [RafflesController],
  exports: [RafflesService],
})
export class RafflesModule { }
