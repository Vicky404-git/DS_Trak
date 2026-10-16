import { useCallback, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useDataStore } from '../../store/dataStore'
import { useNow } from '../../hooks/useNow'
import { formatClock, formatDuration } from '../../core/utils/dateUtils'
import { getTopBugTags } from '../../core/stats/logs'
import HintLogView from '../stats/HintLogView'

const TABS = [
  { id: 'timer', label: 'TIMER' },
  { id: 'hint', label: 'HINT LOG' },
  { id: 'bug', label: 'BUG LOG' },
] as const

export default function BottomPanel() {
  const activeTab = useUIStore((s) => s.bottomPanelTab)
  const setTab = useUIStore((s) => s.setBottomPanelTab)
  const height = useUIStore((s) => s.bottomPanelHeight)
  const setHeight = useUIStore((s) => s.setBottomPanelHeight)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startY.current = e.clientY
      startHeight.current = height
      const onMove = (ev: MouseEvent) => setHeight(startHeight.current - (ev.clientY - startY.current))
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [height, setHeight],
  )

  return (
    <div
      className="relative flex flex-col border-t border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)]"
      style={{ height }}
    >
      <div className="absolute -top-1 left-0 h-2 w-full cursor-row-resize" onMouseDown={onMouseDown} />
      <div className="flex h-7 items-center border-b border-[var(--vscode-border)] bg-[var(--vscode-tab-inactive-bg)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`h-full border-r border-[var(--vscode-border)] px-4 text-[11px] tracking-wide ${
              activeTab === tab.id ? 'bg-[var(--vscode-tab-active-bg)] text-white' : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {activeTab === 'timer' && <TimerPanel />}
        {activeTab === 'hint' && <HintLogView />}
        {activeTab === 'bug' && <BugPanel />}
      </div>
    </div>
  )
}

function TimerPanel() {
  const activeSessions = useDataStore((s) => s.activeSessions)
  const progress = useDataStore((s) => s.progress)
  const now = useNow(1000)
  const ids = Object.keys(activeSessions)

  if (ids.length === 0) {
    return <div className="text-sm text-gray-500">No timers running.</div>
  }
  return (
    <ul className="space-y-1 font-mono text-[13px]">
      {ids.map((id) => {
        const item = progress.find((p) => p.id === id)
        const elapsed = now - new Date(activeSessions[id]).getTime()
        return (
          <li key={id} className="flex items-center gap-4">
            <span className="text-[#9cdcfe]">{id}</span>
            <span className="truncate text-gray-300">{item?.title ?? ''}</span>
            <span className="ml-auto text-white">{formatClock(elapsed)}</span>
            <span className="text-gray-500">total {formatDuration(item?.timeSpentMs ?? 0)}</span>
          </li>
        )
      })}
    </ul>
  )
}

function BugPanel() {
  const bugLog = useDataStore((s) => s.bugLog)
  const top = getTopBugTags(bugLog, 12)
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">Top recurring tags</div>
      {top.length === 0 ? (
        <span className="text-xs text-gray-500">No bug entries yet.</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {top.map((t) => (
            <span
              key={t.tag}
              className="rounded bg-[var(--vscode-tab-inactive-bg)] px-2 py-0.5 text-xs text-[#9cdcfe]"
            >
              {t.tag} · {t.count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
