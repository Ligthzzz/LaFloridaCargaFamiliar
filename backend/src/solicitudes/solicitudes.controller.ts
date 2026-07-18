import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { SolicitudesService } from './solicitudes.service';
import type { ArchivosSolicitud } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoSolicitud } from './entities/solicitud.entity';
import { TAMANIO_MAXIMO_BYTES } from '../common/utils/archivo.util';

const ARCHIVOS_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'archivoNacimiento', maxCount: 1 },
    { name: 'archivoMatrimonio', maxCount: 1 },
    { name: 'archivoEstudios', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    limits: { fileSize: TAMANIO_MAXIMO_BYTES },
  },
);

@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @Roles(RolUsuario.FUNCIONARIO)
  @UseInterceptors(ARCHIVOS_INTERCEPTOR)
  crear(
    @Body() dto: CreateSolicitudDto,
    @UploadedFiles() archivos: ArchivosSolicitud,
    @CurrentUser() usuario: Usuario,
  ) {
    return this.solicitudesService.crear(dto, archivos, usuario);
  }

  @Get()
  listar(
    @CurrentUser() usuario: Usuario,
    @Query('estado') estado?: EstadoSolicitud,
  ) {
    return this.solicitudesService.listar(usuario, estado);
  }

  @Get(':id')
  obtener(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.solicitudesService.obtenerParaUsuario(id, usuario);
  }

  @Get(':id/archivos/:archivoId')
  async descargarArchivo(
    @Param('id') id: string,
    @Param('archivoId') archivoId: string,
    @CurrentUser() usuario: Usuario,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo = await this.solicitudesService.obtenerArchivoParaUsuario(
      id,
      archivoId,
      usuario,
    );
    res.set({
      'Content-Type': archivo.mimeType,
      'Content-Disposition': `attachment; filename="${archivo.nombreOriginal}"`,
    });
    return new StreamableFile(createReadStream(archivo.rutaArchivo));
  }

  @Patch(':id/aprobar')
  @Roles(RolUsuario.ADMIN)
  aprobar(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() admin: Usuario,
  ) {
    return this.solicitudesService.aprobar(id, admin, dto.comentario);
  }

  @Patch(':id/rechazar')
  @Roles(RolUsuario.ADMIN)
  rechazar(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() admin: Usuario,
  ) {
    return this.solicitudesService.rechazar(id, admin, dto.comentario);
  }

  @Patch(':id/observar')
  @Roles(RolUsuario.ADMIN)
  observar(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() admin: Usuario,
  ) {
    return this.solicitudesService.observar(id, admin, dto.comentario);
  }

  @Post(':id/comentarios')
  @Roles(RolUsuario.ADMIN)
  agregarComentario(
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
    @CurrentUser() admin: Usuario,
  ) {
    return this.solicitudesService.agregarComentario(id, admin, dto.mensaje);
  }
}
