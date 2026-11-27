import type { Envio } from '@/features/envios/types'
import type { Subasta } from '@/features/subastas/types'
import type { DocumentoPorVencer, Vehiculo } from '@/features/vehiculos/types'
import { isToday } from '@/lib/format'

/** Cálculos puros de los indicadores del panel (testeables sin red). */

export function resumenEnvios(envios: Envio[], now = Date.now()) {
  const enRuta = envios.filter((e) => e.estado === 'EnCurso').length
  const asignados = envios.filter((e) => e.estado === 'Asignado').length
  const pendientes = envios.filter((e) => e.estado === 'Pendiente').length
  const entregados = envios.filter((e) => e.estado === 'Completado').length
  const retrasados = envios.filter(
    (e) => (e.estado === 'Pendiente' || e.estado === 'Asignado') && new Date(e.fechaProgramada).getTime() < now,
  ).length
  return { enRuta, asignados, pendientes, entregados, retrasados }
}

export function resumenSubastasAbiertas(subastas: Subasta[], now = new Date()) {
  const abiertas = subastas.filter((s) => s.estado === 'Abierta')
  return {
    abiertas: abiertas.length,
    cierranHoy: abiertas.filter((s) => isToday(s.fechaCierre, now)).length,
    pujas: abiertas.reduce((total, s) => total + s.totalPujas, 0),
  }
}

export function resumenFlota(vehiculos: Vehiculo[]) {
  const activos = vehiculos.filter((v) => v.estado !== 'Baja')
  return {
    disponibles: activos.filter((v) => v.estado === 'Disponible').length,
    total: activos.length,
  }
}

export function resumenDocumentos(documentos: DocumentoPorVencer[]) {
  return { total: documentos.length, vencidos: documentos.filter((d) => d.vencido).length }
}

export function enviosActivosOrdenados(envios: Envio[], limit = 6): Envio[] {
  return envios
    .filter((e) => e.estado === 'Pendiente' || e.estado === 'Asignado' || e.estado === 'EnCurso')
    .sort((a, b) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime())
    .slice(0, limit)
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** "1 cierra hoy" / "3 cierran hoy". */
export function cierranHoy(count: number): string {
  return count === 1 ? '1 cierra hoy' : `${count} cierran hoy`
}
