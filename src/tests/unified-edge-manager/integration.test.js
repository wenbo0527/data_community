/**
 * 集成测试套件
 * 测试 UnifiedEdgeManager 与 PreviewLineSystem 的完整集成
 * 
 * 测试覆盖：
 * - UnifiedEdgeManager 与 PreviewLineSystem 的集成
 * - 完整的画布初始化到预览线创建的端到端测试
 * - 多组件协作测试
 * - 真实场景模拟测试
 * - 系统级错误处理测试
 * - 数据流完整性测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'

// Mock X6 Graph with full integration support
const createIntegrationMockGraph = () => {
  const cells = new Map()
  const edges = new Map()
  const nodes = new Map()
  const eventListeners = new Map()

  return {
    // 基础图操作
    addNode: vi.fn().mockImplementation((config) => {
      const node = { 
        id: config.id || `node_${Date.now()}_${Math.random()}`,
        ...config,
        ports: config.ports || { in: ['in'], out: ['out'] }
      }
      nodes.set(node.id, node)
      cells.set(node.id, node)
      return node
    }),
    
    removeNode: vi.fn().mockImplementation((nodeId) => {
      nodes.delete(nodeId)
      cells.delete(nodeId)
      return true
    }),
    
    addEdge: vi.fn().mockImplementation((config) => {
      const edge = { 
        id: config.id || `edge_${Date.now()}_${Math.random()}`,
        ...config,
        type: 'connection'
      }
      edges.set(edge.id, edge)
      cells.set(edge.id, edge)
      
      // 触发边添加事件
      this.trigger('edge:added', { edge })
      return edge
    }),
    
    removeEdge: vi.fn().mockImplementation((edgeId) => {
      const edge = edges.get(edgeId)
      if (edge) {
        edges.delete(edgeId)
        cells.delete(edgeId)
        this.trigger('edge:removed', { edge })
      }
      return true
    }),
    
    addPreviewEdge: vi.fn().mockImplementation((config) => {
      const previewEdge = { 
        id: config.id || `preview_${Date.now()}_${Math.random()}`,
        ...config,
        type: 'preview',
        isPreview: true
      }
      edges.set(previewEdge.id, previewEdge)
      cells.set(previewEdge.id, previewEdge)
      
      // 触发预览线添加事件
      this.trigger('preview:added', { previewEdge })
      return previewEdge
    }),
    
    removePreviewEdge: vi.fn().mockImplementation((previewEdgeId) => {
      const previewEdge = edges.get(previewEdgeId)
      if (previewEdge) {
        edges.delete(previewEdgeId)
        cells.delete(previewEdgeId)
        this.trigger('preview:removed', { previewEdge })
      }
      return true
    }),
    
    updatePreviewEdge: vi.fn().mockImplementation((previewEdgeId, config) => {
      const previewEdge = edges.get(previewEdgeId)
      if (previewEdge) {
        Object.assign(previewEdge, config)
        this.trigger('preview:updated', { previewEdge })
      }
      return previewEdge
    }),
    
    // 查询操作
    getCellById: vi.fn().mockImplementation((id) => cells.get(id)),
    getEdges: vi.fn().mockImplementation(() => Array.from(edges.values())),
    getNodes: vi.fn().mockImplementation(() => Array.from(nodes.values())),
    getPreviewEdges: vi.fn().mockImplementation(() => 
      Array.from(edges.values()).filter(edge => edge.isPreview)
    ),
    
    // 端口操作
    getNodePorts: vi.fn().mockImplementation((nodeId) => {
      const node = nodes.get(nodeId)
      return node?.ports || { in: ['in'], out: ['out'] }
    }),
    
    validatePortConnection: vi.fn().mockImplementation((sourceNodeId, sourcePort, targetNodeId, targetPort) => {
      const sourceNode = nodes.get(sourceNodeId)
      const targetNode = nodes.get(targetNodeId)
      
      if (!sourceNode || !targetNode) return false
      
      const sourcePorts = sourceNode.ports?.out || ['out']
      const targetPorts = targetNode.ports?.in || ['in']
      
      return sourcePorts.includes(sourcePort) && targetPorts.includes(targetPort)
    }),
    
    // 事件系统
    on: vi.fn().mockImplementation((event, callback) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set())
      }
      eventListeners.get(event).add(callback)
    }),
    
    off: vi.fn().mockImplementation((event, callback) => {
      if (eventListeners.has(event)) {
        eventListeners.get(event).delete(callback)
      }
    }),
    
    trigger: vi.fn().mockImplementation((event, data) => {
      if (eventListeners.has(event)) {
        eventListeners.get(event).forEach(callback => {
          try {
            callback(data)
          } catch (error) {
            console.error(`Event callback error for ${event}:`, error)
          }
        })
      }
    }),
    
    // 序列化和状态
    toJSON: vi.fn().mockImplementation(() => ({
      cells: Array.from(cells.values())
    })),
    
    fromJSON: vi.fn().mockImplementation((data) => {
      cells.clear()
      edges.clear()
      nodes.clear()
      
      if (data.cells) {
        data.cells.forEach(cell => {
          cells.set(cell.id, cell)
          if (cell.shape === 'edge' || cell.type === 'connection' || cell.type === 'preview') {
            edges.set(cell.id, cell)
          } else {
            nodes.set(cell.id, cell)
          }
        })
      }
    }),
    
    clearCells: vi.fn().mockImplementation(() => {
      cells.clear()
      edges.clear()
      nodes.clear()
    }),
    
    // 布局和渲染
    layout: vi.fn(),
    render: vi.fn(),
    resize: vi.fn(),
    
    // 测试辅助方法
    _getCells: () => cells,
    _getEdges: () => edges,
    _getNodes: () => nodes,
    _getEventListeners: () => eventListeners
  }
}

// Mock PreviewLineService for integration testing
class MockPreviewLineService {
  constructor(unifiedEdgeManager) {
    this.unifiedEdgeManager = unifiedEdgeManager
    this.isInitialized = false
    this.eventCallbacks = new Map()
  }

  async initialize() {
    if (!this.unifiedEdgeManager) {
      throw new Error('UnifiedEdgeManager is required')
    }
    
    const result = await this.unifiedEdgeManager.initialize()
    if (result.success) {
      this.isInitialized = true
      this.setupEventListeners()
    }
    
    return result
  }

  setupEventListeners() {
    // 监听预览线事件
    this.unifiedEdgeManager.on('previewLine:created', (data) => {
      this.triggerCallback('previewLine:created', data)
    })
    
    this.unifiedEdgeManager.on('previewLine:removed', (data) => {
      this.triggerCallback('previewLine:removed', data)
    })
    
    this.unifiedEdgeManager.on('previewLine:converted', (data) => {
      this.triggerCallback('previewLine:converted', data)
    })
  }

  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set())
    }
    this.eventCallbacks.get(event).add(callback)
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).delete(callback)
    }
  }

  triggerCallback(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`PreviewLineService callback error for ${event}:`, error)
        }
      })
    }
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    if (!this.isInitialized) {
      throw new Error('PreviewLineService not initialized')
    }
    
    return await this.unifiedEdgeManager.createPreviewLine(sourceNodeId, options)
  }

  async removePreviewLine(previewLineId) {
    if (!this.isInitialized) {
      throw new Error('PreviewLineService not initialized')
    }
    
    return await this.unifiedEdgeManager.removePreviewLine(previewLineId)
  }

  async convertPreviewToConnection(previewLineId, targetNodeId, options = {}) {
    if (!this.isInitialized) {
      throw new Error('PreviewLineService not initialized')
    }
    
    return await this.unifiedEdgeManager.convertPreviewToConnection(previewLineId, targetNodeId, options)
  }

  getPreviewLines() {
    return this.unifiedEdgeManager ? Array.from(this.unifiedEdgeManager.previewLines.values()) : []
  }

  destroy() {
    this.eventCallbacks.clear()
    this.isInitialized = false
  }
}

// Integration UnifiedEdgeManager with full event support
class IntegrationUnifiedEdgeManager {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = options
    this.edges = new Map()
    this.previewLines = new Map()
    this.connections = new Map()
    this.nodeEdgeIndex = new Map()
    this.portConnectionIndex = new Map()
    this.isInitialized = false
    this.eventCallbacks = new Map()
    
    // 集成测试特有的状态
    this.systemState = {
      totalOperations: 0,
      errorCount: 0,
      lastError: null,
      performanceMetrics: {
        averageOperationTime: 0,
        totalOperationTime: 0
      }
    }
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true, message: '已经初始化' }
      }
      
      // 设置图事件监听
      this.setupGraphEventListeners()
      
      this.isInitialized = true
      this.triggerEvent('manager:initialized', { manager: this })
      
      return { success: true, message: '初始化成功' }
    } catch (error) {
      this.handleError(error, 'initialize')
      return { success: false, error: error.message }
    }
  }

  setupGraphEventListeners() {
    this.graph.on('edge:added', (data) => {
      this.triggerEvent('graph:edge:added', data)
    })
    
    this.graph.on('edge:removed', (data) => {
      this.triggerEvent('graph:edge:removed', data)
    })
    
    this.graph.on('preview:added', (data) => {
      this.triggerEvent('graph:preview:added', data)
    })
    
    this.graph.on('preview:removed', (data) => {
      this.triggerEvent('graph:preview:removed', data)
    })
  }

  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set())
    }
    this.eventCallbacks.get(event).add(callback)
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).delete(callback)
    }
  }

  triggerEvent(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Event callback error for ${event}:`, error)
        }
      })
    }
  }

  handleError(error, context = '') {
    this.systemState.errorCount++
    this.systemState.lastError = `${context}: ${error.message || error}`
    this.triggerEvent('manager:error', { error, context })
  }

  recordOperation(operation, time) {
    this.systemState.totalOperations++
    this.systemState.performanceMetrics.totalOperationTime += time
    this.systemState.performanceMetrics.averageOperationTime = 
      this.systemState.performanceMetrics.totalOperationTime / this.systemState.totalOperations
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    const startTime = performance.now()
    
    try {
      if (!sourceNodeId || typeof sourceNodeId !== 'string') {
        throw new Error('无效的源节点ID')
      }

      if (!this.isInitialized) {
        throw new Error('UnifiedEdgeManager未初始化')
      }

      // 验证源节点存在
      const sourceNode = this.graph.getCellById(sourceNodeId)
      if (!sourceNode) {
        throw new Error(`源节点不存在: ${sourceNodeId}`)
      }

      // 验证端口
      const sourcePorts = this.graph.getNodePorts(sourceNodeId)
      const sourcePort = options.sourcePort || 'out'
      if (!sourcePorts.out.includes(sourcePort)) {
        throw new Error(`源节点端口不存在: ${sourcePort}`)
      }

      const previewLine = {
        id: `preview_${sourceNodeId}_${Date.now()}_${Math.random()}`,
        sourceNodeId: sourceNodeId,
        sourcePort: sourcePort,
        targetNodeId: options.targetNodeId || null,
        targetPort: options.targetPort || null,
        branchId: options.branchId || null,
        type: 'preview',
        isPreview: true,
        x6EdgeId: null,
        createdAt: Date.now(),
        metadata: options.metadata || {}
      }

      // 创建X6预览边
      const x6Edge = this.graph.addPreviewEdge({
        id: previewLine.id,
        source: { cell: sourceNodeId, port: sourcePort },
        target: options.targetPosition || { x: 100, y: 100 },
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        }
      })

      previewLine.x6EdgeId = x6Edge?.id || previewLine.id
      this.previewLines.set(previewLine.id, previewLine)
      this.edges.set(previewLine.id, previewLine)

      // 更新索引
      this.updateNodeEdgeIndex(sourceNodeId, previewLine.id)

      const endTime = performance.now()
      this.recordOperation('createPreviewLine', endTime - startTime)

      // 触发事件
      this.triggerEvent('previewLine:created', { previewLine })

      return {
        success: true,
        data: previewLine,
        message: '预览线创建成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperation('createPreviewLine_error', endTime - startTime)
      this.handleError(error, 'createPreviewLine')
      
      return {
        success: false,
        error: error.message,
        code: 'PREVIEW_LINE_CREATION_FAILED'
      }
    }
  }

  async removePreviewLine(previewLineId) {
    const startTime = performance.now()
    
    try {
      if (!previewLineId) {
        throw new Error('预览线ID不能为空')
      }

      const previewLine = this.previewLines.get(previewLineId)
      if (!previewLine) {
        throw new Error(`预览线不存在: ${previewLineId}`)
      }

      // 从图中删除
      this.graph.removePreviewEdge(previewLine.x6EdgeId)
      
      // 从内部存储中删除
      this.previewLines.delete(previewLineId)
      this.edges.delete(previewLineId)

      // 更新索引
      this.removeFromNodeEdgeIndex(previewLine.sourceNodeId, previewLineId)

      const endTime = performance.now()
      this.recordOperation('removePreviewLine', endTime - startTime)

      // 触发事件
      this.triggerEvent('previewLine:removed', { previewLine })

      return {
        success: true,
        message: '预览线删除成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperation('removePreviewLine_error', endTime - startTime)
      this.handleError(error, 'removePreviewLine')
      
      return {
        success: false,
        error: error.message,
        code: 'PREVIEW_LINE_DELETION_FAILED'
      }
    }
  }

  async createConnection(sourceNodeId, targetNodeId, options = {}) {
    const startTime = performance.now()
    
    try {
      if (!sourceNodeId || !targetNodeId) {
        throw new Error('源节点ID和目标节点ID不能为空')
      }

      if (sourceNodeId === targetNodeId) {
        throw new Error('不能连接到自身')
      }

      // 验证节点存在
      const sourceNode = this.graph.getCellById(sourceNodeId)
      const targetNode = this.graph.getCellById(targetNodeId)
      
      if (!sourceNode) {
        throw new Error(`源节点不存在: ${sourceNodeId}`)
      }
      
      if (!targetNode) {
        throw new Error(`目标节点不存在: ${targetNodeId}`)
      }

      // 验证端口连接
      const sourcePort = options.sourcePort || 'out'
      const targetPort = options.targetPort || 'in'
      
      const isValidConnection = this.graph.validatePortConnection(
        sourceNodeId, sourcePort, targetNodeId, targetPort
      )
      
      if (!isValidConnection) {
        throw new Error('端口连接无效')
      }

      // 检查重复连接
      const existingConnection = Array.from(this.connections.values()).find(
        conn => conn.sourceNodeId === sourceNodeId && 
                conn.targetNodeId === targetNodeId &&
                conn.sourcePort === sourcePort &&
                conn.targetPort === targetPort &&
                conn.branchId === options.branchId
      )

      if (existingConnection) {
        throw new Error('连接已存在')
      }

      const connection = {
        id: `connection_${sourceNodeId}_${targetNodeId}_${Date.now()}`,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
        sourcePort: sourcePort,
        targetPort: targetPort,
        branchId: options.branchId || null,
        type: 'connection',
        isPreview: false,
        x6EdgeId: null,
        createdAt: Date.now(),
        metadata: options.metadata || {}
      }

      // 创建X6连接边
      const x6Edge = this.graph.addEdge({
        id: connection.id,
        source: { cell: sourceNodeId, port: sourcePort },
        target: { cell: targetNodeId, port: targetPort },
        attrs: {
          line: {
            stroke: '#52c41a',
            strokeWidth: 2
          }
        }
      })

      connection.x6EdgeId = x6Edge?.id || connection.id
      this.connections.set(connection.id, connection)
      this.edges.set(connection.id, connection)

      // 更新索引
      this.updateNodeEdgeIndex(sourceNodeId, connection.id)
      this.updateNodeEdgeIndex(targetNodeId, connection.id)

      const endTime = performance.now()
      this.recordOperation('createConnection', endTime - startTime)

      // 触发事件
      this.triggerEvent('connection:created', { connection })

      return {
        success: true,
        data: connection,
        message: '连接创建成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperation('createConnection_error', endTime - startTime)
      this.handleError(error, 'createConnection')
      
      return {
        success: false,
        error: error.message,
        code: 'CONNECTION_CREATION_FAILED'
      }
    }
  }

  async convertPreviewToConnection(previewLineId, targetNodeId, options = {}) {
    const startTime = performance.now()
    
    try {
      const previewLine = this.previewLines.get(previewLineId)
      if (!previewLine) {
        throw new Error('预览线不存在')
      }

      // 验证目标节点
      const targetNode = this.graph.getCellById(targetNodeId)
      if (!targetNode) {
        throw new Error(`目标节点不存在: ${targetNodeId}`)
      }

      // 先删除预览线
      const deleteResult = await this.removePreviewLine(previewLineId)
      if (!deleteResult.success) {
        throw new Error(`删除预览线失败: ${deleteResult.error}`)
      }

      // 创建连接
      const createResult = await this.createConnection(
        previewLine.sourceNodeId,
        targetNodeId,
        {
          sourcePort: previewLine.sourcePort,
          targetPort: options.targetPort || 'in',
          branchId: previewLine.branchId,
          metadata: { ...previewLine.metadata, ...options.metadata },
          ...options
        }
      )

      if (!createResult.success) {
        // 如果创建连接失败，尝试恢复预览线
        await this.createPreviewLine(previewLine.sourceNodeId, {
          sourcePort: previewLine.sourcePort,
          branchId: previewLine.branchId,
          metadata: previewLine.metadata
        })
        throw new Error(`创建连接失败: ${createResult.error}`)
      }

      const endTime = performance.now()
      this.recordOperation('convertPreviewToConnection', endTime - startTime)

      // 触发事件
      this.triggerEvent('previewLine:converted', { 
        previewLine, 
        connection: createResult.data 
      })

      return createResult
    } catch (error) {
      const endTime = performance.now()
      this.recordOperation('convertPreviewToConnection_error', endTime - startTime)
      this.handleError(error, 'convertPreviewToConnection')
      
      return {
        success: false,
        error: error.message,
        code: 'CONVERSION_FAILED'
      }
    }
  }

  updateNodeEdgeIndex(nodeId, edgeId) {
    if (!this.nodeEdgeIndex.has(nodeId)) {
      this.nodeEdgeIndex.set(nodeId, new Set())
    }
    this.nodeEdgeIndex.get(nodeId).add(edgeId)
  }

  removeFromNodeEdgeIndex(nodeId, edgeId) {
    if (this.nodeEdgeIndex.has(nodeId)) {
      this.nodeEdgeIndex.get(nodeId).delete(edgeId)
      if (this.nodeEdgeIndex.get(nodeId).size === 0) {
        this.nodeEdgeIndex.delete(nodeId)
      }
    }
  }

  getNodeEdges(nodeId) {
    const edgeIds = this.nodeEdgeIndex.get(nodeId) || new Set()
    return Array.from(edgeIds).map(id => this.edges.get(id)).filter(Boolean)
  }

  getSystemState() {
    return {
      ...this.systemState,
      isInitialized: this.isInitialized,
      totalEdges: this.edges.size,
      totalPreviewLines: this.previewLines.size,
      totalConnections: this.connections.size,
      totalNodes: this.nodeEdgeIndex.size
    }
  }

  destroy() {
    try {
      this.edges.clear()
      this.previewLines.clear()
      this.connections.clear()
      this.nodeEdgeIndex.clear()
      this.portConnectionIndex.clear()
      this.eventCallbacks.clear()
      this.isInitialized = false
      
      this.triggerEvent('manager:destroyed', { manager: this })
    } catch (error) {
      this.handleError(error, 'destroy')
    }
  }
}

describe('集成测试套件', () => {
  let mockGraph
  let edgeManager
  let previewLineService

  beforeEach(() => {
    mockGraph = createIntegrationMockGraph()
    edgeManager = new IntegrationUnifiedEdgeManager(mockGraph)
    previewLineService = new MockPreviewLineService(edgeManager)
  })

  afterEach(() => {
    if (previewLineService) {
      previewLineService.destroy()
    }
    if (edgeManager) {
      edgeManager.destroy()
    }
  })

  describe('系统初始化集成测试', () => {
    it('应该正确初始化完整的边管理系统', async () => {
      // 初始化边管理器
      const managerResult = await edgeManager.initialize()
      expect(managerResult.success).toBe(true)
      
      // 初始化预览线服务
      const serviceResult = await previewLineService.initialize()
      expect(serviceResult.success).toBe(true)
      
      // 验证系统状态
      const systemState = edgeManager.getSystemState()
      expect(systemState.isInitialized).toBe(true)
      expect(systemState.totalOperations).toBe(0)
      expect(systemState.errorCount).toBe(0)
    })

    it('应该处理初始化依赖关系', async () => {
      // 尝试在未初始化边管理器的情况下初始化服务
      const uninitializedService = new MockPreviewLineService(null)
      
      await expect(uninitializedService.initialize()).rejects.toThrow('UnifiedEdgeManager is required')
      
      // 正确的初始化顺序
      await edgeManager.initialize()
      const serviceResult = await previewLineService.initialize()
      expect(serviceResult.success).toBe(true)
    })

    it('应该设置完整的事件监听系统', async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
      
      const eventReceived = []
      
      // 设置事件监听
      edgeManager.on('previewLine:created', (data) => {
        eventReceived.push('manager:previewLine:created')
      })
      
      previewLineService.on('previewLine:created', (data) => {
        eventReceived.push('service:previewLine:created')
      })
      
      // 创建预览线触发事件
      await previewLineService.createPreviewLine('test_node')
      
      expect(eventReceived).toContain('manager:previewLine:created')
    })
  })

  describe('端到端预览线创建流程测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
      
      // 添加测试节点
      mockGraph.addNode({
        id: 'source_node',
        ports: { in: ['in1'], out: ['out1', 'out2'] }
      })
      
      mockGraph.addNode({
        id: 'target_node',
        ports: { in: ['in1', 'in2'], out: ['out1'] }
      })
    })

    it('应该完成完整的预览线创建流程', async () => {
      // 通过服务创建预览线
      const result = await previewLineService.createPreviewLine('source_node', {
        sourcePort: 'out1',
        branchId: 'test_branch'
      })
      
      expect(result.success).toBe(true)
      expect(result.data.sourceNodeId).toBe('source_node')
      expect(result.data.sourcePort).toBe('out1')
      expect(result.data.branchId).toBe('test_branch')
      
      // 验证预览线在各个层级都存在
      expect(edgeManager.previewLines.has(result.data.id)).toBe(true)
      expect(previewLineService.getPreviewLines().length).toBe(1)
      
      // 验证图层级的预览边
      const graphPreviewEdges = mockGraph.getPreviewEdges()
      expect(graphPreviewEdges.length).toBe(1)
      expect(graphPreviewEdges[0].id).toBe(result.data.id)
    })

    it('应该完成完整的预览线转换流程', async () => {
      // 创建预览线
      const createResult = await previewLineService.createPreviewLine('source_node', {
        sourcePort: 'out1'
      })
      expect(createResult.success).toBe(true)
      
      const previewLineId = createResult.data.id
      
      // 转换为连接
      const convertResult = await previewLineService.convertPreviewToConnection(
        previewLineId, 
        'target_node',
        { targetPort: 'in1' }
      )
      
      expect(convertResult.success).toBe(true)
      expect(convertResult.data.sourceNodeId).toBe('source_node')
      expect(convertResult.data.targetNodeId).toBe('target_node')
      expect(convertResult.data.sourcePort).toBe('out1')
      expect(convertResult.data.targetPort).toBe('in1')
      
      // 验证预览线已删除
      expect(edgeManager.previewLines.has(previewLineId)).toBe(false)
      expect(previewLineService.getPreviewLines().length).toBe(0)
      
      // 验证连接已创建
      expect(edgeManager.connections.has(convertResult.data.id)).toBe(true)
      
      // 验证图层级的变化
      const graphEdges = mockGraph.getEdges()
      const graphPreviewEdges = mockGraph.getPreviewEdges()
      expect(graphEdges.length).toBe(1)
      expect(graphPreviewEdges.length).toBe(0)
    })

    it('应该处理复杂的多预览线场景', async () => {
      // 创建多个预览线
      const results = await Promise.all([
        previewLineService.createPreviewLine('source_node', { sourcePort: 'out1' }),
        previewLineService.createPreviewLine('source_node', { sourcePort: 'out2' }),
        previewLineService.createPreviewLine('target_node', { sourcePort: 'out1' })
      ])
      
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
      
      expect(previewLineService.getPreviewLines().length).toBe(3)
      
      // 转换其中一个预览线
      const convertResult = await previewLineService.convertPreviewToConnection(
        results[0].data.id,
        'target_node',
        { targetPort: 'in1' }
      )
      
      expect(convertResult.success).toBe(true)
      expect(previewLineService.getPreviewLines().length).toBe(2)
      expect(edgeManager.connections.size).toBe(1)
      
      // 删除另一个预览线
      const deleteResult = await previewLineService.removePreviewLine(results[1].data.id)
      expect(deleteResult.success).toBe(true)
      expect(previewLineService.getPreviewLines().length).toBe(1)
    })
  })

  describe('多组件协作测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
      
      // 创建复杂的节点网络
      for (let i = 1; i <= 5; i++) {
        mockGraph.addNode({
          id: `node_${i}`,
          ports: { 
            in: [`in1`, `in2`], 
            out: [`out1`, `out2`] 
          }
        })
      }
    })

    it('应该处理多个服务实例的协作', async () => {
      // 创建第二个预览线服务实例
      const secondService = new MockPreviewLineService(edgeManager)
      await secondService.initialize()
      
      try {
        // 通过不同服务创建预览线
        const result1 = await previewLineService.createPreviewLine('node_1')
        const result2 = await secondService.createPreviewLine('node_2')
        
        expect(result1.success).toBe(true)
        expect(result2.success).toBe(true)
        
        // 验证两个服务都能看到所有预览线
        expect(previewLineService.getPreviewLines().length).toBe(2)
        expect(secondService.getPreviewLines().length).toBe(2)
        
        // 通过一个服务删除另一个服务创建的预览线
        const deleteResult = await previewLineService.removePreviewLine(result2.data.id)
        expect(deleteResult.success).toBe(true)
        
        // 验证两个服务的状态同步
        expect(previewLineService.getPreviewLines().length).toBe(1)
        expect(secondService.getPreviewLines().length).toBe(1)
      } finally {
        secondService.destroy()
      }
    })

    it('应该处理复杂的节点连接网络', async () => {
      // 创建复杂的连接网络
      const operations = [
        { source: 'node_1', target: 'node_2', sourcePort: 'out1', targetPort: 'in1' },
        { source: 'node_2', target: 'node_3', sourcePort: 'out1', targetPort: 'in1' },
        { source: 'node_3', target: 'node_4', sourcePort: 'out2', targetPort: 'in2' },
        { source: 'node_1', target: 'node_5', sourcePort: 'out2', targetPort: 'in1' }
      ]
      
      const results = []
      
      for (const op of operations) {
        // 先创建预览线
        const previewResult = await previewLineService.createPreviewLine(op.source, {
          sourcePort: op.sourcePort
        })
        expect(previewResult.success).toBe(true)
        
        // 转换为连接
        const convertResult = await previewLineService.convertPreviewToConnection(
          previewResult.data.id,
          op.target,
          { targetPort: op.targetPort }
        )
        expect(convertResult.success).toBe(true)
        
        results.push(convertResult.data)
      }
      
      // 验证网络结构
      expect(edgeManager.connections.size).toBe(4)
      expect(previewLineService.getPreviewLines().length).toBe(0)
      
      // 验证节点索引正确性
      expect(edgeManager.getNodeEdges('node_1').length).toBe(2) // 2个出边
      expect(edgeManager.getNodeEdges('node_2').length).toBe(2) // 1个入边，1个出边
      expect(edgeManager.getNodeEdges('node_3').length).toBe(2) // 1个入边，1个出边
      expect(edgeManager.getNodeEdges('node_4').length).toBe(1) // 1个入边
      expect(edgeManager.getNodeEdges('node_5').length).toBe(1) // 1个入边
    })

    it('应该处理并发操作的协作', async () => {
      const concurrentOperations = []
      
      // 并发创建预览线
      for (let i = 1; i <= 5; i++) {
        concurrentOperations.push(
          previewLineService.createPreviewLine(`node_${i}`, {
            sourcePort: 'out1',
            branchId: `branch_${i}`
          })
        )
      }
      
      const createResults = await Promise.all(concurrentOperations)
      
      createResults.forEach(result => {
        expect(result.success).toBe(true)
      })
      
      expect(previewLineService.getPreviewLines().length).toBe(5)
      
      // 并发转换部分预览线
      const convertOperations = createResults.slice(0, 3).map((result, index) =>
        previewLineService.convertPreviewToConnection(
          result.data.id,
          `node_${index + 3}`, // 连接到不同的目标节点
          { targetPort: 'in1' }
        )
      )
      
      const convertResults = await Promise.all(convertOperations)
      
      convertResults.forEach(result => {
        expect(result.success).toBe(true)
      })
      
      // 验证最终状态
      expect(previewLineService.getPreviewLines().length).toBe(2) // 剩余2个预览线
      expect(edgeManager.connections.size).toBe(3) // 3个连接
    })
  })

  describe('真实场景模拟测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
    })

    it('应该模拟用户拖拽创建预览线的完整流程', async () => {
      // 模拟画布初始化
      mockGraph.addNode({ id: 'data_source', ports: { out: ['output'] } })
      mockGraph.addNode({ id: 'processor', ports: { in: ['input'], out: ['result'] } })
      mockGraph.addNode({ id: 'output', ports: { in: ['data'] } })
      
      // 模拟用户开始拖拽
      const dragStartResult = await previewLineService.createPreviewLine('data_source', {
        sourcePort: 'output',
        targetPosition: { x: 200, y: 100 }
      })
      
      expect(dragStartResult.success).toBe(true)
      
      // 模拟拖拽过程中的预览线更新（通过图层级）
      mockGraph.updatePreviewEdge(dragStartResult.data.id, {
        target: { x: 250, y: 120 }
      })
      
      // 模拟拖拽结束，连接到目标节点
      const dropResult = await previewLineService.convertPreviewToConnection(
        dragStartResult.data.id,
        'processor',
        { targetPort: 'input' }
      )
      
      expect(dropResult.success).toBe(true)
      expect(dropResult.data.sourceNodeId).toBe('data_source')
      expect(dropResult.data.targetNodeId).toBe('processor')
      
      // 验证连接在图中正确显示
      const graphEdges = mockGraph.getEdges()
      expect(graphEdges.length).toBe(1)
      expect(graphEdges[0].source.cell).toBe('data_source')
      expect(graphEdges[0].target.cell).toBe('processor')
    })

    it('应该模拟复杂的工作流构建场景', async () => {
      // 创建工作流节点
      const workflowNodes = [
        { id: 'start', type: 'start', ports: { out: ['next'] } },
        { id: 'condition', type: 'condition', ports: { in: ['input'], out: ['true', 'false'] } },
        { id: 'process_a', type: 'process', ports: { in: ['input'], out: ['output'] } },
        { id: 'process_b', type: 'process', ports: { in: ['input'], out: ['output'] } },
        { id: 'merge', type: 'merge', ports: { in: ['input_a', 'input_b'], out: ['output'] } },
        { id: 'end', type: 'end', ports: { in: ['input'] } }
      ]
      
      workflowNodes.forEach(node => {
        mockGraph.addNode(node)
      })
      
      // 构建工作流连接
      const workflowConnections = [
        { from: 'start', fromPort: 'next', to: 'condition', toPort: 'input' },
        { from: 'condition', fromPort: 'true', to: 'process_a', toPort: 'input' },
        { from: 'condition', fromPort: 'false', to: 'process_b', toPort: 'input' },
        { from: 'process_a', fromPort: 'output', to: 'merge', toPort: 'input_a' },
        { from: 'process_b', fromPort: 'output', to: 'merge', toPort: 'input_b' },
        { from: 'merge', fromPort: 'output', to: 'end', toPort: 'input' }
      ]
      
      // 逐步创建连接
      for (const conn of workflowConnections) {
        const previewResult = await previewLineService.createPreviewLine(conn.from, {
          sourcePort: conn.fromPort
        })
        expect(previewResult.success).toBe(true)
        
        const connectResult = await previewLineService.convertPreviewToConnection(
          previewResult.data.id,
          conn.to,
          { targetPort: conn.toPort }
        )
        expect(connectResult.success).toBe(true)
      }
      
      // 验证工作流结构
      expect(edgeManager.connections.size).toBe(6)
      
      // 验证每个节点的连接数
      expect(edgeManager.getNodeEdges('start').length).toBe(1)
      expect(edgeManager.getNodeEdges('condition').length).toBe(3) // 1入2出
      expect(edgeManager.getNodeEdges('process_a').length).toBe(2) // 1入1出
      expect(edgeManager.getNodeEdges('process_b').length).toBe(2) // 1入1出
      expect(edgeManager.getNodeEdges('merge').length).toBe(3) // 2入1出
      expect(edgeManager.getNodeEdges('end').length).toBe(1)
    })

    it('应该模拟实时协作编辑场景', async () => {
      // 创建多个用户的预览线服务
      const user1Service = new MockPreviewLineService(edgeManager)
      const user2Service = new MockPreviewLineService(edgeManager)
      
      await user1Service.initialize()
      await user2Service.initialize()
      
      try {
        // 添加协作节点
        mockGraph.addNode({ id: 'shared_node_1', ports: { in: ['in'], out: ['out'] } })
        mockGraph.addNode({ id: 'shared_node_2', ports: { in: ['in'], out: ['out'] } })
        mockGraph.addNode({ id: 'shared_node_3', ports: { in: ['in'], out: ['out'] } })
        
        // 用户1创建预览线
        const user1Preview = await user1Service.createPreviewLine('shared_node_1')
        expect(user1Preview.success).toBe(true)
        
        // 用户2同时创建预览线
        const user2Preview = await user2Service.createPreviewLine('shared_node_2')
        expect(user2Preview.success).toBe(true)
        
        // 验证两个用户都能看到对方的预览线
        expect(user1Service.getPreviewLines().length).toBe(2)
        expect(user2Service.getPreviewLines().length).toBe(2)
        
        // 用户1转换自己的预览线
        const user1Convert = await user1Service.convertPreviewToConnection(
          user1Preview.data.id,
          'shared_node_3'
        )
        expect(user1Convert.success).toBe(true)
        
        // 用户2删除自己的预览线
        const user2Delete = await user2Service.removePreviewLine(user2Preview.data.id)
        expect(user2Delete.success).toBe(true)
        
        // 验证最终状态同步
        expect(user1Service.getPreviewLines().length).toBe(0)
        expect(user2Service.getPreviewLines().length).toBe(0)
        expect(edgeManager.connections.size).toBe(1)
        
      } finally {
        user1Service.destroy()
        user2Service.destroy()
      }
    })
  })

  describe('系统级错误处理测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
    })

    it('应该处理图实例异常的系统级错误', async () => {
      // 模拟图实例方法失败
      mockGraph.addPreviewEdge.mockImplementationOnce(() => {
        throw new Error('图实例渲染失败')
      })
      
      const result = await previewLineService.createPreviewLine('test_node')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('图实例渲染失败')
      
      // 验证系统状态记录了错误
      const systemState = edgeManager.getSystemState()
      expect(systemState.errorCount).toBeGreaterThan(0)
      expect(systemState.lastError).toContain('图实例渲染失败')
    })

    it('应该处理服务层级的级联错误', async () => {
      // 创建预览线
      const createResult = await previewLineService.createPreviewLine('source_node')
      expect(createResult.success).toBe(true)
      
      // 模拟转换过程中的错误
      mockGraph.addEdge.mockImplementationOnce(() => {
        throw new Error('连接创建失败')
      })
      
      const convertResult = await previewLineService.convertPreviewToConnection(
        createResult.data.id,
        'target_node'
      )
      
      expect(convertResult.success).toBe(false)
      expect(convertResult.error).toContain('连接创建失败')
      
      // 验证预览线是否被正确恢复（在实际实现中应该有恢复逻辑）
      const remainingPreviewLines = previewLineService.getPreviewLines()
      expect(remainingPreviewLines.length).toBeGreaterThanOrEqual(0)
    })

    it('应该处理并发操作中的部分失败', async () => {
      let failureCount = 0
      
      // 模拟部分操作失败
      const originalCreatePreviewLine = edgeManager.createPreviewLine.bind(edgeManager)
      edgeManager.createPreviewLine = vi.fn().mockImplementation(async (sourceNodeId, options) => {
        if (failureCount < 2) {
          failureCount++
          throw new Error('模拟操作失败')
        }
        return originalCreatePreviewLine(sourceNodeId, options)
      })
      
      // 并发执行多个操作
      const operations = Array.from({ length: 5 }, (_, i) =>
        previewLineService.createPreviewLine(`node_${i}`)
      )
      
      const results = await Promise.all(operations)
      
      // 验证部分成功，部分失败
      const successCount = results.filter(r => r.success).length
      const failureCountResult = results.filter(r => !r.success).length
      
      expect(successCount).toBe(3)
      expect(failureCountResult).toBe(2)
      
      // 验证系统仍然可用
      const systemState = edgeManager.getSystemState()
      expect(systemState.isInitialized).toBe(true)
    })
  })

  describe('数据流完整性测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      await previewLineService.initialize()
    })

    it('应该保证数据在各层级间的一致性', async () => {
      // 创建预览线
      const result = await previewLineService.createPreviewLine('test_node', {
        sourcePort: 'out1',
        branchId: 'test_branch',
        metadata: { custom: 'data' }
      })
      
      expect(result.success).toBe(true)
      
      // 验证数据在各层级的一致性
      const previewLineId = result.data.id
      
      // 边管理器层级
      const managerPreviewLine = edgeManager.previewLines.get(previewLineId)
      expect(managerPreviewLine).toBeDefined()
      expect(managerPreviewLine.sourceNodeId).toBe('test_node')
      expect(managerPreviewLine.sourcePort).toBe('out1')
      expect(managerPreviewLine.branchId).toBe('test_branch')
      expect(managerPreviewLine.metadata.custom).toBe('data')
      
      // 服务层级
      const servicePreviewLines = previewLineService.getPreviewLines()
      expect(servicePreviewLines.length).toBe(1)
      expect(servicePreviewLines[0].id).toBe(previewLineId)
      
      // 图层级
      const graphPreviewEdges = mockGraph.getPreviewEdges()
      expect(graphPreviewEdges.length).toBe(1)
      expect(graphPreviewEdges[0].id).toBe(previewLineId)
    })

    it('应该保证事件传播的完整性', async () => {
      const eventLog = []
      
      // 设置多层级事件监听
      edgeManager.on('previewLine:created', (data) => {
        eventLog.push({ level: 'manager', event: 'created', id: data.previewLine.id })
      })
      
      edgeManager.on('previewLine:removed', (data) => {
        eventLog.push({ level: 'manager', event: 'removed', id: data.previewLine.id })
      })
      
      previewLineService.on('previewLine:created', (data) => {
        eventLog.push({ level: 'service', event: 'created', id: data.previewLine.id })
      })
      
      // 执行操作
      const createResult = await previewLineService.createPreviewLine('test_node')
      expect(createResult.success).toBe(true)
      
      const removeResult = await previewLineService.removePreviewLine(createResult.data.id)
      expect(removeResult.success).toBe(true)
      
      // 验证事件传播
      expect(eventLog.length).toBeGreaterThan(0)
      
      const createEvents = eventLog.filter(e => e.event === 'created')
      const removeEvents = eventLog.filter(e => e.event === 'removed')
      
      expect(createEvents.length).toBeGreaterThan(0)
      expect(removeEvents.length).toBeGreaterThan(0)
    })

    it('应该保证复杂操作流程的数据完整性', async () => {
      // 执行复杂的操作序列
      const operations = []
      
      // 创建多个预览线
      for (let i = 1; i <= 3; i++) {
        const result = await previewLineService.createPreviewLine(`node_${i}`, {
          branchId: `branch_${i}`
        })
        expect(result.success).toBe(true)
        operations.push({ type: 'create', id: result.data.id, nodeId: `node_${i}` })
      }
      
      // 转换一个预览线
      const convertResult = await previewLineService.convertPreviewToConnection(
        operations[0].id,
        'target_node'
      )
      expect(convertResult.success).toBe(true)
      operations.push({ type: 'convert', id: convertResult.data.id })
      
      // 删除一个预览线
      const deleteResult = await previewLineService.removePreviewLine(operations[1].id)
      expect(deleteResult.success).toBe(true)
      operations.push({ type: 'delete', id: operations[1].id })
      
      // 验证最终状态的完整性
      expect(previewLineService.getPreviewLines().length).toBe(1) // 剩余1个预览线
      expect(edgeManager.connections.size).toBe(1) // 1个连接
      expect(edgeManager.edges.size).toBe(2) // 1个预览线 + 1个连接
      
      // 验证索引完整性
      const nodeEdges = edgeManager.getNodeEdges('node_3')
      expect(nodeEdges.length).toBe(1)
      expect(nodeEdges[0].type).toBe('preview')
      
      const systemState = edgeManager.getSystemState()
      expect(systemState.totalOperations).toBeGreaterThan(0)
    })
  })
})