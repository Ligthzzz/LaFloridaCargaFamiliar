import { useCallback, useEffect, useState } from 'react'
import { obtenerSolicitudesPorLote } from '../api/solicitudes'

export function useLote(loteId) {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    setCargando(true)
    setError('')
    obtenerSolicitudesPorLote(loteId)
      .then(setSolicitudes)
      .catch(() => setError('No se pudo cargar este envío'))
      .finally(() => setCargando(false))
  }, [loteId])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { solicitudes, cargando, error, recargar }
}
