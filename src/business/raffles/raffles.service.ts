import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { RaffleHistory } from './raffle-history.mode';
import { ColombianLotteryType, DrawMode, Raffle, RaffleStatus, RaffleType } from './raffle.model';

@Injectable()
export class RafflesService {
    constructor(
        @InjectModel(Raffle)
        private raffleModel: typeof Raffle,
        @InjectModel(RaffleHistory)
        private raffleHistoryModel: typeof RaffleHistory,
    ) { }

    async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
        let tickets: boolean[] = Array(100).fill(false) as boolean[];
        if (createRaffleDto.raffleType === RaffleType.MEDIUM) {
            tickets = Array(1000).fill(false) as boolean[];
        } else if (createRaffleDto.raffleType === RaffleType.LARGE) {
            tickets = Array(10000).fill(false) as boolean[];
        }

        try {

            const raffle = await this.raffleModel.create<Raffle>({
                ...createRaffleDto,
                tickets,
                status: RaffleStatus.DRAFT,
                hasSecondPrizeInverted: createRaffleDto.hasSecondPrizeInverted || false,
                featured: createRaffleDto.featured || false,
            });

            // Registrar en el historial
            await this.raffleHistoryModel.create({
                raffleId: raffle.id,
                action: 'RAFFLE_CREATED',
                details: {
                    drawMode: raffle.drawMode,
                    drawDate: raffle.drawDate,
                    hasSecondPrizeInverted: raffle.hasSecondPrizeInverted,
                    featured: raffle.featured,
                },
                performedById: raffle.creatorId,
            });

            return raffle;
        } catch (error) {
            console.error('Error creating raffle:', error);
            throw error;
        }
    }

    async findAll(): Promise<Raffle[]> {
        return this.raffleModel.findAll({
        });
    }

    async findOne(id: string): Promise<Raffle | null> {
        return this.raffleModel.findByPk(id, {
            include: ['creator', 'majorityOwner', 'history'],
        });
    }

    async updateStatus(id: string, status: RaffleStatus, userId: string): Promise<Raffle> {
        const raffle = await this.raffleModel.findByPk(id);
        if (!raffle) {
            throw new Error(`Raffle with id ${id} not found`);
        }

        raffle.status = status;
        await raffle.save();

        // Registrar en el historial
        await this.raffleHistoryModel.create({
            raffleId: raffle.id,
            action: 'STATUS_UPDATED',
            details: { previousStatus: raffle.status, newStatus: status },
            performedById: userId,
        });

        return raffle;
    }

    async updateDrawSettings(
        id: string,
        drawMode: DrawMode,
        drawDate: Date,
        userId: string,
        hasSecondPrizeInverted?: boolean,
        hasSecondPrizePalindrome?: boolean,
        colombianLotteryType?: string,
    ): Promise<Raffle> {
        const raffle = await this.raffleModel.findByPk(id);
        if (!raffle) {
            throw new Error(`Raffle with id ${id} not found`);
        }

        // Verificar si el usuario es el mayoritario
        const isMajorityOwner = await this.checkMajorityOwnership(raffle.id, userId);
        if (!isMajorityOwner) {
            throw new ForbiddenException('Only majority owner can update draw settings');
        }

        // Actualizar configuraciones
        raffle.drawMode = drawMode;
        raffle.drawDate = drawDate;
        raffle.hasSecondPrizeInverted = hasSecondPrizeInverted || false;


        if (drawMode === DrawMode.COLOMBIAN_LOTTERY && colombianLotteryType) {
            raffle.colombianLotteryType = colombianLotteryType as ColombianLotteryType;
        }

        await raffle.save();

        // Registrar en el historial
        await this.raffleHistoryModel.create({
            raffleId: raffle.id,
            action: 'DRAW_SETTINGS_UPDATED',
            details: {
                drawMode,
                drawDate,
                hasSecondPrizeInverted,
                hasSecondPrizePalindrome,
                colombianLotteryType,
            },
            performedById: userId,
        });

        return raffle;
    }

    async setWinningNumbers(
        id: string,
        winningNumber: number,
        secondPrizeWinningNumber?: number,
        userId?: string,
    ): Promise<Raffle> {
        const raffle = await this.raffleModel.findByPk(id);
        if (!raffle) {
            throw new Error(`Raffle with id ${id} not found`);
        }

        raffle.winningNumber = winningNumber;
        if (secondPrizeWinningNumber) {
            raffle.secondPrizeWinningNumber = secondPrizeWinningNumber;
        }
        await raffle.save();

        // Registrar en el historial
        await this.raffleHistoryModel.create({
            raffleId: raffle.id,
            action: 'WINNING_NUMBERS_SET',
            details: { winningNumber, secondPrizeWinningNumber },
            performedById: userId || raffle.creatorId,
        });

        return raffle;
    }

    // async createRecurrentRaffle(parentRaffleId: string, userId: string): Promise<Raffle> {
    //     const parentRaffle = await this.raffleModel.findByPk(parentRaffleId);
    //     if (!parentRaffle) {
    //         throw new Error(`Parent raffle with id ${parentRaffleId} not found`);
    //     }

    //     if (parentRaffle.status !== RaffleStatus.FINISHED) {
    //         throw new BadRequestException('Can only create recurrent raffle from finished raffles');
    //     }

    //     const recurrentRaffle = await this.raffleModel.create({
    //         ...parentRaffle.toJSON(),
    //         id: undefined, // Para generar nuevo ID
    //         parentRaffleId: parentRaffle.id,
    //         status: RaffleStatus.RECURRENT,
    //         winningNumber: null,
    //         secondPrizeWinningNumber: null,
    //         tickets: Array(parentRaffle.tickets.length).fill(false),
    //         creatorId: userId,
    //     });

    //     // Registrar en el historial
    //     await this.raffleHistoryModel.create({
    //         raffleId: recurrentRaffle.id,
    //         action: 'RECURRENT_RAFFLE_CREATED',
    //         details: { parentRaffleId },
    //         performedById: userId,
    //     });

    //     return recurrentRaffle;
    // }

    private async checkMajorityOwnership(raffleId: string, userId: string): Promise<boolean> {
        // Aquí implementarías la lógica para verificar si el usuario tiene el % mayoritario de tickets
        // Por ahora, asumimos que el creador es el mayoritario
        const raffle = await this.raffleModel.findByPk(raffleId);
        if (!raffle) {
            throw new Error(`Raffle with id ${raffleId} not found`);
        }
        return raffle.creatorId === userId;
    }

    async getRaffleHistory(raffleId: string): Promise<RaffleHistory[]> {
        return this.raffleHistoryModel.findAll({
            where: { raffleId },
            include: ['performedBy'],
            order: [['createdAt', 'DESC']],
        });
    }
}