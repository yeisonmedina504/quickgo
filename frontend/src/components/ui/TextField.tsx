import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
  /** Datos técnicos (RTN, códigos, placas) usan fuente monoespaciada. */
  mono?: boolean
  optional?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, mono, optional, type = 'text', className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="flex items-baseline justify-between text-label font-medium text-asfalto-2">
        <span>{label}</span>
        {optional && <span className="text-label font-normal text-asfalto-3">Opcional</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-control border bg-blanco px-4 text-body text-asfalto placeholder:text-asfalto-3',
            'transition-colors focus:outline-none focus-visible:outline-none focus:ring-2',
            error
              ? 'border-alerta focus:ring-alerta/25'
              : 'border-linea hover:border-asfalto-3 focus:border-asfalto-2 focus:ring-ambar/40',
            mono && 'font-mono',
            isPassword && 'pr-12',
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-control text-asfalto-3 hover:text-asfalto"
          >
            {revealed ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-label text-asfalto-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-label font-medium text-alerta">
          {error}
        </p>
      )}
    </div>
  )
})
