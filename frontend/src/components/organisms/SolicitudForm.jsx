import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { crearSolicitud, editarSolicitud } from '../../api/solicitudes'
import { formatearRut } from '../../utils/rut'
import { extraerMensajesError } from '../../utils/apiError'
import { TIPOS_CARGA, camposArchivoParaTipoCarga } from '../../utils/documentosRequeridos'
import { CargaFamiliarCampos } from './CargaFamiliarCampos'
import { FormField } from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { ErrorText } from '../atoms/ErrorText'

function nuevoBloque() {
  return {
    key: crypto.randomUUID(),
    tipoCarga: TIPOS_CARGA[0].value,
    observacionesFuncionario: '',
    archivos: {},
    errores: {},
  }
}

function validarBloque(bloque) {
  const errores = {}
  camposArchivoParaTipoCarga(bloque.tipoCarga).forEach(({ campo }) => {
    if (!bloque.archivos[campo]) {
      errores[campo] = 'Debes adjuntar este documento'
    }
  })
  return errores
}

export function SolicitudForm({ solicitudExistente }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const editando = Boolean(solicitudExistente)

  // Modo edición: una sola carga (corrigiendo una solicitud OBSERVADA)
  const [formEdicion, setFormEdicion] = useState(() =>
    editando
      ? {
          tipoCarga: solicitudExistente.tipoCarga,
          observacionesFuncionario: solicitudExistente.observacionesFuncionario ?? '',
        }
      : null,
  )
  const [archivosEdicion, setArchivosEdicion] = useState({})
  const [erroresEdicion, setErroresEdicion] = useState({})

  // Modo creación: una o varias cargas nuevas
  const [cargas, setCargas] = useState(() => (editando ? [] : [nuevoBloque()]))
  const [resultados, setResultados] = useState(() => (editando ? [] : [null]))

  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState([])

  function actualizarBloque(index, cambios) {
    setCargas((anterior) =>
      anterior.map((carga, i) => (i === index ? { ...carga, ...cambios } : carga)),
    )
  }

  function actualizarTipoCargaBloque(index, valor) {
    actualizarBloque(index, { tipoCarga: valor, archivos: {}, errores: {} })
  }

  function actualizarArchivoBloque(index, campo, archivo, error) {
    setCargas((anterior) =>
      anterior.map((carga, i) =>
        i === index
          ? {
              ...carga,
              archivos: { ...carga.archivos, [campo]: archivo },
              errores: { ...carga.errores, [campo]: error },
            }
          : carga,
      ),
    )
  }

  function agregarBloque() {
    setCargas((anterior) => [...anterior, nuevoBloque()])
    setResultados((anterior) => [...anterior, null])
  }

  function quitarBloque(index) {
    setCargas((anterior) => anterior.filter((_, i) => i !== index))
    setResultados((anterior) => anterior.filter((_, i) => i !== index))
  }

  async function handleSubmitEdicion(event) {
    event.preventDefault()
    setErrorGeneral([])

    const requeridos = camposArchivoParaTipoCarga(formEdicion.tipoCarga)
    const nuevosErrores = {}
    requeridos.forEach(({ campo }) => {
      if (!archivosEdicion[campo]) {
        nuevosErrores[campo] = 'Debes adjuntar este documento'
      }
    })
    setErroresEdicion(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      const solicitud = await editarSolicitud(
        solicitudExistente.id,
        formEdicion,
        archivosEdicion,
      )
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

  async function handleSubmitCreacion(event) {
    event.preventDefault()
    setErrorGeneral([])

    const erroresPorBloque = cargas.map(validarBloque)
    const hayErrores = erroresPorBloque.some((e) => Object.keys(e).length > 0)
    if (hayErrores) {
      setCargas((anterior) =>
        anterior.map((carga, i) => ({ ...carga, errores: erroresPorBloque[i] })),
      )
      return
    }

    setEnviando(true)
    const resultadosActualizados = [...resultados]
    for (let i = 0; i < cargas.length; i++) {
      if (resultadosActualizados[i]?.estado === 'ok') continue
      resultadosActualizados[i] = { estado: 'enviando' }
      setResultados([...resultadosActualizados])
      try {
        const solicitud = await crearSolicitud(
          {
            tipoCarga: cargas[i].tipoCarga,
            observacionesFuncionario: cargas[i].observacionesFuncionario,
          },
          cargas[i].archivos,
        )
        resultadosActualizados[i] = { estado: 'ok', id: solicitud.id }
      } catch (error) {
        resultadosActualizados[i] = {
          estado: 'error',
          mensajes: extraerMensajesError(error, 'No se pudo enviar esta carga'),
        }
      }
      setResultados([...resultadosActualizados])
    }
    setEnviando(false)

    const todasOk = resultadosActualizados.every((r) => r?.estado === 'ok')
    if (todasOk) {
      navigate('/', { state: { cargasCreadas: cargas.length } })
    } else {
      setErrorGeneral([
        'Algunas cargas no se pudieron enviar. Revisa los errores marcados abajo y vuelve a intentar (las que ya se enviaron no se repetirán).',
      ])
    }
  }

  if (editando) {
    return (
      <form className="card" onSubmit={handleSubmitEdicion}>
        <h1>Corregir carga familiar</h1>
        <p>
          Corrige lo que el admin observó y vuelve a adjuntar los documentos
          requeridos (aunque no hayan cambiado).
        </p>

        <FormField id="rutFuncionario" label="RUT funcionario">
          <Input id="rutFuncionario" value={formatearRut(usuario.rut)} disabled />
        </FormField>

        <CargaFamiliarCampos
          idPrefix="editar"
          tipoCarga={formEdicion.tipoCarga}
          observaciones={formEdicion.observacionesFuncionario}
          archivos={archivosEdicion}
          errores={erroresEdicion}
          onCambiarTipoCarga={(valor) => {
            setFormEdicion((anterior) => ({ ...anterior, tipoCarga: valor }))
            setArchivosEdicion({})
            setErroresEdicion({})
          }}
          onCambiarObservaciones={(valor) =>
            setFormEdicion((anterior) => ({ ...anterior, observacionesFuncionario: valor }))
          }
          onCambiarArchivo={(campo, archivo, error) => {
            setArchivosEdicion((anterior) => ({ ...anterior, [campo]: archivo }))
            setErroresEdicion((anterior) => ({ ...anterior, [campo]: error }))
          }}
        />

        <ErrorText>{errorGeneral}</ErrorText>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Reenviar solicitud corregida'}
        </Button>
      </form>
    )
  }

  return (
    <form className="card" onSubmit={handleSubmitCreacion}>
      <h1>Agregar nueva carga familiar</h1>
      <p>
        Puedes agregar más de una carga familiar en el mismo envío: usa
        &quot;Agregar otra carga&quot; para sumar cuantas necesites.
      </p>

      <FormField id="rutFuncionario" label="RUT funcionario">
        <Input id="rutFuncionario" value={formatearRut(usuario.rut)} disabled />
      </FormField>

      {cargas.map((carga, index) => {
        const resultado = resultados[index]
        const enviada = resultado?.estado === 'ok'
        return (
          <div key={carga.key} className="carga-bloque">
            <div className="carga-bloque-header">
              <h2>{cargas.length > 1 ? `Carga familiar N.º ${index + 1}` : 'Carga familiar'}</h2>
              {enviada && <Badge tone="success">Enviada</Badge>}
              {resultado?.estado === 'enviando' && <Badge tone="warning">Enviando…</Badge>}
              {cargas.length > 1 && !enviada && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => quitarBloque(index)}
                  disabled={enviando}
                >
                  Quitar esta carga
                </button>
              )}
            </div>

            <CargaFamiliarCampos
              idPrefix={`carga-${index}`}
              tipoCarga={carga.tipoCarga}
              observaciones={carga.observacionesFuncionario}
              archivos={carga.archivos}
              errores={carga.errores}
              deshabilitado={enviada}
              onCambiarTipoCarga={(valor) => actualizarTipoCargaBloque(index, valor)}
              onCambiarObservaciones={(valor) =>
                actualizarBloque(index, { observacionesFuncionario: valor })
              }
              onCambiarArchivo={(campo, archivo, error) =>
                actualizarArchivoBloque(index, campo, archivo, error)
              }
            />

            {resultado?.estado === 'error' && <ErrorText>{resultado.mensajes}</ErrorText>}
          </div>
        )
      })}

      <Button variant="secondary" type="button" onClick={agregarBloque} disabled={enviando}>
        + Agregar otra carga familiar
      </Button>

      <ErrorText>{errorGeneral}</ErrorText>
      <Button type="submit" disabled={enviando}>
        {enviando
          ? 'Enviando…'
          : cargas.length > 1
            ? `Enviar ${cargas.length} solicitudes`
            : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
