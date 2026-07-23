import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AccionSolicitud, TipoCarga } from '../entities/solicitud.entity';

export class CreateSolicitudDto {
  @IsEnum(TipoCarga)
  tipoCarga: TipoCarga;

  @IsEnum(AccionSolicitud)
  accion: AccionSolicitud;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacionesFuncionario?: string;
}
