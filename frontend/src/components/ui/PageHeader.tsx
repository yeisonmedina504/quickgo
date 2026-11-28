import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="text-overline uppercase text-asfalto-3">{eyebrow}</p>}
        <h1 className="font-display text-h1 text-asfalto">{title}</h1>
        {description && <p className="max-w-2xl text-body text-asfalto-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  )
}
