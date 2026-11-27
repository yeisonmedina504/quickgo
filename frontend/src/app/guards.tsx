import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { hasRole, type Rol } from '@/lib/roles'
import { getSession } from '@/lib/session'

export function RequireSession({ children }: { children: ReactNode }) {
  return getSession() ? children : <Navigate to="/login" replace />
}

export function GuestOnly({ children }: { children: ReactNode }) {
  return getSession() ? <Navigate to="/panel" replace /> : children
}

/** Redirige al panel si el rol de la sesión no tiene acceso a la ruta. */
export function RequireRole({ roles, children }: { roles: readonly Rol[]; children: ReactNode }) {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  return hasRole(session.rol, roles) ? children : <Navigate to="/panel" replace />
}
