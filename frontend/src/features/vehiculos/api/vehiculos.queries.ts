import { useQuery } from '@tanstack/react-query'
import { listarDocumentosPorVencer, listarVehiculos } from './vehiculos.api'

export const vehiculosKeys = {
  lista: ['vehiculos', 'lista'] as const,
  documentosPorVencer: (dias: number) => ['documentos', 'por-vencer', dias] as const,
}

export function useVehiculos(enabled = true) {
  return useQuery({ queryKey: vehiculosKeys.lista, queryFn: () => listarVehiculos(), enabled })
}

export function useDocumentosPorVencer(dias = 30, enabled = true) {
  return useQuery({
    queryKey: vehiculosKeys.documentosPorVencer(dias),
    queryFn: () => listarDocumentosPorVencer(dias),
    enabled,
  })
}
