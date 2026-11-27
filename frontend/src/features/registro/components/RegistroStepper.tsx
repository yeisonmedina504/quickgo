import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

import { REGISTRO_STEPS } from './registroSteps'

interface RegistroStepperProps {
  current: number
}

export function RegistroStepper({ current }: RegistroStepperProps) {
  return (
    <nav aria-label="Progreso del registro">
      <ol className="flex items-center gap-2 sm:gap-3">
        {REGISTRO_STEPS.map((label, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={active ? 'step' : undefined}>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-label font-medium',
                  done && 'bg-ambar text-asfalto',
                  active && 'bg-asfalto text-blanco',
                  !done && !active && 'border border-linea bg-blanco text-asfalto-3',
                )}
              >
                {done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-label font-medium',
                  active ? 'text-asfalto' : 'text-asfalto-3',
                  !active && 'hidden sm:inline',
                )}
              >
                <span className="sr-only">{done ? 'Completado: ' : active ? 'Paso actual: ' : 'Pendiente: '}</span>
                {label}
              </span>
              {index < REGISTRO_STEPS.length - 1 && (
                <span aria-hidden className={cn('h-px min-w-4 flex-1', done ? 'bg-ambar' : 'bg-linea')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
