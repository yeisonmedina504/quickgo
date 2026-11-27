import { http } from '@/lib/http'
import type { RegistroFormValues } from '../schema/registro.schema'
import type { EmpresaResponse, RegistroEmpresaRequest } from '../types'

const orNull = (value: string | undefined) => (value && value.trim() ? value.trim() : null)

export function toRegistroRequest(values: RegistroFormValues): RegistroEmpresaRequest {
  return {
    nombreComercial: values.nombreComercial.trim(),
    razonSocial: values.razonSocial.trim(),
    rtn: values.rtn,
    tipo: values.tipo,
    plan: values.plan,
    primerNombre: values.primerNombre.trim(),
    segundoNombre: orNull(values.segundoNombre),
    primerApellido: values.primerApellido.trim(),
    segundoApellido: orNull(values.segundoApellido),
    telefono: orNull(values.telefono),
    email: values.email.trim(),
    password: values.password,
  }
}

export function registrarEmpresa(request: RegistroEmpresaRequest): Promise<EmpresaResponse> {
  return http<EmpresaResponse>('/empresas/registro', { method: 'POST', body: request })
}
