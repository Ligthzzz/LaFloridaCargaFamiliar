import { Link } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { Button } from '../components/atoms/Button'
import { SolicitudesTable } from '../components/organisms/SolicitudesTable'
import { useSolicitudes } from '../hooks/useSolicitudes'

export function FuncionarioHomePage() {
  const { solicitudes, cargando, error } = useSolicitudes()

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Mis cargas familiares</h1>
        <Link to="/solicitudes/nueva">
          <Button>Actualizar carga familiar</Button>
        </Link>
      </div>

      {cargando && <p>Cargando…</p>}
      {error && <p className="error-text">{error}</p>}
      {!cargando && !error && (
        <SolicitudesTable
          solicitudes={solicitudes}
          detalleBasePath="/solicitudes"
          mostrarFuncionario={false}
        />
      )}
    </AppLayout>
  )
}
