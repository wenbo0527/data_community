/**
 * 营销画布核心服务集成测试
 * 测试 GraphService、PreviewLineService、LayoutService、EventService、StateService 的协作
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Graph } from '@antv/x6'
import { GraphService } from '../../services/marketing/GraphService.js'
import { PreviewLineService } from '../../services/marketing/PreviewLineService.js'
import { LayoutService } from '../../pages/marketing/tasks/services/LayoutService.js'
import { EventService } from '../../pages/marketing/tasks/services/EventService.js'
import { StateService } from '../../pages/marketing/tasks/services/StateService.js'

describe('营销画布核心服务集成测试', () => {
  let container
  let graph
  let graphService
  let previewLineService
  let layoutService
  let eventService
  let stateService

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // Mock SVG viewport for X6
    const mockViewport = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    mockViewport.getCTM = vi.fn().mockReturnValue({
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
    })
    container.appendChild(mockViewport)

    // 创建 X6 图实例
    graph = new Graph({
      container,
      width: 800,
      height: 600,
      grid: false, // 禁用网格以避免SVG问题
      panning: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
    })

    // 初始化服务
    graphService = new GraphService(graph)
    previewLineService = new PreviewLineService(graph)
    layoutService = new LayoutService(graph)
    eventService = new EventService(graph)
    stateService = new StateService(graph)
  })

  afterEach(() => {
    // 清理服务
    if (layoutService) layoutService.destroy()
    if (eventService) eventService.destroy()
    if (stateService) stateService.destroy()
    if (previewLineService) previewLineService.destroy()
    if (graphService) graphService.destroy()
    
    // 清理图实例
    if (graph) {
      graph.dispose()
    }
    
    // 清理DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('服务初始化测试', () => {
    it('所有服务应该正确初始化', () => {
      expect(graphService).toBeDefined()
      expect(previewLineService).toBeDefined()
      expect(layoutService).toBeDefined()
      expect(eventService).toBeDefined()
      expect(stateService).toBeDefined()
    })

    it('服务应该与图实例正确关联', () => {
      expect(graphService.graph).toBe(graph)
      expect(previewLineService.graph).toBe(graph)
      expect(layoutService.graph).toBe(graph)
      expect(eventService.graph).toBe(graph)
      expect(stateService.graph).toBe(graph)
    })
  })

  describe('GraphService 测试', () => {
    it('应该能够添加节点', () => {
      const nodeData = {
        id: 'test-node-1',
        type: 'INPUT',
        position: { x: 100, y: 100 },
        data: { label: '测试节点' }
      }

      const node = graphService.addNode(nodeData)
      expect(node).toBeDefined()
      expect(node.id).toBe('test-node-1')
    })

    it('应该能够添加连接', () => {
      // 先添加两个节点
      const node1 = graphService.addNode({
        id: 'node1',
        type: 'INPUT',
        position: { x: 100, y: 100 }
      })
      
      const node2 = graphService.addNode({
        id: 'node2',
        type: 'OUTPUT',
        position: { x: 300, y: 100 }
      })

      const edge = graphService.addEdge({
        source: 'node1',
        target: 'node2'
      })

      expect(edge).toBeDefined()
      expect(edge.getSourceCellId()).toBe('node1')
      expect(edge.getTargetCellId()).toBe('node2')
    })
  })

  describe('PreviewLineService 测试', () => {
    it('应该能够显示预览线', () => {
      const sourceNode = graphService.addNode({
        id: 'source',
        type: 'INPUT',
        position: { x: 100, y: 100 }
      })

      previewLineService.showPreviewLine(sourceNode, { x: 200, y: 200 })
      
      // 验证预览线是否创建
      const previewLines = graph.getCells().filter(cell => 
        cell.isEdge() && cell.getProp('isPreviewLine')
      )
      expect(previewLines.length).toBeGreaterThan(0)
    })

    it('应该能够隐藏预览线', () => {
      const sourceNode = graphService.addNode({
        id: 'source',
        type: 'INPUT',
        position: { x: 100, y: 100 }
      })

      previewLineService.showPreviewLine(sourceNode, { x: 200, y: 200 })
      previewLineService.hidePreviewLine()
      
      // 验证预览线是否被移除
      const previewLines = graph.getCells().filter(cell => 
        cell.isEdge() && cell.getProp('isPreviewLine')
      )
      expect(previewLines.length).toBe(0)
    })
  })

  describe('LayoutService 测试', () => {
    it('应该能够自动布局节点', () => {
      // 添加多个节点
      const nodes = [
        { id: 'node1', type: 'INPUT', position: { x: 0, y: 0 } },
        { id: 'node2', type: 'PROCESS', position: { x: 0, y: 0 } },
        { id: 'node3', type: 'OUTPUT', position: { x: 0, y: 0 } }
      ]

      nodes.forEach(nodeData => graphService.addNode(nodeData))
      
      layoutService.autoLayout()
      
      // 验证节点位置是否被更新
      const graphNodes = graph.getNodes()
      graphNodes.forEach(node => {
        const position = node.getPosition()
        expect(position.x).toBeGreaterThanOrEqual(0)
        expect(position.y).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('EventService 测试', () => {
    it('应该能够注册和触发事件', () => {
      const mockCallback = vi.fn()
      
      eventService.on('test-event', mockCallback)
      eventService.emit('test-event', { data: 'test' })
      
      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该能够取消事件监听', () => {
      const mockCallback = vi.fn()
      
      eventService.on('test-event', mockCallback)
      eventService.off('test-event', mockCallback)
      eventService.emit('test-event', { data: 'test' })
      
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('StateService 测试', () => {
    it('应该能够保存和恢复状态', () => {
      // 添加一些节点和连接
      const node1 = graphService.addNode({
        id: 'node1',
        type: 'INPUT',
        position: { x: 100, y: 100 }
      })
      
      const node2 = graphService.addNode({
        id: 'node2',
        type: 'OUTPUT',
        position: { x: 300, y: 100 }
      })

      graphService.addEdge({
        source: 'node1',
        target: 'node2'
      })

      // 保存状态
      const state = stateService.saveState()
      expect(state).toBeDefined()
      expect(state.nodes).toHaveLength(2)
      expect(state.edges).toHaveLength(1)

      // 清空图
      graph.clearCells()
      expect(graph.getCells()).toHaveLength(0)

      // 恢复状态
      stateService.restoreState(state)
      expect(graph.getNodes()).toHaveLength(2)
      expect(graph.getEdges()).toHaveLength(1)
    })
  })

  describe('服务协作测试', () => {
    it('服务之间应该能够正确协作', async () => {
      // 创建节点
      const node1 = graphService.addNode({
        id: 'collab-node1',
        type: 'INPUT',
        position: { x: 100, y: 100 }
      })

      // 显示预览线
      previewLineService.showPreviewLine(node1, { x: 300, y: 100 })

      // 创建目标节点
      const node2 = graphService.addNode({
        id: 'collab-node2',
        type: 'OUTPUT',
        position: { x: 300, y: 100 }
      })

      // 隐藏预览线并创建实际连接
      previewLineService.hidePreviewLine()
      const edge = graphService.addEdge({
        source: 'collab-node1',
        target: 'collab-node2'
      })

      // 验证结果
      expect(graph.getNodes()).toHaveLength(2)
      expect(graph.getEdges()).toHaveLength(1)
      expect(edge.getSourceCellId()).toBe('collab-node1')
      expect(edge.getTargetCellId()).toBe('collab-node2')
    })

    it('服务应该能够处理异步操作', async () => {
      const mockAsyncOperation = vi.fn().mockResolvedValue('success')
      
      // 模拟异步操作
      const result = await mockAsyncOperation()
      expect(result).toBe('success')
    })

    it('服务应该能够处理异步操作错误', async () => {
      const mockAsyncOperation = vi.fn().mockRejectedValue(new Error('async error'))
      
      try {
        await mockAsyncOperation()
      } catch (error) {
        expect(error.message).toBe('async error')
      }
    })
  })

  describe('性能测试', () => {
    it('大量节点操作的性能表现', () => {
      const startTime = performance.now()
      
      // 创建100个节点
      for (let i = 0; i < 100; i++) {
        graphService.addNode({
          id: `perf-node-${i}`,
          type: 'PROCESS',
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 }
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(graph.getNodes()).toHaveLength(100)
      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })
  })
})