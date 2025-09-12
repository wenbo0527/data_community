// 测试预览线生成功能
window.testPreviewLineGeneration = function() {
  console.log('🧪 [测试] 开始测试预览线生成功能')
  
  // 检查全局对象是否存在
  if (!window.unifiedPreviewLineManager) {
    console.log('❌ [测试] 统一预览线管理器暂未初始化，等待初始化完成...')
    // 等待预览线管理器初始化
    let retryCount = 0
    const maxRetries = 10
    const checkInterval = setInterval(() => {
      retryCount++
      if (window.unifiedPreviewLineManager) {
        console.log('✅ [测试] 统一预览线管理器已初始化，开始测试')
        clearInterval(checkInterval)
        runTest()
      } else if (retryCount >= maxRetries) {
        console.error('❌ [测试] 等待超时，统一预览线管理器未初始化')
        clearInterval(checkInterval)
      }
    }, 500)
    return
  }
  
  // 如果已经初始化，直接运行测试
  runTest()
}

// 实际的测试逻辑
function runTest() {
  console.log('✅ [测试] 统一预览线管理器存在')
  
  // 首先添加一个SMS节点作为目标节点
  window.addTestTargetNode = function() {
    console.log('📝 [测试] 开始添加测试目标节点')
    
    // 检查是否有graph实例
    const graph = window.graph || (window.taskFlowCanvas && window.taskFlowCanvas.graph)
    if (!graph) {
      console.error('❌ [测试] 找不到graph实例')
      return
    }
    
    // 添加SMS节点
    const smsNodeId = 'test_sms_node_' + Date.now()
    const smsNode = {
      id: smsNodeId,
      type: 'sms',
      x: 600,
      y: 500,
      config: {
        message: '测试短信内容',
        sender: '测试发送方'
      }
    }
    
    try {
      // 添加到图形中
      graph.addNode({
        id: smsNodeId,
        x: 600,
        y: 500,
        shape: 'vue-shape',
        component: 'task-node',
        data: smsNode
      })
      
      console.log('✅ [测试] SMS节点添加成功:', smsNodeId)
      
      // 添加到nodes数组（如果存在的话）
      if (window.taskFlowCanvas && window.taskFlowCanvas.nodes) {
        window.taskFlowCanvas.nodes.push(smsNode)
        console.log('✅ [测试] SMS节点已添加到nodes数组')
      }
      
      return smsNodeId
    } catch (error) {
      console.error('❌ [测试] 添加SMS节点失败:', error)
      return null
    }
  }
  
  // 添加目标节点
  const targetNodeId = window.addTestTargetNode()
  if (!targetNodeId) {
    console.error('❌ [测试] 无法添加目标节点，测试终止')
    return
  }
  
  // 等待一下让节点完全添加
  setTimeout(() => {
    // 模拟节点配置完成事件
    const testNodeId = 'node_1756879013860' // 分流节点ID
    const testNodeType = 'audience-split'
    const testConfig = {
      type: 'crowd-split',
      crowdLayers: [
        {
          id: '1756879015579os7qpk5nx',
          label: '黑名单'
        },
        {
          id: '1756879015579mu70gaglu', 
          label: '中响应客群'
        }
      ],
      unmatchBranch: {
        id: 'unmatch_default',
        label: '未命中人群'
      }
    }
    
    console.log('🎯 [测试] 模拟调用onNodeConfigured方法')
    
    try {
      if (typeof window.unifiedPreviewLineManager.onNodeConfigured === 'function') {
        window.unifiedPreviewLineManager.onNodeConfigured(testNodeId, testNodeType, testConfig)
        console.log('✅ [测试] onNodeConfigured调用成功')
      } else {
        console.error('❌ [测试] onNodeConfigured方法不存在')
      }
    } catch (error) {
      console.error('❌ [测试] onNodeConfigured调用失败:', error)
    }
  }, 1000)
}

}

// 自动运行测试（调试模式下延迟执行）
if (import.meta && import.meta.env && import.meta.env.DEV) {
  console.log('🔧 [测试] 开发模式检测到，延迟2秒执行测试')
  setTimeout(() => {
    testPreviewLineGeneration()
  }, 2000)
} else {
  console.log('🔧 [测试] 生产模式，立即执行测试')
  testPreviewLineGeneration()
}

console.log('📋 [测试脚本] test-preview-line.js 加载完成')