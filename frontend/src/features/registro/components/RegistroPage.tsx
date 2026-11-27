import { Link, useNavigate } from 'react-router'
import { queryClient } from '@/app/queryClient'
import { login } from '@/features/login/api/login.api'
import { saveSession } from '@/lib/session'
import { RegistroForm } from './RegistroForm'

export function RegistroPage() {
  const navigate = useNavigate()

  return (
    <section className="flex w-full max-w-2xl flex-col gap-8" aria-labelledby="registro-title">
      <header className="flex flex-col gap-2">
        <p className="text-overline uppercase text-asfalto-3">Registro multiempresa</p>
        <h1 id="registro-title" className="font-display text-h1 text-asfalto">
          Registrar empresa
        </h1>
        <p className="text-body text-asfalto-2">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-info underline-offset-4 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </header>

      <RegistroForm
        onSuccess={async (_empresa, values) => {
          // La empresa ya existe: se inicia sesión con la cuenta Admin recién creada.
          try {
            queryClient.clear()
            saveSession(await login({ email: values.email, password: values.password }))
            navigate('/panel', { replace: true })
          } catch {
            navigate('/login', { replace: true, state: { email: values.email, registrado: true } })
          }
        }}
      />
    </section>
  )
}
