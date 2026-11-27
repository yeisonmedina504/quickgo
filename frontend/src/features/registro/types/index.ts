import type { TipoEmpresa } from '@/features/login/types'

export type { TipoEmpresa }
export type PlanEmpresa = 'Basico' | 'Profesional' | 'Empresarial'

/** Cuerpo de POST /api/empresas/registro. */
export interface RegistroEmpresaRequest {
  nombreComercial: string
  razonSocial: string
  rtn: string
  tipo: TipoEmpresa
  plan: PlanEmpresa | null
  primerNombre: string
  segundoNombre: string | null
  primerApellido: string
  segundoApellido: string | null
  telefono: string | null
  email: string
  password: string
}

export interface EmpresaResponse {
  id: string
  nombreComercial: string
  razonSocial: string
  slug: string
  rtn: string
  tipo: TipoEmpresa
  plan: PlanEmpresa | null
  activa: boolean
}
