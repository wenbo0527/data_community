/**
 * 测试工具和策略
 * 为营销任务画布系统提供全面的测试支持
 */

/**
 * 模拟数据生成器
 */
export class MockDataGenerator {
  /**
   * 创建模拟节点
   * @param {Object} options - 节点选项
   * @returns {Object} 模拟节点
   */
  static createMockNode(options = {}) {
    const defaultOptions = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'start',
      isConfigured: true,
      position: { x: 100, y: 100 },
      size: { width: 120, height: 60 }
    }

    const nodeOptions = { ...defaultOptions, ...options }
    
    return {
      id: nodeOptions.id,
      isEdge: () => false,
      getData: () => ({
        type: nodeOptions.type,
        nodeType: nodeOptions.type,
        isConfigured: nodeOptions.isConfigured,
        config: nodeOptions.config || {},
        ...nodeOptions.data
      }),
      position: () => nodeOptions.position,
      size: () => nodeOptions.size,
      setData: (data) => {
        Object.assign(nodeOptions.data || {}, data)
      }
    }
  }

  /**
   * 创建模拟边
   * @param {Object} options - 边选项
   * @returns {Object} 模拟边
   */
  static createMockEdge(options = {}) {
    const defaultOptions = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceId: 'source_node',
      targetId: 'target_node'
    }

    const edgeOptions = { ...defaultOptions, ...options }
    
    return {
      id: edgeOptions.id,
      isEdge: () => true,
      getData: () => ({
        type: edgeOptions.type || 'normal',
        ...edgeOptions.data
      }),
      getSource: () => ({
        cell: edgeOptions.sourceId,
        port: edgeOptions.sourcePort
      }),
      getTarget: () => ({
        cell: edgeOptions.targetId,
        port: edgeOptions.targetPort
      }),
      getVertices: () => edgeOptions.vertices || [],
      setVertices: (vertices) => {
        edgeOptions.vertices = vertices
      },
      trigger: (event) => {
        console.log(`Mock edge ${edgeOptions.id} triggered event: ${event}`)
      },
      updateRouter: () => {
        console.log(`Mock edge ${edgeOptions.id} router updated`)
      }
    }
  }

  /**
   * 创建模拟图实例
   * @param {Object} options - 图选项
   * @returns {Object} 模拟图
   */
  static createMockGraph(options = {}) {
    const nodes = new Map()
    const edges = new Map()
    const cells = new Map()

    return {
      getNodes: () => Array.from(nodes.values()),
      getEdges: () => Array.from(edges.values()),
      getCells: () => Array.from(cells.values()),
      getCellById: (id) => cells.get(id),
      hasCell: (id) => cells.has(id),
      addNode: (node) => {
        nodes.set(node.id, node)
        cells.set(node.id, node)
        return node
      },
      addEdge: (edge) => {
        edges.set(edge.id, edge)
        cells.set(edge.id, edge)
        return edge
      },
      removeCell: (id) => {
        nodes.delete(id)
        edges.delete(id)
        cells.delete(id)
      },
      getOutgoingEdges: (node) => {
        return Array.from(edges.values()).filter(edge => {
          const source = edge.getSource()
          const sourceCell = source?.cell || source?.id
          return sourceCell === node.id
        })
      },
      getIncomingEdges: (node) => {
        return Array.from(edges.values()).filter(edge => {
          const target = edge.getTarget()
          const targetCell = target?.cell || target?.id
          return targetCell === node.id
        })
      },
      ...options
    }
  }

  /**
   * 创建模拟分支管理器
   * @returns {Object} 模拟分支管理器
   */
  static createMockBranchManager() {
    return {
      updateBranchLayout: (node, config, skipStructuredLayout) => {
        console.log(`Mock branch manager updated layout for ${node.id}`)
      },
      getBranchCount: (node) => 2,
      getBranches: (node) => [
        { id: 'branch_1', label: '分支1' },
        { id: 'branch_2', label: '分支2' }
      ]
    }
  }
}

/**
 * 测试断言工具
 */
export class TestAssertions {
  /**
   * 断言节点有效性
   * @param {Object} node - 节点
   * @param {string} message - 错误消息
   */
  static assertValidNode(node, message = '节点应该有效') {
    if (!node || !node.id || typeof node.getData !== 'function') {
      throw new Error(message)
    }
  }

  /**
   * 断言边有效性
   * @param {Object} edge - 边
   * @param {string} message - 错误消息
   */
  static assertValidEdge(edge, message = '边应该有效') {
    if (!edge || !edge.isEdge || !edge.isEdge()) {
      throw new Error(message)
    }
  }

  /**
   * 断言预览线存在
   * @param {Map} previewLines - 预览线集合
   * @param {string} nodeId - 节点ID
   * @param {string} message - 错误消息
   */
  static assertPreviewLineExists(previewLines, nodeId, message = '预览线应该存在') {
    if (!previewLines.has(nodeId)) {
      throw new Error(`${message}: ${nodeId}`)
    }
  }

  /**
   * 断言预览线不存在
   * @param {Map} previewLines - 预览线集合
   * @param {string} nodeId - 节点ID
   * @param {string} message - 错误消息
   */
  static assertPreviewLineNotExists(previewLines, nodeId, message = '预览线不应该存在') {
    if (previewLines.has(nodeId)) {
      throw new Error(`${message}: ${nodeId}`)
    }
  }

  /**
   * 断言数组长度
   * @param {Array} array - 数组
   * @param {number} expectedLength - 期望长度
   * @param {string} message - 错误消息
   */
  static assertArrayLength(array, expectedLength, message = '数组长度不匹配') {
    if (!Array.isArray(array) || array.length !== expectedLength) {
      throw new Error(`${message}: 期望 ${expectedLength}, 实际 ${array ? array.length : 'undefined'}`)
    }
  }

  /**
   * 断言对象包含属性
   * @param {Object} obj - 对象
   * @param {string} property - 属性名
   * @param {string} message - 错误消息
   */
  static assertHasProperty(obj, property, message = '对象应该包含属性') {
    if (!obj || !obj.hasOwnProperty(property)) {
      throw new Error(`${message}: ${property}`)
    }
  }
}

/**
 * 测试场景生成器
 */
export class TestScenarios {
  /**
   * 创建基本画布场景
   * @returns {Object} 测试场景
   */
  static createBasicCanvasScenario() {
    const graph = MockDataGenerator.createMockGraph()
    const branchManager = MockDataGenerator.createMockBranchManager()
    
    // 添加开始节点
    const startNode = MockDataGenerator.createMockNode({
      type: 'start',
      isConfigured: true
    })
    graph.addNode(startNode)
    
    // 添加分流节点
    const splitNode = MockDataGenerator.createMockNode({
      type: 'audience-split',
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'crowd_1', crowdName: '高价值用户' },
          { id: 'crowd_2', crowdName: '普通用户' }
        ]
      }
    })
    graph.addNode(splitNode)
    
    // 添加连接
    const edge = MockDataGenerator.createMockEdge({
      sourceId: startNode.id,
      targetId: splitNode.id
    })
    graph.addEdge(edge)
    
    return {
      graph,
      branchManager,
      nodes: { startNode, splitNode },
      edges: { edge }
    }
  }

  /**
   * 创建复杂分支场景
   * @returns {Object} 测试场景
   */
  static createComplexBranchScenario() {
    const scenario = this.createBasicCanvasScenario()
    const { graph } = scenario
    
    // 添加更多节点
    const eventSplitNode = MockDataGenerator.createMockNode({
      type: 'event-split',
      isConfigured: true,
      config: {
        eventConfig: {
          eventId: 'purchase_event',
          eventName: '购买事件'
        }
      }
    })
    graph.addNode(eventSplitNode)
    
    const abTestNode = MockDataGenerator.createMockNode({
      type: 'ab-test',
      isConfigured: true,
      config: {
        testConfig: {
          variants: [
            { id: 'variant_a', name: 'A组' },
            { id: 'variant_b', name: 'B组' }
          ]
        }
      }
    })
    graph.addNode(abTestNode)
    
    const endNode = MockDataGenerator.createMockNode({
      type: 'end',
      isConfigured: true
    })
    graph.addNode(endNode)
    
    return {
      ...scenario,
      nodes: {
        ...scenario.nodes,
        eventSplitNode,
        abTestNode,
        endNode
      }
    }
  }

  /**
   * 创建错误场景
   * @returns {Object} 测试场景
   */
  static createErrorScenario() {
    const graph = MockDataGenerator.createMockGraph()
    
    // 创建无效节点
    const invalidNode = {
      id: 'invalid_node',
      // 缺少必要的方法
    }
    
    // 创建无效边
    const invalidEdge = {
      id: 'invalid_edge',
      isEdge: () => false // 不是边
    }
    
    return {
      graph,
      invalidNode,
      invalidEdge
    }
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTestUtils {
  /**
   * 测试方法执行时间
   * @param {Function} fn - 要测试的函数
   * @param {Array} args - 函数参数
   * @param {number} iterations - 迭代次数
   * @returns {Object} 性能测试结果
   */
  static async measurePerformance(fn, args = [], iterations = 100) {
    const times = []
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn(...args)
      const end = performance.now()
      times.push(end - start)
    }
    
    const total = times.reduce((sum, time) => sum + time, 0)
    const average = total / iterations
    const min = Math.min(...times)
    const max = Math.max(...times)
    
    return {
      iterations,
      total: Math.round(total * 100) / 100,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      times
    }
  }

  /**
   * 内存使用测试
   * @param {Function} fn - 要测试的函数
   * @returns {Object} 内存使用情况
   */
  static measureMemoryUsage(fn) {
    const before = performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize
    } : null
    
    fn()
    
    const after = performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize
    } : null
    
    return {
      before,
      after,
      difference: before && after ? {
        used: after.used - before.used,
        total: after.total - before.total
      } : null
    }
  }
}

/**
 * 集成测试套件
 */
export class IntegrationTestSuite {
  constructor() {
    this.tests = []
    this.results = []
  }

  /**
   * 添加测试用例
   * @param {string} name - 测试名称
   * @param {Function} testFn - 测试函数
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn })
  }

  /**
   * 运行所有测试
   * @returns {Promise<Object>} 测试结果
   */
  async runAll() {
    console.log(`🧪 开始运行 ${this.tests.length} 个测试...`)
    
    const startTime = performance.now()
    this.results = []
    
    for (const test of this.tests) {
      try {
        console.log(`  ▶️ 运行测试: ${test.name}`)
        const testStart = performance.now()
        
        await test.testFn()
        
        const testEnd = performance.now()
        const duration = Math.round((testEnd - testStart) * 100) / 100
        
        this.results.push({
          name: test.name,
          status: 'passed',
          duration,
          error: null
        })
        
        console.log(`  ✅ 测试通过: ${test.name} (${duration}ms)`)
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'failed',
          duration: 0,
          error: error.message
        })
        
        console.error(`  ❌ 测试失败: ${test.name}`, error)
      }
    }
    
    const endTime = performance.now()
    const totalDuration = Math.round((endTime - startTime) * 100) / 100
    
    const summary = this.generateSummary(totalDuration)
    console.log('📊 测试完成:', summary)
    
    return summary
  }

  /**
   * 生成测试摘要
   * @param {number} totalDuration - 总耗时
   * @returns {Object} 测试摘要
   */
  generateSummary(totalDuration) {
    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const total = this.results.length
    
    return {
      total,
      passed,
      failed,
      passRate: Math.round((passed / total) * 100),
      totalDuration,
      results: this.results
    }
  }
}

// 使用示例
export function createTestSuite() {
  const suite = new IntegrationTestSuite()
  
  // 添加基本功能测试
  suite.addTest('节点创建测试', async () => {
    const scenario = TestScenarios.createBasicCanvasScenario()
    TestAssertions.assertValidNode(scenario.nodes.startNode)
    TestAssertions.assertValidNode(scenario.nodes.splitNode)
  })
  
  suite.addTest('预览线创建测试', async () => {
    const scenario = TestScenarios.createBasicCanvasScenario()
    // 这里会添加实际的预览线管理器测试
  })
  
  suite.addTest('性能测试', async () => {
    const result = await PerformanceTestUtils.measurePerformance(
      () => MockDataGenerator.createMockNode(),
      [],
      1000
    )
    
    if (result.average > 10) { // 如果平均耗时超过10ms
      throw new Error(`性能测试失败: 平均耗时 ${result.average}ms 超过阈值`)
    }
  })
  
  return suite
}

export default {
  MockDataGenerator,
  TestAssertions,
  TestScenarios,
  PerformanceTestUtils,
  IntegrationTestSuite,
  createTestSuite
}