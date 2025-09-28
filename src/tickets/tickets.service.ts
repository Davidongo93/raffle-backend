import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Raffle, RaffleStatus, RaffleType } from '../raffles/raffle.model';
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

      if (raffle.status !== RaffleStatus.ACTIVE) {
        throw new BadRequestException('Raffle is not active');
      }

      if (raffle.raffleType === RaffleType.SMALL && (number < 0 || number > 99)) {
        throw new BadRequestException(
          'Invalid ticket number (must be between 0-99)',
        );
      } else if (raffle.raffleType === RaffleType.MEDIUM && (number < 0 || number > 999)) {
        throw new BadRequestException(
          'Invalid ticket number (must be between 0-999)',
        );
      } else if (raffle.raffleType === RaffleType.LARGE && (number < 0 || number > 9999)) {
        throw new BadRequestException(
          'Invalid ticket number (must be between 0-9999)',
        );
      }
      if (urlComprobante && typeof urlComprobante !== 'string') {
        throw new BadRequestException('Invalid comprobante URL');
      }

      // Convertir el array de tickets a formato JSON seguro
      const getArraySize = (raffle: Raffle) => {
        switch (raffle.raffleType) {
          case RaffleType.SMALL:
            return 100;
          case RaffleType.MEDIUM:
            return 1000;
          case RaffleType.LARGE:
            return 10000;
          default:
            return 100;
        }
      }

      const ticketsArray: boolean[] = Array.isArray(raffle.tickets)
        ? [...raffle.tickets]
        : Array(getArraySize(raffle)).fill(false) as boolean[];

      // Verificar si el ticket ya está comprado
      if (ticketsArray[number]) {
        throw new BadRequestException(
          `Ticket number ${number} is already sold`,
        );
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
          { transaction },
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
