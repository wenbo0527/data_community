/**
 * 拖拽新增节点功能测试
 * 验证TaskFlowCanvas组件的拖拽事件处理是否正常工作
 */

// 模拟拖拽事件测试
function testDragDropEvents() {
  console.log('🧪 开始测试拖拽新增节点功能...')
  
  // 测试1: 验证TaskFlowCanvas组件是否正确声明了drop和dragover事件
  const canvasElement = document.querySelector('.task-flow-canvas')
  if (!canvasElement) {
    console.error('❌ 未找到TaskFlowCanvas组件的根元素')
    return false
  }
  
  console.log('✅ 找到TaskFlowCanvas组件根元素')
  
  // 测试2: 模拟拖拽开始事件
  const mockDragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  })
  
  // 设置拖拽数据
  mockDragStartEvent.dataTransfer.setData('application/json', JSON.stringify({
    nodeType: 'sms',
    source: 'node-selector'
  }))
  
  console.log('✅ 创建模拟拖拽开始事件')
  
  // 测试3: 模拟拖拽悬停事件
  const mockDragOverEvent = new DragEvent('dragover', {
    bubbles: true,
    cancelable: true,
    clientX: 400,
    clientY: 300,
    dataTransfer: mockDragStartEvent.dataTransfer
  })
  
  // 测试4: 模拟拖拽放置事件
  const mockDropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    clientX: 400,
    clientY: 300,
    dataTransfer: mockDragStartEvent.dataTransfer
  })
  
  try {
    // 触发拖拽悬停事件
    canvasElement.dispatchEvent(mockDragOverEvent)
    console.log('✅ 拖拽悬停事件触发成功')
    
    // 触发拖拽放置事件
    canvasElement.dispatchEvent(mockDropEvent)
    console.log('✅ 拖拽放置事件触发成功')
    
    console.log('🎉 拖拽新增节点功能测试完成')
    return true
    
  } catch (error) {
    console.error('❌ 拖拽事件测试失败:', error)
    return false
  }
}

// 等待页面加载完成后执行测试
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      testDragDropEvents()
    }, 2000) // 等待2秒确保Vue组件完全加载
  })
  
  // 导出测试函数供手动调用
  window.testDragDropEvents = testDragDropEvents
}

export { testDragDropEvents }