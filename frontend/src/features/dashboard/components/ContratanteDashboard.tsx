import { CircleCheck, CircleX, Gavel, HandCoins } from 'lucide-react'
import { useMisSubastas } from '@/features/subastas/api/subastas.queries'
import { cierranHoy, plural, resumenSubastasAbiertas } from '../api/kpis'
import type { Kpi } from '../types'
import { KpiCard } from './KpiCard'
import { MisSubastasTable } from './MisSubastasTable'

export function ContratanteDashboard() {
  const subastas = useMisSubastas()
  const lista = subastas.data ?? []
  const abiertas = resumenSubastasAbiertas(lista)
  const adjudicadas = lista.filter((s) => s.estado === 'Adjudicada').length
  const vencidas = lista.filter((s) => s.estado === 'Vencida').length
  const estado = { isLoading: subastas.isPending, isError: subastas.isError, to: '/subastas' }

  const kpis: Kpi[] = [
    {
      label: 'Subastas abiertas',
      icon: Gavel,
      value: abiertas.abiertas,
      detail: abiertas.cierranHoy ? cierranHoy(abiertas.cierranHoy) : 'Ninguna cierra hoy',
      detailTone: abiertas.cierranHoy ? 'pujando' : 'neutro',
      ...estado,
    },
    {
      label: 'Pujas recibidas',
      icon: HandCoins,
      value: abiertas.pujas,
      detail: `en ${plural(abiertas.abiertas, 'subasta abierta', 'subastas abiertas')}`,
      ...estado,
    },
    { label: 'Adjudicadas', icon: CircleCheck, value: adjudicadas, detail: 'Con envío creado', detailTone: 'ruta', ...estado },
    {
      label: 'Vencidas',
      icon: CircleX,
      value: vencidas,
      detail: vencidas ? 'Cerraron sin adjudicar' : 'Sin subastas vencidas',
      detailTone: vencidas ? 'alerta' : 'neutro',
      ...estado,
    },
  ]

  return (
    <>
      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>
      <MisSubastasTable
        subastas={lista}
        isLoading={subastas.isPending}
        isError={subastas.isError}
        onRetry={() => void subastas.refetch()}
      />
    </>
  )
}
