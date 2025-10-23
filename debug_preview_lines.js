/**
 * 预览线调试脚本
 * 用于检查X6图形实例中的预览线存在情况
 */

// 在浏览器控制台中运行此脚本
function debugPreviewLines() {
  console.log('🔍 开始调试预览线...')
  
  // 尝试获取图形实例
  let graph = null
  
  // 方法1: 从全局变量获取
  if (window.graph) {
    graph = window.graph
    console.log('✅ 从window.graph获取到图形实例')
  }
  
  // 方法2: 从Vue实例获取
  if (!graph && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      const vueInstances = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps
      for (const app of vueInstances) {
        const rootComponent = app._instance
        if (rootComponent && rootComponent.refs && rootComponent.refs.taskFlowCanvas) {
          graph = rootComponent.refs.taskFlowCanvas.graph
          console.log('✅ 从Vue实例获取到图形实例')
          break
        }
      }
    } catch (error) {
      console.warn('⚠️ 从Vue实例获取图形实例失败:', error)
    }
  }
  
  // 方法3: 从DOM元素获取
  if (!graph) {
    const graphContainer = document.getElementById('graph-container')
    if (graphContainer && graphContainer._x6_graph) {
      graph = graphContainer._x6_graph
      console.log('✅ 从DOM元素获取到图形实例')
    }
  }
  
  if (!graph) {
    console.error('❌ 无法获取图形实例')
    return
  }
  
  console.log('📊 图形实例信息:', {
    constructor: graph.constructor.name,
    hasGetEdges: typeof graph.getEdges === 'function',
    hasGetNodes: typeof graph.getNodes === 'function'
  })
  
  // 获取所有边
  const allEdges = graph.getEdges()
  console.log(`📈 图形中总边数: ${allEdges.length}`)
  
  if (allEdges.length === 0) {
    console.warn('⚠️ 图形中没有任何边')
    return
  }
  
  // 分析每条边
  const edgeAnalysis = []
  let previewLineCount = 0
  let realConnectionCount = 0
  
  allEdges.forEach((edge, index) => {
    const edgeId = edge.id || `edge_${index}`
    const edgeData = edge.getData ? edge.getData() : {}
    const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : 'unknown'
    const targetId = edge.getTargetCellId ? edge.getTargetCellId() : 'unknown'
    
    // 预览线识别逻辑
    const isPreviewLine = (
      edgeData.isPreview ||
      edgeData.isPersistentPreview ||
      edgeData.isUnifiedPreview ||
      edgeData.type === 'preview-line' ||
      edgeData.type === 'unified-preview-line' ||
      edgeId.includes('preview') ||
      edgeId.includes('unified_preview') ||
      edgeId.startsWith('preview-') ||
      edgeId.startsWith('unified-preview-') ||
      edgeId.startsWith('preview_') ||
      (edge.attrs && edge.attrs.line && edge.attrs.line.strokeDasharray)
    )
    
    // 获取边的样式属性
    const attrs = edge.getAttrs ? edge.getAttrs() : edge.attrs || {}
    const lineAttrs = attrs.line || {}
    
    const analysis = {
      index,
      id: edgeId,
      isPreviewLine,
      sourceId,
      targetId,
      hasSource: sourceId && sourceId !== 'unknown',
      hasTarget: targetId && targetId !== 'unknown',
      data: edgeData,
      style: {
        stroke: lineAttrs.stroke,
        strokeWidth: lineAttrs.strokeWidth,
        strokeDasharray: lineAttrs.strokeDasharray,
        opacity: lineAttrs.opacity,
        visible: edge.visible !== false
      },
      zIndex: edge.zIndex || 0
    }
    
    edgeAnalysis.push(analysis)
    
    if (isPreviewLine) {
      previewLineCount++
    } else {
      realConnectionCount++
    }
  })
  
  console.log(`📊 边分析结果:`)
  console.log(`  - 预览线数量: ${previewLineCount}`)
  console.log(`  - 真实连接数量: ${realConnectionCount}`)
  console.log(`  - 总边数: ${allEdges.length}`)
  
  // 详细输出预览线信息
  const previewLines = edgeAnalysis.filter(e => e.isPreviewLine)
  if (previewLines.length > 0) {
    console.log('🔍 预览线详细信息:')
    previewLines.forEach(preview => {
      console.log(`  预览线 ${preview.id}:`, {
        源节点: preview.sourceId,
        目标节点: preview.targetId,
        有源节点: preview.hasSource,
        有目标节点: preview.hasTarget,
        样式: preview.style,
        层级: preview.zIndex,
        数据: preview.data
      })
      
      // 检查可见性问题
      if (!preview.style.visible) {
        console.warn(`    ⚠️ 预览线 ${preview.id} 被设置为不可见`)
      }
      if (preview.style.opacity === 0) {
        console.warn(`    ⚠️ 预览线 ${preview.id} 透明度为0`)
      }
      if (preview.zIndex < 0) {
        console.warn(`    ⚠️ 预览线 ${preview.id} 层级为负数: ${preview.zIndex}`)
      }
    })
  } else {
    console.warn('⚠️ 没有找到预览线')
  }
  
  // 检查预览线管理器状态
  console.log('🔍 检查预览线管理器状态...')
  
  // 尝试获取预览线管理器
  let previewManager = null
  
  // 从全局变量获取
  if (window.unifiedPreviewLineManager) {
    previewManager = window.unifiedPreviewLineManager
    console.log('✅ 从全局变量获取到预览线管理器')
  }
  
  if (previewManager) {
    try {
      const managerData = previewManager.getAllPreviewLines()
      console.log(`📊 预览线管理器中的数据数量: ${managerData.length}`)
      
      if (managerData.length > 0) {
        console.log('🔍 预览线管理器数据详情:')
        managerData.forEach((data, index) => {
          console.log(`  数据 ${index}:`, {
            id: data.id,
            type: data.type,
            sourceNodeId: data.sourceNode?.id,
            hasLine: !!data.line,
            lineId: data.line?.id,
            state: data.state,
            createdAt: new Date(data.createdAt).toLocaleString()
          })
        })
      }
    } catch (error) {
      console.error('❌ 获取预览线管理器数据失败:', error)
    }
  } else {
    console.warn('⚠️ 无法获取预览线管理器')
  }
  
  // 返回分析结果
  return {
    totalEdges: allEdges.length,
    previewLineCount,
    realConnectionCount,
    previewLines,
    edgeAnalysis
  }
}

// 自动运行调试
console.log('🚀 预览线调试脚本已加载，运行 debugPreviewLines() 开始调试')

// 如果在浏览器环境中，自动运行
if (typeof window !== 'undefined') {
  // 延迟执行，确保页面完全加载
  setTimeout(() => {
    debugPreviewLines()
  }, 1000)
}