import { api, query } from '@/lib/api'
import type { Envio, EnvioDetalle, EnvioFiltro } from '../types'

export function listarEnvios(filtro: EnvioFiltro = {}): Promise<Envio[]> {
  return api<Envio[]>(`/envios${query({ ...filtro })}`)
}

export function obtenerEnvio(id: string): Promise<EnvioDetalle> {
  return api<EnvioDetalle>(`/envios/${id}`)
}
