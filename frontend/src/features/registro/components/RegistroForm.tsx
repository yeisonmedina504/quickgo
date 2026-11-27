import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/http'
import { registrarEmpresa, toRegistroRequest } from '../api/registro.api'
import { registroSchema, STEP_FIELDS, stepOfField, type RegistroFormValues } from '../schema/registro.schema'
import type { EmpresaResponse } from '../types'
import { PasoCuenta } from './PasoCuenta'
import { PasoEmpresa } from './PasoEmpresa'
import { PasoPlan } from './PasoPlan'
import { RegistroStepper } from './RegistroStepper'
import { REGISTRO_STEPS } from './registroSteps'

const STEP_DESCRIPTIONS = [
  'Cuéntanos quién eres y cómo opera tu empresa.',
  'Elige el plan que mejor se ajusta a tu operación.',
  'Crea la cuenta con la que administrarás la empresa.',
]

/** Mensajes de conflicto (409) del backend → campo afectado. */
function fieldFromConflict(message: string): keyof RegistroFormValues | null {
  const text = message.toLowerCase()
  if (text.includes('rtn')) return 'rtn'
  if (text.includes('email') || text.includes('correo')) return 'email'
  if (text.includes('nombre comercial')) return 'nombreComercial'
  return null
}

interface RegistroFormProps {
  onSuccess: (empresa: EmpresaResponse, values: RegistroFormValues) => Promise<void> | void
}

export function RegistroForm({ onSuccess }: RegistroFormProps) {
  const [step, setStep] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  const methods = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    mode: 'onTouched',
    defaultValues: {
      tipo: undefined,
      nombreComercial: '',
      razonSocial: '',
      rtn: '',
      plan: 'Basico',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const { handleSubmit, trigger, setError, formState } = methods
  const isLast = step === REGISTRO_STEPS.length - 1

  // Mueve el foco al título del paso para lectores de pantalla y teclado.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true })
    if (valid) setStep((current) => current + 1)
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const empresa = await registrarEmpresa(toRegistroRequest(values))
      await onSuccess(empresa, values)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setServerError('Ocurrió un error inesperado. Inténtalo de nuevo.')
        return
      }

      const fieldEntries = Object.entries(error.fieldErrors)
      const conflictField = error.status === 409 ? fieldFromConflict(error.message) : null
      if (conflictField) fieldEntries.push([conflictField, [error.message]])

      let firstStep = Number.POSITIVE_INFINITY
      for (const [field, messages] of fieldEntries) {
        if (field in values) {
          setError(field as keyof RegistroFormValues, { message: messages[0] })
          firstStep = Math.min(firstStep, stepOfField(field))
        }
      }
      if (Number.isFinite(firstStep)) setStep(firstStep)
      setServerError(error.message)
    }
  })

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={isLast ? onSubmit : (event) => (event.preventDefault(), void goNext())} className="flex flex-col gap-8">
        <RegistroStepper current={step} />

        <div className="flex flex-col gap-6 rounded-card border border-linea bg-blanco p-6 sm:p-8">
          <header className="flex flex-col gap-1">
            <p className="text-overline uppercase text-asfalto-3">
              Paso <span className="font-mono">{step + 1}</span> de <span className="font-mono">{REGISTRO_STEPS.length}</span>
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-h3 text-asfalto focus:outline-none">
              {REGISTRO_STEPS[step]}
            </h2>
            <p className="text-label text-asfalto-2">{STEP_DESCRIPTIONS[step]}</p>
          </header>

          {serverError && (
            <Alert tone="error" title="No pudimos registrar la empresa">
              {serverError}
            </Alert>
          )}

          {step === 0 && <PasoEmpresa />}
          {step === 1 && <PasoPlan />}
          {step === 2 && <PasoCuenta />}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setStep((current) => current - 1)}
              disabled={formState.isSubmitting}
              leadingIcon={<ArrowLeft aria-hidden className="size-5" />}
            >
              Atrás
            </Button>
          ) : (
            <span aria-hidden className="hidden sm:block" />
          )}
          <Button
            type="submit"
            loading={formState.isSubmitting}
            trailingIcon={isLast ? undefined : <ArrowRight aria-hidden className="size-5" />}
          >
            {isLast ? 'Crear empresa' : 'Continuar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
