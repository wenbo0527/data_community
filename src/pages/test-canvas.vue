<template>
  <div class="test-canvas-page">
    <h1>TaskFlowCanvas 测试页面</h1>
    <div class="test-controls">
      <button @click="testAddNode" class="test-btn">测试添加节点</button>
      <button @click="testLoadData" class="test-btn">测试加载数据</button>
      <button @click="checkGraphInstance" class="test-btn">检查图形实例</button>
    </div>
    
    <div class="test-results">
      <h3>测试结果:</h3>
      <div v-for="result in testResults" :key="result.id" class="test-result">
        <span :class="result.success ? 'success' : 'error'">{{ result.message }}</span>
      </div>
    </div>
    
    <div class="canvas-wrapper">
      <TaskFlowCanvas
        ref="canvasRef"
        :initial-nodes="[]"
        :initial-connections="[]"
        :auto-add-start-node="true"
        @nodes-updated="onNodesUpdated"
        @connections-updated="onConnectionsUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TaskFlowCanvas from './marketing/tasks/components/TaskFlowCanvas.vue'

const canvasRef = ref(null)
const testResults = ref([])

const addTestResult = (message, success = true) => {
  testResults.value.push({
    id: Date.now(),
    message,
    success
  })
}

const testAddNode = () => {
  try {
    if (canvasRef.value && canvasRef.value.addNode) {
      const testNode = {
        id: 'test-node-' + Date.now(),
        type: 'task',
        label: '测试节点',
        x: 200,
        y: 200
      }
      canvasRef.value.addNode(testNode)
      addTestResult('✅ addNode方法调用成功', true)
    } else {
      addTestResult('❌ addNode方法不存在', false)
    }
  } catch (error) {
    addTestResult(`❌ addNode调用失败: ${error.message}`, false)
  }
}

const testLoadData = () => {
  try {
    if (canvasRef.value && canvasRef.value.loadCanvasData) {
      const testData = {
        nodes: [{
          id: 'load-test-node',
          type: 'task',
          label: '加载测试节点',
          x: 300,
          y: 100
        }],
        connections: []
      }
      canvasRef.value.loadCanvasData(testData)
      addTestResult('✅ loadCanvasData方法调用成功', true)
    } else {
      addTestResult('❌ loadCanvasData方法不存在', false)
    }
  } catch (error) {
    addTestResult(`❌ loadCanvasData调用失败: ${error.message}`, false)
  }
}

const checkGraphInstance = () => {
  try {
    if (canvasRef.value && canvasRef.value.graph) {
      const graph = canvasRef.value.graph
      if (graph && typeof graph.on === 'function') {
        addTestResult('✅ 图形实例正常，graph.on方法存在', true)
      } else {
        addTestResult('❌ 图形实例异常，graph.on方法不存在', false)
      }
    } else {
      addTestResult('❌ 无法访问图形实例', false)
    }
  } catch (error) {
    addTestResult(`❌ 检查图形实例失败: ${error.message}`, false)
  }
}

const onNodesUpdated = (nodes) => {
  addTestResult(`📊 节点更新事件触发，当前节点数: ${nodes.length}`, true)
}

const onConnectionsUpdated = (connections) => {
  addTestResult(`🔗 连接更新事件触发，当前连接数: ${connections.length}`, true)
}

onMounted(() => {
  addTestResult('🚀 测试页面已加载', true)
  console.log('[TestCanvas] 测试页面已挂载')
  
  // 延迟检查初始状态
  setTimeout(() => {
    console.log('[TestCanvas] 开始检查组件状态')
    if (canvasRef.value) {
      addTestResult('✅ TaskFlowCanvas组件引用获取成功', true)
      console.log('[TestCanvas] canvasRef.value:', canvasRef.value)
      console.log('[TestCanvas] 可用方法:', Object.keys(canvasRef.value))
      checkGraphInstance()
    } else {
      addTestResult('❌ TaskFlowCanvas组件引用获取失败', false)
      console.error('[TestCanvas] canvasRef.value为空')
    }
  }, 1000)
})
</script>

<style scoped>
.test-canvas-page {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.test-controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.test-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-btn:hover {
  background: #40a9ff;
}

.test-results {
  margin: 20px 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  padding: 10px;
  border-radius: 4px;
}

.test-result {
  margin: 5px 0;
  padding: 5px;
  border-radius: 3px;
}

.success {
  color: #52c41a;
}

.error {
  color: #ff4d4f;
}

.canvas-wrapper {
  flex: 1;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}
</style>