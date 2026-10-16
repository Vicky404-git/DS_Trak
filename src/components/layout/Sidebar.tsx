import { useCallback, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'
import ExplorerTree from '../explorer/ExplorerTree'
import DueToday from '../explorer/DueToday'
import SearchPanel from '../explorer/SearchPanel'

export default function Sidebar() {
  const activeView = useUIStore((s) => s.activeView)
  const width = useUIStore((s) => s.sidebarWidth)
  const setWidth = useUIStore((s) => s.setSidebarWidth)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startX.current = e.clientX
      startWidth.current = width
      const onMove = (ev: MouseEvent) => {
        setWidth(startWidth.current + ev.clientX - startX.current)
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [width, setWidth],
  )

  const title =
    activeView === 'search'
      ? 'SEARCH'
      : activeView === 'curriculum'
        ? 'EXPLORER'
        : activeView.toUpperCase()

  return (
    <div
      className="relative flex shrink-0 flex-col border-r border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)]"
      style={{ width }}
    >
      <div className="flex h-7 items-center border-b border-[var(--vscode-border)] px-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {activeView === 'search' ? (
          <SearchPanel />
        ) : (
          <>
            <Section title="Curriculum">
              <ExplorerTree />
            </Section>
            <Section title="Due today">
              <DueToday />
            </Section>
          </>
        )}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[var(--vscode-status-bar-bg)]"
        onMouseDown={onMouseDown}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--vscode-border)] py-1">
      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </div>
      <div className="px-1">{children}</div>
    </div>
  )
}
