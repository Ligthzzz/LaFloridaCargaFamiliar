import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { SolicitudDetalle } from '../components/organisms/SolicitudDetalle'
import { Spinner } from '../components/atoms/Spinner'
import { useSolicitud } from '../hooks/useSolicitud'

export function SolicitudDetailPage() {
  const { id } = useParams()
  const { solicitud, cargando, error } = useSolicitud(id)

  return (
    <AppLayout>
      {cargando && <Spinner />}
      {error && <p className="error-text">{error}</p>}
      {solicitud && <SolicitudDetalle solicitud={solicitud} />}
    </AppLayout>
  )
}
