export default function BottomPanel() {
  return (
    <div className="h-48 bg-[var(--vscode-sidebar-bg)] border-t border-[var(--vscode-border)] flex flex-col">
      <div className="h-7 border-b border-[var(--vscode-border)] flex items-center bg-[var(--vscode-tab-inactive-bg)]">
        <div className="h-full px-4 flex items-center bg-[var(--vscode-tab-active-bg)] border-r border-[var(--vscode-border)] text-xs">
          TIMER
        </div>
        <div className="h-full px-4 flex items-center border-r border-[var(--vscode-border)] text-xs text-gray-400">
          HINT LOG
        </div>
        <div className="h-full px-4 flex items-center border-r border-[var(--vscode-border)] text-xs text-gray-400">
          BUG LOG
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 text-sm text-gray-400">
        Bottom panel content
      </div>
    </div>
  )
}
