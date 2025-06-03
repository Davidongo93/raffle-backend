import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Raffle, RaffleStatus } from './raffle.model';
import { RafflesService } from './raffles.service';

@Controller('raffles')
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

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: RaffleStatus,
    ): Promise<Raffle> {
        console.log(`Updating raffle ${id} status to ${status}`);

        return this.rafflesService.updateStatus(id, status);
    }
}