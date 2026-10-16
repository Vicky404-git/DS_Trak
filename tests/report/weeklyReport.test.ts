import { describe, expect, it } from 'vitest'
import { generateWeeklyReport, startOfWeek } from '../../src/core/report/weeklyReport'
import type { ItemProgress } from '../../src/types/item'
import { createEmptyReflection } from '../../src/types/item'
import { DEFAULT_SETTINGS } from '../../src/types/stats'
import { toISODate } from '../../src/core/utils/dateUtils'

function item(partial: Partial<ItemProgress>): ItemProgress {
  return {
    id: 'x',
    title: 'x',
    week: 1,
    kind: 'core',
    status: 'solved',
    timeSpentMs: 0,
    sessions: [],
    reflection: createEmptyReflection(),
    notesMarkdown: '',
    cppScratchpad: '',
    bugTags: [],
    bugNote: '',
    conceptsTrained: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    revisitCount: 0,
    ...partial,
  }
}

describe('startOfWeek', () => {
  it('returns the preceding Sunday', () => {
    expect(toISODate(startOfWeek(new Date('2026-06-03T12:00:00')))).toBe('2026-05-31')
  })
})

describe('generateWeeklyReport', () => {
  const now = new Date('2026-06-05T12:00:00')

  it('includes per-item rows and summary sections', () => {
    const items = [
      item({
        id: '1-C1',
        title: 'Best Resale Window',
        week: 1,
        result: 'H1',
        confidence: 4,
        timeSpentMs: 35 * 60_000,
        bugTags: ['off-by-one'],
        notesMarkdown: 'Used a sliding window to track the minimum so far.',
        reflection: { ...createEmptyReflection(), complexityTime: 'O(n)', complexitySpace: 'O(1)' },
      }),
    ]
    const md = generateWeeklyReport({
      week: 1,
      weekTitle: 'Toolkit',
      items,
      hintLog: [],
      bugLog: [],
      activity: [],
      settings: DEFAULT_SETTINGS,
      now,
    })

    expect(md).toContain('# Weekly Report — Week 1: Toolkit')
    expect(md).toContain('| 1-C1 | H1 | 35m | 1 |')
    expect(md).toContain('off-by-one')
    expect(md).toContain('O(n) / O(1)')
    expect(md).toContain('sliding window')
    expect(md).toContain('## Revisits Due')
    expect(md).toContain('## Heatmap Totals')
  })

  it('handles empty weeks', () => {
    const md = generateWeeklyReport({
      week: 5,
      items: [],
      hintLog: [],
      bugLog: [],
      activity: [],
      settings: DEFAULT_SETTINGS,
      now,
    })
    expect(md).toContain('No performance data yet.')
    expect(md).toContain('- None')
  })

  it('lists due revisits', () => {
    const items = [item({ id: '2-C1', revisitDueAt: '2026-06-20T00:00:00.000Z' })]
    const md = generateWeeklyReport({
      week: 2,
      items,
      hintLog: [],
      bugLog: [],
      activity: [],
      settings: DEFAULT_SETTINGS,
      now,
    })
    expect(md).toContain('2-C1')
    expect(md).toContain('due 2026-06-20')
  })
})
