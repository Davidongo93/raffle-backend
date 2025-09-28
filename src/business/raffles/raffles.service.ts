import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Raffle, RaffleStatus, RaffleType } from './raffle.model';

@Injectable()
export class RafflesService {
    constructor(
        @InjectModel(Raffle)
        private raffleModel: typeof Raffle,
    ) { }

    async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {

        let tickets: boolean[] = Array(100).fill(false) as boolean[];
        if (createRaffleDto.raffleType === RaffleType.MEDIUM) {
            tickets = Array(1000).fill(false) as boolean[];
        } else if (createRaffleDto.raffleType === RaffleType.LARGE) {
            tickets = Array(10000).fill(false) as boolean[];
        }
        return this.raffleModel.create<Raffle>({
            ...createRaffleDto,
            tickets,
            status: RaffleStatus.DRAFT,
        });
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
