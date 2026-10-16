export type ItemStatus = 'not-started' | 'in-progress' | 'solved' | 'needs-revisit'
export type ResultType = 'CLEAN' | 'H1' | 'H2' | 'H3' | 'SOL'
export type Confidence = 1 | 2 | 3 | 4 | 5

export interface TimeSession {
  id: string
  startTime: string
  endTime?: string
  durationMs: number
}

export interface Reflection {
  requirements: string
  observations: string
  constraints: string
  bruteForce: string
  bottleneck: string
  optimization: string
  dataStructure: string
  algorithm: string
  correctness: string
  complexityTime: string
  complexitySpace: string
}

export function createEmptyReflection(): Reflection {
  return {
    requirements: '',
    observations: '',
    constraints: '',
    bruteForce: '',
    bottleneck: '',
    optimization: '',
    dataStructure: '',
    algorithm: '',
    correctness: '',
    complexityTime: '',
    complexitySpace: '',
  }
}

export interface WeekendProject {
  stages: number
  stageChecklist: boolean[]
  gitBranch: string
  gitPrLink: string
  gitPrNotes: string
  gitTag: string
}

export interface SelfScores {
  understanding: number
  algorithmChoice: number
  correctness: number
  optimization: number
  implementation: number
  timeManagement: number
}

export interface ItemProgress {
  id: string
  title: string
  week: number
  kind: string
  status: ItemStatus
  result?: ResultType
  confidence?: Confidence
  timeSpentMs: number
  sessions: TimeSession[]
  reflection: Reflection
  notesMarkdown: string
  cppScratchpad: string
  bugTags: string[]
  bugNote: string
  conceptsTrained: string[]
  weekendProject?: WeekendProject
  createdAt: string
  updatedAt: string
  solvedAt?: string
  lastStudiedAt?: string
  revisitDueAt?: string
  revisitCount: number
  lastRevisitAt?: string
}

export const EMPTY_REFLECTION: Reflection = {
  requirements: '',
  observations: '',
  constraints: '',
  bruteForce: '',
  bottleneck: '',
  optimization: '',
  dataStructure: '',
  algorithm: '',
  correctness: '',
  complexityTime: '',
  complexitySpace: '',
}

export function createEmptyItemProgress(
  id: string,
  title: string,
  week: number,
  kind: string,
): ItemProgress {
  const now = new Date().toISOString()
  return {
    id,
    title,
    week,
    kind,
    status: 'not-started',
    timeSpentMs: 0,
    sessions: [],
    reflection: { ...EMPTY_REFLECTION },
    notesMarkdown: '',
    cppScratchpad: '',
    bugTags: [],
    bugNote: '',
    conceptsTrained: [],
    createdAt: now,
    updatedAt: now,
    revisitCount: 0,
  }
}

export interface TimedResult {
  id: string
  itemId: string
  startedAt: string
  endedAt: string
  timeLimitMin: number
  wasGraded: boolean
  overtimeMs: number
  selfScores: SelfScores
  totalSelfScore: number
}
