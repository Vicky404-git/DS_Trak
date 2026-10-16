import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { isOverdue, isRevisitDue } from '../../core/revisit/revisitScheduler'

export default function DueToday() {
  const progress = useDataStore((s) => s.progress)
  const openItem = useUIStore((s) => s.openItem)

  const due = useMemo(() => {
    return progress
      .filter((p) => isRevisitDue(p.revisitDueAt))
      .sort((a, b) => (a.revisitDueAt ?? '').localeCompare(b.revisitDueAt ?? ''))
  }, [progress])

  if (due.length === 0) {
    return <div className="px-2 py-1 text-xs text-gray-500">Nothing due. Nice.</div>
  }

  return (
    <ul>
      {due.map((item) => {
        const overdue = isOverdue(item.revisitDueAt)
        return (
          <li key={item.id}>
            <button
              className="flex w-full items-center gap-2 px-1 py-[3px] text-left text-[13px] hover:bg-[var(--vscode-tab-inactive-bg)]"
              onClick={() => openItem(item.id, item.title)}
            >
              <span style={{ color: overdue ? '#f48771' : '#d7ba7d' }}>⏰</span>
              <span className="w-12 shrink-0 font-mono text-[11px] text-gray-500">{item.id}</span>
              <span className="truncate">{item.title}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
