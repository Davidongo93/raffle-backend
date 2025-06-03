import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { Ticket } from './ticket.model';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post('buy')
    buyTicket(@Body() buyTicketDto: BuyTicketDto): Promise<Ticket> {
        return this.ticketsService.buyTicket(buyTicketDto);
    }

    @Get('user')
    getUserTickets(@Query('userId') userId: string): Promise<Ticket[]> {
        console.log('Fetching tickets for user:', userId);
        return this.ticketsService.getUserTickets(userId);
    }
}