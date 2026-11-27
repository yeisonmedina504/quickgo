import { ArrowRight, PackageOpen } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusChip } from '@/components/ui/StatusChip'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table'
import { useEnviosDetalle } from '@/features/envios/api/envios.queries'
import { estadoVisualEnvio } from '@/features/envios/estado'
import type { Envio } from '@/features/envios/types'
import { formatRelativeDateTime, shortCode } from '@/lib/format'

interface EnviosActivosTableProps {
  envios: Envio[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function EnviosActivosTable({ envios, isLoading, isError, onRetry }: EnviosActivosTableProps) {
  const detalles = useEnviosDetalle(envios.map((e) => e.id))

  return (
    <Card aria-labelledby="envios-activos-title">
      <CardHeader
        id="envios-activos-title"
        title="Envíos activos"
        description="Pendientes, asignados y en ruta, ordenados por fecha programada."
        actions={
          <ButtonLink to="/envios" variant="ghost" className="h-10 px-3 text-label">
            Ver todos <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />

      {isError ? (
        <div className="flex flex-col items-start gap-4 p-6">
          <Alert tone="error">No pudimos cargar los envíos.</Alert>
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : !isLoading && envios.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-card bg-papel text-asfalto-3">
            <PackageOpen aria-hidden className="size-6" />
          </span>
          <p className="text-body font-semibold text-asfalto">No hay envíos activos</p>
          <p className="max-w-sm text-label text-asfalto-3">Cuando ganes una subasta o crees un envío, aparecerá aquí.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeaderCell>Código</TableHeaderCell>
            <TableHeaderCell>Ruta</TableHeaderCell>
            <TableHeaderCell>Unidad</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
            <TableHeaderCell className="text-right">Programado</TableHeaderCell>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }, (__, cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : envios.map((envio, index) => {
                  const detalle = detalles[index]?.data
                  const estado = estadoVisualEnvio(envio)
                  return (
                    <TableRow key={envio.id}>
                      <TableCell className="whitespace-nowrap font-mono font-medium">{shortCode(envio.id)}</TableCell>
                      <TableCell className="min-w-56">
                        {detalle ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {detalle.origen.texto} <span className="text-asfalto-3">→</span> {detalle.destino.texto}
                            </span>
                            <span className="text-asfalto-3">{envio.clienteNombre}</span>
                          </div>
                        ) : (
                          <Skeleton className="h-4 w-48" />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {detalle ? (
                          detalle.vehiculoPlaca ? (
                            <span>
                              <span className="font-mono font-medium">{detalle.vehiculoPlaca}</span>
                              <span className="text-asfalto-3"> · {detalle.conductorNombre ?? 'Sin conductor'}</span>
                            </span>
                          ) : (
                            <span className="text-asfalto-3">Sin asignar</span>
                          )
                        ) : (
                          <Skeleton className="h-4 w-32" />
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip tone={estado.tone} label={estado.label} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-medium">
                        {formatRelativeDateTime(envio.fechaProgramada)}
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
