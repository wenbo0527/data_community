<template>
  <div class="query-mode-panel">
    <div class="panel-header">
      <h3>查询模式</h3>
      <p class="panel-description">基于当前画布数据进行查询分析</p>
    </div>
    
    <div class="panel-content">
      <!-- 查询条件区域 -->
      <div class="query-section">
        <h4>查询条件</h4>
        <div class="query-form">
          <div class="form-item">
            <label>节点类型：</label>
            <a-select v-model="queryForm.nodeType" placeholder="选择节点类型" allow-clear>
              <a-option value="start">开始节点</a-option>
              <a-option value="condition">条件节点</a-option>
              <a-option value="action">动作节点</a-option>
              <a-option value="end">结束节点</a-option>
            </a-select>
          </div>
          
          <div class="form-item">
            <label>节点状态：</label>
            <a-select v-model="queryForm.nodeStatus" placeholder="选择节点状态" allow-clear>
              <a-option value="active">激活</a-option>
              <a-option value="inactive">未激活</a-option>
              <a-option value="error">错误</a-option>
            </a-select>
          </div>
          
          <div class="form-item">
            <label>连接数量：</label>
            <a-input-number v-model="queryForm.connectionCount" placeholder="最小连接数" :min="0" />
          </div>
          
          <div class="form-actions">
            <a-button type="primary" @click="executeQuery">执行查询</a-button>
            <a-button @click="resetQuery">重置</a-button>
          </div>
        </div>
      </div>
      
      <!-- 查询结果区域 -->
      <div class="results-section" v-if="queryResults.length > 0">
        <h4>查询结果 ({{ queryResults.length }})</h4>
        <div class="results-list">
          <div 
            v-for="result in queryResults" 
            :key="result.id" 
            class="result-item"
            @click="highlightNode(result.id)"
          >
            <div class="result-info">
              <span class="result-type">{{ getNodeTypeLabel(result.type) }}</span>
              <span class="result-title">{{ result.title || result.id }}</span>
            </div>
            <div class="result-meta">
              <span class="connection-count">连接: {{ result.connections }}</span>
              <span class="status" :class="result.status">{{ getStatusLabel(result.status) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-else-if="hasExecutedQuery">
        <IconSearch />
        <p>未找到符合条件的节点</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  canvasData: {
    type: Object,
    default: () => ({ nodes: [], edges: [] })
  },
  graph: {
    type: Object,
    default: null
  }
})

// 查询表单
const queryForm = ref({
  nodeType: '',
  nodeStatus: '',
  connectionCount: null
})

// 查询结果
const queryResults = ref([])
const hasExecutedQuery = ref(false)

// 执行查询
const executeQuery = () => {
  hasExecutedQuery.value = true
  
  if (!props.canvasData || !props.canvasData.nodes) {
    queryResults.value = []
    return
  }
  
  let results = [...props.canvasData.nodes]
  
  // 按节点类型过滤
  if (queryForm.value.nodeType) {
    results = results.filter(node => node.type === queryForm.value.nodeType)
  }
  
  // 按节点状态过滤
  if (queryForm.value.nodeStatus) {
    results = results.filter(node => node.status === queryForm.value.nodeStatus)
  }
  
  // 按连接数量过滤
  if (queryForm.value.connectionCount !== null) {
    results = results.filter(node => {
      const connections = getNodeConnections(node.id)
      return connections >= queryForm.value.connectionCount
    })
  }
  
  // 添加连接数信息
  queryResults.value = results.map(node => ({
    ...node,
    connections: getNodeConnections(node.id)
  }))
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    nodeType: '',
    nodeStatus: '',
    connectionCount: null
  }
  queryResults.value = []
  hasExecutedQuery.value = false
}

// 获取节点连接数
const getNodeConnections = (nodeId) => {
  if (!props.canvasData || !props.canvasData.edges) return 0
  
  return props.canvasData.edges.filter(edge => 
    edge.source === nodeId || edge.target === nodeId
  ).length
}

// 高亮节点
const highlightNode = (nodeId) => {
  if (props.graph) {
    // 清除之前的高亮
    props.graph.getCells().forEach(cell => {
      if (cell.isNode()) {
        cell.removeAttr('body/stroke')
        cell.removeAttr('body/strokeWidth')
      }
    })
    
    // 高亮选中的节点
    const node = props.graph.getCellById(nodeId)
    if (node) {
      node.setAttr('body/stroke', '#ff4d4f')
      node.setAttr('body/strokeWidth', 3)
      
      // 居中显示节点
      props.graph.centerCell(node)
    }
  }
}

// 获取节点类型标签
const getNodeTypeLabel = (type) => {
  const labels = {
    start: '开始节点',
    condition: '条件节点',
    action: '动作节点',
    end: '结束节点'
  }
  return labels[type] || type
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    active: '激活',
    inactive: '未激活',
    error: '错误'
  }
  return labels[status] || status
}

// 监听画布数据变化，自动重新查询
watch(() => props.canvasData, () => {
  if (hasExecutedQuery.value) {
    executeQuery()
  }
}, { deep: true })
</script>

<style scoped>
.query-mode-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.panel-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.panel-description {
  margin: 0;
  font-size: 12px;
  color: #86909c;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.query-section {
  margin-bottom: 24px;
}

.query-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-item label {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.results-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  background: #e8f3ff;
  transform: translateY(-1px);
}

.result-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.result-type {
  padding: 2px 6px;
  background: #165dff;
  color: white;
  font-size: 10px;
  border-radius: 3px;
}

.result-title {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #86909c;
}

.connection-count {
  color: #4e5969;
}

.status {
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
}

.status.active {
  background: #e8f5e8;
  color: #00b42a;
}

.status.inactive {
  background: #f2f3f5;
  color: #86909c;
}

.status.error {
  background: #ffece8;
  color: #f53f3f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #86909c;
}

.empty-state .arco-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>