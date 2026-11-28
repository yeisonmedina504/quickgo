const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** Montos en formato del DS: "L 38,000.00". */
export function formatMoney(value: number, currency = 'HNL'): string {
  const symbol = currency === 'HNL' ? 'L' : currency === 'USD' ? '$' : currency
  return `${symbol} ${money.format(value)}`
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return kg >= 1000 ? `${number.format(kg / 1000)} t` : `${number.format(kg)} kg`
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const time = new Intl.DateTimeFormat('es-HN', { hour: '2-digit', minute: '2-digit', hour12: false })
const shortDate = new Intl.DateTimeFormat('es-HN', { day: '2-digit', month: '2-digit' })

/** "Hoy 14:40", "Mañana 08:00" o "25/11 08:00". */
export function formatRelativeDateTime(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const prefix = sameDay(date, now)
    ? 'Hoy'
    : sameDay(date, tomorrow)
      ? 'Mañana'
      : sameDay(date, yesterday)
        ? 'Ayer'
        : shortDate.format(date)
  return `${prefix} ${time.format(date)}`
}

export function isToday(iso: string, now = new Date()): boolean {
  return sameDay(new Date(iso), now)
}

/** Tiempo restante hasta un cierre: "02:14 h", "1 d 4 h" o "Cerrada". */
export function formatCountdown(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return 'Cerrada'
  const totalMinutes = Math.floor(diff / 60_000)
  const d = Math.floor(totalMinutes / 1440)
  const h = Math.floor((totalMinutes % 1440) / 60)
  const m = totalMinutes % 60
  if (d > 0) return `${d} d ${h} h`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} h`
}

/** Código corto legible derivado del GUID (el backend no expone un correlativo). */
export function shortCode(id: string, prefix = 'QG'): string {
  return `${prefix}-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
