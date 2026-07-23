import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { crearSolicitud, editarSolicitud } from '../../api/solicitudes'
import { formatearRut, formatearRutMientrasEscribe, validarRut } from '../../utils/rut'
import { extraerMensajesError } from '../../utils/apiError'
import { FormField } from '../molecules/FormField'
import { FileDropSlot } from '../molecules/FileDropSlot'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'

const TIPOS_CARGA = [
  { value: 'HIJO', label: 'Hijo/a' },
  { value: 'CONYUGE', label: 'Cónyuge' },
  { value: 'PADRE_MADRE', label: 'Padre/Madre' },
  { value: 'OTRO', label: 'Otro' },
]

const ACCIONES = [
  { value: 'ALTA', label: 'Agregar carga' },
  { value: 'MODIFICACION', label: 'Actualizar carga' },
  { value: 'BAJA', label: 'Eliminar carga' },
]

const ARCHIVOS_INICIALES = {
  archivoNacimiento: null,
  archivoMatrimonio: null,
  archivoEstudios: null,
}

export function SolicitudForm({ solicitudExistente }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const editando = Boolean(solicitudExistente)

  const [form, setForm] = useState(
    solicitudExistente
      ? {
          tipoCarga: solicitudExistente.tipoCarga,
          accion: solicitudExistente.accion,
          nombreCarga: solicitudExistente.nombreCarga,
          rutCarga: solicitudExistente.rutCarga
            ? formatearRut(solicitudExistente.rutCarga)
            : '',
          fechaNacimientoCarga: solicitudExistente.fechaNacimientoCarga,
          parentesco: solicitudExistente.parentesco ?? '',
          observacionesFuncionario:
            solicitudExistente.observacionesFuncionario ?? '',
        }
      : {
          tipoCarga: 'HIJO',
          accion: 'ALTA',
          nombreCarga: '',
          rutCarga: '',
          fechaNacimientoCarga: '',
          parentesco: '',
          observacionesFuncionario: '',
        },
  )
  const [archivos, setArchivos] = useState(ARCHIVOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState([])

  function actualizarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function actualizarArchivo(campo, archivo, error) {
    setArchivos((anterior) => ({ ...anterior, [campo]: archivo }))
    setErrores((anterior) => ({ ...anterior, [campo]: error }))
  }

  function handleCambioRutCarga(e) {
    actualizarCampo('rutCarga', formatearRutMientrasEscribe(e.target.value))
    setErrores((anterior) => ({ ...anterior, rutCarga: '' }))
  }

  function handleBlurRutCarga() {
    if (form.rutCarga && !validarRut(form.rutCarga)) {
      setErrores((anterior) => ({ ...anterior, rutCarga: 'El RUT ingresado no es válido' }))
    }
  }

  function validar() {
    const nuevosErrores = {}
    if (form.rutCarga && !validarRut(form.rutCarga)) {
      nuevosErrores.rutCarga = 'El RUT ingresado no es válido'
    }
    if (!archivos.archivoNacimiento) {
      nuevosErrores.archivoNacimiento = 'Debes adjuntar este documento'
    }
    if (!archivos.archivoMatrimonio) {
      nuevosErrores.archivoMatrimonio = 'Debes adjuntar este documento'
    }
    if (!archivos.archivoEstudios) {
      nuevosErrores.archivoEstudios = 'Debes adjuntar este documento'
    }
    setErrores((anterior) => ({ ...anterior, ...nuevosErrores }))
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorGeneral([])
    if (!validar()) return

    setEnviando(true)
    try {
      const solicitud = editando
        ? await editarSolicitud(solicitudExistente.id, form, archivos)
        : await crearSolicitud(form, archivos)
      navigate(`/solicitudes/${solicitud.id}`)
    } catch (error) {
      setErrorGeneral(
        extraerMensajesError(
          error,
          'No se pudo enviar la solicitud, revisa los datos e intenta de nuevo',
        ),
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>{editando ? 'Corregir carga familiar' : 'Agregar nueva carga familiar'}</h1>
      {editando && (
        <p>
          Corrige lo que el admin observó y vuelve a adjuntar los 3
          documentos (aunque no hayan cambiado).
        </p>
      )}

      <FormField id="rutFuncionario" label="RUT funcionario">
        <Input id="rutFuncionario" value={formatearRut(usuario.rut)} disabled />
      </FormField>

      <FormField id="tipoCarga" label="Tipo de carga">
        <Select
          id="tipoCarga"
          value={form.tipoCarga}
          onChange={(e) => {
            const valor = e.target.value
            setForm((anterior) => ({
              ...anterior,
              tipoCarga: valor,
              parentesco: valor === 'OTRO' ? anterior.parentesco : '',
            }))
          }}
        >
          {TIPOS_CARGA.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </Select>
      </FormField>

      {form.tipoCarga === 'OTRO' && (
        <FormField id="parentesco" label="Parentesco">
          <Input
            id="parentesco"
            placeholder="Ej: hermano/a, nieto/a"
            value={form.parentesco}
            onChange={(e) => actualizarCampo('parentesco', e.target.value)}
          />
        </FormField>
      )}

      <FormField id="accion" label="Tipo de acción">
        <Select
          id="accion"
          value={form.accion}
          onChange={(e) => actualizarCampo('accion', e.target.value)}
        >
          {ACCIONES.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="nombreCarga" label="Nombre completo de la carga">
        <Input
          id="nombreCarga"
          required
          value={form.nombreCarga}
          onChange={(e) => actualizarCampo('nombreCarga', e.target.value)}
        />
      </FormField>

      <FormField id="rutCarga" label="RUT de la carga (opcional)" error={errores.rutCarga}>
        <Input
          id="rutCarga"
          placeholder="12.345.678-9"
          value={form.rutCarga}
          onChange={handleCambioRutCarga}
          onBlur={handleBlurRutCarga}
        />
      </FormField>

      <FormField id="fechaNacimientoCarga" label="Fecha de nacimiento">
        <Input
          id="fechaNacimientoCarga"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          value={form.fechaNacimientoCarga}
          onChange={(e) =>
            actualizarCampo('fechaNacimientoCarga', e.target.value)
          }
        />
      </FormField>

      <FormField id="observacionesFuncionario" label="Observaciones">
        <textarea
          id="observacionesFuncionario"
          className="textarea"
          rows={3}
          value={form.observacionesFuncionario}
          onChange={(e) =>
            actualizarCampo('observacionesFuncionario', e.target.value)
          }
        />
      </FormField>

      <h2>Documentos de respaldo</h2>
      <FileDropSlot
        id="archivoNacimiento"
        label="Certificado de nacimiento"
        file={archivos.archivoNacimiento}
        error={errores.archivoNacimiento}
        onChange={(archivo, error) =>
          actualizarArchivo('archivoNacimiento', archivo, error)
        }
      />
      <FileDropSlot
        id="archivoMatrimonio"
        label="Certificado de matrimonio"
        file={archivos.archivoMatrimonio}
        error={errores.archivoMatrimonio}
        onChange={(archivo, error) =>
          actualizarArchivo('archivoMatrimonio', archivo, error)
        }
      />
      <FileDropSlot
        id="archivoEstudios"
        label="Certificado de estudios"
        file={archivos.archivoEstudios}
        error={errores.archivoEstudios}
        onChange={(archivo, error) =>
          actualizarArchivo('archivoEstudios', archivo, error)
        }
      />

      <ErrorText>{errorGeneral}</ErrorText>
      <Button type="submit" disabled={enviando}>
        {enviando
          ? 'Enviando…'
          : editando
            ? 'Reenviar solicitud corregida'
            : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
