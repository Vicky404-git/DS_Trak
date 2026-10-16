import { useEffect } from 'react'
import TitleBar from './TitleBar'
import ActivityBar from './ActivityBar'
import Sidebar from './Sidebar'
import EditorArea from './EditorArea'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'
import CommandPalette from '../commands/CommandPalette'
import QuickOpen from '../commands/QuickOpen'
import { useKeyboard } from '../../hooks/useKeyboard'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'

export default function Layout() {
  useKeyboard()
  const load = useDataStore((s) => s.load)
  const loaded = useDataStore((s) => s.loaded)
  const sidebarVisible = useUIStore((s) => s.sidebarVisible)
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible)

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--vscode-editor-bg)] text-[var(--vscode-text)]">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <div className="flex min-h-0 flex-1">
          {sidebarVisible && <Sidebar />}
          <div className="flex min-h-0 flex-1 flex-col">
            {loaded ? <EditorArea /> : <LoadingScreen />}
            {bottomPanelVisible && <BottomPanel />}
          </div>
        </div>
      </div>
      <StatusBar />
      <CommandPalette />
      <QuickOpen />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
      Loading local data…
    </div>
  )
}
