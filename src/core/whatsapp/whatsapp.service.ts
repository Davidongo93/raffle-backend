// whatsapp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: twilio.Twilio;

    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendOTP(phone: string, code: string): Promise<boolean> {
        try {
            console.log("twilio whatsap number", process.env.TWILIO_WHATSAPP_NUMBER);

            const message = await this.client.messages.create({
                body: `Tu código de verificación es: ${code}. Válido por 10 minutos.`,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${phone}`,
            });

            this.logger.log(`OTP enviado a ${phone}: ${message.sid}`);
            return true;
        } catch (error) {
            this.logger.error(`Error enviando OTP a ${phone}:`, (error as Error)?.message);
            throw new Error(`Error enviando OTP a ${phone}: ${(error as Error)?.message}`);
        }
    }

    async sendWelcomeMessage(phone: string, userName: string): Promise<boolean> {
        try {
            const message = await this.client.messages.create({
                body: `¡Bienvenido ${userName}! Tu cuenta ha sido verificada exitosamente.`,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${phone}`,
            });
            this.logger.log(`Mensaje de bienvenida enviado a ${phone}: ${message.sid}`);
            return true;
        } catch (error) {
            this.logger.error(`Error enviando mensaje de bienvenida:`, error);
            return false;
        }
    }
}