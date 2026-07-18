import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsRut } from '../../common/validators/is-rut.validator';
import { AccionSolicitud, TipoCarga } from '../entities/solicitud.entity';

export class CreateSolicitudDto {
  @IsEnum(TipoCarga)
  tipoCarga: TipoCarga;

  @IsEnum(AccionSolicitud)
  accion: AccionSolicitud;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombreCarga: string;

  @IsOptional()
  @IsRut()
  rutCarga?: string;

  @IsDateString()
  fechaNacimientoCarga: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  parentesco?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacionesFuncionario?: string;
}
