/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Optional } from 'sequelize';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { RaffleHistory } from './raffle-history.model';

export enum RaffleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  FINISHED = 'finished',
  RECURRENT = 'recurrent', // Nuevo estado para rifas recurrentes
}

export enum RaffleType {
  SMALL = 'small',    // 100 tickets
  MEDIUM = 'medium',  // 1000 tickets
  LARGE = 'large',    // 10000 tickets
}

export enum DrawMode {
  APP_DRAW = 'app_draw', // Ejecutado por la aplicación
  COLOMBIAN_LOTTERY = 'colombian_lottery', // Loterías colombianas
}

export enum ColombianLotteryType {
  LOTERIA_DE_BOGOTA = 'loteria_de_bogota',
  LOTERIA_DE_MEDELLIN = 'loteria_de_medellin',
  LOTERIA_DE_CALI = 'loteria_de_cali',
  LOTERIA_DEL_VALLE = 'loteria_del_valle',
  LOTERIA_DEL_META = 'loteria_del_meta',
  LOTERIA_DE_BOYACA = 'loteria_de_boyaca',
  LOTERIA_DE_SANTANDER = 'loteria_de_santander',
  LOTERIA_DE_ANTIOQUIA = 'loteria_de_antioquia',
}

interface RaffleAttributes {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  ticketPrice: number;
  prizeValue: number;
  prizeImageUrl: string;
  raffleType: RaffleType;
  tickets: boolean[];
  status: RaffleStatus;

  // Nuevos campos
  drawMode: DrawMode;
  drawDate: Date;
  colombianLotteryType?: ColombianLotteryType;
  hasSecondPrizeInverted: boolean;
  featured: boolean;
  majorityOwnerId?: string; // Usuario con % mayoritario

  // Campos de ganadores
  winningNumber?: number;
  secondPrizeWinningNumber?: number;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type RaffleCreationAttributes = Optional<
  RaffleAttributes,
  'id' | 'tickets' | 'status' | 'hasSecondPrizeInverted'
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'majorityOwnerId',
    references: {
      model: 'users',
      key: 'id',
    },
  })
  declare majorityOwnerId: string;

  @BelongsTo(() => User, 'majorityOwnerId')
  declare majorityOwner: User;

  @HasMany(() => RaffleHistory)
  declare history: RaffleHistory[];

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
    type: DataType.INTEGER,
    allowNull: false
  })

  declare ticketPrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false

  })
  declare prizeValue: number;


  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare secondPrizeValue: number;

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

  @Column({
    type: DataType.ENUM(...Object.values(RaffleType)),
    allowNull: false,
    defaultValue: RaffleType.SMALL,
  })
  declare raffleType: RaffleType;

  // Nuevos campos para modalidad de sorteo
  @Column({
    type: DataType.ENUM(...Object.values(DrawMode)),
    allowNull: false,
    defaultValue: DrawMode.APP_DRAW,
  })
  declare drawMode: DrawMode;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare drawDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(ColombianLotteryType)),
    allowNull: true,
  })
  declare colombianLotteryType: ColombianLotteryType;

  // Flags para segundos premios
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare hasSecondPrizeInverted: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare featured: boolean;

  // Campos para números ganadores
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare winningNumber: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare secondPrizeWinningNumber: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    validate: {
      isValidTicketsArray(this: Raffle, value: boolean[]) {
        if (!Array.isArray(value)) {
          throw new Error('Tickets must be an array of boolean values');
        }

        const expectedLength = this.raffleType === RaffleType.SMALL ? 100 :
          this.raffleType === RaffleType.MEDIUM ? 1000 : 10000;

        if (value.length !== expectedLength) {
          throw new Error(`Tickets must be an array of ${expectedLength} boolean values for ${this.raffleType} raffle`);
        }
      },
    },
  })
  declare tickets: boolean[];

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
