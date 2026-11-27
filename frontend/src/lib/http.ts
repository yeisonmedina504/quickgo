/** Cliente HTTP para la API de QuickGo (errores en formato ProblemDetails). */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
/** Modo demostración: responde con datos de prueba sin backend (VITE_API_MOCKS=true). */
export const MOCKS_ENABLED = import.meta.env.VITE_API_MOCKS === 'true'

export type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly fieldErrors: FieldErrors

  constructor(status: number, title: string, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.fieldErrors = fieldErrors
  }
}

interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: FieldErrors
}

/** FluentValidation devuelve claves en PascalCase ("NombreComercial"); el front usa camelCase. */
function toCamelCase(key: string): string {
  return key.length ? key[0].toLowerCase() + key.slice(1) : key
}

function normalizeFieldErrors(errors: FieldErrors | undefined): FieldErrors {
  if (!errors) return {}
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => [toCamelCase(key), value]))
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  signal?: AbortSignal
}

export async function http<T>(path: string, { method = 'GET', body, token, signal }: RequestOptions = {}): Promise<T> {
  if (MOCKS_ENABLED) {
    const { mockRequest } = await import('@/mocks/handlers')
    return mockRequest<T>(path, { method, body, token })
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch {
    throw new ApiError(
      0,
      'Sin conexión',
      'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
    )
  }

  const isJson = response.headers.get('content-type')?.includes('json') ?? false
  const payload: unknown = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const problem = (payload ?? {}) as ProblemDetails
    const fieldErrors = normalizeFieldErrors(problem.errors)
    const firstFieldError = Object.values(fieldErrors)[0]?.[0]
    const message =
      problem.detail ?? firstFieldError ?? problem.title ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
    throw new ApiError(response.status, problem.title ?? 'Error', message, fieldErrors)
  }

  return payload as T
}
