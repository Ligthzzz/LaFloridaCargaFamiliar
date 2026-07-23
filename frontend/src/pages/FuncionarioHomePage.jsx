import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { Button } from '../components/atoms/Button'
import { SolicitudesTable } from '../components/organisms/SolicitudesTable'
import { useSolicitudes } from '../hooks/useSolicitudes'

export function FuncionarioHomePage() {
  const { solicitudes, cargando, error } = useSolicitudes()
  const location = useLocation()
  const cargasCreadas = location.state?.cargasCreadas
  const [mostrarAviso, setMostrarAviso] = useState(Boolean(cargasCreadas))

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Mis cargas familiares</h1>
        <Link to="/solicitudes/nueva">
          <Button>Agregar nueva carga familiar</Button>
        </Link>
      </div>

      {mostrarAviso && cargasCreadas > 0 && (
        <div className="aviso-exito">
          <p>
            {cargasCreadas > 1
              ? `Se agregaron ${cargasCreadas} cargas familiares correctamente. Quedaron pendientes de revisión.`
              : 'Se agregó la carga familiar correctamente. Quedó pendiente de revisión.'}
          </p>
          <button
            type="button"
            className="link-button"
            onClick={() => setMostrarAviso(false)}
          >
            Cerrar
          </button>
        </div>
      )}

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
