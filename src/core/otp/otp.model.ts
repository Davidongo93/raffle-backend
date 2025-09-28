// otp.model.ts
import {
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Model,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../../business/users/user.model';

type OTPCreationAttributes = {
    userId: string;
    code: string;
    type: 'WHATSAPP' | 'EMAIL' | 'LOGIN';
    expiresAt: Date;
    isUsed?: boolean;
    usedAt?: Date;
};

interface OTPAttributes {
    id: string;
    userId: string;
    code: string;
    type: 'WHATSAPP' | 'EMAIL' | 'LOGIN';
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({
    tableName: 'otps',
    timestamps: true,
})
export class OTP extends Model<OTPAttributes, OTPCreationAttributes> {
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
    })
    declare userId: string;

    @BelongsTo(() => User)
    declare user: User;

    @Column({
        type: DataType.STRING(6),
        allowNull: false,
    })
    declare code: string;

    @Column({
        type: DataType.ENUM('WHATSAPP', 'EMAIL', 'LOGIN'),
        allowNull: false,
    })
    declare type: 'WHATSAPP' | 'EMAIL' | 'LOGIN';

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare expiresAt: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isUsed: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare usedAt: Date;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}