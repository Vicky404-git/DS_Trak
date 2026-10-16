export type ItemKind = 'drill' | 'baseline' | 'core' | 'timed' | 'weekend'

export interface CurriculumItem {
  id: string
  title: string
  kind: ItemKind
  level: number
  timeLimitMin: number | null
  softTimer: boolean
  stages: number | null
}

export interface CurriculumWeek {
  week: number
  title: string
  goal: string
  systemsLink: string
  items: CurriculumItem[]
}

export interface Curriculum {
  version: number
  title: string
  weeks: CurriculumWeek[]
}
