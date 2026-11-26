import { describe, expect, it } from 'vitest'
import { loginSchema } from '../schema/login.schema'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ email: 'admin@quickgo.demo', password: 'secreto1' }).success).toBe(true)
  })

  it('exige correo y contraseña', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toContain('El correo electrónico es obligatorio.')
    expect(messages).toContain('La contraseña es obligatoria.')
  })

  it('rechaza correos con formato inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-correo', password: 'x' })
    expect(result.error?.issues[0].message).toBe('El correo electrónico no tiene un formato válido.')
  })
})
