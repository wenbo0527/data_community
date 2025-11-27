import { describe, it, expect } from 'vitest'
import { useCanvasState } from '../src/pages/marketing/tasks/horizontal/state/useCanvasState'

describe('useCanvasState.computeMinimapPosition', () => {
  it('computes position relative to canvas rect', () => {
    const { computeMinimapPosition } = useCanvasState()
    const anchor = { left: 120, bottom: 240 }
    const canvas = { left: 100, top: 200 }
    const pos = computeMinimapPosition(anchor as any, canvas as any)
    expect(pos.left).toBeGreaterThanOrEqual(16)
    expect(pos.top).toBeGreaterThanOrEqual(16)
    expect(pos.left).toBe(20)
    expect(pos.top).toBe(48)
  })
  it('falls back to default without rects', () => {
    const { computeMinimapPosition } = useCanvasState()
    const pos = computeMinimapPosition(null as any, null as any)
    expect(pos).toEqual({ left: 16, top: 64 })
  })
})

