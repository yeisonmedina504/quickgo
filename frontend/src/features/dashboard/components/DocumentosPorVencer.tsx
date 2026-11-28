import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusChip } from '@/components/ui/StatusChip'
import type { DocumentoPorVencer } from '@/features/vehiculos/types'

const TIPO_DOCUMENTO: Record<string, string> = {
  Seguro: 'Póliza de seguro',
  Revision: 'Revisión físico-mecánica',
}

interface DocumentosPorVencerProps {
  documentos: DocumentoPorVencer[]
  isLoading: boolean
  isError: boolean
}

export function DocumentosPorVencer({ documentos, isLoading, isError }: DocumentosPorVencerProps) {
  const lista = [...documentos].sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 3)

  return (
    <Card aria-labelledby="documentos-title">
      <CardHeader
        id="documentos-title"
        title="Documentos por vencer"
        description="Próximos 30 días"
        actions={
          <ButtonLink to="/vehiculos" variant="ghost" className="h-10 px-3 text-label">
            Flota <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      <ul className="divide-y divide-linea">
        {isLoading &&
          Array.from({ length: 2 }, (_, index) => (
            <li key={index} className="flex flex-col gap-2 px-6 py-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </li>
          ))}
        {isError && <li className="px-6 py-4 text-label text-alerta">No pudimos cargar los documentos.</li>}
        {!isLoading && !isError && lista.length === 0 && (
          <li className="px-6 py-6 text-label text-asfalto-3">Toda la documentación está vigente.</li>
        )}
        {lista.map((doc) => (
          <li key={doc.documentoId} className="flex items-start justify-between gap-3 px-6 py-4">
            <div className="flex min-w-0 flex-col">
              <span className="text-label font-semibold text-asfalto">{TIPO_DOCUMENTO[doc.tipo] ?? doc.tipo}</span>
              <span className="text-label text-asfalto-3">
                <span className="font-mono font-medium text-asfalto-2">{doc.placa}</span> · {doc.numero}
              </span>
            </div>
            <StatusChip
              tone={doc.vencido ? 'alerta' : 'pujando'}
              label={doc.vencido ? 'Vencido' : `Por vencer (${doc.diasRestantes} ${doc.diasRestantes === 1 ? 'día' : 'días'})`}
              className="shrink-0"
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
