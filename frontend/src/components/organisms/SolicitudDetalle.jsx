import { useState } from 'react'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { ComentariosThread } from './ComentariosThread'
import { descargarArchivo } from '../../api/solicitudes'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'

const TIPO_DOCUMENTO_LABEL = {
  CERTIFICADO_NACIMIENTO: 'Certificado de nacimiento',
  CERTIFICADO_MATRIMONIO: 'Certificado de matrimonio',
  CERTIFICADO_ESTUDIOS: 'Certificado de estudios',
  OTRO: 'Otro',
}

export function SolicitudDetalle({ solicitud, esAdmin = false, onAccion }) {
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function ejecutarAccion(accion) {
    setEnviando(true)
    try {
      await onAccion(accion, comentario)
      setComentario('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card">
      <div className="page-header">
        <h1>{solicitud.nombreCarga}</h1>
        <Badge tone={ESTADO_TONE[solicitud.estado]}>
          {ESTADO_LABEL[solicitud.estado]}
        </Badge>
      </div>

      <dl className="detalle-grid">
        <dt>RUT funcionario</dt>
        <dd>{solicitud.rutFuncionario}</dd>
        <dt>Tipo de carga</dt>
        <dd>{solicitud.tipoCarga}</dd>
        <dt>Acción</dt>
        <dd>{solicitud.accion}</dd>
        <dt>RUT carga</dt>
        <dd>{solicitud.rutCarga ?? '—'}</dd>
        <dt>Fecha de nacimiento</dt>
        <dd>{solicitud.fechaNacimientoCarga}</dd>
        <dt>Parentesco</dt>
        <dd>{solicitud.parentesco ?? '—'}</dd>
        <dt>Observaciones del funcionario</dt>
        <dd>{solicitud.observacionesFuncionario ?? '—'}</dd>
      </dl>

      <h2>Documentos</h2>
      <ul className="lista-archivos">
        {solicitud.archivos?.map((archivo) => (
          <li key={archivo.id}>
            <button
              type="button"
              className="link-button"
              onClick={() =>
                descargarArchivo(
                  solicitud.id,
                  archivo.id,
                  archivo.nombreOriginal,
                )
              }
            >
              {TIPO_DOCUMENTO_LABEL[archivo.tipoDocumento]} —{' '}
              {archivo.nombreOriginal}
            </button>
          </li>
        ))}
      </ul>

      <h2>Comentarios</h2>
      <ComentariosThread comentarios={solicitud.comentarios} />

      {esAdmin && (
        <div className="acciones-admin">
          <textarea
            className="textarea"
            rows={2}
            placeholder="Agregar un comentario (obligatorio para observar)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <div className="acciones-admin-botones">
            <Button
              variant="success"
              disabled={enviando}
              onClick={() => ejecutarAccion('aprobar')}
            >
              Aprobar
            </Button>
            <Button
              variant="danger"
              disabled={enviando}
              onClick={() => ejecutarAccion('rechazar')}
            >
              Rechazar
            </Button>
            <Button
              variant="secondary"
              disabled={enviando}
              onClick={() => ejecutarAccion('observar')}
            >
              Observar
            </Button>
            <Button
              variant="secondary"
              disabled={enviando || !comentario}
              onClick={() => ejecutarAccion('comentar')}
            >
              Solo comentar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
