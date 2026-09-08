/**
 * 预览线转换为连接线后自动删除测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock 图形实例
class MockGraph {
  constructor() {
    this.nodes = new Map()
    this.edges = new Map()
    this.eventListeners = new Map()
  }

  addNode(config) {
    const node = {
      id: config.id,
      getData: () => config.data || {},
      ...config
    }
    this.nodes.set(config.id, node)
    return node
  }

  addEdge(config) {
    const edge = {
      id: config.id,
      getSourceCellId: () => config.source,
      getTargetCellId: () => config.target,
      getData: () => config.data || {},
      ...config
    }
    this.edges.set(config.id, edge)
    
    // 触发 edge:added 事件
    this.emit('edge:added', { edge })
    
    return edge
  }

  removeCell(edge) {
    if (typeof edge === 'string') {
      this.edges.delete(edge)
    } else {
      this.edges.delete(edge.id)
    }
  }

  getEdges() {
    return Array.from(this.edges.values())
  }

  getCellById(id) {
    return this.nodes.get(id) || this.edges.get(id)
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }
}

// Mock EdgeOverlapManager
class MockEdgeOverlapManager {
  constructor(graph) {
    this.graph = graph
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.graph.on('edge:added', ({ edge }) => {
      this.handleEdgeAdded(edge)
    })
  }

  handleEdgeAdded(edge) {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    const edgeData = edge.getData() || {}

    // 跳过预览线
    if (edgeData.isPreview || edge.id.includes('preview')) {
      return
    }

    // 清理相关预览线
    this.cleanupRelatedPreviewLines(sourceId, targetId, edgeData)
  }

  cleanupRelatedPreviewLines(sourceId, targetId, edgeData) {
    const allEdges = this.graph.getEdges() || []
    const previewLinesToRemove = []

    allEdges.forEach(edge => {
      const edgeSourceId = edge.getSourceCellId()
      const previewEdgeData = edge.getData() || {}

      const isPreviewLine = previewEdgeData.isPreview || 
                           edge.id.includes('preview') || 
                           edge.id.includes('unified_preview')

      if (isPreviewLine && edgeSourceId === sourceId) {
        // 如果连接线有分支ID，只删除相同分支的预览线
        if (edgeData.branchId && previewEdgeData.branchId === edgeData.branchId) {
          previewLinesToRemove.push(edge)
        } 
        // 如果连接线没有分支ID，删除所有来自同一源节点的预览线
        else if (!edgeData.branchId && !previewEdgeData.branchId) {
          previewLinesToRemove.push(edge)
        }
      }
    })

    // 删除找到的预览线
    previewLinesToRemove.forEach(previewEdge => {
      this.graph.removeCell(previewEdge)
    })
  }
}

describe('预览线转换为连接线后自动删除测试', () => {
  let mockGraph
  let edgeOverlapManager

  beforeEach(() => {
    mockGraph = new MockGraph()
    edgeOverlapManager = new MockEdgeOverlapManager(mockGraph)
  })

  afterEach(() => {
    mockGraph = null
    edgeOverlapManager = null
  })

  it('应该在创建连接线后自动删除对应的预览线', () => {
    // 创建源节点和目标节点
    const sourceNode = mockGraph.addNode({
      id: 'source-node',
      data: { type: 'start', isConfigured: true }
    })

    const targetNode = mockGraph.addNode({
      id: 'target-node',
      data: { type: 'process', isConfigured: true }
    })

    // 创建预览线
    const previewLine = mockGraph.addEdge({
      id: 'preview-line-1',
      source: 'source-node',
      target: null,
      data: { isPreview: true }
    })

    // 验证预览线已创建
    expect(mockGraph.edges.has('preview-line-1')).toBe(true)

    // 创建连接线（这应该触发预览线删除）
    const connection = mockGraph.addEdge({
      id: 'connection-1',
      source: 'source-node',
      target: 'target-node',
      data: { isPreview: false }
    })

    // 验证连接线已创建
    expect(mockGraph.edges.has('connection-1')).toBe(true)

    // 验证预览线已被删除
    expect(mockGraph.edges.has('preview-line-1')).toBe(false)
  })

  it('应该在创建分支连接线后只删除对应分支的预览线', () => {
    // 创建源节点和目标节点
    mockGraph.addNode({
      id: 'source-node',
      data: { type: 'branch', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'target-node',
      data: { type: 'process', isConfigured: true }
    })

    // 创建两个不同分支的预览线
    mockGraph.addEdge({
      id: 'preview-branch-1',
      source: 'source-node',
      target: null,
      data: { isPreview: true, branchId: 'branch-1' }
    })

    mockGraph.addEdge({
      id: 'preview-branch-2',
      source: 'source-node',
      target: null,
      data: { isPreview: true, branchId: 'branch-2' }
    })

    // 验证两个预览线都已创建
    expect(mockGraph.edges.has('preview-branch-1')).toBe(true)
    expect(mockGraph.edges.has('preview-branch-2')).toBe(true)

    // 创建分支1的连接线
    mockGraph.addEdge({
      id: 'connection-branch-1',
      source: 'source-node',
      target: 'target-node',
      data: { isPreview: false, branchId: 'branch-1' }
    })

    // 验证只有分支1的预览线被删除
    expect(mockGraph.edges.has('preview-branch-1')).toBe(false)
    expect(mockGraph.edges.has('preview-branch-2')).toBe(true)
  })

  it('应该通过ID识别预览线并删除', () => {
    // 创建节点
    mockGraph.addNode({
      id: 'source-node',
      data: { type: 'start', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'target-node',
      data: { type: 'process', isConfigured: true }
    })

    // 创建通过ID识别的预览线
    mockGraph.addEdge({
      id: 'unified_preview_123',
      source: 'source-node',
      target: null,
      data: {}
    })

    // 验证预览线已创建
    expect(mockGraph.edges.has('unified_preview_123')).toBe(true)

    // 创建连接线
    mockGraph.addEdge({
      id: 'connection-1',
      source: 'source-node',
      target: 'target-node',
      data: { isPreview: false }
    })

    // 验证预览线已被删除
    expect(mockGraph.edges.has('unified_preview_123')).toBe(false)
  })

  it('不应该删除其他节点的预览线', () => {
    // 创建多个节点
    mockGraph.addNode({
      id: 'source-node-1',
      data: { type: 'start', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'source-node-2',
      data: { type: 'start', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'target-node',
      data: { type: 'process', isConfigured: true }
    })

    // 创建两个不同源节点的预览线
    mockGraph.addEdge({
      id: 'preview-1',
      source: 'source-node-1',
      target: null,
      data: { isPreview: true }
    })

    mockGraph.addEdge({
      id: 'preview-2',
      source: 'source-node-2',
      target: null,
      data: { isPreview: true }
    })

    // 验证两个预览线都已创建
    expect(mockGraph.edges.has('preview-1')).toBe(true)
    expect(mockGraph.edges.has('preview-2')).toBe(true)

    // 创建源节点1的连接线
    mockGraph.addEdge({
      id: 'connection-1',
      source: 'source-node-1',
      target: 'target-node',
      data: { isPreview: false }
    })

    // 验证只有源节点1的预览线被删除
    expect(mockGraph.edges.has('preview-1')).toBe(false)
    expect(mockGraph.edges.has('preview-2')).toBe(true)
  })

  it('不应该删除连接线', () => {
    // 创建节点
    mockGraph.addNode({
      id: 'source-node',
      data: { type: 'start', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'target-node-1',
      data: { type: 'process', isConfigured: true }
    })

    mockGraph.addNode({
      id: 'target-node-2',
      data: { type: 'process', isConfigured: true }
    })

    // 创建第一个连接线
    mockGraph.addEdge({
      id: 'connection-1',
      source: 'source-node',
      target: 'target-node-1',
      data: { isPreview: false }
    })

    // 验证第一个连接线已创建
    expect(mockGraph.edges.has('connection-1')).toBe(true)

    // 创建第二个连接线
    mockGraph.addEdge({
      id: 'connection-2',
      source: 'source-node',
      target: 'target-node-2',
      data: { isPreview: false }
    })

    // 验证两个连接线都存在
    expect(mockGraph.edges.has('connection-1')).toBe(true)
    expect(mockGraph.edges.has('connection-2')).toBe(true)
  })
})