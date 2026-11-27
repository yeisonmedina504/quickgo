import { ApiError, http } from './http'
import { clearSession, getSession } from './session'

type AuthedOptions = Omit<Parameters<typeof http>[1], 'token'>

/** Petición autenticada: agrega el JWT y cierra la sesión si el backend responde 401. */
export async function api<T>(path: string, options: AuthedOptions = {}): Promise<T> {
  const session = getSession()
  if (!session) {
    window.location.assign('/login')
    throw new ApiError(401, 'No autenticado', 'Tu sesión expiró. Inicia sesión de nuevo.')
  }
  try {
    return await http<T>(path, { ...options, token: session.token })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession()
      window.location.assign('/login')
    }
    throw error
  }
}

/** Construye un query string ignorando valores vacíos. */
export function query(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}
