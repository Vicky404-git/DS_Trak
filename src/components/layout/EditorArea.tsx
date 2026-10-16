import { useUIStore } from '../../store/uiStore'
import EditorTabs from './EditorTabs'
import ItemTab from '../editor/ItemTab'
import StatsView from '../stats/StatsView'
import SettingsView from '../settings/SettingsView'
import TimerView from '../timer/TimerView'
import SearchView from '../editor/SearchView'
import WelcomeScreen from './WelcomeScreen'

export default function EditorArea() {
  const tabs = useUIStore((s) => s.tabs)
  const activeTabId = useUIStore((s) => s.activeTabId)
  const active = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--vscode-editor-bg)]">
      <EditorTabs />
      <div className="min-h-0 flex-1 overflow-auto">
        {!active && <WelcomeScreen />}
        {active?.kind === 'welcome' && <WelcomeScreen />}
        {active?.kind === 'item' && active.itemId && <ItemTab itemId={active.itemId} />}
        {active?.kind === 'stats' && <StatsView />}
        {active?.kind === 'settings' && <SettingsView />}
        {active?.kind === 'timer' && <TimerView />}
        {active?.kind === 'search' && <SearchView />}
      </div>
    </div>
  )
}
