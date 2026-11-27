export type Rol = 'Admin' | 'Despachador' | 'Conductor' | 'Contratante'

export const ROL_LABEL: Record<Rol, string> = {
  Admin: 'Administrador',
  Despachador: 'Despachador',
  Conductor: 'Conductor',
  Contratante: 'Cliente',
}

export function hasRole(rol: string, allowed: readonly Rol[]): boolean {
  return (allowed as readonly string[]).includes(rol)
}
