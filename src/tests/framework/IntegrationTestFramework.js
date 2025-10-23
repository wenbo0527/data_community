/**
 * 集成测试框架
 * 支持组件间协作验证和端到端测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import { X6CanvasTestUtils } from '../utils/X6CanvasTestUtils.js'
import { TestDataManager, TEST_SCENARIOS } from '../data/TestDataManager.js'
import { createRealDOMContainer, cleanupDOM, waitForDomUpdate } from '../setup/real-environment.js'

/**
 * 集成测试基类
 */
export class IntegrationTestBase {
  constructor() {
    this.canvasUtils = new X6CanvasTestUtils()
    this.dataManager = new TestDataManager()
    this.pinia = null
    this.wrapper = null
    this.graph = null
  }

  /**
   * 设置测试环境
   */
  async setup() {
    // 创建Pinia实例
    this.pinia = createPinia()
    
    // 重置数据管理器计数器
    this.dataManager.resetCounters()
    
    // 清理DOM
    cleanupDOM()
  }

  /**
   * 清理测试环境
   */
  async cleanup() {
    if (this.wrapper) {
      this.wrapper.unmount()
      this.wrapper = null
    }
    
    if (this.canvasUtils) {
      this.canvasUtils.destroy()
    }
    
    cleanupDOM()
  }

  /**
   * 挂载Vue组件
   * @param {Object} component - Vue组件
   * @param {Object} options - 挂载选项
   * @returns {Object} 组件包装器
   */
  async mountComponent(component, options = {}) {
    const defaultOptions = {
      global: {
        plugins: [this.pinia],
        mocks: {
          $t: (key) => key,
          $route: {
            path: '/marketing/tasks',
            params: {},
            query: {}
          }
        }
      },
      attachTo: document.body,
      ...options
    }

    this.wrapper = mount(component, defaultOptions)
    await nextTick()
    await waitForDomUpdate(100)
    
    return this.wrapper
  }

  /**
   * 创建画布实例
   * @param {Object} options - 画布选项
   * @returns {Graph} X6图实例
   */
  async createCanvas(options = {}) {
    this.graph = await this.canvasUtils.createRealCanvas(options)
    await this.canvasUtils.waitForRender()
    return this.graph
  }

  /**
   * 加载测试场景
   * @param {string} scenarioType - 场景类型
   * @returns {Object} 场景数据
   */
  loadTestScenario(scenarioType) {
    const scenario = this.dataManager.getScenario(scenarioType)
    if (!scenario) {
      throw new Error(`Test scenario ${scenarioType} not found`)
    }
    return scenario
  }

  /**
   * 在画布中渲染场景
   * @param {string} scenarioType - 场景类型
   * @returns {Object} 渲染结果
   */
  async renderScenario(scenarioType) {
    const scenario = this.loadTestScenario(scenarioType)
    
    if (!this.graph) {
      throw new Error('Canvas not created. Call createCanvas() first.')
    }

    // 清空画布
    this.graph.clearCells()

    // 添加节点
    const nodes = []
    for (const nodeData of scenario.nodes) {
      const node = this.graph.addNode(nodeData)
      nodes.push(node)
    }

    // 添加连接
    const edges = []
    for (const edgeData of scenario.edges) {
      const edge = this.graph.addEdge(edgeData)
      edges.push(edge)
    }

    // 等待渲染完成
    await waitForDomUpdate(200)

    return { nodes, edges, scenario }
  }

  /**
   * 验证节点渲染
   * @param {Array} expectedNodes - 期望的节点数据
   */
  validateNodesRendered(expectedNodes) {
    const actualNodes = this.graph.getNodes()
    expect(actualNodes).toHaveLength(expectedNodes.length)

    expectedNodes.forEach((expectedNode, index) => {
      const actualNode = actualNodes.find(node => node.id === expectedNode.id)
      expect(actualNode).toBeDefined()
      expect(actualNode.getPosition()).toEqual({
        x: expectedNode.x,
        y: expectedNode.y
      })
    })
  }

  /**
   * 验证连接渲染
   * @param {Array} expectedEdges - 期望的连接数据
   */
  validateEdgesRendered(expectedEdges) {
    const actualEdges = this.graph.getEdges()
    expect(actualEdges).toHaveLength(expectedEdges.length)

    expectedEdges.forEach((expectedEdge) => {
      const actualEdge = actualEdges.find(edge => edge.id === expectedEdge.id)
      expect(actualEdge).toBeDefined()
      expect(actualEdge.getSourceCellId()).toBe(expectedEdge.source)
      expect(actualEdge.getTargetCellId()).toBe(expectedEdge.target)
    })
  }

  /**
   * 模拟用户交互
   * @param {string} interaction - 交互类型
   * @param {Object} params - 交互参数
   */
  async simulateUserInteraction(interaction, params = {}) {
    switch (interaction) {
      case 'dragNode':
        await this.canvasUtils.simulateNodeDrag(
          params.nodeId,
          params.startPos,
          params.endPos
        )
        break
      
      case 'createConnection':
        await this.canvasUtils.simulateConnection(
          params.sourceId,
          params.targetId
        )
        break
      
      case 'selectNode':
        const node = this.graph.getCellById(params.nodeId)
        if (node) {
          this.graph.select(node)
        }
        break
      
      case 'deleteNode':
        const nodeToDelete = this.graph.getCellById(params.nodeId)
        if (nodeToDelete) {
          this.graph.removeCell(nodeToDelete)
        }
        break
      
      default:
        throw new Error(`Unknown interaction type: ${interaction}`)
    }

    await waitForDomUpdate(100)
  }

  /**
   * 验证组件状态
   * @param {Object} expectedState - 期望状态
   */
  validateComponentState(expectedState) {
    if (!this.wrapper) {
      throw new Error('Component not mounted')
    }

    Object.keys(expectedState).forEach(key => {
      const actualValue = this.wrapper.vm[key]
      expect(actualValue).toEqual(expectedState[key])
    })
  }

  /**
   * 等待异步操作完成
   * @param {Function} condition - 等待条件
   * @param {number} timeout - 超时时间
   */
  async waitForCondition(condition, timeout = 5000) {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true
      }
      await waitForDomUpdate(100)
    }
    
    throw new Error(`Condition not met within ${timeout}ms`)
  }

  /**
   * 捕获画布快照
   * @returns {string} Base64编码的图片数据
   */
  async captureSnapshot() {
    if (!this.graph) {
      throw new Error('Canvas not available')
    }
    return await this.canvasUtils.getCanvasSnapshot()
  }
}

/**
 * 创建集成测试套件
 * @param {string} suiteName - 测试套件名称
 * @param {Function} testFn - 测试函数
 */
export function createIntegrationTestSuite(suiteName, testFn) {
  describe(suiteName, () => {
    let testFramework

    beforeEach(async () => {
      testFramework = new IntegrationTestBase()
      await testFramework.setup()
    })

    afterEach(async () => {
      if (testFramework) {
        await testFramework.cleanup()
      }
    })

    testFn(testFramework)
  })
}

/**
 * 画布组件集成测试工具
 */
export class CanvasComponentIntegrationTest extends IntegrationTestBase {
  /**
   * 测试画布初始化
   * @param {Object} component - 画布组件
   * @param {Object} props - 组件属性
   */
  async testCanvasInitialization(component, props = {}) {
    const wrapper = await this.mountComponent(component, { props })
    
    // 等待画布初始化
    await this.waitForCondition(() => {
      return wrapper.vm.graph && wrapper.vm.isGraphReady
    })

    // 验证画布实例
    expect(wrapper.vm.graph).toBeDefined()
    expect(wrapper.vm.isGraphReady).toBe(true)

    return wrapper
  }

  /**
   * 测试节点操作
   * @param {Object} component - 画布组件
   * @param {string} scenarioType - 测试场景
   */
  async testNodeOperations(component, scenarioType = TEST_SCENARIOS.SIMPLE_FLOW) {
    const wrapper = await this.testCanvasInitialization(component)
    const scenario = this.loadTestScenario(scenarioType)

    // 添加节点
    for (const nodeData of scenario.nodes) {
      wrapper.vm.addNode(nodeData)
    }

    await waitForDomUpdate(200)

    // 验证节点添加
    const nodes = wrapper.vm.graph.getNodes()
    expect(nodes).toHaveLength(scenario.nodes.length)

    // 测试节点拖拽
    if (nodes.length > 0) {
      const firstNode = nodes[0]
      const originalPos = firstNode.getPosition()
      const newPos = { x: originalPos.x + 100, y: originalPos.y + 50 }

      await this.simulateUserInteraction('dragNode', {
        nodeId: firstNode.id,
        startPos: originalPos,
        endPos: newPos
      })

      // 验证节点位置更新
      const updatedPos = firstNode.getPosition()
      expect(updatedPos.x).toBeCloseTo(newPos.x, 0)
      expect(updatedPos.y).toBeCloseTo(newPos.y, 0)
    }

    return wrapper
  }

  /**
   * 测试连接操作
   * @param {Object} component - 画布组件
   * @param {string} scenarioType - 测试场景
   */
  async testConnectionOperations(component, scenarioType = TEST_SCENARIOS.SIMPLE_FLOW) {
    const wrapper = await this.testCanvasInitialization(component)
    const { nodes, edges } = await this.renderScenario(scenarioType)

    // 验证连接渲染
    this.validateEdgesRendered(edges.map(edge => ({
      id: edge.id,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    })))

    // 测试连接删除
    if (edges.length > 0) {
      const firstEdge = edges[0]
      wrapper.vm.graph.removeCell(firstEdge)
      
      await waitForDomUpdate(100)
      
      const remainingEdges = wrapper.vm.graph.getEdges()
      expect(remainingEdges).toHaveLength(edges.length - 1)
    }

    return wrapper
  }

  /**
   * 测试预览线功能
   * @param {Object} component - 画布组件
   */
  async testPreviewLineFeature(component) {
    const wrapper = await this.testCanvasInitialization(component)
    const scenario = this.loadTestScenario(TEST_SCENARIOS.SIMPLE_FLOW)

    // 添加两个节点
    const sourceNode = wrapper.vm.addNode(scenario.nodes[0])
    const targetNode = wrapper.vm.addNode(scenario.nodes[1])

    await waitForDomUpdate(200)

    // 模拟预览线创建
    if (wrapper.vm.startPreviewLine) {
      wrapper.vm.startPreviewLine(sourceNode.id, { x: 200, y: 100 })
      
      await waitForDomUpdate(100)
      
      // 验证预览线存在
      const previewLines = wrapper.vm.graph.getCells().filter(cell => 
        cell.isEdge() && cell.getData()?.isPreview
      )
      expect(previewLines.length).toBeGreaterThan(0)

      // 完成连接
      wrapper.vm.completeConnection(targetNode.id)
      
      await waitForDomUpdate(100)
      
      // 验证预览线转换为正式连接
      const actualEdges = wrapper.vm.graph.getEdges().filter(edge => 
        !edge.getData()?.isPreview
      )
      expect(actualEdges.length).toBeGreaterThan(0)
    }

    return wrapper
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTestUtils extends IntegrationTestBase {
  /**
   * 测试大量节点渲染性能
   * @param {Object} component - 画布组件
   * @param {number} nodeCount - 节点数量
   */
  async testLargeScaleRendering(component, nodeCount = 100) {
    const wrapper = await this.mountComponent(component)
    
    const startTime = performance.now()
    
    // 生成大量节点
    const nodes = []
    for (let i = 0; i < nodeCount; i++) {
      const nodeData = this.dataManager.createNodeData('action', {
        x: (i % 10) * 150 + 100,
        y: Math.floor(i / 10) * 120 + 100,
        label: `节点${i + 1}`
      })
      nodes.push(nodeData)
    }

    // 批量添加节点
    wrapper.vm.graph.addNodes(nodes)
    
    await waitForDomUpdate(500)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime

    // 验证渲染结果
    const renderedNodes = wrapper.vm.graph.getNodes()
    expect(renderedNodes).toHaveLength(nodeCount)

    // 返回性能指标
    return {
      nodeCount,
      renderTime,
      averageTimePerNode: renderTime / nodeCount
    }
  }

  /**
   * 测试交互响应性能
   * @param {Object} component - 画布组件
   */
  async testInteractionPerformance(component) {
    const wrapper = await this.testCanvasInitialization(component)
    const scenario = this.loadTestScenario(TEST_SCENARIOS.COMPLEX_FLOW)
    
    await this.renderScenario(TEST_SCENARIOS.COMPLEX_FLOW)
    
    const nodes = wrapper.vm.graph.getNodes()
    const performanceMetrics = []

    // 测试节点拖拽性能
    for (let i = 0; i < Math.min(5, nodes.length); i++) {
      const node = nodes[i]
      const startPos = node.getPosition()
      const endPos = { x: startPos.x + 100, y: startPos.y + 100 }

      const startTime = performance.now()
      
      await this.simulateUserInteraction('dragNode', {
        nodeId: node.id,
        startPos,
        endPos
      })
      
      const endTime = performance.now()
      
      performanceMetrics.push({
        operation: 'dragNode',
        nodeId: node.id,
        duration: endTime - startTime
      })
    }

    return performanceMetrics
  }
}

// 导出便捷方法
export function createCanvasIntegrationTest(component, testOptions = {}) {
  return new CanvasComponentIntegrationTest().testCanvasInitialization(component, testOptions)
}

export function createPerformanceTest(component, nodeCount = 100) {
  return new PerformanceTestUtils().testLargeScaleRendering(component, nodeCount)
}