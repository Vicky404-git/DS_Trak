# DSA Tracker

A local-first, VS Code–styled web app for tracking an 8-week DSA practice
curriculum. Everything runs in your browser — there is **no backend, no login,
no telemetry, no AI, and no network requests at runtime**. All data lives in
IndexedDB and can be exported/imported as JSON.

## Features

- **Explorer** — the 8 curriculum weeks as a collapsible tree, with status icons
  (`not-started`, `in-progress`, `solved`, `needs-revisit`).
- **Item tabs** — per problem: status, result (CLEAN / H1 / H2 / H3 / SOL),
  confidence, reflection, Markdown notes, a C++ scratchpad (local Monaco),
  timer, bug tags and concept tags.
- **Due Today** — problems whose revisit date is due, driven by the revisit
  scheduler.
- **Timers** — per-item stopwatch plus an optional time-limit/soft-timer alarm.
- **Stats** — concept scores, skill profile (strengths/weaknesses), study
  heatmap, streaks, hint log and bug log.
- **Weekly report** — a generated end-of-week summary with a copy/export action.
- **Backup** — full JSON export/import; export then import reproduces an
  identical state.
- **Command palette & quick open** — VS Code–style `Ctrl+Shift+P` / `Ctrl+P`.
- **Settings** — daily target, rest day, and curriculum re-seed.

## Requirements

- Node.js **20.19+** (20.x is fine; do not use 21/23 — LTS 20 or 22 recommended)
- npm 10+

## Getting started (Debian / Linux)

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (the dev server prints the exact URL).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with oxlint |

To build and serve a static copy:

```bash
npm run build
npm run preview
```

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+P` | Quick-open an item by id or title |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| ``Ctrl+` `` | Toggle bottom panel |

## Data & backups

All state is stored in IndexedDB (database name `dsaTracker`). Use
**Settings → Export** to download a JSON backup and **Settings → Import** to
restore it. No data ever leaves the machine.

## No-network guarantees

- Fonts are bundled locally (`public/fonts`) — no Google Fonts or CDN.
- Monaco Editor is bundled from the local npm package with local web workers —
  it is **not** loaded from a CDN.
- The curriculum seed ships in the bundle (`src/data/curriculum.seed.json`).

The only strings that look like URLs in the bundle are documentation links
embedded inside Monaco's CSS language data; they are inert text and are never
fetched.

## Project layout

```
src/
  core/         Pure, unit-tested business logic (scoring, revisit, stats, report, backup)
  data/         Dexie database, schema, curriculum seed import and sync
  store/        Zustand UI + data stores
  components/   VS Code shell (layout, explorer, editor, stats, settings, timer, commands)
  types/        Domain types
tests/          Vitest specs for the pure core logic
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design: data models,
scoring formulas, database schema and migration plan.
