import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { crearSolicitud, editarSolicitud } from '../../api/solicitudes'
import { formatearRut } from '../../utils/rut'
import { extraerMensajesError } from '../../utils/apiError'
import { TIPOS_CARGA, camposArchivoParaTipoCarga } from '../../utils/documentosRequeridos'
import { ACCIONES } from '../../utils/accion'
import { FormField } from '../molecules/FormField'
import { FileDropSlot } from '../molecules/FileDropSlot'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { ErrorText } from '../atoms/ErrorText'

export function SolicitudForm({ solicitudExistente }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const editando = Boolean(solicitudExistente)

  const [form, setForm] = useState(
    solicitudExistente
      ? {
          tipoCarga: solicitudExistente.tipoCarga,
          accion: solicitudExistente.accion,
          observacionesFuncionario:
            solicitudExistente.observacionesFuncionario ?? '',
        }
      : {
          tipoCarga: TIPOS_CARGA[0].value,
          accion: 'ALTA',
          observacionesFuncionario: '',
        },
  )
  const [archivos, setArchivos] = useState({})
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState([])

  const documentosDelTipo = camposArchivoParaTipoCarga(form.tipoCarga)

  function actualizarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function actualizarArchivo(campo, archivo, error) {
    setArchivos((anterior) => ({ ...anterior, [campo]: archivo }))
    setErrores((anterior) => ({ ...anterior, [campo]: error }))
  }

  function handleCambioTipoCarga(e) {
    actualizarCampo('tipoCarga', e.target.value)
    setArchivos({})
    setErrores({})
  }

  function validar() {
    const nuevosErrores = {}
    documentosDelTipo.forEach(({ campo }) => {
      if (!archivos[campo]) {
        nuevosErrores[campo] = 'Debes adjuntar este documento'
      }
    })
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
          Corrige lo que el admin observó y vuelve a adjuntar los documentos
          requeridos (aunque no hayan cambiado).
        </p>
      )}

      <FormField id="rutFuncionario" label="RUT funcionario">
        <Input id="rutFuncionario" value={formatearRut(usuario.rut)} disabled />
      </FormField>

      <FormField id="tipoCarga" label="Parentesco con el beneficiario">
        <Select id="tipoCarga" value={form.tipoCarga} onChange={handleCambioTipoCarga}>
          {TIPOS_CARGA.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </Select>
      </FormField>

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
      <p>
        Los datos de la carga familiar (nombre, RUT, fecha de nacimiento,
        parentesco) se registran en el formulario oficial descargable, no
        aquí. Los documentos requeridos dependen del parentesco seleccionado
        arriba; deben descargarse, completarse, firmarse a mano por quien
        corresponda y volver a subirse como PDF o foto (JPG/PNG), ya que la
        municipalidad no cuenta con firma electrónica.
      </p>

      {documentosDelTipo.map(({ campo, label, plantillaUrl }) => (
        <FileDropSlot
          key={campo}
          id={campo}
          label={label}
          plantillaUrl={plantillaUrl}
          file={archivos[campo]}
          error={errores[campo]}
          onChange={(archivo, error) => actualizarArchivo(campo, archivo, error)}
        />
      ))}

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
