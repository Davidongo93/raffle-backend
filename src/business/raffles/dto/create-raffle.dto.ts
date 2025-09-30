import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ColombianLotteryType, DrawMode, RaffleType } from '../raffle.model';

export class CreateRaffleDto {
  @IsUUID()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(RaffleType)
  raffleType: RaffleType;

  @IsNumber()
  ticketPrice: number;

  @IsNumber()
  prizeValue: number;

  @IsNumber()
  @IsOptional()
  secondPrizeValue?: number;

  @IsString()
  prizeImageUrl: string;

  // Nuevos campos
  @IsEnum(DrawMode)
  drawMode: DrawMode;

  @IsDate()
  @Type(() => Date)
  drawDate: Date;

  @IsEnum(ColombianLotteryType)
  @IsOptional()
  colombianLotteryType?: ColombianLotteryType;

  @IsBoolean()
  @IsOptional()
  hasSecondPrizeInverted?: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  // Si es rifa recurrente
  @IsUUID()
  @IsOptional()
  majorityOwnerId?: string;

}