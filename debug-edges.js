// 调试图形实例中的边数据
console.log('🔍 开始调试边数据...')

// 检查图形实例
if (window.taskFlowGraph) {
  console.log('✅ 找到图形实例 window.taskFlowGraph')
  
  const edges = window.taskFlowGraph.getEdges()
  console.log(`📊 图形实例中共有 ${edges.length} 条边`)
  
  edges.forEach((edge, index) => {
    const edgeData = edge.getData() || {}
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    
    console.log(`边 ${index + 1}:`, {
      id: edge.id,
      sourceId,
      targetId,
      hasTarget: !!targetId,
      edgeData: {
        type: edgeData.type,
        isPreview: edgeData.isPreview,
        isUnifiedPreview: edgeData.isUnifiedPreview,
        branchId: edgeData.branchId
      },
      判断结果: {
        包含preview: edge.id.includes('preview'),
        有源无目标: sourceId && !targetId,
        数据标记为预览: edgeData.isPreview || edgeData.isUnifiedPreview || edgeData.type === 'preview-line'
      }
    })
  })
} else {
  console.log('❌ 未找到图形实例 window.taskFlowGraph')
}

// 检查统一边管理器
if (window.unifiedEdgeManager) {
  console.log('✅ 找到统一边管理器 window.unifiedEdgeManager')
  
  const previewLines = window.unifiedEdgeManager.previewLines
  const connections = window.unifiedEdgeManager.connections
  
  console.log(`📊 统一边管理器中有 ${previewLines.size} 条预览线，${connections.size} 条连接线`)
  
  console.log('预览线详情:')
  previewLines.forEach((preview, id) => {
    console.log(`预览线 ${id}:`, {
      id: preview.id,
      source: preview.source,
      target: preview.target,
      type: preview.type,
      isPreview: preview.isPreview,
      graphInstance: !!preview.graphInstance
    })
  })
  
  console.log('连接线详情:')
  connections.forEach((connection, id) => {
    console.log(`连接线 ${id}:`, {
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: connection.type,
      isPreview: connection.isPreview,
      graphInstance: !!connection.graphInstance
    })
  })
} else {
  console.log('❌ 未找到统一边管理器 window.unifiedEdgeManager')
}

console.log('🔍 边数据调试完成')