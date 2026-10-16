import { useDraft } from '../../hooks/useDraft'
import { useDataStore } from '../../store/dataStore'
import type { Reflection } from '../../types/item'

const FIELDS: Array<{ key: keyof Reflection; label: string }> = [
  { key: 'requirements', label: 'Requirements' },
  { key: 'observations', label: 'Observations' },
  { key: 'constraints', label: 'Constraints' },
  { key: 'bruteForce', label: 'Brute force' },
  { key: 'bottleneck', label: 'Bottleneck' },
  { key: 'optimization', label: 'Optimization' },
  { key: 'dataStructure', label: 'Data structure' },
  { key: 'algorithm', label: 'Algorithm' },
  { key: 'correctness', label: 'Correctness' },
  { key: 'complexityTime', label: 'Time complexity' },
  { key: 'complexitySpace', label: 'Space complexity' },
]

interface Props {
  itemId: string
  reflection: Reflection
}

export default function ReflectionFields({ itemId, reflection }: Props) {
  const updateReflection = useDataStore((s) => s.updateReflection)
  const [draft, setDraft] = useDraft(reflection, (next) => void updateReflection(itemId, next), 600)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {FIELDS.map((field) => (
        <label key={field.key} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-gray-400">{field.label}</span>
          <textarea
            value={draft[field.key]}
            onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
            rows={2}
            className="resize-y rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none focus:border-[var(--vscode-status-bar-bg)]"
          />
        </label>
      ))}
    </div>
  )
}
