// otp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { OTP } from './otp.model';

@Injectable()
export class OTPService {
    private readonly logger = new Logger(OTPService.name);

    constructor(
        @InjectModel(OTP)
        private otpModel: typeof OTP,
    ) { }

    async generateOTP(userId: string, type: 'WHATSAPP' | 'EMAIL' | 'LOGIN'): Promise<string> {
        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Expira en 10 minutos
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.otpModel.create({
            userId,
            code,
            type,
            expiresAt,
        });

        return code;
    }

    async verifyOTP(userId: string, code: string, type: 'WHATSAPP' | 'EMAIL' | 'LOGIN'): Promise<boolean> {
        const otp = await this.otpModel.findOne({
            where: {
                userId,
                code,
                type,
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() }
            },
        });

        if (!otp) {
            return false;
        }

        // Marcar OTP como usado
        await otp.update({
            isUsed: true,
            usedAt: new Date(),
        });

        return true;
    }
    // asi deberias escribir todos los metodos en los servicios
    async cleanupExpiredOTPs(): Promise<number> {
        try {
            const result = await this.otpModel.destroy({
                where: {
                    expiresAt: {
                        [Op.lt]: new Date(), // Elimina los OTPs cuya fecha de expiración es menor a la actual
                    },
                },
            });

            this.logger.log(`Cleaned up ${result} expired OTPs`);
            return result;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.logger.error('Error cleaning up expired OTPs', error.stack);
            throw error;
        }
    }
}