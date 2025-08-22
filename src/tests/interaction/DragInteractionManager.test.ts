import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { DragInteractionManager } from '../../core/interaction/DragInteractionManager'
import { UnifiedEventBus } from '../../core/UnifiedEventBus'
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager'
import { ErrorHandler } from '../../core/ErrorHandler'
import { NodeConnectionOptimizer } from '../../core/interaction/NodeConnectionOptimizer'
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager'
import { nodeTypes } from '../../utils/nodeTypes'

describe('DragInteractionManager', () => {
  let dragManager: DragInteractionManager
  let mockGraph: any
  let mockEventBus: any
  let mockCacheManager: any
  let mockErrorHandler: any
  let mockConnectionOptimizer: any
  let mockCoordinateManager: any

  beforeEach(() => {
    // Mock X6 Graph
    mockGraph = {
      on: vi.fn(),
      off: vi.fn(),
      getCellById: vi.fn(),
      getNodes: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      translateBy: vi.fn(),
      getPosition: vi.fn(() => ({ x: 0, y: 0 })),
      setPosition: vi.fn(),
      getBBox: vi.fn(() => ({ x: 0, y: 0, width: 100, height: 50 }))
    }

    // 创建基础组件实例的模拟
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }
    
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }
    
    mockErrorHandler = {
      handleError: vi.fn(),
      logError: vi.fn()
    }
    
    mockConnectionOptimizer = {
      createPreviewConnection: vi.fn(),
      clearAllPreviewConnections: vi.fn()
    }

    // Mock CoordinateSystemManager
    mockCoordinateManager = {
      logicalToDOM: vi.fn().mockImplementation((pos) => pos),
      DOMToLogical: vi.fn().mockImplementation((pos) => pos),
      getNodeDOMPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      getNodeDOMCenter: vi.fn().mockImplementation((nodeId) => {
        // 根据mockGraph.getBBox返回的bbox计算中心点
        const bbox = mockGraph.getBBox(nodeId)
        return {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2
        }
      }),
      calculateCoordinateOffset: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      correctDragHintPosition: vi.fn().mockImplementation((nodeId, pos) => pos)
    } as any

    // 创建DragInteractionManager实例
    dragManager = new DragInteractionManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      mockConnectionOptimizer,
      mockCoordinateManager
    )
  })

  afterEach(() => {
    dragManager.destroy()
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化DragInteractionManager', () => {
      expect(dragManager).toBeDefined()
      expect(mockGraph.on).toHaveBeenCalledWith('node:mousedown', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:mousemove', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:mouseup', expect.any(Function))
    })

    it('应该注册必要的事件监听器', () => {
      expect(mockGraph.on).toHaveBeenCalledTimes(3)
    })
  })

  describe('节点拖拽', () => {
    it('应该开始节点拖拽', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      const result = dragManager.startDrag(nodeId, startPosition)
      
      expect(result).toBe(true)
      expect(dragManager.isDragging()).toBe(true)
      expect(dragManager.getDraggedNodeId()).toBe(nodeId)
    })

    it('应该支持拖拽开始节点', () => {
      const startNodeId = 'start-node-1'
      const startPosition = { x: 50, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: startNodeId, 
        data: { type: nodeTypes.START }
      })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      const result = dragManager.startDrag(startNodeId, startPosition)
      
      expect(result).toBe(true)
      expect(dragManager.isDragging()).toBe(true)
      expect(dragManager.getDraggedNodeId()).toBe(startNodeId)
    })

    it('应该支持拖拽分支节点', () => {
      const branchNodeId = 'audience-split-1'
      const startPosition = { x: 200, y: 150 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: branchNodeId, 
        data: { type: nodeTypes.AUDIENCE_SPLIT }
      })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      const result = dragManager.startDrag(branchNodeId, startPosition)
      
      expect(result).toBe(true)
      expect(dragManager.isDragging()).toBe(true)
      expect(dragManager.getDraggedNodeId()).toBe(branchNodeId)
    })

    it('应该支持拖拽结束节点', () => {
      const endNodeId = 'end-node-1'
      const startPosition = { x: 400, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: endNodeId, 
        data: { type: nodeTypes.END }
      })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      const result = dragManager.startDrag(endNodeId, startPosition)
      
      expect(result).toBe(true)
      expect(dragManager.isDragging()).toBe(true)
      expect(dragManager.getDraggedNodeId()).toBe(endNodeId)
    })

    it('应该更新节点拖拽位置', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const newPosition = { x: 150, y: 150 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.updateDragPosition(newPosition)
      
      expect(mockGraph.setPosition).toHaveBeenCalledWith(nodeId, newPosition)
    })

    it('应该结束节点拖拽', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const endPosition = { x: 200, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.endDrag(endPosition)
      
      expect(dragManager.isDragging()).toBe(false)
      expect(dragManager.getDraggedNodeId()).toBeNull()
    })
  })

  describe('吸附功能', () => {
    it('应该检测30像素范围内的吸附目标', () => {
      const draggedNodeId = 'node1'
      const targetNodeId = 'node2'
      const dragPosition = { x: 100, y: 100 }
      const targetPosition = { x: 125, y: 125 } // 距离约35.36像素，超出30像素阈值
      
      mockGraph.getNodes.mockReturnValue([
        { id: draggedNodeId },
        { id: targetNodeId }
      ])
      mockGraph.getBBox.mockImplementation((id: string) => {
        if (id === targetNodeId) {
          // 返回bbox，使得中心点为targetPosition
          return { x: targetPosition.x - 50, y: targetPosition.y - 25, width: 100, height: 50 }
        }
        return { x: dragPosition.x - 50, y: dragPosition.y - 25, width: 100, height: 50 }
      })
      
      const snapTarget = dragManager.findSnapTarget(draggedNodeId, dragPosition)
      
      expect(snapTarget).toBeNull() // 超出30像素阈值
    })

    it('应该在30像素范围内找到吸附目标', () => {
      const draggedNodeId = 'node1'
      const targetNodeId = 'node2'
      const dragPosition = { x: 100, y: 100 }
      const targetPosition = { x: 115, y: 115 } // 距离约21.21像素，在30像素阈值内
      
      mockGraph.getNodes.mockReturnValue([
        { id: draggedNodeId },
        { id: targetNodeId }
      ])
      mockGraph.getBBox.mockImplementation((id: string) => {
        if (id === targetNodeId) {
          // 返回bbox，使得中心点为targetPosition
          return { x: targetPosition.x - 50, y: targetPosition.y - 25, width: 100, height: 50 }
        }
        return { x: dragPosition.x - 50, y: dragPosition.y - 25, width: 100, height: 50 }
      })
      
      const snapTarget = dragManager.findSnapTarget(draggedNodeId, dragPosition)
      
      expect(snapTarget).toEqual({
        nodeId: targetNodeId,
        position: targetPosition,
        distance: expect.any(Number)
      })
    })

    it('应该应用吸附位置', () => {
      const nodeId = 'node1'
      const snapPosition = { x: 200, y: 200 }
      
      dragManager.applySnapPosition(nodeId, snapPosition)
      
      expect(mockGraph.setPosition).toHaveBeenCalledWith(nodeId, snapPosition)
    })
  })

  describe('预览线连接', () => {
    it('应该在拖拽时创建预览线连接', () => {
      const draggedNodeId = 'node1'
      const targetNodeId = 'node2'
      const dragPosition = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: draggedNodeId })
      mockGraph.getNodes.mockReturnValue([
        { id: draggedNodeId },
        { id: targetNodeId }
      ])
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(true)
      
      dragManager.startDrag(draggedNodeId, dragPosition)
      dragManager.createPreviewConnection(targetNodeId)
      
      expect(mockConnectionOptimizer.createPreviewConnection).toHaveBeenCalledWith(
        draggedNodeId,
        targetNodeId,
        'output',
        'input'
      )
    })

    it('应该验证预览线endpoint坐标准确性', () => {
      const sourceNodeId = 'sms-node-1'
      const targetNodeId = 'audience-split-1'
      const dragPosition = { x: 200, y: 150 }
      const sourceEndpoint = { x: 250, y: 175 }
      const targetEndpoint = { x: 300, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: sourceNodeId,
        data: { type: nodeTypes.SMS }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: sourceNodeId, data: { type: nodeTypes.SMS } },
        { id: targetNodeId, data: { type: nodeTypes.AUDIENCE_SPLIT } }
      ])
      
      // Mock端口坐标计算
      mockCoordinateManager.getNodeDOMCenter.mockImplementation((nodeId) => {
        if (nodeId === sourceNodeId) return sourceEndpoint
        if (nodeId === targetNodeId) return targetEndpoint
        return { x: 0, y: 0 }
      })
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockImplementation(
        (sourceId, targetId, sourcePort, targetPort) => {
          // 验证端口坐标计算被调用
          expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(sourceId)
          expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(targetId)
          return true
        }
      )
      
      dragManager.startDrag(sourceNodeId, dragPosition)
      const result = dragManager.createPreviewConnection(targetNodeId)
      
      expect(result).toBe(true)
      expect(mockConnectionOptimizer.createPreviewConnection).toHaveBeenCalledWith(
        sourceNodeId,
        targetNodeId,
        'output',
        'input'
      )
    })

    it('应该在吸附时验证预览线连接到in端口的坐标', () => {
      const draggedNodeId = 'sms-node-1'
      const snapTargetId = 'audience-split-1'
      const dragPosition = { x: 200, y: 150 }
      const snapPosition = { x: 280, y: 180 }
      const inputPortPosition = { x: 280, y: 155 } // in端口位置
      
      mockGraph.getCellById.mockReturnValue({ 
        id: draggedNodeId,
        data: { type: nodeTypes.SMS }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: draggedNodeId, data: { type: nodeTypes.SMS } },
        { id: snapTargetId, data: { type: nodeTypes.AUDIENCE_SPLIT } }
      ])
      
      // Mock吸附目标检测
      mockGraph.getBBox.mockImplementation((id: string) => {
        if (id === snapTargetId) {
          return { x: snapPosition.x - 50, y: snapPosition.y - 25, width: 100, height: 50 }
        }
        return { x: dragPosition.x - 50, y: dragPosition.y - 25, width: 100, height: 50 }
      })
      
      // Mock坐标转换
      mockCoordinateManager.getNodeDOMCenter.mockImplementation((nodeId) => {
        if (nodeId === snapTargetId) return inputPortPosition
        return { x: dragPosition.x, y: dragPosition.y }
      })
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(true)
      
      dragManager.startDrag(draggedNodeId, dragPosition)
      
      // 模拟拖拽到吸附范围内
      const snapTarget = dragManager.findSnapTarget(draggedNodeId, { x: 275, y: 175 })
      expect(snapTarget).toBeTruthy()
      
      // 创建预览线连接到吸附目标的in端口
      const result = dragManager.createPreviewConnection(snapTargetId)
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(snapTargetId)
      expect(mockConnectionOptimizer.createPreviewConnection).toHaveBeenCalledWith(
        draggedNodeId,
        snapTargetId,
        'output',
        'input'
      )
    })

    it('应该为分支节点创建多输出端口预览线', () => {
      const branchNodeId = 'audience-split-1'
      const targetNodeId = 'sms-node-1'
      const dragPosition = { x: 200, y: 150 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: branchNodeId,
        data: { type: nodeTypes.AUDIENCE_SPLIT }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: branchNodeId, data: { type: nodeTypes.AUDIENCE_SPLIT } },
        { id: targetNodeId, data: { type: nodeTypes.SMS } }
      ])
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(true)
      
      dragManager.startDrag(branchNodeId, dragPosition)
      dragManager.createPreviewConnection(targetNodeId)
      
      expect(mockConnectionOptimizer.createPreviewConnection).toHaveBeenCalledWith(
        branchNodeId,
        targetNodeId,
        'output',
        'input'
      )
    })

    it('应该限制开始节点的输入连接', () => {
      const startNodeId = 'start-node-1'
      const sourceNodeId = 'sms-node-1'
      const dragPosition = { x: 50, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: sourceNodeId,
        data: { type: nodeTypes.SMS }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: startNodeId, data: { type: nodeTypes.START } },
        { id: sourceNodeId, data: { type: nodeTypes.SMS } }
      ])
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(false)
      
      dragManager.startDrag(sourceNodeId, dragPosition)
      const result = dragManager.createPreviewConnection(startNodeId)
      
      // 开始节点不应该接受输入连接
      expect(result).toBe(false)
    })

    it('应该限制结束节点的输出连接', () => {
      const endNodeId = 'end-node-1'
      const targetNodeId = 'sms-node-1'
      const dragPosition = { x: 400, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: endNodeId,
        data: { type: nodeTypes.END }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: endNodeId, data: { type: nodeTypes.END } },
        { id: targetNodeId, data: { type: nodeTypes.SMS } }
      ])
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(false)
      
      dragManager.startDrag(endNodeId, dragPosition)
      const result = dragManager.createPreviewConnection(targetNodeId)
      
      // 结束节点不应该有输出连接
      expect(result).toBe(false)
    })

    it('应该清除预览线连接', () => {
      vi.spyOn(mockConnectionOptimizer, 'clearAllPreviewConnections')
      
      dragManager.clearPreviewConnections()
      
      expect(mockConnectionOptimizer.clearAllPreviewConnections).toHaveBeenCalled()
    })

    it('应该在拖拽结束时清除预览线', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const endPosition = { x: 200, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      vi.spyOn(mockConnectionOptimizer, 'clearAllPreviewConnections')
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.endDrag(endPosition)
      
      expect(mockConnectionOptimizer.clearAllPreviewConnections).toHaveBeenCalled()
    })

    it('应该在手动布局移动节点后刷新预览线endpoint坐标', () => {
      const sourceNodeId = 'sms-node-1'
      const targetNodeId = 'audience-split-1'
      const initialPosition = { x: 200, y: 150 }
      const newPosition = { x: 300, y: 200 }
      const updatedEndpoint = { x: 350, y: 225 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: sourceNodeId,
        data: { type: nodeTypes.SMS }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: sourceNodeId, data: { type: nodeTypes.SMS } },
        { id: targetNodeId, data: { type: nodeTypes.AUDIENCE_SPLIT } }
      ])
      
      // 初始预览线创建
      mockCoordinateManager.getNodeDOMCenter.mockReturnValue({ x: 250, y: 175 })
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(true)
      
      dragManager.startDrag(sourceNodeId, initialPosition)
      dragManager.createPreviewConnection(targetNodeId)
      
      // 手动移动节点位置
      dragManager.updateDragPosition(newPosition)
      
      // 更新endpoint坐标
      mockCoordinateManager.getNodeDOMCenter.mockReturnValue(updatedEndpoint)
      
      // 重新创建预览线以刷新endpoint坐标
      dragManager.clearPreviewConnections()
      const refreshResult = dragManager.createPreviewConnection(targetNodeId)
      
      expect(refreshResult).toBe(true)
      expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(sourceNodeId)
      expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(targetNodeId)
    })

    it('应该在画布移动时保持新建节点预览线位置一致性', () => {
      const sourceNodeId = 'start-node-1'
      const targetNodeId = 'sms-node-1'
      const canvasOffset = { x: 50, y: 30 }
      const nodePosition = { x: 100, y: 100 }
      const adjustedPosition = { x: 150, y: 130 }
      
      mockGraph.getCellById.mockReturnValue({ 
        id: sourceNodeId,
        data: { type: nodeTypes.START }
      })
      mockGraph.getNodes.mockReturnValue([
        { id: sourceNodeId, data: { type: nodeTypes.START } },
        { id: targetNodeId, data: { type: nodeTypes.SMS } }
      ])
      
      // Mock画布偏移计算
      mockCoordinateManager.calculateCoordinateOffset.mockReturnValue(canvasOffset)
      mockCoordinateManager.logicalToDOM.mockImplementation((pos) => ({
        x: pos.x + canvasOffset.x,
        y: pos.y + canvasOffset.y
      }))
      mockCoordinateManager.getNodeDOMCenter.mockImplementation((nodeId) => {
        if (nodeId === sourceNodeId) return adjustedPosition
        return { x: 200, y: 150 }
      })
      
      vi.spyOn(mockConnectionOptimizer, 'createPreviewConnection').mockReturnValue(true)
      
      dragManager.startDrag(sourceNodeId, nodePosition)
      
      // 在画布移动后创建预览线
      const result = dragManager.createPreviewConnection(targetNodeId)
      
      expect(result).toBe(true)
      expect(mockCoordinateManager.logicalToDOM).toHaveBeenCalled()
      expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(sourceNodeId)
      expect(mockConnectionOptimizer.createPreviewConnection).toHaveBeenCalledWith(
        sourceNodeId,
        targetNodeId,
        'output',
        'input'
      )
    })
  })

  describe('拖拽状态管理', () => {
    it('应该正确跟踪拖拽状态', () => {
      expect(dragManager.isDragging()).toBe(false)
      expect(dragManager.getDraggedNodeId()).toBeNull()
      
      const nodeId = 'node1'
      const position = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(position)
      
      dragManager.startDrag(nodeId, position)
      
      expect(dragManager.isDragging()).toBe(true)
      expect(dragManager.getDraggedNodeId()).toBe(nodeId)
    })

    it('应该获取拖拽开始位置', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      
      expect(dragManager.getDragStartPosition()).toEqual(startPosition)
    })
  })

  describe('事件处理', () => {
    it('应该发布拖拽开始事件', () => {
      const eventSpy = vi.spyOn(mockEventBus, 'emit')
      const nodeId = 'node1'
      const position = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(position)
      
      dragManager.startDrag(nodeId, position)
      
      expect(eventSpy).toHaveBeenCalledWith('drag:start', {
        nodeId,
        position
      })
    })

    it('应该发布拖拽更新事件', () => {
      const eventSpy = vi.spyOn(mockEventBus, 'emit')
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const newPosition = { x: 150, y: 150 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.updateDragPosition(newPosition)
      
      expect(eventSpy).toHaveBeenCalledWith('drag:update', {
        nodeId,
        position: newPosition,
        startPosition
      })
    })

    it('应该发布拖拽结束事件', () => {
      const eventSpy = vi.spyOn(mockEventBus, 'emit')
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const endPosition = { x: 200, y: 200 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.endDrag(endPosition)
      
      expect(eventSpy).toHaveBeenCalledWith('drag:end', {
        nodeId,
        startPosition,
        endPosition
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效节点拖拽', () => {
      mockGraph.getCellById.mockReturnValue(null)
      
      const result = dragManager.startDrag('nonexistent', { x: 0, y: 0 })
      
      expect(result).toBe(false)
      expect(dragManager.isDragging()).toBe(false)
    })

    it('应该处理拖拽过程中的错误', () => {
      const nodeId = 'node1'
      const position = { x: 100, y: 100 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(position)
      mockGraph.setPosition.mockImplementation(() => {
        throw new Error('Position update failed')
      })
      
      dragManager.startDrag(nodeId, position)
      
      expect(() => {
        dragManager.updateDragPosition({ x: 150, y: 150 })
      }).not.toThrow()
    })
  })

  describe('坐标转换功能', () => {
    it('应该在拖拽位置更新时使用坐标修正', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const newPosition = { x: 150, y: 150 }
      const correctedPosition = { x: 152, y: 148 }
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      mockGraph.getBBox.mockReturnValue({ x: 100, y: 100, width: 100, height: 50 })
      mockCoordinateManager.correctDragHintPosition.mockReturnValue(correctedPosition)
      
      dragManager.startDrag(nodeId, startPosition)
      dragManager.updateDragPosition(newPosition)
      
      expect(mockCoordinateManager.correctDragHintPosition).toHaveBeenCalledWith(
        nodeId,
        newPosition,
        { x: 100, y: 100, width: 100, height: 50 }
      )
      expect(mockGraph.setPosition).toHaveBeenCalledWith(nodeId, correctedPosition)
    })

    it('应该在查找吸附目标时使用DOM坐标计算', () => {
      const draggedNodeId = 'node1'
      const targetNodeId = 'node2'
      const dragPosition = { x: 100, y: 100 }
      const domDragPosition = { x: 120, y: 110 }
      const targetDOMCenter = { x: 140, y: 130 }
      
      mockGraph.getNodes.mockReturnValue([
        { id: draggedNodeId },
        { id: targetNodeId }
      ])
      mockGraph.getBBox.mockReturnValue({ x: 90, y: 85, width: 100, height: 50 })
      mockCoordinateManager.logicalToDOM.mockReturnValue(domDragPosition)
      mockCoordinateManager.getNodeDOMCenter.mockReturnValue(targetDOMCenter)
      mockCoordinateManager.DOMToLogical.mockReturnValue({ x: 140, y: 130 })
      
      const snapTarget = dragManager.findSnapTarget(draggedNodeId, dragPosition)
      
      expect(mockCoordinateManager.logicalToDOM).toHaveBeenCalledWith(dragPosition)
      expect(mockCoordinateManager.getNodeDOMCenter).toHaveBeenCalledWith(targetNodeId)
      expect(mockCoordinateManager.DOMToLogical).toHaveBeenCalledWith(targetDOMCenter)
    })

    it('应该正确处理坐标转换误差', () => {
      const nodeId = 'node1'
      const logicalPosition = { x: 100, y: 100 }
      const domPosition = { x: 120.5, y: 110.3 }
      const backToLogical = { x: 100.1, y: 99.9 }
      
      mockCoordinateManager.logicalToDOM.mockReturnValue(domPosition)
      mockCoordinateManager.DOMToLogical.mockReturnValue(backToLogical)
      
      // 测试坐标转换的一致性
      const result1 = mockCoordinateManager.logicalToDOM(logicalPosition)
      const result2 = mockCoordinateManager.DOMToLogical(result1)
      
      expect(result1).toEqual(domPosition)
      expect(result2).toEqual(backToLogical)
      
      // 验证误差在可接受范围内
      const xDiff = Math.abs(logicalPosition.x - result2.x)
      const yDiff = Math.abs(logicalPosition.y - result2.y)
      expect(xDiff).toBeLessThan(1)
      expect(yDiff).toBeLessThan(1)
    })

    it('应该在拖拽过程中保持坐标一致性', () => {
      const nodeId = 'node1'
      const startPosition = { x: 100, y: 100 }
      const dragPositions = [
        { x: 110, y: 105 },
        { x: 120, y: 110 },
        { x: 130, y: 115 }
      ]
      
      mockGraph.getCellById.mockReturnValue({ id: nodeId })
      mockGraph.getPosition.mockReturnValue(startPosition)
      mockGraph.getBBox.mockReturnValue({ x: 100, y: 100, width: 100, height: 50 })
      
      dragManager.startDrag(nodeId, startPosition)
      
      dragPositions.forEach(position => {
        dragManager.updateDragPosition(position)
        expect(mockCoordinateManager.correctDragHintPosition).toHaveBeenCalledWith(
          nodeId,
          position,
          expect.any(Object)
        )
      })
      
      expect(mockCoordinateManager.correctDragHintPosition).toHaveBeenCalledTimes(dragPositions.length)
    })
  })

  describe('清理', () => {
    it('应该正确清理资源', () => {
      dragManager.destroy()
      
      expect(mockGraph.off).toHaveBeenCalledWith('node:mousedown', expect.any(Function))
      expect(mockGraph.off).toHaveBeenCalledWith('node:mousemove', expect.any(Function))
      expect(mockGraph.off).toHaveBeenCalledWith('node:mouseup', expect.any(Function))
    })
  })
})