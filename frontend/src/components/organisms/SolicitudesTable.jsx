import { Link } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'
import { TIPOS_CARGA } from '../../utils/documentosRequeridos'
import { ACCION_LABEL } from '../../utils/accion'

const TIPO_CARGA_LABEL = Object.fromEntries(
  TIPOS_CARGA.map((tipo) => [tipo.value, tipo.label]),
)

export function SolicitudesTable({
  solicitudes,
  detalleBasePath,
  mostrarFuncionario = true,
}) {
  if (solicitudes.length === 0) {
    return <p>No hay solicitudes para mostrar.</p>
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {mostrarFuncionario && <th>Funcionario</th>}
          <th>RUT</th>
          <th>Tipo de carga</th>
          <th>Acción</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {solicitudes.map((solicitud) => (
          <tr key={solicitud.id}>
            {mostrarFuncionario && <td>{solicitud.funcionario?.nombre}</td>}
            <td>{solicitud.rutFuncionario}</td>
            <td>{TIPO_CARGA_LABEL[solicitud.tipoCarga] ?? solicitud.tipoCarga}</td>
            <td>{ACCION_LABEL[solicitud.accion] ?? solicitud.accion}</td>
            <td>{new Date(solicitud.createdAt).toLocaleDateString('es-CL')}</td>
            <td>
              <div className="detalle-badges">
                <Badge tone={ESTADO_TONE[solicitud.estado]}>
                  {ESTADO_LABEL[solicitud.estado]}
                </Badge>
                {solicitud.estado === 'PENDIENTE' && solicitud.revisadoPorId && (
                  <Badge tone="info">Corregida</Badge>
                )}
              </div>
            </td>
            <td>
              <Link to={`${detalleBasePath}/${solicitud.id}`}>Ver</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
