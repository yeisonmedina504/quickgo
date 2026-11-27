import { Construction } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import type { NavItem } from './navigation'

/** Vista provisional para módulos del menú que aún no se construyen. */
export function PlaceholderPage({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <>
      <PageHeader eyebrow="Módulo" title={item.label} />
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-card bg-ambar-claro text-ambar-texto">
          <Icon aria-hidden className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="flex items-center justify-center gap-2 text-body font-semibold text-asfalto">
            <Construction aria-hidden className="size-5 text-asfalto-3" /> Vista en construcción
          </p>
          <p className="max-w-md text-label text-asfalto-3">
            La pantalla de {item.label.toLowerCase()} se construirá en uno de los próximos pasos.
          </p>
        </div>
        <ButtonLink to="/panel" variant="secondary">
          Volver al panel
        </ButtonLink>
      </Card>
    </>
  )
}
