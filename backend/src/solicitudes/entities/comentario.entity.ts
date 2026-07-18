import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Solicitud } from './solicitud.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.comentarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Solicitud;

  @Column({ name: 'solicitud_id' })
  solicitudId: string;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario;

  @Column({ name: 'autor_id' })
  autorId: string;

  @Column({ type: 'text' })
  mensaje: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
