import axios from 'axios'

const TOKEN_STORAGE_KEY = 'laflorida.token'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function guardarToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function limpiarToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
