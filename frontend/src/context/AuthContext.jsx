import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginRequest, obtenerPerfil } from '../api/auth'
import { guardarToken, limpiarToken, obtenerToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = obtenerToken()
    if (!token) {
      setCargando(false)
      return
    }
    obtenerPerfil()
      .then(setUsuario)
      .catch(() => limpiarToken())
      .finally(() => setCargando(false))
  }, [])

  async function login(email, password) {
    const { accessToken, usuario: usuarioLogueado } = await loginRequest(
      email,
      password,
    )
    guardarToken(accessToken)
    setUsuario(usuarioLogueado)
    return usuarioLogueado
  }

  function logout() {
    limpiarToken()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
