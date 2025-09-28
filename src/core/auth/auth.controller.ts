// auth.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('request-otp')
    @HttpCode(HttpStatus.OK)
    async requestOTP(@Body() requestOTPDto: { identifier: string; type: 'WHATSAPP' | 'EMAIL' }) {

        await this.authService.requestOTP(requestOTPDto.identifier, requestOTPDto.type);
        return { message: 'Código OTP enviado exitosamente' };
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOTP(@Body() verifyOTPDto: { identifier: string; code: string; type: 'WHATSAPP' | 'EMAIL' }) {
        const result = await this.authService.verifyOTP(
            verifyOTPDto.identifier,
            verifyOTPDto.code,
            verifyOTPDto.type,
        );
        return result;
    }
}