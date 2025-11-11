import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import UnifiedEdgeManager from '../pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

describe('UnifiedEdgeManager 简化测试', () => {
  let mockGraph
  let unifiedEdgeManager

  beforeEach(() => {
    // 创建基本的模拟图实例
    mockGraph = {
      addEdge: vi.fn(() => ({
        id: 'edge_123',
        getSource: vi.fn(() => ({ cell: 'node1', port: 'out' })),
        getTarget: vi.fn(() => ({ cell: 'node2', port: 'in' })),
        remove: vi.fn(),
        isEdge: vi.fn(() => true),
        isNode: vi.fn(() => false)
      })),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => []),
      getNode: vi.fn(() => ({
        id: 'node1',
        getPosition: vi.fn(() => ({ x: 100, y: 100 })),
        getSize: vi.fn(() => ({ width: 120, height: 80 })),
        getData: vi.fn(() => ({ type: 'test-node' })),
        getPorts: vi.fn(() => [{ id: 'out', group: 'out' }])
      })),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      toJSON: vi.fn(() => ({ cells: [] })),
      fromJSON: vi.fn(),
      clearCells: vi.fn(),
      addNode: vi.fn(),
      removeNode: vi.fn(),
      
      options: {
        connecting: {
          snap: true,
          allowPort: true
        },
        interacting: {},
        highlighting: {}
      },
      
      container: {
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
        style: {}
      }
    }

    // 创建UnifiedEdgeManager实例
    unifiedEdgeManager = new UnifiedEdgeManager(mockGraph)
  })

  afterEach(() => {
    if (unifiedEdgeManager) {
      unifiedEdgeManager.destroy()
    }
  })

  it('应该能够创建UnifiedEdgeManager实例', () => {
    expect(unifiedEdgeManager).toBeDefined()
    expect(typeof unifiedEdgeManager.initialize).toBe('function')
  })

  it('应该能够初始化', async () => {
    await unifiedEdgeManager.initialize()
    expect(unifiedEdgeManager.isInitialized.value).toBe(true)
  })
})