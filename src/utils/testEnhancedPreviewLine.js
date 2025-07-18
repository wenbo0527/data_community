/**
 * 增强预设线测试脚本
 * 用于在浏览器控制台中测试预设线功能
 */

// 测试函数：检查增强预设线管理器是否正确初始化
window.testEnhancedPreviewLine = function() {
  console.log('🧪 [测试] 开始测试增强预设线功能')
  
  // 1. 检查全局变量
  if (window.enhancedPreviewManager) {
    console.log('✅ [测试] 增强预设线管理器已初始化')
    console.log('📊 [测试] 管理器实例:', window.enhancedPreviewManager)
  } else {
    console.log('❌ [测试] 增强预设线管理器未找到')
    return false
  }
  
  // 2. 检查画布
  if (window.enhancedPreviewManager.graph) {
    console.log('✅ [测试] 画布实例存在')
    const nodes = window.enhancedPreviewManager.graph.getNodes()
    console.log('📊 [测试] 画布节点数量:', nodes.length)
    
    if (nodes.length > 0) {
      console.log('📊 [测试] 节点列表:', nodes.map(n => ({ id: n.id, type: n.getData()?.type })))
      
      // 3. 测试为第一个节点创建预设线
      const firstNode = nodes[0]
      console.log('🎯 [测试] 为第一个节点创建预设线:', firstNode.id)
      
      try {
        const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(firstNode)
        if (previewLine) {
          console.log('✅ [测试] 预设线创建成功:', previewLine.id)
          
          // 4. 检查预设线是否可见
          const edges = window.enhancedPreviewManager.graph.getEdges()
          const previewEdges = edges.filter(e => e.getData()?.type === 'draggable-preview')
          console.log('📊 [测试] 预设线数量:', previewEdges.length)
          
          return true
        } else {
          console.log('❌ [测试] 预设线创建失败')
          return false
        }
      } catch (error) {
        console.error('❌ [测试] 预设线创建出错:', error)
        return false
      }
    } else {
      console.log('⚠️ [测试] 画布中没有节点')
      return false
    }
  } else {
    console.log('❌ [测试] 画布实例不存在')
    return false
  }
}

// 测试函数：检查预设线拖拽功能
window.testPreviewLineDrag = function() {
  console.log('🧪 [测试] 开始测试预设线拖拽功能')
  
  if (!window.enhancedPreviewManager) {
    console.log('❌ [测试] 增强预设线管理器未找到')
    return false
  }
  
  const edges = window.enhancedPreviewManager.graph.getEdges()
  const previewEdges = edges.filter(e => e.getData()?.type === 'draggable-preview')
  
  if (previewEdges.length === 0) {
    console.log('⚠️ [测试] 没有找到预设线，先创建一个')
    window.testEnhancedPreviewLine()
    return
  }
  
  const previewLine = previewEdges[0]
  console.log('🎯 [测试] 测试预设线拖拽:', previewLine.id)
  
  // 模拟鼠标事件
  const mockEvent = {
    clientX: 300,
    clientY: 300,
    stopPropagation: () => {}
  }
  
  try {
    // 触发鼠标按下事件
    previewLine.trigger('mousedown', mockEvent)
    console.log('✅ [测试] 鼠标按下事件已触发')
    
    // 检查拖拽状态
    if (window.enhancedPreviewManager.isDragging) {
      console.log('✅ [测试] 拖拽状态已激活')
      
      // 模拟鼠标移动
      const moveEvent = {
        clientX: 350,
        clientY: 350
      }
      window.enhancedPreviewManager.handleMouseMove(moveEvent)
      console.log('✅ [测试] 鼠标移动事件已处理')
      
      // 模拟鼠标释放
      const upEvent = {
        clientX: 400,
        clientY: 400
      }
      window.enhancedPreviewManager.handleMouseUp(upEvent)
      console.log('✅ [测试] 鼠标释放事件已处理')
      
      return true
    } else {
      console.log('❌ [测试] 拖拽状态未激活')
      return false
    }
  } catch (error) {
    console.error('❌ [测试] 拖拽测试出错:', error)
    return false
  }
}

// 测试函数：清理所有预设线
window.cleanupPreviewLines = function() {
  console.log('🧹 [测试] 清理所有预设线')
  
  if (!window.enhancedPreviewManager) {
    console.log('❌ [测试] 增强预设线管理器未找到')
    return
  }
  
  const edges = window.enhancedPreviewManager.graph.getEdges()
  const previewEdges = edges.filter(e => e.getData()?.type === 'draggable-preview')
  
  console.log('📊 [测试] 找到预设线数量:', previewEdges.length)
  
  previewEdges.forEach(edge => {
    window.enhancedPreviewManager.graph.removeEdge(edge)
    console.log('🗑️ [测试] 已删除预设线:', edge.id)
  })
  
  // 清理管理器中的记录
  window.enhancedPreviewManager.draggablePreviewLines.clear()
  console.log('✅ [测试] 预设线清理完成')
}

console.log('🧪 [测试脚本] 增强预设线测试函数已加载')
console.log('📝 [测试脚本] 可用函数:')
console.log('  - testEnhancedPreviewLine(): 测试预设线创建')
console.log('  - testPreviewLineDrag(): 测试预设线拖拽')
console.log('  - cleanupPreviewLines(): 清理所有预设线')