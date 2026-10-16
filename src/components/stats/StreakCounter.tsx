import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { computeStreak } from '../../core/stats/heatmap'
import { toISODate } from '../../core/utils/dateUtils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StreakCounter() {
  const activity = useDataStore((s) => s.activity)
  const settings = useDataStore((s) => s.settings)
  const updateSettings = useDataStore((s) => s.updateSettings)

  const streak = useMemo(() => computeStreak(activity, settings.restDay), [activity, settings.restDay])
  const todayMinutes = activity.find((a) => a.date === toISODate(new Date()))?.minutes ?? 0
  const targetPct = Math.min(100, Math.round((todayMinutes / settings.dailyTargetMin) * 100))

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Stat label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
      <Stat label="Today" value={`${todayMinutes} / ${settings.dailyTargetMin} min`}>
        <div className="mt-1 h-1.5 w-full rounded bg-[var(--vscode-tab-inactive-bg)]">
          <div className="h-1.5 rounded bg-[var(--vscode-status-bar-bg)]" style={{ width: `${targetPct}%` }} />
        </div>
      </Stat>
      <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Rest day</div>
        <select
          value={settings.restDay}
          onChange={(e) => void updateSettings({ restDay: Number(e.target.value) })}
          className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm"
        >
          {DAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Stat({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-xl text-white">{value}</div>
      {children}
    </div>
  )
}
