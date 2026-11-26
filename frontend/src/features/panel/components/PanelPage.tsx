import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { clearSession, getSession } from '@/lib/session'

/** Destino provisional tras iniciar sesión, hasta construir la Vista 02 · Panel de operaciones. */
export function PanelPage() {
  const navigate = useNavigate()
  const session = getSession()
  if (!session) return null

  return (
    <div className="min-h-dvh bg-papel">
      <header className="flex h-16 items-center justify-between border-b border-linea bg-blanco px-6">
        <Logo />
        <Button
          variant="ghost"
          leadingIcon={<LogOut aria-hidden className="size-5" />}
          onClick={() => {
            clearSession()
            navigate('/login', { replace: true })
          }}
        >
          Cerrar sesión
        </Button>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2">
          <p className="text-overline uppercase text-asfalto-3">Panel de operaciones</p>
          <h1 className="font-display text-h1 text-asfalto">Hola, {session.nombreCompleto}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip tone="entregado" label="Sesión activa" />
          <StatusChip tone="neutro" label={`Rol: ${session.rol}`} />
          <StatusChip tone="neutro" label={`Empresa ${session.tipoEmpresa === 'Contratante' ? 'cliente' : 'transportista'}`} />
        </div>
      </main>
    </div>
  )
}
