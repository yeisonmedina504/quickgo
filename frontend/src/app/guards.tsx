import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { getSession } from '@/lib/session'

export function RequireSession({ children }: { children: ReactNode }) {
  return getSession() ? children : <Navigate to="/login" replace />
}

export function GuestOnly({ children }: { children: ReactNode }) {
  return getSession() ? <Navigate to="/panel" replace /> : children
}
