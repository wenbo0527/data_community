/**
 * 核心服务集成测试
 * 测试 GraphService、PreviewLineService、LayoutService、EventService、StateService 的集成和协作
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createGraphService } from '../../../pages/marketing/tasks/services/GraphService.js'
import { createPreviewLineService } from '../../../pages/marketing/tasks/services/PreviewLineService.js'
import { createLayoutService } from '../../../pages/marketing/tasks/services/LayoutService.js'
import { createEventService } from '../../../pages/marketing/tasks/services/EventService.js'
import { createStateService, StateType } from '../../../pages/marketing/tasks/services/StateService.js';

// Mock X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  addEdge: vi.fn(),
  removeNode: vi.fn(),
  removeEdge: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  on: vi.fn((event, callback) => {
    // 存储事件监听器以便后续触发
    if (!mockGraph._listeners) {
      mockGraph._listeners = new Map()
    }
    if (!mockGraph._listeners.has(event)) {
      mockGraph._listeners.set(event, [])
    }
    mockGraph._listeners.get(event).push(callback)
  }),
  off: vi.fn(),
  trigger: vi.fn((event, data) => {
    // 触发已注册的事件监听器
    if (mockGraph._listeners && mockGraph._listeners.has(event)) {
      const listeners = mockGraph._listeners.get(event)
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Mock graph event listener error:', error)
        }
      })
    }
  }),
  zoom: vi.fn(),
  centerContent: vi.fn(),
  translate: vi.fn(),
  getGraphArea: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
  toJSON: vi.fn(() => ({ cells: [] })),
  fromJSON: vi.fn(),
  dispose: vi.fn(),
  _listeners: new Map() // 存储事件监听器
}

describe('核心服务集成测试', () => {
  let graph
  let graphService
  let previewLineService
  let layoutService
  let eventService
  let stateService

  beforeEach(async () => {
    // 使用 Mock 图实例
    graph = mockGraph

    // 创建服务实例
    graphService = createGraphService(mockGraph)
    previewLineService = createPreviewLineService(mockGraph)
    layoutService = createLayoutService(mockGraph)
    eventService = createEventService(mockGraph)
    stateService = createStateService(mockGraph)
  })

  afterEach(() => {
    // 清理服务
    if (stateService && stateService.destroy) stateService.destroy()
    if (eventService && eventService.destroy) eventService.destroy()
    if (layoutService && layoutService.destroy) layoutService.destroy()
    if (previewLineService && previewLineService.destroy) previewLineService.destroy()
    if (graphService && graphService.destroy) graphService.destroy()
    
    // 重置 Mock
    vi.clearAllMocks()
  })

  describe('服务初始化集成', () => {
    it('应该能够成功初始化所有服务', () => {
      expect(graphService).toBeDefined()
      expect(previewLineService).toBeDefined()
      expect(layoutService).toBeDefined()
      expect(eventService).toBeDefined()
      expect(stateService).toBeDefined()
    })

    it('应该能够获取所有服务的状态', () => {
      const graphStatus = graphService.getStatus()
      const previewStatus = previewLineService.getStatus()
      const layoutStatus = layoutService.getStatus()
      const eventStatus = eventService.getStatus()
      const stateStatus = stateService.getStatus()

      expect(graphStatus.initialized).toBe(true)
      expect(previewStatus.initialized).toBe(true)
      expect(layoutStatus.initialized).toBe(true)
      expect(eventStatus.isEnabled).toBe(true)
      expect(stateStatus.initialized).toBe(true)
    })
  })

  describe('图形操作与状态管理集成', () => {
    it('应该能够添加节点并同步状态', async () => {
      // 监听状态变更
      let stateChanged = false
      stateService.subscribe('nodes', () => {
        stateChanged = true
      })

      // 添加节点
      const nodeData = {
        id: 'test-node-1',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        label: '测试节点'
      }

      const node = await graphService.addNode(nodeData)
      
      // 等待状态同步
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(node).toBeDefined()
      expect(stateChanged).toBe(true)
      
      // 验证状态中的节点数据
      const nodesState = stateService.getState('nodes')
      expect(nodesState.has('test-node-1')).toBe(true)
    })

    it('应该能够添加连线并触发预览线清理', async () => {
      // 先添加两个节点
      const sourceNode = await graphService.addNode({
        id: 'source-node',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        label: '源节点'
      })

      const targetNode = await graphService.addNode({
        id: 'target-node',
        x: 300,
        y: 100,
        width: 120,
        height: 60,
        label: '目标节点'
      })

      // 创建预览线
      await previewLineService.createPreviewLine('source-node', 'target-node')
      
      // 验证预览线存在
      let previewLines = previewLineService.getPreviewLines()
      expect(previewLines.length).toBeGreaterThan(0)

      // 添加实际连线
      const edge = await graphService.addEdge({
        source: 'source-node',
        target: 'target-node',
        label: '测试连线'
      })

      // 等待预览线清理
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(edge).toBeDefined()
      
      // 验证预览线被清理
      previewLines = previewLineService.getPreviewLines()
      expect(previewLines.length).toBe(0)
    })
  })

  describe('布局与状态集成', () => {
    it('应该能够执行布局并更新节点位置状态', async () => {
      // 添加多个节点
      const nodes = []
      for (let i = 0; i < 3; i++) {
        const node = await graphService.addNode({
          id: `node-${i}`,
          x: 100 + i * 50,
          y: 100,
          width: 120,
          height: 60,
          label: `节点${i}`
        })
        nodes.push(node)
      }

      // 添加连线
      await graphService.addEdge({
        source: 'node-0',
        target: 'node-1'
      })
      await graphService.addEdge({
        source: 'node-1',
        target: 'node-2'
      })

      // 监听位置状态变更
      let positionChanged = false
      stateService.subscribe('nodePositions', () => {
        positionChanged = true
      })

      // 执行层次布局
      const result = await layoutService.executeHierarchicalLayout()
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(result.success).toBe(true)
      expect(positionChanged).toBe(true)
      
      // 验证节点位置状态
      const positionsState = stateService.getState('nodePositions')
      expect(positionsState.size).toBe(3)
    })

    it('应该能够执行自动布局并保持状态一致性', async () => {
      // 添加节点和连线
      await graphService.addNode({ id: 'A', x: 0, y: 0, width: 100, height: 50 })
      await graphService.addNode({ id: 'B', x: 200, y: 0, width: 100, height: 50 })
      await graphService.addNode({ id: 'C', x: 100, y: 100, width: 100, height: 50 })
      
      await graphService.addEdge({ source: 'A', target: 'B' })
      await graphService.addEdge({ source: 'B', target: 'C' })

      // 启用自动布局
      layoutService.enableAutoLayout()
      
      // 等待自动布局执行
      await new Promise(resolve => setTimeout(resolve, 300))

      // 验证布局状态
      const layoutState = stateService.getState('layout')
      expect(layoutState).toBeDefined()
      
      // 验证节点位置已更新
      const positionsState = stateService.getState('nodePositions')
      expect(positionsState.size).toBe(3)
    })
  })

  describe('事件处理与服务协作', () => {
    it('应该能够处理节点选择事件并更新状态', async () => {
      // 添加节点
      const node = await graphService.addNode({
        id: 'selectable-node',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        label: '可选择节点'
      })

      // 监听选择状态变更
      let selectionChanged = false
      stateService.subscribe('selection', (newState) => {
        if (newState.selectedNodes.includes('selectable-node')) {
          selectionChanged = true
        }
      })

      // 选择节点
      await graphService.selectNode('selectable-node')
      
      // 等待事件处理
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(selectionChanged).toBe(true)
      
      // 验证选择状态
      const selectionState = stateService.getState('selection')
      expect(selectionState.selectedNodes).toContain('selectable-node')
    })

    it('应该能够处理拖拽事件并触发预览线', async () => {
      // 添加两个节点
      await graphService.addNode({
        id: 'drag-source',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        label: '拖拽源'
      })

      await graphService.addNode({
        id: 'drag-target',
        x: 300,
        y: 100,
        width: 120,
        height: 60,
        label: '拖拽目标'
      })

      // 监听预览线创建
      let previewLineCreated = false
      eventService.on('preview:line:created', () => {
        previewLineCreated = true
      })

      // 模拟连接拖拽
      const sourceNode = graph.getCellById('drag-source')
      const targetNode = graph.getCellById('drag-target')
      
      // 触发连接开始事件
      graph.trigger('edge:connect:start', { 
        sourceCell: sourceNode,
        sourcePort: 'out'
      })

      // 触发连接移动事件（模拟拖拽到目标节点）
      graph.trigger('edge:connect:move', {
        sourceCell: sourceNode,
        targetCell: targetNode,
        targetPort: 'in'
      })

      // 等待事件处理
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证预览线是否创建
      const previewLines = previewLineService.getPreviewLines()
      expect(previewLines.length).toBeGreaterThan(0)
    })
  })

  describe('状态持久化与恢复', () => {
    it('应该能够创建状态快照并恢复', async () => {
      // 添加一些数据
      await graphService.addNode({
        id: 'snapshot-node',
        x: 150,
        y: 150,
        width: 120,
        height: 60,
        label: '快照节点'
      })

      // 设置一些状态
      stateService.setState(StateType.ZOOM, { scale: 1.5, center: { x: 400, y: 300 } })
      stateService.setState(StateType.USER_PREFERENCES, { theme: 'dark', autoSave: false })

      // 创建快照
      const snapshotId = stateService.createSnapshot('测试快照')
      expect(snapshotId).toBeDefined()

      // 修改状态
      stateService.setState(StateType.ZOOM, { scale: 2.0, center: { x: 0, y: 0 } })
      stateService.setState(StateType.USER_PREFERENCES, { theme: 'light', autoSave: true })

      // 验证状态已改变
      let zoomState = stateService.getState(StateType.ZOOM)
      expect(zoomState.scale).toBe(2.0)

      // 恢复快照
      const restored = stateService.restoreSnapshot(snapshotId)
      expect(restored).toBe(true)

      // 验证状态已恢复
      zoomState = stateService.getState(StateType.ZOOM)
      expect(zoomState.scale).toBe(1.5)
      
      const prefsState = stateService.getState(StateType.USER_PREFERENCES)
      expect(prefsState.theme).toBe('dark')
    })
  })

  describe('性能和错误处理', () => {
    it('应该能够处理大量节点的批量操作', async () => {
      const nodeCount = 50
      const nodes = []

      // 使用批量操作添加节点
      await stateService.batch(async () => {
        for (let i = 0; i < nodeCount; i++) {
          const node = await graphService.addNode({
            id: `batch-node-${i}`,
            x: (i % 10) * 100,
            y: Math.floor(i / 10) * 80,
            width: 80,
            height: 40,
            label: `N${i}`
          })
          nodes.push(node)
        }
      })

      expect(nodes.length).toBe(nodeCount)
      
      // 验证状态中的节点数量
      const nodesState = stateService.getState(StateType.NODES)
      expect(nodesState.size).toBe(nodeCount)
    })

    it('应该能够优雅处理服务错误', async () => {
      // 测试无效节点ID的错误处理
      const result = await graphService.selectNode('non-existent-node')
      expect(result).toBe(false)

      // 测试无效布局参数的错误处理
      const layoutResult = await layoutService.executeHierarchicalLayout({
        invalidParam: 'invalid'
      })
      expect(layoutResult.success).toBe(true) // 应该忽略无效参数继续执行

      // 验证错误统计
      const graphStatus = graphService.getStatus()
      const layoutStatus = layoutService.getStatus()
      
      expect(graphStatus.stats.errors).toBeGreaterThan(0)
    })
  })

  describe('服务生命周期管理', () => {
    it('应该能够正确销毁所有服务', () => {
      // 获取初始状态
      const initialGraphStatus = graphService.getStatus()
      const initialEventStatus = eventService.getStatus()
      const initialStateStatus = stateService.getStatus()

      expect(initialGraphStatus.initialized).toBe(true)
      expect(initialEventStatus.isEnabled).toBe(true)
      expect(initialStateStatus.initialized).toBe(true)

      // 销毁服务
      stateService.destroy()
      eventService.destroy()
      layoutService.destroy()
      previewLineService.destroy()
      graphService.destroy()

      // 验证服务已销毁（通过检查是否抛出错误或返回默认值）
      expect(() => {
        stateService.getState(StateType.NODES)
      }).toThrow()
    })

    it('应该能够重新初始化服务', () => {
      // 销毁现有服务
      stateService.destroy()
      eventService.destroy()
      layoutService.destroy()
      previewLineService.destroy()
      graphService.destroy()

      // 重新初始化服务
      graphService = createGraphService(graph)
      previewLineService = createPreviewLineService(graph)
      layoutService = createLayoutService(graph)
      eventService = createEventService(graph)
      stateService = createStateService(graph)

      // 验证服务重新初始化成功
      expect(graphService.getStatus().initialized).toBe(true)
      expect(previewLineService.getStatus().initialized).toBe(true)
      expect(layoutService.getStatus().initialized).toBe(true)
      expect(eventService.getStatus().isEnabled).toBe(true)
      expect(stateService.getStatus().initialized).toBe(true)
    })
  })

  describe('服务间数据流', () => {
    it('应该能够维护服务间的数据一致性', async () => {
      // 添加节点
      const node = await graphService.addNode({
        id: 'consistency-node',
        x: 200,
        y: 200,
        width: 120,
        height: 60,
        label: '一致性测试节点'
      })

      // 验证图服务中的节点
      const graphNode = graphService.getNode('consistency-node')
      expect(graphNode).toBeDefined()

      // 验证状态服务中的节点
      const nodesState = stateService.getState(StateType.NODES)
      expect(nodesState.has('consistency-node')).toBe(true)

      // 移动节点
      await graphService.moveNode('consistency-node', { x: 300, y: 250 })

      // 验证位置状态同步
      const positionsState = stateService.getState(StateType.NODE_POSITIONS)
      const nodePosition = positionsState.get('consistency-node')
      expect(nodePosition.x).toBe(300)
      expect(nodePosition.y).toBe(250)

      // 删除节点
      await graphService.removeNode('consistency-node')

      // 验证节点从所有状态中移除
      const updatedNodesState = stateService.getState(StateType.NODES)
      const updatedPositionsState = stateService.getState(StateType.NODE_POSITIONS)
      
      expect(updatedNodesState.has('consistency-node')).toBe(false)
      expect(updatedPositionsState.has('consistency-node')).toBe(false)
    })
  })
})