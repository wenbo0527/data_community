import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Debug UnifiedEdgeManager Import', () => {
  it('should import UnifiedEdgeManager successfully', async () => {
    const module = await import('../pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })

  it('should create UnifiedEdgeManager instance', async () => {
    const UnifiedEdgeManager = (await import('../pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js')).default
    
    const mockGraph = {
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => []),
      getNode: vi.fn(),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      toJSON: vi.fn(() => ({})),
      fromJSON: vi.fn(),
      clearCells: vi.fn(),
      addNode: vi.fn(),
      removeNode: vi.fn(),
      options: {
        connecting: {
          snap: { radius: 20 },
          allowBlank: false,
          allowLoop: false,
          allowNode: false,
          allowEdge: false,
          allowPort: true,
          highlight: true
        },
        interacting: {
          edgeLabelMovable: false,
          arrowheadMovable: false,
          vertexMovable: false,
          vertexAddable: false,
          vertexDeletable: false
        },
        highlighting: {
          magnetAvailable: {
            name: 'stroke',
            args: { attrs: { fill: '#fff', stroke: '#A4DEB1', 'stroke-width': 2 } }
          },
          magnetAdsorbed: {
            name: 'stroke', 
            args: { attrs: { fill: '#fff', stroke: '#31d0c6', 'stroke-width': 2 } }
          }
        }
      },
      container: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
        style: {}
      }
    }

    const manager = new UnifiedEdgeManager(mockGraph)
    expect(manager).toBeDefined()
    expect(typeof manager.initialize).toBe('function')
  })
})