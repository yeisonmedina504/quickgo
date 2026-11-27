import { createBrowserRouter, Navigate } from 'react-router'
import { DashboardPage } from '@/features/dashboard'
import { LoginPage } from '@/features/login'
import { RegistroPage } from '@/features/registro'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { NAV_ITEMS } from '@/layouts/navigation'
import { PlaceholderPage } from '@/layouts/PlaceholderPage'
import { GuestOnly, RequireRole, RequireSession } from './guards'

// Módulos del menú aún sin pantalla propia: se reemplazan a medida que se construyen.
const moduleRoutes = NAV_ITEMS.filter((item) => item.path !== '/panel').map((item) => ({
  path: item.path,
  element: (
    <RequireRole roles={item.roles}>
      <PlaceholderPage item={item} />
    </RequireRole>
  ),
}))

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/panel" replace /> },
  {
    element: (
      <GuestOnly>
        <AuthLayout />
      </GuestOnly>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegistroPage /> },
    ],
  },
  {
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    children: [{ path: '/panel', element: <DashboardPage /> }, ...moduleRoutes],
  },
  { path: '*', element: <Navigate to="/panel" replace /> },
])
