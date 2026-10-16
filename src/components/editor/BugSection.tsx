import { useState } from 'react'
import { useDraft } from '../../hooks/useDraft'
import { useDataStore } from '../../store/dataStore'
import TagSelect from '../shared/TagSelect'
import type { ItemProgress } from '../../types/item'

interface Props {
  item: ItemProgress
}

export default function BugSection({ item }: Props) {
  const settings = useDataStore((s) => s.settings)
  const updateProgress = useDataStore((s) => s.updateProgress)
  const addBugLog = useDataStore((s) => s.addBugLog)
  const [saved, setSaved] = useState(false)
  const [note, setNote] = useDraft(item.bugNote, (v) => void updateProgress(item.id, { bugNote: v }), 600)

  function logBug() {
    if (item.bugTags.length === 0 && !note.trim()) return
    void addBugLog({
      itemId: item.id,
      week: item.week,
      bugTags: item.bugTags,
      bugNote: note,
      timestamp: new Date().toISOString(),
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <TagSelect
        value={item.bugTags}
        options={settings.defaultBugTags}
        onChange={(bugTags) => void updateProgress(item.id, { bugTags })}
        placeholder="Add custom bug tag…"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Bug note…"
        className="mt-2 w-full resize-y rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-sm outline-none"
      />
      <button
        onClick={logBug}
        className="mt-2 rounded border border-[var(--vscode-border)] px-2 py-1 text-xs hover:bg-[var(--vscode-tab-inactive-bg)]"
      >
        {saved ? 'Logged ✓' : 'Add to bug log'}
      </button>
    </div>
  )
}
