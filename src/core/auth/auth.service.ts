// auth.service.ts
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../business/users/user.model';
import { EmailService } from '../email/email.service';
import { OTPService } from '../otp/otp.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private jwtService: JwtService,
        private otpService: OTPService,
        private whatsappService: WhatsAppService,
        private emailService: EmailService,
    ) { }

    async requestOTP(identifier: string, type: 'WHATSAPP' | 'EMAIL'): Promise<void> {
        let user: User | null;
        console.log('Requesting OTP for:', identifier, 'via', type);



        if (type === 'WHATSAPP') {
            user = await this.userModel.findOne({ where: { phone: identifier } });
            console.log('Found user:', user);

        } else {
            user = await this.userModel.findOne({ where: { email: identifier } });
        }

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        // Verificar si la cuenta está bloqueada
        if (user.isLocked && user.lockedUntil > new Date()) {
            throw new ForbiddenException('Cuenta temporalmente bloqueada');
        }

        const code = await this.otpService.generateOTP(user.id, type);

        if (type === 'WHATSAPP') {
            await this.whatsappService.sendOTP(user.phone, code);
        } else {
            await this.emailService.sendOTP(user.email, code);
        }
    }

    async verifyOTP(identifier: string, code: string, type: 'WHATSAPP' | 'EMAIL'): Promise<{ accessToken: string; user: User }> {
        let user: User | null;

        if (type === 'WHATSAPP') {
            user = await this.userModel.findOne({ where: { phone: identifier } });
        } else {
            user = await this.userModel.findOne({ where: { email: identifier } });
        }

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        // Verificar si la cuenta está bloqueada
        if (user.isLocked && user.lockedUntil > new Date()) {
            throw new ForbiddenException('Cuenta temporalmente bloqueada');
        }

        const isValid = await this.otpService.verifyOTP(user.id, code, type);

        if (!isValid) {
            // Incrementar intentos fallidos
            const loginAttempts = user.loginAttempts + 1;
            let isLocked = user.isLocked;
            let lockedUntil = user.lockedUntil;

            // Bloquear después de 5 intentos fallidos por 30 minutos
            if (loginAttempts >= 5) {
                isLocked = true;
                lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }

            await user.update({
                loginAttempts,
                isLocked,
                lockedUntil,
            });

            throw new UnauthorizedException('Código OTP inválido');
        }

        // Resetear intentos fallidos y actualizar último login
        await user.update({
            loginAttempts: 0,
            isLocked: false,
            lockedUntil: null,
            lastLoginAt: new Date(),
            isVerified: true, // Marcar como verificado después de OTP exitoso
        });

        // Enviar mensaje de bienvenida si es la primera verificación
        if (type === 'WHATSAPP') {
            await this.whatsappService.sendWelcomeMessage(user.phone, user.name);
        }

        const payload = { sub: user.id, email: user.email, phone: user.phone };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: user.toJSON() as User,
        };
    }

    async validateUser(payload: { sub: string }): Promise<User> {
        try {
            const user: User | null = await this.userModel.findByPk(payload.sub);
            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            console.error('Error validando usuario:', error);
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}