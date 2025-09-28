// user.model.ts
import { Optional } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { OTP } from '../../core/otp/otp.model';

interface UserAttributes {
  id: string;
  name: string;
  phone: string;
  email: string;
  isVerified: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isVerified' | 'loginAttempts' | 'isLocked'>;

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^\+?[\d\s-]+$/,
    },
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isVerified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare loginAttempts: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isLocked: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lockedUntil: Date;

  @HasMany(() => OTP)
  declare otps: OTP[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}