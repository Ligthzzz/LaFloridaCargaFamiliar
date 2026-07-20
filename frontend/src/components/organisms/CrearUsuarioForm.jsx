import { useState } from 'react'
import { crearUsuario } from '../../api/usuarios'
import { formatearRutMientrasEscribe, validarEmail, validarRut } from '../../utils/rut'
import { extraerMensajesError } from '../../utils/apiError'
import { FormField } from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'

const INICIAL = { rut: '', nombre: '', email: '', password: '', rol: 'funcionario' }

export function CrearUsuarioForm() {
  const [form, setForm] = useState(INICIAL)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState([])
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  function actualizar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function handleCambioRut(e) {
    actualizar('rut', formatearRutMientrasEscribe(e.target.value))
    setErrores((anterior) => ({ ...anterior, rut: '' }))
  }

  function handleBlurRut() {
    if (form.rut && !validarRut(form.rut)) {
      setErrores((anterior) => ({ ...anterior, rut: 'El RUT ingresado no es válido' }))
    }
  }

  function handleCambioEmail(e) {
    actualizar('email', e.target.value)
    setErrores((anterior) => ({ ...anterior, email: '' }))
  }

  function handleBlurEmail() {
    if (form.email && !validarEmail(form.email)) {
      setErrores((anterior) => ({
        ...anterior,
        email: 'Ingresa un email válido (ejemplo: nombre@dominio.cl)',
      }))
    }
  }

  function validar() {
    const nuevosErrores = {}
    if (!validarRut(form.rut)) {
      nuevosErrores.rut = 'El RUT ingresado no es válido'
    }
    if (!validarEmail(form.email)) {
      nuevosErrores.email = 'Ingresa un email válido (ejemplo: nombre@dominio.cl)'
    }
    setErrores((anterior) => ({ ...anterior, ...nuevosErrores }))
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorGeneral([])
    setExito('')

    if (!validar()) return

    setEnviando(true)
    try {
      await crearUsuario(form)
      setExito(`Usuario ${form.email} creado correctamente`)
      setForm(INICIAL)
      setErrores({})
    } catch (err) {
      setErrorGeneral(extraerMensajesError(err, 'No se pudo crear el usuario'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Crear usuario</h1>

      <FormField id="rut" label="RUT" error={errores.rut}>
        <Input
          id="rut"
          required
          placeholder="12.345.678-9"
          value={form.rut}
          onChange={handleCambioRut}
          onBlur={handleBlurRut}
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

      <FormField id="email" label="Email" error={errores.email}>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={handleCambioEmail}
          onBlur={handleBlurEmail}
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

      <ErrorText>{errorGeneral}</ErrorText>
      {exito && <p>{exito}</p>}
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear usuario'}
      </Button>
    </form>
  )
}
