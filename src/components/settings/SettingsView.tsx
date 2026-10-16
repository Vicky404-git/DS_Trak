import { useRef, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { createBackup, type BackupData } from '../../core/export-import/backup'
import { countBackupRows, validateBackup } from '../../core/export-import/validator'
import { copyToClipboard, downloadJson, readFileAsText } from '../../core/export-import/files'
import { generateWeeklyReport } from '../../core/report/weeklyReport'
import { findWeek, validateCurriculum } from '../../data/curriculum'
import type { Curriculum } from '../../types/curriculum'

function currentWeekFromProgress(progress: { week: number; status: string }[]): number {
  const active = progress.filter((p) => p.status !== 'not-started')
  if (active.length === 0) return 1
  return Math.max(...active.map((p) => p.week))
}

export default function SettingsView() {
  const data = useDataStore()
  const [message, setMessage] = useState<string | null>(null)
  const [pendingBackup, setPendingBackup] = useState<{ backup: BackupData; warning: string | null } | null>(null)
  const backupRef = useRef<HTMLInputElement>(null)

  function flash(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 3000)
  }

  function exportBackup() {
    const backup = createBackup({
      itemProgress: data.progress,
      timedResults: data.timedResults,
      dailyActivity: data.activity,
      hintLog: data.hintLog,
      bugLog: data.bugLog,
      settings: data.settings,
    })
    downloadJson(`dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, backup)
    void data.updateSettings({ lastBackupAt: new Date().toISOString() })
    flash('Backup exported.')
  }

  async function onImportFile(file: File) {
    try {
      const raw = JSON.parse(await readFileAsText(file))
      const result = validateBackup(raw)
      if (!result.valid || !result.data) {
        flash('Invalid backup: ' + result.errors.join(' '))
        return
      }
      setPendingBackup({ backup: result.data, warning: result.warnings[0] ?? null })
    } catch {
      flash('Could not read the backup file.')
    }
  }

  async function confirmImport() {
    if (!pendingBackup) return
    await data.replaceAllData(pendingBackup.backup)
    setPendingBackup(null)
    flash('Backup imported. Existing data was overwritten.')
  }

  function copyWeeklyReport() {
    const week = currentWeekFromProgress(data.progress)
    const md = generateWeeklyReport({
      week,
      weekTitle: findWeek(data.curriculum, week)?.title,
      items: data.progress,
      hintLog: data.hintLog,
      bugLog: data.bugLog,
      activity: data.activity,
      settings: data.settings,
    })
    void copyToClipboard(md).then((ok) => flash(ok ? 'Weekly report copied.' : 'Copy failed.'))
  }

  async function onCurriculumFile(file: File) {
    try {
      const parsed = JSON.parse(await readFileAsText(file))
      const result = validateCurriculum(parsed)
      if (!result.valid || !result.curriculum) {
        flash('Invalid curriculum: ' + result.errors.join(' '))
        return
      }
      await data.importCurriculum(result.curriculum as Curriculum)
      flash('Curriculum imported.')
    } catch {
      flash('Could not read curriculum file.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-5">
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      {message && (
        <div className="rounded border border-[var(--vscode-status-bar-bg)] bg-[var(--vscode-tab-inactive-bg)] px-3 py-2 text-sm">
          {message}
        </div>
      )}

      <section className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-300">
          Preferences
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-2 text-sm">
            <span className="text-gray-300">Daily target (min)</span>
            <input
              type="number"
              min={0}
              value={data.settings.dailyTargetMin}
              onChange={(e) => void data.updateSettings({ dailyTargetMin: Number(e.target.value) })}
              className="w-24 rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1"
            />
          </label>
        </div>
      </section>

      <section className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">Weekly report</h2>
        <p className="my-2 text-sm text-gray-400">
          Copies compact Markdown for the current week: per-item results, weakness snapshot,
          revisits due, and heatmap totals.
        </p>
        <button onClick={copyWeeklyReport} className="rounded bg-[var(--vscode-status-bar-bg)] px-3 py-1 text-sm text-white">
          Copy weekly report
        </button>
      </section>

      <section className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">Backup & import</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={exportBackup} className="rounded bg-[var(--vscode-status-bar-bg)] px-3 py-1 text-sm text-white">
            Export full backup (JSON)
          </button>
          <button
            onClick={() => backupRef.current?.click()}
            className="rounded border border-[var(--vscode-border)] px-3 py-1 text-sm"
          >
            Import backup…
          </button>
          <input
            ref={backupRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
        <div className="mt-4 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-gray-400">Re-import curriculum JSON:</span>
            <input
              type="file"
              accept="application/json"
              className="text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onCurriculumFile(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </section>

      {pendingBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[440px] rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-4">
            <h3 className="mb-2 text-lg text-white">Confirm import</h3>
            <p className="mb-2 text-sm text-gray-300">
              This will overwrite ALL current data with the backup. Continue?
            </p>
            <p className="mb-4 text-xs text-gray-400">
              Backup contains {countBackupRows(pendingBackup.backup)} rows.
              {pendingBackup.warning ? ` ${pendingBackup.warning}` : ''}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingBackup(null)}
                className="rounded border border-[var(--vscode-border)] px-3 py-1 text-sm"
              >
                Cancel
              </button>
              <button onClick={confirmImport} className="rounded bg-[#f48771] px-3 py-1 text-sm text-black">
                Overwrite & import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
