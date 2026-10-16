import { useDataStore } from '../../store/dataStore'
import TagSelect from '../shared/TagSelect'
import type { ItemProgress } from '../../types/item'

export default function ConceptSection({ item }: { item: ItemProgress }) {
  const settings = useDataStore((s) => s.settings)
  const updateProgress = useDataStore((s) => s.updateProgress)

  return (
    <TagSelect
      value={item.conceptsTrained}
      options={settings.defaultConcepts}
      onChange={(conceptsTrained) => void updateProgress(item.id, { conceptsTrained })}
      placeholder="Add custom concept…"
    />
  )
}
