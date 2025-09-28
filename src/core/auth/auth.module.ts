// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../business/users/user.model';
import { UsersService } from '../../business/users/users.service';
import { EmailService } from '../email/email.service';
import { OTP } from '../otp/otp.model';
import { OTPService } from '../otp/otp.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        SequelizeModule.forFeature([User, OTP]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [
        AuthService,
        UsersService,
        OTPService,
        WhatsAppService,
        EmailService,
        JwtStrategy,
        { provide: 'USER_MODEL', useValue: User },
        { provide: 'OTP_MODEL', useValue: OTP },
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }