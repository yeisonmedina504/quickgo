import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { Package, Truck } from 'lucide-react'
import { RadioCard } from '@/components/ui/RadioCard'
import { TextField } from '@/components/ui/TextField'
import { formatRtn, type RegistroFormValues } from '../schema/registro.schema'

export function PasoEmpresa() {
  const {
    register,
    control,
  } = useFormContext<RegistroFormValues>()
  // Suscripción propia: el padre compilado por React Compiler no re-renderiza los pasos.
  const { errors } = useFormState<RegistroFormValues>()

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-label font-medium text-asfalto-2">Tipo de empresa</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard
            value="Transportista"
            title="Empresa transportista"
            description="Tengo flota y pujo por cargas."
            icon={<Truck aria-hidden className="size-5" />}
            {...register('tipo')}
          />
          <RadioCard
            value="Contratante"
            title="Empresa cliente"
            description="Necesito mover mercancía."
            icon={<Package aria-hidden className="size-5" />}
            {...register('tipo')}
          />
        </div>
        {errors.tipo && <p className="text-label font-medium text-alerta">{errors.tipo.message}</p>}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Nombre comercial"
          placeholder="Transportes Ejemplo"
          autoComplete="organization"
          error={errors.nombreComercial?.message}
          {...register('nombreComercial')}
        />
        <TextField
          label="Razón social"
          placeholder="Transportes Ejemplo S.A."
          error={errors.razonSocial?.message}
          {...register('razonSocial')}
        />
      </div>

      <Controller
        control={control}
        name="rtn"
        render={({ field, fieldState }) => (
          <TextField
            label="RTN"
            mono
            inputMode="numeric"
            placeholder="0000-0000-000000"
            hint="Registro Tributario Nacional de 14 dígitos."
            error={fieldState.error?.message}
            ref={field.ref}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(formatRtn(event.target.value))}
          />
        )}
      />
    </div>
  )
}
