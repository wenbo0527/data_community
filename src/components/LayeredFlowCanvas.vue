<template>
  <div class="layered-flow-canvas" ref="canvasContainer">
    <!-- 网格背景 -->
    <div class="canvas-grid"></div>
    
    <!-- 节点层 -->
    <div class="nodes-layer">
      <!-- 开始节点 -->
      <NodeWithPresetSlots
        v-if="startNode"
        :node-id="startNode.id"
        :node-type="startNode.type"
        :position="startNode.position"
        :config="startNode.config"
        :preset-slots="getNodePresetSlots(startNode.id)"
        :draggable="false"
        @preset-slot-click="handlePresetSlotClick"
        @add-node-to-slot="handleAddNodeToSlot"
        @node-click="handleNodeClick"
      >
        <template #node>
          <FlowNode
            :node-type="startNode.type"
            :label="startNode.label"
            :selected="selectedNodeId === startNode.id"
            :data="startNode.data"
            :deletable="false"
            @click="handleNodeClick(startNode)"
          />
        </template>
      </NodeWithPresetSlots>
      
      <!-- 其他节点 -->
      <NodeWithPresetSlots
        v-for="node in flowNodes"
        :key="node.id"
        :node-id="node.id"
        :node-type="node.type"
        :position="node.position"
        :config="node.config"
        :preset-slots="getNodePresetSlots(node.id)"
        @update:position="handleNodePositionUpdate(node.id, $event)"
        @preset-slot-click="handlePresetSlotClick"
        @add-node-to-slot="handleAddNodeToSlot"
        @node-click="handleNodeClick"
      >
        <template #node>
          <FlowNode
            :node-type="node.type"
            :label="node.label"
            :selected="selectedNodeId === node.id"
            :data="node.data"
            @click="handleNodeClick(node)"
            @delete="handleNodeDelete(node)"
          />
        </template>
      </NodeWithPresetSlots>
    </div>
    
    <!-- 连接线层 -->
    <div class="connections-layer">
      <svg class="connections-svg" :width="canvasWidth" :height="canvasHeight">
        <g>
          <path
            v-for="connection in connections"
            :key="connection.id"
            :d="generatePath(connection)"
            :stroke="connection.color || '#5F95FF'"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />
        </g>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#5F95FF" />
          </marker>
        </defs>
      </svg>
    </div>
    
    <!-- 节点类型选择器 -->
    <NodeTypeSelector
      v-if="showNodeSelector"
      :visible="showNodeSelector"
      :position="nodeSelectorPosition"
      :source-node="nodeSelectorSourceNode"
      :preset-slot="selectedPresetSlot"
      @select="handleNodeTypeSelected"
      @close="closeNodeSelector"
    />
    
    <!-- 节点配置抽屉 -->
    <NodeConfigDrawer
      v-if="showConfigDrawer"
      :visible="showConfigDrawer"
      :node="selectedNode"
      @close="closeConfigDrawer"
      @update="handleNodeDataUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import NodeWithPresetSlots from './NodeWithPresetSlots.vue'
import FlowNode from './FlowNode.vue'
import NodeTypeSelector from './NodeTypeSelector.vue'
import NodeConfigDrawer from './NodeConfigDrawer.vue'
import { getNodeConfig, generateDynamicNextSlots } from '../utils/nodeTypes.js'
import { useEnhancedAutoLayout } from '../composables/useEnhancedAutoLayout.js'

// 组件属性
const props = defineProps({
  // 初始节点数据
  initialNodes: {
    type: Array,
    default: () => []
  },
  // 初始连接数据
  initialConnections: {
    type: Array,
    default: () => []
  },
  // 是否自动添加开始节点
  autoAddStartNode: {
    type: Boolean,
    default: true
  }
})

// 事件
const emit = defineEmits([
  'canvas-ready',
  'node-created',
  'node-moved',
  'node-selected',
  'node-updated',
  'node-deleted',
  'connection-created',
  'preset-slot-created',
  'preset-slot-occupied'
])

// 画布容器引用
const canvasContainer = ref(null)

// 创建一个简单的图形对象，用于autoLayout初始化
let graph = null

// 初始化增强自动布局管理
const autoLayout = useEnhancedAutoLayout(() => graph)

// 画布尺寸
const canvasWidth = ref(1000)
const canvasHeight = ref(800)

// 节点数据
const nodes = ref([])
const startNode = ref(null)
const flowNodes = computed(() => nodes.value.filter(node => node.type !== 'start'))

// 连接数据
const connections = ref([])

// 预设位数据
const presetSlots = ref([])

// 选中状态
const selectedNodeId = ref(null)
const selectedNode = computed(() => {
  return nodes.value.find(node => node.id === selectedNodeId.value) || null
})

// 节点选择器状态
const showNodeSelector = ref(false)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const nodeSelectorSourceNode = ref(null)
const selectedPresetSlot = ref(null)

// 配置抽屉状态
const showConfigDrawer = ref(false)

// 初始化画布
const initCanvas = () => {
  // 初始化图形对象，用于autoLayout
  graph = {
    // 提供一个简单的图形接口，满足autoLayout的需求
    addNode: (nodeData) => {
      nodes.value.push(nodeData)
      return nodeData
    },
    createEdge: (source, target, edgeData) => {
      const connection = {
        id: `${source}-${target}`,
        source,
        target,
        ...edgeData
      }
      connections.value.push(connection)
      return connection
    },
    getNodes: () => nodes.value,
    getEdges: () => connections.value
  }
  
  // 初始化autoLayout
  autoLayout.initLayoutManager()

  // 设置画布尺寸
  if (canvasContainer.value) {
    canvasWidth.value = canvasContainer.value.clientWidth
    canvasHeight.value = canvasContainer.value.clientHeight
  }
  
  // 加载初始节点
  if (props.initialNodes.length > 0) {
    nodes.value = [...props.initialNodes]
    // 找到开始节点
    const start = nodes.value.find(node => node.type === 'start')
    if (start) {
      startNode.value = start
    }
  } else if (props.autoAddStartNode) {
    // 自动添加开始节点
    addStartNode()
  }
  
  // 加载初始连接
  if (props.initialConnections.length > 0) {
    connections.value = [...props.initialConnections]
  }
  
  // 初始化预设位
  initPresetSlots()
  
  // 触发画布就绪事件
  emit('canvas-ready', {
    nodes: nodes.value,
    connections: connections.value,
    presetSlots: presetSlots.value
  })
}

// 添加开始节点
const addStartNode = () => {
  const nodeConfig = getNodeConfig('start')
  if (!nodeConfig) return
  
  const startNodeId = 'start-node'
  
  // 尝试使用自动布局添加开始节点
  try {
    // 使用增强自动布局添加节点
    const result = autoLayout.addNodeWithEnhancedLayout('start', null, {
      forceLevel: 0
    })
    
    if (result && result.nodeData) {
      startNode.value = result.nodeData
      // 节点已经通过autoLayout添加到nodes中
      console.log('[LayeredFlowCanvas] 使用自动布局添加开始节点成功')
      
      // 初始化开始节点的预设位
      initNodePresetSlots(startNode.value)
      return
    }
  } catch (error) {
    console.error('[LayeredFlowCanvas] 使用自动布局添加开始节点失败，降级处理', error)
  }
  
  // 降级处理：手动添加开始节点
  const position = { x: canvasWidth.value / 2 - 50, y: 100 }
  
  const newStartNode = {
    id: startNodeId,
    type: 'start',
    label: nodeConfig.label,
    position,
    data: {
      fixed: true
    },
    config: nodeConfig
  }
  
  startNode.value = newStartNode
  nodes.value.push(newStartNode)
  
  // 初始化开始节点的预设位
  initNodePresetSlots(newStartNode)
}

// 初始化预设位
const initPresetSlots = () => {
  nodes.value.forEach(node => {
    initNodePresetSlots(node)
  })
}

// 初始化节点的预设位
const initNodePresetSlots = (node) => {
  console.log('🔧 初始化节点预设位:', node.type, node.id)
  
  const nodeConfig = getNodeConfig(node.type)
  console.log('📋 节点配置:', nodeConfig)
  
  if (!nodeConfig || !nodeConfig.autoExpand) {
    console.log('❌ 节点不支持自动扩展或配置不存在')
    return
  }
  
  // 对于动态节点（人群分流、事件分流、AB实验），基于配置动态生成预设位
  if (['audience-split', 'event-split', 'ab-test'].includes(node.type)) {
    console.log('🔄 动态节点，等待配置完成后生成预设位')
    // 这些节点的预设位应该基于配置页面的结果动态生成
    // 暂时不创建预设位，等待配置完成后再生成
    return
  }
  
  // 对于其他节点，使用静态配置的预设位
  if (!nodeConfig.nextSlots || nodeConfig.nextSlots.length === 0) {
    console.log('❌ 节点没有nextSlots配置')
    return
  }
  
  console.log('✅ 开始创建预设位，nextSlots数量:', nodeConfig.nextSlots.length)
  
  nodeConfig.nextSlots.forEach((slotConfig, index) => {
    const slotId = `${node.id}_slot_${index}`
    const slot = {
      id: slotId,
      nodeId: node.id,
      type: slotConfig.type,
      label: slotConfig.label,
      position: {
        x: node.position.x + slotConfig.position.x,
        y: node.position.y + slotConfig.position.y
      },
      allowedTypes: slotConfig.allowedTypes || [],
      state: 'empty',
      config: slotConfig
    }
    
    console.log('🎯 创建预设位:', slotId, 'allowedTypes:', slot.allowedTypes)
    
    // 添加到预设位列表
    const existingIndex = presetSlots.value.findIndex(s => s.id === slotId)
    if (existingIndex >= 0) {
      presetSlots.value[existingIndex] = slot
    } else {
      presetSlots.value.push(slot)
    }
    
    // 触发预设位创建事件
    emit('preset-slot-created', slot)
  })
}

// 获取节点的预设位
const getNodePresetSlots = (nodeId) => {
  return presetSlots.value.filter(slot => slot.nodeId === nodeId)
}

// 处理节点位置更新
const handleNodePositionUpdate = (nodeId, newPosition) => {
  // 更新节点位置
  const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
  if (nodeIndex >= 0) {
    nodes.value[nodeIndex].position = newPosition
    
    // 更新该节点的预设位位置
    updateNodePresetSlots(nodeId, newPosition)
    
    // 触发节点移动事件
    emit('node-moved', {
      nodeId,
      position: newPosition
    })
  }
}

// 更新节点的预设位位置
const updateNodePresetSlots = (nodeId, newPosition) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return
  
  // 对于动态节点，需要重新生成预设位
  if (['audience-split', 'event-split', 'ab-test'].includes(node.type)) {
    // 获取当前节点的配置数据
    const nodeData = node.data || {}
    
    // 更新节点位置
    node.position = newPosition
    
    // 重新生成预设位
    if (node.type === 'audience-split' && nodeData.splitCount) {
      generateDynamicPresetSlots(node, { splitCount: nodeData.splitCount })
    } else if (node.type === 'event-split' && nodeData.events) {
      generateDynamicPresetSlots(node, { events: nodeData.events })
    } else if (node.type === 'ab-test' && nodeData.variants) {
      generateDynamicPresetSlots(node, { variants: nodeData.variants })
    }
    return
  }
  
  // 对于静态节点，更新预设位位置
  const nodeConfig = getNodeConfig(node.type)
  if (!nodeConfig || !nodeConfig.nextSlots) return
  
  // 更新预设位位置
  nodeConfig.nextSlots.forEach((slotConfig, index) => {
    const slotId = `${nodeId}_slot_${index}`
    const slotIndex = presetSlots.value.findIndex(slot => slot.id === slotId)
    
    if (slotIndex >= 0) {
      presetSlots.value[slotIndex].position = {
        x: newPosition.x + slotConfig.position.x,
        y: newPosition.y + slotConfig.position.y
      }
    }
  })
}

// 处理预设位点击
const handlePresetSlotClick = (slot) => {
  if (slot.state !== 'empty') return
  
  selectedPresetSlot.value = slot
  
  // 显示节点类型选择器
  showNodeSelector.value = true
  nodeSelectorPosition.value = {
    x: slot.position.x,
    y: slot.position.y
  }
  
  // 设置源节点
  const sourceNode = nodes.value.find(node => node.id === slot.nodeId)
  nodeSelectorSourceNode.value = sourceNode
}

// 处理在预设位添加节点
const handleAddNodeToSlot = (slot) => {
  handlePresetSlotClick(slot)
}

// 处理节点类型选择
const handleNodeTypeSelected = (nodeType) => {
  if (!selectedPresetSlot.value) return
  
  // 添加节点到预设位
  addNodeToPresetSlot(selectedPresetSlot.value, nodeType)
  
  // 关闭节点选择器
  closeNodeSelector()
}

// 添加节点到预设位
const addNodeToPresetSlot = (slot, nodeType) => {
  const nodeConfig = getNodeConfig(nodeType)
  if (!nodeConfig) return
  
  // 检查节点类型是否允许
  if (slot.allowedTypes.length > 0 && !slot.allowedTypes.includes(nodeType)) {
    console.warn(`节点类型 ${nodeType} 不允许添加到此预设位`)
    return
  }
  
  // 获取源节点
  const sourceNode = nodes.value.find(node => node.id === slot.nodeId)
  if (!sourceNode) {
    console.error('找不到源节点', slot.nodeId)
    return
  }
  
  // 尝试使用自动布局添加节点
  try {
    // 使用增强自动布局添加节点
    const result = autoLayout.addNodeWithEnhancedLayout(nodeType, sourceNode, {
      connectionLabel: slot.label,
      slotIndex: slot.index
    })
    
    if (result && result.nodeData) {
      const newNode = result.nodeData
      console.log('[LayeredFlowCanvas] 使用自动布局添加节点成功', newNode.id)
      
      // 删除预设位（预设位在绑定节点后应从画布上删除）
      removePresetSlot(slot.id)
      
      // 初始化新节点的预设位
      initNodePresetSlots(newNode)
      
      // 触发节点创建事件
      emit('node-created', { node: newNode, sourceNode, connection: result.connection })
      
      return newNode
    }
  } catch (error) {
    console.error('[LayeredFlowCanvas] 使用自动布局添加节点失败，降级处理', error)
  }
  
  // 降级处理：手动添加节点
  const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 将位置对齐到网格
  const position = snapToGrid(slot.position)
  
  const newNode = {
    id: newNodeId,
    type: nodeType,
    label: nodeConfig.label,
    position,
    data: {},
    config: nodeConfig
  }
  
  // 添加节点
  nodes.value.push(newNode)
  
  // 创建连接
  const connection = createConnection(slot.nodeId, newNodeId, slot.label)
  
  // 删除预设位（预设位在绑定节点后应从画布上删除）
  removePresetSlot(slot.id)
  
  // 初始化新节点的预设位
  initNodePresetSlots(newNode)
  
  // 触发节点创建事件
  emit('node-created', { node: newNode, sourceNode, connection })
  
  return newNode
}

// 删除预设位
const removePresetSlot = (slotId) => {
  const slotIndex = presetSlots.value.findIndex(slot => slot.id === slotId)
  if (slotIndex >= 0) {
    presetSlots.value.splice(slotIndex, 1)
  }
}

// 创建连接
const createConnection = (sourceId, targetId, label = '') => {
  const connectionId = `connection_${sourceId}_${targetId}`
  
  const newConnection = {
    id: connectionId,
    sourceId,
    targetId,
    label
  }
  
  connections.value.push(newConnection)
  
  // 触发连接创建事件
  emit('connection-created', newConnection)
  
  return newConnection
}

// 生成连接路径
const generatePath = (connection) => {
  const sourceNode = nodes.value.find(node => node.id === connection.sourceId)
  const targetNode = nodes.value.find(node => node.id === connection.targetId)
  
  if (!sourceNode || !targetNode) return ''
  
  const sourceX = sourceNode.position.x + 50 // 节点中心
  const sourceY = sourceNode.position.y + 100 // 节点底部
  const targetX = targetNode.position.x + 50 // 节点中心
  const targetY = targetNode.position.y // 节点顶部
  
  // 使用贝塞尔曲线
  const controlPointY = (sourceY + targetY) / 2
  return `M ${sourceX} ${sourceY} C ${sourceX} ${controlPointY}, ${targetX} ${controlPointY}, ${targetX} ${targetY}`
}

// 处理节点点击 - 直接展示配置抽屉
const handleNodeClick = (node) => {
  selectedNodeId.value = node.id
  showConfigDrawer.value = true
  
  // 触发节点选择事件
  emit('node-selected', node)
}

// 处理节点删除
const handleNodeDelete = (node) => {
  // 递归删除节点及其后续节点
  deleteNodeAndDescendants(node.id)
}

// 递归删除节点及其后续节点
const deleteNodeAndDescendants = (nodeId) => {
  // 找到所有从该节点出发的连接
  const outgoingConnections = connections.value.filter(conn => conn.sourceId === nodeId)
  
  // 找到指向被删除节点的连接，用于后续重新创建预设位
  const incomingConnections = connections.value.filter(conn => conn.targetId === nodeId)
  
  // 递归删除所有后续节点
  outgoingConnections.forEach(connection => {
    deleteNodeAndDescendants(connection.targetId)
  })
  
  // 记录需要重新创建预设位的信息
  const slotsToRecreate = []
  incomingConnections.forEach(connection => {
    const sourceNode = nodes.value.find(node => node.id === connection.sourceId)
    const deletedNode = nodes.value.find(node => node.id === nodeId)
    
    if (sourceNode && deletedNode) {
      // 计算被删除节点相对于源节点的位置，用于重新创建预设位
      const relativePosition = {
        x: deletedNode.position.x - sourceNode.position.x,
        y: deletedNode.position.y - sourceNode.position.y
      }
      
      slotsToRecreate.push({
        sourceNode,
        targetPosition: deletedNode.position,
        relativePosition,
        connectionLabel: connection.label
      })
    }
  })
  
  // 删除与该节点相关的所有连接
  connections.value = connections.value.filter(conn => 
    conn.sourceId !== nodeId && conn.targetId !== nodeId
  )
  
  // 删除该节点的预设位
  presetSlots.value = presetSlots.value.filter(slot => slot.nodeId !== nodeId)
  
  // 删除节点本身
  const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
  if (nodeIndex >= 0) {
    const deletedNode = nodes.value[nodeIndex]
    nodes.value.splice(nodeIndex, 1)
    
    // 触发节点删除事件
    emit('node-deleted', deletedNode)
  }
  
  // 重新创建对应的预设位
  slotsToRecreate.forEach(({ sourceNode, targetPosition, relativePosition, connectionLabel }) => {
    recreateSpecificPresetSlot(sourceNode, targetPosition, relativePosition, connectionLabel)
  })
  
  // 如果删除的是当前选中的节点，清除选中状态
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null
    showConfigDrawer.value = false
  }
}

// 重新创建特定的预设位
const recreateSpecificPresetSlot = (sourceNode, targetPosition, relativePosition, connectionLabel) => {
  // 生成新的预设位ID
  const timestamp = Date.now()
  const slotId = `${sourceNode.id}_recreated_slot_${timestamp}`
  
  // 创建新的预设位
  const newSlot = {
    id: slotId,
    nodeId: sourceNode.id,
    type: 'branch',
    label: connectionLabel || '分支',
    position: {
      x: targetPosition.x,
      y: targetPosition.y
    },
    allowedTypes: ['sms', 'ai-call', 'manual-call', 'wait', 'end'],
    state: 'empty',
    config: {
      position: relativePosition,
      type: 'branch'
    }
  }
  
  // 添加到预设位列表
  presetSlots.value.push(newSlot)
  
  // 触发预设位创建事件
  emit('preset-slot-created', newSlot)
}

// 处理节点数据更新
const handleNodeDataUpdate = (nodeId, newData) => {
  const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
  if (nodeIndex >= 0) {
    nodes.value[nodeIndex].data = { ...nodes.value[nodeIndex].data, ...newData }
    
    const node = nodes.value[nodeIndex]
    
    // 根据节点类型动态生成预设位
    if (node.type === 'audience-split' && newData.splitCount) {
      generateDynamicPresetSlots(node, { splitCount: newData.splitCount })
    } else if (node.type === 'event-split' && newData.events) {
      generateDynamicPresetSlots(node, { events: newData.events })
    } else if (node.type === 'ab-test' && newData.variants) {
      generateDynamicPresetSlots(node, { variants: newData.variants })
    }
    
    // 触发节点更新事件
    emit('node-updated', {
      nodeId,
      data: nodes.value[nodeIndex].data
    })
  }
  
  // 关闭配置抽屉
  closeConfigDrawer()
}

// 动态生成预设位（用于人群分流、事件分流、AB实验节点）
const generateDynamicPresetSlots = (node, config = {}) => {
  // 先移除该节点现有的预设位
  presetSlots.value = presetSlots.value.filter(slot => slot.nodeId !== node.id)
  
  const dynamicSlots = generateDynamicNextSlots(node.type, config)
  
  dynamicSlots.forEach((slotConfig, index) => {
    const slotId = `${node.id}_slot_${index}`
    const slot = {
      id: slotId,
      nodeId: node.id,
      type: slotConfig.type,
      label: slotConfig.label,
      position: {
        x: node.position.x + slotConfig.position.x,
        y: node.position.y + slotConfig.position.y
      },
      allowedTypes: slotConfig.allowedTypes || [],
      state: 'empty',
      config: slotConfig
    }
    
    presetSlots.value.push(slot)
    
    // 触发预设位创建事件
    emit('preset-slot-created', slot)
  })
}

// 更新人群分流节点的预设位
const updateAudienceSplitPresetSlots = (node, splitCount) => {
  generateDynamicPresetSlots(node, { splitCount })
}

// 关闭节点选择器
const closeNodeSelector = () => {
  showNodeSelector.value = false
  selectedPresetSlot.value = null
  nodeSelectorSourceNode.value = null
}

// 关闭配置抽屉
const closeConfigDrawer = () => {
  showConfigDrawer.value = false
}

// 对齐到网格
const snapToGrid = (position) => {
  const gridSize = 20 // 小网格大小
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  }
}

// 窗口大小变化处理
const handleResize = () => {
  if (canvasContainer.value) {
    canvasWidth.value = canvasContainer.value.clientWidth
    canvasHeight.value = canvasContainer.value.clientHeight
  }
}

// 清空画布
const clearCanvas = () => {
  // 清空节点和连接
  nodes.value = []
  connections.value = []
  presetSlots.value = []
  startNode.value = null
  selectedNodeId.value = null
  showConfigDrawer.value = false
  
  // 清理自动布局数据
  autoLayout.clearEnhancedLayout()
  
  // 重新初始化图形对象和自动布局
  graph = {
    addNode: (nodeData) => {
      nodes.value.push(nodeData)
      return nodeData
    },
    createEdge: (source, target, edgeData) => {
      const connection = {
        id: `${source}-${target}`,
        source,
        target,
        ...edgeData
      }
      connections.value.push(connection)
      return connection
    },
    getNodes: () => nodes.value,
    getEdges: () => connections.value
  }
  
  // 重新初始化自动布局
  autoLayout.initLayoutManager()
  
  // 如果需要自动添加开始节点
  if (props.autoAddStartNode) {
    addStartNode()
  }
  
  // 触发画布清空事件
  emit('canvas-cleared')
}

// 获取画布数据
const getCanvasData = () => {
  return {
    nodes: nodes.value,
    connections: connections.value,
    presetSlots: presetSlots.value
  }
}

// 组件挂载时
onMounted(() => {
  // 初始化画布
  initCanvas()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时
onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  // 画布操作
  clearCanvas,
  getCanvasData,
  
  // 节点操作
  addNodeToPresetSlot,
  
  // 预设位操作
  getNodePresetSlots,
  generateDynamicPresetSlots,
  
  // 状态
  nodes,
  connections,
  presetSlots,
  
  // 自动布局
  autoLayout
})
</script>

<style scoped>
.layered-flow-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f8f9fa;
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 20px 20px, 80px 80px;
  background-image: 
    linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
    linear-gradient(to right, rgba(200, 200, 200, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(200, 200, 200, 0.2) 1px, transparent 1px);
  background-position: -0.5px -0.5px;
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.nodes-layer > * {
  pointer-events: auto;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>