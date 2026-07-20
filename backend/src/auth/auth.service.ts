import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';

const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

interface IntentosLogin {
  fallidos: number;
  bloqueadoHasta?: number;
}

@Injectable()
export class AuthService {
  private readonly intentosPorEmail = new Map<string, IntentosLogin>();

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const clave = email.trim().toLowerCase();
    const registro = this.intentosPorEmail.get(clave);

    if (registro?.bloqueadoHasta && registro.bloqueadoHasta > Date.now()) {
      throw new HttpException(
        {
          message:
            'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentar.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const usuario = await this.usuariosService.findByEmailConPassword(email);
    const passwordValida =
      usuario && (await bcrypt.compare(password, usuario.passwordHash));

    if (!usuario || !usuario.activo || !passwordValida) {
      const fallidos = (registro?.fallidos ?? 0) + 1;
      if (fallidos >= MAX_INTENTOS_FALLIDOS) {
        this.intentosPorEmail.set(clave, {
          fallidos,
          bloqueadoHasta: Date.now() + BLOQUEO_MS,
        });
      } else {
        this.intentosPorEmail.set(clave, { fallidos });
      }

      throw new UnauthorizedException({
        message: 'Credenciales inválidas',
        intentosRestantes: Math.max(0, MAX_INTENTOS_FALLIDOS - fallidos),
      });
    }

    this.intentosPorEmail.delete(clave);

    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}
