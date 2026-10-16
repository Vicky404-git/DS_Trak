import { db } from './db'
import { curriculumSeed, flattenItems } from './curriculum'
import type { Curriculum } from '../types/curriculum'
import type { ItemProgress } from '../types/item'
import { createEmptyReflection } from '../types/item'
import { DEFAULT_SETTINGS } from '../types/stats'

function emptyProgress(
  id: string,
  title: string,
  week: number,
  kind: string,
): ItemProgress {
  const now = new Date().toISOString()
  return {
    id,
    title,
    week,
    kind,
    status: 'not-started',
    timeSpentMs: 0,
    sessions: [],
    reflection: createEmptyReflection(),
    notesMarkdown: '',
    cppScratchpad: '',
    bugTags: [],
    bugNote: '',
    conceptsTrained: [],
    createdAt: now,
    updatedAt: now,
    revisitCount: 0,
  }
}

/**
 * Persist the curriculum reference and ensure every curriculum item has a
 * progress row. Existing progress is preserved (including its title, which the
 * user may have edited) — only genuinely new items are created.
 */
export async function syncCurriculum(curriculum: Curriculum): Promise<void> {
  const flat = flattenItems(curriculum)

  await db.transaction('rw', db.curriculumItems, db.itemProgress, db.settings, async () => {
    await db.curriculumItems.bulkPut(
      flat.map((item) => ({
        id: item.id,
        week: item.week,
        kind: item.kind,
        title: item.title,
        level: item.level,
        timeLimitMin: item.timeLimitMin,
        softTimer: item.softTimer,
        stages: item.stages,
      })),
    )

    const existing = new Set((await db.itemProgress.toArray()).map((p) => p.id))
    const missing = flat.filter((item) => !existing.has(item.id))
    if (missing.length > 0) {
      await db.itemProgress.bulkAdd(
        flat
          .filter((i) => !existing.has(i.id))
          .map((i) => emptyProgress(i.id, i.title, i.week, i.kind)),
      )
    }

    const settings = await db.settings.get(1)
    if (!settings) {
      await db.settings.put({ ...DEFAULT_SETTINGS })
    }
  })
}

export async function getCurriculumItems() {
  return db.curriculumItems.toArray()
}

export async function ensureSeed(): Promise<void> {
  const count = await db.curriculumItems.count()
  if (count === 0) {
    await syncCurriculum(curriculumSeed)
  }
}
