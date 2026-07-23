import { useState } from 'react'
import { Badge } from '../atoms/Badge'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'
import { TIPO_CARGA_LABEL } from '../../utils/documentosRequeridos'
import { SolicitudDetalle } from './SolicitudDetalle'

const ESTADOS_RESUELTOS = ['APROBADO', 'RECHAZADO']

export function SolicitudDetalleColapsable({
  solicitud,
  indice,
  total,
  esAdmin = false,
  onAccion,
}) {
  const [abierto, setAbierto] = useState(
    !ESTADOS_RESUELTOS.includes(solicitud.estado),
  )

  return (
    <div className="carga-colapsable">
      <button
        type="button"
        className="carga-colapsable-header"
        onClick={() => setAbierto((anterior) => !anterior)}
      >
        <span className="carga-colapsable-titulo">
          Carga {indice} de {total} · {TIPO_CARGA_LABEL[solicitud.tipoCarga] ?? solicitud.tipoCarga}
        </span>
        <Badge tone={ESTADO_TONE[solicitud.estado]}>
          {ESTADO_LABEL[solicitud.estado]}
        </Badge>
        <span className="carga-colapsable-chevron">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <SolicitudDetalle
          solicitud={solicitud}
          esAdmin={esAdmin}
          onAccion={onAccion}
          mostrarEncabezado={false}
        />
      )}
    </div>
  )
}
