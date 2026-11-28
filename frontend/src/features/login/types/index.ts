export type TipoEmpresa = 'Transportista' | 'Contratante'

export interface LoginRequest {
  email: string
  password: string
}

/** Respuesta de POST /api/auth/login. */
export interface LoginResponse {
  token: string
  expiraEn: string
  nombreCompleto: string
  rol: string
  tipoEmpresa: TipoEmpresa
}
