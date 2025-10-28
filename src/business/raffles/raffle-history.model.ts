import { Optional } from 'sequelize';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Raffle } from './raffle.model';

interface RaffleHistoryAttributes {
  id: string;
  raffleId: string;
  action: string;
  details: any;
  performedById: string;
  createdAt?: Date;
}

type RaffleHistoryCreationAttributes = Optional<RaffleHistoryAttributes, 'id'>;

@Table({
  tableName: 'raffle_histories',
  timestamps: true,
})
export class RaffleHistory extends Model<RaffleHistoryAttributes, RaffleHistoryCreationAttributes> {
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
  declare performedById: string;

  @BelongsTo(() => User)
  declare performedBy: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare action: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare details: any;

  @CreatedAt
  declare createdAt: Date;
}