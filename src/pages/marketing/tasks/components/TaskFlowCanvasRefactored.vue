<template>
  <div 
    class="task-flow-canvas" 
    @drop="eventHandlers.handleDrop($event, containerRef)" 
    @dragover="eventHandlers.handleDragOver" 
    @dragend="eventHandlers.handleDragEnd"
  >
    <div ref="containerRef" class="x6-container"></div>
    
    <!-- 画布加载状态 -->
    <div class="canvas-placeholder" v-if="!canvasInit.isCanvasReady.value">
      <div class="placeholder-content">
        <icon-loading class="loading-icon" />
        <p>画布组件加载中...</p>
        <p class="placeholder-desc">拖拽左侧节点到此处开始设计流程</p>
      </div>
    </div>

    <!-- 节点类型选择器 -->
    <NodeTypeSelector
      v-model:visible="nodeSelectorVisible"
      :position="nodeSelectorPosition"
      :source-node="selectedSourceNode"
      @node-type-selected="handleNodeTypeSelectedForPresetSlot"
      @close="handleNodeSelectorClose"
    />

    <!-- 预设位组件 -->
    <PresetSlot
      v-for="slot in nodeOperations.presetSlots.value"
      :key="slot.id"
      :slot="slot"
      :state="slot.state"
      :parent-position="{ x: 0, y: 0 }"
      :show-connector="true"
      @add-node="handleAddNodeToPresetSlot"
    />

    <!-- 节点配置抽屉组件 -->
    <TaskFlowConfigDrawers 
      :drawer-states="configDrawers.drawerStates"
      @config-confirm="({ drawerType, config }) => configDrawers.handleConfigConfirm(drawerType, config)"
      @config-cancel="({ drawerType }) => configDrawers.handleConfigCancel(drawerType)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { IconLoading } from '@arco-design/web-vue/es/icon'
import { useCanvasInit } from '../../../../composables/useCanvasInit.js'
import { useNodeOperations } from '../../../../composables/useNodeOperations.js'
import { useEventHandlers } from '../../../../composables/useEventHandlers.js'
import { useConfigDrawers } from '../../../../composables/useConfigDrawers.js'
import TaskFlowConfigDrawers from './TaskFlowConfigDrawers.vue'
import NodeTypeSelector from '../../../../components/TaskFlow/NodeTypeSelector.vue'
import PresetSlot from '../../../../components/TaskFlow/PresetSlot.vue'

// 定义事件
const emit = defineEmits([
  'canvas-ready',
  'node-created',
  'node-moved', 
  'node-clicked',
  'node-double-clicked',
  'nodes-deleted',
  'edge-connected',
  'show-node-selector'
])

// DOM 引用
const containerRef = ref()

// 节点选择器状态
const nodeSelectorVisible = ref(false)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const selectedSourceNode = ref(null)

// 初始化画布
const canvasInit = useCanvasInit(containerRef, emit)

// 节点操作
const nodeOperations = useNodeOperations(() => canvasInit.graph())

// 配置抽屉管理
const configDrawers = useConfigDrawers(() => canvasInit.graph(), nodeOperations)

// 处理显示节点选择器
const handleShowNodeSelector = ({ sourceNode, position }) => {
  selectedSourceNode.value = sourceNode
  nodeSelectorPosition.value = position
  nodeSelectorVisible.value = true
}

// 事件处理
const eventHandlers = useEventHandlers(
  () => canvasInit.graph(), 
  nodeOperations, 
  {
    ...emit,
    'show-node-selector': handleShowNodeSelector
  }
)

// 处理节点点击事件
const handleNodeInteraction = ({ node, nodeType, nodeData }) => {
  // 打开对应的配置抽屉
  configDrawers.openConfigDrawer(nodeType, node, nodeData.config || {})
}

// 处理节点类型选择
const handleNodeTypeSelected = ({ nodeType, sourceNode }) => {
  if (nodeOperations.addNextNode && sourceNode) {
    const newNode = nodeOperations.addNextNode(sourceNode, nodeType)
    if (newNode) {
      emit('node-created', {
        node: newNode,
        nodeType,
        sourceNode
      })
    }
  }
}

// 处理在预设位添加节点
const handleAddNodeToPresetSlot = ({ slot, position }) => {
  // 显示节点选择器，让用户选择要添加的节点类型
  selectedSourceNode.value = {
    id: slot.nodeId,
    slotId: slot.id,
    allowedTypes: slot.allowedTypes
  }
  nodeSelectorPosition.value = position
  nodeSelectorVisible.value = true
}

// 修改节点类型选择处理，支持预设位
const handleNodeTypeSelectedForPresetSlot = ({ nodeType, sourceNode }) => {
  if (sourceNode.slotId) {
    // 在预设位添加节点
    const newNode = nodeOperations.addNodeToPresetSlot(sourceNode.slotId, nodeType)
    if (newNode) {
      emit('node-created', {
        node: newNode,
        nodeType,
        sourceNode: { id: sourceNode.id }
      })
    }
  } else {
    // 原有的添加后续节点逻辑
    handleNodeTypeSelected({ nodeType, sourceNode })
  }
}

// 处理节点选择器关闭
const handleNodeSelectorClose = () => {
  nodeSelectorVisible.value = false
  selectedSourceNode.value = null
}

// 窗口大小变化处理
const handleResize = () => {
  canvasInit.resizeCanvas()
}

// 监听节点交互事件
const setupNodeInteractionListeners = () => {
  // 监听节点点击事件
  eventHandlers.handleNodeClick = (node, e) => {
    const nodeData = node.getData()
    const nodeType = nodeData?.type
    
    if (nodeType && !configDrawers.drawerStates[configDrawers.getDrawerType(nodeType)]?.visible) {
      handleNodeInteraction({ node, nodeType, nodeData })
    }
  }
}

// 组件挂载后初始化
onMounted(() => {
  // 初始化画布
  canvasInit.initialize()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 延迟初始化事件监听器和开始节点
  setTimeout(() => {
    if (canvasInit.graph()) {
      eventHandlers.initEventListeners()
      setupNodeInteractionListeners()
      
      // 事件处理器已经集成了节点选择器显示逻辑
      
      // 初始化布局管理器
      nodeOperations.initLayoutManager()
      
      // 添加开始节点
      const startNode = nodeOperations.addStartNode(containerRef)
      if (startNode) {
        startNode.toFront()
        // 更新预设位显示
        setTimeout(() => {
          nodeOperations.updatePresetSlots()
        }, 100)
      }
    }
  }, 300)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  canvasInit.destroyCanvas()
})

// 暴露方法给父组件
defineExpose({
  // 画布操作
  getCanvasData: canvasInit.getCanvasData,
  setCanvasData: canvasInit.setCanvasData,
  clearCanvas: canvasInit.clearCanvas,
  resizeCanvas: canvasInit.resizeCanvas,
  
  // 节点操作
  addNode: nodeOperations.addNode,
  addStartNode: () => nodeOperations.addStartNode(containerRef),
  removeNodes: nodeOperations.removeNodes,
  updateNodeData: nodeOperations.updateNodeData,
  getAllNodes: nodeOperations.getAllNodes,
  
  // 预设位操作
  addNodeToPresetSlot: nodeOperations.addNodeToPresetSlot,
  getPresetSlots: () => nodeOperations.presetSlots.value,
  getEmptyPresetSlots: nodeOperations.getEmptyPresetSlots,
  clearAllPresetSlots: nodeOperations.clearAllPresetSlots,
  getPresetSlotStats: nodeOperations.getPresetSlotStats,
  
  // 画布实例
  graph: canvasInit.graph,
  
  // 强制更新
  forceUpdate: () => canvasInit.graph()?.render(),
  
  // 添加连接
  addConnection: (conn) => canvasInit.graph()?.addEdge(conn)
})
</script>

<style scoped>
.task-flow-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.x6-container {
  width: 100%;
  height: 100%;
}

.canvas-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.placeholder-content {
  text-align: center;
  color: #86909c;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

.placeholder-content p {
  margin: 8px 0;
  font-size: 14px;
}

.placeholder-desc {
  font-size: 12px;
  color: #c9cdd4;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* X6 样式覆盖 */
:deep(.x6-widget-selection-rubberband) {
  border: 1px solid #165dff;
  background-color: rgba(22, 93, 255, 0.1);
}

:deep(.x6-widget-selection-box) {
  opacity: 0;
}

:deep(.x6-widget-selection-box:hover) {
  opacity: 1;
}

:deep(.x6-node) {
  cursor: move;
}

:deep(.x6-node:hover) {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

:deep(.x6-edge:hover path:nth-child(2)) {
  stroke: #4080ff;
  stroke-width: 3;
}

:deep(.x6-port-body) {
  fill: #fff;
  stroke: #165dff;
  stroke-width: 2;
}

:deep(.x6-port-body:hover) {
  fill: #165dff;
  stroke: #165dff;
}
</style>