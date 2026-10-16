import { useEffect, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { getItemMeta } from '../../data/itemMeta'
import TimerControls from './TimerControls'
import ReflectionFields from './ReflectionFields'
import NotesEditors from './NotesEditors'
import BugSection from './BugSection'
import ConceptSection from './ConceptSection'
import WeekendSection from './WeekendSection'
import { formatDuration } from '../../core/utils/dateUtils'
import type { Confidence, ItemStatus, ResultType } from '../../types/item'

const RESULTS: ResultType[] = ['CLEAN', 'H1', 'H2', 'H3', 'SOL']
const STATUSES: ItemStatus[] = ['not-started', 'in-progress', 'solved', 'needs-revisit']

export default function ItemTab({ itemId }: { itemId: string }) {
  const item = useDataStore((s) => s.progress.find((p) => p.id === itemId))
  const meta = useDataStore((s) => getItemMeta(s.curriculum, itemId))
  const updateProgress = useDataStore((s) => s.updateProgress)
  const markSolved = useDataStore((s) => s.markSolved)
  const completeRevisit = useDataStore((s) => s.completeRevisit)

  const [result, setResult] = useState<ResultType>('CLEAN')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (item?.result) setResult(item.result)
  }, [item?.result])

  if (!item || !meta) {
    return <div className="p-6 text-sm text-gray-400">Item not found.</div>
  }

  function record() {
    if (!item) return
    const isRevisit = item.status === 'needs-revisit' || (item.solvedAt && item.revisitDueAt)
    if (isRevisit) void completeRevisit(item.id, result)
    else void markSolved(item.id, result)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-5">
      <header className="mb-4 border-b border-[var(--vscode-border)] pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-[#9cdcfe]">{item.id}</span>
          <h1 className="text-xl font-semibold text-white">{item.title}</h1>
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
          <Badge>{meta.kind}</Badge>
          <Badge>level {meta.level}</Badge>
          {meta.timeLimitMin && <Badge>{meta.timeLimitMin}m limit</Badge>}
          {meta.softTimer && <Badge>soft timer</Badge>}
          <Badge>spent {formatDuration(item.timeSpentMs)}</Badge>
          {item.revisitCount > 0 && <Badge>{item.revisitCount} revisit(s)</Badge>}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section title="Status & result">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Status</span>
                <select
                  value={item.status}
                  onChange={(e) =>
                    void updateProgress(item.id, { status: e.target.value as ItemStatus })
                  }
                  className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Confidence</span>
                <select
                  value={item.confidence ?? ''}
                  onChange={(e) =>
                    void updateProgress(item.id, {
                      confidence: e.target.value ? (Number(e.target.value) as Confidence) : undefined,
                    })
                  }
                  className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {RESULTS.map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={`rounded px-2.5 py-1 text-xs ${
                    result === r
                      ? 'bg-[var(--vscode-status-bar-bg)] text-white'
                      : 'bg-[var(--vscode-tab-inactive-bg)] text-gray-300 hover:bg-[var(--vscode-tab-active-bg)]'
                  }`}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={record}
                className="ml-2 rounded bg-[var(--vscode-status-bar-bg)] px-3 py-1 text-xs text-white"
              >
                {saved ? 'Saved ✓' : item.solvedAt && item.revisitDueAt ? 'Log revisit' : 'Mark solved'}
              </button>
            </div>
            {item.revisitDueAt && (
              <div className="mt-2 text-xs text-[#d7ba7d]">
                Revisit scheduled for {item.revisitDueAt.slice(0, 10)}
              </div>
            )}
          </Section>

          <Section title="Reflection">
            <ReflectionFields itemId={item.id} reflection={item.reflection} />
          </Section>

          <Section title="Notes & scratchpad">
            <NotesEditors
              itemId={item.id}
              notesMarkdown={item.notesMarkdown}
              cppScratchpad={item.cppScratchpad}
            />
          </Section>

          {meta.kind === 'weekend' && meta.stages != null && (
            <Section title="Weekend project">
              <WeekendSection item={item} totalStages={meta.stages} />
            </Section>
          )}
        </div>

        <aside className="space-y-6">
          <TimerControls
            itemId={item.id}
            timeLimitMin={meta.timeLimitMin}
            softTimer={meta.softTimer}
          />
          <Section title="Bug tags">
            <BugSection item={item} />
          </Section>
          <Section title="Concepts trained">
            <ConceptSection item={item} />
          </Section>
        </aside>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">{title}</h2>
      <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
        {children}
      </div>
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[var(--vscode-tab-inactive-bg)] px-2 py-0.5 text-[11px]">{children}</span>
  )
}
