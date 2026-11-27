import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  FileText,
  Gavel,
  IdCard,
  LayoutDashboard,
  MapPin,
  Navigation,
  Package,
  Truck,
  Users,
} from 'lucide-react'
import type { Rol } from '@/lib/roles'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Roles con acceso, según los [Authorize] del backend. */
  roles: readonly Rol[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const TODOS: Rol[] = ['Admin', 'Despachador', 'Conductor', 'Contratante']
const OPERACION: Rol[] = ['Admin', 'Despachador', 'Conductor']
const GESTION: Rol[] = ['Admin', 'Despachador']

export const NAVIGATION: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { label: 'Panel', path: '/panel', icon: LayoutDashboard, roles: TODOS },
      { label: 'Envíos', path: '/envios', icon: Package, roles: OPERACION },
      { label: 'Seguimiento', path: '/seguimiento', icon: Navigation, roles: OPERACION },
      { label: 'Subastas', path: '/subastas', icon: Gavel, roles: ['Admin', 'Despachador', 'Contratante'] },
    ],
  },
  {
    label: 'Flota y equipo',
    items: [
      { label: 'Vehículos', path: '/vehiculos', icon: Truck, roles: OPERACION },
      { label: 'Conductores', path: '/conductores', icon: IdCard, roles: GESTION },
      { label: 'Usuarios', path: '/usuarios', icon: Users, roles: ['Admin'] },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Clientes', path: '/clientes', icon: Building2, roles: GESTION },
      { label: 'Direcciones', path: '/direcciones', icon: MapPin, roles: ['Admin', 'Despachador', 'Contratante'] },
      { label: 'Facturas', path: '/facturas', icon: FileText, roles: GESTION },
    ],
  },
  {
    label: 'Configuración',
    items: [{ label: 'Catálogos', path: '/catalogos', icon: BookOpen, roles: ['Admin'] }],
  },
]

export const NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) => group.items)

export function navigationFor(rol: string): NavGroup[] {
  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => (item.roles as readonly string[]).includes(rol)),
  })).filter((group) => group.items.length > 0)
}
