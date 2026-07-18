import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsRut } from '../../common/validators/is-rut.validator';
import { RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsRut()
  rut: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'La contraseña debe incluir al menos una mayúscula y un número',
  })
  password: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
