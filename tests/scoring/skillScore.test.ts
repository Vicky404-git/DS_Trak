import { describe, expect, it } from 'vitest'
import { computeSkillScore } from '../../src/core/scoring/skillScore'
import type { ItemProgress } from '../../src/types/item'
import { createEmptyReflection } from '../../src/types/item'

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

describe('computeSkillScore', () => {
  it('is 0 with no data', () => {
    expect(computeSkillScore('optimization', [])).toBe(0)
  })

  it('rewards a clean solve with filled reflection fields', () => {
    const filled = item({
      result: 'CLEAN',
      reflection: {
        ...createEmptyReflection(),
        bottleneck: 'O(n^2) scan',
        optimization: 'hash map lookup',
      },
    })
    const score = computeSkillScore('optimization', [filled])
    expect(score).toBeGreaterThan(8)
    expect(score).toBeLessThanOrEqual(10)
  })

  it('penalizes missed-edge-case tags for the edge cases skill', () => {
    const clean = item({ id: 'a', result: 'CLEAN' })
    const buggy = item({ id: 'b', result: 'CLEAN', bugTags: ['missed-edge-case'] })
    const cleanScore = computeSkillScore('edge cases', [clean, clean, clean])
    const buggyScore = computeSkillScore('edge cases', [buggy, buggy, buggy])
    expect(buggyScore).toBeLessThan(cleanScore)
  })

  it('returns a value within 0-10', () => {
    const it0 = item({ result: 'SOL', reflection: createEmptyReflection() })
    const score = computeSkillScore('algorithm design', [it0])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)
  })
})
