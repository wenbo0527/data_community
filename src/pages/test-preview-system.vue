<template>
  <div class="test-preview-system">
    <h1>🔍 全局PreviewLineSystem测试</h1>
    <p>此页面用于测试window.previewLineSystem的可用性</p>
    
    <div class="test-buttons">
      <button @click="testGlobalPreviewSystem" class="test-btn">🧪 测试全局PreviewLineSystem</button>
      <button @click="testWindowObjects" class="test-btn">🌐 检查Window对象</button>
      <button @click="clearResults" class="test-btn clear-btn">🧹 清除结果</button>
    </div>
    
    <div class="results" ref="resultsRef"></div>
    
    <!-- 包含TaskFlowCanvas组件以确保previewLineSystem初始化 -->
    <div class="canvas-container">
      <h2>TaskFlowCanvas组件</h2>
      <TaskFlowCanvas 
        ref="canvasRef"
        :nodes="testNodes"
        :connections="testConnections"
        @nodes-updated="onNodesUpdated"
        @connections-updated="onConnectionsUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TaskFlowCanvas from '@/pages/marketing/tasks/components/TaskFlowCanvas.vue'

const canvasRef = ref(null)
const resultsRef = ref(null)

// 测试数据
const testNodes = ref([
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 100 },
    config: { name: '开始节点' }
  },
  {
    id: 'task-1', 
    type: 'task',
    position: { x: 300, y: 200 },
    config: { name: '测试任务' }
  }
])

const testConnections = ref([
  {
    id: 'conn-1',
    source: 'start-1',
    target: 'task-1'
  }
])

const onNodesUpdated = (nodes) => {
  console.log('节点更新:', nodes)
}

const onConnectionsUpdated = (connections) => {
  console.log('连接更新:', connections)
}

const addResult = (message, type = 'info') => {
  if (!resultsRef.value) return
  
  const resultDiv = document.createElement('div')
  resultDiv.className = `test-result ${type}`
  resultDiv.textContent = message
  resultsRef.value.appendChild(resultDiv)
}

const clearResults = () => {
  if (resultsRef.value) {
    resultsRef.value.innerHTML = ''
  }
}

const testGlobalPreviewSystem = () => {
  clearResults()
  addResult('🔍 开始测试全局PreviewLineSystem...', 'info')
  
  try {
    // 检查window.previewLineSystem是否存在
    if (typeof window.previewLineSystem === 'undefined') {
      addResult('❌ window.previewLineSystem 不存在', 'error')
      addResult('⚠️ 未找到全局previewLineSystem实例，无法进行完整测试', 'error')
      return
    }
    
    addResult('✅ window.previewLineSystem 存在', 'success')
    addResult(`📋 类型: ${typeof window.previewLineSystem}`, 'info')
    
    // 检查构造函数
    if (window.previewLineSystem.constructor) {
      addResult(`🏗️ 构造函数: ${window.previewLineSystem.constructor.name}`, 'info')
    }
    
    // 检查关键方法
    const keyMethods = [
      'createPreviewLine',
      'updatePreviewLine', 
      'clearPreviewLines',
      'checkNodeSnapToPreviewLines',
      'handleNodeConfigUpdated'
    ]
    
    addResult('🔧 检查关键方法:', 'info')
    keyMethods.forEach(method => {
      const exists = typeof window.previewLineSystem[method] === 'function'
      addResult(`  ${method}: ${exists ? '✅' : '❌'}`, exists ? 'success' : 'error')
    })
    
    // 检查系统状态
    if (typeof window.previewLineSystem.getSystemStatus === 'function') {
      const status = window.previewLineSystem.getSystemStatus()
      addResult(`📊 系统状态: ${JSON.stringify(status, null, 2)}`, 'info')
    } else {
      addResult('⚠️ getSystemStatus方法不可用', 'error')
    }
    
    // 检查是否已初始化
    if (typeof window.previewLineSystem.isInitialized === 'function') {
      const initialized = window.previewLineSystem.isInitialized()
      addResult(`🔄 初始化状态: ${initialized ? '已初始化' : '未初始化'}`, initialized ? 'success' : 'error')
    }
    
    addResult('✅ 全局PreviewLineSystem测试完成', 'success')
    
  } catch (error) {
    addResult(`❌ 测试过程中发生错误: ${error.message}`, 'error')
    console.error('PreviewLineSystem测试错误:', error)
  }
}

const testWindowObjects = () => {
  clearResults()
  addResult('🌐 检查Window对象中的相关属性...', 'info')
  
  const objectsToCheck = [
    'previewLineSystem',
    'layoutEngine', 
    'unifiedStructuredLayoutEngine',
    'UnifiedStructuredLayoutEngine'
  ]
  
  objectsToCheck.forEach(obj => {
    const exists = typeof window[obj] !== 'undefined'
    const type = typeof window[obj]
    addResult(`window.${obj}: ${exists ? '✅' : '❌'} (${type})`, exists ? 'success' : 'error')
  })
  
  // 列出window对象中包含'preview'或'layout'的属性
  addResult('🔍 搜索相关属性...', 'info')
  const relevantProps = Object.keys(window).filter(key => 
    key.toLowerCase().includes('preview') || 
    key.toLowerCase().includes('layout') ||
    key.toLowerCase().includes('engine')
  )
  
  if (relevantProps.length > 0) {
    addResult(`📋 找到相关属性: ${relevantProps.join(', ')}`, 'info')
  } else {
    addResult('⚠️ 未找到相关属性', 'error')
  }
}

onMounted(() => {
  console.log('[TestPreviewSystem] 组件已挂载')
  
  // 等待TaskFlowCanvas完全初始化
  setTimeout(() => {
    console.log('[TestPreviewSystem] 开始检查canvasRef:', canvasRef.value)
    
    if (canvasRef.value) {
      console.log('[TestPreviewSystem] TaskFlowCanvas引用获取成功')
    } else {
      console.warn('[TestPreviewSystem] TaskFlowCanvas引用获取失败')
    }
    
    // 自动运行测试
    addResult('🚀 页面加载完成，开始自动测试...', 'info')
    testGlobalPreviewSystem()
  }, 3000)
})
</script>

<style scoped>
.test-preview-system {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.test-buttons {
  margin: 20px 0;
}

.test-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  font-size: 14px;
}

.test-btn:hover {
  background-color: #0056b3;
}

.clear-btn {
  background-color: #6c757d;
}

.clear-btn:hover {
  background-color: #545b62;
}

.results {
  margin: 20px 0;
  min-height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #f8f9fa;
}

.test-result {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.canvas-container {
  margin-top: 30px;
  padding: 20px;
  border: 2px solid #007bff;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.canvas-container h2 {
  margin-top: 0;
  color: #007bff;
}

.canvas-container :deep(.task-flow-canvas) {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>