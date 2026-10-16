import type { ResultType } from './item'

export interface DailyActivity {
  date: string
  minutes: number
  itemsStudied: string[]
  lastUpdated: string
}

export interface HintLogEntry {
  id: string
  itemId: string
  week: number
  result: ResultType
  timestamp: string
  notes?: string
}

export interface BugLogEntry {
  id: string
  itemId: string
  week: number
  bugTags: string[]
  bugNote: string
  timestamp: string
}

export interface Settings {
  id: number
  dailyTargetMin: number
  restDay: number
  conceptManualOverrides: Record<string, number>
  defaultConcepts: string[]
  defaultBugTags: string[]
  lastBackupAt?: string
  lastImportAt?: string
}

export interface TimedResultRecord {
  id: string
  itemId: string
  startedAt: string
  endedAt: string
  timeLimitMin: number
  wasGraded: boolean
  overtimeMs: number
  selfScores: {
    understanding: number
    algorithmChoice: number
    correctness: number
    optimization: number
    implementation: number
    timeManagement: number
  }
  totalSelfScore: number
}

export const DEFAULT_BUG_TAGS = [
  'off-by-one',
  'sizeof-misuse',
  'empty-container',
  'overflow',
  'uninitialized',
  'wrong-complexity',
  'missed-edge-case',
  'logic',
  'misread-problem',
  'other',
]

export const DEFAULT_CONCEPTS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Sorting',
  'Prefix sums',
  'Two pointers',
  'Sliding window',
  'Binary search',
  'Recursion',
  'Backtracking',
  'Linked lists',
  'Stacks',
  'Queues',
  'Heaps',
  'Trees',
  'BST',
  'BFS/DFS',
  'Graphs',
  'Shortest path',
  'Topological sort',
  'Union-find',
  'DP',
]

export const SKILLS = [
  'decomposition',
  'brute force',
  'optimization',
  'complexity analysis',
  'edge cases',
  'debugging',
  'implementation',
  'algorithm design',
] as const

export type Skill = (typeof SKILLS)[number]

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  dailyTargetMin: 90,
  restDay: 0,
  conceptManualOverrides: {},
  defaultConcepts: DEFAULT_CONCEPTS,
  defaultBugTags: DEFAULT_BUG_TAGS,
}
