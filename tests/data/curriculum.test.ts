import { describe, expect, it } from 'vitest'
import { curriculumSeed, flattenItems, validateCurriculum } from '../../src/data/curriculum'

describe('curriculumSeed', () => {
  it('is valid', () => {
    const result = validateCurriculum(curriculumSeed)
    expect(result.valid).toBe(true)
  })

  it('has 8 weeks', () => {
    expect(curriculumSeed.weeks).toHaveLength(8)
  })

  it('flattens all items with their week', () => {
    const flat = flattenItems(curriculumSeed)
    expect(flat.length).toBeGreaterThan(0)
    expect(flat.every((i) => typeof i.week === 'number')).toBe(true)
    expect(flat.find((i) => i.id === '1-C1')?.week).toBe(1)
  })
})

describe('validateCurriculum', () => {
  it('rejects malformed input', () => {
    expect(validateCurriculum(null).valid).toBe(false)
    expect(validateCurriculum({ version: 1, title: 'x' }).valid).toBe(false)
  })

  it('rejects an unknown kind', () => {
    const bad = {
      version: 1,
      title: 'x',
      weeks: [{ week: 1, title: 'w', goal: '', systemsLink: '', items: [{ id: 'a', title: 'a', kind: 'nope', level: 1 }] }],
    }
    const result = validateCurriculum(bad)
    expect(result.valid).toBe(false)
  })
})
