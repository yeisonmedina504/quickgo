import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusChip } from '@/components/ui/StatusChip'
import type { Subasta } from '@/features/subastas/types'
import { formatCountdown, formatMoney, formatWeight } from '@/lib/format'

interface SubastasPorCerrarProps {
  subastas: Subasta[]
  isLoading: boolean
  isError: boolean
}

const TRES_HORAS = 3 * 3_600_000

export function SubastasPorCerrar({ subastas, isLoading, isError }: SubastasPorCerrarProps) {
  // Momento de referencia fijo por montaje (render puro).
  const [now] = useState(() => Date.now())
  const proximas = [...subastas]
    .sort((a, b) => new Date(a.fechaCierre).getTime() - new Date(b.fechaCierre).getTime())
    .slice(0, 3)

  return (
    <Card aria-labelledby="subastas-cierre-title">
      <CardHeader
        id="subastas-cierre-title"
        title="Subastas por cerrar"
        actions={
          <ButtonLink to="/subastas" variant="ghost" className="h-10 px-3 text-label">
            Pujar <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      <ul className="divide-y divide-linea">
        {isLoading &&
          Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="flex flex-col gap-2 px-6 py-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </li>
          ))}
        {isError && <li className="px-6 py-4 text-label text-alerta">No pudimos cargar las subastas.</li>}
        {!isLoading && !isError && proximas.length === 0 && (
          <li className="px-6 py-6 text-label text-asfalto-3">No hay subastas abiertas en este momento.</li>
        )}
        {proximas.map((subasta) => {
          const urgente = new Date(subasta.fechaCierre).getTime() - now < TRES_HORAS
          return (
            <li key={subasta.id} className="flex flex-col gap-2 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-label font-semibold text-asfalto">
                    {subasta.descripcion ?? subasta.tipoVehiculo}
                  </span>
                  <span className="text-label text-asfalto-3">
                    {formatWeight(subasta.pesoKg)} · {subasta.tipoVehiculo}
                  </span>
                </div>
                <StatusChip
                  tone={urgente ? 'alerta' : 'pujando'}
                  label={formatCountdown(subasta.fechaCierre, now)}
                  className="shrink-0 font-mono font-medium"
                />
              </div>
              <div className="flex items-center justify-between text-label">
                <span className="text-asfalto-3">
                  Precio máx. · {subasta.totalPujas} {subasta.totalPujas === 1 ? 'puja' : 'pujas'}
                </span>
                <span className="font-mono font-medium text-asfalto">
                  {formatMoney(subasta.precioMaximo, subasta.monedaCodigo)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
