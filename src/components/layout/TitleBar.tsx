import { useUIStore } from '../../store/uiStore'

export default function TitleBar() {
  function openQuickOpen() {
    useUIStore.getState().openQuickOpen()
  }
  function openCommandPalette() {
    useUIStore.getState().openCommandPalette()
  }

  return (
    <div className="flex h-8 items-center justify-between border-b border-[var(--vscode-border)] bg-[var(--vscode-activity-bar-bg)] px-3 text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">DSA Tracker</span>
        <span className="text-gray-400">— local-first practice log</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={openQuickOpen}
          className="rounded px-2 py-0.5 text-gray-300 hover:bg-[var(--vscode-tab-active-bg)]"
        >
          Ctrl+P
        </button>
        <button
          onClick={openCommandPalette}
          className="rounded px-2 py-0.5 text-gray-300 hover:bg-[var(--vscode-tab-active-bg)]"
        >
          Ctrl+Shift+P
        </button>
      </div>
    </div>
  )
}
