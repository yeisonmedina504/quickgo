export type EstadoVehiculo = 'Disponible' | 'EnServicio' | 'Mantenimiento' | 'Baja'
export type PropiedadVehiculo = 'Propio' | 'Externo'

export interface Vehiculo {
  id: string
  tipoVehiculoId: string
  tipoVehiculo: string
  placa: string
  vin: string | null
  propiedad: PropiedadVehiculo
  estado: EstadoVehiculo
  seguroVigente: boolean
}

export interface DocumentoPorVencer {
  documentoId: string
  vehiculoId: string
  placa: string
  tipo: string
  numero: string
  fechaVencimiento: string
  diasRestantes: number
  vencido: boolean
}
