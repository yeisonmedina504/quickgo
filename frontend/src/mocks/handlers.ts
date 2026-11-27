import { ApiError } from '@/lib/http'
import { DEMO_PASSWORD, demoUsers, documentosPorVencer, envios, subastas, vehiculos } from './data'

interface MockOptions {
  method: string
  body?: unknown
  token?: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function rolFromToken(token: string | undefined): string {
  if (!token?.startsWith('mock.')) throw new ApiError(401, 'No autenticado', 'Tu sesión expiró.')
  return token.split('.')[1]
}

function requireRole(token: string | undefined, roles: string[]) {
  if (!roles.includes(rolFromToken(token))) {
    throw new ApiError(403, 'Prohibido', 'Tu rol no tiene permiso para esta acción.')
  }
}

/** Simula la API de QuickGo con las mismas reglas de roles del backend. */
export async function mockRequest<T>(path: string, { method, body, token }: MockOptions): Promise<T> {
  await delay(250 + Math.random() * 350)
  const url = new URL(path, 'http://mock')
  const params = url.searchParams
  const route = `${method} ${url.pathname}`

  if (route === 'POST /auth/login') {
    const { email, password } = body as { email: string; password: string }
    const user = demoUsers[email.toLowerCase()]
    if (!user || password !== DEMO_PASSWORD) {
      throw new ApiError(401, 'No autenticado', 'Credenciales inválidas.')
    }
    return {
      ...user,
      token: `mock.${user.rol}.${user.tipoEmpresa}`,
      expiraEn: new Date(Date.now() + 8 * 3_600_000).toISOString(),
    } as T
  }

  if (route === 'POST /empresas/registro') {
    const request = body as { email: string; nombreComercial: string; tipo: 'Transportista' | 'Contratante' }
    demoUsers[request.email.toLowerCase()] = {
      nombreCompleto: request.nombreComercial,
      rol: 'Admin',
      tipoEmpresa: request.tipo,
    }
    return { id: crypto.randomUUID(), ...request, slug: request.nombreComercial.toLowerCase(), activa: true } as T
  }

  if (route === 'GET /envios') {
    requireRole(token, ['Admin', 'Despachador', 'Conductor'])
    const estado = params.get('estado')
    // Quitamos los campos de detalle: la lista del backend no los incluye.
    return envios
      .filter((item) => !estado || item.estado === estado)
      .map((item) => {
        const rest: Partial<typeof item> = { ...item }
        delete rest.origen
        delete rest.destino
        delete rest.vehiculoPlaca
        delete rest.conductorNombre
        return rest
      }) as T
  }

  const envioMatch = url.pathname.match(/^\/envios\/([^/]+)$/)
  if (method === 'GET' && envioMatch) {
    requireRole(token, ['Admin', 'Despachador', 'Conductor'])
    const found = envios.find((item) => item.id === envioMatch[1])
    if (!found) throw new ApiError(404, 'No encontrado', 'El envío no existe.')
    return found as T
  }

  if (route === 'GET /subastas/abiertas') {
    requireRole(token, ['Admin', 'Despachador'])
    return subastas.filter((item) => item.estado === 'Abierta') as T
  }

  if (route === 'GET /subastas/mias') {
    requireRole(token, ['Contratante'])
    const estado = params.get('estado')
    return subastas.filter((item) => !estado || item.estado === estado) as T
  }

  if (route === 'GET /vehiculos') {
    requireRole(token, ['Admin', 'Despachador', 'Conductor'])
    const estado = params.get('estado')
    return vehiculos.filter((item) => !estado || item.estado === estado) as T
  }

  if (route === 'GET /documentos/por-vencer') {
    requireRole(token, ['Admin', 'Despachador'])
    return documentosPorVencer as T
  }

  throw new ApiError(404, 'No encontrado', `El modo demostración no implementa ${route}.`)
}
