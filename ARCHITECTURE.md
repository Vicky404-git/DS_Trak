# DSA Tracker Architecture (cont'd)

## 7.5 Hint Log & Bug Log Views

**Hint Log View**: Counts by result type per week. Show table with week, result counts (CLEAN, H1, H2, H3, SOL), total entries.
```typescript
interface HintLogSummary {
  week: number;
  counts: Record<ResultType, number>;
  total: number;
}
```

**Bug Log View**: Filterable table (by week, by bug tag), top recurring tags.
```typescript
function getTopBugTags(entries: BugLogEntry[], limit=10): Array<{tag: string, count: number}>;
```

## 8. DB Schema & Dexie Setup

We use Dexie for IndexedDB. Schema versioned; migrations planned.

### 8.1 Tables

```typescript
interface SchemaV1 {
  // Curriculum items reference (cache from import) - optional
  curriculumItems: {
    id: string; // PK
    week: number;
    kind: string;
    title: string;
    level: number;
    timeLimitMin: number | null;
    softTimer: boolean;
    stages: number | null;
  };
  
  // Core progress
  itemProgress: {
    id: string; // PK
    title: string;
    status: string;
    result?: string;
    confidence?: number;
    timeSpentMs: number;
    sessions: TimeSession[];
    reflection: Reflection;
    notesMarkdown: string;
    cppScratchpad: string;
    bugTags: string[];
    bugNote: string;
    conceptsTrained: string[];
    weekendProject?: WeekendProject;
    createdAt: Date;
    updatedAt: Date;
    solvedAt?: Date;
    lastStudiedAt?: Date;
    revisitDueAt?: Date;
    revisitCount: number;
    lastRevisitAt?: Date;
  };
  
  timedResults: {
    id: string; // PK
    itemId: string;
    startedAt: Date;
    endedAt: Date;
    timeLimitMin: number;
    wasGraded: boolean;
    overtimeMs: number;
    selfScores: SelfScores;
    totalSelfScore: number;
  };
  
  dailyActivity: {
    date: string; // PK YYYY-MM-DD
    minutes: number;
    itemsStudied: string[];
    lastUpdated: Date;
  };
  
  hintLog: {
    id: string; // PK
    itemId: string;
    week: number;
    result: string;
    timestamp: Date;
    notes?: string;
  };
  
  bugLog: {
    id: string; // PK
    itemId: string;
    week: number;
    bugTags: string[];
    bugNote: string;
    timestamp: Date;
  };
  
  settings: {
    id: number; // PK = 1
    dailyTargetMin: number;
    restDay: number;
    conceptManualOverrides: Record<string, number>;
    defaultConcepts: string[];
    defaultBugTags: string[];
    lastBackupAt?: Date;
    lastImportAt?: Date;
  };
}
```

### 8.2 Dexie DB Class

```typescript
export class DsaTrackerDB extends Dexie {
  curriculumItems!: Table<CurriculumItemCache, string>;
  itemProgress!: Table<ItemProgress, string>;
  timedResults!: Table<TimedResult, string>;
  dailyActivity!: Table<DailyActivity, string>;
  hintLog!: Table<HintLogEntry, string>;
  bugLog!: Table<BugLogEntry, string>;
  settings!: Table<Settings, number>;
  
  constructor() {
    super('dsaTracker');
    this.version(1).stores({
      curriculumItems: 'id, week, kind',
      itemProgress: 'id, status, solvedAt, revisitDueAt, lastStudiedAt',
      timedResults: 'id, itemId, startedAt, endedAt',
      dailyActivity: 'date',
      hintLog: 'id, itemId, week, result, timestamp',
      bugLog: 'id, itemId, week, timestamp, *bugTags',
      settings: 'id'
    });
  }
}
```

### 8.3 Migration Plan

- **v1** (initial): Create all tables with indices as above
- Future migrations: Add new fields with defaults, never drop data. All migrations must be additive and backward-compatible. Migration code in `data/migrations.ts`
- On schema change: increment version, add migration logic in `upgrade()` callback

## 9. Export/Import (Critical)

### 9.1 Weekly Report (Copy to clipboard as Markdown)

One-click "Weekly report" copies compact Markdown containing:
- Header: Week range, date generated, total minutes, items solved this week
- Per item: id, result, time (hh:mm or minutes), hints count? (infer from result), bug tags, complexity written (check if complexityTime/Space non-empty), confidence, trimmed excerpt of notes (first N chars, e.g. 100-150)
- Weakness profile snapshot: top 3 weak concepts/skills (lowest scores)
- Revisits due: items with revisitDueAt in this week or overdue? "revisits due" - likely items due today/this week
- Heatmap totals for the week: sum of minutes per day in week

Function: `generateWeeklyReport(week: number, dbData: DBData): string` in `core/report/weeklyReport.ts`. Pure function, unit-testable.

Format example:
```markdown
# Weekly Report - Week 3 (Oct 16 2026)

## Summary
- Total minutes: 245 min
- Items solved: 4
- Revisits due: 2

## Items
| ID | Result | Time | Hints | Bug Tags | Complexity | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| 3-T1 | CLEAN | 35m | 0 | [] | yes | 5 | "Used sliding window..." |

## Weakness Profile Snapshot (lowest)
1. Hashing: 0.42 (4.2/10)
2. Debugging: 0.48 (4.8/10)
3. Edge cases: 0.52 (5.2/10)

## Revisits Due
- 2-C1 (due Oct 20)
- 3-C2 (overdue Oct 15)

## Heatmap Totals (Week of Oct 12-18)
- Mon: 45m, Tue: 30m, Wed: 60m, Thu: 40m, Fri: 35m, Sat: 20m, Sun: 15m (Total: 245m)
```

### 9.2 Full Backup Export/Import (JSON, versioned)

**Export**: Generate full backup with version and timestamp. Include all tables.

```typescript
interface BackupData {
  version: string; // app version, e.g. "0.1.0"
  schemaVersion: number; // DB schema version
  exportedAt: string; // ISO
  data: {
    curriculumItems: CurriculumItemCache[];
    itemProgress: ItemProgress[];
    timedResults: TimedResult[];
    dailyActivity: DailyActivity[];
    hintLog: HintLogEntry[];
    bugLog: BugLogEntry[];
    settings: Settings | null;
  };
}
```

**Export action**: "Full backup export" downloads `dsa-tracker-backup-YYYY-MM-DD.json`

**Import action**: "Full backup import" - read JSON, validate version/schema, show confirmation dialog before overwriting. On confirm, clear all tables and import (or merge? requirement says "confirmation before overwriting"). Overwrite = replace all existing data with backup.

Validation in `core/export-import/validator.ts`:
- Must have required top-level fields (version, schemaVersion, exportedAt, data)
- data must contain expected tables
- Type checks for critical fields (ids, dates parseable)
- Version compatibility check (warn if newer schema, but allow if compatible)

## 10. Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+P` | Quick-open item by id or title |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+\`` | Toggle bottom panel (backtick) |

Implemented via `useKeyboard` hook. On macOS, could also support Cmd equivalents in future, but target is Debian/Linux; Ctrl as specified.

## 11. Theme (VS Code Dark+)

Color palette:
- Editor background: `#1e1e1e`
- Sidebar background: `#252526`
- Activity bar background: `#333333`
- Status bar background: `#007acc`
- Tabs background (inactive): `#2d2d2d`
- Tabs background (active): `#1e1e1e`
- Border color: `#3c3c3c`
- Text color: `#cccccc`
- Accent/selection colors per VS Code Dark+

Define CSS variables in `styles/vscode-theme.css` and apply via Tailwind config theme extensions.

Fonts:
- Code/UI monospace: `JetBrains Mono`, `Consolas`, `ui-monospace`, `monospace`
- UI sans: system font stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

Bundle JetBrains Mono locally (WOFF2/WOFF) in `public/fonts/` to avoid network requests.

## 12. Timers

- Start/stop sessions accumulate `timeSpentMs`
- For timed items with `timeLimitMin`, countdown mode
- **Soft timers**: shown as "not graded" (visual indicator)
- **Graded timers**: pause is NOT allowed. If timer is running and graded, disable pause UI
- On finish: prompt for 0-5 self-scores (6 categories), record `TimedResult` with overtimeMs
- Update dailyActivity on session stop (add minutes to today's date)

## 13. Default Tag Lists

**Bug tags (defaults):**
- off-by-one
- sizeof-misuse
- empty-container
- overflow
- uninitialized
- wrong-complexity
- missed-edge-case
- logic
- misread-problem
- other

**Concepts (defaults):**
- Arrays, Strings, Hashing, Sorting, Prefix sums, Two pointers, Sliding window, Binary search, Recursion, Backtracking, Linked lists, Stacks, Queues, Heaps, Trees, BST, BFS/DFS, Graphs, Shortest path, Topological sort, Union-find, DP

Stored in Settings; user can customize. Also allow custom free-text entries in UI.

## 14. Business Logic Separation

**Pure (core/)**: No React, no DOM, no Dexie. Deterministic, unit-testable with Vitest.
- scoring/*.ts - all scoring formulas
- revisit/revisitScheduler.ts - scheduling logic
- stats/*.ts - aggregations
- report/weeklyReport.ts - report generation
- export-import/*.ts - validation/transform
- timer/timerLogic.ts - timer calculations

**Impure (UI/data)**: React components, Zustand, Dexie, Monaco - handle I/O, rendering.

This enforces the constraint "Business logic (scoring, revisit scheduling, report generation) lives in pure, unit-tested functions, separate from React components."

## 15. Testing Strategy

- **Unit tests (Vitest)**: All pure functions in `core/`. Cover edge cases (no data, boundaries, etc.)
- **Test files**: `tests/**/*.test.ts` (or colocated near core as `*.test.ts`)
- Focus: scoring formulas, revisit rules, report generation, validation
- Run with `npm run test` (pass required for Definition of Done)

## 16. Phases & Acceptance Criteria

0. ✅ Architecture doc, wait for approval (this document)
1. Scaffold + VS Code shell, theme, layout, command palette
2. Data layer (Dexie) + curriculum import + explorer + item tabs
3. Tracking (status, results, reflection, notes, bug tags) + timers
4. Revisit scheduling + stats/profile + heatmap
5. Weekly report + backup/import + weekend project tracker
6. Polish, tests, README with run instructions for Debian (node 20+)

Definition of Done: `npm run dev` works, `npm run test` passes, no network calls at runtime, all data survives refresh, export then import reproduces same state.

## 17. Git Workflow

- Initialize repo
- Feature branch per phase: `feat/phase-1-shell`, `feat/phase-2-data`, etc.
- Small conventional commits (feat:, fix:, chore:, test:, docs:)
- Merge into main with `--no-ff`
- Tag `v0.1.0` at end
- Remote: https://github.com/Vicky404-git/DS_Trak
- Push to master branch (per user instruction)

## 18. Implementation Notes

- **Zero network calls**: All fonts in `public/fonts/` or bundled; no CDN links. Check all imports (no google fonts URLs). Monaco configured to use local fonts.
- **Curriculum import**: Bundled as `public/curriculum.json`. Also re-importable from Settings (user uploads JSON). Validate structure on import.
- **Dates**: Use local Date. For comparisons (due today), compare by date only (year/month/day).
- **JSON export/import**: Pretty print export for readability. Validate on import with clear errors.
- **ID generation**: Use nanoid/uuid for sessions, timedResults, logs. Curriculum items use fixed IDs.
- **Monaco**: Configure for markdown and cpp. Read-only? No - editing only (notes + cpp scratchpad). No code execution.
- **Resizable panels**: Custom ResizableSplit component or use CSS grid/flex with resize handles. Keep state in UI store.
- **Confirmation dialogs**: Before overwriting on import, before destructive actions.
- **Accessibility**: Minimal but functional - focus states, keyboard navigable where practical.
- **Performance**: For large trees (56 items total), rendering is trivial; Dexie queries indexed.

## 19. Open Questions (to resolve during implementation)

1. Exact recency weighting formula for concept scores - propose concrete defaults
2. Skill score computation signals - need concrete, testable logic
3. "Failed or hinted revisit" - if revisit result is CLEAN, what happens? Schedule as normal (10 days from revisit date)? Assume yes.
4. Weekly report "revisits due" - this week or overdue? Include both (overdue + due in current week)
5. Truncation length for notes excerpt in weekly report - 120 chars?

These will be finalized when implementing the pure functions and documented in code comments.
