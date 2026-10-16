import { useMemo, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { filterBugLog, getTopBugTags } from '../../core/stats/logs'

export default function BugLogView() {
  const bugLog = useDataStore((s) => s.bugLog)
  const [weekFilter, setWeekFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')

  const topTags = useMemo(() => getTopBugTags(bugLog, 12), [bugLog])
  const weeks = useMemo(() => [...new Set(bugLog.map((b) => b.week))].sort((a, b) => a - b), [bugLog])

  const filtered = useMemo(
    () =>
      filterBugLog(bugLog, {
        week: weekFilter ? Number(weekFilter) : undefined,
        tag: tagFilter || undefined,
      }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [bugLog, weekFilter, tagFilter],
  )

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">Top recurring tags</div>
        {topTags.length === 0 ? (
          <span className="text-xs text-gray-500">No bug entries yet.</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => setTagFilter(tagFilter === t.tag ? '' : t.tag)}
                className={`rounded px-2 py-0.5 text-xs ${
                  tagFilter === t.tag
                    ? 'bg-[var(--vscode-status-bar-bg)] text-white'
                    : 'bg-[var(--vscode-tab-inactive-bg)] text-[#9cdcfe]'
                }`}
              >
                {t.tag} · {t.count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400">Filters:</span>
        <select
          value={weekFilter}
          onChange={(e) => setWeekFilter(e.target.value)}
          className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1"
        >
          <option value="">all weeks</option>
          {weeks.map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1"
        >
          <option value="">all tags</option>
          {topTags.map((t) => (
            <option key={t.tag} value={t.tag}>
              {t.tag}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-left text-gray-400">
            <th className="py-1 pr-3">Item</th>
            <th className="py-1 pr-3">Week</th>
            <th className="py-1 pr-3">Tags</th>
            <th className="py-1 pr-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry) => (
            <tr key={entry.id} className="border-t border-[var(--vscode-border)]">
              <td className="py-1 pr-3 font-mono">{entry.itemId}</td>
              <td className="py-1 pr-3">W{entry.week}</td>
              <td className="py-1 pr-3">{entry.bugTags.join(', ')}</td>
              <td className="py-1 pr-3 text-gray-400">{entry.bugNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
