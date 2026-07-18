import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateEstadoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  comentario?: string;
}
