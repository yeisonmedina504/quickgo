import { describe, expect, it } from 'vitest'
import { toRegistroRequest } from '../api/registro.api'
import { empresaStepSchema, formatRtn, registroSchema, type RegistroFormValues } from '../schema/registro.schema'

const valid: RegistroFormValues = {
  tipo: 'Transportista',
  nombreComercial: 'Transportes Ejemplo',
  razonSocial: 'Transportes Ejemplo S.A.',
  rtn: '0801-1990-123456',
  plan: 'Profesional',
  primerNombre: 'Marco',
  segundoNombre: '',
  primerApellido: 'Castillo',
  segundoApellido: '',
  telefono: '',
  email: 'admin@ejemplo.hn',
  password: 'Camion2026',
  confirmPassword: 'Camion2026',
}

describe('registroSchema', () => {
  it('acepta un registro completo', () => {
    expect(registroSchema.safeParse(valid).success).toBe(true)
  })

  it('aplica las reglas de contraseña del backend', () => {
    const result = registroSchema.safeParse({ ...valid, password: 'sololetras', confirmPassword: 'sololetras' })
    expect(result.error?.issues[0].message).toBe('La contraseña debe incluir al menos un número.')
  })

  it('detecta contraseñas que no coinciden', () => {
    const result = registroSchema.safeParse({ ...valid, confirmPassword: 'Otra2026' })
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
  })

  it('valida el formato del RTN', () => {
    expect(empresaStepSchema.safeParse({ ...valid, rtn: '0801-1990' }).success).toBe(false)
  })
})

describe('formatRtn', () => {
  it('agrupa los 14 dígitos como 0000-0000-000000', () => {
    expect(formatRtn('08011990123456789')).toBe('0801-1990-123456')
    expect(formatRtn('0801ab19')).toBe('0801-19')
  })
})

describe('toRegistroRequest', () => {
  it('envía null en los campos opcionales vacíos y omite la confirmación', () => {
    const request = toRegistroRequest(valid)
    expect(request.segundoNombre).toBeNull()
    expect(request.telefono).toBeNull()
    expect(request).not.toHaveProperty('confirmPassword')
  })
})
