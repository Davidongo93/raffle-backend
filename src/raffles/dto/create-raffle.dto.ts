import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateRaffleDto {
  @IsUUID()
  creatorId: string;

  @IsString()
  description: string;

  @IsNumber()
  ticketPrice: number;

  @IsNumber()
  prizeValue: number;
}
