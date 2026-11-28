import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Superficie base: blanco, borde 1 px línea, radio 12 px (elevación del DS). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-linea bg-blanco', className)} {...props} />
}

interface CardHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  id?: string
}

export function CardHeader({ title, description, actions, id }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-linea px-6 py-4">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-display text-h3 text-asfalto">
          {title}
        </h2>
        {description && <p className="text-label text-asfalto-3">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
