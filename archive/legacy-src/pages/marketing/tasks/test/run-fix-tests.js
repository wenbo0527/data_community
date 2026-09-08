/**
 * 节点注册和预览线生成修复验证脚本
 * 用于在浏览器环境中验证修复效果
 */

// 测试配置
const TEST_CONFIG = {
  testNodes: [
    {
      id: 'test-start-node',
      type: 'start',
      x: 200,
      y: 100,
      isConfigured: true,
      label: '开始节点测试'
    },
    {
      id: 'test-sms-node',
      type: 'sms',
      x: 400,
      y: 100,
      isConfigured: true,
      label: 'SMS节点测试'
    },
    {
      id: 'test-ai-call-node',
      type: 'ai-call',
      x: 600,
      y: 100,
      isConfigured: true,
      label: 'AI通话节点测试'
    }
  ],
  testTimeout: 5000
}

class FixTestRunner {
  constructor() {
    this.testResults = []
    this.graphService = null
    this.previewLineSystem = null
    this.graph = null
  }

  /**
   * 初始化测试环境
   */
  async initialize() {
    console.log('🚀 开始初始化测试环境...')
    
    try {
      // 等待画布组件加载
      await this.waitForCanvas()
      
      // 获取服务实例
      this.getServiceInstances()
      
      console.log('✅ 测试环境初始化完成')
      return true
    } catch (error) {
      console.error('❌ 测试环境初始化失败:', error)
      return false
    }
  }

  /**
   * 等待画布加载完成
   */
  async waitForCanvas() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('画布加载超时'))
      }, TEST_CONFIG.testTimeout)

      const checkCanvas = () => {
        const canvasElement = document.querySelector('.x6-graph')
        if (canvasElement && window.taskFlowCanvas) {
          clearTimeout(timeout)
          resolve()
        } else {
          setTimeout(checkCanvas, 100)
        }
      }

      checkCanvas()
    })
  }

  /**
   * 获取服务实例
   */
  getServiceInstances() {
    // 从全局对象或Vue实例中获取服务
    if (window.taskFlowCanvas) {
      this.graph = window.taskFlowCanvas.graph
      this.graphService = window.taskFlowCanvas.graphService
      this.previewLineSystem = window.taskFlowCanvas.previewLineSystem
    } else {
      throw new Error('无法获取画布服务实例')
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始运行修复验证测试...')
    
    const tests = [
      { name: 'ES6导入测试', method: 'testES6Imports' },
      { name: '节点类型信息测试', method: 'testNodeTypeInfo' },
      { name: '预览线生成测试', method: 'testPreviewLineGeneration' },
      { name: '降级逻辑消除测试', method: 'testNoFallbackLogic' },
      { name: '集成测试', method: 'testIntegration' }
    ]

    for (const test of tests) {
      try {
        console.log(`\n📋 运行测试: ${test.name}`)
        const result = await this[test.method]()
        this.testResults.push({
          name: test.name,
          success: result.success,
          message: result.message,
          details: result.details
        })
        
        if (result.success) {
          console.log(`✅ ${test.name} 通过`)
        } else {
          console.log(`❌ ${test.name} 失败: ${result.message}`)
        }
      } catch (error) {
        console.error(`💥 ${test.name} 执行异常:`, error)
        this.testResults.push({
          name: test.name,
          success: false,
          message: error.message,
          details: error.stack
        })
      }
    }

    this.printTestSummary()
  }

  /**
   * 测试ES6导入功能
   */
  async testES6Imports() {
    console.log('  🔍 检查ES6导入是否正常工作...')
    
    try {
      // 测试createNodeConfig是否可用
      const { createNodeConfig } = await import('../composables/canvas/useCanvasNodes.js')
      
      if (typeof createNodeConfig !== 'function') {
        return {
          success: false,
          message: 'createNodeConfig导入失败或不是函数',
          details: `类型: ${typeof createNodeConfig}`
        }
      }

      // 测试getNodeConfig和getNodeAttrs是否可用
      const { getNodeConfig, getNodeAttrs } = await import('../../../../utils/nodeTypes.js')
      
      if (typeof getNodeConfig !== 'function' || typeof getNodeAttrs !== 'function') {
        return {
          success: false,
          message: 'nodeTypes模块导入失败',
          details: `getNodeConfig: ${typeof getNodeConfig}, getNodeAttrs: ${typeof getNodeAttrs}`
        }
      }

      return {
        success: true,
        message: 'ES6导入功能正常',
        details: '所有必需的模块都可以正常导入'
      }
    } catch (error) {
      return {
        success: false,
        message: 'ES6导入测试失败',
        details: error.message
      }
    }
  }

  /**
   * 测试节点类型信息完整性
   */
  async testNodeTypeInfo() {
    console.log('  🔍 检查节点类型信息完整性...')
    
    try {
      const testNode = TEST_CONFIG.testNodes[0]
      
      // 添加测试节点
      const result = await this.graphService.addNode(testNode)
      
      if (!result.success) {
        return {
          success: false,
          message: '节点添加失败',
          details: result.error
        }
      }

      // 获取添加的节点
      const addedNode = this.graph.getCellById(result.nodeId)
      if (!addedNode) {
        return {
          success: false,
          message: '无法获取添加的节点',
          details: `节点ID: ${result.nodeId}`
        }
      }

      // 检查节点数据
      const nodeData = addedNode.getData()
      
      const checks = [
        { field: 'type', value: nodeData.type, expected: testNode.type },
        { field: 'nodeType', value: nodeData.nodeType, expected: testNode.type },
        { field: 'isConfigured', value: nodeData.isConfigured, expected: testNode.isConfigured }
      ]

      const failedChecks = checks.filter(check => check.value !== check.expected)
      
      if (failedChecks.length > 0) {
        return {
          success: false,
          message: '节点类型信息不完整',
          details: failedChecks.map(check => 
            `${check.field}: 期望 ${check.expected}, 实际 ${check.value}`
          ).join('; ')
        }
      }

      // 清理测试节点
      this.graph.removeCell(addedNode)

      return {
        success: true,
        message: '节点类型信息完整',
        details: '所有必需的类型字段都正确设置'
      }
    } catch (error) {
      return {
        success: false,
        message: '节点类型信息测试失败',
        details: error.message
      }
    }
  }

  /**
   * 测试预览线生成功能
   */
  async testPreviewLineGeneration() {
    console.log('  🔍 检查预览线生成功能...')
    
    try {
      const testNode = TEST_CONFIG.testNodes[0]
      
      // 监听预览线创建事件
      let previewLineCreated = false
      const originalCreateMethod = this.previewLineSystem.createUnifiedPreviewLine
      
      this.previewLineSystem.createUnifiedPreviewLine = function(...args) {
        previewLineCreated = true
        console.log('  📍 预览线创建被调用:', args[0]?.id)
        return originalCreateMethod.apply(this, args)
      }

      // 添加测试节点
      const result = await this.graphService.addNode(testNode)
      
      if (!result.success) {
        return {
          success: false,
          message: '节点添加失败，无法测试预览线',
          details: result.error
        }
      }

      // 等待预览线生成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 恢复原方法
      this.previewLineSystem.createUnifiedPreviewLine = originalCreateMethod

      // 清理测试节点
      const addedNode = this.graph.getCellById(result.nodeId)
      if (addedNode) {
        this.graph.removeCell(addedNode)
      }

      if (!previewLineCreated) {
        return {
          success: false,
          message: '预览线未被创建',
          details: '节点添加后预览线生成方法未被调用'
        }
      }

      return {
        success: true,
        message: '预览线生成功能正常',
        details: '节点添加后成功触发预览线创建'
      }
    } catch (error) {
      return {
        success: false,
        message: '预览线生成测试失败',
        details: error.message
      }
    }
  }

  /**
   * 测试降级逻辑是否已消除
   */
  async testNoFallbackLogic() {
    console.log('  🔍 检查降级逻辑是否已消除...')
    
    try {
      // 监听console.warn调用
      const originalWarn = console.warn
      const warnMessages = []
      
      console.warn = function(...args) {
        warnMessages.push(args.join(' '))
        originalWarn.apply(console, args)
      }

      // 添加测试节点
      const testNode = TEST_CONFIG.testNodes[1]
      const result = await this.graphService.addNode(testNode)

      // 恢复console.warn
      console.warn = originalWarn

      // 检查是否有降级逻辑的警告
      const fallbackWarnings = warnMessages.filter(msg => 
        msg.includes('回退') || 
        msg.includes('降级') || 
        msg.includes('fallback') ||
        msg.includes('使用回退逻辑')
      )

      if (fallbackWarnings.length > 0) {
        return {
          success: false,
          message: '仍存在降级逻辑',
          details: `发现降级警告: ${fallbackWarnings.join('; ')}`
        }
      }

      // 清理测试节点
      if (result.success) {
        const addedNode = this.graph.getCellById(result.nodeId)
        if (addedNode) {
          this.graph.removeCell(addedNode)
        }
      }

      return {
        success: true,
        message: '降级逻辑已成功消除',
        details: '未发现任何降级逻辑相关的警告'
      }
    } catch (error) {
      return {
        success: false,
        message: '降级逻辑检查失败',
        details: error.message
      }
    }
  }

  /**
   * 集成测试
   */
  async testIntegration() {
    console.log('  🔍 运行集成测试...')
    
    try {
      const results = []
      
      // 测试多个节点类型
      for (const testNode of TEST_CONFIG.testNodes) {
        console.log(`    📍 测试节点类型: ${testNode.type}`)
        
        // 添加节点
        const addResult = await this.graphService.addNode(testNode)
        
        if (!addResult.success) {
          results.push({
            nodeType: testNode.type,
            success: false,
            error: addResult.error
          })
          continue
        }

        // 验证节点数据
        const addedNode = this.graph.getCellById(addResult.nodeId)
        const nodeData = addedNode?.getData()
        
        const isValid = nodeData && 
                       nodeData.type === testNode.type && 
                       nodeData.nodeType === testNode.type &&
                       nodeData.isConfigured === testNode.isConfigured

        results.push({
          nodeType: testNode.type,
          success: isValid,
          nodeId: addResult.nodeId,
          data: nodeData
        })

        // 清理节点
        if (addedNode) {
          this.graph.removeCell(addedNode)
        }
      }

      const failedTests = results.filter(r => !r.success)
      
      if (failedTests.length > 0) {
        return {
          success: false,
          message: `${failedTests.length}个节点类型测试失败`,
          details: failedTests.map(t => `${t.nodeType}: ${t.error || '数据验证失败'}`).join('; ')
        }
      }

      return {
        success: true,
        message: '集成测试通过',
        details: `成功测试了${results.length}种节点类型`
      }
    } catch (error) {
      return {
        success: false,
        message: '集成测试失败',
        details: error.message
      }
    }
  }

  /**
   * 打印测试摘要
   */
  printTestSummary() {
    console.log('\n📊 测试结果摘要:')
    console.log('=' .repeat(50))
    
    const passedTests = this.testResults.filter(r => r.success)
    const failedTests = this.testResults.filter(r => !r.success)
    
    console.log(`✅ 通过: ${passedTests.length}`)
    console.log(`❌ 失败: ${failedTests.length}`)
    console.log(`📈 成功率: ${((passedTests.length / this.testResults.length) * 100).toFixed(1)}%`)
    
    if (failedTests.length > 0) {
      console.log('\n❌ 失败的测试:')
      failedTests.forEach(test => {
        console.log(`  • ${test.name}: ${test.message}`)
        if (test.details) {
          console.log(`    详情: ${test.details}`)
        }
      })
    }
    
    console.log('\n' + '='.repeat(50))
    
    // 返回测试结果供外部使用
    return {
      total: this.testResults.length,
      passed: passedTests.length,
      failed: failedTests.length,
      results: this.testResults
    }
  }
}

// 导出测试运行器
window.FixTestRunner = FixTestRunner

// 自动运行测试的便捷函数
window.runFixTests = async function() {
  const runner = new FixTestRunner()
  
  const initialized = await runner.initialize()
  if (!initialized) {
    console.error('❌ 测试环境初始化失败，无法运行测试')
    return false
  }
  
  return await runner.runAllTests()
}

// 页面加载完成后提示用户
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 修复验证测试已加载，使用 runFixTests() 开始测试')
  })
} else {
  console.log('🧪 修复验证测试已加载，使用 runFixTests() 开始测试')
}

export { FixTestRunner }