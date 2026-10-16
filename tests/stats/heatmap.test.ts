import { describe, expect, it } from 'vitest'
import { buildHeatmap, computeStreak, totalMinutesInRange } from '../../src/core/stats/heatmap'
import type { DailyActivity } from '../../src/types/stats'

function activity(minutesByDate: Record<string, number>): DailyActivity[] {
  return Object.entries(minutesByDate).map(([date, minutes]) => ({
    date,
    minutes,
    itemsStudied: [],
    lastUpdated: `${date}T00:00:00.000Z`,
  }))
}

describe('buildHeatmap', () => {
  it('builds a grid of weeks with 7 days each', () => {
    const grid = buildHeatmap([], new Date('2026-06-01T00:00:00'), 4)
    expect(grid).toHaveLength(4)
    expect(grid[0]).toHaveLength(7)
  })

  it('places minutes on the correct date', () => {
    const grid = buildHeatmap(activity({ '2026-06-01': 45 }), new Date('2026-06-01T00:00:00'), 4)
    const flat = grid.flat()
    expect(flat.find((c) => c.date === '2026-06-01')?.minutes).toBe(45)
  })
})

describe('totalMinutesInRange', () => {
  it('sums only dates within the range', () => {
    const a = activity({ '2026-06-01': 30, '2026-06-02': 20, '2026-06-10': 50 })
    const total = totalMinutesInRange(a, new Date('2026-06-01'), new Date('2026-06-02'))
    expect(total).toBe(50)
  })
})

describe('computeStreak', () => {
  const now = new Date('2026-06-05T12:00:00')

  it('counts consecutive studied days', () => {
    const a = activity({ '2026-06-05': 30, '2026-06-04': 30, '2026-06-03': 30 })
    expect(computeStreak(a, 0, now)).toBe(3)
  })

  it('allows a rest day gap without breaking the streak', () => {
    // 2026-06-05 is a Friday, 2026-06-04 Thursday, rest day Sunday (0)
    const a = activity({ '2026-06-05': 30, '2026-06-04': 30 })
    expect(computeStreak(a, 0, now)).toBe(2)
  })

  it('is 0 when today is a non-rest day with no activity', () => {
    const a = activity({ '2026-06-04': 30 })
    expect(computeStreak(a, 0, now)).toBe(0)
  })

  it('does not break when today is a rest day with no activity', () => {
    const sunday = new Date('2026-06-07T12:00:00')
    const a = activity({ '2026-06-06': 30, '2026-06-05': 30 })
    expect(computeStreak(a, 0, sunday)).toBe(2)
  })
})
