import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { isRevisitDue } from '../../core/revisit/revisitScheduler'

export default function StatusBar() {
  const progress = useDataStore((s) => s.progress)
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)

  const dueCount = useMemo(
    () => progress.filter((p) => isRevisitDue(p.revisitDueAt)).length,
    [progress],
  )
  const solved = useMemo(() => progress.filter((p) => p.status === 'solved').length, [progress])

  return (
    <div className="flex h-6 select-none items-center justify-between bg-[var(--vscode-status-bar-bg)] px-3 text-[11px] text-white">
      <div className="flex items-center gap-4">
        <span>🌿 master</span>
        <span>DSA Tracker</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Solved: {solved}/{progress.length}</span>
        <span>Due today: {dueCount}</span>
        <button onClick={toggleBottomPanel} className="hover:underline">
          {bottomPanelVisible ? 'Hide Panel' : 'Show Panel'}
        </button>
      </div>
    </div>
  )
}
