import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GraphOperationUtils } from '../pages/marketing/tasks/utils/canvas/GraphOperationUtils.js'
import { createMockGraph, createMockNode } from './utils/mockFactory.js'

describe('连接线端口配置和重复创建测试', () => {
  let graphUtils
  let mockGraph
  let mockEmit

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 使用标准化Mock工厂
    mockGraph = createMockGraph()
    mockEmit = vi.fn()
    
    // 创建GraphOperationUtils实例
    graphUtils = new GraphOperationUtils({ value: mockGraph }, mockEmit)
  })

  describe('端口配置测试', () => {
    it('应该正确配置基本连接端口', async () => {
      const sourceNode = createMockNode('source-node', 'test')
      const targetNode = createMockNode('target-node', 'test')
      
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })
      
      const connectionData = {
        source: 'source-node',
        target: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      expect(result).toBeDefined()
      expect(mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { cell: 'target-node', port: 'in' }
        })
      )
    })

    it('应该正确配置分支节点端口', async () => {
      const branchNode = createMockNode('branch-node', 'branch', {
        data: { 
          type: 'branch',
          branches: ['branch-1', 'branch-2']
        }
      })
      const targetNode = createMockNode('target-node', 'test')
      
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'branch-node') return branchNode
        if (id === 'target-node') return targetNode
        return null
      })
      
      const connectionData = {
        source: 'branch-node',
        target: 'target-node',
        sourcePort: 'out',
        targetPort: 'in',
        data: { branchId: 'branch-1' }
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      expect(result).toBeDefined()
      expect(mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { cell: 'branch-node', port: 'out' }
        })
      )
    })

    it('应该在未指定端口时使用默认端口', async () => {
      const sourceNode = createMockNode('source-node', 'test')
      const targetNode = createMockNode('target-node', 'test')
      
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })
      
      const connectionData = {
        source: 'source-node',
        target: 'target-node'
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      expect(result).toBeDefined()
      expect(mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { cell: 'source-node', port: 'out' },
          target: { cell: 'target-node', port: 'in' }
        })
      )
    })
  })

  describe('重复创建防护', () => {
    it('应该防止重复创建相同的连接', async () => {
      const sourceNode = createMockNode('source-node', 'test')
      const targetNode = createMockNode('target-node', 'test')
      
      // 模拟已存在的连接
      const existingEdge = {
        id: 'existing-edge',
        getSourceCellId: vi.fn(() => 'source-node'),
        getTargetCellId: vi.fn(() => 'target-node'),
        getSourcePortId: vi.fn(() => 'out'),
        getTargetPortId: vi.fn(() => 'in'),
        getData: vi.fn(() => ({ isPreview: false }))
      }
      
      mockGraph.getEdges.mockReturnValue([existingEdge])
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })
      
      const connectionData = {
        source: 'source-node',
        target: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      // 应该返回已存在的连接，而不是创建新的
      expect(result).toBeDefined()
      expect(result.id).toBe('existing-edge')
      expect(mockGraph.addEdge).not.toHaveBeenCalled()
    })

    it('应该允许创建不同端口的连接', async () => {
      const branchNode = createMockNode('branch-node', 'branch', {
        data: { 
          type: 'branch',
          branches: ['branch-1', 'branch-2']
        }
      })
      const targetNode = createMockNode('target-node', 'test')
      
      // 模拟已存在branch-1的连接
      const existingEdge = {
        id: 'existing-edge',
        getSourceCellId: vi.fn(() => 'branch-node'),
        getTargetCellId: vi.fn(() => 'target-node'),
        getSourcePortId: vi.fn(() => 'out'),
        getTargetPortId: vi.fn(() => 'in'),
        getData: vi.fn(() => ({ branchId: 'branch-1', isPreview: false }))
      }
      
      mockGraph.getEdges.mockReturnValue([existingEdge])
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'branch-node') return branchNode
        if (id === 'target-node') return targetNode
        return null
      })
      
      // 尝试创建branch-2的连接
      const connectionData = {
        source: 'branch-node',
        target: 'target-node',
        sourcePort: 'out',
        targetPort: 'in',
        data: { branchId: 'branch-2' }
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      expect(result).toBeDefined()
      expect(mockGraph.addEdge).toHaveBeenCalled()
    })
  })

  describe('连接验证和错误处理', () => {
    it('应该验证源节点存在性', async () => {
      mockGraph.getCellById.mockReturnValue(null)
      
      const connectionData = {
        source: 'non-existent-source',
        target: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      // ErrorHandler会捕获错误并返回fallbackValue (null)
      expect(result).toBeNull()
    })

    it('应该验证目标节点存在性', async () => {
      const sourceNode = createMockNode('source-node', 'test')
      
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'source-node') return sourceNode
        return null
      })
      
      const connectionData = {
        source: 'source-node',
        target: 'non-existent-target',
        sourcePort: 'out',
        targetPort: 'in'
      }
      
      const connectionsList = []
      const result = await graphUtils.addConnection(connectionData, connectionsList)
      
      // ErrorHandler会捕获错误并返回fallbackValue (null)
      expect(result).toBeNull()
    })
  })
})