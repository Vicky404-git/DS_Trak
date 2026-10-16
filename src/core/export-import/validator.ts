import type { BackupData } from './backup'
import { BACKUP_SCHEMA_VERSION } from './backup'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  data?: BackupData
}

const REQUIRED_TABLES = [
  'itemProgress',
  'timedResults',
  'dailyActivity',
  'hintLog',
  'bugLog',
] as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateBackup(raw: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!isObject(raw)) {
    return { valid: false, errors: ['Backup root must be a JSON object.'], warnings }
  }

  if (typeof raw.version !== 'string') errors.push('Missing or invalid "version".')
  if (typeof raw.schemaVersion !== 'number') errors.push('Missing or invalid "schemaVersion".')
  if (typeof raw.exportedAt !== 'string') errors.push('Missing or invalid "exportedAt".')
  if (!isObject(raw.data)) {
    errors.push('Missing or invalid "data" object.')
    return { valid: false, errors, warnings }
  }

  const data = raw.data
  for (const table of REQUIRED_TABLES) {
    if (!Array.isArray(data[table])) {
      errors.push(`data.${table} must be an array.`)
    }
  }

  if ('settings' in raw.data && raw.data.settings !== null && !isObject(raw.data.settings)) {
    errors.push('"settings" must be an object or null.')
  }

  if (typeof raw.schemaVersion === 'number' && raw.schemaVersion > BACKUP_SCHEMA_VERSION) {
    warnings.push(
      `Backup schema version ${raw.schemaVersion} is newer than this app (${BACKUP_SCHEMA_VERSION}); some data may be ignored.`,
    )
  }

  if (errors.length > 0) return { valid: false, errors, warnings }

  for (const table of REQUIRED_TABLES) {
    const rows = data[table] as unknown[]
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!isObject(row)) {
        errors.push(`Table "${table}" entry ${i} is not an object.`)
        break
      }
      if (typeof row.id !== 'string' && table !== 'dailyActivity') {
        errors.push(`Table "${table}" entry ${i} is missing a string "id".`)
        break
      }
    }
  }

  if (errors.length > 0) return { valid: false, errors, warnings }

  return { valid: true, errors, warnings, data: raw as unknown as BackupData }
}

export function countBackupRows(backup: BackupData): number {
  const d = backup.data
  return (
    d.itemProgress.length +
    d.timedResults.length +
    d.dailyActivity.length +
    d.hintLog.length +
    d.bugLog.length
  )
}

export function schemaCompatibilityWarning(backup: BackupData): string | null {
  if (backup.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return `Backup was created with a newer schema (v${backup.schemaVersion}). Some data may be ignored.`
  }
  return null
}
