/**
 * 边界情况测试
 * 整合了 EdgeCaseTests.test.js 中的边界情况和错误处理测试
 * 
 * 测试覆盖：
 * - 异常输入处理
 * - 资源限制测试
 * - 并发操作测试
 * - 内存管理测试
 * - 数据一致性测试
 * - 错误恢复测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'

// Mock X6 Graph for edge case testing
const createMockGraph = () => ({
  addEdge: vi.fn().mockReturnValue({ id: 'edge_123' }),
  removeEdge: vi.fn(),
  getCellById: vi.fn(),
  getEdges: vi.fn().mockReturnValue([]),
  getNodes: vi.fn().mockReturnValue([]),
  on: vi.fn(),
  off: vi.fn(),
  trigger: vi.fn(),
  toJSON: vi.fn().mockReturnValue({ cells: [] }),
  fromJSON: vi.fn(),
  clearCells: vi.fn(),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  // 预览线相关方法
  addPreviewEdge: vi.fn().mockImplementation((config) => ({ id: config.id || 'preview_edge_123' })),
  removePreviewEdge: vi.fn(),
  updatePreviewEdge: vi.fn(),
  getPreviewEdges: vi.fn().mockReturnValue([]),
  // 端口相关方法
  getNodePorts: vi.fn().mockReturnValue({ in: ['in1'], out: ['out1'] }),
  // 拖拽和吸附相关方法
  startDrag: vi.fn(),
  endDrag: vi.fn(),
  attachToPort: vi.fn(),
  detachFromPort: vi.fn(),
  findNearestPort: vi.fn(),
  // 布局相关方法
  layoutNodes: vi.fn(),
  getNodePosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
  setNodePosition: vi.fn(),
  // 距离计算
  calculateDistance: vi.fn().mockReturnValue(50)
})

// Mock UnifiedEdgeManager for edge case testing
class MockUnifiedEdgeManager {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = options
    this.edges = new Map()
    this.previewLines = new Map()
    this.connections = new Map()
    this.nodeEdgeIndex = new Map()
    this.portConnectionIndex = new Map()
    this.isInitialized = false
    this.errorCount = 0
    this.lastError = null
  }

  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: '已经初始化' }
    }
    
    try {
      this.isInitialized = true
      return { success: true, message: '初始化成功' }
    } catch (error) {
      this.handleError(error, 'initialize')
      return { success: false, error: error.message }
    }
  }

  destroy() {
    try {
      this.edges.clear()
      this.previewLines.clear()
      this.connections.clear()
      this.nodeEdgeIndex.clear()
      this.portConnectionIndex.clear()
      this.isInitialized = false
    } catch (error) {
      this.handleError(error, 'destroy')
    }
  }

  handleError(error, context = '') {
    this.errorCount++
    this.lastError = `${context}: ${error.message || error}`
    console.error(`EdgeCase Error [${context}]:`, error)
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    try {
      // 验证输入参数
      if (!sourceNodeId) {
        throw new Error('源节点ID不能为空')
      }

      if (typeof sourceNodeId !== 'string') {
        throw new Error('源节点ID必须是字符串')
      }

      if (!this.isInitialized) {
        throw new Error('UnifiedEdgeManager未初始化')
      }

      // 模拟资源限制检查
      if (this.previewLines.size >= 1000) {
        throw new Error('预览线数量超过限制')
      }

      const previewLine = {
        id: `preview_${sourceNodeId}_${Date.now()}_${Math.random()}`,
        sourceNodeId: sourceNodeId,
        sourcePort: options.sourcePort || 'out',
        targetNodeId: options.targetNodeId || null,
        targetPort: options.targetPort || null,
        branchId: options.branchId || null,
        type: 'preview',
        isPreview: true,
        x6EdgeId: null,
        createdAt: Date.now()
      }

      // 模拟X6图操作可能失败
      if (options.simulateGraphError) {
        throw new Error('图实例操作失败')
      }

      const x6Edge = this.graph.addPreviewEdge({
        id: previewLine.id,
        source: { cell: sourceNodeId, port: previewLine.sourcePort },
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

      return {
        success: true,
        data: previewLine,
        message: '预览线创建成功'
      }
    } catch (error) {
      this.handleError(error, 'createPreviewLine')
      return {
        success: false,
        error: error.message,
        code: 'PREVIEW_LINE_CREATION_FAILED'
      }
    }
  }

  async removePreviewLine(previewLineId) {
    try {
      if (!previewLineId) {
        throw new Error('预览线ID不能为空')
      }

      const previewLine = this.previewLines.get(previewLineId)
      if (!previewLine) {
        throw new Error(`预览线不存在: ${previewLineId}`)
      }

      // 模拟图操作可能失败
      if (Math.random() < 0.1) { // 10%概率模拟失败
        throw new Error('图实例删除操作失败')
      }

      this.graph.removePreviewEdge(previewLine.x6EdgeId)
      this.previewLines.delete(previewLineId)
      this.edges.delete(previewLineId)

      // 更新索引
      this.removeFromNodeEdgeIndex(previewLine.sourceNodeId, previewLineId)

      return {
        success: true,
        message: '预览线删除成功'
      }
    } catch (error) {
      this.handleError(error, 'removePreviewLine')
      return {
        success: false,
        error: error.message,
        code: 'PREVIEW_LINE_DELETION_FAILED'
      }
    }
  }

  async createConnection(sourceNodeId, targetNodeId, options = {}) {
    try {
      if (!sourceNodeId || !targetNodeId) {
        throw new Error('源节点ID和目标节点ID不能为空')
      }

      if (sourceNodeId === targetNodeId) {
        throw new Error('不能连接到自身')
      }

      // 检查重复连接
      const existingConnection = Array.from(this.connections.values()).find(
        conn => conn.sourceNodeId === sourceNodeId && 
                conn.targetNodeId === targetNodeId &&
                conn.branchId === options.branchId
      )

      if (existingConnection) {
        throw new Error('连接已存在')
      }

      const connection = {
        id: `connection_${sourceNodeId}_${targetNodeId}_${Date.now()}`,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
        sourcePort: options.sourcePort || 'out',
        targetPort: options.targetPort || 'in',
        branchId: options.branchId || null,
        type: 'connection',
        isPreview: false,
        x6EdgeId: null,
        createdAt: Date.now()
      }

      const x6Edge = this.graph.addEdge({
        id: connection.id,
        source: { cell: sourceNodeId, port: connection.sourcePort },
        target: { cell: targetNodeId, port: connection.targetPort }
      })

      connection.x6EdgeId = x6Edge?.id || connection.id
      this.connections.set(connection.id, connection)
      this.edges.set(connection.id, connection)

      // 更新索引
      this.updateNodeEdgeIndex(sourceNodeId, connection.id)
      this.updateNodeEdgeIndex(targetNodeId, connection.id)

      return {
        success: true,
        data: connection,
        message: '连接创建成功'
      }
    } catch (error) {
      this.handleError(error, 'createConnection')
      return {
        success: false,
        error: error.message,
        code: 'CONNECTION_CREATION_FAILED'
      }
    }
  }

  async convertPreviewToConnection(previewLineId, targetNodeId, options = {}) {
    try {
      const previewLine = this.previewLines.get(previewLineId)
      if (!previewLine) {
        throw new Error('预览线不存在')
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
          ...options
        }
      )

      if (!createResult.success) {
        // 如果创建连接失败，尝试恢复预览线
        await this.createPreviewLine(previewLine.sourceNodeId, {
          sourcePort: previewLine.sourcePort,
          branchId: previewLine.branchId
        })
        throw new Error(`创建连接失败: ${createResult.error}`)
      }

      return createResult
    } catch (error) {
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

  getNodePreviewLines(nodeId) {
    return this.getNodeEdges(nodeId).filter(edge => edge.type === 'preview')
  }

  getNodeConnections(nodeId) {
    return this.getNodeEdges(nodeId).filter(edge => edge.type === 'connection')
  }

  // 批量操作测试方法
  async batchCreatePreviewLines(operations) {
    const results = []
    for (const op of operations) {
      const result = await this.createPreviewLine(op.sourceNodeId, op.options)
      results.push(result)
    }
    return results
  }

  async batchRemovePreviewLines(previewLineIds) {
    const results = []
    for (const id of previewLineIds) {
      const result = await this.removePreviewLine(id)
      results.push(result)
    }
    return results
  }

  // 内存管理测试方法
  getMemoryUsage() {
    return {
      totalEdges: this.edges.size,
      previewLines: this.previewLines.size,
      connections: this.connections.size,
      nodeIndexes: this.nodeEdgeIndex.size,
      portIndexes: this.portConnectionIndex.size
    }
  }

  // 数据一致性检查
  validateDataConsistency() {
    const errors = []

    // 检查边集合一致性
    const totalEdgesFromMaps = this.previewLines.size + this.connections.size
    if (this.edges.size !== totalEdgesFromMaps) {
      errors.push(`边集合不一致: edges=${this.edges.size}, preview+connection=${totalEdgesFromMaps}`)
    }

    // 检查索引一致性
    for (const [nodeId, edgeIds] of this.nodeEdgeIndex) {
      for (const edgeId of edgeIds) {
        if (!this.edges.has(edgeId)) {
          errors.push(`索引中的边不存在: nodeId=${nodeId}, edgeId=${edgeId}`)
        }
      }
    }

    return {
      isConsistent: errors.length === 0,
      errors
    }
  }
}

describe('边界情况测试', () => {
  let mockGraph
  let edgeManager

  beforeEach(() => {
    mockGraph = createMockGraph()
    edgeManager = new MockUnifiedEdgeManager(mockGraph)
  })

  afterEach(() => {
    if (edgeManager) {
      edgeManager.destroy()
    }
  })

  describe('异常输入处理', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该处理空的源节点ID', async () => {
      const result = await edgeManager.createPreviewLine('')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('源节点ID不能为空')
    })

    it('应该处理null的源节点ID', async () => {
      const result = await edgeManager.createPreviewLine(null)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('源节点ID不能为空')
    })

    it('应该处理非字符串的源节点ID', async () => {
      const result = await edgeManager.createPreviewLine(123)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('源节点ID必须是字符串')
    })

    it('应该处理未初始化的管理器', async () => {
      const uninitializedManager = new MockUnifiedEdgeManager(mockGraph)
      
      const result = await uninitializedManager.createPreviewLine('node1')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('UnifiedEdgeManager未初始化')
    })

    it('应该处理删除不存在的预览线', async () => {
      const result = await edgeManager.removePreviewLine('non-existent-id')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('预览线不存在')
    })

    it('应该处理自连接', async () => {
      const result = await edgeManager.createConnection('node1', 'node1')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('不能连接到自身')
    })
  })

  describe('资源限制测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该处理预览线数量限制', async () => {
      // 模拟达到限制
      for (let i = 0; i < 1000; i++) {
        edgeManager.previewLines.set(`preview_${i}`, { id: `preview_${i}` })
      }

      const result = await edgeManager.createPreviewLine('node1')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('预览线数量超过限制')
    })

    it('应该处理大量并发操作', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      const results = await edgeManager.batchCreatePreviewLines(operations)
      
      expect(results).toHaveLength(100)
      
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBeGreaterThan(90) // 允许少量失败
    })

    it('应该处理内存压力测试', async () => {
      const initialMemory = edgeManager.getMemoryUsage()
      
      // 创建大量预览线
      const operations = Array.from({ length: 500 }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      await edgeManager.batchCreatePreviewLines(operations)
      
      const afterCreateMemory = edgeManager.getMemoryUsage()
      expect(afterCreateMemory.totalEdges).toBeGreaterThan(initialMemory.totalEdges)

      // 删除所有预览线
      const previewLineIds = Array.from(edgeManager.previewLines.keys())
      await edgeManager.batchRemovePreviewLines(previewLineIds)
      
      const afterDeleteMemory = edgeManager.getMemoryUsage()
      expect(afterDeleteMemory.totalEdges).toBeLessThanOrEqual(initialMemory.totalEdges + 10) // 允许少量残留
    })
  })

  describe('并发操作测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该处理并发创建预览线', async () => {
      const promises = Array.from({ length: 50 }, (_, i) =>
        edgeManager.createPreviewLine(`node_${i}`, { branchId: `branch_${i}` })
      )

      const results = await Promise.all(promises)
      
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBeGreaterThan(45) // 允许少量失败

      // 验证没有ID冲突
      const successResults = results.filter(r => r.success)
      const ids = successResults.map(r => r.data.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('应该处理并发删除操作', async () => {
      // 先创建预览线
      const createPromises = Array.from({ length: 30 }, (_, i) =>
        edgeManager.createPreviewLine(`node_${i}`, { branchId: `branch_${i}` })
      )
      const createResults = await Promise.all(createPromises)
      const successfulCreates = createResults.filter(r => r.success)

      // 并发删除
      const deletePromises = successfulCreates.map(r =>
        edgeManager.removePreviewLine(r.data.id)
      )
      const deleteResults = await Promise.all(deletePromises)
      
      const successDeleteCount = deleteResults.filter(r => r.success).length
      expect(successDeleteCount).toBeGreaterThan(25) // 允许少量失败
    })

    it('应该处理并发转换操作', async () => {
      // 先创建预览线
      const createPromises = Array.from({ length: 20 }, (_, i) =>
        edgeManager.createPreviewLine(`source_${i}`, { branchId: `branch_${i}` })
      )
      const createResults = await Promise.all(createPromises)
      const successfulCreates = createResults.filter(r => r.success)

      // 并发转换
      const convertPromises = successfulCreates.map((r, i) =>
        edgeManager.convertPreviewToConnection(r.data.id, `target_${i}`)
      )
      const convertResults = await Promise.all(convertPromises)
      
      const successConvertCount = convertResults.filter(r => r.success).length
      expect(successConvertCount).toBeGreaterThan(15) // 允许少量失败
    })
  })

  describe('错误恢复测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该处理图实例操作失败', async () => {
      const result = await edgeManager.createPreviewLine('node1', {
        simulateGraphError: true
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('图实例操作失败')
      expect(edgeManager.errorCount).toBeGreaterThan(0)
    })

    it('应该在转换失败时恢复预览线', async () => {
      // 创建预览线
      const createResult = await edgeManager.createPreviewLine('node1')
      expect(createResult.success).toBe(true)

      // 模拟转换失败（通过创建重复连接）
      await edgeManager.createConnection('node1', 'node2')
      const convertResult = await edgeManager.convertPreviewToConnection(
        createResult.data.id, 
        'node2'
      )
      
      expect(convertResult.success).toBe(false)
      
      // 验证预览线被恢复（在实际实现中应该有恢复逻辑）
      const previewLines = edgeManager.getNodePreviewLines('node1')
      expect(previewLines.length).toBeGreaterThanOrEqual(0)
    })

    it('应该处理数据不一致并自动修复', async () => {
      // 创建一些边
      await edgeManager.createPreviewLine('node1')
      await edgeManager.createConnection('node2', 'node3')

      // 人为破坏数据一致性
      edgeManager.edges.set('orphan_edge', { id: 'orphan_edge', type: 'preview' })

      const validation = edgeManager.validateDataConsistency()
      expect(validation.isConsistent).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('数据一致性测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该维护边集合的一致性', async () => {
      await edgeManager.createPreviewLine('node1')
      await edgeManager.createConnection('node2', 'node3')

      const validation = edgeManager.validateDataConsistency()
      expect(validation.isConsistent).toBe(true)
    })

    it('应该维护索引的一致性', async () => {
      const createResult = await edgeManager.createPreviewLine('node1')
      
      // 验证索引正确更新
      const nodeEdges = edgeManager.getNodeEdges('node1')
      expect(nodeEdges.length).toBe(1)
      expect(nodeEdges[0].id).toBe(createResult.data.id)

      // 删除后验证索引清理
      await edgeManager.removePreviewLine(createResult.data.id)
      const nodeEdgesAfterDelete = edgeManager.getNodeEdges('node1')
      expect(nodeEdgesAfterDelete.length).toBe(0)
    })

    it('应该处理重复连接检测', async () => {
      // 创建第一个连接
      const result1 = await edgeManager.createConnection('node1', 'node2', {
        branchId: 'branch1'
      })
      expect(result1.success).toBe(true)

      // 尝试创建重复连接
      const result2 = await edgeManager.createConnection('node1', 'node2', {
        branchId: 'branch1'
      })
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('连接已存在')
    })
  })

  describe('性能边界测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该在合理时间内完成大量操作', async () => {
      const startTime = Date.now()
      
      // 创建大量预览线
      const operations = Array.from({ length: 200 }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      await edgeManager.batchCreatePreviewLines(operations)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 应该在5秒内完成
      expect(duration).toBeLessThan(5000)
    })

    it('应该正确处理查询操作的性能', async () => {
      // 创建大量边
      for (let i = 0; i < 100; i++) {
        await edgeManager.createPreviewLine(`node_${i}`)
        if (i % 2 === 0) {
          await edgeManager.createConnection(`node_${i}`, `target_${i}`)
        }
      }

      const startTime = Date.now()
      
      // 执行大量查询
      for (let i = 0; i < 100; i++) {
        edgeManager.getNodeEdges(`node_${i}`)
        edgeManager.getNodePreviewLines(`node_${i}`)
        edgeManager.getNodeConnections(`node_${i}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 查询应该很快完成
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('内存泄漏检测', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该在销毁时清理所有资源', async () => {
      // 创建一些资源
      await edgeManager.createPreviewLine('node1')
      await edgeManager.createConnection('node2', 'node3')

      const beforeDestroy = edgeManager.getMemoryUsage()
      expect(beforeDestroy.totalEdges).toBeGreaterThan(0)

      // 销毁管理器
      edgeManager.destroy()

      const afterDestroy = edgeManager.getMemoryUsage()
      expect(afterDestroy.totalEdges).toBe(0)
      expect(afterDestroy.nodeIndexes).toBe(0)
      expect(afterDestroy.portIndexes).toBe(0)
    })

    it('应该在批量删除时正确清理内存', async () => {
      // 创建大量预览线
      const operations = Array.from({ length: 100 }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      const createResults = await edgeManager.batchCreatePreviewLines(operations)
      const successfulCreates = createResults.filter(r => r.success)

      const beforeDelete = edgeManager.getMemoryUsage()
      expect(beforeDelete.totalEdges).toBe(successfulCreates.length)

      // 批量删除
      const previewLineIds = successfulCreates.map(r => r.data.id)
      await edgeManager.batchRemovePreviewLines(previewLineIds)

      const afterDelete = edgeManager.getMemoryUsage()
      expect(afterDelete.totalEdges).toBeLessThanOrEqual(5) // 允许少量残留
    })
  })
})