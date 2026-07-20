export function extraerMensajesError(error, mensajePorDefecto) {
  const mensaje = error?.response?.data?.message
  if (Array.isArray(mensaje) && mensaje.length > 0) return mensaje
  if (typeof mensaje === 'string') return [mensaje]
  return [mensajePorDefecto]
}
