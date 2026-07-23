export const TIPOS_CARGA = [
  { value: 'CONYUGE', label: 'Cónyuge' },
  { value: 'CONYUGE_INVALIDO', label: 'Cónyuge inválido/a' },
  { value: 'HIJO', label: 'Hijo/a' },
  { value: 'HIJO_MAYOR_18', label: 'Hijo/a mayor de 18 años (estudiante)' },
  { value: 'NIETO_BISNIETO', label: 'Nieto/a o bisnieto/a' },
  { value: 'ASCENDIENTE_MAYOR_65', label: 'Ascendiente mayor de 65 años' },
  { value: 'MADRE_VIUDA', label: 'Madre viuda' },
  { value: 'CAUSANTE_INVALIDO', label: 'Causante inválido/a' },
  { value: 'OTRO', label: 'Otro' },
]

export const PLANTILLA_SOLICITUD_URL = '/formulario-solicitud-asignacion-familiar.pdf'
export const PLANTILLA_DECLARACION_JURADA_URL = '/formulario-declaracion-jurada.pdf'

const LABELS_DOCUMENTO = {
  archivoSolicitud: 'Solicitud de Asignación Familiar (107 SCF)',
  archivoCertMatrimonio: 'Certificado de matrimonio',
  archivoCertInvalidez: 'Certificado de invalidez (COMPIN)',
  archivoDeclaracionJurada: 'Declaración jurada simple',
  archivoCertNacimiento: 'Certificado de nacimiento',
  archivoCertEstudios: 'Certificado de estudios',
  archivoCertParentesco: 'Certificado de parentesco',
  archivoCertOrfandad: 'Certificado de orfandad/abandono',
  archivoCertMatrimonioPadres: 'Certificado de matrimonio de los padres',
  archivoCertDefuncion: 'Certificado de defunción',
  archivoOtro: 'Otro documento',
}

const PLANTILLA_POR_CAMPO = {
  archivoSolicitud: PLANTILLA_SOLICITUD_URL,
  archivoDeclaracionJurada: PLANTILLA_DECLARACION_JURADA_URL,
}

export const DOCUMENTOS_REQUERIDOS = {
  CONYUGE: ['archivoSolicitud', 'archivoCertMatrimonio', 'archivoDeclaracionJurada'],
  CONYUGE_INVALIDO: [
    'archivoSolicitud',
    'archivoCertMatrimonio',
    'archivoCertInvalidez',
    'archivoDeclaracionJurada',
  ],
  HIJO: ['archivoSolicitud', 'archivoCertNacimiento'],
  HIJO_MAYOR_18: [
    'archivoSolicitud',
    'archivoCertNacimiento',
    'archivoCertEstudios',
    'archivoDeclaracionJurada',
  ],
  NIETO_BISNIETO: [
    'archivoSolicitud',
    'archivoCertNacimiento',
    'archivoCertParentesco',
    'archivoCertOrfandad',
  ],
  ASCENDIENTE_MAYOR_65: [
    'archivoSolicitud',
    'archivoCertNacimiento',
    'archivoCertParentesco',
    'archivoDeclaracionJurada',
  ],
  MADRE_VIUDA: [
    'archivoSolicitud',
    'archivoCertNacimiento',
    'archivoCertMatrimonioPadres',
    'archivoCertDefuncion',
    'archivoDeclaracionJurada',
  ],
  CAUSANTE_INVALIDO: ['archivoSolicitud', 'archivoCertInvalidez'],
  OTRO: ['archivoSolicitud', 'archivoOtro'],
}

export function camposArchivoParaTipoCarga(tipoCarga) {
  return (DOCUMENTOS_REQUERIDOS[tipoCarga] ?? []).map((campo) => ({
    campo,
    label: LABELS_DOCUMENTO[campo],
    plantillaUrl: PLANTILLA_POR_CAMPO[campo],
  }))
}
