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

interface RaffleAttributes {
  id: string;
  creatorId: string;
  description: string;
  ticketPrice: number;
  prizeValue: number;
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
    field: 'creatorId', // Opcional: si quieres usar snake_case en la BD
    references: {
      model: 'users', // Nombre exacto de la tabla en la BD
      key: 'id', // Campo al que hace referencia
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
      len: [10, 2000],
    },
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('ticketPrice');
      return value ? parseFloat(value) : null;
    },
  })
  declare ticketPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('prizeValue');
      return value ? parseFloat(value) : null;
    },
  })
  declare prizeValue: number;

  @Column({
    type: DataType.JSONB, // Cambiado de ARRAY a JSONB
    allowNull: false,
    defaultValue: Array(100).fill(false),
    validate: {
      isValidTicketsArray(value: boolean[]) {
        if (!Array.isArray(value) || value.length !== 100) {
          throw new Error('Tickets must be an array of 100 boolean values');
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
