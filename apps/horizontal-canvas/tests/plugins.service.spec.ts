import { describe, it, expect } from 'vitest'
import { useHistory, useKeyboard, useSelection } from '../src/pages/marketing/tasks/horizontal/graph/GraphService'

function makeMockGraph() {
  const used: any[] = []
  const disposed: any[] = []
  return {
    used,
    disposed,
    use: (p: any) => used.push(p),
    disposePlugin: (nameOrPlugin: any) => disposed.push(nameOrPlugin)
  }
}

describe('GraphService plugins', () => {
  it('useHistory registers plugin', () => {
    const g = makeMockGraph()
    const p = useHistory(g as any, { enabled: true })
    expect(p).toBeTruthy()
    expect(g.used.length).toBe(1)
  })
  it('useKeyboard registers plugin', () => {
    const g = makeMockGraph()
    const p = useKeyboard(g as any, { enabled: true })
    expect(p).toBeTruthy()
    expect(g.used.length).toBe(1)
  })
  it('useSelection registers plugin', () => {
    const g = makeMockGraph()
    const p = useSelection(g as any, { enabled: true })
    expect(p).toBeTruthy()
    expect(g.used.length).toBe(1)
  })
})

