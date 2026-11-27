import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { getSession } from '@/lib/session'
import { Sidebar } from './Sidebar'

/** Layout autenticado: barra lateral fija (≥ lg) o cajón deslizable en móvil. */
export function AppLayout() {
  const session = getSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="min-h-dvh bg-papel lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar session={session} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-asfalto px-3 lg:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          onClick={() => setDrawerOpen(true)}
          className="flex size-12 items-center justify-center rounded-control text-blanco hover:bg-asfalto-2"
        >
          <Menu aria-hidden className="size-6" />
        </button>
        <Logo tone="light" />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
          <div className="absolute inset-0 bg-asfalto/60" onClick={() => setDrawerOpen(false)} />
          <div id="app-drawer" className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <Sidebar session={session} onNavigate={() => setDrawerOpen(false)} />
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-2 right-2 flex size-12 items-center justify-center rounded-control text-linea hover:bg-asfalto-2"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      )}

      <main key={pathname} className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
