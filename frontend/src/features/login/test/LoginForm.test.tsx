import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../components/LoginForm'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('LoginForm', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('muestra errores de validación sin llamar a la API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<LoginForm onSuccess={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('El correo electrónico es obligatorio.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envía las credenciales y devuelve la sesión', async () => {
    const session = { token: 't', expiraEn: '2999-01-01T00:00:00Z', nombreCompleto: 'Admin Demo', rol: 'Admin', tipoEmpresa: 'Transportista' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, session))
    vi.stubGlobal('fetch', fetchMock)
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'admin@quickgo.demo')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Secreto123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(onSuccess).toHaveBeenCalledWith(session)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(JSON.parse(init.body)).toEqual({ email: 'admin@quickgo.demo', password: 'Secreto123' })
  })

  it('muestra un mensaje claro ante credenciales inválidas (401)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { title: 'No autenticado', status: 401 })))
    render(<LoginForm onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'admin@quickgo.demo')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
  })
})
