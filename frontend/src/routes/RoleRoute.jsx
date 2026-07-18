import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RoleRoute({ rol }) {
  const { usuario } = useAuth()

  if (usuario.rol !== rol) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
