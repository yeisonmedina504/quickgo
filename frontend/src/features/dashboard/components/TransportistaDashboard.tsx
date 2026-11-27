import { CircleCheck, FileWarning, Gavel, Navigation, Package, Truck } from 'lucide-react'
import { useEnvios } from '@/features/envios/api/envios.queries'
import { useSubastasAbiertas } from '@/features/subastas/api/subastas.queries'
import { useDocumentosPorVencer, useVehiculos } from '@/features/vehiculos/api/vehiculos.queries'
import { hasRole } from '@/lib/roles'
import {
  cierranHoy,
  enviosActivosOrdenados,
  plural,
  resumenDocumentos,
  resumenEnvios,
  resumenFlota,
  resumenSubastasAbiertas,
} from '../api/kpis'
import type { Kpi } from '../types'
import { DocumentosPorVencer } from './DocumentosPorVencer'
import { EnviosActivosTable } from './EnviosActivosTable'
import { KpiCard } from './KpiCard'
import { SubastasPorCerrar } from './SubastasPorCerrar'

export function TransportistaDashboard({ rol }: { rol: string }) {
  const gestiona = hasRole(rol, ['Admin', 'Despachador'])

  const envios = useEnvios()
  const subastas = useSubastasAbiertas(gestiona)
  const vehiculos = useVehiculos(gestiona)
  const documentos = useDocumentosPorVencer(30, gestiona)

  const e = resumenEnvios(envios.data ?? [])
  const enviosKpi = { isLoading: envios.isPending, isError: envios.isError }

  const kpis: Kpi[] = gestiona
    ? [
        {
          label: 'Envíos en ruta',
          icon: Navigation,
          value: e.enRuta,
          detail: e.retrasados ? plural(e.retrasados, 'retrasado') : `${e.asignados} por salir`,
          detailTone: e.retrasados ? 'alerta' : 'ruta',
          to: '/envios',
          ...enviosKpi,
        },
        (() => {
          const s = resumenSubastasAbiertas(subastas.data ?? [])
          return {
            label: 'Subastas abiertas',
            icon: Gavel,
            value: s.abiertas,
            detail: s.cierranHoy ? cierranHoy(s.cierranHoy) : 'Ninguna cierra hoy',
            detailTone: s.cierranHoy ? 'pujando' : 'neutro',
            to: '/subastas',
            isLoading: subastas.isPending,
            isError: subastas.isError,
          } satisfies Kpi
        })(),
        (() => {
          const f = resumenFlota(vehiculos.data ?? [])
          return {
            label: 'Vehículos disponibles',
            icon: Truck,
            value: f.disponibles,
            detail: `de ${f.total} en flota`,
            to: '/vehiculos',
            isLoading: vehiculos.isPending,
            isError: vehiculos.isError,
          } satisfies Kpi
        })(),
        (() => {
          const d = resumenDocumentos(documentos.data ?? [])
          return {
            label: 'Documentos por vencer',
            icon: FileWarning,
            value: d.total,
            detail: d.vencidos ? plural(d.vencidos, 'vencido') : 'Ninguno vencido',
            detailTone: d.vencidos ? 'alerta' : 'ruta',
            to: '/vehiculos',
            isLoading: documentos.isPending,
            isError: documentos.isError,
          } satisfies Kpi
        })(),
      ]
    : [
        { label: 'En ruta', icon: Navigation, value: e.enRuta, detail: 'Envíos en curso', detailTone: 'ruta', to: '/envios', ...enviosKpi },
        { label: 'Por salir', icon: Package, value: e.asignados, detail: e.retrasados ? plural(e.retrasados, 'retrasado') : 'Asignados a ti', detailTone: e.retrasados ? 'alerta' : 'neutro', to: '/envios', ...enviosKpi },
        { label: 'Entregados', icon: CircleCheck, value: e.entregados, detail: 'Histórico', to: '/envios', ...enviosKpi },
      ]

  return (
    <>
      <section aria-label="Indicadores" className={gestiona ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-4 sm:grid-cols-3'}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <div className={gestiona ? 'grid items-start gap-6 xl:grid-cols-3' : 'grid gap-6'}>
        <div className={gestiona ? 'xl:col-span-2' : undefined}>
          <EnviosActivosTable
            envios={enviosActivosOrdenados(envios.data ?? [])}
            isLoading={envios.isPending}
            isError={envios.isError}
            onRetry={() => void envios.refetch()}
          />
        </div>
        {gestiona && (
          <div className="flex flex-col gap-6">
            <SubastasPorCerrar subastas={subastas.data ?? []} isLoading={subastas.isPending} isError={subastas.isError} />
            <DocumentosPorVencer
              documentos={documentos.data ?? []}
              isLoading={documentos.isPending}
              isError={documentos.isError}
            />
          </div>
        )}
      </div>
    </>
  )
}
