import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'

export default function EditorTabs() {
  const tabs = useUIStore((s) => s.tabs)
  const activeTabId = useUIStore((s) => s.activeTabId)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const closeTab = useUIStore((s) => s.closeTab)
  const reorderTabs = useUIStore((s) => s.reorderTabs)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  if (tabs.length === 0) {
    return (
      <div className="flex h-9 items-center border-b border-[var(--vscode-border)] bg-[var(--vscode-tab-inactive-bg)] px-3 text-xs text-gray-500">
        No open editors
      </div>
    )
  }

  return (
    <div className="flex h-9 items-stretch overflow-x-auto border-b border-[var(--vscode-border)] bg-[var(--vscode-tab-inactive-bg)]">
      {tabs.map((tab, index) => {
        const active = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) reorderTabs(dragIndex, index)
              setDragIndex(null)
            }}
            className={`group flex items-center gap-2 border-r border-[var(--vscode-border)] px-3 text-[13px] ${
              active
                ? 'bg-[var(--vscode-tab-active-bg)] text-white'
                : 'text-gray-400 hover:bg-[var(--vscode-tab-active-bg)]'
            }`}
          >
            <button onClick={() => setActiveTab(tab.id)} className="max-w-[220px] truncate">
              {tab.kind === 'item' && (
                <span className="mr-1 font-mono text-[11px] text-gray-500">{tab.itemId}</span>
              )}
              {tab.title}
            </button>
            <button
              className="rounded px-1 text-xs opacity-0 hover:bg-black/30 group-hover:opacity-100"
              onClick={() => closeTab(tab.id)}
              aria-label="Close tab"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
