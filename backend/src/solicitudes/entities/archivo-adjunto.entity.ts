import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';

export enum TipoDocumento {
  SOLICITUD_ASIGNACION_FAMILIAR = 'SOLICITUD_ASIGNACION_FAMILIAR',
  DECLARACION_JURADA = 'DECLARACION_JURADA',
  CERTIFICADO_NACIMIENTO = 'CERTIFICADO_NACIMIENTO',
  CERTIFICADO_MATRIMONIO = 'CERTIFICADO_MATRIMONIO',
  CERTIFICADO_MATRIMONIO_PADRES = 'CERTIFICADO_MATRIMONIO_PADRES',
  CERTIFICADO_ESTUDIOS = 'CERTIFICADO_ESTUDIOS',
  CERTIFICADO_INVALIDEZ = 'CERTIFICADO_INVALIDEZ',
  CERTIFICADO_PARENTESCO = 'CERTIFICADO_PARENTESCO',
  CERTIFICADO_ORFANDAD_ABANDONO = 'CERTIFICADO_ORFANDAD_ABANDONO',
  CERTIFICADO_DEFUNCION = 'CERTIFICADO_DEFUNCION',
  OTRO = 'OTRO',
}

@Entity('archivos_adjuntos')
export class ArchivoAdjunto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.archivos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Solicitud;

  @Column({ name: 'solicitud_id' })
  solicitudId: string;

  @Column({ type: 'enum', enum: TipoDocumento, name: 'tipo_documento' })
  tipoDocumento: TipoDocumento;

  @Column({ name: 'nombre_original' })
  nombreOriginal: string;

  @Column({ name: 'ruta_archivo' })
  rutaArchivo: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'tamanio_bytes' })
  tamanioBytes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
