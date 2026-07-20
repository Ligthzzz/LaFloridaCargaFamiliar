import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../atoms/Button'

export function Navbar() {
  const { usuario, logout } = useAuth()

  return (
    <header className="navbar">
      <Link to={usuario?.rol === 'admin' ? '/admin' : '/'} className="navbar-brand">
        <img src="/logo-mdlf.png" alt="Municipalidad de La Florida" className="navbar-logo" />
      </Link>
      <div className="navbar-user">
        {usuario?.rol === 'admin' && (
          <Link to="/admin/usuarios">Usuarios</Link>
        )}
        <span>{usuario?.nombre}</span>
        <Button variant="secondary" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
