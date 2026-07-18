import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { fileTypeFromBuffer } from 'file-type';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  AccionSolicitud,
  EstadoSolicitud,
  Solicitud,
  TipoCarga,
} from './entities/solicitud.entity';
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

export interface ArchivosSolicitud {
  archivoNacimiento?: Express.Multer.File[];
  archivoMatrimonio?: Express.Multer.File[];
  archivoEstudios?: Express.Multer.File[];
}

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? 'uploads';

const SLOTS: Array<{
  campo: keyof ArchivosSolicitud;
  tipoDocumento: TipoDocumento;
}> = [
  { campo: 'archivoNacimiento', tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO },
  { campo: 'archivoMatrimonio', tipoDocumento: TipoDocumento.CERTIFICADO_MATRIMONIO },
  { campo: 'archivoEstudios', tipoDocumento: TipoDocumento.CERTIFICADO_ESTUDIOS },
];

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
    await this.validarDatosDeNegocio(dto, funcionario);
    const archivosValidados = await this.validarArchivos(archivos);

    const solicitud = this.solicitudesRepository.create({
      funcionarioId: funcionario.id,
      rutFuncionario: normalizarRut(funcionario.rut),
      tipoCarga: dto.tipoCarga,
      accion: dto.accion,
      nombreCarga: dto.nombreCarga,
      rutCarga: dto.rutCarga ? normalizarRut(dto.rutCarga) : null,
      fechaNacimientoCarga: dto.fechaNacimientoCarga,
      parentesco: dto.parentesco ?? null,
      observacionesFuncionario: dto.observacionesFuncionario ?? null,
      estado: EstadoSolicitud.PENDIENTE,
    });
    const guardada = await this.solicitudesRepository.save(solicitud);

    const carpeta = path.join(UPLOADS_DIR, 'solicitudes', guardada.id);
    await fs.mkdir(carpeta, { recursive: true });

    for (const { file, tipoDocumento } of archivosValidados) {
      const nombreArchivo = generarNombreArchivo(file.originalname);
      const rutaCompleta = path.join(carpeta, nombreArchivo);
      await fs.writeFile(rutaCompleta, file.buffer);

      await this.archivosRepository.save(
        this.archivosRepository.create({
          solicitudId: guardada.id,
          tipoDocumento,
          nombreOriginal: file.originalname,
          rutaArchivo: rutaCompleta,
          mimeType: file.mimetype,
          tamanioBytes: file.size,
        }),
      );
    }

    return this.obtenerParaUsuario(guardada.id, funcionario);
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

  private async validarDatosDeNegocio(
    dto: CreateSolicitudDto,
    funcionario: Usuario,
  ) {
    if (dto.rutCarga && normalizarRut(dto.rutCarga) === normalizarRut(funcionario.rut)) {
      throw new BadRequestException(
        'El RUT de la carga no puede ser igual al del funcionario',
      );
    }

    if (new Date(dto.fechaNacimientoCarga).getTime() > Date.now()) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser futura',
      );
    }

    const duplicada = await this.solicitudesRepository.findOne({
      where: {
        funcionarioId: funcionario.id,
        tipoCarga: dto.tipoCarga as TipoCarga,
        nombreCarga: dto.nombreCarga,
        estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.OBSERVADO]),
      },
    });
    if (duplicada) {
      throw new BadRequestException(
        'Ya existe una solicitud pendiente u observada para esta misma carga familiar',
      );
    }

    if (
      dto.accion === AccionSolicitud.BAJA &&
      !dto.observacionesFuncionario
    ) {
      throw new BadRequestException(
        'Debes indicar el motivo en las observaciones al dar de baja una carga',
      );
    }
  }

  private async validarArchivos(archivos: ArchivosSolicitud) {
    const resultado: Array<{
      file: Express.Multer.File;
      tipoDocumento: TipoDocumento;
    }> = [];

    for (const { campo, tipoDocumento } of SLOTS) {
      const files = archivos[campo];
      if (!files || files.length !== 1) {
        throw new BadRequestException(
          `Debes adjuntar exactamente un archivo para "${tipoDocumento}"`,
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
}
