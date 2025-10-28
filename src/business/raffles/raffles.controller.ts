import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { RaffleHistory } from './raffle-history.model';
import { DrawMode, Raffle, RaffleStatus } from './raffle.model';
import { RafflesService } from './raffles.service';

@Controller('raffles')
//@UseGuards(AuthGuard('jwt'))
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) { }

  @Post()
  create(@Body() createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    return this.rafflesService.create(createRaffleDto);
  }

  @Get()
  findAll(): Promise<Raffle[]> {
    return this.rafflesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Raffle | null> {
    return this.rafflesService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string): Promise<RaffleHistory[]> {
    return this.rafflesService.getRaffleHistory(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RaffleStatus,
    @Body('userId') userId: string,
  ): Promise<Raffle> {
    console.log(`Updating raffle ${id} status to ${status}`);
    return this.rafflesService.updateStatus(id, status, userId);
  }

  @Patch(':id/draw-settings')
  updateDrawSettings(
    @Param('id') id: string,
    @Body('drawMode') drawMode: DrawMode,
    @Body('drawDate') drawDate: Date,
    @Body('userId') userId: string,
    @Body('hasSecondPrizeInverted') hasSecondPrizeInverted?: boolean,
    @Body('hasSecondPrizePalindrome') hasSecondPrizePalindrome?: boolean,
    @Body('colombianLotteryType') colombianLotteryType?: string,
  ): Promise<Raffle> {
    return this.rafflesService.updateDrawSettings(
      id,
      drawMode,
      new Date(drawDate),
      userId,
      hasSecondPrizeInverted,
      hasSecondPrizePalindrome,
      colombianLotteryType,
    );
  }

  @Patch(':id/winning-numbers')
  setWinningNumbers(
    @Param('id') id: string,
    @Body('winningNumber') winningNumber: number,
    @Body('secondPrizeWinningNumber') secondPrizeWinningNumber?: number,
    @Body('userId') userId?: string,
  ): Promise<Raffle> {
    return this.rafflesService.setWinningNumbers(
      id,
      winningNumber,
      secondPrizeWinningNumber,
      userId,
    );
  }

  // @Post(':id/recurrent')
  // createRecurrentRaffle(
  //   @Param('id') id: string,
  //   @Body('userId') userId: string,
  // ): Promise<Raffle> {
  //   return this.rafflesService.createRecurrentRaffle(id, userId);
  // }
}
