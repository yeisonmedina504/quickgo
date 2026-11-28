import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  title: string
  description: string
  icon?: ReactNode
}

/** Opción de selección única con aspecto de tarjeta (radio nativo accesible). */
export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { title, description, icon, className, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        'group relative flex min-h-12 cursor-pointer gap-3 rounded-card border border-linea bg-blanco p-4',
        'transition-colors hover:border-asfalto-3',
        'has-[:checked]:border-asfalto has-[:checked]:bg-ambar-claro has-[:checked]:ring-1 has-[:checked]:ring-asfalto',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-info',
        className,
      )}
    >
      <input ref={ref} type="radio" className="peer sr-only" {...props} />
      {icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-papel text-asfalto-2 group-has-[:checked]:bg-ambar group-has-[:checked]:text-asfalto">
          {icon}
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-body font-semibold text-asfalto">{title}</span>
        <span className="text-label text-asfalto-3 group-has-[:checked]:text-asfalto-2">{description}</span>
      </span>
      <span
        aria-hidden
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-linea group-has-[:checked]:border-asfalto"
      >
        <span className="size-2.5 rounded-full bg-asfalto opacity-0 group-has-[:checked]:opacity-100" />
      </span>
    </label>
  )
})
