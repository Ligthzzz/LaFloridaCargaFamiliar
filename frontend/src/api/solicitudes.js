import { client } from './client'

function construirFormData(datos, archivos) {
  const formData = new FormData()
  Object.entries(datos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      formData.append(clave, valor)
    }
  })
  Object.entries(archivos).forEach(([campo, archivo]) => {
    if (archivo) {
      formData.append(campo, archivo)
    }
  })
  return formData
}

export async function crearSolicitud(datos, archivos) {
  const { data } = await client.post(
    '/solicitudes',
    construirFormData(datos, archivos),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function editarSolicitud(id, datos, archivos) {
  const { data } = await client.patch(
    `/solicitudes/${id}`,
    construirFormData(datos, archivos),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function listarSolicitudes(estado) {
  const { data } = await client.get('/solicitudes', {
    params: estado ? { estado } : undefined,
  })
  return data
}

export async function obtenerSolicitud(id) {
  const { data } = await client.get(`/solicitudes/${id}`)
  return data
}

export async function obtenerSolicitudesPorLote(loteId) {
  const { data } = await client.get(`/solicitudes/lote/${loteId}`)
  return data
}

export async function descargarArchivo(solicitudId, archivoId, nombreSugerido) {
  const { data } = await client.get(
    `/solicitudes/${solicitudId}/archivos/${archivoId}`,
    { responseType: 'blob' },
  )
  const url = URL.createObjectURL(data)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreSugerido
  enlace.click()
  URL.revokeObjectURL(url)
}

export async function aprobarSolicitud(id, comentario) {
  const { data } = await client.patch(`/solicitudes/${id}/aprobar`, {
    comentario,
  })
  return data
}

export async function rechazarSolicitud(id, comentario) {
  const { data } = await client.patch(`/solicitudes/${id}/rechazar`, {
    comentario,
  })
  return data
}

export async function observarSolicitud(id, comentario) {
  const { data } = await client.patch(`/solicitudes/${id}/observar`, {
    comentario,
  })
  return data
}

export async function agregarComentario(id, mensaje) {
  const { data } = await client.post(`/solicitudes/${id}/comentarios`, {
    mensaje,
  })
  return data
}
