import { describe, it, expect } from 'vitest'
import { useCanvasState } from '../src/pages/marketing/tasks/horizontal/state/useCanvasState'

describe('useCanvasState.setupPanelResizeListeners', () => {
  it('attaches resize listeners and updates refs', () => {
    const elToolbar: any = { getBoundingClientRect: () => ({ bottom: 100 }) }
    const elContent: any = { getBoundingClientRect: () => ({ left: 50, width: 200 }) }
    const { setupPanelResizeListeners, updateStatisticsPanelTop, updateDebugDockBounds } = useCanvasState()
    const showStatisticsPanelRef = { value: false }
    const debugDockBoundsRef = { value: { left: 0, width: 0 } }
    const statisticsPanelTopRef = { value: 0 }
    const statisticsPanelWidthRef = { value: 420 }
    // initial update
    updateStatisticsPanelTop(elToolbar, statisticsPanelTopRef)
    updateDebugDockBounds(elContent, showStatisticsPanelRef, true, true, statisticsPanelWidthRef, debugDockBoundsRef)
    const handlers = setupPanelResizeListeners(elToolbar, elContent, showStatisticsPanelRef, true, true, statisticsPanelWidthRef, debugDockBoundsRef, statisticsPanelTopRef)
    window.dispatchEvent(new Event('resize'))
    expect(statisticsPanelTopRef.value).toBeGreaterThanOrEqual(0)
    expect(debugDockBoundsRef.value.width).toBeGreaterThan(0)
    handlers.detach()
  })
})
