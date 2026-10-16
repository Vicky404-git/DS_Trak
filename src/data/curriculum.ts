import seedJson from './curriculum.seed.json'
import type { Curriculum, CurriculumItem, CurriculumWeek } from '../types/curriculum'

export const curriculumSeed = seedJson as Curriculum

export interface CurriculumValidation {
  valid: boolean
  errors: string[]
  curriculum?: Curriculum
}

const KINDS = ['drill', 'baseline', 'core', 'timed', 'weekend']

export function validateCurriculum(raw: unknown): CurriculumValidation {
  const errors: string[] = []
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: ['Curriculum must be a JSON object.'] }
  }
  const c = raw as Partial<Curriculum>
  if (typeof c.version !== 'number') errors.push('Missing numeric "version".')
  if (typeof c.title !== 'string') errors.push('Missing string "title".')
  if (!Array.isArray(c.weeks)) {
    return { valid: false, errors: [...errors, 'Missing "weeks" array.'] }
  }

  c.weeks.forEach((week, wi) => {
    if (typeof week.week !== 'number') errors.push(`Week ${wi}: missing numeric "week".`)
    if (typeof week.title !== 'string') errors.push(`Week ${wi}: missing string "title".`)
    if (!Array.isArray(week.items)) {
      errors.push(`Week ${wi}: missing "items" array.`)
      return
    }
    week.items.forEach((item, ii) => {
      if (typeof item.id !== 'string') errors.push(`Week ${wi} item ${ii}: missing string "id".`)
      if (typeof item.title !== 'string') errors.push(`Week ${wi} item ${ii}: missing string "title".`)
      if (!KINDS.includes(item.kind)) errors.push(`Week ${wi} item ${ii}: invalid kind "${item.kind}".`)
      if (typeof item.level !== 'number') errors.push(`Week ${wi} item ${ii}: missing numeric "level".`)
    })
  })

  if (errors.length > 0) return { valid: false, errors }
  return { valid: true, errors: [], curriculum: c as Curriculum }
}

export function flattenItems(curriculum: Curriculum): Array<CurriculumItem & { week: number }> {
  return curriculum.weeks.flatMap((week) =>
    week.items.map((item) => ({ ...item, week: week.week })),
  )
}

export function findWeek(curriculum: Curriculum, week: number): CurriculumWeek | undefined {
  return curriculum.weeks.find((w) => w.week === week)
}

export function getItemTitle(curriculum: Curriculum, id: string): string | undefined {
  for (const week of curriculum.weeks) {
    const found = week.items.find((i) => i.id === id)
    if (found) return found.title
  }
  return undefined
}
