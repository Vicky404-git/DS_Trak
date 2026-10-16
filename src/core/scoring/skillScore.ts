import type { ItemProgress, ResultType } from '../../types/item'
import type { Skill } from '../../types/stats'
import { resultScore } from './conceptScore'

interface SkillWeights {
  performance: number
  engagement: number
  bugHealth: number
}

/** Which reflection fields signal engagement with each skill. */
const SKILL_FIELDS: Record<Skill, Array<keyof ItemProgress['reflection']>> = {
  decomposition: ['requirements', 'observations', 'constraints'],
  'brute force': ['bruteForce'],
  optimization: ['bottleneck', 'optimization'],
  'complexity analysis': ['complexityTime', 'complexitySpace'],
  'edge cases': ['correctness'],
  debugging: ['correctness'],
  implementation: ['dataStructure', 'algorithm'],
  'algorithm design': ['algorithm', 'dataStructure'],
}

const SKILL_WEIGHTS: Record<Skill, SkillWeights> = {
  decomposition: { performance: 0.5, engagement: 0.5, bugHealth: 0 },
  'brute force': { performance: 0.6, engagement: 0.4, bugHealth: 0 },
  optimization: { performance: 0.6, engagement: 0.4, bugHealth: 0 },
  'complexity analysis': { performance: 0.6, engagement: 0.4, bugHealth: 0 },
  'edge cases': { performance: 0.4, engagement: 0.2, bugHealth: 0.4 },
  debugging: { performance: 0.4, engagement: 0.1, bugHealth: 0.5 },
  implementation: { performance: 0.6, engagement: 0.4, bugHealth: 0 },
  'algorithm design': { performance: 0.6, engagement: 0.4, bugHealth: 0 },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Skill score on a 0-10 scale, from three signals over solved items:
 *  - performance: mean base result score (0-1)
 *  - engagement: mean ratio of relevant reflection fields that are non-empty (0-1)
 *  - bugHealth: 1 - share of items tagged "missed-edge-case" (0-1)
 * The three are combined with per-skill weights and scaled to 10.
 */
export function computeSkillScore(
  skill: Skill,
  items: ItemProgress[],
  now: Date = new Date(),
): number {
  void now
  const relevant = items.filter((item) => item.status !== 'not-started' && item.result)
  if (relevant.length === 0) return 0

  const fields = SKILL_FIELDS[skill]
  const weights = SKILL_WEIGHTS[skill]

  let performanceSum = 0
  let engagementSum = 0
  let missedEdge = 0

  for (const item of relevant) {
    performanceSum += resultScore(item.result as ResultType)
    const filled = fields.filter((f) => (item.reflection[f] ?? '').trim().length > 0).length
    engagementSum += fields.length === 0 ? 0 : filled / fields.length
    if (item.bugTags.includes('missed-edge-case')) missedEdge += 1
  }

  const performance = performanceSum / relevant.length
  const engagement = engagementSum / relevant.length
  const bugHealth = 1 - missedEdge / relevant.length

  const combined =
    weights.performance * performance +
    weights.engagement * engagement +
    weights.bugHealth * bugHealth

  return Math.round(clamp(combined, 0, 1) * 100) / 10
}

export function computeAllSkillScores(
  skills: readonly Skill[],
  items: ItemProgress[],
  now: Date = new Date(),
): Array<{ skill: Skill; score: number }> {
  return skills.map((skill) => ({ skill, score: computeSkillScore(skill, items, now) }))
}
