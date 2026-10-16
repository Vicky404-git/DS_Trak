import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { statusStyle } from './statusIcon'
import type { ItemProgress } from '../../types/item'

export default function ExplorerTree() {
  const curriculum = useDataStore((s) => s.curriculum)
  const progress = useDataStore((s) => s.progress)
  const expandedWeeks = useUIStore((s) => s.expandedWeeks)
  const toggleWeek = useUIStore((s) => s.toggleWeek)
  const openItem = useUIStore((s) => s.openItem)

  const byId = useMemo(() => {
    const map = new Map<string, ItemProgress>()
    for (const p of progress) map.set(p.id, p)
    return map
  }, [progress])

  if (curriculum.weeks.length === 0) {
    return <div className="px-2 py-1 text-xs text-gray-500">No curriculum loaded.</div>
  }

  return (
    <div className="select-none">
      {curriculum.weeks.map((week) => {
        const expanded = expandedWeeks.includes(week.week)
        return (
          <div key={week.week}>
            <button
              className="flex w-full items-center gap-1 px-1 py-0.5 text-left text-xs font-semibold uppercase tracking-wide hover:bg-[var(--vscode-tab-inactive-bg)]"
              onClick={() => toggleWeek(week.week)}
            >
              <span className="w-3 text-[10px]">{expanded ? '▾' : '▸'}</span>
              <span className="truncate">
                Week {week.week} · {week.title}
              </span>
            </button>
            {expanded && (
              <ul className="mb-1">
                {week.items.map((item) => {
                  const p = byId.get(item.id)
                  const status = p?.status ?? 'not-started'
                  const style = statusStyle(status)
                  return (
                    <li key={item.id}>
                      <button
                        className="flex w-full items-center gap-2 py-[3px] pl-6 pr-2 text-left text-[13px] hover:bg-[var(--vscode-tab-inactive-bg)]"
                        onClick={() => openItem(item.id, item.title)}
                        title={`${item.id} · ${item.kind} · level ${item.level}`}
                      >
                        <span style={{ color: style.color }} aria-label={style.label}>
                          {style.glyph}
                        </span>
                        <span className="w-12 shrink-0 font-mono text-[11px] text-gray-500">
                          {item.id}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
