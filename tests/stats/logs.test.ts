import { describe, expect, it } from 'vitest'
import { filterBugLog, getTopBugTags, summarizeHintLog } from '../../src/core/stats/logs'
import type { BugLogEntry, HintLogEntry } from '../../src/types/stats'

function hint(week: number, result: HintLogEntry['result']): HintLogEntry {
  return { id: `${week}-${result}-${Math.random()}`, itemId: 'x', week, result, timestamp: '' }
}

function bug(week: number, tags: string[]): BugLogEntry {
  return { id: `b-${Math.random()}`, itemId: 'x', week, bugTags: tags, bugNote: '', timestamp: '' }
}

describe('summarizeHintLog', () => {
  it('counts by result type per week', () => {
    const rows = summarizeHintLog([hint(1, 'CLEAN'), hint(1, 'H1'), hint(1, 'CLEAN'), hint(2, 'SOL')])
    expect(rows).toHaveLength(2)
    const week1 = rows.find((r) => r.week === 1)!
    expect(week1.counts.CLEAN).toBe(2)
    expect(week1.counts.H1).toBe(1)
    expect(week1.total).toBe(3)
    expect(week1.cleanRate).toBeCloseTo(2 / 3)
  })

  it('returns empty for no entries', () => {
    expect(summarizeHintLog([])).toEqual([])
  })
})

describe('getTopBugTags', () => {
  it('orders tags by frequency then name', () => {
    const entries = [bug(1, ['logic', 'overflow']), bug(1, ['logic']), bug(2, ['overflow'])]
    const top = getTopBugTags(entries)
    expect(top[0]).toEqual({ tag: 'logic', count: 2 })
    expect(top[1]).toEqual({ tag: 'overflow', count: 2 })
  })

  it('respects the limit', () => {
    const entries = [bug(1, ['a']), bug(1, ['b']), bug(1, ['c'])]
    expect(getTopBugTags(entries, 2)).toHaveLength(2)
  })
})

describe('filterBugLog', () => {
  const entries = [bug(1, ['logic']), bug(2, ['overflow'])]
  it('filters by week', () => {
    expect(filterBugLog(entries, { week: 2 })).toHaveLength(1)
  })
  it('filters by tag', () => {
    expect(filterBugLog(entries, { tag: 'logic' })).toHaveLength(1)
  })
  it('returns all with no filter', () => {
    expect(filterBugLog(entries, {})).toHaveLength(2)
  })
})
