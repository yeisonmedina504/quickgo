export type EstadoSubasta = 'Abierta' | 'Adjudicada' | 'Cancelada' | 'Vencida'

export interface Subasta {
  id: string
  tipoVehiculoId: string
  tipoVehiculo: string
  origenDireccionId: string
  destinoDireccionId: string
  descripcion: string | null
  pesoKg: number
  volumenM3: number | null
  precioMaximo: number
  monedaCodigo: string
  fechaCierre: string
  estado: EstadoSubasta
  totalPujas: number
  envioId: string | null
}
