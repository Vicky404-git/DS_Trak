import type { ItemProgress } from '../../types/item'
import type { BugLogEntry, DailyActivity, HintLogEntry, Settings } from '../../types/stats'
import { SKILLS } from '../../types/stats'
import { computeAllConceptScores } from '../scoring/conceptScore'
import { computeSkillScore } from '../scoring/skillScore'
import { addDays, formatDuration, toISODate } from '../utils/dateUtils'

const EXCERPT_LENGTH = 120
const HINT_WEIGHT: Record<string, number> = { CLEAN: 0, H1: 1, H2: 2, H3: 3, SOL: 4 }

export interface WeeklyReportInput {
  week: number
  weekTitle?: string
  items: ItemProgress[]
  hintLog: HintLogEntry[]
  bugLog: BugLogEntry[]
  activity: DailyActivity[]
  settings: Settings
  now?: Date
}

function trimExcerpt(text: string, length = EXCERPT_LENGTH): string {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= length) return collapsed
  return collapsed.slice(0, length).trimEnd() + '…'
}

function mdCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

/** Sunday-based start of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

function hintLevel(item: ItemProgress): number {
  if (!item.result) return 0
  return HINT_WEIGHT[item.result] ?? 0
}

function complexityWritten(item: ItemProgress): string {
  const t = item.reflection.complexityTime.trim()
  const s = item.reflection.complexitySpace.trim()
  if (!t && !s) return '-'
  return [t, s].filter(Boolean).join(' / ')
}

export function generateWeeklyReport(input: WeeklyReportInput): string {
  const now = input.now ?? new Date()
  const weekItems = input.items.filter((i) => i.week === input.week && i.status !== 'not-started')
  const due = input.items.filter((i) => i.revisitDueAt && i.status !== 'not-started')

  const totalMs = weekItems.reduce((sum, i) => sum + i.timeSpentMs, 0)
  const solvedCount = weekItems.filter((i) => i.status === 'solved').length
  const hintTotal = weekItems.reduce((sum, i) => sum + hintLevel(i), 0)

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekStart = startOfWeek(now)
  const dayRows: string[] = []
  let weekMinutes = 0
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i)
    const minutes = input.activity.find((a) => a.date === toISODate(day))?.minutes ?? 0
    weekMinutes += minutes
    dayRows.push(`${dayNames[day.getDay()]}: ${minutes}m`)
  }

  const conceptScores = computeAllConceptScores(
    input.settings.defaultConcepts,
    input.items,
    input.settings.conceptManualOverrides,
    now,
  )
    .filter((c) => c.sampleCount > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const skillScores = SKILLS.map((s) => ({ skill: s, score: computeSkillScore(s, input.items, now) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const lines: string[] = []
  lines.push(`# Weekly Report — Week ${input.week}${input.weekTitle ? `: ${input.weekTitle}` : ''}`)
  lines.push('')
  lines.push(`_Generated ${toISODate(now)}_`)
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Time logged (week items): ${formatDuration(totalMs)}`)
  lines.push(`- Items solved: ${solvedCount}`)
  lines.push(`- Hints used (weighted): ${hintTotal}`)
  lines.push(`- Minutes studied this week: ${weekMinutes}`)
  lines.push(`- Revisits due: ${due.length}`)
  lines.push('')
  lines.push('## Items')
  lines.push('| ID | Result | Time | Hints | Bug tags | Complexity | Conf | Notes |')
  lines.push('|---|---|---|---|---|---|---|---|')
  for (const item of weekItems) {
    lines.push(
      `| ${item.id} | ${item.result ?? '-'} | ${formatDuration(item.timeSpentMs)} | ${hintLevel(
        item,
      )} | ${mdCell(item.bugTags.join(', ') || '-')} | ${complexityWritten(item)} | ${
        item.confidence ?? '-'
      } | ${mdCell(trimExcerpt(item.notesMarkdown)) || '-'} |`,
    )
  }
  lines.push('')
  lines.push('## Weakness Profile Snapshot')
  if (conceptScores.length === 0 && skillScores.length === 0) {
    lines.push('- No performance data yet.')
  }
  for (const c of conceptScores) {
    lines.push(`- ${c.concept}: ${c.score.toFixed(2)} (${(c.score * 10).toFixed(1)}/10)`)
  }
  for (const s of skillScores) {
    lines.push(`- ${s.skill}: ${s.score.toFixed(1)}/10`)
  }
  lines.push('')
  lines.push('## Revisits Due')
  if (due.length === 0) {
    lines.push('- None')
  } else {
    for (const item of due) {
      lines.push(`- ${item.id} ${item.title} (due ${item.revisitDueAt})`)
    }
  }
  lines.push('')
  lines.push('## Heatmap Totals')
  lines.push(dayRows.join(', '))
  lines.push('')
  return lines.join('\n')
}
