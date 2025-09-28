import { IsNumber, IsString, IsUUID } from 'class-validator';
import { RaffleType } from '../raffle.model';

export class CreateRaffleDto {
  @IsUUID()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  raffleType: RaffleType

  @IsNumber()
  ticketPrice: number;

  @IsNumber()
  prizeValue: number;

  @IsString()
  prizeImageUrl: string;
}
