<template>
  <div class="relationship-graph">
    <div ref="graphContainer" class="graph-container"></div>
    
    <!-- 图谱控制面板 -->
    <div class="graph-controls">
      <div class="control-group">
        <label>布局算法:</label>
        <a-select v-model="layoutType" @change="changeLayout" size="small">
          <a-option value="force">力导向布局</a-option>
          <a-option value="circular">环形布局</a-option>
          <a-option value="radial">径向布局</a-option>
          <a-option value="dagre">层次布局</a-option>
        </a-select>
      </div>
      
      <div class="control-group">
        <a-button-group size="small">
          <a-button @click="zoomIn">
            <template #icon><IconPlus /></template>
          </a-button>
          <a-button @click="zoomOut">
            <template #icon><IconMinus /></template>
          </a-button>
          <a-button @click="fitView">
            <template #icon><IconFullscreen /></template>
          </a-button>
          <a-button @click="resetView">
            <template #icon><IconRefresh /></template>
          </a-button>
        </a-button-group>
      </div>
      
      <div class="control-group">
        <a-switch v-model="showLabels" size="small" />
        <label>显示标签</label>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="graph-legend">
      <div class="legend-title">关系类型</div>
      <div class="legend-items">
        <div 
          v-for="type in relationshipTypes" 
          :key="type.key"
          class="legend-item"
        >
          <div 
            class="legend-color" 
            :style="{ backgroundColor: type.color }"
          ></div>
          <span class="legend-label">{{ type.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- 节点信息面板 -->
    <div v-if="selectedNodeInfo" class="node-info-panel">
      <div class="panel-header">
        <h6>节点信息</h6>
        <a-button 
          type="text" 
          size="small" 
          @click="selectedNodeInfo = null"
        >
          <template #icon><IconClose /></template>
        </a-button>
      </div>
      
      <div class="panel-content">
        <div class="info-item">
          <label>姓名:</label>
          <span>{{ selectedNodeInfo.name }}</span>
        </div>
        <div class="info-item">
          <label>身份证:</label>
          <span>{{ selectedNodeInfo.idCard }}</span>
        </div>
        <div class="info-item">
          <label>手机号:</label>
          <span>{{ selectedNodeInfo.phone }}</span>
        </div>
        <div class="info-item">
          <label>关系类型:</label>
          <a-tag :color="getRelationshipColor(selectedNodeInfo.relationship)">
            {{ getRelationshipLabel(selectedNodeInfo.relationship) }}
          </a-tag>
        </div>
        <div class="info-item">
          <label>关系强度:</label>
          <a-progress 
            :percent="Math.round(selectedNodeInfo.strength * 100)" 
            :color="getStrengthColor(selectedNodeInfo.strength)"
            size="small"
          />
        </div>
        <div class="info-item">
          <label>风险等级:</label>
          <a-tag :color="getRiskColor(selectedNodeInfo.risk)">
            {{ selectedNodeInfo.risk }}
          </a-tag>
        </div>
      </div>
      
      <div class="panel-actions">
        <a-button type="primary" size="small" @click="viewNodeDetails">
          查看详情
        </a-button>
        <a-button size="small" @click="analyzeRiskPath">
          风险分析
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Graph } from '@antv/x6'
import {
  IconPlus,
  IconMinus,
  IconFullscreen,
  IconRefresh,
  IconClose
} from '@arco-design/web-vue/es/icon'

interface Props {
  data: {
    nodes: any[]
    edges: any[]
  }
  width?: number
  height?: number
}

interface Emits {
  (e: 'node-click', node: any): void
  (e: 'edge-click', edge: any): void
  (e: 'node-details', node: any): void
  (e: 'risk-analysis', node: any): void
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 500
})

const emit = defineEmits<Emits>()

// 响应式数据
const graphContainer = ref<HTMLElement>()
const graph = ref<Graph | null>(null)
const layoutType = ref('force')
const showLabels = ref(true)
const selectedNodeInfo = ref<any>(null)

// 关系类型配置
const relationshipTypes = [
  { key: 'family', label: '家庭关系', color: '#1890ff' },
  { key: 'guarantee', label: '担保关系', color: '#52c41a' },
  { key: 'co_loan', label: '共同借贷', color: '#faad14' },
  { key: 'emergency', label: '紧急联系人', color: '#722ed1' },
  { key: 'business', label: '商业关系', color: '#13c2c2' },
  { key: 'social', label: '社交关系', color: '#eb2f96' }
]

// 节点样式配置
const getNodeStyle = (node: any) => {
  const isCenter = node.isCenter
  const riskLevel = node.risk
  
  let fill = '#1890ff'
  let stroke = '#1890ff'
  let size = isCenter ? 40 : 30
  
  // 根据风险等级设置颜色
  if (riskLevel === 'high') {
    fill = '#ff4d4f'
    stroke = '#ff4d4f'
  } else if (riskLevel === 'medium') {
    fill = '#faad14'
    stroke = '#faad14'
  } else if (riskLevel === 'low') {
    fill = '#52c41a'
    stroke = '#52c41a'
  }
  
  // 中心节点特殊样式
  if (isCenter) {
    fill = '#722ed1'
    stroke = '#722ed1'
    size = 50
  }
  
  return {
    fill,
    stroke,
    size,
    lineWidth: 2,
    opacity: 0.8
  }
}

// 边样式配置
const getEdgeStyle = (edge: any) => {
  const relationshipType = edge.relationship
  const strength = edge.strength || 0.5
  
  const typeConfig = relationshipTypes.find(t => t.key === relationshipType)
  const color = typeConfig?.color || '#d9d9d9'
  
  return {
    stroke: color,
    strokeWidth: Math.max(1, strength * 4),
    opacity: 0.6,
    targetMarker: {
      name: 'classic',
      size: 8,
      fill: color,
      stroke: color
    }
  }
}

// 初始化图谱
const initGraph = () => {
  if (!graphContainer.value) return
  
  // 创建X6图谱实例
  graph.value = new Graph({
    container: graphContainer.value,
    width: props.width,
    height: props.height,
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee',
          thickness: 1
        },
        {
          color: '#ddd',
          thickness: 1,
          factor: 4
        }
      ]
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown', 'mouseWheel']
    },
    mousewheel: {
      enabled: true,
      modifiers: 'ctrl',
      factor: 1.1,
      maxScale: 1.5,
      minScale: 0.5
    },
    interacting: {
       nodeMovable: true
     }
  })
  
  // 绑定事件
  bindEvents()
}

// 绑定事件
const bindEvents = () => {
  if (!graph.value) return
  
  // 节点点击事件
  graph.value.on('node:click', ({ node }) => {
    const data = node.getData()
    selectedNodeInfo.value = data
    emit('node-click', data)
  })
  
  // 边点击事件
  graph.value.on('edge:click', ({ edge }) => {
    const data = edge.getData()
    emit('edge-click', data)
  })
  
  // 画布点击事件
  graph.value.on('blank:click', () => {
    selectedNodeInfo.value = null
  })
}

// 渲染数据
const renderData = () => {
  if (!graph.value || !props.data) return
  
  // 清空现有数据
  graph.value.clearCells()
  
  // 添加节点
  props.data.nodes.forEach(nodeData => {
    const style = getNodeStyle(nodeData)
    
    const node = graph.value!.addNode({
      id: nodeData.id,
      x: nodeData.x || Math.random() * props.width,
      y: nodeData.y || Math.random() * props.height,
      width: style.size,
      height: style.size,
      shape: 'circle',
      attrs: {
        body: {
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.lineWidth,
          opacity: style.opacity
        },
        label: {
          text: showLabels.value ? nodeData.name : '',
          fontSize: 12,
          fill: '#4e5969'
        }
      },
      data: nodeData
    })
  })
  
  // 添加边
  props.data.edges.forEach(edgeData => {
    const style = getEdgeStyle(edgeData)
    
    graph.value!.addEdge({
      id: edgeData.id,
      source: edgeData.source,
      target: edgeData.target,
      attrs: {
        line: {
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          targetMarker: style.targetMarker
        }
      },
      labels: edgeData.label ? [{
        attrs: {
          text: {
            text: edgeData.label,
            fontSize: 10,
            fill: '#4e5969'
          }
        }
      }] : [],
      data: edgeData
    })
  })
  
  // 自动布局
  nextTick(() => {
    fitView()
  })
}

// 布局切换
const changeLayout = (type: string) => {
  layoutType.value = type
  // X6不直接支持布局算法，这里可以集成其他布局库
  // 或者使用简单的力导向布局
  applyLayout(type)
}

// 应用布局
const applyLayout = (type: string) => {
  if (!graph.value) return
  
  const nodes = graph.value.getNodes()
  const centerX = props.width / 2
  const centerY = props.height / 2
  
  switch (type) {
    case 'circular':
      // 环形布局
      const radius = Math.min(props.width, props.height) / 3
      nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodes.length
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        node.setPosition(x, y)
      })
      break
      
    case 'radial':
      // 径向布局
      const centerNode = nodes.find(node => node.getData()?.isCenter)
      if (centerNode) {
        centerNode.setPosition(centerX, centerY)
        const otherNodes = nodes.filter(node => !node.getData()?.isCenter)
        const radiusStep = Math.min(props.width, props.height) / 6
        
        otherNodes.forEach((node, index) => {
          const angle = (2 * Math.PI * index) / otherNodes.length
          const r = radiusStep * (1 + Math.floor(index / 6))
          const x = centerX + r * Math.cos(angle)
          const y = centerY + r * Math.sin(angle)
          node.setPosition(x, y)
        })
      }
      break
      
    case 'dagre':
      // 层次布局
      nodes.forEach((node, index) => {
        const row = Math.floor(index / 4)
        const col = index % 4
        const x = (props.width / 5) * (col + 1)
        const y = (props.height / Math.ceil(nodes.length / 4)) * (row + 1)
        node.setPosition(x, y)
      })
      break
      
    default:
      // 力导向布局（简单实现）
      nodes.forEach((node, index) => {
        const x = centerX + (Math.random() - 0.5) * props.width * 0.6
        const y = centerY + (Math.random() - 0.5) * props.height * 0.6
        node.setPosition(x, y)
      })
  }
}

// 缩放控制
const zoomIn = () => {
  if (graph.value) {
    graph.value.zoom(0.1)
  }
}

const zoomOut = () => {
  if (graph.value) {
    graph.value.zoom(-0.1)
  }
}

const fitView = () => {
  if (graph.value) {
    graph.value.zoomToFit({ padding: 20 })
  }
}

const resetView = () => {
  if (graph.value) {
    graph.value.centerContent()
    graph.value.zoomTo(1)
  }
}

// 辅助函数
const getRelationshipColor = (type: string) => {
  const config = relationshipTypes.find(t => t.key === type)
  return config?.color || '#d9d9d9'
}

const getRelationshipLabel = (type: string) => {
  const config = relationshipTypes.find(t => t.key === type)
  return config?.label || '未知关系'
}

const getStrengthColor = (strength: number) => {
  if (strength >= 0.8) return '#52c41a'
  if (strength >= 0.5) return '#faad14'
  return '#ff4d4f'
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'red'
    case 'medium': return 'orange'
    case 'low': return 'green'
    default: return 'default'
  }
}

const viewNodeDetails = () => {
  if (selectedNodeInfo.value) {
    emit('node-details', selectedNodeInfo.value)
  }
}

const analyzeRiskPath = () => {
  if (selectedNodeInfo.value) {
    emit('risk-analysis', selectedNodeInfo.value)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  renderData()
}, { deep: true })

// 监听标签显示
watch(showLabels, (newVal) => {
  if (graph.value) {
    const nodes = graph.value.getNodes()
    nodes.forEach(node => {
      const data = node.getData()
      node.attr('label/text', newVal ? data?.name || '' : '')
    })
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initGraph()
    renderData()
  })
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose()
  }
})
</script>

<style scoped>
.relationship-graph {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fafafa;
  border-radius: 6px;
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.graph-controls {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 12px;
  color: #4e5969;
  white-space: nowrap;
}

.graph-legend {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  min-width: 120px;
}

.legend-title {
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 11px;
  color: #4e5969;
}

.node-info-panel {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.panel-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.panel-content {
  padding: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-size: 12px;
  color: #4e5969;
  font-weight: 500;
}

.info-item span {
  font-size: 12px;
  color: #1d2129;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-actions {
  padding: 12px 16px;
  background: #f7f8fa;
  border-top: 1px solid #e5e6eb;
  display: flex;
  gap: 8px;
}

.panel-actions .arco-btn {
  flex: 1;
}
</style>