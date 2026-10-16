import type { DailyActivity } from '../../types/stats'
import { addDays, toISODate } from '../utils/dateUtils'

export interface HeatmapCell {
  date: string
  minutes: number
}

/** Build a dense grid of days ending at `end`, spanning `weeks` full weeks (Sunday-first). */
export function buildHeatmap(
  activity: DailyActivity[],
  end: Date = new Date(),
  weeks = 16,
): HeatmapCell[][] {
  const byDate = new Map(activity.map((a) => [a.date, a.minutes]))

  const endDay = new Date(end)
  endDay.setHours(0, 0, 0, 0)
  const endSunday = addDays(endDay, -endDay.getDay())
  const start = addDays(endSunday, -(weeks - 1) * 7)

  const grid: HeatmapCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const column: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d)
      const iso = toISODate(date)
      column.push({ date: iso, minutes: byDate.get(iso) ?? 0 })
    }
    grid.push(column)
  }
  return grid
}

export function totalMinutesInRange(
  activity: DailyActivity[],
  start: Date,
  end: Date,
): number {
  const startIso = toISODate(start)
  const endIso = toISODate(end)
  return activity
    .filter((a) => a.date >= startIso && a.date <= endIso)
    .reduce((sum, a) => sum + a.minutes, 0)
}

/**
 * Consecutive-day streak counting backwards from `now`.
 * A rest day (configurable) does not break the streak when unstudied.
 * Today does not break the streak if it has no activity yet.
 */
export function computeStreak(
  activity: DailyActivity[],
  restDay: number,
  now: Date = new Date(),
): number {
  const byDate = new Map(activity.map((a) => [a.date, a.minutes]))
  let streak = 0
  let cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  const todayIso = toISODate(cursor)
  if ((byDate.get(todayIso) ?? 0) === 0) {
    if (cursor.getDay() === restDay) {
      cursor = addDays(cursor, -1)
    } else {
      return 0
    }
  }

  for (let i = 0; i < 3650; i++) {
    const iso = toISODate(cursor)
    const minutes = byDate.get(iso) ?? 0
    const isRest = cursor.getDay() === restDay

    if (minutes > 0) {
      streak++
    } else if (!isRest) {
      break
    }
    cursor = addDays(cursor, -1)
  }

  return streak
}
