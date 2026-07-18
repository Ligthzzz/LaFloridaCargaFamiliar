import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { normalizarRut } from '../common/validators/rut.util';

const SALT_ROUNDS = 12;

export type UsuarioPublico = Omit<Usuario, 'passwordHash'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioPublico> {
    const rutNormalizado = normalizarRut(dto.rut);

    const existente = await this.usuariosRepository.findOne({
      where: [{ email: dto.email }, { rut: rutNormalizado }],
    });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email o RUT');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const usuario = this.usuariosRepository.create({
      rut: rutNormalizado,
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol: dto.rol,
    });

    const guardado = await this.usuariosRepository.save(usuario);
    return this.omitirPassword(guardado);
  }

  async findByEmailConPassword(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.omitirPassword(usuario);
  }

  async existeAdmin(): Promise<boolean> {
    const count = await this.usuariosRepository.count({
      where: { rol: 'admin' as Usuario['rol'] },
    });
    return count > 0;
  }

  private omitirPassword(usuario: Usuario): UsuarioPublico {
    const { passwordHash: _passwordHash, ...resto } = usuario;
    return resto;
  }
}
