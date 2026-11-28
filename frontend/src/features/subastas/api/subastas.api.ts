import { api, query } from '@/lib/api'
import type { EstadoSubasta, Subasta } from '../types'

/** Transportista (Admin/Despachador): subastas abiertas en las que puede pujar. */
export function listarSubastasAbiertas(tipoVehiculoId?: string): Promise<Subasta[]> {
  return api<Subasta[]>(`/subastas/abiertas${query({ tipoVehiculoId })}`)
}

/** Contratante: subastas publicadas por su empresa. */
export function listarMisSubastas(estado?: EstadoSubasta): Promise<Subasta[]> {
  return api<Subasta[]>(`/subastas/mias${query({ estado })}`)
}
