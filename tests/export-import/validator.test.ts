import { describe, expect, it } from 'vitest'
import { countBackupRows, validateBackup } from '../../src/core/export-import/validator'
import { BACKUP_APP_VERSION, BACKUP_SCHEMA_VERSION, createBackup } from '../../src/core/export-import/backup'
import { DEFAULT_SETTINGS } from '../../src/types/stats'

const emptyBackup = createBackup({
  itemProgress: [],
  timedResults: [],
  dailyActivity: [],
  hintLog: [],
  bugLog: [],
  settings: DEFAULT_SETTINGS,
})

describe('createBackup', () => {
  it('stamps version, schema and export time', () => {
    expect(emptyBackup.version).toBe(BACKUP_APP_VERSION)
    expect(emptyBackup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(typeof emptyBackup.exportedAt).toBe('string')
  })
})

describe('validateBackup', () => {
  it('accepts a valid backup', () => {
    const result = validateBackup(emptyBackup)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects non-objects', () => {
    expect(validateBackup(42).valid).toBe(false)
    expect(validateBackup(null).valid).toBe(false)
  })

  it('rejects missing tables', () => {
    const broken = { ...emptyBackup, data: { itemProgress: [] } }
    const result = validateBackup(broken)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('warns when the backup schema is newer', () => {
    const newer = { ...emptyBackup, schemaVersion: BACKUP_SCHEMA_VERSION + 1 }
    const result = validateBackup(newer)
    expect(result.valid).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('rejects toplevel type problems', () => {
    expect(validateBackup({ ...emptyBackup, version: 5 }).valid).toBe(false)
  })
})

describe('countBackupRows', () => {
  it('counts all rows across tables', () => {
    expect(countBackupRows(emptyBackup)).toBe(0)
  })
})
