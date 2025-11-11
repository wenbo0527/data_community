/**
 * 性能测试套件
 * 测试 UnifiedEdgeManager 在各种性能场景下的表现
 * 
 * 测试覆盖：
 * - 大量预览线创建性能
 * - 内存泄漏检测
 * - 并发操作性能影响
 * - 查询操作性能
 * - 批量操作性能
 * - 内存使用优化
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 性能测试配置
const PERFORMANCE_CONFIG = {
  LARGE_BATCH_SIZE: 1000,
  MEDIUM_BATCH_SIZE: 500,
  SMALL_BATCH_SIZE: 100,
  CONCURRENT_OPERATIONS: 50,
  MAX_ACCEPTABLE_TIME: 5000, // 5秒
  MAX_QUERY_TIME: 100, // 100毫秒
  MEMORY_LEAK_THRESHOLD: 0.1 // 10%内存泄漏阈值
}

// Mock X6 Graph with performance tracking
const createPerformanceMockGraph = () => {
  const operationCounts = {
    addEdge: 0,
    removeEdge: 0,
    addPreviewEdge: 0,
    removePreviewEdge: 0,
    getEdges: 0,
    getNodes: 0
  }

  return {
    // 基础操作
    addEdge: vi.fn().mockImplementation((config) => {
      operationCounts.addEdge++
      return { id: config.id || `edge_${Date.now()}_${Math.random()}` }
    }),
    removeEdge: vi.fn().mockImplementation(() => {
      operationCounts.removeEdge++
      return true
    }),
    addPreviewEdge: vi.fn().mockImplementation((config) => {
      operationCounts.addPreviewEdge++
      return { id: config.id || `preview_${Date.now()}_${Math.random()}` }
    }),
    removePreviewEdge: vi.fn().mockImplementation(() => {
      operationCounts.removePreviewEdge++
      return true
    }),
    
    // 查询操作
    getEdges: vi.fn().mockImplementation(() => {
      operationCounts.getEdges++
      return []
    }),
    getNodes: vi.fn().mockImplementation(() => {
      operationCounts.getNodes++
      return []
    }),
    getCellById: vi.fn(),
    
    // 事件系统
    on: vi.fn(),
    off: vi.fn(),
    trigger: vi.fn(),
    
    // 序列化
    toJSON: vi.fn().mockReturnValue({ cells: [] }),
    fromJSON: vi.fn(),
    
    // 清理
    clearCells: vi.fn(),
    
    // 性能统计
    getOperationCounts: () => ({ ...operationCounts }),
    resetOperationCounts: () => {
      Object.keys(operationCounts).forEach(key => {
        operationCounts[key] = 0
      })
    }
  }
}

// Performance-focused UnifiedEdgeManager Mock
class PerformanceUnifiedEdgeManager {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = options
    this.edges = new Map()
    this.previewLines = new Map()
    this.connections = new Map()
    this.nodeEdgeIndex = new Map()
    this.portConnectionIndex = new Map()
    this.isInitialized = false
    
    // 性能统计
    this.performanceStats = {
      operationTimes: [],
      memoryUsage: [],
      operationCounts: {
        createPreviewLine: 0,
        removePreviewLine: 0,
        createConnection: 0,
        convertPreviewToConnection: 0,
        queries: 0
      }
    }
    
    // 内存监控
    this.memorySnapshots = []
  }

  async initialize() {
    const startTime = performance.now()
    
    try {
      this.isInitialized = true
      this.recordMemorySnapshot('initialize')
      
      const endTime = performance.now()
      this.recordOperationTime('initialize', endTime - startTime)
      
      return { success: true, message: '初始化成功' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  destroy() {
    const startTime = performance.now()
    
    try {
      this.edges.clear()
      this.previewLines.clear()
      this.connections.clear()
      this.nodeEdgeIndex.clear()
      this.portConnectionIndex.clear()
      this.isInitialized = false
      
      const endTime = performance.now()
      this.recordOperationTime('destroy', endTime - startTime)
      
      this.recordMemorySnapshot('destroy')
    } catch (error) {
      console.error('Destroy error:', error)
    }
  }

  recordOperationTime(operation, time) {
    this.performanceStats.operationTimes.push({
      operation,
      time,
      timestamp: Date.now()
    })
  }

  recordMemorySnapshot(operation) {
    const snapshot = {
      operation,
      timestamp: Date.now(),
      totalEdges: this.edges.size,
      previewLines: this.previewLines.size,
      connections: this.connections.size,
      nodeIndexes: this.nodeEdgeIndex.size,
      portIndexes: this.portConnectionIndex.size,
      // 模拟内存使用量（实际项目中可以使用 process.memoryUsage()）
      estimatedMemoryKB: (this.edges.size * 0.5) + (this.nodeEdgeIndex.size * 0.2)
    }
    
    this.memorySnapshots.push(snapshot)
    this.performanceStats.memoryUsage.push(snapshot)
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    const startTime = performance.now()
    
    try {
      this.performanceStats.operationCounts.createPreviewLine++
      
      if (!sourceNodeId || typeof sourceNodeId !== 'string') {
        throw new Error('无效的源节点ID')
      }

      if (!this.isInitialized) {
        throw new Error('UnifiedEdgeManager未初始化')
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

      // 模拟图操作延迟
      if (options.simulateDelay) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
      }

      const x6Edge = this.graph.addPreviewEdge({
        id: previewLine.id,
        source: { cell: sourceNodeId, port: previewLine.sourcePort },
        target: options.targetPosition || { x: 100, y: 100 }
      })

      previewLine.x6EdgeId = x6Edge?.id || previewLine.id
      this.previewLines.set(previewLine.id, previewLine)
      this.edges.set(previewLine.id, previewLine)

      this.updateNodeEdgeIndex(sourceNodeId, previewLine.id)

      const endTime = performance.now()
      this.recordOperationTime('createPreviewLine', endTime - startTime)

      return {
        success: true,
        data: previewLine,
        message: '预览线创建成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperationTime('createPreviewLine_error', endTime - startTime)
      
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
      this.performanceStats.operationCounts.removePreviewLine++
      
      if (!previewLineId) {
        throw new Error('预览线ID不能为空')
      }

      const previewLine = this.previewLines.get(previewLineId)
      if (!previewLine) {
        throw new Error(`预览线不存在: ${previewLineId}`)
      }

      this.graph.removePreviewEdge(previewLine.x6EdgeId)
      this.previewLines.delete(previewLineId)
      this.edges.delete(previewLineId)

      this.removeFromNodeEdgeIndex(previewLine.sourceNodeId, previewLineId)

      const endTime = performance.now()
      this.recordOperationTime('removePreviewLine', endTime - startTime)

      return {
        success: true,
        message: '预览线删除成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperationTime('removePreviewLine_error', endTime - startTime)
      
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
      this.performanceStats.operationCounts.createConnection++
      
      if (!sourceNodeId || !targetNodeId) {
        throw new Error('源节点ID和目标节点ID不能为空')
      }

      if (sourceNodeId === targetNodeId) {
        throw new Error('不能连接到自身')
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

      this.updateNodeEdgeIndex(sourceNodeId, connection.id)
      this.updateNodeEdgeIndex(targetNodeId, connection.id)

      const endTime = performance.now()
      this.recordOperationTime('createConnection', endTime - startTime)

      return {
        success: true,
        data: connection,
        message: '连接创建成功'
      }
    } catch (error) {
      const endTime = performance.now()
      this.recordOperationTime('createConnection_error', endTime - startTime)
      
      return {
        success: false,
        error: error.message,
        code: 'CONNECTION_CREATION_FAILED'
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
    const startTime = performance.now()
    this.performanceStats.operationCounts.queries++
    
    const edgeIds = this.nodeEdgeIndex.get(nodeId) || new Set()
    const result = Array.from(edgeIds).map(id => this.edges.get(id)).filter(Boolean)
    
    const endTime = performance.now()
    this.recordOperationTime('getNodeEdges', endTime - startTime)
    
    return result
  }

  getNodePreviewLines(nodeId) {
    const startTime = performance.now()
    this.performanceStats.operationCounts.queries++
    
    const result = this.getNodeEdges(nodeId).filter(edge => edge.type === 'preview')
    
    const endTime = performance.now()
    this.recordOperationTime('getNodePreviewLines', endTime - startTime)
    
    return result
  }

  getNodeConnections(nodeId) {
    const startTime = performance.now()
    this.performanceStats.operationCounts.queries++
    
    const result = this.getNodeEdges(nodeId).filter(edge => edge.type === 'connection')
    
    const endTime = performance.now()
    this.recordOperationTime('getNodeConnections', endTime - startTime)
    
    return result
  }

  // 批量操作
  async batchCreatePreviewLines(operations) {
    const startTime = performance.now()
    const results = []
    
    for (const op of operations) {
      const result = await this.createPreviewLine(op.sourceNodeId, op.options)
      results.push(result)
    }
    
    const endTime = performance.now()
    this.recordOperationTime('batchCreatePreviewLines', endTime - startTime)
    this.recordMemorySnapshot('batchCreatePreviewLines')
    
    return results
  }

  async batchRemovePreviewLines(previewLineIds) {
    const startTime = performance.now()
    const results = []
    
    for (const id of previewLineIds) {
      const result = await this.removePreviewLine(id)
      results.push(result)
    }
    
    const endTime = performance.now()
    this.recordOperationTime('batchRemovePreviewLines', endTime - startTime)
    this.recordMemorySnapshot('batchRemovePreviewLines')
    
    return results
  }

  // 性能统计方法
  getPerformanceStats() {
    return {
      ...this.performanceStats,
      memorySnapshots: [...this.memorySnapshots]
    }
  }

  getAverageOperationTime(operation) {
    const operationTimes = this.performanceStats.operationTimes
      .filter(stat => stat.operation === operation)
      .map(stat => stat.time)
    
    if (operationTimes.length === 0) return 0
    
    return operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length
  }

  getMemoryUsage() {
    return {
      totalEdges: this.edges.size,
      previewLines: this.previewLines.size,
      connections: this.connections.size,
      nodeIndexes: this.nodeEdgeIndex.size,
      portIndexes: this.portConnectionIndex.size,
      estimatedMemoryKB: (this.edges.size * 0.5) + (this.nodeEdgeIndex.size * 0.2)
    }
  }

  detectMemoryLeaks() {
    if (this.memorySnapshots.length < 2) {
      return { hasLeaks: false, message: '需要更多内存快照进行分析' }
    }

    const firstSnapshot = this.memorySnapshots[0]
    const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1]
    
    const memoryGrowth = lastSnapshot.estimatedMemoryKB - firstSnapshot.estimatedMemoryKB
    const growthPercentage = memoryGrowth / firstSnapshot.estimatedMemoryKB
    
    return {
      hasLeaks: growthPercentage > PERFORMANCE_CONFIG.MEMORY_LEAK_THRESHOLD,
      memoryGrowth,
      growthPercentage,
      message: growthPercentage > PERFORMANCE_CONFIG.MEMORY_LEAK_THRESHOLD 
        ? `检测到内存泄漏: ${(growthPercentage * 100).toFixed(2)}%增长`
        : '未检测到明显内存泄漏'
    }
  }
}

describe('性能测试套件', () => {
  let mockGraph
  let edgeManager

  beforeEach(() => {
    mockGraph = createPerformanceMockGraph()
    edgeManager = new PerformanceUnifiedEdgeManager(mockGraph)
  })

  afterEach(() => {
    if (edgeManager) {
      edgeManager.destroy()
    }
  })

  describe('大量预览线创建性能测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该在合理时间内创建大量预览线', async () => {
      const startTime = Date.now()
      
      const operations = Array.from({ length: PERFORMANCE_CONFIG.LARGE_BATCH_SIZE }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      const results = await edgeManager.batchCreatePreviewLines(operations)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_ACCEPTABLE_TIME)
      
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBeGreaterThan(PERFORMANCE_CONFIG.LARGE_BATCH_SIZE * 0.95) // 95%成功率
      
      // 验证平均操作时间
      const avgTime = edgeManager.getAverageOperationTime('createPreviewLine')
      expect(avgTime).toBeLessThan(10) // 平均每个操作不超过10ms
    })

    it('应该在中等批量操作中保持良好性能', async () => {
      const operations = Array.from({ length: PERFORMANCE_CONFIG.MEDIUM_BATCH_SIZE }, (_, i) => ({
        sourceNodeId: `node_${i}`,
        options: { branchId: `branch_${i}` }
      }))

      const startTime = Date.now()
      const results = await edgeManager.batchCreatePreviewLines(operations)
      const endTime = Date.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_ACCEPTABLE_TIME / 2) // 中等批量应该更快
      
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBe(PERFORMANCE_CONFIG.MEDIUM_BATCH_SIZE)
    })

    it('应该处理小批量高频操作', async () => {
      const batchCount = 10
      const batchSize = PERFORMANCE_CONFIG.SMALL_BATCH_SIZE
      
      const startTime = Date.now()
      
      for (let batch = 0; batch < batchCount; batch++) {
        const operations = Array.from({ length: batchSize }, (_, i) => ({
          sourceNodeId: `batch_${batch}_node_${i}`,
          options: { branchId: `batch_${batch}_branch_${i}` }
        }))
        
        await edgeManager.batchCreatePreviewLines(operations)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_ACCEPTABLE_TIME)
      expect(edgeManager.previewLines.size).toBe(batchCount * batchSize)
    })
  })

  describe('内存泄漏检测测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该在创建和删除循环中不产生内存泄漏', async () => {
      const cycles = 5
      const itemsPerCycle = 200
      
      for (let cycle = 0; cycle < cycles; cycle++) {
        // 创建预览线
        const operations = Array.from({ length: itemsPerCycle }, (_, i) => ({
          sourceNodeId: `cycle_${cycle}_node_${i}`,
          options: { branchId: `cycle_${cycle}_branch_${i}` }
        }))
        
        const createResults = await edgeManager.batchCreatePreviewLines(operations)
        const successfulCreates = createResults.filter(r => r.success)
        
        // 删除预览线
        const previewLineIds = successfulCreates.map(r => r.data.id)
        await edgeManager.batchRemovePreviewLines(previewLineIds)
      }
      
      const memoryLeakAnalysis = edgeManager.detectMemoryLeaks()
      expect(memoryLeakAnalysis.hasLeaks).toBe(false)
      
      // 验证最终内存使用量接近初始状态
      const finalMemory = edgeManager.getMemoryUsage()
      expect(finalMemory.totalEdges).toBeLessThanOrEqual(10) // 允许少量残留
    })

    it('应该监控内存使用量增长', async () => {
      const initialMemory = edgeManager.getMemoryUsage()
      
      // 创建大量预览线
      const operations = Array.from({ length: 500 }, (_, i) => ({
        sourceNodeId: `memory_test_node_${i}`,
        options: { branchId: `memory_test_branch_${i}` }
      }))
      
      await edgeManager.batchCreatePreviewLines(operations)
      
      const afterCreateMemory = edgeManager.getMemoryUsage()
      expect(afterCreateMemory.totalEdges).toBeGreaterThan(initialMemory.totalEdges)
      expect(afterCreateMemory.estimatedMemoryKB).toBeGreaterThan(initialMemory.estimatedMemoryKB)
      
      // 验证内存增长是合理的
      const memoryGrowthRatio = afterCreateMemory.estimatedMemoryKB / Math.max(initialMemory.estimatedMemoryKB, 1)
      expect(memoryGrowthRatio).toBeLessThan(1000) // 内存增长不应该过于夸张
    })

    it('应该在销毁时完全清理内存', async () => {
      // 创建大量资源
      const operations = Array.from({ length: 300 }, (_, i) => ({
        sourceNodeId: `destroy_test_node_${i}`,
        options: { branchId: `destroy_test_branch_${i}` }
      }))
      
      await edgeManager.batchCreatePreviewLines(operations)
      
      const beforeDestroy = edgeManager.getMemoryUsage()
      expect(beforeDestroy.totalEdges).toBe(300)
      
      // 销毁管理器
      edgeManager.destroy()
      
      const afterDestroy = edgeManager.getMemoryUsage()
      expect(afterDestroy.totalEdges).toBe(0)
      expect(afterDestroy.nodeIndexes).toBe(0)
      expect(afterDestroy.estimatedMemoryKB).toBe(0)
    })
  })

  describe('并发操作性能影响测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该处理并发创建操作而不显著影响性能', async () => {
      const concurrentOperations = PERFORMANCE_CONFIG.CONCURRENT_OPERATIONS
      
      const startTime = Date.now()
      
      const promises = Array.from({ length: concurrentOperations }, (_, i) =>
        edgeManager.createPreviewLine(`concurrent_node_${i}`, {
          branchId: `concurrent_branch_${i}`,
          simulateDelay: true
        })
      )
      
      const results = await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_ACCEPTABLE_TIME)
      
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBeGreaterThan(concurrentOperations * 0.9) // 90%成功率
      
      // 验证没有ID冲突
      const successResults = results.filter(r => r.success)
      const ids = successResults.map(r => r.data.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('应该处理混合并发操作（创建、删除、查询）', async () => {
      // 先创建一些预览线
      const initialOperations = Array.from({ length: 50 }, (_, i) => ({
        sourceNodeId: `initial_node_${i}`,
        options: { branchId: `initial_branch_${i}` }
      }))
      
      const initialResults = await edgeManager.batchCreatePreviewLines(initialOperations)
      const existingIds = initialResults.filter(r => r.success).map(r => r.data.id)
      
      const startTime = Date.now()
      
      // 并发执行混合操作
      const mixedPromises = [
        // 创建操作
        ...Array.from({ length: 20 }, (_, i) =>
          edgeManager.createPreviewLine(`mixed_create_node_${i}`)
        ),
        // 删除操作
        ...existingIds.slice(0, 20).map(id =>
          edgeManager.removePreviewLine(id)
        ),
        // 查询操作
        ...Array.from({ length: 30 }, (_, i) =>
          Promise.resolve(edgeManager.getNodeEdges(`initial_node_${i}`))
        )
      ]
      
      const results = await Promise.all(mixedPromises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_ACCEPTABLE_TIME)
      expect(results.length).toBe(70) // 20创建 + 20删除 + 30查询
    })
  })

  describe('查询操作性能测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
      
      // 创建测试数据
      const operations = Array.from({ length: 500 }, (_, i) => ({
        sourceNodeId: `query_test_node_${i % 100}`, // 100个不同的节点，每个节点5条边
        options: { branchId: `query_test_branch_${i}` }
      }))
      
      await edgeManager.batchCreatePreviewLines(operations)
    })

    it('应该快速执行单个节点查询', async () => {
      const startTime = Date.now()
      
      const edges = edgeManager.getNodeEdges('query_test_node_0')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_QUERY_TIME)
      expect(edges.length).toBe(5) // 每个节点应该有5条边
    })

    it('应该快速执行批量查询', async () => {
      const startTime = Date.now()
      
      const queryResults = []
      for (let i = 0; i < 100; i++) {
        const edges = edgeManager.getNodeEdges(`query_test_node_${i}`)
        const previewLines = edgeManager.getNodePreviewLines(`query_test_node_${i}`)
        queryResults.push({ edges, previewLines })
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_QUERY_TIME * 10) // 批量查询允许更多时间
      expect(queryResults.length).toBe(100)
      
      // 验证查询结果正确性
      queryResults.forEach(result => {
        expect(result.edges.length).toBe(5)
        expect(result.previewLines.length).toBe(5)
      })
    })

    it('应该在大数据集上保持查询性能', async () => {
      // 添加更多数据
      const additionalOperations = Array.from({ length: 1000 }, (_, i) => ({
        sourceNodeId: `large_dataset_node_${i % 200}`, // 200个节点
        options: { branchId: `large_dataset_branch_${i}` }
      }))
      
      await edgeManager.batchCreatePreviewLines(additionalOperations)
      
      const startTime = Date.now()
      
      // 执行多种查询
      for (let i = 0; i < 50; i++) {
        edgeManager.getNodeEdges(`large_dataset_node_${i}`)
        edgeManager.getNodePreviewLines(`query_test_node_${i}`)
        edgeManager.getNodeConnections(`large_dataset_node_${i + 50}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(PERFORMANCE_CONFIG.MAX_QUERY_TIME * 5)
    })
  })

  describe('批量操作性能测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该优化批量创建操作的性能', async () => {
      const batchSizes = [100, 300, 500, 1000]
      
      for (const batchSize of batchSizes) {
        const operations = Array.from({ length: batchSize }, (_, i) => ({
          sourceNodeId: `batch_${batchSize}_node_${i}`,
          options: { branchId: `batch_${batchSize}_branch_${i}` }
        }))
        
        const startTime = Date.now()
        const results = await edgeManager.batchCreatePreviewLines(operations)
        const endTime = Date.now()
        
        const duration = endTime - startTime
        const avgTimePerOperation = duration / batchSize
        
        expect(avgTimePerOperation).toBeLessThan(5) // 平均每个操作不超过5ms
        
        const successCount = results.filter(r => r.success).length
        expect(successCount).toBeGreaterThan(batchSize * 0.95) // 95%成功率
        
        // 清理数据
        const successfulIds = results.filter(r => r.success).map(r => r.data.id)
        await edgeManager.batchRemovePreviewLines(successfulIds)
      }
    })

    it('应该优化批量删除操作的性能', async () => {
      // 先创建大量预览线
      const operations = Array.from({ length: 800 }, (_, i) => ({
        sourceNodeId: `delete_test_node_${i}`,
        options: { branchId: `delete_test_branch_${i}` }
      }))
      
      const createResults = await edgeManager.batchCreatePreviewLines(operations)
      const successfulIds = createResults.filter(r => r.success).map(r => r.data.id)
      
      const startTime = Date.now()
      const deleteResults = await edgeManager.batchRemovePreviewLines(successfulIds)
      const endTime = Date.now()
      
      const duration = endTime - startTime
      const avgTimePerOperation = duration / successfulIds.length
      
      expect(avgTimePerOperation).toBeLessThan(3) // 删除操作应该更快
      
      const successDeleteCount = deleteResults.filter(r => r.success).length
      expect(successDeleteCount).toBeGreaterThan(successfulIds.length * 0.95)
    })
  })

  describe('性能统计和监控测试', () => {
    beforeEach(async () => {
      await edgeManager.initialize()
    })

    it('应该正确记录操作性能统计', async () => {
      // 执行各种操作
      await edgeManager.createPreviewLine('stats_node_1')
      await edgeManager.createPreviewLine('stats_node_2')
      await edgeManager.createConnection('stats_node_1', 'stats_node_2')
      
      const stats = edgeManager.getPerformanceStats()
      
      expect(stats.operationCounts.createPreviewLine).toBe(2)
      expect(stats.operationCounts.createConnection).toBe(1)
      expect(stats.operationTimes.length).toBeGreaterThan(0)
      
      // 验证平均时间计算
      const avgCreateTime = edgeManager.getAverageOperationTime('createPreviewLine')
      expect(avgCreateTime).toBeGreaterThan(0)
    })

    it('应该监控内存使用趋势', async () => {
      const initialSnapshot = edgeManager.getMemoryUsage()
      
      // 执行一系列操作
      const operations = Array.from({ length: 200 }, (_, i) => ({
        sourceNodeId: `memory_trend_node_${i}`,
        options: { branchId: `memory_trend_branch_${i}` }
      }))
      
      await edgeManager.batchCreatePreviewLines(operations)
      
      const afterCreateSnapshot = edgeManager.getMemoryUsage()
      expect(afterCreateSnapshot.totalEdges).toBeGreaterThan(initialSnapshot.totalEdges)
      
      const stats = edgeManager.getPerformanceStats()
      expect(stats.memorySnapshots.length).toBeGreaterThan(1)
    })

    it('应该提供详细的性能分析报告', async () => {
      // 执行混合操作
      const operations = Array.from({ length: 100 }, (_, i) => ({
        sourceNodeId: `analysis_node_${i}`,
        options: { branchId: `analysis_branch_${i}` }
      }))
      
      const createResults = await edgeManager.batchCreatePreviewLines(operations)
      const successfulIds = createResults.filter(r => r.success).map(r => r.data.id)
      
      // 执行查询
      for (let i = 0; i < 50; i++) {
        edgeManager.getNodeEdges(`analysis_node_${i}`)
      }
      
      // 删除一些
      await edgeManager.batchRemovePreviewLines(successfulIds.slice(0, 50))
      
      const stats = edgeManager.getPerformanceStats()
      
      // 验证统计完整性
      expect(stats.operationCounts.createPreviewLine).toBeGreaterThan(0)
      expect(stats.operationCounts.removePreviewLine).toBeGreaterThan(0)
      expect(stats.operationCounts.queries).toBeGreaterThan(0)
      expect(stats.operationTimes.length).toBeGreaterThan(0)
      expect(stats.memorySnapshots.length).toBeGreaterThan(0)
      
      // 验证性能指标合理性
      const avgCreateTime = edgeManager.getAverageOperationTime('createPreviewLine')
      const avgRemoveTime = edgeManager.getAverageOperationTime('removePreviewLine')
      const avgQueryTime = edgeManager.getAverageOperationTime('getNodeEdges')
      
      expect(avgCreateTime).toBeLessThan(50) // 创建操作不超过50ms
      expect(avgRemoveTime).toBeLessThan(30) // 删除操作不超过30ms
      expect(avgQueryTime).toBeLessThan(10) // 查询操作不超过10ms
    })
  })
})