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
  CERTIFICADO_NACIMIENTO = 'CERTIFICADO_NACIMIENTO',
  CERTIFICADO_MATRIMONIO = 'CERTIFICADO_MATRIMONIO',
  CERTIFICADO_ESTUDIOS = 'CERTIFICADO_ESTUDIOS',
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
