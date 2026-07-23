import { Badge } from '../atoms/Badge'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'
import { SolicitudDetalleColapsable } from './SolicitudDetalleColapsable'

function resumenEstados(solicitudes) {
  const conteos = {}
  solicitudes.forEach((solicitud) => {
    conteos[solicitud.estado] = (conteos[solicitud.estado] ?? 0) + 1
  })
  return Object.entries(conteos)
}

export function LoteResumen({ solicitudes, esAdmin = false, onAccion }) {
  if (solicitudes.length === 0) return null

  const fechaMasAntigua = new Date(
    Math.min(...solicitudes.map((s) => new Date(s.createdAt).getTime())),
  )
  const funcionario = solicitudes[0].funcionario

  return (
    <div>
      <div className="card lote-resumen">
        <h1>Envío conjunto{funcionario ? ` — ${funcionario.nombre}` : ''}</h1>
        <p>{fechaMasAntigua.toLocaleDateString('es-CL')}</p>
        <div className="detalle-badges">
          <span>{solicitudes.length} cargas familiares</span>
          {resumenEstados(solicitudes).map(([estado, cantidad]) => (
            <Badge key={estado} tone={ESTADO_TONE[estado]}>
              {cantidad} {ESTADO_LABEL[estado]}
            </Badge>
          ))}
        </div>
      </div>

      {solicitudes.map((solicitud, indice) => (
        <SolicitudDetalleColapsable
          key={solicitud.id}
          solicitud={solicitud}
          indice={indice + 1}
          total={solicitudes.length}
          esAdmin={esAdmin}
          onAccion={onAccion ? (accion, comentario) => onAccion(solicitud.id, accion, comentario) : undefined}
        />
      ))}
    </div>
  )
}
