import { useMemo, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'

export default function SearchPanel() {
  const progress = useDataStore((s) => s.progress)
  const openItem = useUIStore((s) => s.openItem)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return progress.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.notesMarkdown.toLowerCase().includes(q) ||
        p.conceptsTrained.some((c) => c.toLowerCase().includes(q)) ||
        p.bugTags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [progress, query])

  return (
    <div className="p-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items, notes, tags…"
        className="w-full rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
      />
      <div className="mt-2 text-xs text-gray-500">
        {query.trim() ? `${results.length} result(s)` : 'Type to search'}
      </div>
      <ul className="mt-1">
        {results.map((item) => (
          <li key={item.id}>
            <button
              className="flex w-full items-center gap-2 px-1 py-[3px] text-left text-[13px] hover:bg-[var(--vscode-tab-inactive-bg)]"
              onClick={() => openItem(item.id, item.title)}
            >
              <span className="w-12 shrink-0 font-mono text-[11px] text-gray-500">{item.id}</span>
              <span className="truncate">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
