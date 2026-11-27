import { useQuery } from '@tanstack/react-query'
import type { EstadoSubasta } from '../types'
import { listarMisSubastas, listarSubastasAbiertas } from './subastas.api'

export const subastasKeys = {
  abiertas: ['subastas', 'abiertas'] as const,
  mias: (estado?: EstadoSubasta) => ['subastas', 'mias', estado ?? 'todas'] as const,
}

export function useSubastasAbiertas(enabled = true) {
  return useQuery({ queryKey: subastasKeys.abiertas, queryFn: () => listarSubastasAbiertas(), enabled })
}

export function useMisSubastas(estado?: EstadoSubasta, enabled = true) {
  return useQuery({ queryKey: subastasKeys.mias(estado), queryFn: () => listarMisSubastas(estado), enabled })
}
