import { z } from 'zod'

// Refleja RegistroEmpresaValidator y ReglasComunes del backend.
const requerido = (campo: string, max: number) =>
  z.string().trim().min(1, `${campo} es obligatorio.`).max(max, `${campo} no puede tener más de ${max} caracteres.`)

const opcional = (campo: string, max: number) =>
  z.string().trim().max(max, `${campo} no puede tener más de ${max} caracteres.`)

/** Formato del RTN hondureño: 14 dígitos → 0000-0000-000000. */
export function formatRtn(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8)].filter(Boolean).join('-')
}

export const empresaStepSchema = z.object({
  tipo: z.enum(['Transportista', 'Contratante'], { error: 'Selecciona el tipo de empresa.' }),
  nombreComercial: requerido('El nombre comercial', 150),
  razonSocial: z
    .string()
    .trim()
    .min(1, 'La razón social es obligatoria.')
    .max(150, 'La razón social no puede tener más de 150 caracteres.'),
  rtn: z
    .string()
    .trim()
    .min(1, 'El RTN es obligatorio.')
    .regex(/^\d{4}-\d{4}-\d{6}$/, 'El RTN debe tener 14 dígitos (0000-0000-000000).'),
})

export const planStepSchema = z.object({
  plan: z.enum(['Basico', 'Profesional', 'Empresarial'], { error: 'Selecciona un plan.' }),
})

export const cuentaStepSchema = z.object({
  primerNombre: requerido('El primer nombre', 60),
  segundoNombre: opcional('El segundo nombre', 60),
  primerApellido: requerido('El primer apellido', 60),
  segundoApellido: opcional('El segundo apellido', 60),
  telefono: opcional('El teléfono', 30),
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio.')
    .max(150, 'El correo electrónico no puede tener más de 150 caracteres.')
    .email('El correo electrónico no tiene un formato válido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
})

export const registroSchema = empresaStepSchema
  .extend(planStepSchema.shape)
  .extend(cuentaStepSchema.shape)
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
    // Se evalúa aunque otros campos tengan errores, para avisar en el mismo intento.
    when: (payload) => {
      const value = payload.value as { password?: unknown; confirmPassword?: unknown }
      return typeof value.password === 'string' && typeof value.confirmPassword === 'string'
    },
  })

export type RegistroFormValues = z.infer<typeof registroSchema>

/** Campos que valida cada paso del asistente (en orden). */
export const STEP_FIELDS = [
  Object.keys(empresaStepSchema.shape),
  Object.keys(planStepSchema.shape),
  [...Object.keys(cuentaStepSchema.shape)],
] as Array<Array<keyof RegistroFormValues>>

export function stepOfField(field: string): number {
  const index = STEP_FIELDS.findIndex((fields) => (fields as string[]).includes(field))
  return index === -1 ? 0 : index
}
