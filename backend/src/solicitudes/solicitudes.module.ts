import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { ArchivoAdjunto } from './entities/archivo-adjunto.entity';
import { Comentario } from './entities/comentario.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud, ArchivoAdjunto, Comentario])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
})
export class SolicitudesModule {}
