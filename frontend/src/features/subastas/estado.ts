import type { StatusTone } from '@/components/ui/StatusChip'
import type { EstadoSubasta } from './types'

export const ESTADO_SUBASTA: Record<EstadoSubasta, { label: string; tone: StatusTone }> = {
  Abierta: { label: 'Pujando', tone: 'pujando' },
  Adjudicada: { label: 'Adjudicada', tone: 'entregado' },
  Cancelada: { label: 'Cancelada', tone: 'neutro' },
  Vencida: { label: 'Vencida', tone: 'alerta' },
}
