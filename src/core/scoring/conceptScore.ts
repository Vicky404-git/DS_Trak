import type { ItemProgress, ResultType } from '../../types/item'
import { daysBetween, parseDate } from '../utils/dateUtils'

/**
 * Base score for a result type.
 * CLEAN 1.0, H1 0.75, H2 0.5, H3 0.3, SOL 0.1
 */
export const RESULT_SCORES: Record<ResultType, number> = {
  CLEAN: 1.0,
  H1: 0.75,
  H2: 0.5,
  H3: 0.3,
  SOL: 0.1,
}

export function resultScore(result: ResultType): number {
  return RESULT_SCORES[result]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Recency weight: half-life of 14 days. */
export const RECENCY_HALF_LIFE_DAYS = 14

export function recencyWeight(daysAgo: number): number {
  return Math.pow(0.5, Math.max(0, daysAgo) / RECENCY_HALF_LIFE_DAYS)
}

/** Bonus for a successful revisit, capped at 0.15. */
export function revisitBonus(revisitCount: number): number {
  return Math.min(revisitCount * 0.05, 0.15)
}

export interface ConceptScoreResult {
  score: number
  sampleCount: number
  overridden: boolean
}

/**
 * Concept score derived from performance (not counts).
 *
 * For every solved item that trained the concept:
 *   effective = clamp(base(result) + revisitBonus(revisitCount), 0, 1)
 *   weight    = 0.5 ^ (daysAgo / 14)
 * The score is the weight-weighted average. A manual override takes precedence.
 */
export function computeConceptScore(
  concept: string,
  items: ItemProgress[],
  overrides: Record<string, number> = {},
  now: Date = new Date(),
): ConceptScoreResult {
  if (overrides[concept] !== undefined) {
    return { score: clamp(overrides[concept], 0, 1), sampleCount: 0, overridden: true }
  }

  const relevant = items.filter(
    (item) => item.conceptsTrained.includes(concept) && item.result && item.status !== 'not-started',
  )

  let weightedSum = 0
  let weightTotal = 0
  for (const item of relevant) {
    const base = resultScore(item.result as ResultType)
    const effective = clamp(base + revisitBonus(item.revisitCount), 0, 1)
    const reference = parseDate(item.lastRevisitAt ?? item.solvedAt ?? item.updatedAt)
    const weight = recencyWeight(daysBetween(reference, now))
    weightedSum += effective * weight
    weightTotal += weight
  }

  if (weightTotal === 0) {
    return { score: 0, sampleCount: 0, overridden: false }
  }

  return {
    score: clamp(weightedSum / weightTotal, 0, 1),
    sampleCount: relevant.length,
    overridden: false,
  }
}

/** All concept scores with optional count of sample items. */
export function computeAllConceptScores(
  concepts: string[],
  items: ItemProgress[],
  overrides: Record<string, number> = {},
  now: Date = new Date(),
): Array<{ concept: string; score: number; sampleCount: number; overridden: boolean }> {
  return concepts.map((concept) => ({
    concept,
    ...computeConceptScore(concept, items, overrides, now),
  }))
}
