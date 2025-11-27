import { describe, it, expect } from 'vitest'
import { useCanvasState } from '../src/pages/marketing/tasks/horizontal/state/useCanvasState'

describe('useCanvasState.toggleMinimapUI', () => {
  it('toggles showMinimap and sets position', () => {
    const { toggleMinimapUI } = useCanvasState()
    const showMinimapRef = { value: false }
    const posRef = { value: { left: 0, top: 0 } }
    const anchor = { left: 120, bottom: 240 }
    const canvas = { left: 100, top: 200 }
    const pos = toggleMinimapUI(showMinimapRef as any, anchor as any, canvas as any, posRef as any)
    expect(showMinimapRef.value).toBe(true)
    expect(pos.left).toBe(20)
    expect(pos.top).toBe(48)
    expect(posRef.value.left).toBe(20)
    expect(posRef.value.top).toBe(48)
  })
})

