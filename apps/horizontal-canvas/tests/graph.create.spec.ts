import { describe, it, expect } from 'vitest'
import { createGraph } from '../src/pages/marketing/tasks/horizontal/graph/GraphService'

describe('GraphService.createGraph', () => {
  it('creates a graph instance with basic APIs', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const g = createGraph(container, { grid: false, snapline: { enabled: false } })
    expect(g).toBeTruthy()
    expect(typeof g.zoom).toBe('function')
    expect(Array.isArray(g.getNodes())).toBe(true)
  })
})
