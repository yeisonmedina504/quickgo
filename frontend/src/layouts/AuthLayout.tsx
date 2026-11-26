import { Outlet } from 'react-router'
import heroImage from '@/assets/images/auth-hero.jpg'
import { Logo } from '@/components/brand/Logo'
import { StatusChip } from '@/components/ui/StatusChip'

/** Layout público: panel de marca (izquierda) + contenido del formulario (derecha). */
export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-papel lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-asfalto lg:flex lg:flex-col lg:justify-between">
        <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-asfalto via-asfalto/60 to-asfalto/30" />

        <div className="relative p-12">
          <Logo tone="light" />
        </div>

        <div className="relative flex flex-col gap-8 p-12">
          <div className="flex flex-col gap-4">
            <p className="text-overline uppercase text-ambar">Transporte de carga · Honduras</p>
            <p className="max-w-md font-display text-display text-blanco">Tu carga, en movimiento.</p>
            <p className="max-w-md text-body text-linea">
              Publica cargas, recibe pujas de transportistas verificados y sigue cada envío hasta la entrega.
            </p>
          </div>

          <div className="flex max-w-md flex-col gap-3 rounded-card border border-blanco/10 bg-asfalto-2/80 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-label font-medium text-blanco">QG-0412</span>
              <StatusChip tone="ruta" label="En ruta" />
            </div>
            <div className="flex items-center justify-between gap-4 text-label text-linea">
              <span>San Pedro Sula → Tegucigalpa</span>
              <span className="font-mono font-medium text-blanco">L 33,900.00</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col">
        <header className="flex h-16 items-center border-b border-linea bg-blanco px-6 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
