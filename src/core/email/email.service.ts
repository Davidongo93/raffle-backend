// email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendOTP(email: string, code: string): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'Código de Verificación',
                html: `
          <h2>Código de Verificación</h2>
          <p>Tu código de verificación es: <strong>${code}</strong></p>
          <p>Este código es válido por 10 minutos.</p>
        `,
            });

            this.logger.log(`OTP enviado a ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Error enviando OTP a ${email}:`, error);
            return false;
        }
    }
}