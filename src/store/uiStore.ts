import { create } from 'zustand'

export type ActiveView = 'curriculum' | 'search' | 'timer' | 'stats' | 'settings'

export type TabKind = 'item' | 'stats' | 'settings' | 'timer' | 'search' | 'welcome'

export interface EditorTab {
  id: string
  kind: TabKind
  title: string
  itemId?: string
}

interface UIState {
  activeView: ActiveView
  sidebarVisible: boolean
  sidebarWidth: number
  bottomPanelVisible: boolean
  bottomPanelHeight: number
  bottomPanelTab: 'timer' | 'hint' | 'bug'
  commandPaletteOpen: boolean
  quickOpenOpen: boolean
  tabs: EditorTab[]
  activeTabId: string | null
  expandedWeeks: number[]

  setActiveView: (view: ActiveView) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  toggleBottomPanel: () => void
  setBottomPanelHeight: (height: number) => void
  setBottomPanelTab: (tab: 'timer' | 'hint' | 'bug') => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openQuickOpen: () => void
  closeQuickOpen: () => void
  openItem: (itemId: string, title: string) => void
  openTab: (tab: EditorTab) => void
  closeTab: (tabId: string) => void
  reorderTabs: (from: number, to: number) => void
  setActiveTab: (tabId: string) => void
  toggleWeek: (week: number) => void
}

const WELCOME_TAB: EditorTab = { id: 'welcome', kind: 'welcome', title: 'Welcome' }

export const useUIStore = create<UIState>((set, get) => ({
  activeView: 'curriculum',
  sidebarVisible: true,
  sidebarWidth: 300,
  bottomPanelVisible: false,
  bottomPanelHeight: 200,
  bottomPanelTab: 'timer',
  commandPaletteOpen: false,
  quickOpenOpen: false,
  tabs: [WELCOME_TAB],
  activeTabId: 'welcome',
  expandedWeeks: [1],

  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(600, width)) }),
  toggleBottomPanel: () => set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
  setBottomPanelHeight: (height) =>
    set({ bottomPanelHeight: Math.max(120, Math.min(600, height)) }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openQuickOpen: () => set({ quickOpenOpen: true }),
  closeQuickOpen: () => set({ quickOpenOpen: false }),

  openItem: (itemId, title) => {
    const existing = get().tabs.find((t) => t.id === itemId)
    if (existing) {
      set({ activeTabId: itemId })
      return
    }
    const tab: EditorTab = { id: itemId, kind: 'item', title, itemId }
    set({ tabs: [...get().tabs, tab], activeTabId: itemId })
  },

  openTab: (tab) => {
    const existing = get().tabs.find((t) => t.id === tab.id)
    if (existing) {
      set({ activeTabId: tab.id })
      return
    }
    set({ tabs: [...get().tabs, tab], activeTabId: tab.id })
  },

  closeTab: (tabId) => {
    const tabs = get().tabs
    const index = tabs.findIndex((t) => t.id === tabId)
    const next = tabs.filter((t) => t.id !== tabId)
    let activeTabId = get().activeTabId
    if (activeTabId === tabId) {
      activeTabId = next.length === 0 ? null : next[Math.max(0, index - 1)].id
    }
    set({ tabs: next, activeTabId })
  },

  reorderTabs: (from, to) => {
    const tabs = [...get().tabs]
    if (from < 0 || from >= tabs.length || to < 0 || to >= tabs.length) return
    const [moved] = tabs.splice(from, 1)
    tabs.splice(to, 0, moved)
    set({ tabs })
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  toggleWeek: (week) => {
    const expanded = get().expandedWeeks
    if (expanded.includes(week)) {
      set({ expandedWeeks: expanded.filter((w) => w !== week) })
    } else {
      set({ expandedWeeks: [...expanded, week] })
    }
  },
}))
