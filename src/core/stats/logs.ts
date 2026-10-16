import type { ResultType } from '../../types/item'
import type { BugLogEntry, HintLogEntry } from '../../types/stats'

const RESULT_TYPES: ResultType[] = ['CLEAN', 'H1', 'H2', 'H3', 'SOL']

export interface HintLogSummaryRow {
  week: number
  counts: Record<ResultType, number>
  total: number
  cleanRate: number
}

export function summarizeHintLog(entries: HintLogEntry[]): HintLogSummaryRow[] {
  const byWeek = new Map<number, HintLogSummaryRow>()
  for (const entry of entries) {
    let row = byWeek.get(entry.week)
    if (!row) {
      row = {
        week: entry.week,
        counts: { CLEAN: 0, H1: 0, H2: 0, H3: 0, SOL: 0 },
        total: 0,
        cleanRate: 0,
      }
      byWeek.set(entry.week, row)
    }
    row.counts[entry.result]++
    row.total++
  }
  const rows = [...byWeek.values()].sort((a, b) => a.week - b.week)
  for (const row of rows) {
    row.cleanRate = row.total === 0 ? 0 : row.counts.CLEAN / row.total
  }
  return rows
}

export function totalHintWeight(entries: HintLogEntry[]): number {
  const weight: Record<ResultType, number> = { CLEAN: 0, H1: 1, H2: 2, H3: 3, SOL: 4 }
  return entries.reduce((sum, e) => sum + weight[e.result], 0)
}

export interface BugTagCount {
  tag: string
  count: number
}

export function getTopBugTags(entries: BugLogEntry[], limit = 10): BugTagCount[] {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    for (const tag of entry.bugTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

export function filterBugLog(
  entries: BugLogEntry[],
  filter: { week?: number; tag?: string } = {},
): BugLogEntry[] {
  return entries.filter((e) => {
    if (filter.week !== undefined && e.week !== filter.week) return false
    if (filter.tag && !e.bugTags.includes(filter.tag)) return false
    return true
  })
}

export { RESULT_TYPES }
