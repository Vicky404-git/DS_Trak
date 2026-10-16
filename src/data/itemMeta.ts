import type { Curriculum, CurriculumItem } from '../types/curriculum'

export type ItemMeta = CurriculumItem

export function getItemMeta(curriculum: Curriculum, itemId: string): ItemMeta | undefined {
  for (const week of curriculum.weeks) {
    const found = week.items.find((item) => item.id === itemId)
    if (found) return found
  }
  return undefined
}
