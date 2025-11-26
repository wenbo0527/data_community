import { describe, it, expect } from 'vitest'
import { cleanupEdgeVertices } from '../src/pages/marketing/tasks/horizontal/layout/LayoutService'

describe('LayoutService', () => {
  it('cleanupEdgeVertices clears vertices on all edges', () => {
    const calls: any[] = []
    const graph: any = {
      getEdges: () => [
        { id: 'e1', setVertices: (v: any) => calls.push({ id: 'e1', v }) },
        { id: 'e2', setVertices: (v: any) => calls.push({ id: 'e2', v }) }
      ]
    }
    cleanupEdgeVertices(graph)
    expect(calls.length).toBe(2)
    expect(calls[0].v).toEqual([])
    expect(calls[1].v).toEqual([])
  })
})

