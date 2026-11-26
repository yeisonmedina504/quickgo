import { z } from 'zod'

// Refleja LoginValidator del backend.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio.')
    .email('El correo electrónico no tiene un formato válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
