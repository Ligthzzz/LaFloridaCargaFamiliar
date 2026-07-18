import { useCallback, useEffect, useState } from 'react'
import { listarSolicitudes } from '../api/solicitudes'

export function useSolicitudes(estado) {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    setCargando(true)
    setError('')
    listarSolicitudes(estado)
      .then(setSolicitudes)
      .catch(() => setError('No se pudieron cargar las solicitudes'))
      .finally(() => setCargando(false))
  }, [estado])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { solicitudes, cargando, error, recargar }
}
