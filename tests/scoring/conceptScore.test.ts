import { describe, expect, it } from 'vitest'
import {
  computeAllConceptScores,
  computeConceptScore,
  recencyWeight,
  resultScore,
  revisitBonus,
} from '../../src/core/scoring/conceptScore'
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

const NOW = new Date('2026-06-01T12:00:00.000Z')

describe('resultScore', () => {
  it('maps results to documented base scores', () => {
    expect(resultScore('CLEAN')).toBe(1)
    expect(resultScore('H1')).toBe(0.75)
    expect(resultScore('H2')).toBe(0.5)
    expect(resultScore('H3')).toBe(0.3)
    expect(resultScore('SOL')).toBe(0.1)
  })
})

describe('recencyWeight', () => {
  it('is 1 at zero days and halves every 14 days', () => {
    expect(recencyWeight(0)).toBe(1)
    expect(recencyWeight(14)).toBeCloseTo(0.5)
    expect(recencyWeight(28)).toBeCloseTo(0.25)
  })
})

describe('revisitBonus', () => {
  it('adds 0.05 per revisit capped at 0.15', () => {
    expect(revisitBonus(0)).toBe(0)
    expect(revisitBonus(1)).toBeCloseTo(0.05)
    expect(revisitBonus(5)).toBeCloseTo(0.15)
  })
})

describe('computeConceptScore', () => {
  it('returns 0 with no samples', () => {
    expect(computeConceptScore('Hashing', [], {}, NOW).score).toBe(0)
  })

  it('is 1 for a single recent CLEAN solve', () => {
    const items = [
      item({ solvedAt: NOW.toISOString(), result: 'CLEAN', conceptsTrained: ['Hashing'] }),
    ]
    expect(computeConceptScore('Hashing', items, {}, NOW).score).toBeCloseTo(1)
  })

  it('weights recent results higher than old ones', () => {
    const old = item({
      id: 'old',
      result: 'SOL',
      conceptsTrained: ['DP'],
      solvedAt: '2025-01-01T00:00:00.000Z',
    })
    const recent = item({
      id: 'recent',
      result: 'CLEAN',
      conceptsTrained: ['DP'],
      solvedAt: '2026-05-31T00:00:00.000Z',
    })
    const score = computeConceptScore('DP', [old, recent], {}, NOW).score
    expect(score).toBeGreaterThan(0.9)
  })

  it('adds a revisit bonus', () => {
    const base = item({ result: 'H2', conceptsTrained: ['Graphs'], solvedAt: NOW.toISOString() })
    const revisited = item({
      ...base,
      revisitCount: 2,
    })
    const a = computeConceptScore('Graphs', [base], {}, NOW).score
    const b = computeConceptScore('Graphs', [revisited], {}, NOW).score
    expect(b).toBeGreaterThan(a)
  })

  it('honours a manual override', () => {
    const items = [item({ result: 'CLEAN', conceptsTrained: ['Arrays'], solvedAt: NOW.toISOString() })]
    const result = computeConceptScore('Arrays', items, { Arrays: 0.42 }, NOW)
    expect(result.score).toBeCloseTo(0.42)
    expect(result.overridden).toBe(true)
  })

  it('computes all concepts', () => {
    const items = [item({ result: 'CLEAN', conceptsTrained: ['Arrays'], solvedAt: NOW.toISOString() })]
    const all = computeAllConceptScores(['Arrays', 'Trees'], items, {}, NOW)
    expect(all).toHaveLength(2)
    expect(all.find((c) => c.concept === 'Trees')?.score).toBe(0)
  })
})
