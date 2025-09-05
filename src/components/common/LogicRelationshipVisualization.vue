<template>
  <div class="logic-relationship-visualization">
    <div class="visualization-header">
      <h3>逻辑关系图</h3>
      <div class="controls">
        <a-button size="small" @click="autoLayout">
          <icon-refresh /> 自动布局
        </a-button>
        <a-button size="small" @click="zoomToFit">
          <icon-fullscreen /> 适应画布
        </a-button>
      </div>
    </div>
    
    <div ref="containerRef" class="visualization-container">
      <svg ref="svgRef" class="logic-svg">
        <!-- 连接线 -->
        <g class="connections">
          <path 
            v-for="connection in connections"
            :key="connection.id"
            :d="connection.path"
            :class="[
              'connection-line',
              connection.type,
              { 'highlighted': connection.highlighted }
            ]"
            :stroke="getConnectionColor(connection.type)"
            :stroke-width="connection.highlighted ? 3 : 2"
            fill="none"
            @mouseover="highlightConnection(connection.id)"
            @mouseleave="clearHighlight"
          />
          
          <!-- 连接线标签 -->
          <text 
            v-for="connection in connections"
            :key="`label-${connection.id}`"
            :x="connection.labelPosition.x"
            :y="connection.labelPosition.y"
            class="connection-label"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ connection.label }}
          </text>
        </g>
        
        <!-- 节点 -->
        <g class="nodes">
          <g 
            v-for="node in nodes"
            :key="node.id"
            :transform="`translate(${isValidCoordinate(node.x) ? node.x : 200}, ${isValidCoordinate(node.y) ? node.y : 100})`"
            :class="[
              'logic-node',
              node.type,
              { 
                'highlighted': node.highlighted,
                'dragging': node.dragging
              }
            ]"
            @mousedown="startDrag(node, $event)"
            @mouseover="highlightNode(node.id)"
            @mouseleave="clearHighlight"
            @click="selectNode(node.id)"
          >
            <rect 
              :width="node.width"
              :height="node.height"
              :rx="6"
              :fill="getNodeColor(node.type)"
              :stroke="node.highlighted ? '#165dff' : '#e5e6eb'"
              :stroke-width="node.highlighted ? 2 : 1"
            />
            
            <text 
              :x="node.width / 2"
              :y="node.height / 2"
              class="node-label"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ node.label }}
            </text>
            
            <!-- 节点类型图标 -->
            <circle 
              v-if="node.type === 'exclude'"
              :cx="node.width - 8"
              :cy="8"
              r="4"
              fill="#f53f3f"
            />
          </g>
        </g>
      </svg>
    </div>
    
    <div class="visualization-footer">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color include"></div>
          <span>包含条件组</span>
        </div>
        <div class="legend-item">
          <div class="legend-color exclude"></div>
          <span>剔除条件组</span>
        </div>
        <div class="legend-item">
          <div class="legend-line and"></div>
          <span>且关系</span>
        </div>
        <div class="legend-item">
          <div class="legend-line or"></div>
          <span>或关系</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { IconRefresh, IconFullscreen } from '@arco-design/web-vue/es/icon'
import type { ConditionGroup } from '@/types/audience'

interface LogicNode {
  id: string
  label: string
  type: 'include' | 'exclude' | 'operator'
  x: number
  y: number
  width: number
  height: number
  highlighted: boolean
  dragging: boolean
}

interface LogicConnection {
  id: string
  source: string
  target: string
  type: 'and' | 'or'
  label: string
  path: string
  labelPosition: { x: number; y: number }
  highlighted: boolean
}

interface Props {
  conditionGroups?: ConditionGroup[]
  excludeGroups?: ConditionGroup[]
  crossGroupLogic?: 'and' | 'or'
}

const props = withDefaults(defineProps<Props>(), {
  conditionGroups: () => [],
  excludeGroups: () => [],
  crossGroupLogic: 'or'
})

const emit = defineEmits<{
  nodeClick: [nodeId: string]
  connectionClick: [connectionId: string]
  layoutChange: [nodes: LogicNode[]]
}>()

const containerRef = ref<HTMLDivElement>()
const svgRef = ref<SVGElement>()
const nodes = ref<LogicNode[]>([])
const connections = ref<LogicConnection[]>([])
const dragState = reactive({
  isDragging: false,
  dragNode: null as LogicNode | null,
  startX: 0,
  startY: 0
})

const getNodeColor = (type: string): string => {
  switch (type) {
    case 'include': return '#e8f4ff'
    case 'exclude': return '#fff1f0'
    case 'operator': return '#f7f8fa'
    default: return '#ffffff'
  }
}

const getConnectionColor = (type: string): string => {
  switch (type) {
    case 'and': return '#165dff'
    case 'or': return '#00b42a'
    default: return '#86909c'
  }
}

const highlightNode = (nodeId: string) => {
  nodes.value.forEach(node => {
    node.highlighted = node.id === nodeId
  })
  
  // 高亮相关连接线
  connections.value.forEach(conn => {
    conn.highlighted = conn.source === nodeId || conn.target === nodeId
  })
}

const highlightConnection = (connectionId: string) => {
  connections.value.forEach(conn => {
    conn.highlighted = conn.id === connectionId
  })
  
  const connection = connections.value.find(c => c.id === connectionId)
  if (connection) {
    nodes.value.forEach(node => {
      node.highlighted = node.id === connection.source || node.id === connection.target
    })
  }
}

const clearHighlight = () => {
  nodes.value.forEach(node => {
    node.highlighted = false
  })
  connections.value.forEach(conn => {
    conn.highlighted = false
  })
}

const selectNode = (nodeId: string) => {
  emit('nodeClick', nodeId)
}

const startDrag = (node: LogicNode, event: MouseEvent) => {
  dragState.isDragging = true
  dragState.dragNode = node
  dragState.startX = event.clientX - node.x
  dragState.startY = event.clientY - node.y
  node.dragging = true
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!dragState.isDragging || !dragState.dragNode) return
  
  dragState.dragNode.x = event.clientX - dragState.startX
  dragState.dragNode.y = event.clientY - dragState.startY
  
  updateConnections()
}

const endDrag = () => {
  if (dragState.dragNode) {
    dragState.dragNode.dragging = false
  }
  
  dragState.isDragging = false
  dragState.dragNode = null
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  
  emit('layoutChange', nodes.value)
}

const autoLayout = () => {
  // 简单的自动布局算法
  const containerWidth = containerRef.value?.clientWidth || 800
  const containerHeight = containerRef.value?.clientHeight || 600
  
  const includeNodes = nodes.value.filter(n => n.type === 'include')
  const excludeNodes = nodes.value.filter(n => n.type === 'exclude')
  const operatorNodes = nodes.value.filter(n => n.type === 'operator')
  
  // 布局包含条件组
  includeNodes.forEach((node, index) => {
    node.x = 100 + (index * 200)
    node.y = 100
  })
  
  // 布局剔除条件组
  excludeNodes.forEach((node, index) => {
    node.x = 100 + (index * 200)
    node.y = 300
  })
  
  // 布局操作符节点
  operatorNodes.forEach((node, index) => {
    node.x = 200 + (index * 200)
    node.y = 200
  })
  
  updateConnections()
}

const zoomToFit = () => {
  if (!svgRef.value || nodes.value.length === 0) return
  
  const bbox = {
    minX: Math.min(...nodes.value.map(n => n.x)),
    minY: Math.min(...nodes.value.map(n => n.y)),
    maxX: Math.max(...nodes.value.map(n => n.x + n.width)),
    maxY: Math.max(...nodes.value.map(n => n.y + n.height))
  }
  
  const padding = 50
  const viewBox = `${bbox.minX - padding} ${bbox.minY - padding} ${bbox.maxX - bbox.minX + 2 * padding} ${bbox.maxY - bbox.minY + 2 * padding}`
  
  svgRef.value.setAttribute('viewBox', viewBox)
}

const updateConnections = () => {
  connections.value.forEach(conn => {
    const sourceNode = nodes.value.find(n => n.id === conn.source)
    const targetNode = nodes.value.find(n => n.id === conn.target)
    
    if (sourceNode && targetNode) {
      const startX = sourceNode.x + sourceNode.width / 2
      const startY = sourceNode.y + sourceNode.height
      const endX = targetNode.x + targetNode.width / 2
      const endY = targetNode.y
      
      conn.path = `M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2} ${endX} ${endY}`
      conn.labelPosition = {
        x: (startX + endX) / 2,
        y: (startY + endY) / 2
      }
    }
  })
}

const buildVisualization = () => {
  nodes.value = []
  connections.value = []
  
  // 创建包含条件组节点
  props.conditionGroups.forEach((group, index) => {
    nodes.value.push({
      id: `include-${group.id}`,
      label: group.name || `条件组${index + 1}`,
      type: 'include',
      x: 100 + (index * 200),
      y: 100,
      width: 150,
      height: 60,
      highlighted: false,
      dragging: false
    })
  })
  
  // 创建剔除条件组节点
  props.excludeGroups.forEach((group, index) => {
    nodes.value.push({
      id: `exclude-${group.id}`,
      label: group.name || `剔除组${index + 1}`,
      type: 'exclude',
      x: 100 + (index * 200),
      y: 300,
      width: 150,
      height: 60,
      highlighted: false,
      dragging: false
    })
  })
  
  // 创建连接线
  if (props.conditionGroups.length > 1) {
    for (let i = 0; i < props.conditionGroups.length - 1; i++) {
      connections.value.push({
        id: `conn-include-${i}`,
        source: `include-${props.conditionGroups[i].id}`,
        target: `include-${props.conditionGroups[i + 1].id}`,
        type: props.crossGroupLogic,
        label: props.crossGroupLogic === 'and' ? '且' : '或',
        path: '',
        labelPosition: { x: 0, y: 0 },
        highlighted: false
      })
    }
  }
  
  updateConnections()
}

watch(() => [props.conditionGroups, props.excludeGroups, props.crossGroupLogic], () => {
  buildVisualization()
}, { deep: true })

onMounted(() => {
  buildVisualization()
})
</script>

<style scoped>
.logic-relationship-visualization {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.visualization-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.controls {
  display: flex;
  gap: 8px;
}

.visualization-container {
  height: 400px;
  overflow: hidden;
  position: relative;
}

.logic-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.logic-svg:active {
  cursor: grabbing;
}

.logic-node {
  cursor: pointer;
  transition: all 0.2s ease;
}

.logic-node:hover {
  transform: scale(1.05);
}

.logic-node.dragging {
  cursor: grabbing;
}

.node-label {
  font-size: 12px;
  fill: #1d2129;
  pointer-events: none;
}

.connection-line {
  cursor: pointer;
  transition: all 0.2s ease;
}

.connection-line:hover {
  stroke-width: 3;
}

.connection-line.and {
  stroke-dasharray: none;
}

.connection-line.or {
  stroke-dasharray: 5,5;
}

.connection-label {
  font-size: 12px;
  fill: #1d2129;
  background: #fff;
  pointer-events: none;
}

.visualization-footer {
  padding: 16px;
  border-top: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.legend {
  display: flex;
  gap: 24px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.legend-color.include {
  background: #e8f4ff;
}

.legend-color.exclude {
  background: #fff1f0;
}

.legend-line {
  width: 20px;
  height: 2px;
}

.legend-line.and {
  background: #165dff;
}

.legend-line.or {
  background: #00b42a;
}
</style>