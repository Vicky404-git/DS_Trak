import { useState } from 'react'
import TitleBar from './TitleBar'
import ActivityBar from './ActivityBar'
import Sidebar from './Sidebar'
import EditorArea from './EditorArea'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'
import CommandPalette from '../commands/CommandPalette'

export default function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [bottomPanelVisible, setBottomPanelVisible] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [activeView, setActiveView] = useState<'curriculum' | 'search' | 'timer' | 'stats' | 'settings'>('curriculum')

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--vscode-editor-bg)] text-[var(--vscode-text)]">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <ActivityBar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
        <div className="flex flex-1 min-h-0">
          {sidebarVisible && <Sidebar activeView={activeView} />}
          <div className="flex flex-col flex-1 min-w-0">
            <EditorArea activeView={activeView} />
            {bottomPanelVisible && <BottomPanel />}
          </div>
        </div>
      </div>
      <StatusBar 
        bottomPanelVisible={bottomPanelVisible}
        onToggleBottomPanel={() => setBottomPanelVisible(!bottomPanelVisible)}
      />
      {commandPaletteOpen && (
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
        />
      )}
    </div>
  )
}
