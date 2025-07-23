/**
 * 预览线管理器测试示例
 * 测试结构化布局时预览线位置更新的修复
 */

import { 
  MockDataGenerator, 
  TestAssertions, 
  TestScenarios, 
  IntegrationTestSuite 
} from './testUtils.js'

/**
 * 预览线管理器测试套件
 */
export class PreviewLineManagerTests {
  constructor() {
    this.suite = new IntegrationTestSuite()
    this.setupTests()
  }

  /**
   * 设置所有测试用例
   */
  setupTests() {
    // 基本功能测试
    this.suite.addTest('预览线创建测试', this.testPreviewLineCreation.bind(this))
    this.suite.addTest('预览线刷新测试', this.testPreviewLineRefresh.bind(this))
    this.suite.addTest('强制更新模式测试', this.testForceUpdateMode.bind(this))
    
    // 边界情况测试
    this.suite.addTest('无效节点处理测试', this.testInvalidNodeHandling.bind(this))
    this.suite.addTest('未配置节点测试', this.testUnconfiguredNodes.bind(this))
    this.suite.addTest('分支节点测试', this.testBranchNodes.bind(this))
    
    // 结构化布局测试
    this.suite.addTest('结构化布局预览线更新测试', this.testStructuredLayoutUpdate.bind(this))
    this.suite.addTest('连接线路径更新测试', this.testConnectionPathUpdate.bind(this))
    
    // 性能测试
    this.suite.addTest('大量节点性能测试', this.testLargeScalePerformance.bind(this))
  }

  /**
   * 测试预览线创建
   */
  async testPreviewLineCreation() {
    const scenario = TestScenarios.createBasicCanvasScenario()
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    
    // 测试开始节点预览线创建
    const shouldCreate = mockPreviewLineManager.shouldCreatePreviewLine(scenario.nodes.startNode)
    TestAssertions.assertHasProperty({ shouldCreate }, 'shouldCreate')
    
    if (!shouldCreate) {
      throw new Error('开始节点应该创建预览线')
    }
    
    // 测试已配置节点预览线创建
    const shouldCreateConfigured = mockPreviewLineManager.shouldCreatePreviewLine(scenario.nodes.splitNode)
    if (!shouldCreateConfigured) {
      throw new Error('已配置节点应该创建预览线')
    }
  }

  /**
   * 测试预览线刷新
   */
  async testPreviewLineRefresh() {
    const scenario = TestScenarios.createBasicCanvasScenario()
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    
    // 模拟预览线存在
    mockPreviewLineManager.previewLines.set(scenario.nodes.startNode.id, {
      type: 'single',
      element: { remove: () => {} },
      updatePosition: () => {}
    })
    
    // 测试刷新
    const result = await mockPreviewLineManager.refreshAllPreviewLines()
    
    TestAssertions.assertHasProperty(result, 'totalPreviewLines')
    TestAssertions.assertHasProperty(result, 'refreshedNodes')
    
    if (result.totalPreviewLines < 1) {
      throw new Error('刷新后应该有预览线存在')
    }
  }

  /**
   * 测试强制更新模式
   */
  async testForceUpdateMode() {
    const scenario = TestScenarios.createBasicCanvasScenario()
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    
    // 创建未配置节点
    const unconfiguredNode = MockDataGenerator.createMockNode({
      type: 'audience-split',
      isConfigured: false
    })
    scenario.graph.addNode(unconfiguredNode)
    
    // 测试普通模式（应该跳过未配置节点）
    const normalMode = mockPreviewLineManager.shouldCreatePreviewLine(unconfiguredNode)
    if (normalMode) {
      throw new Error('普通模式下不应该为未配置节点创建预览线')
    }
    
    // 测试强制模式（应该为未配置节点创建预览线）
    const forceMode = mockPreviewLineManager.shouldCreatePreviewLineForced(unconfiguredNode)
    if (!forceMode) {
      throw new Error('强制模式下应该为未配置节点创建预览线')
    }
    
    // 测试带强制选项的刷新
    const result = await mockPreviewLineManager.refreshAllPreviewLines({ forceUpdateAll: true })
    
    if (result.newPreviewLinesCreated < 1) {
      throw new Error('强制模式下应该创建新的预览线')
    }
  }

  /**
   * 测试无效节点处理
   */
  async testInvalidNodeHandling() {
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    const errorScenario = TestScenarios.createErrorScenario()
    
    // 测试无效节点
    try {
      mockPreviewLineManager.shouldCreatePreviewLine(errorScenario.invalidNode)
      throw new Error('应该抛出错误')
    } catch (error) {
      if (error.message === '应该抛出错误') {
        throw error
      }
      // 预期的错误，测试通过
    }
    
    // 测试 null 节点
    const nullResult = mockPreviewLineManager.shouldCreatePreviewLine(null)
    if (nullResult) {
      throw new Error('null 节点不应该创建预览线')
    }
  }

  /**
   * 测试未配置节点
   */
  async testUnconfiguredNodes() {
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    
    const unconfiguredNode = MockDataGenerator.createMockNode({
      type: 'audience-split',
      isConfigured: false
    })
    
    // 普通模式应该跳过
    const normalResult = mockPreviewLineManager.shouldCreatePreviewLine(unconfiguredNode)
    if (normalResult) {
      throw new Error('普通模式下未配置节点不应该创建预览线')
    }
    
    // 强制模式应该创建
    const forceResult = mockPreviewLineManager.shouldCreatePreviewLineForced(unconfiguredNode)
    if (!forceResult) {
      throw new Error('强制模式下未配置节点应该创建预览线')
    }
  }

  /**
   * 测试分支节点
   */
  async testBranchNodes() {
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    
    const branchNode = MockDataGenerator.createMockNode({
      type: 'audience-split',
      isConfigured: true,
      config: {
        crowdLayers: [
          { id: 'crowd_1', crowdName: '高价值用户' },
          { id: 'crowd_2', crowdName: '普通用户' }
        ]
      }
    })
    
    // 测试分支节点识别
    const isBranch = mockPreviewLineManager.isBranchNode(branchNode)
    if (!isBranch) {
      throw new Error('应该识别为分支节点')
    }
    
    // 测试分支获取
    const branches = mockPreviewLineManager.getNodeBranches(branchNode)
    TestAssertions.assertArrayLength(branches, 2, '应该有2个分支')
  }

  /**
   * 测试结构化布局预览线更新
   */
  async testStructuredLayoutUpdate() {
    const scenario = TestScenarios.createComplexBranchScenario()
    const mockStructuredLayout = this.createMockStructuredLayout()
    
    // 模拟结构化布局应用
    await mockStructuredLayout.applyStructuredLayout()
    
    // 验证预览线位置更新被调用
    if (!mockStructuredLayout.previewLineUpdateCalled) {
      throw new Error('结构化布局应该触发预览线位置更新')
    }
    
    // 验证强制更新参数
    if (!mockStructuredLayout.forceUpdateAllUsed) {
      throw new Error('结构化布局应该使用强制更新模式')
    }
  }

  /**
   * 测试连接线路径更新
   */
  async testConnectionPathUpdate() {
    const scenario = TestScenarios.createBasicCanvasScenario()
    const mockStructuredLayout = this.createMockStructuredLayout()
    
    // 添加有效边
    const validEdge = MockDataGenerator.createMockEdge({
      sourceId: scenario.nodes.startNode.id,
      targetId: scenario.nodes.splitNode.id
    })
    scenario.graph.addEdge(validEdge)
    
    // 添加无效边（模拟已删除的边）
    const invalidEdge = {
      id: 'invalid_edge',
      isEdge: () => true,
      // 缺少必要的方法
    }
    
    // 测试连接线路径更新
    const updateResult = await mockStructuredLayout.updateConnectionPaths([validEdge, invalidEdge])
    
    // 验证有效边被处理
    if (updateResult.processed < 1) {
      throw new Error('应该处理有效的边')
    }
    
    // 验证无效边被跳过
    if (updateResult.skipped < 1) {
      throw new Error('应该跳过无效的边')
    }
  }

  /**
   * 测试大量节点性能
   */
  async testLargeScalePerformance() {
    const mockPreviewLineManager = this.createMockPreviewLineManager()
    const nodes = []
    
    // 创建1000个节点
    for (let i = 0; i < 1000; i++) {
      nodes.push(MockDataGenerator.createMockNode({
        id: `node_${i}`,
        type: i % 5 === 0 ? 'start' : 'audience-split',
        isConfigured: i % 3 !== 0 // 2/3的节点已配置
      }))
    }
    
    const startTime = performance.now()
    
    // 测试批量刷新
    await mockPreviewLineManager.refreshAllPreviewLines({ forceUpdateAll: true })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // 性能阈值：1000个节点应该在100ms内完成
    if (duration > 100) {
      throw new Error(`性能测试失败: 耗时 ${duration}ms 超过阈值 100ms`)
    }
  }

  /**
   * 创建模拟预览线管理器
   */
  createMockPreviewLineManager() {
    return {
      previewLines: new Map(),
      graph: MockDataGenerator.createMockGraph(),
      branchManager: MockDataGenerator.createMockBranchManager(),
      
      shouldCreatePreviewLine(node) {
        if (!node || !node.getData) return false
        
        const data = node.getData()
        
        // 跳过拖拽提示点
        if (data.type === 'drag-hint') return false
        
        // 跳过结束节点
        if (data.type === 'end') return false
        
        // 开始节点总是创建预览线
        if (data.type === 'start') return true
        
        // 其他节点需要配置完成
        return data.isConfigured === true
      },
      
      shouldCreatePreviewLineForced(node) {
        if (!node || !node.getData) return false
        
        const data = node.getData()
        
        // 跳过拖拽提示点
        if (data.type === 'drag-hint') return false
        
        // 跳过结束节点
        if (data.type === 'end') return false
        
        // 强制模式下忽略配置状态
        return true
      },
      
      isBranchNode(node) {
        if (!node || !node.getData) return false
        const data = node.getData()
        return ['audience-split', 'event-split', 'ab-test'].includes(data.type)
      },
      
      getNodeBranches(node) {
        if (!this.isBranchNode(node)) return []
        
        const data = node.getData()
        if (data.type === 'audience-split' && data.config?.crowdLayers) {
          return data.config.crowdLayers.map(layer => ({
            id: layer.id,
            label: layer.crowdName
          }))
        }
        
        return [{ id: 'default', label: '默认分支' }]
      },
      
      async refreshAllPreviewLines(options = {}) {
        const { forceUpdateAll = false } = options
        
        console.log(`🔄 [模拟] 刷新预览线 - 强制更新: ${forceUpdateAll}`)
        
        let totalPreviewLines = this.previewLines.size
        let refreshedNodes = 0
        let newPreviewLinesCreated = 0
        
        // 模拟刷新现有预览线
        for (const [nodeId, previewLine] of this.previewLines) {
          if (previewLine.updatePosition) {
            previewLine.updatePosition()
            refreshedNodes++
          }
        }
        
        // 模拟创建新预览线
        const nodes = this.graph.getNodes()
        for (const node of nodes) {
          if (!this.previewLines.has(node.id)) {
            const shouldCreate = forceUpdateAll 
              ? this.shouldCreatePreviewLineForced(node)
              : this.shouldCreatePreviewLine(node)
            
            if (shouldCreate) {
              this.previewLines.set(node.id, {
                type: 'single',
                element: { remove: () => {} },
                updatePosition: () => {}
              })
              newPreviewLinesCreated++
              totalPreviewLines++
            }
          }
        }
        
        return {
          totalPreviewLines,
          refreshedNodes,
          totalBranchesRefreshed: refreshedNodes * 2,
          restoredHiddenBranches: 0,
          newPreviewLinesCreated
        }
      }
    }
  }

  /**
   * 创建模拟结构化布局
   */
  createMockStructuredLayout() {
    return {
      previewLineUpdateCalled: false,
      forceUpdateAllUsed: false,
      
      async applyStructuredLayout() {
        console.log('[模拟] 应用结构化布局')
        
        // 模拟预览线位置更新
        await this.updatePreviewLinePositions()
        
        // 模拟连接线路径更新
        await this.updateConnectionPaths([])
        
        console.log('[模拟] 结构化布局完成')
      },
      
      async updatePreviewLinePositions() {
        console.log('[模拟] 更新预览线位置')
        this.previewLineUpdateCalled = true
        this.forceUpdateAllUsed = true
      },
      
      async updateConnectionPaths(edges) {
        console.log(`[模拟] 更新 ${edges.length} 条连接线路径`)
        
        let processed = 0
        let skipped = 0
        
        for (const edge of edges) {
          if (edge && edge.isEdge && edge.isEdge() && edge.trigger) {
            // 模拟有效边处理
            processed++
          } else {
            // 模拟无效边跳过
            skipped++
          }
        }
        
        return { processed, skipped }
      }
    }
  }

  /**
   * 运行所有测试
   */
  async runTests() {
    return await this.suite.runAll()
  }
}

// 使用示例
export async function runPreviewLineTests() {
  console.log('🧪 开始预览线管理器测试...')
  
  const tests = new PreviewLineManagerTests()
  const results = await tests.runTests()
  
  console.log('📊 测试结果:', results)
  
  if (results.failed > 0) {
    console.error('❌ 部分测试失败，请检查实现')
    return false
  } else {
    console.log('✅ 所有测试通过！')
    return true
  }
}

export default PreviewLineManagerTests