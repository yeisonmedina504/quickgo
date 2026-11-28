import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveSession } from '@/lib/session'
import { DashboardPage } from '../components/DashboardPage'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const soon = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()

const ENVIO = {
  id: '0412a7c1-0000-4000-8000-000000000001',
  clienteNombre: 'Agro Insumos',
  estado: 'EnCurso',
  fechaProgramada: soon(2),
}

function renderDashboard(rol: string, tipoEmpresa: 'Transportista' | 'Contratante') {
  saveSession({ token: 't', expiraEn: soon(8), nombreCompleto: 'Admin Demo', rol, tipoEmpresa })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('transportista: muestra indicadores y la ruta del envío desde el detalle', async () => {
    const fetchMock = vi.fn((url: string, _init?: RequestInit) => {
      void _init
      if (url === '/api/envios') return Promise.resolve(json([ENVIO]))
      if (url === `/api/envios/${ENVIO.id}`)
        return Promise.resolve(
          json({ ...ENVIO, origen: { texto: 'San Pedro Sula' }, destino: { texto: 'Tegucigalpa' }, vehiculoPlaca: 'HND-4821', conductorNombre: 'M. Castillo' }),
        )
      if (url === '/api/subastas/abiertas') return Promise.resolve(json([]))
      if (url === '/api/vehiculos') return Promise.resolve(json([{ estado: 'Disponible' }, { estado: 'EnServicio' }]))
      if (url.startsWith('/api/documentos/por-vencer')) return Promise.resolve(json([]))
      return Promise.resolve(json({}, 404))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderDashboard('Admin', 'Transportista')

    expect(await screen.findByText(/San Pedro Sula/)).toBeInTheDocument()
    expect(screen.getByText('HND-4821')).toBeInTheDocument()
    const enRuta = screen.getByText('Envíos en ruta').closest('a')!
    expect(within(enRuta).getByText('1')).toBeInTheDocument()
    expect(await screen.findByText('de 2 en flota')).toBeInTheDocument()
    // El JWT viaja en cada petición.
    expect((fetchMock.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBe('Bearer t')
  })

  it('cliente: consulta sus subastas y no pide endpoints de transportista', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url === '/api/subastas/mias'
          ? json([
              { id: '0148aa00-0000', descripcion: 'Granos básicos', tipoVehiculo: 'Cabezal', pesoKg: 22000, precioMaximo: 38000, monedaCodigo: 'HNL', fechaCierre: soon(2), estado: 'Abierta', totalPujas: 5 },
            ])
          : json({}, 403),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderDashboard('Contratante', 'Contratante')

    expect(await screen.findByText('Granos básicos')).toBeInTheDocument()
    expect(screen.getByText('L 38,000.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /publicar carga/i })).toBeInTheDocument()
    expect(fetchMock.mock.calls.every(([url]) => url === '/api/subastas/mias')).toBe(true)
  })
})
