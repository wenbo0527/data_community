<template>
  <div class="audience-split-test-panel">
    <div class="test-header">
      <h3>🧪 人群分流预览线测试面板</h3>
      <div class="test-status">
        <span :class="['status-indicator', statusClass]">{{ statusText }}</span>
      </div>
    </div>
    
    <div class="test-controls">
      <button 
        @click="runTest" 
        :disabled="isRunning || !isReady"
        class="test-button primary"
      >
        {{ isRunning ? '测试中...' : '运行测试' }}
      </button>
      
      <button 
        @click="clearResults" 
        :disabled="isRunning"
        class="test-button secondary"
      >
        清空结果
      </button>
      
      <button 
        @click="refreshInstances" 
        :disabled="isRunning"
        class="test-button secondary"
      >
        刷新实例
      </button>
    </div>
    
    <div class="instance-info">
      <h4>📊 实例状态</h4>
      <div class="info-grid">
        <div class="info-item">
          <label>X6图实例:</label>
          <span :class="graphInstance ? 'success' : 'error'">
            {{ graphInstance ? '✅ 已连接' : '❌ 未找到' }}
          </span>
        </div>
        <div class="info-item">
          <label>预览线管理器:</label>
          <span :class="previewManager ? 'success' : 'error'">
            {{ previewManager ? '✅ 已连接' : '❌ 未找到' }}
          </span>
        </div>
        <div class="info-item">
          <label>节点数量:</label>
          <span>{{ nodeCount }}</span>
        </div>
        <div class="info-item">
          <label>预览线数量:</label>
          <span>{{ previewLineCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="test-results" v-if="testResults.length > 0">
      <h4>📋 测试结果</h4>
      <div class="results-container">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          :class="['result-item', result.type]"
        >
          <div class="result-header">
            <span class="result-icon">{{ getResultIcon(result.type) }}</span>
            <span class="result-title">{{ result.title }}</span>
            <span class="result-time">{{ formatTime(result.timestamp) }}</span>
          </div>
          <div class="result-content" v-if="result.details">
            <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'

// 注入父组件提供的实例
const graph = inject('graph', null)
const configDrawers = inject('configDrawers', null)

// 响应式数据
const isRunning = ref(false)
const testResults = ref([])
const graphInstance = ref(null)
const previewManager = ref(null)
const nodeCount = ref(0)
const previewLineCount = ref(0)

// 计算属性
const isReady = computed(() => {
  return graphInstance.value && previewManager.value
})

const statusClass = computed(() => {
  if (!graphInstance.value || !previewManager.value) return 'error'
  if (isRunning.value) return 'running'
  return 'ready'
})

const statusText = computed(() => {
  if (!graphInstance.value) return '图实例未连接'
  if (!previewManager.value) return '预览线管理器未连接'
  if (isRunning.value) return '测试运行中'
  return '就绪'
})

// 获取结果图标
const getResultIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 刷新实例引用
const refreshInstances = () => {
  try {
    // 获取X6图实例
    graphInstance.value = graph || window.graph || null
    
    // 获取预览线管理器
    if (configDrawers?.value?.structuredLayout) {
      previewManager.value = configDrawers.value.structuredLayout.getConnectionPreviewManager()
    } else {
      previewManager.value = window.previewLineSystem || null
    }
    
    // 更新统计信息
    updateStats()
    
    addResult('info', '实例刷新', '已刷新图实例和预览线管理器引用')
  } catch (error) {
    addResult('error', '刷新失败', { error: error.message })
  }
}

// 更新统计信息
const updateStats = () => {
  if (graphInstance.value) {
    const nodes = graphInstance.value.getNodes()
    const edges = graphInstance.value.getEdges()
    
    nodeCount.value = nodes.length
    previewLineCount.value = edges.filter(edge => 
      edge.id.includes('preview') || edge.id.includes('unified_preview')
    ).length
  } else {
    nodeCount.value = 0
    previewLineCount.value = 0
  }
}

// 添加测试结果
const addResult = (type, title, details = null) => {
  testResults.value.unshift({
    type,
    title,
    details,
    timestamp: Date.now()
  })
  
  // 限制结果数量
  if (testResults.value.length > 20) {
    testResults.value = testResults.value.slice(0, 20)
  }
}

// 清空测试结果
const clearResults = () => {
  testResults.value = []
}

// 运行测试
const runTest = async () => {
  if (isRunning.value || !isReady.value) return
  
  isRunning.value = true
  addResult('info', '开始测试', '正在运行人群分流预览线测试...')
  
  try {
    // 测试1: 验证实例可用性
    await testInstanceAvailability()
    
    // 测试2: 测试预览线创建
    await testPreviewLineCreation()
    
    // 测试3: 测试预览线清理
    await testPreviewLineCleanup()
    
    // 测试4: 测试人群分流逻辑
    await testAudienceSplitLogic()
    
    addResult('success', '测试完成', '所有测试项目已完成')
  } catch (error) {
    addResult('error', '测试失败', { error: error.message, stack: error.stack })
  } finally {
    isRunning.value = false
    updateStats()
  }
}

// 测试实例可用性
const testInstanceAvailability = async () => {
  const tests = [
    {
      name: 'X6图实例',
      test: () => graphInstance.value && typeof graphInstance.value.getNodes === 'function'
    },
    {
      name: '预览线管理器',
      test: () => previewManager.value && (typeof previewManager.value.createPreviewLine === 'function' || (previewManager.value.creator && typeof previewManager.value.creator.createPreviewLine === 'function'))
    },
    {
      name: '节点获取',
      test: () => graphInstance.value.getNodes().length > 0
    }
  ]
  
  for (const test of tests) {
    const result = test.test()
    addResult(
      result ? 'success' : 'error',
      `实例测试: ${test.name}`,
      { passed: result }
    )
    
    if (!result) {
      throw new Error(`${test.name}测试失败`)
    }
  }
}

// 测试预览线创建
const testPreviewLineCreation = async () => {
  const nodes = graphInstance.value.getNodes()
  const audienceSplitNodes = nodes.filter(node => {
    const data = node.getData()
    return data && data.type === 'audience-split'
  })
  
  addResult('info', '预览线创建测试', {
    totalNodes: nodes.length,
    audienceSplitNodes: audienceSplitNodes.length
  })
  
  if (audienceSplitNodes.length === 0) {
    addResult('warning', '预览线创建', '未找到人群分流节点，跳过预览线创建测试')
    return
  }
  
  // 测试第一个人群分流节点的预览线创建
  const testNode = audienceSplitNodes[0]
  try {
    const creator = previewManager.value.creator || previewManager.value
    const previewLines = await creator.createPreviewLine(testNode)
    addResult('success', '预览线创建', {
      nodeId: testNode.id,
      previewLinesCreated: Array.isArray(previewLines) ? previewLines.length : 1
    })
  } catch (error) {
    addResult('error', '预览线创建失败', {
      nodeId: testNode.id,
      error: error.message
    })
  }
}

// 测试预览线清理
const testPreviewLineCleanup = async () => {
  try {
    const manager = previewManager.value.manager || previewManager.value
    if (typeof manager.cleanupOrphanedPreviewLines === 'function') {
      const cleanupResult = await manager.cleanupOrphanedPreviewLines()
      addResult('success', '预览线清理', cleanupResult)
    } else {
      addResult('warning', '预览线清理', '清理方法不可用')
    }
  } catch (error) {
    addResult('error', '预览线清理失败', { error: error.message })
  }
}

// 测试人群分流逻辑
const testAudienceSplitLogic = async () => {
  const nodes = graphInstance.value.getNodes()
  const audienceSplitNodes = nodes.filter(node => {
    const data = node.getData()
    return data && data.type === 'audience-split'
  })
  
  for (const node of audienceSplitNodes) {
    try {
      const nodeData = node.getData()
      const branches = nodeData.branches || []
      
      addResult('info', '人群分流测试', {
        nodeId: node.id,
        branchCount: branches.length,
        branches: branches.map(b => ({ id: b.id, name: b.name || b.crowdName }))
      })
      
      // 测试每个分支的预览线
      for (const branch of branches) {
        try {
          const creator = previewManager.value.creator || previewManager.value
          const branchPreviewLine = await creator.createBranchPreviewLine(node, branch)
          addResult('success', `分支预览线: ${branch.name || branch.crowdName}`, {
            branchId: branch.id,
            created: !!branchPreviewLine
          })
        } catch (error) {
          addResult('error', `分支预览线失败: ${branch.name || branch.crowdName}`, {
            branchId: branch.id,
            error: error.message
          })
        }
      }
    } catch (error) {
      addResult('error', '人群分流节点测试失败', {
        nodeId: node.id,
        error: error.message
      })
    }
  }
}

// 生命周期
onMounted(() => {
  refreshInstances()
  
  // 定期更新统计信息
  const updateInterval = setInterval(updateStats, 2000)
  
  onUnmounted(() => {
    clearInterval(updateInterval)
  })
})
</script>

<style scoped>
.audience-split-test-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.test-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.ready {
  background: #d1fae5;
  color: #065f46;
}

.status-indicator.error {
  background: #fee2e2;
  color: #991b1b;
}

.status-indicator.running {
  background: #dbeafe;
  color: #1e40af;
}

.test-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.test-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-button.primary {
  background: #3b82f6;
  color: white;
}

.test-button.primary:hover:not(:disabled) {
  background: #2563eb;
}

.test-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.test-button.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.instance-info {
  margin-bottom: 16px;
}

.instance-info h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 4px;
  font-size: 13px;
}

.info-item label {
  font-weight: 500;
  color: #6b7280;
}

.info-item .success {
  color: #059669;
}

.info-item .error {
  color: #dc2626;
}

.test-results {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.test-results h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 14px;
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  margin-bottom: 8px;
  border-radius: 6px;
  overflow: hidden;
}

.result-item.success {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.result-item.error {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.result-item.warning {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
}

.result-item.info {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.result-icon {
  font-size: 14px;
}

.result-title {
  font-weight: 500;
  flex: 1;
}

.result-time {
  color: #6b7280;
  font-size: 11px;
}

.result-content {
  padding: 0 12px 8px 12px;
}

.result-content pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>