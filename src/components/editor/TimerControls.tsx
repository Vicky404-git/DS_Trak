import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useNow } from '../../hooks/useNow'
import { formatClock, formatDuration } from '../../core/utils/dateUtils'
import type { SelfScores } from '../../types/item'

const SELF_SCORE_FIELDS: Array<keyof SelfScores> = [
  'understanding',
  'algorithmChoice',
  'correctness',
  'optimization',
  'implementation',
  'timeManagement',
]

const FIELD_LABELS: Record<keyof SelfScores, string> = {
  understanding: 'Understanding',
  algorithmChoice: 'Algorithm choice',
  correctness: 'Correctness',
  optimization: 'Optimization',
  implementation: 'Implementation',
  timeManagement: 'Time management',
}

const DEFAULT_SCORES: SelfScores = {
  understanding: 3,
  algorithmChoice: 3,
  correctness: 3,
  optimization: 3,
  implementation: 3,
  timeManagement: 3,
}

interface Attempt {
  startedAt: string
  endedAt: string
  overtimeMs: number
}

interface Props {
  itemId: string
  timeLimitMin: number | null
  softTimer: boolean
}

export default function TimerControls({ itemId, timeLimitMin, softTimer }: Props) {
  const timeSpentMs = useDataStore((s) => s.progress.find((p) => p.id === itemId)?.timeSpentMs ?? 0)
  const startIso = useDataStore((s) => s.activeSessions[itemId])
  const now = useNow(1000)
  const [showScores, setShowScores] = useState(false)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [scores, setScores] = useState<SelfScores>(DEFAULT_SCORES)

  const elapsed = startIso ? now - new Date(startIso).getTime() : 0
  let display: string
  if (timeLimitMin) {
    const remaining = timeLimitMin * 60_000 - elapsed
    display = startIso && remaining < 0 ? '+' + formatClock(-remaining) : formatClock(Math.max(0, remaining))
  } else {
    display = formatClock(elapsed)
  }

  async function handleStop() {
    if (!startIso) return
    const endedAt = new Date().toISOString()
    const overtimeMs = timeLimitMin
      ? Math.max(0, now - new Date(startIso).getTime() - timeLimitMin * 60_000)
      : 0
    await useDataStore.getState().stopTimer(itemId)
    if (timeLimitMin) {
      setAttempt({ startedAt: startIso, endedAt, overtimeMs })
      setShowScores(true)
    }
  }

  function submitTimed() {
    if (!attempt) return
    const total = SELF_SCORE_FIELDS.reduce((sum, f) => sum + scores[f], 0)
    void useDataStore.getState().saveTimedResult({
      itemId,
      startedAt: attempt.startedAt,
      endedAt: attempt.endedAt,
      timeLimitMin: timeLimitMin ?? 0,
      wasGraded: !softTimer,
      overtimeMs: attempt.overtimeMs,
      selfScores: scores,
      totalSelfScore: total,
    })
    setShowScores(false)
    setAttempt(null)
  }

  return (
    <div className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-400">Timer</span>
        {timeLimitMin && (
          <span className="text-xs text-gray-400">
            limit {timeLimitMin}m ·{' '}
            <span className={softTimer ? 'text-[#d7ba7d]' : 'text-[#f48771]'}>
              {softTimer ? 'soft / not graded' : 'graded · no pause'}
            </span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-2xl text-white">{display}</div>
        <div className="text-xs text-gray-400">total {formatDuration(timeSpentMs)}</div>
        <div className="ml-auto">
          {startIso ? (
            <button onClick={handleStop} className="rounded bg-[#f48771] px-3 py-1 text-sm text-black">
              Stop
            </button>
          ) : (
            <button
              onClick={() => useDataStore.getState().startTimer(itemId)}
              className="rounded bg-[var(--vscode-status-bar-bg)] px-3 py-1 text-sm text-white"
            >
              Start
            </button>
          )}
        </div>
      </div>

      {showScores && (
        <div className="mt-3 rounded border border-[var(--vscode-border)] p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">Self-score (0-5)</div>
          <div className="grid grid-cols-2 gap-2">
            {SELF_SCORE_FIELDS.map((field) => (
              <label key={field} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-gray-300">{FIELD_LABELS[field]}</span>
                <select
                  value={scores[field]}
                  onChange={(e) => setScores((s) => ({ ...s, [field]: Number(e.target.value) }))}
                  className="rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-1 py-0.5"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowScores(false)
                setAttempt(null)
              }}
              className="rounded border border-[var(--vscode-border)] px-2 py-1 text-xs"
            >
              Skip
            </button>
            <button
              onClick={submitTimed}
              className="rounded bg-[var(--vscode-status-bar-bg)] px-2 py-1 text-xs text-white"
            >
              Save attempt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
