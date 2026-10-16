import { useMemo, useState } from 'react'
import { flattenItems } from '../../data/curriculum'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'

export default function QuickOpen() {
  const open = useUIStore((s) => s.quickOpenOpen)
  const close = useUIStore((s) => s.closeQuickOpen)
  const openItem = useUIStore((s) => s.openItem)
  const curriculum = useDataStore((s) => s.curriculum)
  const [query, setQuery] = useState('')

  const items = useMemo(() => flattenItems(curriculum), [curriculum])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 30)
    return items
      .filter((i) => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q))
      .slice(0, 30)
  }, [items, query])

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
            if (e.key === 'Enter' && results[0]) {
              openItem(results[0].id, results[0].title)
              close()
            }
          }}
          placeholder="Go to item by id or title…"
          className="w-full border-b border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-3 py-2 text-sm text-[var(--vscode-text)] outline-none"
        />
        <ul className="max-h-80 overflow-auto py-1">
          {results.map((item) => (
            <li key={item.id}>
              <button
                className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm hover:bg-[var(--vscode-tab-active-bg)]"
                onClick={() => {
                  openItem(item.id, item.title)
                  close()
                }}
              >
                <span className="w-12 shrink-0 font-mono text-xs text-[#569cd6]">{item.id}</span>
                <span className="truncate">{item.title}</span>
                <span className="ml-auto shrink-0 text-xs text-gray-500">wk {item.week}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">No matching items</li>
          )}
        </ul>
      </div>
    </div>
  )
}
