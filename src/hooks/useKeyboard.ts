import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

export function useKeyboard(): void {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)
  const openQuickOpen = useUIStore((s) => s.openQuickOpen)
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const closeQuickOpen = useUIStore((s) => s.closeQuickOpen)
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette)
  const quickOpenOpen = useUIStore((s) => s.quickOpenOpen)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey) return

      if (e.key.toLowerCase() === 'p' && e.shiftKey) {
        e.preventDefault()
        openCommandPalette()
        return
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        openQuickOpen()
        return
      }
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
        return
      }
      if (e.key === '`') {
        e.preventDefault()
        toggleBottomPanel()
        return
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (quickOpenOpen) closeQuickOpen()
        if (commandPaletteOpen) closeCommandPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    toggleSidebar,
    toggleBottomPanel,
    openQuickOpen,
    openCommandPalette,
    closeQuickOpen,
    closeCommandPalette,
    quickOpenOpen,
    commandPaletteOpen,
  ])
}
