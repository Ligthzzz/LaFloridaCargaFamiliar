import { TipoCarga } from './entities/solicitud.entity';
import { TipoDocumento } from './entities/archivo-adjunto.entity';

export interface RequisitoDocumento {
  campo: string;
  tipoDocumento: TipoDocumento;
}

export const DOCUMENTOS_REQUERIDOS: Record<TipoCarga, RequisitoDocumento[]> = {
  [TipoCarga.CONYUGE]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertMatrimonio',
      tipoDocumento: TipoDocumento.CERTIFICADO_MATRIMONIO,
    },
    {
      campo: 'archivoDeclaracionJurada',
      tipoDocumento: TipoDocumento.DECLARACION_JURADA,
    },
  ],
  [TipoCarga.CONYUGE_INVALIDO]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertMatrimonio',
      tipoDocumento: TipoDocumento.CERTIFICADO_MATRIMONIO,
    },
    {
      campo: 'archivoCertInvalidez',
      tipoDocumento: TipoDocumento.CERTIFICADO_INVALIDEZ,
    },
    {
      campo: 'archivoDeclaracionJurada',
      tipoDocumento: TipoDocumento.DECLARACION_JURADA,
    },
  ],
  [TipoCarga.HIJO]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertNacimiento',
      tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO,
    },
  ],
  [TipoCarga.HIJO_MAYOR_18]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertNacimiento',
      tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO,
    },
    {
      campo: 'archivoCertEstudios',
      tipoDocumento: TipoDocumento.CERTIFICADO_ESTUDIOS,
    },
    {
      campo: 'archivoDeclaracionJurada',
      tipoDocumento: TipoDocumento.DECLARACION_JURADA,
    },
  ],
  [TipoCarga.NIETO_BISNIETO]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertNacimiento',
      tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO,
    },
    {
      campo: 'archivoCertParentesco',
      tipoDocumento: TipoDocumento.CERTIFICADO_PARENTESCO,
    },
    {
      campo: 'archivoCertOrfandad',
      tipoDocumento: TipoDocumento.CERTIFICADO_ORFANDAD_ABANDONO,
    },
  ],
  [TipoCarga.ASCENDIENTE_MAYOR_65]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertNacimiento',
      tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO,
    },
    {
      campo: 'archivoCertParentesco',
      tipoDocumento: TipoDocumento.CERTIFICADO_PARENTESCO,
    },
    {
      campo: 'archivoDeclaracionJurada',
      tipoDocumento: TipoDocumento.DECLARACION_JURADA,
    },
  ],
  [TipoCarga.MADRE_VIUDA]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertNacimiento',
      tipoDocumento: TipoDocumento.CERTIFICADO_NACIMIENTO,
    },
    {
      campo: 'archivoCertMatrimonioPadres',
      tipoDocumento: TipoDocumento.CERTIFICADO_MATRIMONIO_PADRES,
    },
    {
      campo: 'archivoCertDefuncion',
      tipoDocumento: TipoDocumento.CERTIFICADO_DEFUNCION,
    },
    {
      campo: 'archivoDeclaracionJurada',
      tipoDocumento: TipoDocumento.DECLARACION_JURADA,
    },
  ],
  [TipoCarga.CAUSANTE_INVALIDO]: [
    {
      campo: 'archivoSolicitud',
      tipoDocumento: TipoDocumento.SOLICITUD_ASIGNACION_FAMILIAR,
    },
    {
      campo: 'archivoCertInvalidez',
      tipoDocumento: TipoDocumento.CERTIFICADO_INVALIDEZ,
    },
  ],
};

export const TODOS_LOS_CAMPOS_ARCHIVO = Array.from(
  new Set(
    Object.values(DOCUMENTOS_REQUERIDOS).flatMap((requisitos) =>
      requisitos.map((r) => r.campo),
    ),
  ),
);
