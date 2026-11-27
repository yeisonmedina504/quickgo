import type { LoginResponse } from '@/features/login/types'

const STORAGE_KEY = 'quickgo.session'

export type Session = LoginResponse

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Devuelve la sesión vigente o null si no existe o el token ya expiró. */
export function getSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (new Date(session.expiraEn).getTime() <= Date.now()) {
      clearSession()
      return null
    }
    return session
  } catch {
    clearSession()
    return null
  }
}
