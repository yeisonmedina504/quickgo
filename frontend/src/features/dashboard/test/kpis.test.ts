import { describe, expect, it } from 'vitest'
import { estadoVisualEnvio } from '@/features/envios/estado'
import type { Envio } from '@/features/envios/types'
import type { Subasta } from '@/features/subastas/types'
import type { Vehiculo } from '@/features/vehiculos/types'
import { enviosActivosOrdenados, resumenEnvios, resumenFlota, resumenSubastasAbiertas } from '../api/kpis'

const NOW = new Date('2026-11-26T10:00:00Z').getTime()
const at = (h: number) => new Date(NOW + h * 3_600_000).toISOString()

const envio = (id: string, estado: Envio['estado'], fechaProgramada: string) =>
  ({ id, estado, fechaProgramada }) as Envio

describe('indicadores del panel', () => {
  const envios = [
    envio('a', 'EnCurso', at(2)),
    envio('b', 'Asignado', at(-1)),
    envio('c', 'Pendiente', at(5)),
    envio('d', 'Completado', at(-30)),
    envio('e', 'Cancelado', at(1)),
  ]

  it('resume los envíos por estado y detecta retrasos', () => {
    expect(resumenEnvios(envios, NOW)).toEqual({ enRuta: 1, asignados: 1, pendientes: 1, entregados: 1, retrasados: 1 })
  })

  it('lista solo envíos activos ordenados por fecha programada', () => {
    expect(enviosActivosOrdenados(envios).map((e) => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('cuenta subastas abiertas, las que cierran hoy y sus pujas', () => {
    const subastas = [
      { estado: 'Abierta', fechaCierre: at(2), totalPujas: 3 },
      { estado: 'Abierta', fechaCierre: at(48), totalPujas: 1 },
      { estado: 'Vencida', fechaCierre: at(-5), totalPujas: 4 },
    ] as Subasta[]
    expect(resumenSubastasAbiertas(subastas, new Date(NOW))).toEqual({ abiertas: 2, cierranHoy: 1, pujas: 4 })
  })

  it('excluye vehículos de baja del total de flota', () => {
    const vehiculos = [{ estado: 'Disponible' }, { estado: 'EnServicio' }, { estado: 'Baja' }] as Vehiculo[]
    expect(resumenFlota(vehiculos)).toEqual({ disponibles: 1, total: 2 })
  })
})

describe('estadoVisualEnvio', () => {
  it('muestra En ruta para envíos en curso', () => {
    expect(estadoVisualEnvio({ estado: 'EnCurso', fechaProgramada: at(-2) }, NOW)).toEqual({ label: 'En ruta', tone: 'ruta' })
  })

  it('marca Retrasado un asignado cuya salida ya pasó (estado + texto, no solo color)', () => {
    expect(estadoVisualEnvio({ estado: 'Asignado', fechaProgramada: at(-1) }, NOW)).toEqual({
      label: 'Retrasado',
      tone: 'alerta',
    })
  })
})
