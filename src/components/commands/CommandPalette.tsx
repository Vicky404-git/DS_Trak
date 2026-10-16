import { useMemo, useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useDataStore } from '../../store/dataStore'
import { createBackup } from '../../core/export-import/backup'
import { copyToClipboard, downloadJson } from '../../core/export-import/files'
import { generateWeeklyReport } from '../../core/report/weeklyReport'
import { findWeek } from '../../data/curriculum'

interface Command {
  id: string
  label: string
  run: () => void
}

function currentWeekFromProgress(progress: { week: number; status: string }[]): number {
  const active = progress.filter((p) => p.status !== 'not-started')
  if (active.length === 0) return 1
  return Math.max(...active.map((p) => p.week))
}

export default function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const close = useUIStore((s) => s.closeCommandPalette)
  const [query, setQuery] = useState('')

  const commands = useMemo<Command[]>(() => {
    const ui = () => useUIStore.getState()
    const data = () => useDataStore.getState()
    return [
      { id: 'view.curriculum', label: 'View: Curriculum Explorer', run: () => ui().setActiveView('curriculum') },
      { id: 'view.search', label: 'View: Search', run: () => ui().setActiveView('search') },
      { id: 'view.timer', label: 'View: Timer', run: () => ui().setActiveView('timer') },
      { id: 'view.stats', label: 'View: Stats & Weakness Profile', run: () => ui().setActiveView('stats') },
      { id: 'view.settings', label: 'View: Settings', run: () => ui().setActiveView('settings') },
      { id: 'view.sidebar', label: 'View: Toggle Sidebar', run: () => ui().toggleSidebar() },
      { id: 'view.panel', label: 'View: Toggle Bottom Panel', run: () => ui().toggleBottomPanel() },
      {
        id: 'panel.timer',
        label: 'Panel: Show Timer',
        run: () => {
          ui().setBottomPanelTab('timer')
          if (!ui().bottomPanelVisible) ui().toggleBottomPanel()
        },
      },
      {
        id: 'panel.hint',
        label: 'Panel: Show Hint Log',
        run: () => {
          ui().setBottomPanelTab('hint')
          if (!ui().bottomPanelVisible) ui().toggleBottomPanel()
        },
      },
      {
        id: 'panel.bug',
        label: 'Panel: Show Bug Log',
        run: () => {
          ui().setBottomPanelTab('bug')
          if (!ui().bottomPanelVisible) ui().toggleBottomPanel()
        },
      },
      {
        id: 'report.weekly',
        label: 'Report: Copy Weekly Report (Markdown)',
        run: () => {
          const d = data()
          const week = currentWeekFromProgress(d.progress)
          const md = generateWeeklyReport({
            week,
            weekTitle: findWeek(d.curriculum, week)?.title,
            items: d.progress,
            hintLog: d.hintLog,
            bugLog: d.bugLog,
            activity: d.activity,
            settings: d.settings,
          })
          void copyToClipboard(md)
        },
      },
      {
        id: 'backup.export',
        label: 'Backup: Export Full JSON',
        run: () => {
          const d = data()
          const backup = createBackup({
            itemProgress: d.progress,
            timedResults: d.timedResults,
            dailyActivity: d.activity,
            hintLog: d.hintLog,
            bugLog: d.bugLog,
            settings: d.settings,
          })
          downloadJson(`dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, backup)
        },
      },
    ]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands
    return list.slice(0, 40)
  }, [commands, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onMouseDown={close}>
      <div
        className="w-[560px] max-w-[90vw] rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close()
            if (e.key === 'Enter' && filtered[0]) {
              filtered[0].run()
              close()
            }
          }}
          placeholder="Type a command…"
          className="w-full border-b border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-3 py-2 text-sm text-[var(--vscode-text)] outline-none"
        />
        <ul className="max-h-80 overflow-auto py-1">
          {filtered.map((command) => (
            <li key={command.id}>
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--vscode-tab-active-bg)]"
                onClick={() => {
                  command.run()
                  close()
                }}
              >
                {command.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">No matching commands</li>
          )}
        </ul>
      </div>
    </div>
  )
}
