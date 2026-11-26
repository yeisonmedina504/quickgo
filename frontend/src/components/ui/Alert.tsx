import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

type Tone = 'error' | 'success' | 'info'

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  error: {
    box: 'border-alerta/30 bg-alerta/5 text-alerta',
    icon: <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />,
  },
  success: {
    box: 'border-ruta/30 bg-ruta/5 text-ruta',
    icon: <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />,
  },
  info: {
    box: 'border-info/30 bg-info/5 text-info',
    icon: <Info aria-hidden className="mt-0.5 size-5 shrink-0" />,
  },
}

interface AlertProps {
  tone: Tone
  title?: string
  children: ReactNode
  className?: string
}

/** El estado nunca va solo en color: icono + texto (regla 02 del DS). */
export function Alert({ tone, title, children, className }: AlertProps) {
  const { box, icon } = tones[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-control border px-4 py-3 text-label', box, className)}
    >
      {icon}
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-asfalto-2">{children}</div>
      </div>
    </div>
  )
}
