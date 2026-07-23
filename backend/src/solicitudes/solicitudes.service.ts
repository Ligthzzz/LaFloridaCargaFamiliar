import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fileTypeFromBuffer } from 'file-type';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EstadoSolicitud, Solicitud, TipoCarga } from './entities/solicitud.entity';
import { ArchivoAdjunto, TipoDocumento } from './entities/archivo-adjunto.entity';
import { Comentario } from './entities/comentario.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { normalizarRut } from '../common/validators/rut.util';
import {
  MIME_TYPES_PERMITIDOS,
  TAMANIO_MAXIMO_BYTES,
  generarNombreArchivo,
} from '../common/utils/archivo.util';
import { DOCUMENTOS_REQUERIDOS } from './documentos-requeridos.config';

export type ArchivosSolicitud = Record<string, Express.Multer.File[] | undefined>;

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? 'uploads';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudesRepository: Repository<Solicitud>,
    @InjectRepository(ArchivoAdjunto)
    private readonly archivosRepository: Repository<ArchivoAdjunto>,
    @InjectRepository(Comentario)
    private readonly comentariosRepository: Repository<Comentario>,
  ) {}

  async crear(
    dto: CreateSolicitudDto,
    archivos: ArchivosSolicitud,
    funcionario: Usuario,
  ): Promise<Solicitud> {
    const archivosValidados = await this.validarArchivos(
      dto.tipoCarga,
      archivos,
    );

    const solicitud = this.solicitudesRepository.create({
      funcionarioId: funcionario.id,
      rutFuncionario: normalizarRut(funcionario.rut),
      tipoCarga: dto.tipoCarga,
      observacionesFuncionario: dto.observacionesFuncionario ?? null,
      loteId: dto.loteId ?? null,
      estado: EstadoSolicitud.PENDIENTE,
    });
    const guardada = await this.solicitudesRepository.save(solicitud);

    await this.guardarArchivos(guardada.id, archivosValidados);

    return this.obtenerParaUsuario(guardada.id, funcionario);
  }

  async editar(
    id: string,
    dto: CreateSolicitudDto,
    archivos: ArchivosSolicitud,
    funcionario: Usuario,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (solicitud.funcionarioId !== funcionario.id) {
      throw new ForbiddenException('No tienes acceso a esta solicitud');
    }
    if (solicitud.estado !== EstadoSolicitud.OBSERVADO) {
      throw new BadRequestException(
        'Solo puedes corregir solicitudes que estén observadas',
      );
    }

    const archivosValidados = await this.validarArchivos(
      dto.tipoCarga,
      archivos,
    );

    solicitud.tipoCarga = dto.tipoCarga;
    solicitud.observacionesFuncionario = dto.observacionesFuncionario ?? null;
    solicitud.estado = EstadoSolicitud.PENDIENTE;
    await this.solicitudesRepository.save(solicitud);

    const archivosAnteriores = await this.archivosRepository.find({
      where: { solicitudId: id },
    });
    await Promise.all(
      archivosAnteriores.map((archivo) =>
        fs.unlink(archivo.rutaArchivo).catch(() => undefined),
      ),
    );
    await this.archivosRepository.remove(archivosAnteriores);

    await this.guardarArchivos(id, archivosValidados);

    return this.obtenerParaUsuario(id, funcionario);
  }

  async listar(usuario: Usuario, estado?: EstadoSolicitud): Promise<Solicitud[]> {
    const where: Record<string, unknown> = {};
    if (usuario.rol !== RolUsuario.ADMIN) {
      where.funcionarioId = usuario.id;
    }
    if (estado) {
      where.estado = estado;
    }
    return this.solicitudesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async listarPorLote(loteId: string, usuario: Usuario): Promise<Solicitud[]> {
    const solicitudes = await this.solicitudesRepository.find({
      where: { loteId },
      relations: { archivos: true, comentarios: { autor: true } },
      order: { createdAt: 'ASC' },
    });
    if (solicitudes.length === 0) {
      throw new NotFoundException('Envío no encontrado');
    }

    const esAdmin = usuario.rol === RolUsuario.ADMIN;
    const visibles = esAdmin
      ? solicitudes
      : solicitudes.filter((s) => s.funcionarioId === usuario.id);
    if (visibles.length === 0) {
      throw new ForbiddenException('No tienes acceso a este envío');
    }
    return visibles;
  }

  async obtenerParaUsuario(id: string, usuario: Usuario): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
      relations: { archivos: true, comentarios: { autor: true } },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    this.verificarAcceso(solicitud, usuario);
    return solicitud;
  }

  async obtenerArchivoParaUsuario(
    solicitudId: string,
    archivoId: string,
    usuario: Usuario,
  ): Promise<ArchivoAdjunto> {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id: solicitudId },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    this.verificarAcceso(solicitud, usuario);

    const archivo = await this.archivosRepository.findOne({
      where: { id: archivoId, solicitudId },
    });
    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return archivo;
  }

  async aprobar(id: string, admin: Usuario, comentario?: string) {
    return this.cambiarEstado(id, EstadoSolicitud.APROBADO, admin, comentario);
  }

  async rechazar(id: string, admin: Usuario, comentario?: string) {
    return this.cambiarEstado(id, EstadoSolicitud.RECHAZADO, admin, comentario);
  }

  async observar(id: string, admin: Usuario, comentario?: string) {
    if (!comentario) {
      throw new BadRequestException(
        'Debes indicar un comentario al observar una solicitud',
      );
    }
    return this.cambiarEstado(id, EstadoSolicitud.OBSERVADO, admin, comentario);
  }

  async agregarComentario(id: string, admin: Usuario, mensaje: string) {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return this.comentariosRepository.save(
      this.comentariosRepository.create({
        solicitudId: id,
        autorId: admin.id,
        mensaje,
      }),
    );
  }

  private async cambiarEstado(
    id: string,
    estado: EstadoSolicitud,
    admin: Usuario,
    comentario?: string,
  ) {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    solicitud.estado = estado;
    solicitud.revisadoPorId = admin.id;
    solicitud.revisadoAt = new Date();
    await this.solicitudesRepository.save(solicitud);

    if (comentario) {
      await this.comentariosRepository.save(
        this.comentariosRepository.create({
          solicitudId: id,
          autorId: admin.id,
          mensaje: comentario,
        }),
      );
    }

    return this.obtenerParaUsuario(id, admin);
  }

  private verificarAcceso(solicitud: Solicitud, usuario: Usuario) {
    const esDueno = solicitud.funcionarioId === usuario.id;
    const esAdmin = usuario.rol === RolUsuario.ADMIN;
    if (!esDueno && !esAdmin) {
      throw new ForbiddenException('No tienes acceso a esta solicitud');
    }
  }

  private async validarArchivos(
    tipoCarga: TipoCarga,
    archivos: ArchivosSolicitud,
  ) {
    const requisitos = DOCUMENTOS_REQUERIDOS[tipoCarga];
    const resultado: Array<{
      file: Express.Multer.File;
      tipoDocumento: TipoDocumento;
    }> = [];

    for (const { campo, tipoDocumento } of requisitos) {
      const files = archivos[campo];
      if (!files || files.length !== 1) {
        throw new BadRequestException(
          `Debes adjuntar el documento requerido: "${tipoDocumento}"`,
        );
      }
      const file = files[0];

      if (file.size > TAMANIO_MAXIMO_BYTES) {
        throw new BadRequestException(
          `El archivo "${file.originalname}" supera el tamaño máximo permitido (5MB)`,
        );
      }

      const tipoReal = await fileTypeFromBuffer(file.buffer);
      const mimeReal = tipoReal?.mime ?? file.mimetype;
      if (!MIME_TYPES_PERMITIDOS.has(mimeReal)) {
        throw new BadRequestException(
          `El archivo "${file.originalname}" no es un PDF, JPG o PNG válido`,
        );
      }

      resultado.push({ file, tipoDocumento });
    }

    return resultado;
  }

  private async guardarArchivos(
    solicitudId: string,
    archivosValidados: Array<{
      file: Express.Multer.File;
      tipoDocumento: TipoDocumento;
    }>,
  ) {
    const carpeta = path.join(UPLOADS_DIR, 'solicitudes', solicitudId);
    await fs.mkdir(carpeta, { recursive: true });

    for (const { file, tipoDocumento } of archivosValidados) {
      const nombreArchivo = generarNombreArchivo(file.originalname);
      const rutaCompleta = path.join(carpeta, nombreArchivo);
      await fs.writeFile(rutaCompleta, file.buffer);

      await this.archivosRepository.save(
        this.archivosRepository.create({
          solicitudId,
          tipoDocumento,
          nombreOriginal: file.originalname,
          rutaArchivo: rutaCompleta,
          mimeType: file.mimetype,
          tamanioBytes: file.size,
        }),
      );
    }
  }
}
