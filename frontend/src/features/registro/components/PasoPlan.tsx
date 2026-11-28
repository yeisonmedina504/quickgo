import { useFormContext, useFormState } from 'react-hook-form'
import { Building2, Layers, Rocket } from 'lucide-react'
import { RadioCard } from '@/components/ui/RadioCard'
import type { RegistroFormValues } from '../schema/registro.schema'
import type { PlanEmpresa } from '../types'

const PLANES: Array<{ value: PlanEmpresa; title: string; description: string; icon: typeof Rocket }> = [
  { value: 'Basico', title: 'Básico', description: 'Para empezar a operar con un equipo pequeño.', icon: Rocket },
  { value: 'Profesional', title: 'Profesional', description: 'Para operaciones en crecimiento con varios despachadores.', icon: Layers },
  { value: 'Empresarial', title: 'Empresarial', description: 'Para flotas y volúmenes de carga a gran escala.', icon: Building2 },
]

export function PasoPlan() {
  const {
    register,
  } = useFormContext<RegistroFormValues>()
  // Suscripción propia: el padre compilado por React Compiler no re-renderiza los pasos.
  const { errors } = useFormState<RegistroFormValues>()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-label font-medium text-asfalto-2">Plan de la empresa</legend>
      {PLANES.map(({ value, title, description, icon: Icon }) => (
        <RadioCard
          key={value}
          value={value}
          title={title}
          description={description}
          icon={<Icon aria-hidden className="size-5" />}
          {...register('plan')}
        />
      ))}
      {errors.plan && <p className="text-label font-medium text-alerta">{errors.plan.message}</p>}
      <p className="text-label text-asfalto-3">Podrás cambiar de plan más adelante desde el perfil de empresa.</p>
    </fieldset>
  )
}
