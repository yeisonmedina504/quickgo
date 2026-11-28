export interface EnvioListado {
  id: string;
  codigo: string;
  origen: string; 
  destino: string;
  unidad: string;
  conductor: string;
  estado: EstadoEnvio;
  fechaLlegadaEstimada: string; 
}
export type EstadoEnvio = 'Pendiente' | 'Asignado' | 'EnCurso' | 'Completado' | 'Cancelado'
export type TipoServicio = 'Carga' | 'Grua' | 'Maquinaria'

export interface EnvioFiltro {
  estado?: EstadoEnvio
  desde?: string
  hasta?: string
}

export interface Envio {
  id: string
  clienteId: string
  clienteNombre: string
  subastaId: string | null
  origenDireccionId: string
  destinoDireccionId: string
  vehiculoId: string | null
  conductorId: string | null
  tipoServicio: TipoServicio | null
  estado: EstadoEnvio
  pesoKg: number | null
  volumenM3: number | null
  fechaProgramada: string
  tarifa: number
  costoExterno: number
  margen: number
}

export interface DireccionResumen {
  id: string
  texto: string
  lat: number
  lng: number
}

export interface EnvioDetalle extends Envio {
  origen: DireccionResumen
  destino: DireccionResumen
  vehiculoPlaca: string | null
  conductorNombre: string | null
}
