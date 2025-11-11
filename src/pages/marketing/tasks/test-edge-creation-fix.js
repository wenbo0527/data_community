/**
 * 测试边创建错误修复
 * 验证修复后的代码能够正确处理各种边界情况
 */

import { Graph } from '@antv/x6'
import { GraphService } from './services/GraphService.js'
import { UnifiedEdgeManager } from './composables/canvas/unified/UnifiedEdgeManager.js'

// 创建测试图形实例
function createTestGraph() {
  const container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
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

// 测试数据
const testNodes = [
  {
    id: 'node1',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    label: '测试节点1',
    type: 'task'
  },
  {
    id: 'node2',
    x: 300,
    y: 200,
    width: 120,
    height: 60,
    label: '测试节点2',
    type: 'task'
  },
  {
    id: 'node3',
    x: 500,
    y: 100,
    width: 120,
    height: 60,
    label: '测试节点3',
    type: 'task'
  }
]

// 测试边数据 - 包含各种问题情况
const testEdges = [
  // 正常的连接线
  {
    id: 'edge1',
    source: { cell: 'node1', port: 'out' },
    target: { cell: 'node2', port: 'in' },
    type: 'connection'
  },
  
  // 预览线（目标节点可能不存在）
  {
    id: 'preview-line-1',
    source: { cell: 'node2' },
    target: { cell: 'virtual-target-1' },
    isPreview: true,
    type: 'preview'
  },
  
  // 有问题的边数据 - 缺少source.cell
  {
    id: 'edge-bad-1',
    source: {},
    target: { cell: 'node3', port: 'in' },
    type: 'connection'
  },
  
  // 有问题的边数据 - target为undefined
  {
    id: 'edge-bad-2',
    source: { cell: 'node1', port: 'out' },
    target: undefined,
    type: 'connection'
  },
  
  // 有问题的边数据 - 源节点不存在
  {
    id: 'edge-bad-3',
    source: { cell: 'nonexistent-node', port: 'out' },
    target: { cell: 'node3', port: 'in' },
    type: 'connection'
  },
  
  // 旧格式的边数据
  {
    id: 'edge-old-format',
    source: 'node1',
    target: 'node3',
    type: 'connection'
  }
]

// 运行测试
export async function runEdgeCreationFixTest() {
  console.log('🧪 开始边创建错误修复测试...')
  
  const { graph, container } = createTestGraph()
  const graphService = new GraphService(graph)
  
  try {
    // 初始化GraphService
    await graphService.initialize(graph)
    
    console.log('📊 测试数据统计:')
    console.log(`- 节点数量: ${testNodes.length}`)
    console.log(`- 边数量: ${testEdges.length}`)
    
    // 测试1: 加载图形数据
    console.log('\n🔍 测试1: 加载图形数据')
    const loadResult = await graphService.loadGraphData({
      nodes: testNodes,
      edges: testEdges
    })
    
    // 验证加载结果
    const finalNodes = graphService.getNodes()
    const finalEdges = graphService.getEdges()
    
    console.log('\n📊 加载结果统计:')
    console.log(`- 成功加载节点: ${finalNodes.length}/${testNodes.length}`)
    console.log(`- 成功加载边: ${finalEdges.length}/${testEdges.length}`)
    
    // 测试2: 单独测试边创建
    console.log('\n🔍 测试2: 单独测试边创建')
    
    // 测试正常边创建
    try {
      const normalEdge = await graphService.addEdge({
        id: 'test-normal-edge',
        source: { cell: 'node1', port: 'out' },
        target: { cell: 'node2', port: 'in' }
      })
      console.log('✅ 正常边创建成功')
    } catch (error) {
      console.error('❌ 正常边创建失败:', error.message)
    }
    
    // 测试预览线创建
    try {
      const previewEdge = await graphService.addEdge({
        id: 'test-preview-edge',
        source: { cell: 'node2' },
        isPreview: true
      })
      console.log('✅ 预览线创建成功')
    } catch (error) {
      console.error('❌ 预览线创建失败:', error.message)
    }
    
    // 测试错误数据处理
    console.log('\n🔍 测试3: 错误数据处理')
    
    const errorTestCases = [
      {
        name: '空源节点ID',
        data: { id: 'test-empty-source', source: { cell: '' }, target: { cell: 'node1' } }
      },
      {
        name: '未定义目标节点',
        data: { id: 'test-undefined-target', source: { cell: 'node1' }, target: undefined }
      },
      {
        name: '不存在的源节点',
        data: { id: 'test-nonexistent-source', source: { cell: 'fake-node' }, target: { cell: 'node1' } }
      }
    ]
    
    for (const testCase of errorTestCases) {
      try {
        await graphService.addEdge(testCase.data)
        console.log(`⚠️ ${testCase.name}: 应该失败但成功了`)
      } catch (error) {
        console.log(`✅ ${testCase.name}: 正确处理错误 - ${error.message}`)
      }
    }
    
    // 测试4: UnifiedEdgeManager直接测试
    console.log('\n🔍 测试4: UnifiedEdgeManager直接测试')
    
    const edgeManager = new UnifiedEdgeManager(graph)
    
    // 测试预览线创建
    try {
      const previewResult = await edgeManager.createPreviewLineDirectly('node1')
      console.log('✅ UnifiedEdgeManager预览线创建成功')
    } catch (error) {
      console.log(`❌ UnifiedEdgeManager预览线创建失败: ${error.message}`)
    }
    
    // 测试空源节点ID
    try {
      const emptyResult = await edgeManager.createPreviewLineDirectly('')
      console.log('⚠️ 空源节点ID应该失败但成功了')
    } catch (error) {
      console.log(`✅ 空源节点ID正确处理错误: ${error.message}`)
    }
    
    // 测试不存在的源节点ID
    try {
      const nonexistentResult = await edgeManager.createPreviewLineDirectly('nonexistent-node')
      console.log('⚠️ 不存在的源节点ID应该失败但成功了')
    } catch (error) {
      console.log(`✅ 不存在的源节点ID正确处理错误: ${error.message}`)
    }
    
    // 最终统计
    const finalStats = {
      totalNodes: finalNodes.length,
      totalEdges: finalEdges.length,
      previewLines: finalEdges.filter(edge => {
        const data = edge.getData() || {}
        return data.isPreview || edge.id.includes('preview')
      }).length,
      connections: finalEdges.filter(edge => {
        const data = edge.getData() || {}
        return !data.isPreview && !edge.id.includes('preview')
      }).length
    }
    
    console.log('\n📊 最终测试结果:')
    console.log(`- 总节点数: ${finalStats.totalNodes}`)
    console.log(`- 总边数: ${finalStats.totalEdges}`)
    console.log(`- 预览线数: ${finalStats.previewLines}`)
    console.log(`- 连接线数: ${finalStats.connections}`)
    
    // 清理
    document.body.removeChild(container)
    
    return {
      success: true,
      stats: finalStats,
      message: '边创建错误修复测试完成'
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    document.body.removeChild(container)
    
    return {
      success: false,
      error: error.message,
      message: '边创建错误修复测试失败'
    }
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runEdgeCreationFixTest().then(result => {
    console.log('🏁 测试完成:', result)
  }).catch(error => {
    console.error('🚨 测试失败:', error)
  })
}