import { useUIStore, type ActiveView } from '../../store/uiStore'

const ITEMS: Array<{ id: ActiveView; icon: string; title: string }> = [
  { id: 'curriculum', icon: '📁', title: 'Curriculum' },
  { id: 'search', icon: '🔍', title: 'Search' },
  { id: 'timer', icon: '⏱', title: 'Timer' },
  { id: 'stats', icon: '📊', title: 'Stats' },
  { id: 'settings', icon: '⚙', title: 'Settings' },
]

export default function ActivityBar() {
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const openTab = useUIStore((s) => s.openTab)

  function handleClick(id: ActiveView) {
    setActiveView(id)
    if (id === 'stats') openTab({ id: 'view-stats', kind: 'stats', title: 'Stats' })
    if (id === 'settings') openTab({ id: 'view-settings', kind: 'settings', title: 'Settings' })
    if (id === 'timer') openTab({ id: 'view-timer', kind: 'timer', title: 'Timer' })
    if (id === 'search') openTab({ id: 'view-search', kind: 'search', title: 'Search' })
  }

  return (
    <div className="flex w-12 flex-col items-center border-r border-[var(--vscode-border)] bg-[var(--vscode-activity-bar-bg)] py-1">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          title={item.title}
          onClick={() => handleClick(item.id)}
          className={`mb-1 flex h-10 w-10 items-center justify-center rounded text-lg ${
            activeView === item.id
              ? 'bg-[var(--vscode-tab-active-bg)] text-white'
              : 'text-[var(--vscode-text)] hover:bg-[var(--vscode-tab-inactive-bg)]'
          }`}
        >
          <span aria-hidden>{item.icon}</span>
        </button>
      ))}
    </div>
  )
}
