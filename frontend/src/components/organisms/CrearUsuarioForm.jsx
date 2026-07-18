import { useState } from 'react'
import { crearUsuario } from '../../api/usuarios'
import { validarRut } from '../../utils/rut'
import { FormField } from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'

const INICIAL = { rut: '', nombre: '', email: '', password: '', rol: 'funcionario' }

export function CrearUsuarioForm() {
  const [form, setForm] = useState(INICIAL)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  function actualizar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setExito('')

    if (!validarRut(form.rut)) {
      setError('El RUT ingresado no es válido')
      return
    }

    setEnviando(true)
    try {
      await crearUsuario(form)
      setExito(`Usuario ${form.email} creado correctamente`)
      setForm(INICIAL)
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'No se pudo crear el usuario',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Crear usuario</h1>

      <FormField id="rut" label="RUT">
        <Input
          id="rut"
          required
          value={form.rut}
          onChange={(e) => actualizar('rut', e.target.value)}
        />
      </FormField>

      <FormField id="nombre" label="Nombre completo">
        <Input
          id="nombre"
          required
          value={form.nombre}
          onChange={(e) => actualizar('nombre', e.target.value)}
        />
      </FormField>

      <FormField id="email" label="Email">
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => actualizar('email', e.target.value)}
        />
      </FormField>

      <FormField id="password" label="Contraseña">
        <Input
          id="password"
          type="password"
          required
          value={form.password}
          onChange={(e) => actualizar('password', e.target.value)}
        />
      </FormField>

      <FormField id="rol" label="Rol">
        <Select
          id="rol"
          value={form.rol}
          onChange={(e) => actualizar('rol', e.target.value)}
        >
          <option value="funcionario">Funcionario</option>
          <option value="admin">Admin</option>
        </Select>
      </FormField>

      {error && <ErrorText>{error}</ErrorText>}
      {exito && <p>{exito}</p>}
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear usuario'}
      </Button>
    </form>
  )
}
