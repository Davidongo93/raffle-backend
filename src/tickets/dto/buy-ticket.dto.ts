import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class BuyTicketDto {
  @IsUUID()
  raffleId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(0)
  @Max(99)
  number: number;

  @IsString()
  status?: string; // Opcional, si se quiere establecer un estado inicial

  @IsString()
  @IsNotEmpty()
  urlComprobante: string; // URL del comprobante de pago
}
