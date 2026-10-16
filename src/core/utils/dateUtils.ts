export const MS_PER_DAY = 24 * 60 * 60 * 1000

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function endOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Whole days from a to b (b - a), based on local calendar days. */
export function daysBetween(a: Date, b: Date): number {
  const start = startOfDay(a).getTime()
  const end = startOfDay(b).getTime()
  return Math.round((end - start) / MS_PER_DAY)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b)
}

export function isDue(dueDate: Date, now: Date): boolean {
  return startOfDay(dueDate).getTime() <= endOfDay(now).getTime()
}

/** Week number (0-indexed) containing the date, relative to an arbitrary start; used for report ranges. */
export function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
