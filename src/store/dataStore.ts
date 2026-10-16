import { create } from 'zustand'
import { db } from '../data/db'
import { curriculumSeed } from '../data/curriculum'
import { syncCurriculum } from '../data/sync'
import type { Curriculum } from '../types/curriculum'
import type { ItemProgress, Reflection, ResultType, TimeSession } from '../types/item'
import type {
  BugLogEntry,
  DailyActivity,
  HintLogEntry,
  Settings,
  TimedResultRecord,
} from '../types/stats'
import { DEFAULT_SETTINGS } from '../types/stats'
import { rescheduleAfterRevisit, scheduleInitialRevisit } from '../core/revisit/revisitScheduler'
import { toISODate } from '../core/utils/dateUtils'
import type { BackupData } from '../core/export-import/backup'

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

interface DataState {
  curriculum: Curriculum
  progress: ItemProgress[]
  activity: DailyActivity[]
  hintLog: HintLogEntry[]
  bugLog: BugLogEntry[]
  timedResults: TimedResultRecord[]
  settings: Settings
  loaded: boolean
  activeSessions: Record<string, string>

  load: () => Promise<void>
  reload: () => Promise<void>
  getProgress: (id: string) => ItemProgress | undefined
  updateProgress: (id: string, patch: Partial<ItemProgress>) => Promise<void>
  updateReflection: (id: string, patch: Partial<Reflection>) => Promise<void>
  startTimer: (id: string) => void
  stopTimer: (id: string) => Promise<void>
  cancelTimer: (id: string) => void
  markSolved: (id: string, result: ResultType) => Promise<void>
  completeRevisit: (id: string, result: ResultType) => Promise<void>
  saveTimedResult: (record: Omit<TimedResultRecord, 'id'>) => Promise<void>
  addBugLog: (entry: Omit<BugLogEntry, 'id'>) => Promise<void>
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  importCurriculum: (curriculum: Curriculum) => Promise<void>
  replaceAllData: (backup: BackupData) => Promise<void>
}

async function readAll() {
  const [progress, activity, hintLog, bugLog, timedResults, settingsRow] = await Promise.all([
    db.itemProgress.toArray(),
    db.dailyActivity.toArray(),
    db.hintLog.toArray(),
    db.bugLog.toArray(),
    db.timedResults.toArray(),
    db.settings.get(1),
  ])
  return {
    progress: progress.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
    activity,
    hintLog,
    bugLog,
    timedResults,
    settings: settingsRow ?? DEFAULT_SETTINGS,
  }
}

async function addMinutes(dateIso: string, minutes: number, itemId: string): Promise<void> {
  const existing = await db.dailyActivity.get(dateIso)
  if (existing) {
    await db.dailyActivity.put({
      ...existing,
      minutes: existing.minutes + minutes,
      itemsStudied: existing.itemsStudied.includes(itemId)
        ? existing.itemsStudied
        : [...existing.itemsStudied, itemId],
      lastUpdated: new Date().toISOString(),
    })
  } else {
    await db.dailyActivity.put({
      date: dateIso,
      minutes,
      itemsStudied: [itemId],
      lastUpdated: new Date().toISOString(),
    })
  }
}

export const useDataStore = create<DataState>((set, get) => ({
  curriculum: curriculumSeed,
  progress: [],
  activity: [],
  hintLog: [],
  bugLog: [],
  timedResults: [],
  settings: DEFAULT_SETTINGS,
  loaded: false,
  activeSessions: {},

  load: async () => {
    await syncCurriculum(curriculumSeed)
    const all = await readAll()
    set({ ...all, loaded: true, curriculum: curriculumSeed })
  },

  reload: async () => {
    const all = await readAll()
    set(all)
  },

  getProgress: (id) => get().progress.find((p) => p.id === id),

  updateProgress: async (id, patch) => {
    const current = get().progress.find((p) => p.id === id)
    if (!current) return
    const updated: ItemProgress = { ...current, ...patch, updatedAt: new Date().toISOString() }
    await db.itemProgress.put(updated)
    set({ progress: get().progress.map((p) => (p.id === id ? updated : p)) })
  },

  updateReflection: async (id, patch) => {
    const current = get().progress.find((p) => p.id === id)
    if (!current) return
    const reflection: Reflection = { ...current.reflection, ...patch }
    const updated: ItemProgress = { ...current, reflection, updatedAt: new Date().toISOString() }
    await db.itemProgress.put(updated)
    set({ progress: get().progress.map((p) => (p.id === id ? updated : p)) })
  },

  startTimer: (id) => {
    if (get().activeSessions[id]) return
    set({ activeSessions: { ...get().activeSessions, [id]: new Date().toISOString() } })
  },

  cancelTimer: (id) => {
    const activeSessions = { ...get().activeSessions }
    delete activeSessions[id]
    set({ activeSessions })
  },

  stopTimer: async (id) => {
    const startIso = get().activeSessions[id]
    const current = get().progress.find((p) => p.id === id)
    if (!startIso || !current) return
    const start = new Date(startIso)
    const end = new Date()
    const durationMs = Math.max(0, end.getTime() - start.getTime())

    const session: TimeSession = {
      id: uid(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMs,
    }

    const updated: ItemProgress = {
      ...current,
      status: current.status === 'not-started' ? 'in-progress' : current.status,
      timeSpentMs: current.timeSpentMs + durationMs,
      sessions: [...current.sessions, session],
      lastStudiedAt: end.toISOString(),
      updatedAt: end.toISOString(),
    }
    await db.itemProgress.put(updated)
    await addMinutes(toISODate(end), Math.round(durationMs / 60000), id)

    const activeSessions = { ...get().activeSessions }
    delete activeSessions[id]
    const all = await readAll()
    set({ ...all, activeSessions })
  },

  markSolved: async (id, result) => {
    const current = get().progress.find((p) => p.id === id)
    if (!current) return
    const now = new Date()
    const dueAt = scheduleInitialRevisit(now, result)
    const updated: ItemProgress = {
      ...current,
      status: result === 'CLEAN' ? 'solved' : 'needs-revisit',
      result,
      solvedAt: current.solvedAt ?? now.toISOString(),
      lastStudiedAt: now.toISOString(),
      revisitDueAt: dueAt.toISOString(),
      updatedAt: now.toISOString(),
    }
    await db.itemProgress.put(updated)
    await db.hintLog.put({
      id: uid(),
      itemId: id,
      week: current.week,
      result,
      timestamp: now.toISOString(),
    })
    const all = await readAll()
    set(all)
  },

  completeRevisit: async (id, result) => {
    const current = get().progress.find((p) => p.id === id)
    if (!current) return
    const now = new Date()
    const nextDue = rescheduleAfterRevisit(now, result)
    const updated: ItemProgress = {
      ...current,
      status: result === 'CLEAN' ? 'solved' : 'needs-revisit',
      result,
      revisitCount: current.revisitCount + 1,
      lastRevisitAt: now.toISOString(),
      lastStudiedAt: now.toISOString(),
      revisitDueAt: nextDue.toISOString(),
      updatedAt: now.toISOString(),
    }
    await db.itemProgress.put(updated)
    await db.hintLog.put({
      id: uid(),
      itemId: id,
      week: current.week,
      result,
      timestamp: now.toISOString(),
    })
    const all = await readAll()
    set(all)
  },

  saveTimedResult: async (record) => {
    const full: TimedResultRecord = { ...record, id: uid() }
    await db.timedResults.put(full)
    set({ timedResults: [...get().timedResults, full] })
  },

  addBugLog: async (entry) => {
    const full: BugLogEntry = { ...entry, id: uid() }
    await db.bugLog.put(full)
    set({ bugLog: [...get().bugLog, full] })
  },

  updateSettings: async (patch) => {
    const updated: Settings = { ...get().settings, ...patch }
    await db.settings.put(updated)
    set({ settings: updated })
  },

  importCurriculum: async (curriculum) => {
    await syncCurriculum(curriculum)
    const all = await readAll()
    set({ ...all, curriculum })
  },

  replaceAllData: async (backup) => {
    await db.transaction(
      'rw',
      [db.itemProgress, db.timedResults, db.dailyActivity, db.hintLog, db.bugLog, db.settings],
      async () => {
        await Promise.all([
          db.itemProgress.clear(),
          db.timedResults.clear(),
          db.dailyActivity.clear(),
          db.hintLog.clear(),
          db.bugLog.clear(),
        ])
        await db.itemProgress.bulkPut(backup.data.itemProgress)
        await db.timedResults.bulkPut(backup.data.timedResults)
        await db.dailyActivity.bulkPut(backup.data.dailyActivity)
        await db.hintLog.bulkPut(backup.data.hintLog)
        await db.bugLog.bulkPut(backup.data.bugLog)
        if (backup.data.settings) {
          await db.settings.put({ ...backup.data.settings, lastImportAt: new Date().toISOString() })
        }
      },
    )
    await get().reload()
  },
}))
