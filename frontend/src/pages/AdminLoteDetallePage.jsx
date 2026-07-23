import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { LoteResumen } from '../components/organisms/LoteResumen'
import { Spinner } from '../components/atoms/Spinner'
import { useLote } from '../hooks/useLote'
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

export function AdminLoteDetallePage() {
  const { loteId } = useParams()
  const { solicitudes, cargando, error, recargar } = useLote(loteId)

  async function handleAccion(solicitudId, accion, comentario) {
    await ACCIONES[accion](solicitudId, comentario || undefined)
    recargar()
  }

  return (
    <AppLayout>
      {cargando && <Spinner />}
      {error && <p className="error-text">{error}</p>}
      {!cargando && !error && (
        <LoteResumen solicitudes={solicitudes} esAdmin onAccion={handleAccion} />
      )}
    </AppLayout>
  )
}
