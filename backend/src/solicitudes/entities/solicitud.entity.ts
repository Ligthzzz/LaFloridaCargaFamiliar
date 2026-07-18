import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ArchivoAdjunto } from './archivo-adjunto.entity';
import { Comentario } from './comentario.entity';

export enum TipoCarga {
  HIJO = 'HIJO',
  CONYUGE = 'CONYUGE',
  PADRE_MADRE = 'PADRE_MADRE',
  OTRO = 'OTRO',
}

export enum AccionSolicitud {
  ALTA = 'ALTA',
  MODIFICACION = 'MODIFICACION',
  BAJA = 'BAJA',
}

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  OBSERVADO = 'OBSERVADO',
}

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'funcionario_id' })
  funcionario: Usuario;

  @Column({ name: 'funcionario_id' })
  funcionarioId: string;

  @Column({ name: 'rut_funcionario' })
  rutFuncionario: string;

  @Column({ type: 'enum', enum: TipoCarga, name: 'tipo_carga' })
  tipoCarga: TipoCarga;

  @Column({ type: 'enum', enum: AccionSolicitud })
  accion: AccionSolicitud;

  @Column({ name: 'nombre_carga' })
  nombreCarga: string;

  @Column({ type: 'varchar', name: 'rut_carga', nullable: true })
  rutCarga: string | null;

  @Column({ type: 'date', name: 'fecha_nacimiento_carga' })
  fechaNacimientoCarga: string;

  @Column({ type: 'varchar', nullable: true })
  parentesco: string | null;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  @Column({ type: 'text', name: 'observaciones_funcionario', nullable: true })
  observacionesFuncionario: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'revisado_por_id' })
  revisadoPor: Usuario | null;

  @Column({ type: 'varchar', name: 'revisado_por_id', nullable: true })
  revisadoPorId: string | null;

  @Column({ type: 'timestamp', name: 'revisado_at', nullable: true })
  revisadoAt: Date | null;

  @OneToMany(() => ArchivoAdjunto, (archivo) => archivo.solicitud, {
    cascade: true,
  })
  archivos: ArchivoAdjunto[];

  @OneToMany(() => Comentario, (comentario) => comentario.solicitud)
  comentarios: Comentario[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
