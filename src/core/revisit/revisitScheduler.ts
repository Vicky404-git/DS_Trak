import type { ResultType } from '../../types/item'
import { addDays, isDue, parseDate } from '../utils/dateUtils'

/** Initial revisit spacing when an item is first marked solved. */
export const INITIAL_REVISIT_DAYS_CLEAN = 10
export const INITIAL_REVISIT_DAYS_NOT_CLEAN = 4
/** Spacing after a revisit. */
export const REVISIT_DAYS_FAILED = 2
export const REVISIT_DAYS_CLEAN = 10

/**
 * When an item is marked solved:
 *  - CLEAN  -> revisit at +10 days
 *  - otherwise (hinted / solution) -> revisit at +4 days
 */
export function scheduleInitialRevisit(solvedAt: Date, result: ResultType): Date {
  const days = result === 'CLEAN' ? INITIAL_REVISIT_DAYS_CLEAN : INITIAL_REVISIT_DAYS_NOT_CLEAN
  return addDays(solvedAt, days)
}

/**
 * After completing a revisit:
 *  - failed or hinted revisit (not CLEAN) -> reschedule at +2 days
 *  - clean revisit -> back to the normal +10 day spacing
 */
export function rescheduleAfterRevisit(revisitAt: Date, resultOnRevisit: ResultType): Date {
  const days = resultOnRevisit === 'CLEAN' ? REVISIT_DAYS_CLEAN : REVISIT_DAYS_FAILED
  return addDays(revisitAt, days)
}

/** Whether an item with the given due date is due (or overdue) as of `now`. */
export function isRevisitDue(dueAt: string | Date | undefined, now: Date = new Date()): boolean {
  if (!dueAt) return false
  return isDue(parseDate(dueAt), now)
}

export function isOverdue(dueAt: string | Date | undefined, now: Date = new Date()): boolean {
  if (!dueAt) return false
  return parseDate(dueAt).getTime() < parseDate(now).setHours(0, 0, 0, 0)
}
