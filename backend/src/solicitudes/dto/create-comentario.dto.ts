import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  mensaje: string;
}
