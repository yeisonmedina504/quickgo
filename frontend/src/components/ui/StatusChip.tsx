import { cn } from '@/lib/cn'

export type StatusTone = 'ruta' | 'entregado' | 'pujando' | 'alerta' | 'neutro'

const tones: Record<StatusTone, { chip: string; dot: string }> = {
  ruta: { chip: 'bg-info/10 text-info', dot: 'bg-info' },
  entregado: { chip: 'bg-ruta/10 text-ruta', dot: 'bg-ruta' },
  pujando: { chip: 'bg-ambar-claro text-ambar-texto', dot: 'bg-ambar' },
  alerta: { chip: 'bg-alerta/10 text-alerta', dot: 'bg-alerta' },
  neutro: { chip: 'bg-linea text-asfalto-2', dot: 'bg-asfalto-3' },
}

interface StatusChipProps {
  tone: StatusTone
  label: string
  className?: string
}

/** Chip de estado: color + punto + texto, nunca solo color. Radio 999 px. */
export function StatusChip({ tone, label, className }: StatusChipProps) {
  const { chip, dot } = tones[tone]
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-label font-semibold', chip, className)}>
      <span aria-hidden className={cn('size-2 rounded-full', dot)} />
      {label}
    </span>
  )
}
