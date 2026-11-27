import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import type { Kpi, KpiTone } from '../types'

const detailTones: Record<KpiTone, { text: string; dot: string | null }> = {
  neutro: { text: 'text-asfalto-3', dot: null },
  ruta: { text: 'text-ruta', dot: 'bg-ruta' },
  alerta: { text: 'text-alerta', dot: 'bg-alerta' },
  pujando: { text: 'text-ambar-texto', dot: 'bg-ambar' },
}

export function KpiCard({ label, icon: Icon, value, detail, detailTone = 'neutro', to, isLoading, isError }: Kpi) {
  const tone = isError ? detailTones.alerta : detailTones[detailTone]
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-overline uppercase text-asfalto-3">{label}</p>
        <span className="flex size-10 items-center justify-center rounded-control bg-papel text-asfalto-2 transition-colors group-hover:bg-ambar group-hover:text-asfalto">
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-3" aria-label="Cargando">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-display text-h1 text-asfalto">{isError ? '—' : (value ?? 0)}</p>
          <p className={cn('flex items-center gap-2 text-label font-medium', tone.text)}>
            {tone.dot && <span aria-hidden className={cn('size-2 rounded-full', tone.dot)} />}
            {isError ? 'No se pudo cargar' : detail}
          </p>
        </div>
      )}
    </>
  )

  const className =
    'group flex flex-col justify-between gap-4 rounded-card border border-linea bg-blanco p-6 transition-colors'
  return to ? (
    <Link to={to} className={cn(className, 'hover:border-asfalto-3')}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
