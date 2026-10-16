interface Props {
  bottomPanelVisible: boolean
  onToggleBottomPanel: () => void
}

export default function StatusBar({ bottomPanelVisible, onToggleBottomPanel }: Props) {
  return (
    <div className="h-6 bg-[var(--vscode-status-bar-bg)] flex items-center justify-between px-3 text-xs text-white select-none">
      <div className="flex items-center gap-3">
        <span>master</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Due today: 0</span>
        <button onClick={onToggleBottomPanel} className="hover:underline">
          {bottomPanelVisible ? 'Hide Panel' : 'Show Panel'} (Ctrl+`)
        </button>
      </div>
    </div>
  )
}
