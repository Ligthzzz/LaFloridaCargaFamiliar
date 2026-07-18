import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { SolicitudDetalle } from '../components/organisms/SolicitudDetalle'
import { Spinner } from '../components/atoms/Spinner'
import { useSolicitud } from '../hooks/useSolicitud'
import {
  aprobarSolicitud,
  observarSolicitud,
  rechazarSolicitud,
  agregarComentario,
} from '../api/solicitudes'

const ACCIONES = {
  aprobar: aprobarSolicitud,
  rechazar: rechazarSolicitud,
  observar: observarSolicitud,
  comentar: (id, comentario) => agregarComentario(id, comentario),
}

export function AdminSolicitudDetailPage() {
  const { id } = useParams()
  const { solicitud, cargando, error, recargar } = useSolicitud(id)

  async function handleAccion(accion, comentario) {
    await ACCIONES[accion](id, comentario || undefined)
    recargar()
  }

  return (
    <AppLayout>
      {cargando && <Spinner />}
      {error && <p className="error-text">{error}</p>}
      {solicitud && (
        <SolicitudDetalle
          solicitud={solicitud}
          esAdmin
          onAccion={handleAccion}
        />
      )}
    </AppLayout>
  )
}
