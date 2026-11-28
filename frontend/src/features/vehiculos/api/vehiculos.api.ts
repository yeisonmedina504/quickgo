import { api, query } from '@/lib/api'
import type { DocumentoPorVencer, EstadoVehiculo, Vehiculo } from '../types'

export function listarVehiculos(filtro: { estado?: EstadoVehiculo; tipoVehiculoId?: string } = {}): Promise<Vehiculo[]> {
  return api<Vehiculo[]>(`/vehiculos${query(filtro)}`)
}

export function listarDocumentosPorVencer(dias = 30): Promise<DocumentoPorVencer[]> {
  return api<DocumentoPorVencer[]>(`/documentos/por-vencer${query({ dias })}`)
}
