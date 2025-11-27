import { describe, it, expect } from 'vitest'
import { useCanvasState } from '../src/pages/marketing/tasks/horizontal/state/useCanvasState'
import { ref } from 'vue'

describe('useCanvasState.setupPanelWatchers', () => {
  it('invokes update functions on ref changes', async () => {
    const { setupPanelWatchers } = useCanvasState()
    const showStatisticsPanelRef = ref(false)
    const statisticsPanelWidthRef = ref(420)
    let topCalls = 0
    let dockCalls = 0
    setupPanelWatchers(showStatisticsPanelRef as any, statisticsPanelWidthRef as any, async () => { topCalls++ }, async () => { dockCalls++ })
    showStatisticsPanelRef.value = true
    await new Promise(r => setTimeout(r, 0))
    expect(topCalls).toBeGreaterThan(0)
    statisticsPanelWidthRef.value = 500
    await new Promise(r => setTimeout(r, 0))
    expect(dockCalls).toBeGreaterThan(0)
  })
})
