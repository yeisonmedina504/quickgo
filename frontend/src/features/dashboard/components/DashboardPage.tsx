import { Plus } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { hasRole } from '@/lib/roles'
import { getSession } from '@/lib/session'
import { ContratanteDashboard } from './ContratanteDashboard'
import { TransportistaDashboard } from './TransportistaDashboard'

const fecha = new Intl.DateTimeFormat('es-HN', { weekday: 'long', day: 'numeric', month: 'long' })

export function DashboardPage() {
  const session = getSession()
  if (!session) return null

  const esCliente = session.tipoEmpresa === 'Contratante'
  const puedeCrearEnvio = hasRole(session.rol, ['Admin', 'Despachador'])
  const hoy = fecha.format(new Date())

  return (
    <>
      <PageHeader
        eyebrow={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        title="Panel de operaciones"
        description={
          esCliente
            ? 'Resumen de tus cargas publicadas, pujas recibidas y adjudicaciones.'
            : 'Vista consolidada de envíos activos, subastas abiertas, flota disponible y documentación.'
        }
        actions={
          esCliente ? (
            <ButtonLink to="/subastas" variant="primary">
              <Plus aria-hidden className="size-5" /> Publicar carga
            </ButtonLink>
          ) : (
            puedeCrearEnvio && (
              <ButtonLink to="/envios" variant="primary">
                <Plus aria-hidden className="size-5" /> Nueva carga
              </ButtonLink>
            )
          )
        }
      />
      {esCliente ? <ContratanteDashboard /> : <TransportistaDashboard rol={session.rol} />}
    </>
  )
}
