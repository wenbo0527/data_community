<template>
  <div class="test-container">
    <div class="test-header">
      <h2>TaskFlowCanvas 测试页面</h2>
      <div class="test-controls">
        <a-button type="primary" @click="testAddNode">测试添加节点</a-button>
        <a-button @click="testAddMultipleNodes">测试添加多个节点</a-button>
        <a-button @click="testAddConnection">测试添加连接</a-button>
        <a-button @click="clearCanvas">清空画布</a-button>
        <a-button @click="showTestResults">显示测试结果</a-button>
      </div>
    </div>
    
    <div class="test-content">
      <div class="canvas-wrapper">
        <TaskFlowCanvasRefactored
          ref="canvasRef"
          :initial-nodes="testNodes"
          :initial-connections="testConnections"
          :auto-add-start-node="false"
          @canvas-ready="onCanvasReady"
          @node-created="onNodeCreated"
          @connection-created="onConnectionCreated"
          @error="onError"
        />
      </div>
      
      <div class="test-results">
        <h3>测试结果</h3>
        <div class="result-item" v-for="result in testResults" :key="result.id">
          <span :class="['status', result.status]">{{ result.status === 'success' ? '✓' : '✗' }}</span>
          <span class="test-name">{{ result.name }}</span>
          <span class="test-message">{{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import TaskFlowCanvasRefactored from '../components/TaskFlowCanvasRefactored.vue'

const canvasRef = ref(null)
const testNodes = ref([])
const testConnections = ref([])
const testResults = ref([])

// 测试节点数据
const sampleNodes = [
  {
    id: 'test-node-1',
    type: 'process',
    label: '测试节点1',
    position: { x: 200, y: 100 },
    data: {
      isConfigured: false,
      config: {
        name: '测试节点1',
        description: '这是一个测试节点'
      }
    }
  },
  {
    id: 'test-node-2',
    type: 'decision',
    label: '测试节点2',
    position: { x: 400, y: 200 },
    data: {
      isConfigured: true,
      config: {
        name: '测试节点2',
        description: '这是另一个测试节点'
      }
    }
  },
  {
    id: 'test-node-3',
    type: 'end',
    label: '测试节点3',
    position: { x: 600, y: 300 },
    data: {
      isConfigured: true,
      config: {
        name: '测试节点3',
        description: '结束节点'
      }
    }
  }
]

// 测试连接数据
const sampleConnections = [
  {
    id: 'test-connection-1',
    source: 'test-node-1',
    target: 'test-node-2',
    sourceNodeId: 'test-node-1',
    targetNodeId: 'test-node-2',
    sourcePortId: 'output',
    targetPortId: 'input'
  },
  {
    id: 'test-connection-2',
    source: 'test-node-2',
    target: 'test-node-3',
    sourceNodeId: 'test-node-2',
    targetNodeId: 'test-node-3',
    sourcePortId: 'output',
    targetPortId: 'input'
  }
]

// 添加测试结果
const addTestResult = (name, status, message) => {
  testResults.value.push({
    id: Date.now() + Math.random(),
    name,
    status,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
}

// 测试添加单个节点
const testAddNode = async () => {
  try {
    console.log('[Test] 开始测试添加单个节点')
    
    const nodeData = {
      id: `test-node-${Date.now()}`,
      type: 'process',
      label: '动态测试节点',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        isConfigured: false,
        config: {
          name: '动态测试节点',
          description: '通过测试按钮添加的节点'
        }
      }
    }
    
    // 通过修改响应式数据来触发节点添加
    testNodes.value = [...testNodes.value, nodeData]
    
    // 等待一段时间让画布处理节点添加
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addTestResult('添加单个节点', 'success', `成功添加节点: ${nodeData.id}`)
    Message.success('节点添加成功')
  } catch (error) {
    console.error('[Test] 添加节点失败:', error)
    addTestResult('添加单个节点', 'error', `失败: ${error.message}`)
    Message.error(`添加节点失败: ${error.message}`)
  }
}

// 测试添加多个节点
const testAddMultipleNodes = async () => {
  try {
    console.log('[Test] 开始测试添加多个节点')
    
    const nodesToAdd = sampleNodes.map(node => ({
      ...node,
      id: `${node.id}-${Date.now()}`,
      position: {
        x: node.position.x + Math.random() * 100,
        y: node.position.y + Math.random() * 100
      }
    }))
    
    testNodes.value = [...testNodes.value, ...nodesToAdd]
    
    addTestResult('添加多个节点', 'success', `成功添加 ${nodesToAdd.length} 个节点`)
    Message.success(`成功添加 ${nodesToAdd.length} 个节点`)
  } catch (error) {
    console.error('[Test] 添加多个节点失败:', error)
    addTestResult('添加多个节点', 'error', `失败: ${error.message}`)
    Message.error(`添加多个节点失败: ${error.message}`)
  }
}

// 测试添加连接
const testAddConnection = async () => {
  try {
    console.log('[Test] 开始测试添加连接')
    
    if (testNodes.value.length < 2) {
      throw new Error('需要至少2个节点才能创建连接')
    }
    
    const sourceNode = testNodes.value[0]
    const targetNode = testNodes.value[1]
    
    const connectionData = {
      id: `test-connection-${Date.now()}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePortId: 'output',
      targetPortId: 'input'
    }
    
    testConnections.value.push(connectionData)
    
    addTestResult('添加连接', 'success', `成功添加连接: ${sourceNode.id} -> ${targetNode.id}`)
    Message.success('连接添加成功')
  } catch (error) {
    console.error('[Test] 添加连接失败:', error)
    addTestResult('添加连接', 'error', `失败: ${error.message}`)
    Message.error(`添加连接失败: ${error.message}`)
  }
}

// 清空画布
const clearCanvas = () => {
  testNodes.value = []
  testConnections.value = []
  testResults.value = []
  addTestResult('清空画布', 'success', '画布已清空')
  Message.success('画布已清空')
}

// 显示测试结果
const showTestResults = () => {
  const successCount = testResults.value.filter(r => r.status === 'success').length
  const errorCount = testResults.value.filter(r => r.status === 'error').length
  
  Message.info(`测试结果: 成功 ${successCount} 个，失败 ${errorCount} 个`)
}

// 画布事件处理
const onCanvasReady = (data) => {
  console.log('[Test] 画布就绪:', data)
  addTestResult('画布初始化', 'success', '画布初始化成功')
}

const onNodeCreated = (data) => {
  console.log('[Test] 节点创建:', data)
  addTestResult('节点创建事件', 'success', `节点创建: ${data.nodeId}`)
}

const onConnectionCreated = (data) => {
  console.log('[Test] 连接创建:', data)
  addTestResult('连接创建事件', 'success', `连接创建: ${data.connectionId}`)
}

const onError = (error) => {
  console.error('[Test] 画布错误:', error)
  addTestResult('画布错误', 'error', error.message || '未知错误')
}

// 自动运行基础测试
onMounted(async () => {
  console.log('[Test] 测试页面已挂载')
  
  // 等待一段时间确保画布初始化完成
  setTimeout(() => {
    addTestResult('页面加载', 'success', '测试页面加载完成')
  }, 1000)
})
</script>

<style scoped>
.test-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.test-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  background: #fff;
}

.test-header h2 {
  margin: 0 0 16px 0;
  color: #333;
}

.test-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
}

.test-results {
  width: 300px;
  padding: 16px;
  background: #f8f9fa;
  border-left: 1px solid #e5e5e5;
  overflow-y: auto;
}

.test-results h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  font-size: 12px;
}

.status {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
}

.status.success {
  background: #52c41a;
}

.status.error {
  background: #ff4d4f;
}

.test-name {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.test-message {
  color: #666;
  flex: 1;
}
</style>