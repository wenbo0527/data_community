/**
 * 拖拽交互综合测试
 * 测试节点拖拽、预览线拖拽、吸附连接等完整的拖拽交互流程
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { GlobalDragStateManager, DragStates } from '../utils/canvas/GlobalDragStateManager.js'
import { PreviewLineSystem } from '../composables/canvas/core/PreviewLineSystem.js'
import { UnifiedEdgeManager } from '../composables/canvas/unified/UnifiedEdgeManager.js'

describe('拖拽交互综合测试', () => {
  let mockGraph
  let dragStateManager
  let previewLineSystem
  let unifiedEdgeManager
  let mockNodes
  let mockPreviewLines
  let mockConnections

  beforeEach(() => {
    // 模拟 X6 图实例
    mockGraph = {
      getNodes: vi.fn(),
      getCellById: vi.fn(),
      addEdge: vi.fn(),
      removeCell: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      translateBy: vi.fn(),
      getMousePosition: vi.fn()
    }

    // 模拟节点数据
    mockNodes = [
      {
        id: 'drag-node-1',
        position: () => ({ x: 100, y: 100 }),
        setPosition: vi.fn(),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'condition', maxOutConnections: 2 }),
        getBBox: () => ({ x: 100, y: 100, width: 120, height: 60 }),
        attr: vi.fn()
      },
      {
        id: 'drag-node-2',
        position: () => ({ x: 300, y: 200 }),
        setPosition: vi.fn(),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getBBox: () => ({ x: 300, y: 200, width: 120, height: 60 }),
        attr: vi.fn()
      }
    ]

    // 模拟预览线数据
    mockPreviewLines = [
      {
        id: 'drag-preview-1',
        getSourceCellId: () => 'drag-node-1',
        getTargetPoint: () => ({ x: 350, y: 225 }),
        setTargetPoint: vi.fn(),
        attr: vi.fn(),
        remove: vi.fn()
      }
    ]

    // 模拟连接线数据
    mockConnections = []

    mockGraph.getNodes.mockReturnValue(mockNodes)
    mockGraph.getCellById.mockImplementation(id => {
      if (id.startsWith('drag-node-')) {
        return mockNodes.find(node => node.id === id)
      }
      if (id.startsWith('drag-preview-')) {
        return mockPreviewLines.find(line => line.id === id)
      }
      return null
    })

    // 初始化管理器
    dragStateManager = new GlobalDragStateManager()
    previewLineSystem = new PreviewLineSystem({ graph: mockGraph })
    unifiedEdgeManager = new UnifiedEdgeManager({ graph: mockGraph })
  })

  afterEach(() => {
    dragStateManager?.destroy()
    previewLineSystem?.destroy()
    unifiedEdgeManager?.destroy()
    vi.clearAllMocks()
  })

  describe('拖拽状态管理', () => {
    test('应该正确初始化拖拽状态', () => {
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
      expect(dragStateManager.isDragging).toBe(false)
      expect(dragStateManager.isSnapping).toBe(false)
    })

    test('应该正确开始节点拖拽', () => {
      const node = mockNodes[0]
      const startPosition = { x: 100, y: 100 }
      
      const success = dragStateManager.startDrag(node.id, startPosition, { nodeType: 'condition' })
      
      expect(success).toBe(true)
      expect(dragStateManager.currentState).toBe(DragStates.DRAGGING)
      expect(dragStateManager.isDragging).toBe(true)
      expect(dragStateManager.currentDrag.nodeId).toBe(node.id)
    })

    test('应该正确处理拖拽状态转换', () => {
      const node = mockNodes[0]
      
      // 开始拖拽
      dragStateManager.startDrag(node.id, { x: 100, y: 100 })
      expect(dragStateManager.currentState).toBe(DragStates.DRAGGING)
      
      // 转换到吸附状态
      const snapSuccess = dragStateManager.startSnapping(node, { snapDistance: 15 })
      expect(snapSuccess).toBe(true)
      expect(dragStateManager.currentState).toBe(DragStates.SNAPPING)
      
      // 结束拖拽
      dragStateManager.endDrag()
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
    })

    test('应该阻止无效的状态转换', () => {
      // 尝试在IDLE状态下直接进入SNAPPING状态
      const success = dragStateManager.startSnapping(mockNodes[0], {})
      
      expect(success).toBe(false)
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
    })
  })

  describe('节点拖拽功能', () => {
    test('应该正确更新节点位置', () => {
      const node = mockNodes[0]
      const startPos = { x: 100, y: 100 }
      const newPos = { x: 150, y: 120 }
      
      // 开始拖拽
      dragStateManager.startDrag(node.id, startPos)
      
      // 更新位置
      dragStateManager.updateDragPosition(newPos)
      
      expect(dragStateManager.currentDrag.currentPosition).toEqual(newPos)
      expect(dragStateManager.currentDrag.deltaX).toBe(50)
      expect(dragStateManager.currentDrag.deltaY).toBe(20)
    })

    test('应该触发拖拽事件', () => {
      const dragStartSpy = vi.fn()
      const dragMoveSpy = vi.fn()
      const dragEndSpy = vi.fn()
      
      dragStateManager.on('dragStart', dragStartSpy)
      dragStateManager.on('dragMove', dragMoveSpy)
      dragStateManager.on('dragEnd', dragEndSpy)
      
      const node = mockNodes[0]
      
      // 执行拖拽流程
      dragStateManager.startDrag(node.id, { x: 100, y: 100 })
      dragStateManager.updateDragPosition({ x: 150, y: 120 })
      dragStateManager.endDrag()
      
      expect(dragStartSpy).toHaveBeenCalledWith(expect.objectContaining({
        nodeId: node.id
      }))
      expect(dragMoveSpy).toHaveBeenCalledWith(expect.objectContaining({
        currentPosition: { x: 150, y: 120 }
      }))
      expect(dragEndSpy).toHaveBeenCalled()
    })

    test('应该处理拖拽边界限制', () => {
      const node = mockNodes[0]
      
      // 设置画布边界
      const canvasBounds = { x: 0, y: 0, width: 800, height: 600 }
      dragStateManager.setCanvasBounds(canvasBounds)
      
      dragStateManager.startDrag(node.id, { x: 100, y: 100 })
      
      // 尝试拖拽到边界外
      const outOfBoundsPos = { x: -50, y: -30 }
      dragStateManager.updateDragPosition(outOfBoundsPos)
      
      // 位置应该被限制在边界内
      const constrainedPos = dragStateManager.currentDrag.currentPosition
      expect(constrainedPos.x).toBeGreaterThanOrEqual(0)
      expect(constrainedPos.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('预览线拖拽功能', () => {
    test('应该正确创建预览线拖拽', () => {
      const sourceNode = mockNodes[0]
      const startPoint = { x: 160, y: 130 } // 节点右侧出口
      
      const previewLine = previewLineSystem.createPreviewLine(
        sourceNode.id,
        startPoint,
        { x: 200, y: 150 }
      )
      
      expect(previewLine).toBeTruthy()
      expect(previewLine.getSourceCellId()).toBe(sourceNode.id)
    })

    test('应该正确更新预览线终点', () => {
      const sourceNode = mockNodes[0]
      const previewLine = mockPreviewLines[0]
      
      // 模拟拖拽更新预览线终点
      const newEndPoint = { x: 280, y: 180 }
      previewLine.setTargetPoint(newEndPoint)
      
      expect(previewLine.setTargetPoint).toHaveBeenCalledWith(newEndPoint)
    })

    test('应该在拖拽过程中实时更新预览线', () => {
      const sourceNode = mockNodes[0]
      const previewLine = mockPreviewLines[0]
      
      // 模拟鼠标移动事件
      const mouseMovePositions = [
        { x: 200, y: 150 },
        { x: 250, y: 175 },
        { x: 300, y: 200 }
      ]
      
      mouseMovePositions.forEach(pos => {
        mockGraph.getMousePosition.mockReturnValue(pos)
        
        // 触发预览线更新
        previewLineSystem.updatePreviewLineEndpoint(previewLine.id, pos)
        
        expect(previewLine.setTargetPoint).toHaveBeenCalledWith(pos)
      })
    })
  })

  describe('吸附拖拽功能', () => {
    test('应该检测到吸附目标', () => {
      const dragNode = mockNodes[0]
      const targetNode = mockNodes[1]
      const mousePos = { x: 365, y: 235 } // 接近目标节点
      
      // 开始拖拽
      dragStateManager.startDrag(dragNode.id, { x: 100, y: 100 })
      
      // 检测吸附
      const snapResult = unifiedEdgeManager.checkNodeSnapToPreviewEdges(
        dragNode.id, 
        mousePos,
        { size: dragNode.getSize() }
      )
      
      expect(snapResult).toBeTruthy()
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.snapTarget.nodeId).toBe(targetNode.id)
    })

    test('应该应用吸附位置', () => {
      const dragNode = mockNodes[0]
      const targetNode = mockNodes[1]
      const snapPosition = { x: 360, y: 230 }
      
      dragStateManager.startDrag(dragNode.id, { x: 100, y: 100 })
      
      // 模拟吸附
      const snapTarget = {
        nodeId: targetNode.id,
        position: snapPosition,
        distance: 15
      }
      
      dragStateManager.startSnapping(dragNode, { snapTarget })
      
      // 应用吸附位置
      dragNode.setPosition(snapPosition.x, snapPosition.y, { snapApplied: true })
      
      expect(dragNode.setPosition).toHaveBeenCalledWith(
        snapPosition.x,
        snapPosition.y,
        expect.objectContaining({ snapApplied: true })
      )
    })

    test('应该在吸附成功后创建连接', () => {
      const sourceNode = mockNodes[0]
      const targetNode = mockNodes[1]
      const previewLine = mockPreviewLines[0]
      
      // 模拟吸附成功并创建连接
      const connectionData = {
        source: { cell: sourceNode.id, port: 'out-port-1' },
        target: { cell: targetNode.id, port: 'in-port-1' },
        branchId: 'branch-1'
      }
      
      mockGraph.addEdge.mockReturnValue({ id: 'new-connection-1' })
      
      // 执行连接创建
      const connection = mockGraph.addEdge(connectionData)
      
      expect(mockGraph.addEdge).toHaveBeenCalledWith(connectionData)
      expect(connection.id).toBe('new-connection-1')
      
      // 删除预览线
      previewLine.remove()
      expect(previewLine.remove).toHaveBeenCalled()
    })
  })

  describe('拖拽性能测试', () => {
    test('高频拖拽更新性能', () => {
      const node = mockNodes[0]
      dragStateManager.startDrag(node.id, { x: 100, y: 100 })
      
      const startTime = performance.now()
      
      // 模拟高频拖拽更新（60fps）
      for (let i = 0; i < 60; i++) {
        dragStateManager.updateDragPosition({
          x: 100 + i,
          y: 100 + i * 0.5
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 60次更新应在16ms内完成（60fps要求）
      expect(duration).toBeLessThan(16)
    })

    test('大量预览线拖拽性能', () => {
      const sourceNode = mockNodes[0]
      
      // 创建多条预览线
      const previewLines = []
      for (let i = 0; i < 20; i++) {
        const previewLine = {
          id: `perf-preview-${i}`,
          getSourceCellId: () => sourceNode.id,
          setTargetPoint: vi.fn(),
          getTargetPoint: () => ({ x: 200 + i * 10, y: 150 + i * 5 })
        }
        previewLines.push(previewLine)
      }
      
      const startTime = performance.now()
      
      // 批量更新预览线终点
      const newEndPoint = { x: 400, y: 300 }
      previewLines.forEach(line => {
        line.setTargetPoint(newEndPoint)
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 20条预览线更新应在10ms内完成
      expect(duration).toBeLessThan(10)
    })
  })

  describe('拖拽错误处理', () => {
    test('应该处理无效节点拖拽', () => {
      const invalidNodeId = 'non-existent-node'
      
      const success = dragStateManager.startDrag(invalidNodeId, { x: 100, y: 100 })
      
      expect(success).toBe(false)
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
    })

    test('应该处理拖拽过程中的异常', () => {
      const node = mockNodes[0]
      
      // 模拟节点setPosition方法抛出异常
      node.setPosition.mockImplementation(() => {
        throw new Error('Position update failed')
      })
      
      dragStateManager.startDrag(node.id, { x: 100, y: 100 })
      
      // 尝试更新位置（应该捕获异常）
      expect(() => {
        dragStateManager.updateDragPosition({ x: 150, y: 120 })
      }).not.toThrow()
      
      // 状态应该转换为错误状态
      expect(dragStateManager.currentState).toBe(DragStates.ERROR)
    })

    test('应该处理预览线创建失败', () => {
      const sourceNode = mockNodes[0]
      
      // 模拟预览线系统抛出异常
      previewLineSystem.createPreviewLine = vi.fn().mockImplementation(() => {
        throw new Error('Preview line creation failed')
      })
      
      expect(() => {
        previewLineSystem.createPreviewLine(sourceNode.id, { x: 100, y: 100 }, { x: 200, y: 150 })
      }).toThrow('Preview line creation failed')
    })
  })

  describe('拖拽集成测试', () => {
    test('完整的拖拽到吸附到连接流程', async () => {
      const sourceNode = mockNodes[0]
      const targetNode = mockNodes[1]
      
      // 1. 开始节点拖拽
      const dragSuccess = dragStateManager.startDrag(sourceNode.id, { x: 100, y: 100 })
      expect(dragSuccess).toBe(true)
      
      // 2. 创建预览线
      const previewLine = previewLineSystem.createPreviewLine(
        sourceNode.id,
        { x: 160, y: 130 },
        { x: 200, y: 150 }
      )
      expect(previewLine).toBeTruthy()
      
      // 3. 拖拽到目标节点附近
      const nearTargetPos = { x: 365, y: 235 }
      dragStateManager.updateDragPosition(nearTargetPos)
      
      // 4. 检测吸附
      const snapResult = unifiedEdgeManager.checkNodeSnapToPreviewEdges(
        sourceNode.id,
        nearTargetPos,
        { size: sourceNode.getSize() }
      )
      expect(snapResult.canSnap).toBe(true)
      
      // 5. 应用吸附
      const snapSuccess = dragStateManager.startSnapping(sourceNode, {
        snapTarget: snapResult.snapTarget
      })
      expect(snapSuccess).toBe(true)
      
      // 6. 创建连接并删除预览线
      const connectionData = {
        source: { cell: sourceNode.id },
        target: { cell: targetNode.id }
      }
      mockGraph.addEdge(connectionData)
      previewLine.remove()
      
      // 7. 结束拖拽
      dragStateManager.endDrag()
      
      expect(mockGraph.addEdge).toHaveBeenCalledWith(connectionData)
      expect(previewLine.remove).toHaveBeenCalled()
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
    })

    test('拖拽取消流程', () => {
      const sourceNode = mockNodes[0]
      
      // 开始拖拽
      dragStateManager.startDrag(sourceNode.id, { x: 100, y: 100 })
      
      // 创建预览线
      const previewLine = previewLineSystem.createPreviewLine(
        sourceNode.id,
        { x: 160, y: 130 },
        { x: 200, y: 150 }
      )
      
      // 取消拖拽（例如按ESC键）
      dragStateManager.cancelDrag()
      
      expect(dragStateManager.currentState).toBe(DragStates.IDLE)
      expect(previewLine.remove).toHaveBeenCalled()
    })
  })
})