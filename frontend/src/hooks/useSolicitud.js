import { useCallback, useEffect, useState } from 'react'
import { obtenerSolicitud } from '../api/solicitudes'

export function useSolicitud(id) {
  const [solicitud, setSolicitud] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    setCargando(true)
    setError('')
    obtenerSolicitud(id)
      .then(setSolicitud)
      .catch(() => setError('No se pudo cargar la solicitud'))
      .finally(() => setCargando(false))
  }, [id])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { solicitud, cargando, error, recargar }
}
