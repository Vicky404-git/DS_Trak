interface Props {
  activeView: 'curriculum' | 'search' | 'timer' | 'stats' | 'settings'
}

export default function EditorArea({ activeView }: Props) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--vscode-editor-bg)]">
      <div className="h-9 border-b border-[var(--vscode-border)] flex items-center bg-[var(--vscode-tab-inactive-bg)]">
        <div className="h-full px-4 flex items-center bg-[var(--vscode-tab-active-bg)] border-r border-[var(--vscode-border)] text-sm">
          {activeView === 'curriculum' && 'Welcome'}
          {activeView === 'search' && 'Search'}
          {activeView === 'timer' && 'Timer'}
          {activeView === 'stats' && 'Stats'}
          {activeView === 'settings' && 'Settings'}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {activeView === 'curriculum' && (
          <div className="max-w-4xl">
            <h1 className="text-2xl mb-4">DSA Tracker</h1>
            <p className="text-gray-400 mb-4">Local web app for tracking DSA practice. No network calls, no AI, all data in IndexedDB.</p>
            <p className="text-gray-400">Open an item from the explorer to start tracking.</p>
          </div>
        )}
        {activeView === 'search' && <div className="text-gray-400">Search functionality coming soon</div>}
        {activeView === 'timer' && <div className="text-gray-400">Timer panel coming soon</div>}
        {activeView === 'stats' && <div className="text-gray-400">Stats &amp; weakness profile coming soon</div>}
        {activeView === 'settings' && <div className="text-gray-400">Settings coming soon</div>}
      </div>
    </div>
  )
}
