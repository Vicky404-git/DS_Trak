interface Props {
  activeView: 'curriculum' | 'search' | 'timer' | 'stats' | 'settings'
  onViewChange: (view: 'curriculum' | 'search' | 'timer' | 'stats' | 'settings') => void
  onToggleSidebar: () => void
}

export default function ActivityBar({ activeView, onViewChange, onToggleSidebar }: Props) {
  const items = [
    { id: 'curriculum', icon: '📚', title: 'Curriculum' },
    { id: 'search', icon: '🔍', title: 'Search' },
    { id: 'timer', icon: '⏱️', title: 'Timer' },
    { id: 'stats', icon: '📊', title: 'Stats' },
    { id: 'settings', icon: '⚙️', title: 'Settings' },
  ] as const

  return (
    <div className="w-12 bg-[var(--vscode-activity-bar-bg)] border-r border-[var(--vscode-border)] flex flex-col items-center py-2">
      {items.map((item) => (
        <button
          key={item.id}
          className={`w-10 h-10 mb-1 rounded flex items-center justify-center hover:bg-[var(--vscode-tab-inactive-bg)] ${
            activeView === item.id ? 'bg-[var(--vscode-tab-active-bg)]' : ''
          }`}
          title={item.title}
          onClick={() => onViewChange(item.id)}
        >
          <span>{item.icon}</span>
        </button>
      ))}
    </div>
  )
}
