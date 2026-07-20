import { Navigate, useParams } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { SolicitudForm } from '../components/organisms/SolicitudForm'
import { Spinner } from '../components/atoms/Spinner'
import { useSolicitud } from '../hooks/useSolicitud'

export function SolicitudEditarPage() {
  const { id } = useParams()
  const { solicitud, cargando, error } = useSolicitud(id)

  return (
    <AppLayout>
      {cargando && <Spinner />}
      {error && <p className="error-text">{error}</p>}
      {solicitud && solicitud.estado !== 'OBSERVADO' && (
        <Navigate to={`/solicitudes/${id}`} replace />
      )}
      {solicitud && solicitud.estado === 'OBSERVADO' && (
        <SolicitudForm solicitudExistente={solicitud} />
      )}
    </AppLayout>
  )
}
