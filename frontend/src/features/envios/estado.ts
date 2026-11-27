import type { StatusTone } from '@/components/ui/StatusChip'
import type { Envio } from './types'

export const ESTADOS_ACTIVOS: Envio['estado'][] = ['Pendiente', 'Asignado', 'EnCurso']

/** Estado visible del envío: un Pendiente/Asignado con la fecha programada vencida se muestra como Retrasado. */
export function estadoVisualEnvio(envio: Pick<Envio, 'estado' | 'fechaProgramada'>, now = Date.now()): {
  label: string
  tone: StatusTone
} {
  const atrasado = new Date(envio.fechaProgramada).getTime() < now
  switch (envio.estado) {
    case 'EnCurso':
      return { label: 'En ruta', tone: 'ruta' }
    case 'Completado':
      return { label: 'Entregado', tone: 'entregado' }
    case 'Cancelado':
      return { label: 'Cancelado', tone: 'neutro' }
    case 'Asignado':
      return atrasado ? { label: 'Retrasado', tone: 'alerta' } : { label: 'Asignado', tone: 'pujando' }
    case 'Pendiente':
      return atrasado ? { label: 'Retrasado', tone: 'alerta' } : { label: 'Pendiente', tone: 'neutro' }
  }
}
