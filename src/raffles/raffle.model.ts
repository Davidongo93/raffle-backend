/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Optional } from 'sequelize';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../users/user.model';

export enum RaffleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  FINISHED = 'finished',
}

export enum RaffleType {
  SMALL = 'small',    // 100 tickets
  MEDIUM = 'medium',  // 1000 tickets
  LARGE = 'large',    // 10000 tickets
}

interface RaffleAttributes {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  ticketPrice: number;
  prizeValue: number;
  prizeImageUrl: string; // Nuevo campo
  raffleType: RaffleType; // Nuevo campo para el tipo de rifa
  tickets: boolean[];
  status: RaffleStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type RaffleCreationAttributes = Optional<
  RaffleAttributes,
  'id' | 'tickets' | 'status'
>;

@Table({
  tableName: 'raffles',
  timestamps: true,
  paranoid: true,
})
export class Raffle extends Model<RaffleAttributes, RaffleCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'creatorId',
    references: {
      model: 'users',
      key: 'id',
    },
  })
  declare creatorId: string;

  @BelongsTo(() => User)
  declare creator: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 80],
    },
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000],
    },
  })
  declare description: string;
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('ticketPrice');
      return value ? parseFloat(`${value}`) : null;
    },
  })
  declare ticketPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('prizeValue');
      return value ? parseFloat(`${value}`) : null;
    },
  })
  declare prizeValue: number;

  // Nuevo campo para la URL de la imagen del premio
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true,
    },
    field: 'prizeImageUrl',
  })
  declare prizeImageUrl: string;

  // Nuevo campo para el tipo de rifa
  @Column({
    type: DataType.ENUM(...Object.values(RaffleType)),
    allowNull: false,
    defaultValue: RaffleType.SMALL,
  })
  declare raffleType: RaffleType;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    validate: {
      isValidTicketsArray(this: Raffle, value: boolean[]) {
        if (!Array.isArray(value)) {
          throw new Error('Tickets must be an array of boolean values');
        }

        // Validar longitud según el tipo de rifa
        const expectedLength = this.raffleType === RaffleType.SMALL ? 100 :
          this.raffleType === RaffleType.MEDIUM ? 1000 : 10000;

        if (value.length !== expectedLength) {
          throw new Error(`Tickets must be an array of ${expectedLength} boolean values for ${this.raffleType} raffle`);
        }
      },
    },
  })
  declare tickets: boolean[];

  // Hook para establecer el valor por defecto de tickets según el tipo de rifa
  beforeValidate() {
    if (!this.tickets) {
      const length = this.raffleType === RaffleType.SMALL ? 100 :
        this.raffleType === RaffleType.MEDIUM ? 1000 : 10000;
      this.tickets = Array(length).fill(false);
    }
  }

  @Column({
    type: DataType.ENUM(...Object.values(RaffleStatus)),
    allowNull: false,
    defaultValue: RaffleStatus.DRAFT,
  })
  declare status: RaffleStatus;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}