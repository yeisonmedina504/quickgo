import { useQueries, useQuery } from '@tanstack/react-query'
import type { EnvioFiltro } from '../types'
import { listarEnvios, obtenerEnvio } from './envios.api'

export const enviosKeys = {
  all: ['envios'] as const,
  lista: (filtro: EnvioFiltro = {}) => ['envios', 'lista', filtro] as const,
  detalle: (id: string) => ['envios', 'detalle', id] as const,
}

export function useEnvios(filtro: EnvioFiltro = {}, enabled = true) {
  return useQuery({ queryKey: enviosKeys.lista(filtro), queryFn: () => listarEnvios(filtro), enabled })
}

/** La lista del backend no trae ruta ni unidad: se piden los detalles de las filas visibles. */
export function useEnviosDetalle(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: enviosKeys.detalle(id), queryFn: () => obtenerEnvio(id) })),
  })
}
