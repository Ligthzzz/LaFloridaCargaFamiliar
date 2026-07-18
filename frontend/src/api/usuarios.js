import { client } from './client'

export async function crearUsuario(datos) {
  const { data } = await client.post('/usuarios', datos)
  return data
}
