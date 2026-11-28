import { useFormContext, useFormState } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField'
import type { RegistroFormValues } from '../schema/registro.schema'

export function PasoCuenta() {
  const {
    register,
  } = useFormContext<RegistroFormValues>()
  // Suscripción propia: el padre compilado por React Compiler no re-renderiza los pasos.
  const { errors } = useFormState<RegistroFormValues>()

  return (
    <div className="flex flex-col gap-6">
      <p className="text-label text-asfalto-2">
        Esta persona será el <span className="font-semibold text-asfalto">Administrador</span> de la empresa y podrá
        invitar al resto del equipo.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Primer nombre" autoComplete="given-name" error={errors.primerNombre?.message} {...register('primerNombre')} />
        <TextField label="Segundo nombre" optional autoComplete="additional-name" error={errors.segundoNombre?.message} {...register('segundoNombre')} />
        <TextField label="Primer apellido" autoComplete="family-name" error={errors.primerApellido?.message} {...register('primerApellido')} />
        <TextField label="Segundo apellido" optional error={errors.segundoApellido?.message} {...register('segundoApellido')} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Teléfono"
          optional
          type="tel"
          mono
          autoComplete="tel"
          placeholder="+504 9999-0000"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con letras y números."
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
    </div>
  )
}
