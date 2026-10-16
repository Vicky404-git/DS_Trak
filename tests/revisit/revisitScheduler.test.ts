import { describe, expect, it } from 'vitest'
import {
  isOverdue,
  isRevisitDue,
  rescheduleAfterRevisit,
  scheduleInitialRevisit,
} from '../../src/core/revisit/revisitScheduler'
import { toISODate } from '../../src/core/utils/dateUtils'

const solvedAt = new Date('2026-06-01T10:00:00')

describe('scheduleInitialRevisit', () => {
  it('schedules +10 days for CLEAN', () => {
    expect(toISODate(scheduleInitialRevisit(solvedAt, 'CLEAN'))).toBe('2026-06-11')
  })

  it('schedules +4 days for hinted or solution results', () => {
    expect(toISODate(scheduleInitialRevisit(solvedAt, 'H1'))).toBe('2026-06-05')
    expect(toISODate(scheduleInitialRevisit(solvedAt, 'H2'))).toBe('2026-06-05')
    expect(toISODate(scheduleInitialRevisit(solvedAt, 'H3'))).toBe('2026-06-05')
    expect(toISODate(scheduleInitialRevisit(solvedAt, 'SOL'))).toBe('2026-06-05')
  })
})

describe('rescheduleAfterRevisit', () => {
  it('reschedules +2 days after a failed or hinted revisit', () => {
    expect(toISODate(rescheduleAfterRevisit(solvedAt, 'H2'))).toBe('2026-06-03')
    expect(toISODate(rescheduleAfterRevisit(solvedAt, 'SOL'))).toBe('2026-06-03')
  })

  it('returns to +10 days after a clean revisit', () => {
    expect(toISODate(rescheduleAfterRevisit(solvedAt, 'CLEAN'))).toBe('2026-06-11')
  })
})

describe('isRevisitDue / isOverdue', () => {
  it('is due when the due date is today or earlier', () => {
    const now = new Date('2026-06-05T09:00:00')
    expect(isRevisitDue('2026-06-05', now)).toBe(true)
    expect(isRevisitDue('2026-06-04', now)).toBe(true)
    expect(isRevisitDue('2026-06-06', now)).toBe(false)
    expect(isRevisitDue(undefined, now)).toBe(false)
  })

  it('marks strictly earlier dates as overdue', () => {
    const now = new Date('2026-06-05T09:00:00')
    expect(isOverdue('2026-06-04', now)).toBe(true)
    expect(isOverdue('2026-06-05', now)).toBe(false)
  })
})
