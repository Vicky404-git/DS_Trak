import Dexie, { type Table } from 'dexie'
import type { CurriculumItem } from '../types/curriculum'
import type { ItemProgress } from '../types/item'
import type {
  BugLogEntry,
  DailyActivity,
  HintLogEntry,
  Settings,
  TimedResultRecord,
} from '../types/stats'

export const DB_NAME = 'dsaTracker'

export interface DsaTrackerDB extends Dexie {
  curriculumItems: Table<CurriculumItem, string>
  itemProgress: Table<ItemProgress, string>
  timedResults: Table<TimedResultRecord, string>
  dailyActivity: Table<DailyActivity, string>
  hintLog: Table<HintLogEntry, string>
  bugLog: Table<BugLogEntry, string>
  settings: Table<Settings, number>
}

export function createDB(): DsaTrackerDB {
  const db = new Dexie(DB_NAME) as DsaTrackerDB

  db.version(1).stores({
    curriculumItems: 'id, week, kind',
    itemProgress: 'id, status, week, solvedAt, revisitDueAt, lastStudiedAt',
    timedResults: 'id, itemId, startedAt, endedAt',
    dailyActivity: 'date',
    hintLog: 'id, itemId, week, result, timestamp',
    bugLog: 'id, itemId, week, timestamp, *bugTags',
    settings: 'id',
  })

  return db
}

export const db = createDB()
