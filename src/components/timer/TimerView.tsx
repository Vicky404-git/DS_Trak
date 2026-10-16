import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'
import { useNow } from '../../hooks/useNow'
import { formatClock } from '../../core/utils/dateUtils'

export default function TimerView() {
  const activeSessions = useDataStore((s) => s.activeSessions)
  const progress = useDataStore((s) => s.progress)
  const timedResults = useDataStore((s) => s.timedResults)
  const openItem = useUIStore((s) => s.openItem)
  const now = useNow(1000)

  const activeIds = Object.keys(activeSessions)

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-5">
      <h1 className="text-xl font-semibold text-white">Timer</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
          Active sessions
        </h2>
        {activeIds.length === 0 ? (
          <div className="text-sm text-gray-500">No timers running. Start one from an item tab.</div>
        ) : (
          <ul className="space-y-2">
            {activeIds.map((id) => {
              const item = progress.find((p) => p.id === id)
              const elapsed = now - new Date(activeSessions[id]).getTime()
              return (
                <li
                  key={id}
                  className="flex items-center gap-4 rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3"
                >
                  <span className="font-mono text-sm text-[#9cdcfe]">{id}</span>
                  <button className="truncate hover:underline" onClick={() => item && openItem(id, item.title)}>
                    {item?.title ?? 'Unknown'}
                  </button>
                  <span className="ml-auto font-mono text-lg text-white">{formatClock(elapsed)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
          Recent timed attempts
        </h2>
        {timedResults.length === 0 ? (
          <div className="text-sm text-gray-500">No timed attempts recorded yet.</div>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-1 pr-3">Item</th>
                <th className="py-1 pr-3">Graded</th>
                <th className="py-1 pr-3">Limit</th>
                <th className="py-1 pr-3">Overtime</th>
                <th className="py-1 pr-3">Self total</th>
                <th className="py-1 pr-3">When</th>
              </tr>
            </thead>
            <tbody>
              {[...timedResults]
                .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
                .slice(0, 30)
                .map((r) => (
                  <tr key={r.id} className="border-t border-[var(--vscode-border)]">
                    <td className="py-1 pr-3 font-mono">{r.itemId}</td>
                    <td className="py-1 pr-3">{r.wasGraded ? 'yes' : 'no (soft)'}</td>
                    <td className="py-1 pr-3">{r.timeLimitMin}m</td>
                    <td className="py-1 pr-3">{r.overtimeMs ? formatClock(r.overtimeMs) : '—'}</td>
                    <td className="py-1 pr-3">{r.totalSelfScore}/30</td>
                    <td className="py-1 pr-3 text-gray-400">{r.endedAt.slice(0, 16).replace('T', ' ')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
