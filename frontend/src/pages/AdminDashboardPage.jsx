import { useState } from 'react'
import { AppLayout } from '../components/templates/AppLayout'
import { SolicitudesTable } from '../components/organisms/SolicitudesTable'
import { Select } from '../components/atoms/Select'
import { useSolicitudes } from '../hooks/useSolicitudes'

const ESTADOS = ['', 'PENDIENTE', 'OBSERVADO', 'APROBADO', 'RECHAZADO']

export function AdminDashboardPage() {
  const [estado, setEstado] = useState('')
  const { solicitudes, cargando, error } = useSolicitudes(estado || undefined)

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Solicitudes de cargas familiares</h1>
        <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS.map((valor) => (
            <option key={valor} value={valor}>
              {valor || 'Todos los estados'}
            </option>
          ))}
        </Select>
      </div>

      {cargando && <p>Cargando…</p>}
      {error && <p className="error-text">{error}</p>}
      {!cargando && !error && (
        <SolicitudesTable
          solicitudes={solicitudes}
          detalleBasePath="/admin/solicitudes"
          loteBasePath="/admin/solicitudes/lote"
        />
      )}
    </AppLayout>
  )
}
