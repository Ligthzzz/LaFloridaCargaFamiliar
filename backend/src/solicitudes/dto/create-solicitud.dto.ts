import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TipoCarga } from '../entities/solicitud.entity';

export class CreateSolicitudDto {
  @IsEnum(TipoCarga)
  tipoCarga: TipoCarga;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacionesFuncionario?: string;

  @IsOptional()
  @IsUUID()
  loteId?: string;
}
