import { Link } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'

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
          <th>Nombre carga</th>
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
            <td>{solicitud.tipoCarga}</td>
            <td>{solicitud.nombreCarga}</td>
            <td>{new Date(solicitud.createdAt).toLocaleDateString('es-CL')}</td>
            <td>
              <Badge tone={ESTADO_TONE[solicitud.estado]}>
                {ESTADO_LABEL[solicitud.estado]}
              </Badge>
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
