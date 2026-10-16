import type { ItemStatus } from '../../types/item'

export interface StatusStyle {
  glyph: string
  color: string
  label: string
}

export const STATUS_STYLES: Record<ItemStatus, StatusStyle> = {
  'not-started': { glyph: '○', color: '#6a737d', label: 'Not started' },
  'in-progress': { glyph: '◐', color: '#4fc1ff', label: 'In progress' },
  solved: { glyph: '●', color: '#4ec9b0', label: 'Solved' },
  'needs-revisit': { glyph: '⟳', color: '#d7ba7d', label: 'Needs revisit' },
}

export function statusStyle(status: ItemStatus): StatusStyle {
  return STATUS_STYLES[status] ?? STATUS_STYLES['not-started']
}
