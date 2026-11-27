import { LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { queryClient } from '@/app/queryClient'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'
import { ROL_LABEL, type Rol } from '@/lib/roles'
import { clearSession, type Session } from '@/lib/session'
import { navigationFor } from './navigation'

interface SidebarProps {
  session: Session
  onNavigate?: () => void
}

export function Sidebar({ session, onNavigate }: SidebarProps) {
  const navigate = useNavigate()
  const groups = navigationFor(session.rol)

  return (
    <div className="flex h-full flex-col bg-asfalto text-linea">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Logo tone="light" />
      </div>

      <nav aria-label="Principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-6">
          {groups.map((group) => (
            <li key={group.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-overline uppercase text-linea/60">{group.label}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map(({ label, path, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'relative flex h-12 items-center gap-3 rounded-control px-3 text-label font-medium transition-colors',
                          isActive
                            ? 'bg-asfalto-2 text-blanco before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-ambar'
                            : 'text-linea/80 hover:bg-asfalto-2/60 hover:text-blanco',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon aria-hidden className={cn('size-5', isActive ? 'text-ambar' : 'text-linea/60')} />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex shrink-0 items-center gap-3 border-t border-blanco/10 p-4">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-control bg-ambar font-display text-label font-bold text-asfalto"
        >
          {initials(session.nombreCompleto)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label font-semibold text-blanco">{session.nombreCompleto}</span>
          <span className="truncate text-label text-linea/70">
            {ROL_LABEL[session.rol as Rol] ?? session.rol}
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          onClick={() => {
            clearSession()
            // Multiempresa: no dejar datos de esta empresa en caché.
            queryClient.clear()
            navigate('/login', { replace: true })
          }}
          className="flex size-12 shrink-0 items-center justify-center rounded-control text-linea/70 transition-colors hover:bg-asfalto-2 hover:text-blanco"
        >
          <LogOut aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  )
}
