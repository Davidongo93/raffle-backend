import { Optional } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

interface UserAttributes {
  id: string;
  name: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isVerified'>;

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
      is: /^\+?[\d\s-]+$/, // Validación básica de teléfono
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

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}
