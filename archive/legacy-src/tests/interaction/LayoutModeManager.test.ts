import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LayoutModeManager } from '../../core/interaction/LayoutModeManager'
import { UnifiedEventBus } from '../../core/UnifiedEventBus'
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager'
import { ErrorHandler } from '../../core/ErrorHandler'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'

describe('LayoutModeManager', () => {
  let layoutManager: LayoutModeManager
  let mockGraph: any
  let mockEventBus: UnifiedEventBus
  let mockCacheManager: UnifiedCacheManager
  let mockErrorHandler: ErrorHandler
  let mockCoordinateManager: any

  beforeEach(() => {
    // Mock graph
    mockGraph = {
      getNodes: vi.fn(),
      getEdges: vi.fn(),
      setPosition: vi.fn(),
      getBBox: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      layout: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn()
    }

    // Mock dependencies
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      removeAllListeners: vi.fn()
    } as any

    mockCacheManager = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn()
    } as any

    mockErrorHandler = {
      handleError: vi.fn(),
      getErrorStats: vi.fn(),
      clearErrors: vi.fn()
    } as any

    // Mock CoordinateSystemManager
    mockCoordinateManager = {
      logicalToDOM: vi.fn().mockImplementation((pos) => pos),
      DOMToLogical: vi.fn().mockImplementation((pos) => pos),
      getNodeDOMPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      calculateCoordinateOffset: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      validateCoordinateTransform: vi.fn().mockReturnValue(true),
      correctLayoutPosition: vi.fn().mockImplementation((pos) => pos),
      correctDragHintPosition: vi.fn().mockImplementation((pos) => pos)
    } as any

    layoutManager = new LayoutModeManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      mockCoordinateManager
    )
  })

  afterEach(() => {
    if (layoutManager) {
      layoutManager.destroy()
    }
  })

  describe('初始化', () => {
    it('应该正确初始化LayoutModeManager', () => {
      expect(layoutManager).toBeDefined()
      expect(layoutManager.getCurrentMode()).toBe('manual') // 默认手动布局模式
    })

    it('应该注册必要的事件监听器', () => {
      expect(mockGraph.on).toHaveBeenCalledWith('node:added', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:removed', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('edge:added', expect.any(Function))
    })
  })

  describe('布局模式切换', () => {
    it('应该切换到统一布局模式', () => {
      const result = layoutManager.switchToUnifiedMode()
      
      expect(result).toBe(true)
      expect(layoutManager.getCurrentMode()).toBe('unified')
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:mode:changed', {
        from: 'manual',
        to: 'unified'
      })
    })

    it('应该切换到手动布局模式', () => {
      layoutManager.switchToUnifiedMode()
      const result = layoutManager.switchToManualMode()
      
      expect(result).toBe(true)
      expect(layoutManager.getCurrentMode()).toBe('manual')
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:mode:changed', {
        from: 'unified',
        to: 'manual'
      })
    })

    it('应该在相同模式下不进行切换', () => {
      const result = layoutManager.switchToManualMode()
      
      expect(result).toBe(false)
      expect(mockEventBus.emit).not.toHaveBeenCalledWith('layout:mode:changed', expect.any(Object))
    })
  })

  describe('统一布局功能', () => {
    beforeEach(() => {
      layoutManager.switchToUnifiedMode()
    })

    it('应该应用统一布局算法', () => {
      const nodes = [
        { id: 'node1', type: 'INPUT' },
        { id: 'node2', type: 'PROCESSING' },
        { id: 'node3', type: 'OUTPUT' }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      const result = layoutManager.applyUnifiedLayout()
      
      expect(result).toBe(true)
      expect(mockGraph.setPosition).toHaveBeenCalledTimes(3)
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:mode:changed', {
        from: 'manual',
        to: 'unified'
      })
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:unified:applied', {
        nodeCount: 3,
        layoutType: 'hierarchical',
        appliedCount: 3,
        coordinatesCorrected: true
      })
    })

    it('应该根据节点类型进行分层布局', () => {
      const nodes = [
        { id: 'input1', type: 'INPUT' },
        { id: 'input2', type: 'INPUT' },
        { id: 'process1', type: 'PROCESSING' },
        { id: 'output1', type: 'OUTPUT' }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟坐标管理器方法
      mockCoordinateManager.validateCoordinateTransform.mockReturnValue({
        isValid: true,
        position: { x: 100, y: 100 }
      })
      mockCoordinateManager.correctDragHintPosition.mockImplementation((nodeId, position) => {
        return { x: position.x, y: position.y }
      })
      
      layoutManager.applyUnifiedLayout()
      
      // 验证INPUT节点在左侧
      expect(mockGraph.setPosition).toHaveBeenCalledWith('input1', expect.objectContaining({ x: expect.any(Number) }))
      expect(mockGraph.setPosition).toHaveBeenCalledWith('input2', expect.objectContaining({ x: expect.any(Number) }))
      
      // 验证PROCESSING节点在中间
      expect(mockGraph.setPosition).toHaveBeenCalledWith('process1', expect.objectContaining({ x: expect.any(Number) }))
      
      // 验证OUTPUT节点在右侧
      expect(mockGraph.setPosition).toHaveBeenCalledWith('output1', expect.objectContaining({ x: expect.any(Number) }))
    })

    it('应该自动调整节点间距', () => {
      const nodes = [
        { id: 'node1', type: 'INPUT' },
        { id: 'node2', type: 'PROCESSING' }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 60 })
      
      // 模拟坐标管理器方法
      mockCoordinateManager.validateCoordinateTransform.mockReturnValue({
        isValid: true,
        position: { x: 100, y: 100 }
      })
      mockCoordinateManager.correctDragHintPosition.mockImplementation((nodeId, position) => {
        // 为不同节点返回不同的x坐标，确保有足够的间距
        if (nodeId === 'node1') {
          return { x: 100, y: 100 }
        } else {
          return { x: 300, y: 100 } // 确保间距大于150
        }
      })
      
      layoutManager.applyUnifiedLayout()
      
      // 验证节点间距符合预期（至少150像素间距）
      const calls = mockGraph.setPosition.mock.calls
      expect(calls.length).toBe(2)
      
      const pos1 = calls[0][1]
      const pos2 = calls[1][1]
      const distance = Math.abs(pos2.x - pos1.x)
      expect(distance).toBeGreaterThanOrEqual(150)
    })
  })

  describe('手动布局功能', () => {
    it('应该允许手动拖拽节点', () => {
      expect(layoutManager.getCurrentMode()).toBe('manual')
      
      const result = layoutManager.isManualDragEnabled()
      
      expect(result).toBe(true)
    })

    it('应该在统一布局模式下禁用手动拖拽', () => {
      layoutManager.switchToUnifiedMode()
      
      const result = layoutManager.isManualDragEnabled()
      
      expect(result).toBe(false)
    })

    it('应该保存手动布局位置', () => {
      const nodeId = 'node1'
      const position = { x: 200, y: 150 }
      
      layoutManager.saveManualPosition(nodeId, position)
      
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `manual_position_${nodeId}`,
        position,
        expect.any(Object)
      )
    })

    it('应该恢复手动布局位置', () => {
      const nodeId = 'node1'
      const savedPosition = { x: 200, y: 150 }
      
      mockCacheManager.get.mockReturnValue(savedPosition)
      
      const result = layoutManager.restoreManualPosition(nodeId)
      
      expect(result).toEqual(savedPosition)
      expect(mockCacheManager.get).toHaveBeenCalledWith(`manual_position_${nodeId}`)
    })
  })

  describe('布局状态管理', () => {
    it('应该获取当前布局模式', () => {
      expect(layoutManager.getCurrentMode()).toBe('manual')
      
      layoutManager.switchToUnifiedMode()
      expect(layoutManager.getCurrentMode()).toBe('unified')
    })

    it('应该检查是否为统一布局模式', () => {
      expect(layoutManager.isUnifiedMode()).toBe(false)
      
      layoutManager.switchToUnifiedMode()
      expect(layoutManager.isUnifiedMode()).toBe(true)
    })

    it('应该获取布局配置', () => {
      const config = layoutManager.getLayoutConfig()
      
      expect(config).toEqual({
        mode: 'manual',
        nodeSpacing: 150,
        layerSpacing: 200,
        autoLayout: false
      })
    })

    it('应该更新布局配置', () => {
      const newConfig = {
        nodeSpacing: 200,
        layerSpacing: 250,
        autoLayout: true
      }
      
      const result = layoutManager.updateLayoutConfig(newConfig)
      
      expect(result).toBe(true)
      expect(layoutManager.getLayoutConfig()).toEqual({
        mode: 'manual',
        ...newConfig
      })
    })
  })

  describe('事件处理', () => {
    it('应该处理节点添加事件', () => {
      layoutManager.switchToUnifiedMode()
      
      const nodeAddedHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:added'
      )[1]
      
      const newNode = { id: 'newNode', type: 'PROCESSING' }
      nodeAddedHandler({ node: newNode })
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:node:added', {
        nodeId: 'newNode',
        autoLayoutTriggered: true
      })
    })

    it('应该处理节点移除事件', () => {
      const nodeRemovedHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'node:removed'
      )[1]
      
      const removedNode = { id: 'removedNode' }
      nodeRemovedHandler({ node: removedNode })
      
      expect(mockCacheManager.delete).toHaveBeenCalledWith('manual_position_removedNode')
      expect(mockEventBus.emit).toHaveBeenCalledWith('layout:node:removed', {
        nodeId: 'removedNode'
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理布局应用失败', () => {
      mockGraph.getNodes.mockImplementation(() => {
        throw new Error('获取节点失败')
      })
      
      const result = layoutManager.applyUnifiedLayout()
      
      expect(result).toBe(false)
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'LayoutModeManager.applyUnifiedLayout'
      )
    })

    it('应该处理模式切换失败', () => {
      mockEventBus.emit.mockImplementation(() => {
        throw new Error('事件发布失败')
      })
      
      const result = layoutManager.switchToUnifiedMode()
      
      expect(result).toBe(false)
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'LayoutModeManager.switchToUnifiedMode'
      )
    })
  })

  describe('坐标转换功能', () => {
    it('应该在计算分层布局时验证坐标转换', () => {
      const nodes = [
        { id: 'input1', type: 'INPUT' },
        { id: 'process1', type: 'PROCESSING' },
        { id: 'output1', type: 'OUTPUT' }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟坐标验证成功
      mockCoordinateManager.validateCoordinateTransform.mockReturnValue(true)
      
      layoutManager.switchToUnifiedMode()
      const result = layoutManager.applyUnifiedLayout()
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.validateCoordinateTransform).toHaveBeenCalledTimes(6) // 3次在calculateHierarchicalLayout中，3次在validateLayoutCoordinates中
      expect(mockGraph.setPosition).toHaveBeenCalledTimes(3)
    })

    it('应该在坐标验证失败时使用修正位置', () => {
      const nodes = [{ id: 'node1', type: 'INPUT' }]
      const position = { x: 100, y: 100 }
      const correctedLayoutPos = { x: 102, y: 102 }
      const finalCorrectedPos = { x: 104, y: 104 }
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟坐标验证失败，需要修正
      mockCoordinateManager.validateCoordinateTransform.mockReturnValue({
        isValid: false,
        position: position
      })
      mockCoordinateManager.correctLayoutPosition.mockReturnValue(correctedLayoutPos)
      mockCoordinateManager.correctDragHintPosition.mockReturnValue(finalCorrectedPos)
      
      layoutManager.switchToUnifiedMode()
      layoutManager.applyUnifiedLayout()
      
      expect(mockCoordinateManager.correctLayoutPosition).toHaveBeenCalled()
      expect(mockCoordinateManager.correctDragHintPosition).toHaveBeenCalled()
      expect(mockGraph.setPosition).toHaveBeenCalledWith('node1', finalCorrectedPos)
    })

    it('应该在应用统一布局时使用坐标修正', () => {
      const nodes = [{ id: 'node1', type: 'INPUT' }]
      const position = { x: 100, y: 100 }
      const correctedPosition = { x: 102, y: 102 }
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockCoordinateManager.correctDragHintPosition.mockReturnValue(correctedPosition)
      
      layoutManager.switchToUnifiedMode()
      layoutManager.applyUnifiedLayout()
      
      expect(mockCoordinateManager.correctDragHintPosition).toHaveBeenCalled()
      expect(mockGraph.setPosition).toHaveBeenCalledWith('node1', correctedPosition)
    })

    it('应该验证布局坐标的一致性', () => {
      const nodes = [
        { id: 'input1', type: 'INPUT' },
        { id: 'process1', type: 'PROCESSING' }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟坐标转换
      const logicalPos = { x: 100, y: 100 }
      const domPos = { x: 120, y: 120 }
      const backToLogical = { x: 99, y: 99 } // 轻微误差
      
      mockCoordinateManager.logicalToDOM.mockReturnValue(domPos)
      mockCoordinateManager.DOMToLogical.mockReturnValue(backToLogical)
      
      layoutManager.switchToUnifiedMode()
      layoutManager.applyUnifiedLayout()
      
      expect(mockCoordinateManager.logicalToDOM).toHaveBeenCalled()
      expect(mockCoordinateManager.DOMToLogical).toHaveBeenCalled()
    })

    it('应该处理坐标转换错误', () => {
      const nodes = [{ id: 'node1', type: 'INPUT' }]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue([])
      
      // 模拟坐标验证抛出异常
      mockCoordinateManager.validateCoordinateTransform.mockImplementation(() => {
        throw new Error('坐标验证失败')
      })
      
      layoutManager.switchToUnifiedMode()
      const result = layoutManager.applyUnifiedLayout()
      
      expect(result).toBe(false)
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'LayoutModeManager.applyUnifiedLayout'
      )
    })

    it('应该正确保存手动位置到缓存', () => {
      const nodeId = 'node1'
      const originalPosition = { x: 200, y: 150 }
      
      layoutManager.saveManualPosition(nodeId, originalPosition)
      
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `manual_position_${nodeId}`,
        originalPosition,
        { ttl: 24 * 60 * 60 * 1000 }
      )
    })
  })

  describe('清理', () => {
    it('应该正确清理资源', () => {
      layoutManager.destroy()
      
      expect(mockGraph.off).toHaveBeenCalledWith('node:added', expect.any(Function))
      expect(mockGraph.off).toHaveBeenCalledWith('node:removed', expect.any(Function))
      expect(mockGraph.off).toHaveBeenCalledWith('edge:added', expect.any(Function))
    })
  })
})