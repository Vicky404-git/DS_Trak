import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { computeAllConceptScores } from '../../core/scoring/conceptScore'
import { computeSkillScore } from '../../core/scoring/skillScore'
import { SKILLS } from '../../types/stats'
import BarRow from './BarRow'

export default function WeaknessProfile() {
  const progress = useDataStore((s) => s.progress)
  const settings = useDataStore((s) => s.settings)
  const updateSettings = useDataStore((s) => s.updateSettings)

  const concepts = useMemo(
    () =>
      computeAllConceptScores(
        settings.defaultConcepts,
        progress,
        settings.conceptManualOverrides,
      ).sort((a, b) => b.score - a.score),
    [settings, progress],
  )

  const skills = useMemo(
    () => SKILLS.map((s) => ({ skill: s, score: computeSkillScore(s, progress) })),
    [progress],
  )

  function setOverride(concept: string, raw: string) {
    const next = { ...settings.conceptManualOverrides }
    if (raw === '') delete next[concept]
    else next[concept] = Math.max(0, Math.min(1, Number(raw)))
    void updateSettings({ conceptManualOverrides: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
          Concepts (performance, recency-weighted)
        </h3>
        <div className="space-y-1">
          {concepts.map((c) => (
            <div key={c.concept} className="flex items-center gap-2">
              <BarRow label={c.concept} value={c.score * 10} />
              <input
                value={settings.conceptManualOverrides[c.concept] ?? ''}
                onChange={(e) => setOverride(c.concept, e.target.value)}
                placeholder="override"
                className="w-20 rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-1 py-0.5 text-xs outline-none"
              />
              {c.overridden && <span className="text-[10px] text-[#d7ba7d]">manual</span>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-300">Skills</h3>
        <div className="space-y-1">
          {skills.map((s) => (
            <BarRow key={s.skill} label={s.skill} value={s.score} />
          ))}
        </div>
      </div>
    </div>
  )
}
