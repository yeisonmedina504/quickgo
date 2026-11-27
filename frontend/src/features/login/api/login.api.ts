import { http } from '@/lib/http'
import type { LoginRequest, LoginResponse } from '../types'

export function login(request: LoginRequest): Promise<LoginResponse> {
  return http<LoginResponse>('/auth/login', { method: 'POST', body: request })
}
