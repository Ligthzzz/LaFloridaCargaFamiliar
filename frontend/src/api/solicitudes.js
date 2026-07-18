import { client } from './client'

export async function crearSolicitud(datos, archivos) {
  const formData = new FormData()
  Object.entries(datos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      formData.append(clave, valor)
    }
  })
  formData.append('archivoNacimiento', archivos.archivoNacimiento)
  formData.append('archivoMatrimonio', archivos.archivoMatrimonio)
  formData.append('archivoEstudios', archivos.archivoEstudios)

  const { data } = await client.post('/solicitudes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
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
