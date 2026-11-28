import type { EnvioDetalle } from '@/features/envios/types'
import type { LoginResponse } from '@/features/login/types'
import type { Subasta } from '@/features/subastas/types'
import type { DocumentoPorVencer, Vehiculo } from '@/features/vehiculos/types'

/** Datos de demostración. Las fechas son relativas al momento de carga. */
const now = Date.now()
const hours = (h: number) => new Date(now + h * 3_600_000).toISOString()
const days = (d: number) => new Date(now + d * 86_400_000).toISOString().slice(0, 10)

export const DEMO_PASSWORD = 'Demo1234'

export const demoUsers: Record<string, Omit<LoginResponse, 'token' | 'expiraEn'>> = {
  'admin@quickgo.demo': { nombreCompleto: 'Admin Demo', rol: 'Admin', tipoEmpresa: 'Transportista' },
  'despacho@quickgo.demo': { nombreCompleto: 'Laura Sánchez', rol: 'Despachador', tipoEmpresa: 'Transportista' },
  'conductor@quickgo.demo': { nombreCompleto: 'Marco Antonio Castillo', rol: 'Conductor', tipoEmpresa: 'Transportista' },
  'cliente@quickgo.demo': { nombreCompleto: 'Agro Insumos Honduras', rol: 'Contratante', tipoEmpresa: 'Contratante' },
}

const dir = (id: string, texto: string) => ({ id, texto, lat: 0, lng: 0 })
const SPS = dir('d-sps', 'San Pedro Sula')
const TGU = dir('d-tgu', 'Tegucigalpa')
const LCE = dir('d-lce', 'La Ceiba')
const CHO = dir('d-cho', 'Choluteca')
const PCO = dir('d-pco', 'Puerto Cortés')
const CMY = dir('d-cmy', 'Comayagua')

function envio(
  id: string,
  estado: EnvioDetalle['estado'],
  origen: typeof SPS,
  destino: typeof SPS,
  fechaProgramada: string,
  vehiculoPlaca: string | null,
  conductorNombre: string | null,
  tarifa: number,
  clienteNombre = 'Agro Insumos Honduras S.A.',
): EnvioDetalle {
  return {
    id,
    clienteId: 'c-1',
    clienteNombre,
    subastaId: null,
    origenDireccionId: origen.id,
    destinoDireccionId: destino.id,
    vehiculoId: vehiculoPlaca ? `v-${vehiculoPlaca}` : null,
    conductorId: conductorNombre ? `k-${conductorNombre}` : null,
    tipoServicio: 'Carga',
    estado,
    pesoKg: 22000,
    volumenM3: null,
    fechaProgramada,
    tarifa,
    costoExterno: 0,
    margen: tarifa,
    origen,
    destino,
    vehiculoPlaca,
    conductorNombre,
  }
}

export const envios: EnvioDetalle[] = [
  envio('0412a7c1-0000-4000-8000-000000000001', 'EnCurso', SPS, TGU, hours(2.5), 'HND-4821', 'M. Castillo', 33900),
  envio('0407b2d4-0000-4000-8000-000000000002', 'Pendiente', LCE, TGU, hours(20), null, null, 28500, 'Importadora del Caribe'),
  envio('0402c9e8-0000-4000-8000-000000000003', 'Asignado', CHO, TGU, hours(-1.5), 'HND-2290', 'J. Mejía', 19800),
  envio('0398d1f2-0000-4000-8000-000000000004', 'EnCurso', PCO, SPS, hours(4), 'HND-1175', 'R. Díaz', 12400, 'Importadora del Caribe'),
  envio('0391e5a3-0000-4000-8000-000000000005', 'Asignado', TGU, CMY, hours(26), 'HND-5512', 'E. Flores', 9600),
  envio('0385f0b6-0000-4000-8000-000000000006', 'Completado', SPS, LCE, hours(-30), 'HND-4821', 'M. Castillo', 21000),
  envio('0379a4c7-0000-4000-8000-000000000007', 'EnCurso', CMY, CHO, hours(1), 'HND-3307', 'K. Rivera', 15200),
]

export const vehiculos: Vehiculo[] = [
  ['HND-4821', 'Cabezal con furgón', 'EnServicio'],
  ['HND-2290', 'Camión de carga', 'EnServicio'],
  ['HND-1175', 'Plataforma abierta', 'EnServicio'],
  ['HND-5512', 'Camión de carga', 'Disponible'],
  ['HND-3307', 'Cabezal con furgón', 'EnServicio'],
  ['HND-6640', 'Camión de carga', 'Disponible'],
  ['HND-7012', 'Plataforma abierta', 'Disponible'],
  ['HND-8123', 'Cabezal con furgón', 'Mantenimiento'],
  ['HND-9034', 'Camión de carga', 'Disponible'],
].map(([placa, tipoVehiculo, estado], index) => ({
  id: `v-${placa}`,
  tipoVehiculoId: `tv-${index % 3}`,
  tipoVehiculo,
  placa,
  vin: null,
  propiedad: 'Propio',
  estado: estado as Vehiculo['estado'],
  seguroVigente: true,
}))

export const documentosPorVencer: DocumentoPorVencer[] = [
  { documentoId: 'doc-1', vehiculoId: 'v-HND-4821', placa: 'HND-4821', tipo: 'Revision', numero: 'RFM-004912', fechaVencimiento: days(6), diasRestantes: 6, vencido: false },
  { documentoId: 'doc-2', vehiculoId: 'v-HND-8123', placa: 'HND-8123', tipo: 'Seguro', numero: 'SEG-2026-7710', fechaVencimiento: days(-2), diasRestantes: -2, vencido: true },
  { documentoId: 'doc-3', vehiculoId: 'v-HND-1175', placa: 'HND-1175', tipo: 'Seguro', numero: 'SEG-2026-8841', fechaVencimiento: days(21), diasRestantes: 21, vencido: false },
]

function subasta(
  id: string,
  descripcion: string,
  tipoVehiculo: string,
  pesoKg: number,
  precioMaximo: number,
  fechaCierre: string,
  estado: Subasta['estado'],
  totalPujas: number,
): Subasta {
  return {
    id,
    tipoVehiculoId: 'tv-0',
    tipoVehiculo,
    origenDireccionId: SPS.id,
    destinoDireccionId: TGU.id,
    descripcion,
    pesoKg,
    volumenM3: null,
    precioMaximo,
    monedaCodigo: 'HNL',
    fechaCierre,
    estado,
    totalPujas,
    envioId: estado === 'Adjudicada' ? envios[0].id : null,
  }
}

export const subastas: Subasta[] = [
  subasta('0148aa00-0000-4000-8000-000000000001', 'Granos básicos, a granel', 'Cabezal con furgón', 22000, 38000, hours(2.2), 'Abierta', 5),
  subasta('0147bb00-0000-4000-8000-000000000002', 'Fertilizante en sacos', 'Camión de carga', 12000, 21500, hours(9), 'Abierta', 3),
  subasta('0145cc00-0000-4000-8000-000000000003', 'Maquinaria agrícola', 'Plataforma abierta', 18000, 45000, hours(40), 'Abierta', 1),
  subasta('0142dd00-0000-4000-8000-000000000004', 'Café pergamino', 'Cabezal con furgón', 20000, 34000, hours(-20), 'Adjudicada', 6),
  subasta('0139ee00-0000-4000-8000-000000000005', 'Insumos veterinarios', 'Camión de carga', 6000, 14000, hours(-50), 'Vencida', 0),
]
