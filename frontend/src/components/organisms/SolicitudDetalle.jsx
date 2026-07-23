import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'
import { ComentariosThread } from './ComentariosThread'
import { descargarArchivo } from '../../api/solicitudes'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'
import { extraerMensajesError } from '../../utils/apiError'
import { TIPOS_CARGA } from '../../utils/documentosRequeridos'

const TIPO_DOCUMENTO_LABEL = {
  SOLICITUD_ASIGNACION_FAMILIAR: 'Solicitud de Asignación Familiar',
  DECLARACION_JURADA: 'Declaración jurada simple',
  CERTIFICADO_NACIMIENTO: 'Certificado de nacimiento',
  CERTIFICADO_MATRIMONIO: 'Certificado de matrimonio',
  CERTIFICADO_MATRIMONIO_PADRES: 'Certificado de matrimonio de los padres',
  CERTIFICADO_ESTUDIOS: 'Certificado de estudios',
  CERTIFICADO_INVALIDEZ: 'Certificado de invalidez (COMPIN)',
  CERTIFICADO_PARENTESCO: 'Certificado de parentesco',
  CERTIFICADO_ORFANDAD_ABANDONO: 'Certificado de orfandad/abandono',
  CERTIFICADO_DEFUNCION: 'Certificado de defunción',
  OTRO: 'Otro',
}

const TIPO_CARGA_LABEL = Object.fromEntries(
  TIPOS_CARGA.map((tipo) => [tipo.value, tipo.label]),
)

export function SolicitudDetalle({ solicitud, esAdmin = false, onAccion }) {
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorAccion, setErrorAccion] = useState([])

  async function ejecutarAccion(accion) {
    setEnviando(true)
    setErrorAccion([])
    try {
      await onAccion(accion, comentario)
      setComentario('')
    } catch (error) {
      setErrorAccion(
        extraerMensajesError(error, 'No se pudo completar la acción'),
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card">
      <div className="page-header">
        <h1>{TIPO_CARGA_LABEL[solicitud.tipoCarga] ?? solicitud.tipoCarga}</h1>
        <div className="detalle-badges">
          <Badge tone={ESTADO_TONE[solicitud.estado]}>
            {ESTADO_LABEL[solicitud.estado]}
          </Badge>
          {solicitud.estado === 'PENDIENTE' && solicitud.revisadoPorId && (
            <Badge tone="info">Corregida tras observación</Badge>
          )}
        </div>
      </div>

      {!esAdmin && solicitud.estado === 'OBSERVADO' && (
        <Link to={`/solicitudes/${solicitud.id}/editar`}>
          <Button>Corregir y reenviar</Button>
        </Link>
      )}

      <dl className="detalle-grid">
        <dt>RUT funcionario</dt>
        <dd>{solicitud.rutFuncionario}</dd>
        <dt>Parentesco con el beneficiario</dt>
        <dd>{TIPO_CARGA_LABEL[solicitud.tipoCarga] ?? solicitud.tipoCarga}</dd>
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
          <ErrorText>{errorAccion}</ErrorText>
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
