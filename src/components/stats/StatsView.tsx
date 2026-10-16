import CalendarHeatmap from './CalendarHeatmap'
import StreakCounter from './StreakCounter'
import WeaknessProfile from './WeaknessProfile'
import HintLogView from './HintLogView'
import BugLogView from './BugLogView'

export default function StatsView() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-5">
      <h1 className="text-xl font-semibold text-white">Stats & weakness profile</h1>
      <StreakCounter />
      <CalendarHeatmap />
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
          Weakness &amp; skill profile
        </h2>
        <WeaknessProfile />
      </section>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">Hint log</h2>
          <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
            <HintLogView />
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">Bug log</h2>
          <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
            <BugLogView />
          </div>
        </div>
      </div>
    </div>
  )
}
