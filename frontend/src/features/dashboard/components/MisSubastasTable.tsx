import { ArrowRight, Gavel } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusChip } from '@/components/ui/StatusChip'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { ESTADO_SUBASTA } from '@/features/subastas/estado'
import type { Subasta } from '@/features/subastas/types'
import { formatCountdown, formatMoney, formatRelativeDateTime, formatWeight, shortCode } from '@/lib/format'

interface MisSubastasTableProps {
  subastas: Subasta[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function MisSubastasTable({ subastas, isLoading, isError, onRetry }: MisSubastasTableProps) {
  // Abiertas primero (las que cierran antes), luego el resto por fecha más reciente.
  const ordenadas = [...subastas].sort((a, b) => {
    if (a.estado === 'Abierta' && b.estado !== 'Abierta') return -1
    if (b.estado === 'Abierta' && a.estado !== 'Abierta') return 1
    const diff = new Date(a.fechaCierre).getTime() - new Date(b.fechaCierre).getTime()
    return a.estado === 'Abierta' ? diff : -diff
  })

  return (
    <Card aria-labelledby="mis-subastas-title">
      <CardHeader
        id="mis-subastas-title"
        title="Mis subastas"
        description="Cargas publicadas por tu empresa y su estado."
        actions={
          <ButtonLink to="/subastas" variant="ghost" className="h-10 px-3 text-label">
            Ver todas <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      {isError ? (
        <div className="flex flex-col items-start gap-4 p-6">
          <Alert tone="error">No pudimos cargar tus subastas.</Alert>
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : !isLoading && subastas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-card bg-papel text-asfalto-3">
            <Gavel aria-hidden className="size-6" />
          </span>
          <p className="text-body font-semibold text-asfalto">Aún no publicas cargas</p>
          <p className="max-w-sm text-label text-asfalto-3">
            Publica tu primera carga y recibe pujas de transportistas verificados.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeaderCell>Carga</TableHeaderCell>
            <TableHeaderCell>Unidad requerida</TableHeaderCell>
            <TableHeaderCell className="text-right">Precio máx.</TableHeaderCell>
            <TableHeaderCell className="text-right">Pujas</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
            <TableHeaderCell className="text-right">Cierre</TableHeaderCell>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }, (__, cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-4 w-full max-w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : ordenadas.map((subasta) => {
                  const estado = ESTADO_SUBASTA[subasta.estado]
                  return (
                    <TableRow key={subasta.id}>
                      <TableCell className="min-w-52">
                        <div className="flex flex-col">
                          <span className="font-medium">{subasta.descripcion ?? 'Carga sin descripción'}</span>
                          <span className="text-asfalto-3">
                            <span className="font-mono">{shortCode(subasta.id, 'QG-S')}</span> · {formatWeight(subasta.pesoKg)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{subasta.tipoVehiculo}</TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-medium">
                        {formatMoney(subasta.precioMaximo, subasta.monedaCodigo)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">{subasta.totalPujas}</TableCell>
                      <TableCell>
                        <StatusChip tone={estado.tone} label={estado.label} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-medium">
                        {subasta.estado === 'Abierta'
                          ? `Cierra en ${formatCountdown(subasta.fechaCierre)}`
                          : formatRelativeDateTime(subasta.fechaCierre)}
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
