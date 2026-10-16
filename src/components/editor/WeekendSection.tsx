import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import type { ItemProgress, WeekendProject } from '../../types/item'

interface Props {
  item: ItemProgress
  totalStages: number
}

export default function WeekendSection({ item, totalStages }: Props) {
  const updateProgress = useDataStore((s) => s.updateProgress)

  const weekend: WeekendProject = useMemo(() => {
    const existing = item.weekendProject
    const checklist = existing?.stageChecklist ?? Array.from({ length: totalStages }, () => false)
    const normalized = Array.from({ length: totalStages }, (_, i) => checklist[i] ?? false)
    return {
      stages: totalStages,
      stageChecklist: normalized,
      gitBranch: existing?.gitBranch ?? '',
      gitPrLink: existing?.gitPrLink ?? '',
      gitPrNotes: existing?.gitPrNotes ?? '',
      gitTag: existing?.gitTag ?? '',
    }
  }, [item.weekendProject, totalStages])

  function update(patch: Partial<WeekendProject>) {
    void updateProgress(item.id, { weekendProject: { ...weekend, ...patch } })
  }

  const done = weekend.stageChecklist.filter(Boolean).length

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
          Stage checklist ({done}/{totalStages})
        </div>
        <ul className="space-y-1">
          {weekend.stageChecklist.map((checked, i) => (
            <li key={i}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = [...weekend.stageChecklist]
                    next[i] = e.target.checked
                    update({ stageChecklist: next })
                  }}
                />
                Stage {i + 1}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="uppercase tracking-wide text-gray-400">Git branch</span>
          <input
            value={weekend.gitBranch}
            onChange={(e) => update({ gitBranch: e.target.value })}
            className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="uppercase tracking-wide text-gray-400">Tag</span>
          <input
            value={weekend.gitTag}
            onChange={(e) => update({ gitTag: e.target.value })}
            className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-2">
          <span className="uppercase tracking-wide text-gray-400">PR link / notes</span>
          <input
            value={weekend.gitPrLink}
            onChange={(e) => update({ gitPrLink: e.target.value })}
            className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-2">
          <span className="uppercase tracking-wide text-gray-400">PR notes</span>
          <textarea
            value={weekend.gitPrNotes}
            onChange={(e) => update({ gitPrNotes: e.target.value })}
            rows={2}
            className="resize-y rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
          />
        </label>
      </div>
    </div>
  )
}
