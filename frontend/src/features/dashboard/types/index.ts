import type { LucideIcon } from 'lucide-react'

export type KpiTone = 'neutro' | 'ruta' | 'alerta' | 'pujando'

export interface Kpi {
  label: string
  icon: LucideIcon
  value?: number
  detail?: string
  detailTone?: KpiTone
  to?: string
  isLoading?: boolean
  isError?: boolean
}
