import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Raffle, RaffleStatus } from './raffle.model';

@Injectable()
export class RafflesService {
    constructor(
        @InjectModel(Raffle)
        private raffleModel: typeof Raffle,
    ) { }

    async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
        return this.raffleModel.create<Raffle>({
            ...createRaffleDto,
            tickets: Array(100).fill(false), // Inicializar matriz de tickets vacía
            status: RaffleStatus.DRAFT,
        } as any);
    }

    async findAll(): Promise<Raffle[]> {
        return this.raffleModel.findAll();
    }

    async findOne(id: string): Promise<Raffle | null> {
        return this.raffleModel.findByPk(id, { include: ['creator'] });
    }

    async updateStatus(id: string, status: RaffleStatus): Promise<Raffle> {
        const raffle = await this.raffleModel.findByPk(id);
        if (!raffle) {
            throw new Error(`Raffle with id ${id} not found`);
        }
        raffle.status = status;
        return raffle.save();
    }
}
