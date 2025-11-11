/**
 * 改进的边创建测试用例
 * 基于之前发现的问题，增强测试覆盖率和真实性
 */

import { Graph } from '@antv/x6'
import { GraphService } from './services/GraphService.js'
import { UnifiedEdgeManager } from './composables/canvas/unified/UnifiedEdgeManager.js'

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  verbose: true
}

// 创建真实的测试图形实例
function createRealTestGraph() {
  const container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  container.style.position = 'absolute'
  container.style.top = '-9999px' // 隐藏但保持在DOM中
  document.body.appendChild(container)
  
  const graph = new Graph({
    container,
    width: 800,
    height: 600,
    grid: true,
    panning: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
  })
  
  return { graph, container }
}

// 测试数据 - 包含各种边界情况
const TEST_DATA = {
  // 正常节点
  validNodes: [
    {
      id: 'node1',
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      label: '源节点',
      type: 'task'
    },
    {
      id: 'node2',
      x: 300,
      y: 200,
      width: 120,
      height: 60,
      label: '目标节点',
      type: 'task'
    },
    {
      id: 'node3',
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      label: '第三节点',
      type: 'task'
    }
  ],
  
  // 各种格式的边数据
  edgeTestCases: [
    {
      name: '标准格式连接线',
      data: {
        id: 'edge-standard',
        source: { cell: 'node1', port: 'out' },
        target: { cell: 'node2', port: 'in' },
        type: 'connection'
      },
      expected: { shouldSucceed: true, type: 'connection' }
    },
    {
      name: '预览线格式',
      data: {
        id: 'edge-preview',
        source: { cell: 'node2' },
        isPreview: true,
        type: 'preview'
      },
      expected: { shouldSucceed: true, type: 'preview' }
    },
    {
      name: '旧格式边数据',
      data: {
        id: 'edge-old-format',
        source: 'node1',
        target: 'node3',
        type: 'connection'
      },
      expected: { shouldSucceed: true, type: 'connection', hasConversion: true }
    },
    {
      name: '空源节点对象',
      data: {
        id: 'edge-empty-source-obj',
        source: {},
        target: { cell: 'node2', port: 'in' },
        type: 'connection'
      },
      expected: { shouldSucceed: false, error: '源节点ID必须是非空字符串' }
    },
    {
      name: '空源节点ID',
      data: {
        id: 'edge-empty-source-id',
        source: { cell: '', port: 'out' },
        target: { cell: 'node2', port: 'in' },
        type: 'connection'
      },
      expected: { shouldSucceed: false, error: '源节点ID必须是非空字符串' }
    },
    {
      name: '未定义目标节点',
      data: {
        id: 'edge-undefined-target',
        source: { cell: 'node1', port: 'out' },
        target: undefined,
        type: 'connection'
      },
      expected: { shouldSucceed: false, error: '目标节点配置无效' }
    },
    {
      name: '不存在的源节点',
      data: {
        id: 'edge-nonexistent-source',
        source: { cell: 'nonexistent-node', port: 'out' },
        target: { cell: 'node2', port: 'in' },
        type: 'connection'
      },
      expected: { shouldSucceed: false, error: '源节点不存在' }
    },
    {
      name: '不存在的目标节点',
      data: {
        id: 'edge-nonexistent-target',
        source: { cell: 'node1', port: 'out' },
        target: { cell: 'nonexistent-target', port: 'in' },
        type: 'connection'
      },
      expected: { shouldSucceed: false, error: '目标节点不存在' }
    }
  ]
}

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    }
  }
  
  addResult(testName, success, details = {}) {
    this.results.total++
    if (success) {
      this.results.passed++
    } else {
      this.results.failed++
      this.results.errors.push({ testName, details })
    }
    
    this.results.details.push({
      testName,
      success,
      timestamp: Date.now(),
      ...details
    })
  }
  
  getSummary() {
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1)
    return {
      ...this.results,
      successRate: `${successRate}%`
    }
  }
}

// 主测试函数
export async function runImprovedEdgeCreationTest() {
  console.log('🧪 开始改进的边创建测试...')
  
  const collector = new TestResultCollector()
  const { graph, container } = createRealTestGraph()
  
  try {
    const graphService = new GraphService(graph)
    await graphService.initialize(graph)
    
    // 测试1: 数据预处理测试
    console.log('\n🔍 测试1: 边数据预处理功能')
    await testEdgeDataPreprocessing(graphService, collector)
    
    // 测试2: 真实环境边创建测试
    console.log('\n🔍 测试2: 真实环境边创建')
    await testRealEnvironmentEdgeCreation(graphService, collector)
    
    // 测试3: 错误处理和恢复测试
    console.log('\n🔍 测试3: 错误处理和恢复机制')
    await testErrorHandlingAndRecovery(graphService, collector)
    
    // 测试4: 批量数据加载测试
    console.log('\n🔍 测试4: 批量数据加载')
    await testBatchDataLoading(graphService, collector)
    
    // 测试5: UnifiedEdgeManager直接测试
    console.log('\n🔍 测试5: UnifiedEdgeManager直接功能')
    await testUnifiedEdgeManagerDirect(graph, collector)
    
    // 生成测试报告
    const summary = collector.getSummary()
    console.log('\n📊 测试完成，结果汇总:')
    console.log(`✅ 成功: ${summary.passed}/${summary.total} (${summary.successRate})`)
    console.log(`❌ 失败: ${summary.failed}/${summary.total}`)
    
    if (summary.errors.length > 0) {
      console.log('\n❌ 失败的测试:')
      summary.errors.forEach(error => {
        console.log(`  - ${error.testName}: ${error.details.error || '未知错误'}`)
      })
    }
    
    return {
      success: summary.failed === 0,
      summary,
      message: `测试完成: ${summary.successRate} 成功率`
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生严重错误:', error)
    return {
      success: false,
      error: error.message,
      message: '测试执行失败'
    }
  } finally {
    // 清理DOM
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

// 测试1: 边数据预处理功能
async function testEdgeDataPreprocessing(graphService, collector) {
  // 先添加测试节点
  for (const nodeData of TEST_DATA.validNodes) {
    await graphService.addNode(nodeData)
  }
  
  for (const testCase of TEST_DATA.edgeTestCases) {
    try {
      console.log(`  测试: ${testCase.name}`)
      
      if (testCase.expected.shouldSucceed) {
        const result = await graphService.addEdge(testCase.data)
        
        if (result) {
          console.log(`    ✅ ${testCase.name}: 成功`)
          collector.addResult(testCase.name, true, { 
            type: 'preprocessing',
            edgeId: result.id 
          })
        } else {
          console.log(`    ❌ ${testCase.name}: 应该成功但失败了`)
          collector.addResult(testCase.name, false, { 
            type: 'preprocessing',
            error: '应该成功但返回null' 
          })
        }
      } else {
        // 应该失败的测试
        try {
          await graphService.addEdge(testCase.data)
          console.log(`    ❌ ${testCase.name}: 应该失败但成功了`)
          collector.addResult(testCase.name, false, { 
            type: 'preprocessing',
            error: '应该失败但成功了' 
          })
        } catch (error) {
          if (error.message.includes(testCase.expected.error) || 
              testCase.expected.error.includes(error.message.split(':')[0])) {
            console.log(`    ✅ ${testCase.name}: 正确处理错误`)
            collector.addResult(testCase.name, true, { 
              type: 'preprocessing',
              expectedError: testCase.expected.error,
              actualError: error.message 
            })
          } else {
            console.log(`    ⚠️ ${testCase.name}: 错误信息不匹配`)
            console.log(`      期望: ${testCase.expected.error}`)
            console.log(`      实际: ${error.message}`)
            collector.addResult(testCase.name, false, { 
              type: 'preprocessing',
              error: '错误信息不匹配',
              expectedError: testCase.expected.error,
              actualError: error.message 
            })
          }
        }
      }
    } catch (error) {
      console.log(`    ❌ ${testCase.name}: 测试执行失败 - ${error.message}`)
      collector.addResult(testCase.name, false, { 
        type: 'preprocessing',
        error: error.message 
      })
    }
  }
}

// 测试2: 真实环境边创建
async function testRealEnvironmentEdgeCreation(graphService, collector) {
  const testCases = [
    {
      name: '正常连接线创建',
      action: async () => {
        return await graphService.addEdge({
          id: 'real-test-connection',
          source: { cell: 'node1', port: 'out' },
          target: { cell: 'node2', port: 'in' }
        })
      }
    },
    {
      name: '预览线创建',
      action: async () => {
        return await graphService.addEdge({
          id: 'real-test-preview',
          source: { cell: 'node2' },
          isPreview: true
        })
      }
    }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`  测试: ${testCase.name}`)
      const result = await testCase.action()
      
      if (result) {
        console.log(`    ✅ ${testCase.name}: 成功`)
        collector.addResult(testCase.name, true, { 
          type: 'real-environment',
          edgeId: result.id 
        })
      } else {
        console.log(`    ❌ ${testCase.name}: 返回null`)
        collector.addResult(testCase.name, false, { 
          type: 'real-environment',
          error: '返回null' 
        })
      }
    } catch (error) {
      console.log(`    ❌ ${testCase.name}: ${error.message}`)
      collector.addResult(testCase.name, false, { 
        type: 'real-environment',
        error: error.message 
      })
    }
  }
}

// 测试3: 错误处理和恢复
async function testErrorHandlingAndRecovery(graphService, collector) {
  console.log('  测试错误处理后的状态恢复...')
  
  try {
    const beforeStats = {
      nodes: graphService.getNodes().length,
      edges: graphService.getEdges().length
    }
    
    // 尝试创建一个会失败的边
    try {
      await graphService.addEdge({
        id: 'recovery-test-edge',
        source: { cell: 'nonexistent-node' },
        target: { cell: 'node1' }
      })
    } catch (error) {
      // 预期的错误，忽略
    }
    
    const afterStats = {
      nodes: graphService.getNodes().length,
      edges: graphService.getEdges().length
    }
    
    // 验证状态没有被破坏
    if (beforeStats.nodes === afterStats.nodes && beforeStats.edges === afterStats.edges) {
      console.log('    ✅ 错误处理后状态正常')
      collector.addResult('错误恢复测试', true, { 
        type: 'error-recovery',
        beforeStats,
        afterStats 
      })
    } else {
      console.log('    ❌ 错误处理后状态异常')
      collector.addResult('错误恢复测试', false, { 
        type: 'error-recovery',
        error: '状态不一致',
        beforeStats,
        afterStats 
      })
    }
  } catch (error) {
    console.log(`    ❌ 错误恢复测试失败: ${error.message}`)
    collector.addResult('错误恢复测试', false, { 
      type: 'error-recovery',
      error: error.message 
    })
  }
}

// 测试4: 批量数据加载
async function testBatchDataLoading(graphService, collector) {
  console.log('  测试批量数据加载...')
  
  try {
    // 清空现有数据
    await graphService.clearGraph()
    
    // 准备测试数据
    const batchData = {
      nodes: TEST_DATA.validNodes,
      edges: [
        {
          id: 'batch-edge-1',
          source: { cell: 'node1', port: 'out' },
          target: { cell: 'node2', port: 'in' }
        },
        {
          id: 'batch-preview-1',
          source: { cell: 'node2' },
          isPreview: true
        },
        // 包含一些有问题的数据
        {
          id: 'batch-bad-1',
          source: { cell: 'nonexistent' },
          target: { cell: 'node1' }
        }
      ]
    }
    
    await graphService.loadGraphData(batchData)
    
    const finalNodes = graphService.getNodes()
    const finalEdges = graphService.getEdges()
    
    console.log(`    📊 加载结果: ${finalNodes.length}个节点, ${finalEdges.length}个边`)
    
    // 验证结果
    if (finalNodes.length === batchData.nodes.length && finalEdges.length >= 1) {
      console.log('    ✅ 批量数据加载成功')
      collector.addResult('批量数据加载', true, { 
        type: 'batch-loading',
        nodesLoaded: finalNodes.length,
        edgesLoaded: finalEdges.length 
      })
    } else {
      console.log('    ❌ 批量数据加载结果异常')
      collector.addResult('批量数据加载', false, { 
        type: 'batch-loading',
        error: '加载结果不符合预期',
        expected: { nodes: batchData.nodes.length, edges: '>=1' },
        actual: { nodes: finalNodes.length, edges: finalEdges.length }
      })
    }
  } catch (error) {
    console.log(`    ❌ 批量数据加载失败: ${error.message}`)
    collector.addResult('批量数据加载', false, { 
      type: 'batch-loading',
      error: error.message 
    })
  }
}

// 测试5: UnifiedEdgeManager直接测试
async function testUnifiedEdgeManagerDirect(graph, collector) {
  console.log('  测试UnifiedEdgeManager直接功能...')
  
  try {
    const edgeManager = new UnifiedEdgeManager(graph)
    
    // 测试源节点ID验证
    const testCases = [
      {
        name: 'UnifiedEdgeManager-正常预览线',
        action: () => edgeManager.createPreviewLineDirectly('node1'),
        shouldSucceed: true
      },
      {
        name: 'UnifiedEdgeManager-空源节点ID',
        action: () => edgeManager.createPreviewLineDirectly(''),
        shouldSucceed: false
      },
      {
        name: 'UnifiedEdgeManager-null源节点ID',
        action: () => edgeManager.createPreviewLineDirectly(null),
        shouldSucceed: false
      },
      {
        name: 'UnifiedEdgeManager-不存在的源节点',
        action: () => edgeManager.createPreviewLineDirectly('nonexistent-node'),
        shouldSucceed: false
      }
    ]
    
    for (const testCase of testCases) {
      try {
        console.log(`    测试: ${testCase.name}`)
        const result = await testCase.action()
        
        if (testCase.shouldSucceed) {
          if (result) {
            console.log(`      ✅ ${testCase.name}: 成功`)
            collector.addResult(testCase.name, true, { 
              type: 'unified-edge-manager',
              result: result.id 
            })
          } else {
            console.log(`      ❌ ${testCase.name}: 应该成功但返回null`)
            collector.addResult(testCase.name, false, { 
              type: 'unified-edge-manager',
              error: '应该成功但返回null' 
            })
          }
        } else {
          console.log(`      ❌ ${testCase.name}: 应该失败但成功了`)
          collector.addResult(testCase.name, false, { 
            type: 'unified-edge-manager',
            error: '应该失败但成功了' 
          })
        }
      } catch (error) {
        if (testCase.shouldSucceed) {
          console.log(`      ❌ ${testCase.name}: 意外失败 - ${error.message}`)
          collector.addResult(testCase.name, false, { 
            type: 'unified-edge-manager',
            error: error.message 
          })
        } else {
          console.log(`      ✅ ${testCase.name}: 正确处理错误`)
          collector.addResult(testCase.name, true, { 
            type: 'unified-edge-manager',
            expectedError: true,
            actualError: error.message 
          })
        }
      }
    }
  } catch (error) {
    console.log(`    ❌ UnifiedEdgeManager测试失败: ${error.message}`)
    collector.addResult('UnifiedEdgeManager初始化', false, { 
      type: 'unified-edge-manager',
      error: error.message 
    })
  }
}

// 如果直接运行此文件
if (typeof window !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runImprovedEdgeCreationTest().then(result => {
    console.log('🏁 改进测试完成:', result)
  }).catch(error => {
    console.error('🚨 改进测试失败:', error)
  })
}