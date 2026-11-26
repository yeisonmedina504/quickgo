import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import { login } from '../api/login.api'
import { loginSchema, type LoginFormValues } from '../schema/login.schema'
import type { LoginResponse } from '../types'

interface LoginFormProps {
  defaultEmail?: string
  onSuccess: (session: LoginResponse) => void
}

export function LoginForm({ defaultEmail = '', onSuccess }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      onSuccess(await login(values))
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (field === 'email' || field === 'password') setError(field, { message: messages[0] })
        }
        setServerError(
          error.status === 401 ? 'Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.' : error.message,
        )
        return
      }
      setServerError('Ocurrió un error inesperado. Inténtalo de nuevo.')
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="nombre@empresa.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" fullWidth loading={isSubmitting} trailingIcon={<ArrowRight aria-hidden className="size-5" />}>
        Entrar
      </Button>
    </form>
  )
}
