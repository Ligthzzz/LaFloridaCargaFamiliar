import { client } from './client'

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function obtenerPerfil() {
  const { data } = await client.get('/usuarios/me')
  return data
}
