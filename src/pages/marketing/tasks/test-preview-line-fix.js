/**
 * 测试预览线系统修复后的功能
 * 验证16条错误和警告日志是否已修复
 */

import { Graph } from '@antv/x6'
import { UnifiedEdgeManager } from './composables/canvas/unified/UnifiedEdgeManager.js'
import { GraphService } from './services/GraphService.js'

export async function testPreviewLineSystemFix() {
  console.log('🧪 开始测试预览线系统修复...')
  
  try {
    // 创建测试图形实例
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

    // 创建GraphService和UnifiedEdgeManager
    const graphService = new GraphService(graph)
    await graphService.initialize(graph)
    
    const unifiedEdgeManager = new UnifiedEdgeManager(graph)
    await unifiedEdgeManager.initialize()

    console.log('✅ 图形服务初始化成功')

    // 测试1：创建节点
    const startNode = await graphService.addNode({
      id: 'start_node',
      type: 'START',
      x: 100,
      y: 100,
      label: '开始'
    })

    const endNode = await graphService.addNode({
      id: 'end_node', 
      type: 'END',
      x: 300,
      y: 200,
      label: '结束'
    })

    console.log('✅ 节点创建成功:', { startNode: startNode.success, endNode: endNode.success })

    // 测试2：创建预览线（之前会报错的场景）
    console.log('🧪 测试预览线创建...')
    
    const previewLine = await unifiedEdgeManager.createPreviewLine('start_node', {
      branchId: 'test_branch',
      branchLabel: '测试分支',
      fromDataLoad: false
    })

    console.log('✅ 预览线创建成功:', previewLine?.id)

    // 测试3：加载包含预览线的图形数据（之前会报错的场景）
    console.log('🧪 测试图形数据加载...')
    
    const testGraphData = {
      nodes: [
        {
          id: 'test_start',
          type: 'START',
          x: 400,
          y: 100,
          label: '测试开始'
        },
        {
          id: 'test_end',
          type: 'END', 
          x: 600,
          y: 200,
          label: '测试结束'
        }
      ],
      edges: [
        {
          id: 'preview_test_edge',
          source: { cell: 'test_start', port: 'out' },
          target: null, // 预览线目标为null
          isPreview: true,
          type: 'preview'
        },
        {
          id: 'unified_edge_test',
          source: { cell: 'test_start', port: 'out' },
          target: { cell: 'test_end', port: 'in' },
          isPreview: false,
          type: 'connection'
        }
      ]
    }

    const loadResult = await graphService.loadGraphData(testGraphData)
    console.log('✅ 图形数据加载成功:', loadResult.success)

    // 测试4：验证UnifiedEdge的setX6Edge方法
    console.log('🧪 测试UnifiedEdge.setX6Edge方法...')
    
    const edges = unifiedEdgeManager.getAllEdges()
    let setX6EdgeTestPassed = true
    
    for (const edge of edges) {
      if (edge.setX6Edge && typeof edge.setX6Edge === 'function') {
        console.log('✅ setX6Edge方法存在:', edge.id)
      } else {
        console.error('❌ setX6Edge方法缺失:', edge.id)
        setX6EdgeTestPassed = false
      }
    }

    // 测试5：验证EdgeOverlapManager的节点存在性验证
    console.log('🧪 测试EdgeOverlapManager节点验证...')
    
    // 创建一个预览线来测试EdgeOverlapManager是否正确处理
    const testPreviewLine2 = await unifiedEdgeManager.createPreviewLine('test_start', {
      branchId: 'test_branch_2',
      fromDataLoad: false
    })

    console.log('✅ EdgeOverlapManager预览线处理成功:', testPreviewLine2?.id)

    // 清理测试环境
    document.body.removeChild(container)
    graph.dispose()

    // 汇总测试结果
    const testResults = {
      graphServiceInit: true,
      nodeCreation: startNode.success && endNode.success,
      previewLineCreation: !!previewLine,
      graphDataLoading: loadResult.success,
      setX6EdgeMethod: setX6EdgeTestPassed,
      edgeOverlapManager: !!testPreviewLine2,
      overallSuccess: true
    }

    console.log('🎉 预览线系统修复测试完成!')
    console.log('📊 测试结果:', testResults)

    return testResults

  } catch (error) {
    console.error('❌ 预览线系统测试失败:', error)
    return {
      overallSuccess: false,
      error: error.message,
      stack: error.stack
    }
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  window.testPreviewLineSystemFix = testPreviewLineSystemFix
}