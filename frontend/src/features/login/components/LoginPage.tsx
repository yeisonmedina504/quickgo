import { useLocation, useNavigate } from 'react-router'
import { queryClient } from '@/app/queryClient'
import { Alert } from '@/components/ui/Alert'
import { ButtonLink } from '@/components/ui/Button'
import { MOCKS_ENABLED } from '@/lib/http'
import { saveSession } from '@/lib/session'
import { LoginForm } from './LoginForm'

interface LoginLocationState {
  email?: string
  registrado?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LoginLocationState

  return (
    <section className="flex w-full max-w-md flex-col gap-8" aria-labelledby="login-title">
      <header className="flex flex-col gap-2">
        <p className="text-overline uppercase text-asfalto-3">Bienvenido de nuevo</p>
        <h1 id="login-title" className="font-display text-h1 text-asfalto">
          Iniciar sesión
        </h1>
        <p className="text-body text-asfalto-2">Entra a tu empresa o cuenta de cliente.</p>
      </header>

      {state.registrado && (
        <Alert tone="success" title="Empresa registrada">
          Ya puedes iniciar sesión con tu cuenta de administrador.
        </Alert>
      )}

      {MOCKS_ENABLED && (
        <Alert tone="info" title="Modo demostración">
          Usa <span className="font-mono">admin@quickgo.demo</span> (transportista) o{' '}
          <span className="font-mono">cliente@quickgo.demo</span> (cliente) con la contraseña{' '}
          <span className="font-mono">Demo1234</span>.
        </Alert>
      )}

      <LoginForm
        defaultEmail={state.email}
        onSuccess={(session) => {
          queryClient.clear()
          saveSession(session)
          navigate('/panel', { replace: true })
        }}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-label text-asfalto-3">
          <span aria-hidden className="h-px flex-1 bg-linea" />
          ¿Tu empresa aún no usa QuickGo?
          <span aria-hidden className="h-px flex-1 bg-linea" />
        </div>
        <ButtonLink to="/registro" variant="secondary" fullWidth>
          Registrar empresa
        </ButtonLink>
      </div>
    </section>
  )
}
