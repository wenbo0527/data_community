import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NodeConnectionOptimizer } from '../../core/interaction/NodeConnectionOptimizer'
import { UnifiedEventBus } from '../../core/UnifiedEventBus'
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager'
import { ErrorHandler } from '../../core/ErrorHandler'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'
import { nodeTypes } from '../../utils/nodeTypes'

/**
 * 节点连接优化器测试
 */
describe('NodeConnectionOptimizer', () => {
  let connectionOptimizer: NodeConnectionOptimizer
  let eventBus: UnifiedEventBus
  let cacheManager: UnifiedCacheManager
  let errorHandler: ErrorHandler
  let mockGraph: any
  let mockCoordinateManager: any

  beforeEach(() => {
    eventBus = new UnifiedEventBus()
    cacheManager = new UnifiedCacheManager()
    errorHandler = {
      handleError: vi.fn(),
      eventBus: {
        emit: vi.fn()
      }
    } as any
    
    // Mock Graph实例
    mockGraph = {
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn().mockReturnValue([]),
      getNodes: vi.fn().mockReturnValue([]),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // Mock CoordinateSystemManager
    mockCoordinateManager = {
      logicalToDOM: vi.fn().mockImplementation((pos) => pos),
      DOMToLogical: vi.fn().mockImplementation((pos) => pos),
      getNodeDOMPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      calculateCoordinateOffset: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      correctPreviewLinePath: vi.fn().mockImplementation((path) => path),
      getPortPosition: vi.fn().mockReturnValue({ x: 100, y: 50 })
    } as any

    connectionOptimizer = new NodeConnectionOptimizer({
      eventBus,
      cacheManager,
      errorHandler,
      graph: mockGraph,
      coordinateManager: mockCoordinateManager
    })
  })

  describe('初始化', () => {
    it('应该正确初始化NodeConnectionOptimizer', () => {
      expect(connectionOptimizer).toBeDefined()
      expect(connectionOptimizer.isEnabled()).toBe(true)
    })

    it('应该注册必要的事件监听器', () => {
      expect(mockGraph.on).toHaveBeenCalledWith('edge:connected', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('edge:disconnected', expect.any(Function))
    })
  })

  describe('预览线连接', () => {
    it('应该创建预览线连接', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      const sourcePort = 'output'
      const targetPort = 'input'

      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === sourceNodeId || id === targetNodeId ? { id } : null
      })
      
      // 模拟没有现有连接
      mockGraph.getEdges.mockReturnValue([])

      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort
      )

      expect(result).toBe(true)
      expect(mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          source: { cell: sourceNodeId, port: sourcePort },
          target: { cell: targetNodeId, port: targetPort },
          attrs: expect.objectContaining({
            line: expect.objectContaining({
              strokeDasharray: '5 5',
              stroke: '#1890ff'
            })
          })
        })
      )
    })

    it('应该移除预览线连接', () => {
      const previewId = 'preview-edge-1'
      
      connectionOptimizer.removePreviewConnection(previewId)
      
      expect(mockGraph.removeEdge).toHaveBeenCalledWith(previewId)
    })

    it('应该清除所有预览线连接', () => {
      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        if (['node1', 'node2', 'node3'].includes(id)) {
          return { id }
        }
        return null
      })
      
      // 模拟没有现有连接
      mockGraph.getEdges.mockReturnValue([])
      
      // 先添加预览连接到内部集合
      connectionOptimizer.createPreviewConnection('node1', 'node2', 'output', 'input')
      connectionOptimizer.createPreviewConnection('node2', 'node3', 'output', 'input')
      
      // 重置mock计数器
      mockGraph.removeEdge.mockClear()
      
      connectionOptimizer.clearAllPreviewConnections()
      
      expect(mockGraph.removeEdge).toHaveBeenCalledTimes(2)
    })
  })

  describe('连接验证', () => {
    it('应该验证有效的连接', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      const sourcePort = 'output'
      const targetPort = 'input'

      // Mock节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === sourceNodeId || id === targetNodeId ? { id } : null
      })

      const isValid = connectionOptimizer.validateConnection(
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort
      )

      expect(isValid).toBe(true)
    })

    it('应该验证从out端口到in端口的连接', () => {
      // Mock节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === 'node1' || id === 'node2' ? { id } : null
      })
      mockGraph.getEdges.mockReturnValue([])
      
      const isValid = connectionOptimizer.validateConnection('node1', 'node2', 'out', 'in')
      
      expect(isValid).toBe(true)
    })

    it('应该拒绝从in端口到out端口的反向连接', () => {
      const isValid = connectionOptimizer.validateConnection('node1', 'node2', 'input', 'output')
      
      expect(isValid).toBe(false)
    })

    it('应该拒绝从in端口到in端口的连接', () => {
      const isValid = connectionOptimizer.validateConnection('node1', 'node2', 'input', 'input')
      
      expect(isValid).toBe(false)
    })

    it('应该拒绝从out端口到out端口的连接', () => {
      const isValid = connectionOptimizer.validateConnection('node1', 'node2', 'output', 'output')
      
      expect(isValid).toBe(false)
    })

    it('应该拒绝自连接', () => {
      const nodeId = 'node1'
      
      const isValid = connectionOptimizer.validateConnection(
        nodeId,
        nodeId,
        'output',
        'input'
      )

      expect(isValid).toBe(false)
    })

    it('应该拒绝不存在的节点连接', () => {
      mockGraph.getCellById.mockReturnValue(null)
      
      const isValid = connectionOptimizer.validateConnection(
        'nonexistent1',
        'nonexistent2',
        'output',
        'input'
      )

      expect(isValid).toBe(false)
    })

    it('应该检测循环依赖', () => {
      // Mock现有连接形成循环
      mockGraph.getEdges.mockReturnValue([
        { source: { cell: 'node2' }, target: { cell: 'node3' } },
        { source: { cell: 'node3' }, target: { cell: 'node1' } }
      ])

      const hasCycle = connectionOptimizer.detectCyclicDependency('node1', 'node2')
      
      expect(hasCycle).toBe(true)
    })
  })

  describe('连接优化', () => {
    it('应该优化连接路径', () => {
      const sourcePos = { x: 100, y: 100 }
      const targetPos = { x: 300, y: 200 }
      
      const optimizedPath = connectionOptimizer.optimizeConnectionPath(sourcePos, targetPos)
      
      expect(optimizedPath).toBeDefined()
      expect(optimizedPath.length).toBeGreaterThan(0)
    })

    it('应该计算最短连接距离', () => {
      const sourcePos = { x: 0, y: 0 }
      const targetPos = { x: 100, y: 100 }
      
      const distance = connectionOptimizer.calculateConnectionDistance(sourcePos, targetPos)
      
      expect(distance).toBeCloseTo(141.42, 2) // sqrt(100^2 + 100^2)
    })

    it('应该建议最佳连接端口', () => {
      const sourceNode = {
        id: 'node1',
        position: { x: 100, y: 100 },
        ports: ['output1', 'output2']
      }
      const targetNode = {
        id: 'node2',
        position: { x: 300, y: 150 },
        ports: ['input1', 'input2']
      }
      
      const suggestion = connectionOptimizer.suggestBestPorts(sourceNode, targetNode)
      
      expect(suggestion).toEqual({
        sourcePort: expect.any(String),
        targetPort: expect.any(String)
      })
    })
  })

  describe('连接事件处理', () => {
    it('应该处理连接创建事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      // 模拟连接事件
      const connectionData = {
        edge: {
          id: 'edge1',
          source: { cell: 'node1', port: 'output' },
          target: { cell: 'node2', port: 'input' }
        }
      }
      
      // 触发连接事件
      connectionOptimizer.handleConnectionCreated(connectionData)
      
      expect(eventSpy).toHaveBeenCalledWith('connection:created', expect.objectContaining({
        edgeId: 'edge1',
        sourceNodeId: 'node1',
        targetNodeId: 'node2'
      }))
    })

    it('应该处理连接删除事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      const disconnectionData = {
        edge: {
          id: 'edge1',
          source: { cell: 'node1' },
          target: { cell: 'node2' }
        }
      }
      
      connectionOptimizer.handleConnectionRemoved(disconnectionData)
      
      expect(eventSpy).toHaveBeenCalledWith('connection:removed', expect.objectContaining({
        edgeId: 'edge1',
        sourceNodeId: 'node1',
        targetNodeId: 'node2'
      }))
    })
  })

  describe('连接状态管理', () => {
    it('应该跟踪活跃连接', () => {
      const connectionId = 'edge1'
      
      connectionOptimizer.addActiveConnection(connectionId, {
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourcePort: 'output',
        targetPort: 'input',
        edgeId: connectionId
      })
      
      const activeConnections = connectionOptimizer.getActiveConnections()
      expect(activeConnections.has(connectionId)).toBe(true)
      expect(activeConnections.get(connectionId)).toEqual({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourcePort: 'output',
        targetPort: 'input',
        edgeId: connectionId
      })
    })

    it('应该获取节点的所有连接', () => {
      const nodeId = 'node1'
      
      // Mock连接数据
      mockGraph.getEdges.mockReturnValue([
        { id: 'edge1', source: { cell: 'node1' }, target: { cell: 'node2' } },
        { id: 'edge2', source: { cell: 'node2' }, target: { cell: 'node1' } },
        { id: 'edge3', source: { cell: 'node3' }, target: { cell: 'node4' } }
      ])
      
      const connections = connectionOptimizer.getNodeConnections(nodeId)
      
      expect(connections).toHaveLength(2)
      expect(connections.map(c => c.id)).toEqual(['edge1', 'edge2'])
    })
  })

  describe('性能优化', () => {
    it('应该批量处理连接操作', () => {
      const connections = [
        { sourceNodeId: 'node1', targetNodeId: 'node2', sourcePort: 'output', targetPort: 'input', edgeId: 'edge1' },
        { sourceNodeId: 'node2', targetNodeId: 'node3', sourcePort: 'output', targetPort: 'input', edgeId: 'edge2' }
      ]
      
      // 确保连接验证通过
      mockGraph.getCellById.mockReturnValue({ id: 'mock-node' })
      mockGraph.getEdges.mockReturnValue([])
      
      const createPreviewSpy = vi.spyOn(connectionOptimizer, 'createPreviewConnection')
      
      connectionOptimizer.batchCreateConnections(connections)
      
      expect(createPreviewSpy).toHaveBeenCalledTimes(2)
      expect(createPreviewSpy).toHaveBeenCalledWith('node1', 'node2', 'output', 'input')
      expect(createPreviewSpy).toHaveBeenCalledWith('node2', 'node3', 'output', 'input')
    })

    it('应该缓存连接验证结果', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      
      // 第一次验证
      connectionOptimizer.validateConnection(sourceNodeId, targetNodeId, 'output', 'input')
      
      // 第二次验证应该使用缓存
      const cachedResult = connectionOptimizer.validateConnection(sourceNodeId, targetNodeId, 'output', 'input')
      
      expect(cachedResult).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效连接错误', () => {
      const errorSpy = vi.spyOn(errorHandler, 'handleError')
      
      connectionOptimizer.createPreviewConnection('', 'node2', 'output', 'input')
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'INVALID_CONNECTION_PARAMS'
        })
      )
    })

    it('应该处理连接创建失败', () => {
      const errorSpy = vi.spyOn(errorHandler, 'handleError')
      
      // 确保连接验证通过
      mockGraph.getCellById.mockReturnValue({ id: 'mock-node' })
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟addEdge抛出异常
      mockGraph.addEdge.mockImplementation(() => {
        throw new Error('连接创建失败')
      })
      
      const result = connectionOptimizer.createPreviewConnection('node1', 'node2', 'output', 'input')
      
      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CONNECTION_CREATION_FAILED'
        })
      )
    })
  })

  describe('坐标转换功能', () => {
    it('应该在创建预览连接时使用精确的端口坐标', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      const sourcePort = 'output'
      const targetPort = 'input'

      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === sourceNodeId || id === targetNodeId ? { id } : null
      })
      
      // 模拟没有现有连接
      mockGraph.getEdges.mockReturnValue([])

      // 设置坐标管理器返回值
      mockCoordinateManager.getPortPosition.mockReturnValue({ x: 150, y: 75 })

      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort
      )

      expect(result).toBe(true)
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledTimes(2)
      expect(mockCoordinateManager.correctPreviewLinePath).toHaveBeenCalled()
    })

    it('应该在路径优化时计算正确的路径点', () => {
      const sourcePos = { x: 100, y: 100 }
      const targetPos = { x: 300, y: 200 }
      
      const optimizedPath = connectionOptimizer.optimizeConnectionPath(sourcePos, targetPos)
      
      // 验证路径包含起始点和结束点
      expect(optimizedPath).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: sourcePos.x, y: sourcePos.y }),
          expect.objectContaining({ x: targetPos.x, y: targetPos.y })
        ])
      )
      // 验证路径长度大于等于2（至少包含起始点和结束点）
      expect(optimizedPath.length).toBeGreaterThanOrEqual(2)
    })

    it('应该处理坐标转换错误', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      const errorSpy = vi.spyOn(errorHandler, 'handleError')

      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === sourceNodeId || id === targetNodeId ? { id } : null
      })
      
      // 模拟坐标获取失败
      mockCoordinateManager.getPortPosition.mockImplementation(() => {
        throw new Error('坐标获取失败')
      })

      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        'output',
        'input'
      )

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CONNECTION_CREATION_FAILED'
        })
      )
    })

    it('应该在手动布局移动节点后更新预览线endpoint坐标', () => {
      const sourceNodeId = 'audience-split-1'
      const targetNodeId = 'sms-node-1'
      const initialSourcePos = { x: 100, y: 100 }
      const newSourcePos = { x: 200, y: 150 }
      const targetPos = { x: 300, y: 200 }
      
      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        if (id === sourceNodeId) return { id, type: nodeTypes.AUDIENCE_SPLIT }
        if (id === targetNodeId) return { id, type: nodeTypes.SMS }
        return null
      })
      
      mockGraph.getEdges.mockReturnValue([])
      
      // 初始预览线创建
      mockCoordinateManager.getPortPosition.mockReturnValueOnce(initialSourcePos).mockReturnValueOnce(targetPos)
      
      const initialResult = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        'out-yes',
        'in'
      )
      
      expect(initialResult).toBe(true)
      
      // 手动移动节点后更新坐标
      mockCoordinateManager.getPortPosition.mockReturnValueOnce(newSourcePos).mockReturnValueOnce(targetPos)
      
      // 重新创建预览线以更新endpoint坐标
      connectionOptimizer.clearAllPreviewConnections()
      const updatedResult = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        'out-yes',
        'in'
      )
      
      expect(updatedResult).toBe(true)
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledWith(sourceNodeId, 'out-yes')
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledWith(targetNodeId, 'in')
    })

    it('应该在画布移动时保持预览线endpoint坐标一致性', () => {
      const sourceNodeId = 'start-node-1'
      const targetNodeId = 'audience-split-1'
      const canvasOffset = { x: 50, y: 30 }
      const logicalSourcePos = { x: 100, y: 100 }
      const logicalTargetPos = { x: 200, y: 150 }
      const domSourcePos = { x: 150, y: 130 }
      const domTargetPos = { x: 250, y: 180 }
      
      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        if (id === sourceNodeId) return { id, type: nodeTypes.START }
        if (id === targetNodeId) return { id, type: nodeTypes.AUDIENCE_SPLIT }
        return null
      })
      
      mockGraph.getEdges.mockReturnValue([])
      
      // Mock坐标转换
      mockCoordinateManager.calculateCoordinateOffset.mockReturnValue(canvasOffset)
      mockCoordinateManager.logicalToDOM.mockImplementation((pos) => ({
        x: pos.x + canvasOffset.x,
        y: pos.y + canvasOffset.y
      }))
      mockCoordinateManager.getPortPosition.mockReturnValueOnce(domSourcePos).mockReturnValueOnce(domTargetPos)
      
      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        'out',
        'in'
      )
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledWith(sourceNodeId, 'out')
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledWith(targetNodeId, 'in')
      expect(mockCoordinateManager.correctPreviewLinePath).toHaveBeenCalledWith(
        domSourcePos,
        domTargetPos,
        { sourceNodeId, targetNodeId, sourcePort: 'out', targetPort: 'in' }
      )
    })

    it('应该在吸附时精确连接到in端口的坐标', () => {
      const sourceNodeId = 'sms-node-1'
      const targetNodeId = 'end-node-1'
      const snapTargetPos = { x: 300, y: 200 }
      const inPortPos = { x: 285, y: 200 } // in端口位置稍微偏左
      
      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        if (id === sourceNodeId) return { id, type: nodeTypes.SMS }
        if (id === targetNodeId) return { id, type: nodeTypes.END }
        return null
      })
      
      mockGraph.getEdges.mockReturnValue([])
      
      // Mock吸附目标和端口坐标
      mockCoordinateManager.getPortPosition.mockImplementation((nodeId, port) => {
        if (nodeId === sourceNodeId && port === 'out') return { x: 200, y: 150 }
        if (nodeId === targetNodeId && port === 'in') return inPortPos
        return { x: 0, y: 0 }
      })
      
      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        'out',
        'in'
      )
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledWith(targetNodeId, 'in')
      expect(mockCoordinateManager.correctPreviewLinePath).toHaveBeenCalledWith(
        { x: 200, y: 150 },
        inPortPos,
        { sourceNodeId, targetNodeId, sourcePort: 'out', targetPort: 'in' }
      )
    })

    it('应该验证预览线坐标一致性', () => {
      const sourceNodeId = 'node1'
      const targetNodeId = 'node2'
      const sourcePort = 'out'
      const targetPort = 'in'
      
      // 模拟节点存在
      mockGraph.getCellById.mockImplementation((id: string) => {
        return id === sourceNodeId || id === targetNodeId ? { id } : null
      })
      
      // 模拟没有现有连接
      mockGraph.getEdges.mockReturnValue([])
      
      const sourcePos = { x: 100, y: 50 }
      const targetPos = { x: 200, y: 50 }
      const optimizedPath = {
        vertices: [sourcePos, targetPos]
      }
      
      mockCoordinateManager.getPortPosition.mockReturnValueOnce(sourcePos).mockReturnValueOnce(targetPos)
      mockCoordinateManager.correctPreviewLinePath.mockReturnValue(optimizedPath)
      
      const result = connectionOptimizer.createPreviewConnection(
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort
      )
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.getPortPosition).toHaveBeenCalledTimes(2)
      expect(mockCoordinateManager.correctPreviewLinePath).toHaveBeenCalledWith(
        sourcePos,
        targetPos,
        { sourceNodeId, targetNodeId, sourcePort, targetPort }
      )
    })
  })

  describe('营销画布节点类型连接测试', () => {
    describe('开始节点连接限制', () => {
      it('应该允许开始节点作为源节点连接', () => {
        const startNodeId = 'start-node-1'
        const targetNodeId = 'audience-split-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === startNodeId) return { id, type: nodeTypes.START }
          if (id === targetNodeId) return { id, type: nodeTypes.AUDIENCE_SPLIT }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        const isValid = connectionOptimizer.validateConnection(
          startNodeId,
          targetNodeId,
          'out',
          'in'
        )
        
        expect(isValid).toBe(true)
      })
      
      it('应该拒绝开始节点作为目标节点的连接', () => {
        const sourceNodeId = 'sms-node-1'
        const startNodeId = 'start-node-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === sourceNodeId) return { id, type: nodeTypes.SMS }
          if (id === startNodeId) return { id, type: nodeTypes.START }
          return null
        })
        
        const isValid = connectionOptimizer.validateConnection(
          sourceNodeId,
          startNodeId,
          'out',
          'in'
        )
        
        expect(isValid).toBe(false)
      })
    })
    
    describe('分支节点多输出端口连接', () => {
      it('应该支持audience-split节点的多输出端口连接', () => {
        const branchNodeId = 'audience-split-1'
        const targetNode1Id = 'sms-node-1'
        const targetNode2Id = 'ai-call-node-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === branchNodeId) return { id, type: nodeTypes.AUDIENCE_SPLIT }
          if (id === targetNode1Id) return { id, type: nodeTypes.SMS }
          if (id === targetNode2Id) return { id, type: nodeTypes.AI_CALL }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        // 测试第一个输出连接
        const isValid1 = connectionOptimizer.validateConnection(
          branchNodeId,
          targetNode1Id,
          'out-yes',
          'in'
        )
        
        // 测试第二个输出连接
        const isValid2 = connectionOptimizer.validateConnection(
          branchNodeId,
          targetNode2Id,
          'out-no',
          'in'
        )
        
        expect(isValid1).toBe(true)
        expect(isValid2).toBe(true)
      })
      
      it('应该支持event-split节点的多输出端口连接', () => {
        const eventSplitId = 'event-split-1'
        const targetNode1Id = 'manual-call-1'
        const targetNode2Id = 'wait-node-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === eventSplitId) return { id, type: nodeTypes.EVENT_SPLIT }
          if (id === targetNode1Id) return { id, type: nodeTypes.MANUAL_CALL }
          if (id === targetNode2Id) return { id, type: nodeTypes.WAIT }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        const isValid1 = connectionOptimizer.validateConnection(
          eventSplitId,
          targetNode1Id,
          'out-triggered',
          'in'
        )
        
        const isValid2 = connectionOptimizer.validateConnection(
          eventSplitId,
          targetNode2Id,
          'out-not-triggered',
          'in'
        )
        
        expect(isValid1).toBe(true)
        expect(isValid2).toBe(true)
      })
      
      it('应该支持ab-test节点的多输出端口连接', () => {
        const abTestId = 'ab-test-1'
        const targetNodeAId = 'sms-node-a'
        const targetNodeBId = 'sms-node-b'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === abTestId) return { id, type: nodeTypes.AB_TEST }
          if (id === targetNodeAId) return { id, type: nodeTypes.SMS }
          if (id === targetNodeBId) return { id, type: nodeTypes.SMS }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        const isValidA = connectionOptimizer.validateConnection(
          abTestId,
          targetNodeAId,
          'out-a',
          'in'
        )
        
        const isValidB = connectionOptimizer.validateConnection(
          abTestId,
          targetNodeBId,
          'out-b',
          'in'
        )
        
        expect(isValidA).toBe(true)
        expect(isValidB).toBe(true)
      })
    })
    
    describe('结束节点连接限制', () => {
      it('应该允许结束节点作为目标节点连接', () => {
        const sourceNodeId = 'sms-node-1'
        const endNodeId = 'end-node-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === sourceNodeId) return { id, type: nodeTypes.SMS }
          if (id === endNodeId) return { id, type: nodeTypes.END }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        const isValid = connectionOptimizer.validateConnection(
          sourceNodeId,
          endNodeId,
          'out',
          'in'
        )
        
        expect(isValid).toBe(true)
      })
      
      it('应该拒绝结束节点作为源节点的连接', () => {
        const endNodeId = 'end-node-1'
        const targetNodeId = 'sms-node-1'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === endNodeId) return { id, type: nodeTypes.END }
          if (id === targetNodeId) return { id, type: nodeTypes.SMS }
          return null
        })
        
        const isValid = connectionOptimizer.validateConnection(
          endNodeId,
          targetNodeId,
          'out',
          'in'
        )
        
        expect(isValid).toBe(false)
      })
    })
    
    describe('营销画布节点类型预览线连接', () => {
      it('应该为营销画布节点创建正确的预览线连接', () => {
        const sourceNodeId = 'audience-split-1'
        const targetNodeId = 'sms-node-1'
        const sourcePort = 'out-yes'
        const targetPort = 'in'
        
        // 模拟节点存在
        mockGraph.getCellById.mockImplementation((id: string) => {
          if (id === sourceNodeId) return { id, type: nodeTypes.AUDIENCE_SPLIT }
          if (id === targetNodeId) return { id, type: nodeTypes.SMS }
          return null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        const result = connectionOptimizer.createPreviewConnection(
          sourceNodeId,
          targetNodeId,
          sourcePort,
          targetPort
        )
        
        expect(result).toBe(true)
        expect(mockGraph.addEdge).toHaveBeenCalledWith(
          expect.objectContaining({
            source: { cell: sourceNodeId, port: sourcePort },
            target: { cell: targetNodeId, port: targetPort },
            attrs: expect.objectContaining({
              line: expect.objectContaining({
                strokeDasharray: '5 5',
                stroke: '#1890ff'
              })
            })
          })
        )
      })
      
      it('应该验证营销画布节点类型的连接路径', () => {
        const startNodeId = 'start-1'
        const splitNodeId = 'audience-split-1'
        const smsNodeId = 'sms-1'
        const endNodeId = 'end-1'
        
        // 模拟完整的营销画布流程连接
        mockGraph.getCellById.mockImplementation((id: string) => {
          const nodeTypeMap: Record<string, string> = {
            [startNodeId]: nodeTypes.START,
            [splitNodeId]: nodeTypes.AUDIENCE_SPLIT,
            [smsNodeId]: nodeTypes.SMS,
            [endNodeId]: nodeTypes.END
          }
          return nodeTypeMap[id] ? { id, type: nodeTypeMap[id] } : null
        })
        
        mockGraph.getEdges.mockReturnValue([])
        
        // 验证完整流程的连接有效性
        const connection1 = connectionOptimizer.validateConnection(startNodeId, splitNodeId, 'out', 'in')
        const connection2 = connectionOptimizer.validateConnection(splitNodeId, smsNodeId, 'out-yes', 'in')
        const connection3 = connectionOptimizer.validateConnection(smsNodeId, endNodeId, 'out', 'in')
        
        expect(connection1).toBe(true)
        expect(connection2).toBe(true)
        expect(connection3).toBe(true)
      })
    })
  })

  describe('清理', () => {
    it('应该正确清理资源', () => {
      const graphOffSpy = vi.spyOn(mockGraph, 'off')
      
      connectionOptimizer.destroy()
      
      expect(graphOffSpy).toHaveBeenCalledWith('edge:connected')
      expect(graphOffSpy).toHaveBeenCalledWith('edge:disconnected')
    })
  })
})