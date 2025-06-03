import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Raffle } from '../raffles/raffle.model';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { Ticket, TicketStatus } from './ticket.model';

@Injectable()
export class TicketsService {
    constructor(
        @InjectModel(Ticket)
        private ticketModel: typeof Ticket,
        @InjectModel(Raffle)
        private raffleModel: typeof Raffle,
        private sequelize: Sequelize,
    ) { }


    async buyTicket(buyTicketDto: BuyTicketDto): Promise<Ticket> {
        const { raffleId, userId, number, urlComprobante } = buyTicketDto;

        return this.sequelize.transaction(async (transaction: Transaction) => {
            const raffle = await this.raffleModel.findByPk(raffleId, {
                lock: Transaction.LOCK.UPDATE,
                transaction,
            });

            if (!raffle) {
                throw new BadRequestException('Raffle not found');
            }

            if (raffle.status !== 'active') {
                throw new BadRequestException('Raffle is not active');
            }

            if (number < 0 || number > 99) {
                throw new BadRequestException('Invalid ticket number (must be between 0-99)');
            }
            if (urlComprobante && typeof urlComprobante !== 'string') {
                throw new BadRequestException('Invalid comprobante URL');
            }

            // Convertir el array de tickets a formato JSON seguro
            const ticketsArray = Array.isArray(raffle.tickets)
                ? [...raffle.tickets]
                : Array(100).fill(false);

            // Verificar si el ticket ya está comprado
            if (ticketsArray[number]) {
                throw new BadRequestException(`Ticket number ${number} is already sold`);
            }

            // Actualizar matriz de tickets
            ticketsArray[number] = true;

            try {
                // Actualizar usando setDataValue para evitar problemas de serialización
                raffle.setDataValue('tickets', ticketsArray);
                await raffle.save({ transaction });

                // Crear registro de ticket comprado
                const ticket = await this.ticketModel.create(
                    {
                        raffleId,
                        userId,
                        number,
                        urlComprobante,
                        status: 'pending' as TicketStatus, // Asignar estado inicial
                    },
                    { transaction }
                );

                return ticket;
            } catch (error) {
                console.error('Error in buyTicket transaction:', error);
                throw new BadRequestException('Failed to process ticket purchase');
            }
        });
    }

    async getUserTickets(userId: string): Promise<Ticket[]> {
        return this.ticketModel.findAll({
            where: { userId },
            include: ['raffle'],
        });
    }
}