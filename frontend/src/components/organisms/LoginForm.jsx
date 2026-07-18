import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
    } catch {
      setError('Email o contraseña incorrectos')
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
