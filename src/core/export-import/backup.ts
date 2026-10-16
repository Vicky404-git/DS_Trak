import type { ItemProgress } from '../../types/item'
import type { BugLogEntry, DailyActivity, HintLogEntry, Settings, TimedResultRecord } from '../../types/stats'

export const BACKUP_APP_VERSION = '0.1.0'
export const BACKUP_SCHEMA_VERSION = 1

export interface BackupData {
  version: string
  schemaVersion: number
  exportedAt: string
  data: {
    itemProgress: ItemProgress[]
    timedResults: TimedResultRecord[]
    dailyActivity: DailyActivity[]
    hintLog: HintLogEntry[]
    bugLog: BugLogEntry[]
    settings: Settings | null
  }
}

export interface BackupSource {
  itemProgress: ItemProgress[]
  timedResults: TimedResultRecord[]
  dailyActivity: DailyActivity[]
  hintLog: HintLogEntry[]
  bugLog: BugLogEntry[]
  settings: Settings | null
}

export function createBackup(source: BackupSource, now: Date = new Date()): BackupData {
  return {
    version: BACKUP_APP_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data: {
      itemProgress: source.itemProgress,
      timedResults: source.timedResults,
      dailyActivity: source.dailyActivity,
      hintLog: source.hintLog,
      bugLog: source.bugLog,
      settings: source.settings,
    },
  }
}

export function serializeBackup(backup: BackupData): string {
  return JSON.stringify(backup, null, 2)
}

export function backupFilename(now: Date = new Date()): string {
  const iso = now.toISOString().slice(0, 10)
  return `dsa-tracker-backup-${iso}.json`
}
