import { Link } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { ESTADO_LABEL, ESTADO_TONE } from '../../utils/estado'
import { TIPO_CARGA_LABEL } from '../../utils/documentosRequeridos'

function agruparSolicitudes(solicitudes) {
  const porLote = new Map()
  solicitudes.forEach((solicitud) => {
    if (!solicitud.loteId) return
    if (!porLote.has(solicitud.loteId)) porLote.set(solicitud.loteId, [])
    porLote.get(solicitud.loteId).push(solicitud)
  })

  const procesados = new Set()
  const filas = []
  solicitudes.forEach((solicitud) => {
    if (procesados.has(solicitud.id)) return
    const grupo = solicitud.loteId ? porLote.get(solicitud.loteId) : null
    if (grupo && grupo.length > 1) {
      grupo.forEach((item) => procesados.add(item.id))
      filas.push({ tipo: 'lote', loteId: solicitud.loteId, items: grupo })
    } else {
      procesados.add(solicitud.id)
      filas.push({ tipo: 'individual', solicitud })
    }
  })
  return filas
}

function resumenEstados(items) {
  const conteos = {}
  items.forEach((item) => {
    conteos[item.estado] = (conteos[item.estado] ?? 0) + 1
  })
  return Object.entries(conteos)
}

export function SolicitudesTable({
  solicitudes,
  detalleBasePath,
  loteBasePath,
  mostrarFuncionario = true,
}) {
  if (solicitudes.length === 0) {
    return <p>No hay solicitudes para mostrar.</p>
  }

  const filas = agruparSolicitudes(solicitudes)

  return (
    <table className="table">
      <thead>
        <tr>
          {mostrarFuncionario && <th>Funcionario</th>}
          <th>RUT</th>
          <th>Tipo de carga</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => {
          if (fila.tipo === 'individual') {
            const solicitud = fila.solicitud
            return (
              <tr key={solicitud.id}>
                {mostrarFuncionario && <td>{solicitud.funcionario?.nombre}</td>}
                <td>{solicitud.rutFuncionario}</td>
                <td>{TIPO_CARGA_LABEL[solicitud.tipoCarga] ?? solicitud.tipoCarga}</td>
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
            )
          }

          const { loteId, items } = fila
          const fechaMasAntigua = new Date(
            Math.min(...items.map((item) => new Date(item.createdAt).getTime())),
          )
          return (
            <tr key={loteId} className="fila-lote">
              {mostrarFuncionario && <td>{items[0].funcionario?.nombre}</td>}
              <td>{items[0].rutFuncionario}</td>
              <td>{items.length} cargas familiares</td>
              <td>{fechaMasAntigua.toLocaleDateString('es-CL')}</td>
              <td>
                <div className="detalle-badges">
                  {resumenEstados(items).map(([estado, cantidad]) => (
                    <Badge key={estado} tone={ESTADO_TONE[estado]}>
                      {cantidad} {ESTADO_LABEL[estado]}
                    </Badge>
                  ))}
                </div>
              </td>
              <td>
                <Link to={`${loteBasePath}/${loteId}`}>Ver</Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
