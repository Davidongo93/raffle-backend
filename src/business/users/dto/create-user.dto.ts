import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator';


export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;

    // Convertir a string y limpiar espacios
    const cleaned = String(value).replace(/\s+/g, '');

    // Asegurar prefijo '+' si falta
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }, { toClassOnly: true }) // <-- ¡Añade esta opción!
  phone: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.toLowerCase().trim() : undefined
  )
  email: string;
}