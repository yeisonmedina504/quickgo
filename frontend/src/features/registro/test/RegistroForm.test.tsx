import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegistroForm } from '../components/RegistroForm'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function completarPasoEmpresa() {
  await userEvent.click(screen.getByRole('radio', { name: /empresa transportista/i }))
  await userEvent.type(screen.getByLabelText('Nombre comercial'), 'Transportes Ejemplo')
  await userEvent.type(screen.getByLabelText('Razón social'), 'Transportes Ejemplo S.A.')
  await userEvent.type(screen.getByLabelText('RTN'), '08011990123456')
  await userEvent.click(screen.getByRole('button', { name: /continuar/i }))
}

async function completarPasoCuenta() {
  await userEvent.type(screen.getByLabelText(/primer nombre/i), 'Marco')
  await userEvent.type(screen.getByLabelText(/primer apellido/i), 'Castillo')
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'admin@ejemplo.hn')
  await userEvent.type(screen.getByLabelText('Contraseña'), 'Camion2026')
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'Camion2026')
  await userEvent.click(screen.getByRole('button', { name: /crear empresa/i }))
}

describe('RegistroForm', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('no avanza si el paso actual tiene errores', async () => {
    render(<RegistroForm onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByText('Selecciona el tipo de empresa.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos de la empresa' })).toBeInTheDocument()
  })

  it('completa los 3 pasos y envía el registro al backend', async () => {
    const empresa = { id: '1', nombreComercial: 'Transportes Ejemplo', tipo: 'Transportista' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, empresa))
    vi.stubGlobal('fetch', fetchMock)
    const onSuccess = vi.fn()
    render(<RegistroForm onSuccess={onSuccess} />)

    await completarPasoEmpresa()
    expect(await screen.findByRole('heading', { name: 'Elegir plan' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(await screen.findByRole('heading', { name: 'Cuenta de administrador' })).toBeInTheDocument()
    await completarPasoCuenta()

    expect(onSuccess).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/empresas/registro')
    expect(JSON.parse(init.body)).toMatchObject({ rtn: '0801-1990-123456', tipo: 'Transportista', plan: 'Basico' })
  })

  it('regresa al paso del campo en conflicto (409)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(409, { title: 'Registro duplicado', detail: 'El RTN ya está registrado.' })),
    )
    render(<RegistroForm onSuccess={vi.fn()} />)

    await completarPasoEmpresa()
    await userEvent.click(await screen.findByRole('button', { name: /continuar/i }))
    await screen.findByRole('heading', { name: 'Cuenta de administrador' })
    await completarPasoCuenta()

    expect(await screen.findByRole('heading', { name: 'Datos de la empresa' })).toBeInTheDocument()
    expect(screen.getAllByText('El RTN ya está registrado.').length).toBeGreaterThan(0)
  })
})
