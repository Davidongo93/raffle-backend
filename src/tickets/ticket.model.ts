import { Optional } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { Raffle } from '../raffles/raffle.model';
import { User } from '../users/user.model';

export enum TicketStatus {
    AVALIABLE = 'available',
    SOLD = 'sold',
    PENDING = 'pending',
    RESERVED = 'reserved',
    CANCELED = 'canceled',
    REDEEMED = 'redeemed',
    EXPIRED = 'expired',
    REFUNDED = 'refunded',
}

interface TicketAttributes {
    id: string;
    raffleId: string;
    userId: string;
    number: number;
    status: TicketStatus;
    urlComprobante: string; // URL del comprobante de pago
    createdAt?: Date;
    updatedAt?: Date;
}

type TicketCreationAttributes = Optional<TicketAttributes, 'id'>;

@Table({
    tableName: 'tickets',
    timestamps: true,
})
export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @ForeignKey(() => Raffle)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare raffleId: string;

    @BelongsTo(() => Raffle)
    declare raffle: Raffle;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string;

    @BelongsTo(() => User)
    declare user: User;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 99,
        },
    })
    declare number: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        },
    })
    declare urlComprobante: string;
    @Column({
        type: DataType.ENUM(...Object.values(TicketStatus)),
        allowNull: false,
        defaultValue: TicketStatus.AVALIABLE,
    })
    declare status: TicketStatus;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}