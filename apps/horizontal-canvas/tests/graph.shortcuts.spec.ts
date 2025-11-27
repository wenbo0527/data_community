import { describe, it, expect } from 'vitest'
import { bindDefaultShortcuts, configureSelectionRubberbandGate } from '../src/pages/marketing/tasks/horizontal/graph/GraphService'

describe('GraphService shortcuts', () => {
  it('bindDefaultShortcuts binds keys and calls handlers', () => {
    const calls: string[] = []
    const graph: any = {
      canUndo: () => true,
      canRedo: () => true,
      bindKey: (keys: string[], cb: Function) => { cb(); calls.push(keys.join(',')) }
    }
    bindDefaultShortcuts(graph, {
      handleUndo: () => calls.push('undo'),
      handleRedo: () => calls.push('redo'),
      handleZoomIn: () => calls.push('zin'),
      handleZoomOut: () => calls.push('zout')
    })
    expect(calls.includes('undo')).toBe(true)
    expect(calls.includes('redo')).toBe(true)
    expect(calls.includes('zin')).toBe(true)
    expect(calls.includes('zout')).toBe(true)
  })

  it('configureSelectionRubberbandGate toggles on meta/ctrl', () => {
    let enabled = false
    const selectionPlugin: any = {
      enableRubberband: () => { enabled = true },
      disableRubberband: () => { enabled = false }
    }
    const graph: any = { disablePanning: () => {}, enablePanning: () => {} }
    const { handleKeyDown, handleKeyUp } = configureSelectionRubberbandGate(selectionPlugin, graph)
    handleKeyDown({ ctrlKey: true } as any)
    expect(enabled).toBe(true)
    handleKeyUp({ ctrlKey: false } as any)
    expect(enabled).toBe(false)
  })
})

