import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

// El ámbar siempre lleva texto oscuro (regla 01 del DS).
const variants: Record<Variant, string> = {
  primary: 'bg-ambar text-asfalto hover:bg-ambar-hover',
  secondary: 'border border-linea bg-blanco text-asfalto hover:border-asfalto-2',
  danger: 'border border-alerta bg-blanco text-alerta hover:bg-alerta hover:text-blanco',
  ghost: 'text-asfalto-2 hover:bg-linea/60',
}

const base =
  'inline-flex h-12 items-center justify-center gap-2 rounded-control px-6 text-body font-semibold transition-colors duration-150'

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        base,
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : leadingIcon}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  fullWidth?: boolean
}

/** Navegación con apariencia de botón (usa Link de react-router). */
export function ButtonLink({ variant = 'secondary', fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], fullWidth && 'w-full', className)} {...props} />
}
