interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50">
      <div className="w-96 bg-[var(--vscode-sidebar-bg)] border border-[var(--vscode-border)] rounded shadow-lg">
        <div className="p-2 border-b border-[var(--vscode-border)]">
          <input
            type="text"
            className="w-full bg-[var(--vscode-editor-bg)] border border-[var(--vscode-border)] px-2 py-1 text-sm rounded outline-none"
            placeholder="Type a command..."
            autoFocus
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
        </div>
        <div className="p-2 text-sm max-h-64 overflow-auto">
          <div className="text-gray-400">Command palette (Ctrl+Shift+P)</div>
        </div>
      </div>
    </div>
  )
}
