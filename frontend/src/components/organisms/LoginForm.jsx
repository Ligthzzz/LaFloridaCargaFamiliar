import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { extraerMensajesError } from '../../utils/apiError'
import { FormField } from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const usuario = await login(email, password)
      navigate(usuario.rol === 'admin' ? '/admin' : '/', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const restantes = err.response?.headers?.['x-ratelimit-remaining']

      if (status === 429) {
        setError(
          'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentar.',
        )
      } else if (status === 401) {
        setError(
          restantes !== undefined
            ? `Email o contraseña incorrectos. Te quedan ${restantes} intentos antes del bloqueo temporal.`
            : 'Email o contraseña incorrectos',
        )
      } else if (err.response) {
        setError(extraerMensajesError(err, 'No se pudo iniciar sesión')[0])
      } else {
        setError(
          'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>
      <FormField id="email" label="Email">
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>
      <FormField id="password" label="Contraseña">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </Button>
    </form>
  )
}
