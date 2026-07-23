import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/templates/AppLayout'
import { LoteResumen } from '../components/organisms/LoteResumen'
import { Spinner } from '../components/atoms/Spinner'
import { useLote } from '../hooks/useLote'

export function LoteDetallePage() {
  const { loteId } = useParams()
  const { solicitudes, cargando, error } = useLote(loteId)

  return (
    <AppLayout>
      {cargando && <Spinner />}
      {error && <p className="error-text">{error}</p>}
      {!cargando && !error && <LoteResumen solicitudes={solicitudes} />}
    </AppLayout>
  )
}
