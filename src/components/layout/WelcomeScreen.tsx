import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'

export default function WelcomeScreen() {
  const curriculum = useDataStore((s) => s.curriculum)
  const openItem = useUIStore((s) => s.openItem)
  const firstItem = curriculum.weeks[0]?.items[0]

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-white">DSA Tracker</h1>
      <p className="mb-6 text-sm text-gray-400">
        A local-first, VS Code-style workspace for your 8-week algorithm design trainer.
      </p>
      <ul className="space-y-2 text-sm text-gray-300">
        <li>
          <kbd className="rounded bg-[var(--vscode-tab-inactive-bg)] px-1.5 py-0.5 font-mono text-xs">Ctrl+P</kbd>{' '}
          Quick-open an item by id or title
        </li>
        <li>
          <kbd className="rounded bg-[var(--vscode-tab-inactive-bg)] px-1.5 py-0.5 font-mono text-xs">
            Ctrl+Shift+P
          </kbd>{' '}
          Command palette
        </li>
        <li>
          <kbd className="rounded bg-[var(--vscode-tab-inactive-bg)] px-1.5 py-0.5 font-mono text-xs">Ctrl+B</kbd>{' '}
          Toggle sidebar
        </li>
        <li>
          <kbd className="rounded bg-[var(--vscode-tab-inactive-bg)] px-1.5 py-0.5 font-mono text-xs">Ctrl+`</kbd>{' '}
          Toggle bottom panel
        </li>
      </ul>
      {firstItem && (
        <button
          className="mt-8 rounded bg-[var(--vscode-status-bar-bg)] px-4 py-2 text-sm text-white"
          onClick={() => openItem(firstItem.id, firstItem.title)}
        >
          Start with {firstItem.id} · {firstItem.title}
        </button>
      )}
    </div>
  )
}
