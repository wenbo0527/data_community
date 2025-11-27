import { describe, it, expect } from 'vitest'
import { useCanvasState } from '../src/pages/marketing/tasks/horizontal/state/useCanvasState'

describe('useCanvasState.updateScaleDisplay', () => {
  it('formats percentage text from scale', () => {
    const { updateScaleDisplay } = useCanvasState()
    const refObj = { value: '' }
    updateScaleDisplay(refObj as any, 1)
    expect(refObj.value).toBe('100%')
    updateScaleDisplay(refObj as any, 0.75)
    expect(refObj.value).toBe('75%')
  })
})

