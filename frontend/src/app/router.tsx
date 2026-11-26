import { createBrowserRouter, Navigate } from 'react-router'
import { LoginPage } from '@/features/login'
import { PanelPage } from '@/features/panel/components/PanelPage'
import { RegistroPage } from '@/features/registro'
import { AuthLayout } from '@/layouts/AuthLayout'
import { GuestOnly, RequireSession } from './guards'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
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
    path: '/panel',
    element: (
      <RequireSession>
        <PanelPage />
      </RequireSession>
    ),
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
