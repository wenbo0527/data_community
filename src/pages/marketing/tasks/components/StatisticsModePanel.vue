<template>
  <div class="statistics-mode-panel">
    <div class="panel-header">
      <h3>统计模式</h3>
      <p class="panel-description">基于当前画布数据进行统计分析</p>
    </div>
    
    <div class="panel-content">
      <!-- 基础统计 -->
      <div class="stats-section">
        <h4>基础统计</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ basicStats.totalNodes }}</div>
            <div class="stat-label">总节点数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ basicStats.totalEdges }}</div>
            <div class="stat-label">总连接数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ basicStats.avgConnections }}</div>
            <div class="stat-label">平均连接数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ basicStats.maxDepth }}</div>
            <div class="stat-label">最大深度</div>
          </div>
        </div>
      </div>
      
      <!-- 节点类型分布 -->
      <div class="stats-section">
        <h4>节点类型分布</h4>
        <div class="chart-container">
          <div class="node-type-chart">
            <div 
              v-for="(count, type) in nodeTypeStats" 
              :key="type"
              class="chart-bar"
            >
              <div class="bar-label">{{ getNodeTypeLabel(type) }}</div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ width: getBarWidth(count, basicStats.totalNodes) + '%' }"
                ></div>
                <span class="bar-value">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 连接度分析 -->
      <div class="stats-section">
        <h4>连接度分析</h4>
        <div class="connection-analysis">
          <div class="analysis-item">
            <span class="analysis-label">最高连接度节点：</span>
            <span class="analysis-value">{{ highestConnectedNode.title || highestConnectedNode.id }} ({{ highestConnectedNode.connections }})</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">孤立节点数量：</span>
            <span class="analysis-value">{{ isolatedNodesCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">关键路径长度：</span>
            <span class="analysis-value">{{ criticalPathLength }}</span>
          </div>
        </div>
      </div>
      
      <!-- 流程健康度 -->
      <div class="stats-section">
        <h4>流程健康度</h4>
        <div class="health-score">
          <div class="score-circle" :class="getHealthScoreClass()">
            <span class="score-value">{{ healthScore }}</span>
            <span class="score-unit">分</span>
          </div>
          <div class="health-details">
            <div class="health-item" :class="{ 'health-good': hasStartNode, 'health-bad': !hasStartNode }">
              <icon-check-circle v-if="hasStartNode" />
              <icon-close-circle v-else />
              <span>开始节点</span>
            </div>
            <div class="health-item" :class="{ 'health-good': hasEndNode, 'health-bad': !hasEndNode }">
              <icon-check-circle v-if="hasEndNode" />
              <icon-close-circle v-else />
              <span>结束节点</span>
            </div>
            <div class="health-item" :class="{ 'health-good': noIsolatedNodes, 'health-bad': !noIsolatedNodes }">
              <icon-check-circle v-if="noIsolatedNodes" />
              <icon-close-circle v-else />
              <span>无孤立节点</span>
            </div>
            <div class="health-item" :class="{ 'health-good': hasValidFlow, 'health-bad': !hasValidFlow }">
              <icon-check-circle v-if="hasValidFlow" />
              <icon-close-circle v-else />
              <span>流程完整</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="panel-actions">
        <a-button type="primary" @click="refreshStats">
          <icon-refresh />刷新统计
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  IconCheckCircle, 
  IconCloseCircle, 
  IconRefresh, 
  IconDownload 
} from '@arco-design/web-vue/es/icon'

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

// 基础统计
const basicStats = computed(() => {
  const nodes = props.canvasData?.nodes || []
  const edges = props.canvasData?.edges || []
  
  const totalNodes = nodes.length
  const totalEdges = edges.length
  const avgConnections = totalNodes > 0 ? (totalEdges * 2 / totalNodes).toFixed(1) : 0
  const maxDepth = calculateMaxDepth()
  
  return {
    totalNodes,
    totalEdges,
    avgConnections,
    maxDepth
  }
})

// 节点类型统计
const nodeTypeStats = computed(() => {
  const nodes = props.canvasData?.nodes || []
  const stats = {}
  
  nodes.forEach(node => {
    const type = node.type || 'unknown'
    stats[type] = (stats[type] || 0) + 1
  })
  
  return stats
})

// 最高连接度节点
const highestConnectedNode = computed(() => {
  const nodes = props.canvasData?.nodes || []
  const edges = props.canvasData?.edges || []
  
  let maxConnections = 0
  let maxNode = { id: 'N/A', title: 'N/A', connections: 0 }
  
  nodes.forEach(node => {
    const connections = edges.filter(edge => 
      edge.source === node.id || edge.target === node.id
    ).length
    
    if (connections > maxConnections) {
      maxConnections = connections
      maxNode = { ...node, connections }
    }
  })
  
  return maxNode
})

// 孤立节点数量
const isolatedNodesCount = computed(() => {
  const nodes = props.canvasData?.nodes || []
  const edges = props.canvasData?.edges || []
  
  return nodes.filter(node => {
    return !edges.some(edge => edge.source === node.id || edge.target === node.id)
  }).length
})

// 关键路径长度
const criticalPathLength = computed(() => {
  return calculateCriticalPath()
})

// 流程健康度检查
const hasStartNode = computed(() => {
  const nodes = props.canvasData?.nodes || []
  return nodes.some(node => node.type === 'start')
})

const hasEndNode = computed(() => {
  const nodes = props.canvasData?.nodes || []
  return nodes.some(node => node.type === 'end')
})

const noIsolatedNodes = computed(() => {
  return isolatedNodesCount.value === 0
})

const hasValidFlow = computed(() => {
  return hasStartNode.value && hasEndNode.value && basicStats.value.totalEdges > 0
})

// 健康度评分
const healthScore = computed(() => {
  let score = 0
  if (hasStartNode.value) score += 25
  if (hasEndNode.value) score += 25
  if (noIsolatedNodes.value) score += 25
  if (hasValidFlow.value) score += 25
  return score
})

// 计算最大深度
const calculateMaxDepth = () => {
  const nodes = props.canvasData?.nodes || []
  const edges = props.canvasData?.edges || []
  
  if (nodes.length === 0) return 0
  
  // 简化的深度计算
  const startNodes = nodes.filter(node => node.type === 'start')
  if (startNodes.length === 0) return 1
  
  // 使用BFS计算最大深度
  let maxDepth = 0
  startNodes.forEach(startNode => {
    const visited = new Set()
    const queue = [{ id: startNode.id, depth: 1 }]
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()
      if (visited.has(id)) continue
      visited.add(id)
      maxDepth = Math.max(maxDepth, depth)
      
      const outgoingEdges = edges.filter(edge => edge.source === id)
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push({ id: edge.target, depth: depth + 1 })
        }
      })
    }
  })
  
  return maxDepth
}

// 计算关键路径
const calculateCriticalPath = () => {
  const nodes = props.canvasData?.nodes || []
  const edges = props.canvasData?.edges || []
  
  if (nodes.length === 0) return 0
  
  const startNodes = nodes.filter(node => node.type === 'start')
  const endNodes = nodes.filter(node => node.type === 'end')
  
  if (startNodes.length === 0 || endNodes.length === 0) return 0
  
  // 简化的关键路径计算
  let maxPath = 0
  startNodes.forEach(startNode => {
    endNodes.forEach(endNode => {
      const path = findShortestPath(startNode.id, endNode.id, edges)
      maxPath = Math.max(maxPath, path)
    })
  })
  
  return maxPath
}

// 查找最短路径
const findShortestPath = (startId, endId, edges) => {
  const visited = new Set()
  const queue = [{ id: startId, distance: 0 }]
  
  while (queue.length > 0) {
    const { id, distance } = queue.shift()
    if (id === endId) return distance
    if (visited.has(id)) continue
    visited.add(id)
    
    const outgoingEdges = edges.filter(edge => edge.source === id)
    outgoingEdges.forEach(edge => {
      if (!visited.has(edge.target)) {
        queue.push({ id: edge.target, distance: distance + 1 })
      }
    })
  }
  
  return 0
}

// 获取节点类型标签
const getNodeTypeLabel = (type) => {
  const labels = {
    start: '开始节点',
    condition: '条件节点',
    action: '动作节点',
    end: '结束节点',
    unknown: '未知类型'
  }
  return labels[type] || type
}

// 获取柱状图宽度
const getBarWidth = (value, total) => {
  return total > 0 ? (value / total) * 100 : 0
}

// 获取健康度评分样式类
const getHealthScoreClass = () => {
  const score = healthScore.value
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-fair'
  return 'score-poor'
}

// 刷新统计
const refreshStats = () => {
  // 触发重新计算
  console.log('刷新统计数据')
}

 

// 监听画布数据变化
watch(() => props.canvasData, () => {
  // 数据变化时自动刷新统计
}, { deep: true })
</script>

<style scoped>
.statistics-mode-panel {
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

.stats-section {
  margin-bottom: 24px;
}

.stats-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #165dff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.chart-container {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

.node-type-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-label {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.bar-container {
  position: relative;
  height: 20px;
  background: #e5e6eb;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #165dff, #3c7eff);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.bar-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
  color: #1d2129;
}

.connection-analysis {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e6eb;
}

.analysis-item:last-child {
  border-bottom: none;
}

.analysis-label {
  font-size: 12px;
  color: #4e5969;
}

.analysis-value {
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
}

.health-score {
  display: flex;
  gap: 20px;
  align-items: center;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 4px solid;
}

.score-excellent {
  border-color: #00b42a;
  background: #e8f5e8;
}

.score-good {
  border-color: #ff7d00;
  background: #fff7e8;
}

.score-fair {
  border-color: #ffb400;
  background: #fffbe8;
}

.score-poor {
  border-color: #f53f3f;
  background: #ffece8;
}

.score-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

.score-unit {
  font-size: 10px;
  opacity: 0.7;
}

.score-excellent .score-value,
.score-excellent .score-unit {
  color: #00b42a;
}

.score-good .score-value,
.score-good .score-unit {
  color: #ff7d00;
}

.score-fair .score-value,
.score-fair .score-unit {
  color: #ffb400;
}

.score-poor .score-value,
.score-poor .score-unit {
  color: #f53f3f;
}

.health-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.health-good {
  color: #00b42a;
}

.health-bad {
  color: #f53f3f;
}

.panel-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.panel-actions .arco-btn {
  flex: 1;
}
</style>
