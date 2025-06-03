import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsPhoneNumber()
    phone: string;

    @IsEmail()
    email: string;
}