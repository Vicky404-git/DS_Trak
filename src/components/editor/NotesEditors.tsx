import { useDraft } from '../../hooks/useDraft'
import { useDataStore } from '../../store/dataStore'
import MonacoEditor from '../shared/MonacoEditor'

interface Props {
  itemId: string
  notesMarkdown: string
  cppScratchpad: string
}

export default function NotesEditors({ itemId, notesMarkdown, cppScratchpad }: Props) {
  const updateProgress = useDataStore((s) => s.updateProgress)
  const [notes, setNotes] = useDraft(notesMarkdown, (v) => void updateProgress(itemId, { notesMarkdown: v }), 600)
  const [cpp, setCpp] = useDraft(cppScratchpad, (v) => void updateProgress(itemId, { cppScratchpad: v }), 600)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Notes (Markdown)</div>
        <MonacoEditor language="markdown" value={notes} onChange={setNotes} height={280} />
      </div>
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">C++ Scratchpad (no execution)</div>
        <MonacoEditor language="cpp" value={cpp} onChange={setCpp} height={280} />
      </div>
    </div>
  )
}
