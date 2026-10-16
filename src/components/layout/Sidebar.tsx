interface Props {
  activeView: 'curriculum' | 'search' | 'timer' | 'stats' | 'settings'
}

export default function Sidebar({ activeView }: Props) {
  return (
    <div className="w-80 bg-[var(--vscode-sidebar-bg)] border-r border-[var(--vscode-border)] flex flex-col overflow-hidden">
      <div className="h-7 px-3 flex items-center border-b border-[var(--vscode-border)] text-xs uppercase font-medium">
        {activeView === 'curriculum' && 'EXPLORER'}
        {activeView === 'search' && 'SEARCH'}
        {activeView === 'timer' && 'TIMER'}
        {activeView === 'stats' && 'STATS'}
        {activeView === 'settings' && 'SETTINGS'}
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        {activeView === 'curriculum' && (
          <div>
            <div className="text-xs font-semibold mb-2">CURRICULUM</div>
            <div className="text-gray-400">Explorer tree will be here</div>
            <div className="text-xs font-semibold mt-4 mb-2">DUE TODAY</div>
            <div className="text-gray-400">No items due</div>
          </div>
        )}
        {activeView === 'search' && <div className="text-gray-400">Search view</div>}
        {activeView === 'timer' && <div className="text-gray-400">Timer view</div>}
        {activeView === 'stats' && <div className="text-gray-400">Stats view</div>}
        {activeView === 'settings' && <div className="text-gray-400">Settings view</div>}
      </div>
    </div>
  )
}
