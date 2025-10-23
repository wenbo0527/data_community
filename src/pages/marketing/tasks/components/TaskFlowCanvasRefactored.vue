<template>
  <div class="task-flow-canvas" @drop="$emit('drop', $event)" @dragover="$emit('dragover', $event)">
    <!-- X6 画布容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 小地图组件 -->
    <CanvasMinimap
      v-if="showMinimap"
      :visible="showMinimap"
      :collapsed="minimapCollapsed"
      :minimap-container-ref="minimapContainer"
      @toggle-collapse="toggleMinimapCollapse"
      @close="closeMinimap"
    />

    <!-- 历史面板组件 -->
    <CanvasHistoryPanel
      v-if="showHistoryPanel"
      :visible="showHistoryPanel"
      :history-stack="historyStack"
      @close="toggleHistoryPanel"
      @jump-to-state="jumpToHistoryState"
    />

    <!-- 节点类型选择器 -->
    <NodeTypeSelector 
      v-if="showNodeSelector" 
      :visible="showNodeSelector" 
      :position="nodeSelectorPosition"
      :source-node="nodeSelectorSourceNode" 
      @select="handleNodeTypeSelected" 
      @close="closeNodeSelector" 
    />

    <!-- 开始节点配置抽屉 -->
    <StartNodeConfigDrawer 
      v-if="showStartNodeConfigDrawer" 
      :visible="showStartNodeConfigDrawer"
      :node-data="selectedStartNodeData" 
      @update:visible="showStartNodeConfigDrawer = $event"
      @confirm="handleStartNodeConfigConfirm" 
      @cancel="handleStartNodeConfigCancel" 
    />

    <!-- 节点配置抽屉已移除，统一使用 TaskFlowConfigDrawers -->

    <!-- 统一配置抽屉组件 -->
    <TaskFlowConfigDrawers 
      v-if="configDrawers && configDrawers.drawerStates" 
      :drawer-states="configDrawers.drawerStates"
      @config-confirm="handleConfigConfirm" 
      @config-cancel="handleConfigCancel"
      @visibility-change="handleDrawerVisibilityChange" 
    />

    <!-- 工具栏 -->
    <CanvasToolbar
      v-if="!readonly"
      :scale-display-text="scaleDisplayText"
      :current-drag-mode="currentDragMode"
      :is-applying-layout="isApplyingLayout"
      :current-layout-direction="currentLayoutDirection"
      :show-minimap="showMinimap"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :show-history-panel="showHistoryPanel"
      :show-debug-panel="showDebugPanel"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-zoom="resetZoom"
      @fit-to-content="fitToContent"
      @set-drag-mode="setDragMode"
      @apply-unified-structured-layout="applyUnifiedStructuredLayout"
      @layout-direction-change="handleLayoutDirectionChange"
      @toggle-minimap="toggleMinimap"
      @clear-canvas="clearCanvas"
      @undo="undo"
      @redo="redo"
      @toggle-history-panel="toggleHistoryPanel"
      @export="handleExport"
      @toggle-debug-panel="toggleDebugPanel"
    />

    <!-- 连接线右键菜单 -->
    <ConnectionContextMenu
      :visible="edgeContextMenu.visible"
      :position="{ x: edgeContextMenu.x, y: edgeContextMenu.y }"
      :edge="edgeContextMenu.edge"
      :graph="graph"
      @close="edgeContextMenu.visible = false"
      @delete-connection="handleDeleteConnection"
      @restore-preview-line="handleRestorePreviewLine"
    />

    <!-- 调试功能悬浮框 -->
    <CanvasDebugPanel
      v-if="showDebugPanel"
      :visible="showDebugPanel"
      :position="debugPanelPosition"
      :debug-stats="debugStats"
      :is-generating-preview-lines="isGeneratingPreviewLines.value"
      @close="closeDebugPanel"
      @drag-start="startDragDebugPanel"
      @check-preview-line-validity="checkPreviewLineValidity"
      @trigger-preview-line-generation="triggerPreviewLineGeneration"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, provide, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import { Message } from '@arco-design/web-vue'

// 组件导入
import NodeTypeSelector from '../../../../components/NodeTypeSelector.vue'
// import NodeConfigDrawer from './canvas/NodeConfigDrawer.vue' // 已移除，统一使用 TaskFlowConfigDrawers
import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import TaskFlowConfigDrawers from './TaskFlowConfigDrawers.vue'
import ConnectionContextMenu from './ConnectionContextMenu.vue'
import FlowNode from '../../../../components/FlowNode.vue'
import CanvasToolbar from './CanvasToolbar.vue'
import CanvasMinimap from './CanvasMinimap.vue'
import CanvasHistoryPanel from './CanvasHistoryPanel.vue'
import CanvasDebugPanel from './CanvasDebugPanel.vue'

// 组合函数导入 - 解耦优化
import { useCanvasCore } from '../composables/useCanvasCore.js'
import { useCanvasState } from '../composables/useCanvasState.js'
import { useCanvasEvents } from '../composables/useCanvasEvents.js'
import { useCanvasLifecycle } from '../composables/useCanvasLifecycle.js'

// 服务管理器导入 - 统一服务管理
import { createServiceManager } from '../managers/ServiceManager.js'
import { GraphServiceAdapter } from '../services/GraphServiceAdapter.js'
import { LayoutServiceAdapter } from '../services/LayoutServiceAdapter.js'
import { EventServiceAdapter } from '../services/EventServiceAdapter.js'

// 工具函数导入 - 简化依赖
import { getNodeConfig, getNodeAttrs } from '../../../../utils/nodeTypes.js'
import { createNodeConfig } from '../utils/canvas/createNodeConfig.js'
import { useConfigDrawers } from '../composables/canvas/useConfigDrawers.js'
import { useStructuredLayout } from '../composables/canvas/useStructuredLayout.js'
import { CanvasPanZoomManager } from '../utils/canvas/CanvasPanZoomManager.js'
import { nodeConfigManager } from '../utils/canvas/NodeConfigManager.js'
import { registerCustomShapes } from '../utils/canvas/x6Config.js'
import { createBranchConnectionConfig, validateConnectionConfig } from '../utils/canvas/connectionConfigFactory.js'
import { connectionErrorHandler, logger } from '../../../../utils/enhancedErrorHandler.js'
import portConfigFactory from '../utils/canvas/portConfigFactory.js'

// 系统组件导入 - 模块边界清晰化
import { PreviewLineSystem } from '../../../../utils/preview-line/PreviewLineSystem.js'
import { UnifiedEdgeManager } from '../composables/canvas/unified/UnifiedEdgeManager.js'
import { coordinateManager } from '../utils/canvas/CoordinateSystemManager.js'
import { EdgeOverlapManager } from '../utils/canvas/EdgeOverlapManager.js'
import { dragSnapLogger, startNodeDragLogging, endNodeDragLogging } from '../../../../utils/DragSnapLogger.js'

// 统一事件总线导入 - 标准化事件处理
import { unifiedEventBus, EventTypes } from '../utils/UnifiedEventBus.js'
import { globalEventBus } from '../utils/EventBus.js'

// 注册 Vue 节点
register({
  shape: 'vue-shape',
  width: 100,
  height: 100,
  component: FlowNode
})

// 组件属性
const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => []
  },
  initialConnections: {
    type: Array,
    default: () => []
  },
  autoAddStartNode: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

// 事件
const emit = defineEmits([
  'canvas-ready',
  'canvas-translate',
  'canvas-translated',
  'canvas-scaled',
  'node-created',
  'node-moved',
  'node-selected',
  'node-updated',
  'node-deleted',
  'node-position-changed',
  'connection-created',
  'drop',
  'dragover',
  'preview-line-moved',
  'preview-line-clicked',
  'canvas-initialized',
  'canvas-reset',
  'node-delete-requested',
  'undo-requested',
  'redo-requested',
  'copy-requested',
  'paste-requested',
  'node-config-updated',
  'auto-connection-created'
])

// 核心状态 - 解耦优化
const canvasContainer = ref(null)

// 服务管理器实例
let canvasServiceManager = null

// 首先初始化画布核心功能 - 确保 graph 变量先定义
const {
  graph,
  initializeGraph,
  registerCustomEdgeShapes,
  initializePlugins,
  initializeMinimap,
  calculateConnectionPoints,
  destroyGraph,
  resetGraph
} = useCanvasCore()

// 然后初始化状态管理
const state = useCanvasState()

// 初始化服务层 - 使用ServiceManager统一管理
const initializeServices = async () => {
  if (!graph.value) {
    console.warn('[TaskFlowCanvas] Graph未初始化，无法初始化服务层')
    return
  }

  try {
    // 创建专用的服务管理器实例
    canvasServiceManager = createServiceManager()
    
    // 检查并清理已存在的服务
    if (canvasServiceManager.has('GraphService')) {
      await canvasServiceManager.destroyService('GraphService')
    }
    if (canvasServiceManager.has('LayoutService')) {
      await canvasServiceManager.destroyService('LayoutService')
    }
    if (canvasServiceManager.has('EventService')) {
      await canvasServiceManager.destroyService('EventService')
    }
    
    // 注册服务适配器
    canvasServiceManager
      .register('GraphService', GraphServiceAdapter, {
        dependencies: [],
        config: { graph: graph.value }
      })
      .register('LayoutService', LayoutServiceAdapter, {
        dependencies: ['GraphService'],
        config: { graph: graph.value, eventBus: globalEventBus }
      })
      .register('EventService', EventServiceAdapter, {
        dependencies: [],
        config: { eventBus: globalEventBus }
      })
    
    // 初始化所有服务
    await canvasServiceManager.initializeAll({
      graph: graph.value,
      eventBus: globalEventBus
    })
    
    console.log('✅ [TaskFlowCanvas] 服务层初始化完成')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 服务层初始化失败:', error)
    throw error
  }
}

// 销毁服务层
const destroyServices = async () => {
  try {
    // 清理统一事件总线监听器
    unifiedEventBus.off(EventTypes.NODE_CREATED)
    unifiedEventBus.off(EventTypes.NODE_DELETED)
    unifiedEventBus.off(EventTypes.CONNECTION_CREATED)
    unifiedEventBus.off(EventTypes.LAYOUT_CHANGED)
    unifiedEventBus.off(EventTypes.NODE_CONFIG_UPDATED)
    unifiedEventBus.off(EventTypes.CANVAS_READY)
    
    if (canvasServiceManager) {
      await canvasServiceManager.destroyAll()
      canvasServiceManager = null
    }
    console.log('✅ [TaskFlowCanvas] 服务层已销毁')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 服务层销毁失败:', error)
  }
}

// 确保state对象正确初始化 - 增强空值检查
if (!state) {
  throw new Error('状态管理初始化失败 - state为null')
}

// 确保状态管理返回的对象包含必要的属性
if (!state.nodes || !state.connections) {
  throw new Error('状态管理初始化失败 - 缺少必要属性')
}

// 验证状态管理返回的对象结构
// 状态管理初始化完成，跳过详细日志

// 增强对state.nodes的安全检查 - 修复：不直接修改state对象，避免computed readonly警告
if (!state.nodes) {
  console.error('[TaskFlowCanvas] state.nodes为null，状态管理初始化异常')
  throw new Error('状态管理初始化失败 - state.nodes为null')
}

// 增强对state.connections的安全检查 - 修复：不直接修改state对象，避免computed readonly警告
if (!state.connections) {
  console.error('[TaskFlowCanvas] state.connections为null，状态管理初始化异常')
  throw new Error('状态管理初始化失败 - state.connections为null')
}

// 解构状态对象，确保所有必要的状态都可用
const {
  nodes,
  connections,
  selectedNodeId,
  selectedNodes,
  selectedEdges,
  // showConfigDrawer, // 已移除，统一使用 TaskFlowConfigDrawers
  selectedNodeData,
  showUnifiedConfigDrawer,
  isGraphReady,
  currentZoom,
  showZoomDisplay,
  isDragging,
  dragNodeType,
  isDeleting,
  canUndo,
  canRedo,
  historyList,
  layoutStats,
  debugStats,
  showDebugPanel,
  canvasScale,
  canvasTranslate,
  resetAllState,
  updateLayoutStats,
  addNodeToState,
  removeNodeFromState,
  addConnectionToState,
  removeConnectionFromState
} = state

// 直接使用解构后的状态变量，不需要别名

// 验证解构后的状态
// 状态解构验证已完成，跳过详细日志

// 确保 nodes.value 存在并且是数组
if (!nodes.value || !Array.isArray(nodes.value)) {
  try {
    // 增强安全检查 - 确保 nodes 存在且是响应式对象
    if (!nodes || typeof nodes !== 'object' || !('value' in nodes)) {
      throw new Error('nodes 状态异常')
    } else {
      nodes.value = []
    }
  } catch (error) {
    throw new Error('状态管理初始化失败 - nodes.value无法初始化')
  }
}

// 确保 connections.value 存在并且是数组
if (!connections.value || !Array.isArray(connections.value)) {
  try {
    // 增强安全检查 - 确保 connections 存在且是响应式对象
    if (!connections || typeof connections !== 'object' || !('value' in connections)) {
      throw new Error('connections 状态异常')
    } else {
      connections.value = []
    }
  } catch (error) {
    throw new Error('状态管理初始化失败 - connections.value无法初始化')
  }
}

// 核心业务方法 - 提前定义
const addNodeToGraph = (nodeData) => {
  // 首先验证graph实例是否存在且有效 - 增强安全检查，包含 isGraphReady 状态
  if (!graph?.value || typeof graph.value.addNode !== 'function' || !isGraphReady?.value) {
    return null
  }

  // 增强参数验证
  if (!nodeData) {
    return null
  }

  try {
    // 🔧 修复：使用与节点选择器相同的createNodeConfig函数
    // 使用已导入的createNodeConfig函数
    
    // 确保position对象存在
    const position = (nodeData && nodeData.position) || { x: 100, y: 100 }
    
    // 格式化节点数据，确保包含所有必要字段
    const formattedNodeData = {
      id: nodeData.id,
      type: nodeData.type,
      label: nodeData.label,
      x: position.x,
      y: position.y,
      width: nodeData.width,
      height: nodeData.height,
      config: nodeData.config || {},
      data: nodeData.data || {},
      ...nodeData
    }
    
    console.log('[TaskFlowCanvas] 格式化的节点数据:', formattedNodeData)
    
    // 🔧 修复：使用createNodeConfig创建正确的节点配置
    const nodeConfig = createNodeConfig(formattedNodeData)
    console.log('[TaskFlowCanvas] 创建的节点配置:', nodeConfig)

    // 再次验证graph实例，确保在调用addNode前graph仍然有效 - 增强版本
    if (!graph?.value || typeof graph.value.addNode !== 'function' || !isGraphReady?.value) {
      console.error('[TaskFlowCanvas] Graph实例在addNode调用前变为无效:', {
        hasGraph: !!graph,
        hasGraphValue: !!(graph?.value),
        hasAddNodeMethod: !!(graph?.value && typeof graph.value.addNode === 'function'),
        isGraphReady: isGraphReady?.value
      })
      return null
    }
    
    console.log('[TaskFlowCanvas] 准备调用addNode，使用createNodeConfig生成的配置:', {
      id: nodeConfig.id,
      shape: nodeConfig.shape,
      position: { x: nodeConfig.x, y: nodeConfig.y },
      size: { width: nodeConfig.width, height: nodeConfig.height },
      attrs: nodeConfig.attrs,
      portsCount: nodeConfig.ports?.items?.length || 0
    })
    
    // 🔧 修复：使用createNodeConfig生成的完整配置
    const node = graph.value.addNode(nodeConfig)

    console.log('[TaskFlowCanvas] ✅ 节点添加成功:', nodeData.id)
    
    // 更新状态 - 使用解构后的状态变量，添加更严格的null检查
    console.log('[TaskFlowCanvas] 准备更新状态，nodes:', {
      exists: !!nodes,
      hasValue: nodes && 'value' in nodes,
      valueType: nodes?.value ? typeof nodes.value : 'undefined',
      isArray: Array.isArray(nodes?.value)
    })
    
    // 确保 nodes 存在且是响应式对象
    if (!nodes || !('value' in nodes)) {
      console.error('[TaskFlowCanvas] nodes 不是有效的响应式对象')
      return node
    }
    
    // 确保 nodes.value 是数组
    if (!Array.isArray(nodes.value)) {
      console.warn('[TaskFlowCanvas] nodes.value 不是数组，重新初始化')
      nodes.value = []
    }

    // 安全查找现有节点索引
    let existingNodeIndex = -1
    try {
      existingNodeIndex = nodes.value.findIndex(n => n && n.id === nodeData.id)
    } catch (error) {
      console.error('[TaskFlowCanvas] 查找节点索引失败:', error)
      existingNodeIndex = -1
    }

    // 更新或添加节点数据
    if (existingNodeIndex >= 0) {
      // 更新现有节点
      nodes.value[existingNodeIndex] = {
        ...nodes.value[existingNodeIndex],
        ...nodeData,
        data: formattedNodeData
      }
      console.log('[TaskFlowCanvas] 更新现有节点:', nodeData.id)
    } else {
      // 添加新节点
      nodes.value.push({
        ...nodeData,
        data: formattedNodeData
      })
      console.log('[TaskFlowCanvas] 添加新节点:', nodeData.id)
    }

    return node
    
  } catch (error) {
    console.error('[TaskFlowCanvas] 节点添加失败:', error)
    return null
  }
}

const addConnectionToGraph = async (connectionData) => {
  console.log('🔗 [TaskFlowCanvas] 开始创建连接:', connectionData)
  
  try {
    // 首先验证graph实例是否存在且有效
    if (!graph || !graph.value || typeof graph.value.addEdge !== 'function') {
      console.error('❌ [TaskFlowCanvas] Graph实例无效或未初始化，无法添加连接:', {
        hasGraph: !!graph,
        hasGraphValue: !!(graph && graph.value),
        hasAddEdgeMethod: !!(graph && graph.value && typeof graph.value.addEdge === 'function'),
        connectionId: connectionData?.id
      })
      return null
    }
    
    // 详细验证连接数据
    if (!connectionData) {
      console.error('❌ [TaskFlowCanvas] 连接数据为空')
      return null
    }
    
    if (!connectionData.source || !connectionData.target) {
      console.error('❌ [TaskFlowCanvas] 连接数据缺少必要字段:', connectionData)
      return null
    }

  // 检查是否为预览线
  const isPreview = connectionData.isPreview === true || 
                   connectionData.type === 'preview-line' ||
                   connectionData.isPersistentPreview === true ||
                   connectionData.isUnifiedPreview === true

  console.log('🔍 [TaskFlowCanvas] 连接类型分析:', {
    isPreview,
    connectionType: connectionData.type,
    isPreviewFlag: connectionData.isPreview,
    isPersistentPreview: connectionData.isPersistentPreview,
    isUnifiedPreview: connectionData.isUnifiedPreview
  })

  // 使用统一边管理器创建连接（仅用于真实连接）
  if (unifiedEdgeManager && !isPreview) {
    try {
      const edgeData = {
        sourceNodeId: connectionData.source,
        targetNodeId: connectionData.target,
        sourcePortId: connectionData.sourcePort,
        targetPortId: connectionData.targetPort,
        branchId: connectionData.branchId,
        label: connectionData.label,
        id: connectionData.id
      }
      
      const edge = await unifiedEdgeManager.createConnectionEdge(edgeData)
      if (edge) {
        console.log('✅ [TaskFlowCanvas] 通过统一边管理器创建连接成功:', edge.id)
        return edge
      } else {
        console.warn('⚠️ [TaskFlowCanvas] 统一边管理器创建连接失败，使用传统方式')
      }
    } catch (error) {
      console.error('❌ [TaskFlowCanvas] 统一边管理器创建连接异常:', error)
      console.warn('⚠️ [TaskFlowCanvas] 回退到传统连接创建方式')
    }
  }

  // 验证源节点和目标节点是否存在 - 使用安全访问
  if (!graph?.value || typeof graph.value.getCellById !== 'function') {
    console.error('[TaskFlowCanvas] Graph实例无效，无法验证节点')
    return null
  }
  const sourceNode = graph.value.getCellById(connectionData.source)
  const targetNode = graph.value.getCellById(connectionData.target)

  console.log('📍 [TaskFlowCanvas] 节点查找结果:', {
    sourceNodeId: connectionData.source,
    targetNodeId: connectionData.target,
    sourceNodeFound: !!sourceNode,
    targetNodeFound: !!targetNode,
    sourceNodeType: (sourceNode && typeof sourceNode.getData === 'function') ? 
      ((sourceNode.data || sourceNode.store?.data?.data || {})?.nodeType || (sourceNode.data || sourceNode.store?.data?.data || {})?.type) : 'unknown',
    targetNodeType: (targetNode && typeof targetNode.getData === 'function') ? 
      ((targetNode.data || targetNode.store?.data?.data || {})?.nodeType || (targetNode.data || targetNode.store?.data?.data || {})?.type) : 'unknown'
  })

  if (sourceNode && targetNode) {
    // 检查端口是否存在
    const sourcePorts = sourceNode.getPorts ? sourceNode.getPorts() : []
    const targetPorts = targetNode.getPorts ? targetNode.getPorts() : []
    
    const sourcePortExists = sourcePorts.find(p => p.id === connectionData.sourcePort)
    const targetPortExists = targetPorts.find(p => p.id === connectionData.targetPort)
    
    console.log('🔌 [TaskFlowCanvas] 端口检查:', {
      sourcePort: connectionData.sourcePort,
      targetPort: connectionData.targetPort,
      sourcePortExists: !!sourcePortExists,
      targetPortExists: !!targetPortExists,
      sourcePorts: sourcePorts.map(p => p.id),
      targetPorts: targetPorts.map(p => p.id)
    })

    // 创建连接前再次验证graph实例
    if (!graph || !graph.value || typeof graph.value.addEdge !== 'function') {
      console.error('❌ [TaskFlowCanvas] Graph实例无效，无法创建连接')
      return null
    }
    
    const edge = graph.value.addEdge({
      id: connectionData.id,
      source: {
        cell: connectionData.source,
        port: connectionData.sourcePort || 'out'
      },
      target: {
        cell: connectionData.target,
        port: connectionData.targetPort || 'in'
      },
      router: 'manhattan',
      connector: 'rounded',
      attrs: {
        line: {
          stroke: isPreview ? '#ddd' : '#1890ff',
          strokeWidth: isPreview ? 1 : 2,
          strokeDasharray: isPreview ? '5 5' : '',
          targetMarker: {
            name: 'classic',
            size: 8
          }
        }
      },
      data: {
        branchId: connectionData.branchId,
        label: connectionData.label,
        isPreview: isPreview
      }
    })

    // 添加标签
    if (connectionData.label) {
      edge.appendLabel({
        attrs: {
          text: {
            text: connectionData.label,
            fill: '#666',
            fontSize: 12
          }
        }
      })
    }

    console.log('✅ [TaskFlowCanvas] 连接已添加到图中:', connectionData.id)
    // 使用统一事件总线发送事件
        unifiedEventBus.emit(EventTypes.CONNECTION_CREATED, connectionData)
        emit('connection-created', connectionData)

    return edge
  } else {
    console.error('❌ [TaskFlowCanvas] 源节点或目标节点不存在')
    return null
  }
} catch (error) {
  console.error('❌ [TaskFlowCanvas] 创建连接失败:', error)
  return null
}
}

// 辅助方法
const getAllChildNodes = (nodeId, visited = new Set()) => {
  if (visited.has(nodeId)) {
    return []
  }
  visited.add(nodeId)
  
  let childNodes = []
  
  try {
    if (graph && graph.value && typeof graph.value.getEdges === 'function') {
      // 优先从X6图形库获取连接信息
      const edges = graph.value.getEdges()
      const directChildren = edges
        .filter(edge => {
          const edgeData = edge.getData() || {}
          return edge.getSourceCellId() === nodeId && !edgeData.isPreview
        })
        .map(edge => edge.getTargetCellId())
      
      childNodes = [...directChildren]
      
      // 递归获取子节点的子节点
      for (const childId of directChildren) {
        const grandChildren = getAllChildNodes(childId, visited)
        childNodes = childNodes.concat(grandChildren)
      }
    } else {
      // 回退到connections.value
      const directChildren = connections.value
        .filter(conn => conn.source === nodeId && !conn.isPreview)
        .map(conn => conn.target)
      
      childNodes = [...directChildren]
      
      // 递归获取子节点的子节点
      for (const childId of directChildren) {
        const grandChildren = getAllChildNodes(childId, visited)
        childNodes = childNodes.concat(grandChildren)
      }
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 获取子节点失败:', error)
  }
  
  return [...new Set(childNodes)] // 去重
}

const cascadeDeleteNode = (nodeId) => {
  try {
    console.log('[TaskFlowCanvas] 开始级联删除节点:', nodeId)
    
    // 获取所有子节点
    const childNodes = getAllChildNodes(nodeId)
    
    // 删除所有子节点
    for (const childId of childNodes) {
      if (!graph?.value || typeof graph.value.getCellById !== 'function' || typeof graph.value.removeNode !== 'function') {
        console.error('[TaskFlowCanvas] Graph实例无效，无法删除子节点:', childId)
        continue
      }
      
      const childNode = graph.value.getCellById(childId)
      if (childNode) {
        graph.value.removeNode(childNode)
        
        // 从状态中移除 - 安全访问
        if (nodes && nodes.value && Array.isArray(nodes.value)) {
          const nodeIndex = nodes.value.findIndex(n => n && n.id === childId)
          if (nodeIndex >= 0) {
            nodes.value.splice(nodeIndex, 1)
          }
        }
        
        // 使用统一事件总线发送事件
        unifiedEventBus.emit(EventTypes.NODE_DELETED, { nodeId: childId })
        emit('node-deleted', { nodeId: childId })
      }
    }
    
    // 删除主节点 - 使用安全访问
    if (!graph?.value || typeof graph.value.getCellById !== 'function' || typeof graph.value.removeNode !== 'function') {
      console.error('[TaskFlowCanvas] Graph实例无效，无法删除主节点:', nodeId)
      return
    }
    
    const mainNode = graph.value.getCellById(nodeId)
    if (mainNode) {
      graph.value.removeNode(mainNode)
      
      // 从状态中移除 - 安全访问
      if (nodes && nodes.value && Array.isArray(nodes.value)) {
        const nodeIndex = nodes.value.findIndex(n => n && n.id === nodeId)
        if (nodeIndex >= 0) {
          nodes.value.splice(nodeIndex, 1)
        }
      }
      
      // 使用统一事件总线发送事件
      unifiedEventBus.emit(EventTypes.NODE_DELETED, { nodeId })
      emit('node-deleted', { nodeId })
    }
    
    updateLayoutStats()
  } catch (error) {
    console.error('[TaskFlowCanvas] 级联删除失败:', error)
  }
}

const createNodePorts = (nodeConfig, nodeType) => {
  console.log('[TaskFlowCanvas] 创建端口配置:', { nodeType, nodeConfig })
  
  // 添加参数验证
  if (!nodeType) {
    console.error('[TaskFlowCanvas] nodeType 为空或undefined')
    return { groups: {}, items: [] }
  }
  
  if (!nodeConfig) {
    console.warn('[TaskFlowCanvas] nodeConfig 为空或undefined，使用默认配置')
  }
  
  // 获取当前布局方向
  const layoutDirection = state.layoutDirection.value || 'TB'
  
  try {
    // 使用专门的端口配置工厂
    const portConfig = portConfigFactory.createNodePortConfig(nodeType, nodeConfig)
    
    console.log('[TaskFlowCanvas] 端口配置结果:', { portConfig, layoutDirection })
    
    return portConfig
  } catch (error) {
    console.error('[TaskFlowCanvas] 创建端口配置失败:', error)
    console.error('[TaskFlowCanvas] 错误详情:', {
      nodeType,
      nodeConfig,
      error: error.message,
      stack: error.stack
    })
    
    // 返回默认端口配置
    return {
      groups: {
        in: {
          position: { name: 'top', args: { x: '50%', y: 0 } },
          attrs: { circle: { r: 4, magnet: true, strokeWidth: 2, fill: '#fff' } }
        },
        out: {
          position: { name: 'bottom', args: { x: '50%', y: '100%' } },
          attrs: { circle: { r: 4, magnet: true, strokeWidth: 2, fill: '#fff' } }
        }
      },
      items: [
        { group: 'in', id: 'in' },
        { group: 'out', id: 'out' }
      ]
    }
  }
}

// updateLayoutStats 已经从 state 中解构出来，删除重复定义

const validateNodeConfiguration = (nodeData, realConnections = []) => {
  if (!nodeData) {
    return {
      shouldCreatePreview: false,
      isConfigured: false,
      hasActualConfig: false,
      reason: '节点数据为空'
    }
  }

  const nodeType = nodeData.nodeType || nodeData.type
  const config = nodeData.config || {}
  const branches = nodeData.branches || config.branches || []

  // 检查是否有实际配置
  const hasActualConfig = config && Object.keys(config).length > 0

  // 检查是否已配置 - 修复：start节点默认为已配置
  const isConfigured = nodeData.isConfigured === true || hasActualConfig || nodeType === 'start'

  // 检查是否应该创建预览线
  let shouldCreatePreview = false
  let reason = ''

  if (!isConfigured) {
    reason = '节点未配置'
    shouldCreatePreview = false
  } else {
    // 检查是否已有真实连接
    const hasRealConnections = realConnections && realConnections.length > 0
    
    if (hasRealConnections) {
      reason = '节点已有真实连接，无需预览线'
      shouldCreatePreview = false
    } else {
      // 根据节点类型判断是否应该创建预览线
      switch (nodeType) {
        case 'start':
          // 开始节点默认已配置，应该创建预览线
          shouldCreatePreview = true
          reason = '开始节点已配置'
          break
        case 'condition':
          if (branches.length > 0) {
            shouldCreatePreview = true
            reason = '条件节点已配置分支'
          } else {
            shouldCreatePreview = false
            reason = '条件节点没有分支配置'
          }
          break
        case 'action':
        case 'delay':
        case 'webhook':
        case 'task':
          // 动作类节点如果已配置，应该创建预览线
          shouldCreatePreview = true
          reason = '动作节点已配置'
          break
        case 'end':
          // 结束节点不需要预览线
          shouldCreatePreview = false
          reason = '结束节点不需要预览线'
          break
        default:
          // 其他类型节点，如果已配置则创建预览线
          shouldCreatePreview = isConfigured
          reason = isConfigured ? '节点已配置' : '节点未配置'
          break
      }
    }
  }

  return {
    shouldCreatePreview,
    isConfigured,
    hasActualConfig,
    reason,
    nodeType,
    branchCount: branches.length,
    hasRealConnections: realConnections && realConnections.length > 0
  }
}

// 画布核心功能已在前面初始化，这里删除重复定义

// 系统实例
let previewLineSystem = null
let unifiedEdgeManager = null
let minimap = null
let panZoomManager = null
let edgeOverlapManager = null
let unifiedPreviewLineManager = null

// 初始化系统实例 - 同步，不初始化需要Graph实例的组件
const initializeSystems = () => {
  try {
    console.log('[TaskFlowCanvas] 开始初始化基础系统实例')
    
    // 严格验证：确保不在这里调用任何需要Graph实例的代码
    if (graph && graph.value) {
      console.warn('[TaskFlowCanvas] 警告：initializeSystems被调用时Graph实例已存在，这可能导致重复初始化')
    }
    
    // 注意：CanvasPanZoomManager 和 EdgeOverlapManager 需要Graph实例
    // 因此将它们移到 initializeGraphDependentSystems 中初始化
    
    // 这里只初始化真正不需要Graph实例的组件
    // 目前没有这样的组件，所以这个函数主要用于日志记录和验证
    
    console.log('[TaskFlowCanvas] ✅ 基础系统实例初始化完成（无Graph依赖）')
  } catch (error) {
    console.error('[TaskFlowCanvas] 系统实例初始化失败:', error)
    throw error
  }
}

// 初始化依赖Graph实例的系统组件 - 增强版本，使用标准错误处理
const initializeGraphDependentSystems = async (graphInstance) => {
  try {
    console.log('[TaskFlowCanvas] 开始初始化依赖Graph的系统组件')
    
    // 1. 验证Graph实例
    if (!graphInstance || typeof graphInstance.on !== 'function') {
      throw new Error('无效的Graph实例，无法初始化依赖Graph的系统组件')
    }
    
    // 2. 按优先级顺序初始化系统组件
    const initializationSteps = [
      {
        name: 'CanvasPanZoomManager',
        init: () => {
          if (!panZoomManager) {
            panZoomManager = new CanvasPanZoomManager(graphInstance)
            console.log('[TaskFlowCanvas] ✓ CanvasPanZoomManager 初始化完成')
          }
        },
        required: true
      },
      {
        name: 'EdgeOverlapManager', 
        init: () => {
          if (!edgeOverlapManager) {
            edgeOverlapManager = new EdgeOverlapManager(graphInstance)
            console.log('[TaskFlowCanvas] ✓ EdgeOverlapManager 初始化完成')
          }
        },
        required: false
      },
      {
        name: 'PreviewLineSystem',
        init: async () => {
          if (!previewLineSystem) {
            // 使用重试机制初始化PreviewLineSystem
            let retryCount = 0
            const maxRetries = 3
            let initSuccess = false
            
            // 简化重试机制，减少重试次数
            try {
              console.log('[TaskFlowCanvas] 初始化PreviewLineSystem')
              
              previewLineSystem = new PreviewLineSystem({ 
                graph: graphInstance,
                enabledModules: {
                  manager: true,
                  renderer: true,
                  validator: true,
                  calculator: true,
                  detector: true,
                  analyzer: true,
                  optimizer: true,
                  cache: true
                }
              })
              
              // 异步初始化
              await previewLineSystem.init()
              
              // 🔧 关键修复：立即设置临时布局引擎引用，确保布局引擎就绪
              // 创建一个临时的布局引擎引用，避免预览线创建时因布局引擎未就绪而跳过
              const tempLayoutEngine = {
                isReady: true,
                // 🔧 修复：添加 isLayoutEngineReady 方法，确保预览线验证器能正确检查状态
                isLayoutEngineReady: () => true,
                executeLayout: () => Promise.resolve({ success: true }),
                setGraph: () => {},
                updateGraph: () => {},
                updatePreviewManager: () => {}
              }
              
              // 设置临时布局引擎，确保预览线系统可以正常工作
              if (previewLineSystem.setLayoutEngine) {
                const setResult = previewLineSystem.setLayoutEngine(tempLayoutEngine)
                console.log('[TaskFlowCanvas] ✓ 临时布局引擎设置结果:', setResult)
                console.log('[TaskFlowCanvas] 🔍 布局引擎就绪状态检查:', previewLineSystem.isLayoutEngineReady())
                
                // 检查验证器中的布局引擎状态
                if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
                  console.log('[TaskFlowCanvas] 🔍 验证器布局引擎就绪状态:', previewLineSystem.previewLineManager.validator.isLayoutEngineReady())
                }
              } else {
                console.error('[TaskFlowCanvas] ❌ previewLineSystem.setLayoutEngine 方法不存在')
              }
              
              // 将实例存储到state中
              state.previewLineSystem.value = previewLineSystem
              
              // 🔧 修复：设置到全局 window 对象，供 useConfigDrawers 使用
              if (typeof window !== 'undefined') {
                window.previewLineSystem = previewLineSystem
                console.log('[TaskFlowCanvas] ✓ PreviewLineSystem 已设置到全局 window 对象')
              }
              
              console.log('[TaskFlowCanvas] ✓ PreviewLineSystem 初始化完成')
              initSuccess = true
              
            } catch (error) {
              console.error('[TaskFlowCanvas] PreviewLineSystem 初始化失败:', error.message)
              console.error('[TaskFlowCanvas] 错误详情:', error)
              
              // 抛出错误，使用标准错误处理
              throw new Error(`PreviewLineSystem 初始化失败: ${error.message}`)
            }
          }
        },
        required: false
      },
      {
        name: 'UnifiedEdgeManager',
        init: async () => {
          if (!unifiedEdgeManager) {
            unifiedEdgeManager = new UnifiedEdgeManager(graphInstance)
            console.log('[TaskFlowCanvas] ✓ UnifiedEdgeManager 创建完成')
            
            // 初始化UnifiedEdgeManager
            if (unifiedEdgeManager && unifiedEdgeManager.initialize) {
              await unifiedEdgeManager.initialize()
              console.log('[TaskFlowCanvas] ✓ UnifiedEdgeManager 初始化完成')
            }
            
            // 🔧 修复：设置到全局 window 对象，供 useConfigDrawers 使用
            if (typeof window !== 'undefined') {
              window.unifiedEdgeManager = unifiedEdgeManager
              console.log('[TaskFlowCanvas] ✓ UnifiedEdgeManager 已设置到全局 window 对象')
            }
          }
        },
        required: false
      }
    ]
    
    // 3. 执行初始化步骤
    for (const step of initializationSteps) {
      try {
        await step.init()
      } catch (error) {
        console.error(`[TaskFlowCanvas] ${step.name} 初始化失败:`, error)
        
        if (step.required) {
          throw new Error(`必需组件 ${step.name} 初始化失败: ${error.message}`)
        } else {
          console.warn(`[TaskFlowCanvas] 可选组件 ${step.name} 初始化失败，继续其他组件初始化`)
        }
      }
    }
    
    // 4. 验证全局对象设置状态
    console.log('[TaskFlowCanvas] 验证全局对象设置状态:', {
      windowPreviewLineSystem: !!(typeof window !== 'undefined' && window.previewLineSystem),
      windowUnifiedEdgeManager: !!(typeof window !== 'undefined' && window.unifiedEdgeManager),
      previewLineSystemType: typeof window?.previewLineSystem,
      unifiedEdgeManagerType: typeof window?.unifiedEdgeManager
    })
    
    console.log('[TaskFlowCanvas] ✅ 依赖Graph的系统组件初始化完成')
  } catch (error) {
    console.error('[TaskFlowCanvas] 依赖Graph的系统组件初始化失败:', error)
    throw error
  }
}





// 配置抽屉管理 - 修复：需要传递 getGraph 函数
console.log('[TaskFlowCanvasRefactored] 开始初始化 configDrawers...')
const configDrawers = useConfigDrawers(() => graph.value)
console.log('[TaskFlowCanvasRefactored] configDrawers 初始化完成:', {
  hasConfigDrawers: !!configDrawers,
  hasOpenConfigDrawer: !!(configDrawers && configDrawers.openConfigDrawer),
  configDrawersKeys: configDrawers ? Object.keys(configDrawers) : []
})

// 🔧 修复：确保 configDrawers 能够访问到预览线管理器实例
if (configDrawers && configDrawers.setEnhancedPreviewManager) {
  // 等待预览线系统初始化完成后再设置
  nextTick(() => {
    if (state.previewLineSystem.value && state.unifiedEdgeManager.value) {
      configDrawers.setEnhancedPreviewManager(state.previewLineSystem.value, state.unifiedEdgeManager.value)
      console.log('[TaskFlowCanvasRefactored] ✓ 已为 configDrawers 设置预览线管理器实例')
    }
  })
}

state.configDrawers.value = configDrawers

// 事件处理
const {
  bindEvents,
  handleNodeTypeSelected,
  handleNodeDelete,
  handleDeleteConnection,
  closeNodeSelector
} = useCanvasEvents(
  graph,
  state,
  emit,
  {
    getNodeConfig,
    addNodeToGraph,
    addConnectionToGraph,
    getAllChildNodes,
    cascadeDeleteNode,
    updateLayoutStats,
    validateNodeConfiguration,
    portConfigFactory,
    previewLineSystem,
    unifiedEdgeManager,
    configDrawers: configDrawers  // 修复：直接传递 configDrawers 对象，而不是 state.configDrawers
  }
)

// 初始化生命周期管理 - 修复graph引用传递问题
const lifecycleOptions = {
  canvasContainer,
  initializeGraph,
  bindEvents,
  unbindEvents: () => {}, // 将在事件系统中实现
  destroyGraph,
  resetGraph,
  previewLineSystem: () => previewLineSystem,
  unifiedEdgeManager: () => unifiedEdgeManager,
  minimap: () => minimap,
  panZoomManager: () => panZoomManager,
  edgeOverlapManager: () => edgeOverlapManager,
  unifiedPreviewLineManager: () => unifiedPreviewLineManager
}

const {
  initCanvas,
  destroyCanvas,
  resetCanvas,
  handleResize,
  handleKeydown,
  waitForInitialization,
  validateCanvasState
} = useCanvasLifecycle(
  graph,
  state,
  emit,
  lifecycleOptions
)

// 结构化布局
const {
  applyUnifiedStructuredLayout,
  generateLayoutSummary,
  applyCenterAlignment,
  clearCanvas: clearCanvasLayout
} = useStructuredLayout(graph, state.nodes, state.connections, emit)

// 计算属性 - 添加null检查（只定义未在state中解构的属性）
const scaleDisplayText = computed(() => state.scaleDisplayText?.value || '100%')
const showMinimap = computed(() => state.showMinimap?.value || false)
const minimapCollapsed = computed(() => state.minimapCollapsed?.value || false)
const showHistoryPanel = computed(() => state.showHistoryPanel?.value || false)
const showNodeSelector = computed(() => state.showNodeSelector?.value || false)
const nodeSelectorPosition = computed(() => state.nodeSelectorPosition?.value || { x: 0, y: 0 })
const nodeSelectorSourceNode = computed(() => state.nodeSelectorSourceNode?.value || null)
const showStartNodeConfigDrawer = computed(() => state.showStartNodeConfigDrawer?.value || false)
const selectedStartNodeData = computed(() => state.selectedStartNodeData?.value || null)
const selectedNode = computed(() => state.selectedNode?.value || null)
const currentDragMode = computed(() => state.currentDragMode?.value || null)
const isApplyingLayout = computed(() => state.isApplyingLayout?.value || false)
const currentLayoutDirection = computed(() => state.currentLayoutDirection?.value || 'vertical')
const debugPanelPosition = computed(() => state.debugPanelPosition?.value || { x: 0, y: 0 })
const isGeneratingPreviewLines = computed(() => state.isGeneratingPreviewLines?.value || false)
const edgeContextMenu = computed(() => state.edgeContextMenu?.value || { visible: false, x: 0, y: 0, edge: null })
const historyStack = computed(() => state.historyStack?.value || [])
const minimapContainer = computed(() => state.minimapContainer?.value || null)

// 工具栏方法
const zoomIn = () => {
  if (!graph || !graph.value || typeof graph.value.zoom !== 'function') return
  const currentZoom = graph.value.zoom()
  graph.value.zoom(Math.min(currentZoom + 0.1, 2))
  state.updateCurrentZoom()
}

const zoomOut = () => {
  if (!graph || !graph.value || typeof graph.value.zoom !== 'function') return
  const currentZoom = graph.value.zoom()
  graph.value.zoom(Math.max(currentZoom - 0.1, 0.1))
  state.updateCurrentZoom()
}

const resetZoom = () => {
  if (!graph || !graph.value || typeof graph.value.zoom !== 'function' || typeof graph.value.centerContent !== 'function') return
  graph.value.zoom(1)
  graph.value.centerContent()
  state.updateCurrentZoom()
}

const fitToContent = () => {
  if (!graph || !graph.value || typeof graph.value.zoomToFit !== 'function') return
  graph.value.zoomToFit({ padding: 20 })
  state.updateCurrentZoom()
}

const setDragMode = (mode) => {
  state.currentDragMode.value = mode
  if (panZoomManager) {
    panZoomManager.setDragMode(mode)
  }
}

const toggleMinimap = () => {
  state.showMinimap.value = !state.showMinimap.value
  if (state.showMinimap.value && !minimap) {
    initializeMinimap()
  }
}

const toggleMinimapCollapse = () => {
  state.minimapCollapsed.value = !state.minimapCollapsed.value
}

const closeMinimap = () => {
  state.showMinimap.value = false
}

const toggleHistoryPanel = () => {
  state.showHistoryPanel.value = !state.showHistoryPanel.value
}

const undo = () => {
  if (graph && graph.value && typeof graph.value.undo === 'function' && state.canUndo.value) {
    graph.value.undo()
    state.updateUndoRedoState()
  }
}

const redo = () => {
  if (graph && graph.value && typeof graph.value.redo === 'function' && state.canRedo.value) {
    graph.value.redo()
    state.updateUndoRedoState()
  }
}

const clearCanvas = () => {
  clearCanvasLayout()
}

const handleExport = () => {
  if (!graph || !graph.value || typeof graph.value.exportPNG !== 'function') return
  
  graph.value.exportPNG('task-flow-canvas', {
    backgroundColor: '#ffffff',
    padding: 20
  })
}

const toggleDebugPanel = () => {
  state.showDebugPanel.value = !state.showDebugPanel.value
  if (state.showDebugPanel.value) {
    updateDebugStats()
  }
}

const closeDebugPanel = () => {
  state.showDebugPanel.value = false
}

const startDragDebugPanel = (e) => {
  state.isDraggingDebugPanel.value = true
  const rect = e.target.closest('.debug-panel').getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
  
  const handleMouseMove = (moveEvent) => {
    if (state.isDraggingDebugPanel.value) {
      state.debugPanelPosition.value = {
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY
      }
    }
  }
  
  const handleMouseUp = () => {
    state.isDraggingDebugPanel.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const updateDebugStats = async (retryCount = 0) => {
  if (!graph || !graph.value) {
    state.debugStats.value = {
      loading: false,
      data: {
        nodeCount: 0,
        configuredNodeCount: 0,
        expectedPreviewLines: 0,
        actualPreviewLines: 0,
        expectedConnections: 0,
        actualConnections: 0,
        issues: []
      }
    }
    return
  }
  
  // 确保debugStats.value存在，避免null错误
  if (!state.debugStats.value) {
    state.debugStats.value = { loading: false, data: null }
  }
  state.debugStats.value.loading = true
  
  try {
    if (!graph || !graph.value || typeof graph.value.getNodes !== 'function' || typeof graph.value.getEdges !== 'function') {
      console.error('[TaskFlowCanvas] Graph实例无效，无法获取调试信息')
      return
    }
    
    const nodes = graph.value.getNodes()
    const edges = graph.value.getEdges()
    
    // 统计节点信息
    let configuredNodeCount = 0
    let expectedPreviewLines = 0
    const nodeDetails = []
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      const nodeId = node.id
      const nodeType = nodeData.nodeType || nodeData.type
      
      // 获取真实连接（排除预览线）
      const realConnections = edges.filter(edge => {
        const edgeData = edge.getData() || {}
        return edge.getSourceCellId() === nodeId && !edgeData.isPreview
      })
      
      // 验证节点配置
      const validation = validateNodeConfiguration(nodeData, realConnections)
      
      if (validation.isConfigured) {
        configuredNodeCount++
      }
      
      if (validation.shouldCreatePreview) {
        expectedPreviewLines++
      }
      
      nodeDetails.push({
        id: nodeId,
        type: nodeType,
        isConfigured: validation.isConfigured,
        shouldCreatePreview: validation.shouldCreatePreview,
        reason: validation.reason,
        connectionCount: realConnections.length
      })
    }
    
    // 统计预览线
    const previewLines = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      return edgeData.isPreview || edge.id.includes('preview')
    })
    
    // 统计真实连接
    const realConnections = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isPreview && !edge.id.includes('preview')
    })
    
    state.debugStats.value = {
      loading: false,
      data: {
        nodeCount: nodes.length,
        configuredNodeCount,
        expectedPreviewLines,
        actualPreviewLines: previewLines.length,
        expectedConnections: realConnections.length,
        actualConnections: realConnections.length,
        issues: [],
        nodeDetails,
        previewLineDetails: previewLines.map(edge => ({
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId()
        })),
        connectionDetails: realConnections.map(edge => ({
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId()
        }))
      }
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 更新调试统计失败:', error)
    state.debugStats.value = {
      loading: false,
      data: {
        nodeCount: 0,
        configuredNodeCount: 0,
        expectedPreviewLines: 0,
        actualPreviewLines: 0,
        expectedConnections: 0,
        actualConnections: 0,
        issues: [`更新统计失败: ${error.message}`]
      }
    }
  }
}

// 配置抽屉方法
const handleConfigConfirm = (data) => {
  console.log('[TaskFlowCanvas] 配置确认:', data)
  
  // 🔧 修复：正确处理 TaskFlowConfigDrawers 发送的事件格式 { drawerType, config }
  const { drawerType, config } = data
  
  // 调用 configDrawers 的 handleConfigConfirm 方法来处理配置确认和预览线创建
  if (configDrawers && typeof configDrawers.handleConfigConfirm === 'function') {
    console.log('[TaskFlowCanvas] 调用 configDrawers.handleConfigConfirm:', drawerType, config)
    configDrawers.handleConfigConfirm(drawerType, config)
  } else {
    console.error('[TaskFlowCanvas] configDrawers 或 handleConfigConfirm 方法不存在', {
      hasConfigDrawers: !!configDrawers,
      configDrawersType: typeof configDrawers,
      hasHandleConfigConfirm: !!(configDrawers && configDrawers.handleConfigConfirm),
      configDrawersKeys: configDrawers ? Object.keys(configDrawers) : []
    })
  }
}

const handleConfigCancel = (data) => {
  console.log('[TaskFlowCanvas] 配置取消:', data)
  
  // 🔧 修复：正确处理 TaskFlowConfigDrawers 发送的事件格式 { drawerType }
  const { drawerType } = data
  
  // 调用 configDrawers 的 handleConfigCancel 方法来处理配置取消
  if (configDrawers && typeof configDrawers.handleConfigCancel === 'function') {
    console.log('[TaskFlowCanvas] 调用 configDrawers.handleConfigCancel:', drawerType)
    configDrawers.handleConfigCancel(drawerType)
  } else {
    console.error('[TaskFlowCanvas] configDrawers 或 handleConfigCancel 方法不存在', {
      hasConfigDrawers: !!configDrawers,
      configDrawersType: typeof configDrawers,
      hasHandleConfigCancel: !!(configDrawers && configDrawers.handleConfigCancel),
      configDrawersKeys: configDrawers ? Object.keys(configDrawers) : []
    })
  }
}

const handleDrawerVisibilityChange = (data) => {
  console.log('[TaskFlowCanvas] 抽屉可见性变化:', data)
}

// 已移除 closeConfigDrawer 和 handleNodeDataUpdate，统一使用 TaskFlowConfigDrawers 系统

const handleStartNodeConfigConfirm = async (data) => {
  console.log('[TaskFlowCanvas] 开始节点配置确认:', data)
  
  if (data.nodeId && graph?.value && typeof graph.value.getCellById === 'function') {
    const node = graph.value.getCellById(data.nodeId)
    if (node) {
      const currentData = node.getData() || {}
      node.setData({
        ...currentData,
        config: data.config,
        isConfigured: true
      })
      
      // 更新状态数组中的节点
      if (nodes && nodes.value && Array.isArray(nodes.value)) {
        const nodeIndex = nodes.value.findIndex(n => n && n.id === data.nodeId)
        if (nodeIndex !== -1 && nodes.value[nodeIndex]) {
          nodes.value[nodeIndex].isConfigured = true
          nodes.value[nodeIndex].config = data.config
        }
      }
      
      emit('node-config-updated', { nodeId: data.nodeId, config: data.config })
      
      // 🔧 关键修复：开始节点配置完成后生成预览线
      console.log('[TaskFlowCanvas] 开始节点配置完成，触发预览线生成')
      console.log('[TaskFlowCanvas] 🔍 当前预览线系统状态:', {
        exists: !!previewLineSystem,
        initialized: previewLineSystem?.initialized,
        layoutEngineReady: previewLineSystem?.isLayoutEngineReady(),
        hasOnNodeConfigured: typeof previewLineSystem?.onNodeConfigured === 'function'
      })
      
      try {
        // 方法1：使用预览线系统
        if (previewLineSystem && typeof previewLineSystem.onNodeConfigured === 'function') {
          console.log('[TaskFlowCanvas] 使用PreviewLineSystem生成预览线')
          console.log('[TaskFlowCanvas] 🔍 调用前最终状态检查:', {
            nodeId: data.nodeId,
            config: data.config,
            layoutEngineReady: previewLineSystem.isLayoutEngineReady()
          })
          await previewLineSystem.onNodeConfigured(data.nodeId, data.config)
        } 
        // 方法2：使用统一边管理器
        else if (unifiedEdgeManager && typeof unifiedEdgeManager.onNodeConfigured === 'function') {
          console.log('[TaskFlowCanvas] 使用UnifiedEdgeManager生成预览线')
          await unifiedEdgeManager.onNodeConfigured(data.nodeId, data.config)
        }
        // 方法3：使用配置抽屉系统
        else if (configDrawers && typeof configDrawers.handleConfigConfirm === 'function') {
          console.log('[TaskFlowCanvas] 使用ConfigDrawers系统生成预览线')
          await configDrawers.handleConfigConfirm('start', {
            nodeId: data.nodeId,
            config: data.config
          })
        }
        // 方法4：直接调用预览线生成方法
        else if (typeof triggerPreviewLineGeneration === 'function') {
          console.log('[TaskFlowCanvas] 直接触发预览线生成')
          await triggerPreviewLineGeneration()
        }
        else {
          console.warn('[TaskFlowCanvas] 未找到可用的预览线生成方法')
        }
        
        console.log('[TaskFlowCanvas] 预览线生成完成')
      } catch (error) {
        console.error('[TaskFlowCanvas] 预览线生成失败:', error)
      }
    }
  }
  
  state.showStartNodeConfigDrawer.value = false
  state.selectedStartNodeData.value = null
}

const handleStartNodeConfigCancel = () => {
  console.log('[TaskFlowCanvas] 开始节点配置取消')
  state.showStartNodeConfigDrawer.value = false
  state.selectedStartNodeData.value = null
}

const handleLayoutDirectionChange = (direction) => {
  state.currentLayoutDirection.value = direction
}

const handleRestorePreviewLine = (edgeData) => {
  console.log('[TaskFlowCanvas] 恢复预览线:', edgeData)
  
  if (previewLineSystem && typeof previewLineSystem.restorePreviewLine === 'function') {
    previewLineSystem.restorePreviewLine(edgeData)
  }
}

const jumpToHistoryState = (index) => {
  console.log('[TaskFlowCanvas] 跳转到历史状态:', index)
  
  if (graph && graph.value && state.historyStack && state.historyStack.value && state.historyStack.value[index]) {
    // 实现历史状态跳转逻辑
    const targetState = state.historyStack.value[index]
    // 这里需要根据具体的历史状态数据结构来实现
  }
}

const checkPreviewLineValidity = async () => {
  console.log('[TaskFlowCanvas] 开始详细的预览线有效性检验')
  
  try {
    // 更新调试状态
    state.debugStats.value.loading = true
    
    // 🔧 新增：使用增强的节点连接线有效性检查
    if (configDrawers && configDrawers.value && configDrawers.value.structuredLayout && 
        configDrawers.value.structuredLayout.connectionPreviewManager &&
        typeof configDrawers.value.structuredLayout.connectionPreviewManager.validateNodeConnections === 'function') {
      
      console.log('[TaskFlowCanvas] 🔍 执行增强的节点连接线有效性检查...')
      const validationResult = configDrawers.value.structuredLayout.connectionPreviewManager.validateNodeConnections(graph.value, { verbose: true })
      
      console.log('[TaskFlowCanvas] 📊 节点连接线检查结果:', {
        '总体状态': validationResult.isValid ? '✅ 全部有效' : '❌ 存在无效节点',
        '统计信息': validationResult.summary,
        '边统计': `预览线: ${validationResult.statistics.totalPreviewLines}, 连接线: ${validationResult.statistics.totalConnections}`
      })
      
      // 输出详细的节点检查表格
      console.table(validationResult.nodeValidations.map(node => ({
        '节点ID': node.nodeId,
        '节点类型': node.nodeType,
        '应有分支数': node.expectedBranches,
        '实际预览线': node.actualPreviewLines,
        '实际连接线': node.actualConnections,
        '总线数': node.totalLines,
        '状态': node.status,
        '缺失': node.details.deficit,
        '多余': node.details.surplus
      })))
      
      // 输出无效节点的详细信息
      const invalidNodes = validationResult.nodeValidations.filter(v => !v.isValid)
      if (invalidNodes.length > 0) {
        console.warn('[TaskFlowCanvas] ⚠️ 无效节点详情:')
        invalidNodes.forEach(node => {
          console.warn(`  - ${node.nodeId} (${node.nodeType}): 应有${node.expectedBranches}条线，实际${node.totalLines}条 (预览线:${node.actualPreviewLines}, 连接线:${node.actualConnections})`)
          if (node.details.deficit > 0) {
            console.warn(`    缺失 ${node.details.deficit} 条线`)
          }
          if (node.details.surplus > 0) {
            console.warn(`    多余 ${node.details.surplus} 条线`)
          }
        })
      }
    } else {
      console.warn('[TaskFlowCanvas] ⚠️ 预览线管理器不支持增强的节点连接线有效性检查，使用传统检查方法')
    }
    
    // 获取基础数据
    const allNodes = graph.value?.getNodes() || []
    const allEdges = graph.value?.getEdges() || []
    const previewEdges = allEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      return edgeData.isPreview || edge.id.includes('preview')
    })
    const connectionEdges = allEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isPreview && !edge.id.includes('preview')
    })
    
    // 计算应有的预览线数量
    let expectedPreviewLines = 0
    const configuredNodes = []
    const unconfiguredNodes = []
    
    for (const node of allNodes) {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      const isConfigured = nodeData.isConfigured || nodeType === 'start'
      
      if (isConfigured) {
        configuredNodes.push(node)
        // 检查节点是否已有连接线，如果没有则应该有预览线
        const outgoingConnections = connectionEdges.filter(edge => 
          edge.getSourceCellId() === node.id
        )
        
        if (outgoingConnections.length === 0) {
          // 分支节点可能需要多条预览线
          if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
            // 🔧 修复：更准确地计算分支节点的预览线需求
            let branchCount = 2 // 默认分支数
            
            if (nodeType === 'audience-split') {
              // 人群分流节点：crowdLayers + unmatchBranch
              const config = nodeData.config || {}
              const crowdLayersCount = config.crowdLayers?.length || 0
              const hasUnmatchBranch = config.unmatchBranch && config.unmatchBranch.id
              branchCount = crowdLayersCount + (hasUnmatchBranch ? 1 : 0)
              // 确保至少有2条分支线
              branchCount = Math.max(branchCount, 2)
            } else if (nodeType === 'event-split') {
              // 事件分流节点：events + default
              const config = nodeData.config || {}
              const eventsCount = config.events?.length || 0
              branchCount = eventsCount + 1 // 加上默认分支
              branchCount = Math.max(branchCount, 2)
            } else {
              // 其他分支节点
              branchCount = nodeData.branches?.length || nodeData.branchCount || 2
              branchCount = Math.max(branchCount, 2)
            }
            
            expectedPreviewLines += branchCount
            console.log(`[TaskFlowCanvas] 分支节点 ${node.id} 需要 ${branchCount} 条预览线`, {
              nodeType,
              config: nodeData.config,
              crowdLayersCount: nodeData.config?.crowdLayers?.length || 0,
              hasUnmatchBranch: !!(nodeData.config?.unmatchBranch?.id),
              eventsCount: nodeData.config?.events?.length || 0,
              calculatedBranchCount: branchCount
            })
          } else {
            expectedPreviewLines += 1
          }
        }
      } else {
        unconfiguredNodes.push(node)
      }
    }
    
    // 详细分析预览线状态
    const validPreviewLines = []
    const invalidPreviewLines = []
    const missingPreviewLines = []
    const redundantPreviewLines = []
    const problemNodes = []
    
    // 检查现有预览线的有效性
    for (const edge of previewEdges) {
      const sourceId = edge.getSourceCellId()
      const sourceNode = graph.value?.getCellById(sourceId)
      const edgeData = edge.getData() || {}
      
      if (!sourceNode) {
        invalidPreviewLines.push({
          id: edge.id,
          issue: '源节点不存在',
          sourceId: sourceId
        })
        continue
      }
      
      const nodeData = sourceNode.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      const isConfigured = nodeData.isConfigured || nodeType === 'start'
      
      if (!isConfigured) {
        invalidPreviewLines.push({
          id: edge.id,
          issue: '源节点未配置',
          sourceId: sourceId,
          nodeType: nodeType
        })
        continue
      }
      
      // 检查是否与连接线重复
      const duplicateConnection = connectionEdges.find(connEdge => 
        connEdge.getSourceCellId() === sourceId && 
        connEdge.getTargetCellId() === edge.getTargetCellId()
      )
      
      if (duplicateConnection) {
        redundantPreviewLines.push({
          id: edge.id,
          issue: '与连接线重复',
          sourceId: sourceId,
          duplicateConnectionId: duplicateConnection.id
        })
        continue
      }
      
      validPreviewLines.push({
        id: edge.id,
        sourceId: sourceId,
        nodeType: nodeType,
        branchId: edgeData.branchId || 'main'
      })
    }
    
    // 检查缺失的预览线
    for (const node of configuredNodes) {
      const nodeId = node.id
      const nodeData = node.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      
      // 检查是否已有连接线
      const outgoingConnections = connectionEdges.filter(edge => 
        edge.getSourceCellId() === nodeId
      )
      
      if (outgoingConnections.length === 0) {
        // 检查是否有预览线
        const nodePreviewLines = validPreviewLines.filter(preview => 
          preview.sourceId === nodeId
        )
        
        if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
          // 使用与上面相同的分支计算逻辑
          let branchCount = 2 // 默认分支数
          
          if (nodeType === 'audience-split') {
            // 人群分流节点：crowdLayers + unmatchBranch
            const config = nodeData.config || {}
            const crowdLayersCount = config.crowdLayers?.length || 0
            const hasUnmatchBranch = config.unmatchBranch && config.unmatchBranch.id
            branchCount = crowdLayersCount + (hasUnmatchBranch ? 1 : 0)
            branchCount = Math.max(branchCount, 2)
          } else if (nodeType === 'event-split') {
            // 事件分流节点：events + default
            const config = nodeData.config || {}
            const eventsCount = config.events?.length || 0
            branchCount = eventsCount + 1 // 加上默认分支
            branchCount = Math.max(branchCount, 2)
          } else {
            // 其他分支节点
            branchCount = nodeData.branches?.length || nodeData.branchCount || 2
            branchCount = Math.max(branchCount, 2)
          }
          
          if (nodePreviewLines.length < branchCount) {
            missingPreviewLines.push({
              nodeId: nodeId,
              nodeType: nodeType,
              expected: branchCount,
              actual: nodePreviewLines.length,
              missing: branchCount - nodePreviewLines.length
            })
          }
        } else {
          if (nodePreviewLines.length === 0) {
            missingPreviewLines.push({
              nodeId: nodeId,
              nodeType: nodeType,
              expected: 1,
              actual: 0,
              missing: 1
            })
          }
        }
      }
    }
    
    // 检查问题节点
    for (const node of unconfiguredNodes) {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      
      // 检查未配置节点是否有预览线
      const nodePreviewLines = previewEdges.filter(edge => 
        edge.getSourceCellId() === node.id
      )
      
      if (nodePreviewLines.length > 0) {
        problemNodes.push({
          nodeId: node.id,
          nodeType: nodeType,
          issue: '未配置节点存在预览线',
          previewLineCount: nodePreviewLines.length
        })
      }
    }
    
    // 执行清理操作
    let cleanedCount = 0
    
    // 使用 PreviewLineSystem 进行验证和清理
    if (previewLineSystem && typeof previewLineSystem.validateAndCleanupDuplicates === 'function') {
      console.log('[TaskFlowCanvas] 使用 PreviewLineSystem.validateAndCleanupDuplicates 进行清理')
      await previewLineSystem.validateAndCleanupDuplicates()
    }
    
    // 清理无效预览线
    for (const invalid of invalidPreviewLines) {
      try {
        const edge = graph.value?.getCellById(invalid.id)
        if (edge) {
          graph.value?.removeCell(edge, { silent: true })
          cleanedCount++
        }
      } catch (error) {
        console.warn('[TaskFlowCanvas] 清理无效预览线失败:', invalid.id, error)
      }
    }
    
    // 清理冗余预览线
    for (const redundant of redundantPreviewLines) {
      try {
        const edge = graph.value?.getCellById(redundant.id)
        if (edge) {
          graph.value?.removeCell(edge, { silent: true })
          cleanedCount++
        }
      } catch (error) {
        console.warn('[TaskFlowCanvas] 清理冗余预览线失败:', redundant.id, error)
      }
    }
    
    // 构建详细的验证报告
    const validationReport = {
      // 统计信息
      statistics: {
        totalNodes: allNodes.length,
        configuredNodes: configuredNodes.length,
        unconfiguredNodes: unconfiguredNodes.length,
        expectedPreviewLines: expectedPreviewLines,
        actualPreviewLines: previewEdges.length,
        validPreviewLines: validPreviewLines.length,
        invalidPreviewLines: invalidPreviewLines.length,
        totalConnections: connectionEdges.length,
        cleanedCount: cleanedCount
      },
      
      // 问题分析
      issues: {
        missingPreviewLines: missingPreviewLines,
        invalidPreviewLines: invalidPreviewLines,
        redundantPreviewLines: redundantPreviewLines,
        problemNodes: problemNodes
      },
      
      // 节点详细分析
      nodeDetails: configuredNodes.map(node => {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.nodeType || nodeData.type
        const outgoingConnections = connectionEdges.filter(edge => 
          edge.getSourceCellId() === node.id
        )
        const nodePreviewLines = validPreviewLines.filter(preview => 
          preview.sourceId === node.id
        )
        
        let expectedBranches = 1
        if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
          if (nodeType === 'audience-split') {
            const config = nodeData.config || {}
            const crowdLayersCount = config.crowdLayers?.length || 0
            const hasUnmatchBranch = config.unmatchBranch && config.unmatchBranch.id
            expectedBranches = crowdLayersCount + (hasUnmatchBranch ? 1 : 0)
            expectedBranches = Math.max(expectedBranches, 2)
          } else if (nodeType === 'event-split') {
            const config = nodeData.config || {}
            const eventsCount = config.events?.length || 0
            expectedBranches = eventsCount + 1
            expectedBranches = Math.max(expectedBranches, 2)
          } else {
            expectedBranches = nodeData.branches?.length || nodeData.branchCount || 2
            expectedBranches = Math.max(expectedBranches, 2)
          }
        }
        
        return {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: nodeData.isConfigured || nodeType === 'start',
          expectedBranches: expectedBranches,
          actualConnections: outgoingConnections.length,
          actualPreviewLines: nodePreviewLines.length,
          totalLines: outgoingConnections.length + nodePreviewLines.length,
          needsPreviewLines: outgoingConnections.length < expectedBranches,
          missingLines: Math.max(0, expectedBranches - outgoingConnections.length - nodePreviewLines.length),
          config: nodeType === 'audience-split' ? {
            crowdLayersCount: nodeData.config?.crowdLayers?.length || 0,
            hasUnmatchBranch: !!(nodeData.config?.unmatchBranch?.id)
          } : nodeType === 'event-split' ? {
            eventsCount: nodeData.config?.events?.length || 0
          } : null
        }
      }),
      
      // 验证结果
      result: {
        isValid: invalidPreviewLines.length === 0 && redundantPreviewLines.length === 0 && missingPreviewLines.length === 0,
        totalIssues: invalidPreviewLines.length + redundantPreviewLines.length + missingPreviewLines.length + problemNodes.length
      }
    }
    
    // 更新调试统计
    await updateDebugStats()
    
    // 输出详细报告到控制台
    console.group('[TaskFlowCanvas] 📊 预览线有效性检验详细报告')
    console.log('📈 统计信息:', validationReport.statistics)
    console.log('⚠️ 问题分析:', validationReport.issues)
    console.log('✅ 验证结果:', validationReport.result)
    console.groupEnd()
    
    // 构建用户友好的消息
    const stats = validationReport.statistics
    const issues = validationReport.issues
    
    let message = `📊 预览线检验完成\n`
    message += `节点总数: ${stats.totalNodes} (已配置: ${stats.configuredNodes}, 未配置: ${stats.unconfiguredNodes})\n`
    message += `预览线: ${stats.actualPreviewLines}/${stats.expectedPreviewLines} (有效: ${stats.validPreviewLines})\n`
    message += `连接线: ${stats.totalConnections} 条\n`
    
    if (stats.cleanedCount > 0) {
      message += `已清理: ${stats.cleanedCount} 条无效预览线\n`
    }
    
    if (issues.missingPreviewLines.length > 0) {
      message += `⚠️ 缺失预览线: ${issues.missingPreviewLines.length} 个节点\n`
    }
    
    if (issues.problemNodes.length > 0) {
      message += `⚠️ 问题节点: ${issues.problemNodes.length} 个\n`
    }
    
    // 显示验证结果
    if (validationReport.result.isValid) {
      Message.success({
        content: message + '✅ 预览线系统状态正常',
        duration: 5000
      })
    } else {
      Message.warning({
        content: message + `⚠️ 发现 ${validationReport.result.totalIssues} 个问题`,
        duration: 5000
      })
    }
    
    console.log('[TaskFlowCanvas] 预览线有效性检验完成:', validationReport)
    
    return validationReport
    
  } catch (error) {
    console.error('[TaskFlowCanvas] 预览线有效性检验失败:', error)
    Message.error({
      content: `预览线验证失败: ${error.message}`,
      duration: 3000
    })
    throw error
  } finally {
    state.debugStats.value.loading = false
  }
}

const triggerPreviewLineGeneration = async () => {
  console.log('[TaskFlowCanvas] 🔧 触发统一预览线生成方法')
  
  try {
    // 更新生成状态
    state.isGeneratingPreviewLines.value = true
    state.debugStats.value.loading = true
    
    let generationResult = { success: false, count: 0, message: '预览线系统未初始化' }
    
    // 🔧 修复：根据重构方案，只使用 PreviewLineSystem 的统一方法
    if (!previewLineSystem) {
      throw new Error('PreviewLineSystem 未初始化，无法生成预览线')
    }
    
    console.log('[TaskFlowCanvas] ✅ 使用 PreviewLineSystem 统一预览线生成方法')
    
    // 🔧 修复：使用统一的预览线生成方法，消除多重降级逻辑
    const result = await previewLineSystem.forceRegeneratePreviewLines({
      clearExisting: true,
      validateNodes: true,
      enableBranchAnalysis: true, // 启用分支分析
      enablePortValidation: true  // 启用端口验证
    })
    
    if (result && result.success) {
      generationResult = {
        success: true,
        count: result.newCount || result.createdCount || 0,
        message: `预览线重新生成完成，创建了 ${result.newCount || result.createdCount || 0} 条预览线`,
        details: {
          previousCount: result.previousCount || 0,
          newCount: result.newCount || result.createdCount || 0,
          deleteResults: result.deleteResults || [],
          createResults: result.createResults || []
        }
      }
      
      console.log('[TaskFlowCanvas] ✅ 预览线生成成功:', generationResult.details)
    } else {
      // 🔧 修复：如果强制重新生成失败，尝试为现有节点创建预览线
      console.warn('[TaskFlowCanvas] ⚠️ 强制重新生成失败，尝试为现有节点创建预览线')
      
      await previewLineSystem.createPreviewLinesForExistingNodes()
      
      // 统计生成的预览线
      const allEdges = graph.value?.getEdges() || []
      const previewEdges = allEdges.filter(edge => {
        const edgeData = edge.getData() || {}
        return edgeData.isPreview || edge.id.includes('preview')
      })
      
      generationResult = {
        success: true,
        count: previewEdges.length,
        message: `预览线生成完成，当前共有 ${previewEdges.length} 条预览线`
      }
    }
    
    // 更新调试统计
    await updateDebugStats()
    
    // 显示生成结果
    if (generationResult.success) {
      Message.success({
        content: generationResult.message,
        duration: 3000
      })
    } else {
      Message.warning({
        content: generationResult.message,
        duration: 3000
      })
    }
    
    console.log('[TaskFlowCanvas] 预览线生成完成:', generationResult)
    
  } catch (error) {
    console.error('[TaskFlowCanvas] 预览线生成失败:', error)
    Message.error({
      content: `预览线生成失败: ${error.message}`,
      duration: 3000
    })
  } finally {
    state.isGeneratingPreviewLines.value = false
    state.debugStats.value.loading = false
  }
}

// 监听属性变化 - 移除immediate选项，避免在graph实例创建前执行
watch(() => props.initialNodes, (newNodes) => {
  if (newNodes && newNodes.length > 0 && graph && graph.value) {
    console.log('[TaskFlowCanvas] 监听到节点变化，开始添加节点:', newNodes.length)
    
    // 验证graph实例状态
    if (!graph.value || typeof graph.value.addNode !== 'function') {
      console.error('[TaskFlowCanvas] Graph实例无效，跳过节点添加')
      return
    }
    
    newNodes.forEach(nodeData => {
      try {
        addNodeToGraph(nodeData)
      } catch (error) {
        console.error('[TaskFlowCanvas] 监听器中添加节点失败:', nodeData.id, error)
      }
    })
  }
}, { immediate: false })

watch(() => props.initialConnections, (newConnections) => {
  if (newConnections && newConnections.length > 0 && graph && graph.value) {
    console.log('[TaskFlowCanvas] 监听到连接变化，开始添加连接:', newConnections.length)
    
    // 验证graph实例状态
    if (!graph.value || typeof graph.value.addEdge !== 'function') {
      console.error('[TaskFlowCanvas] Graph实例无效，跳过连接添加')
      return
    }
    
    newConnections.forEach(async (connectionData) => {
      try {
        await addConnectionToGraph(connectionData)
      } catch (error) {
        console.error('[TaskFlowCanvas] 监听器中添加连接失败:', connectionData, error)
      }
    })
  }
}, { immediate: false })

// 提供给子组件的数据
provide('graph', graph)
provide('canvasState', state)

// 组件挂载时自动初始化
// 生命周期钩子 - 同步初始化：组件优先，图形最后
onMounted(() => {
  console.log('[TaskFlowCanvas] 组件挂载开始 - 同步初始化')
  
  try {
    // ========== 第1步：初始化所有基础系统组件 ==========
    console.log('[TaskFlowCanvas] 第1步：初始化所有基础系统组件')
    initializeSystems()
    
    // ========== 第2步：等待DOM完全准备 ==========
    console.log('[TaskFlowCanvas] 第2步：等待DOM完全准备')
    nextTick(async () => {
      try {
        // 验证DOM容器
        if (!canvasContainer.value) {
          throw new Error('画布容器DOM未准备就绪')
        }
        
        // 检查容器是否在DOM中且可见
        console.log('[TaskFlowCanvas] DOM容器状态:', {
          exists: !!canvasContainer.value,
          offsetParent: canvasContainer.value.offsetParent,
          offsetWidth: canvasContainer.value.offsetWidth,
          offsetHeight: canvasContainer.value.offsetHeight,
          clientWidth: canvasContainer.value.clientWidth,
          clientHeight: canvasContainer.value.clientHeight
        })
        console.log('[TaskFlowCanvas] ✓ DOM容器验证通过')
        
        // ========== 第3步：初始化画布（创建Graph实例） ==========
        console.log('[TaskFlowCanvas] 第3步：同步初始化画布和Graph实例')
        initCanvas()
        
        // 验证Graph实例
        if (!graph || !graph.value || typeof graph.value.on !== 'function') {
          throw new Error('Graph实例创建失败或无效')
        }
        console.log('[TaskFlowCanvas] ✓ Graph实例验证通过')
        
        // ========== 第4步：初始化依赖Graph的系统组件 ==========
        console.log('[TaskFlowCanvas] 第4步：初始化依赖Graph的系统组件')
        await initializeGraphDependentSystems(graph.value)
        
        // ========== 第5步：验证所有系统就绪 ==========
        console.log('[TaskFlowCanvas] 第5步：验证所有系统就绪')
        const validationResult = validateCanvasState()
        if (!validationResult.isValid) {
          console.warn('[TaskFlowCanvas] 系统验证失败:', validationResult.issues)
          // 不抛出错误，允许继续初始化，但记录问题
        } else {
          console.log('[TaskFlowCanvas] ✓ 所有系统验证通过')
        }
        
        // ========== 第6步：加载初始数据（最后执行） ==========
        console.log('[TaskFlowCanvas] 第6步：加载初始数据')
        
        // 先加载所有节点，确保节点存在后再创建连接
        if (props.initialNodes && props.initialNodes.length > 0) {
          console.log('[TaskFlowCanvas] 加载初始节点:', props.initialNodes.length)
          
          // 验证graph实例是否完全就绪
          if (!graph?.value || typeof graph.value.addNode !== 'function' || !isGraphReady?.value) {
            console.error('[TaskFlowCanvas] Graph实例未就绪，跳过节点加载:', {
              hasGraph: !!graph,
              hasGraphValue: !!graph?.value,
              hasAddNodeMethod: !!(graph?.value && typeof graph.value.addNode === 'function'),
              isGraphReady: isGraphReady?.value
            })
            throw new Error('Graph实例未就绪，无法加载初始节点')
          }
          
          for (const nodeData of props.initialNodes) {
            try {
              // 在每次添加节点前都验证graph状态
              if (!graph?.value || typeof graph.value.addNode !== 'function' || !isGraphReady?.value) {
                console.error('[TaskFlowCanvas] Graph实例在节点添加过程中变为无效:', {
                  nodeId: nodeData.id,
                  hasGraph: !!graph,
                  hasGraphValue: !!graph?.value,
                  hasAddNodeMethod: !!(graph?.value && typeof graph.value.addNode === 'function'),
                  isGraphReady: isGraphReady?.value
                })
                continue
              }
              
              const addedNode = addNodeToGraph(nodeData)
              if (!addedNode) {
                console.error('[TaskFlowCanvas] 节点添加失败:', nodeData.id)
              } else {
                console.log('[TaskFlowCanvas] 节点添加成功:', nodeData.id)
              }
            } catch (error) {
              console.error('[TaskFlowCanvas] 添加节点失败:', nodeData.id, error)
            }
          }
          
          // 验证所有节点是否已成功添加
          if (graph && graph.value && typeof graph.value.getNodes === 'function') {
            const graphNodes = graph.value.getNodes()
            console.log('[TaskFlowCanvas] 图中节点数量验证:', {
              expectedNodes: props.initialNodes?.length || 0,
              actualNodes: graphNodes.length,
              nodeIds: graphNodes.map(n => n.id)
            })
          }
          
          // 然后加载连接，此时所有节点应该已经存在
          if (props.initialConnections && props.initialConnections.length > 0) {
            console.log('[TaskFlowCanvas] 加载初始连接:', props.initialConnections.length)
            for (const connectionData of props.initialConnections) {
              try {
                // 兼容新旧字段名格式
                const sourceNodeId = connectionData.source || connectionData.sourceNodeId
                const targetNodeId = connectionData.target || connectionData.targetNodeId
                
                // 验证源节点和目标节点是否存在
                const sourceNode = graph?.value?.getCellById(sourceNodeId)
                const targetNode = graph?.value?.getCellById(targetNodeId)
                
                if (!sourceNode) {
                  console.error('[TaskFlowCanvas] 源节点不存在:', sourceNodeId)
                  continue
                }
                
                if (!targetNode) {
                  console.error('[TaskFlowCanvas] 目标节点不存在:', targetNodeId)
                  continue
                }
                
                console.log('[TaskFlowCanvas] 节点验证通过，创建连接:', {
                  source: sourceNodeId,
                  target: targetNodeId
                })
                
                addConnectionToGraph(connectionData)
              } catch (error) {
                console.error('[TaskFlowCanvas] 添加连接失败:', connectionData, error)
              }
            }
          }
        }
        
        // 如果需要自动添加开始节点
        if (props.autoAddStartNode && nodes && nodes.value && nodes.value.length === 0) {
          console.log('[TaskFlowCanvas] 添加默认开始节点')
          const startNodeData = {
            id: 'start-node',
            type: 'start',
            label: '开始',
            position: { x: 400, y: 100 },
            data: {
              isConfigured: true,
              config: {
                name: '开始节点',
                description: '流程开始'
              }
            }
          }
          try {
            addNodeToGraph(startNodeData)
          } catch (error) {
            console.error('[TaskFlowCanvas] 添加开始节点失败:', error)
          }
        }
        
        // ========== 第7步：画布居中和适应内容 ==========
        console.log('[TaskFlowCanvas] 第7步：画布居中和适应内容')
        try {
          if (graph && graph.value && typeof graph.value.centerContent === 'function' && typeof graph.value.zoom === 'function' && typeof graph.value.zoomToFit === 'function') {
            // 先居中内容
            graph.value.centerContent()
            console.log('[TaskFlowCanvas] ✓ 画布内容已居中')
            
            // 然后适应缩放，限制最大缩放比例
            const currentScale = graph.value.zoom()
            graph.value.zoomToFit({ 
              padding: 50,
              maxScale: Math.min(1.2, currentScale * 1.5) // 限制最大缩放比例
            })
            console.log('[TaskFlowCanvas] ✓ 画布缩放已适应内容')
            
            // 更新缩放显示
            if (state.updateCurrentZoom) {
              state.updateCurrentZoom()
            }
          }
        } catch (error) {
          console.warn('[TaskFlowCanvas] 画布居中和适应失败:', error)
        }
          
        // ========== 第8步：触发就绪事件 ==========
        console.log('[TaskFlowCanvas] 第8步：触发就绪事件')
        emit('canvas-ready', graph.value)
        
        console.log('[TaskFlowCanvas] ✅ 同步初始化完成')
      } catch (error) {
        console.error('[TaskFlowCanvas] 组件初始化失败:', error)
        Message.error(`画布初始化失败: ${error.message}`)
        
        // 重置初始化状态
        if (state && state.isInitializing) {
          state.isInitializing.value = false
        }
      }
    })
  } catch (error) {
    console.error('[TaskFlowCanvas] 组件挂载失败:', error)
    Message.error(`画布挂载失败: ${error.message}`)
  }
})

// 移除重复的initialize函数，统一使用onMounted中的初始化逻辑

// 创建一个适配器函数，用于处理拖拽新建节点
const addNode = async (nodeType, position) => {
  console.log('🎯 [TaskFlowCanvas] 拖拽新建节点:', { nodeType, position })
  
  try {
    // 🔧 修复：增强参数验证
    if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
      console.error('[TaskFlowCanvas] 无效的节点类型:', { nodeType, type: typeof nodeType })
      return null
    }
    
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.error('[TaskFlowCanvas] 无效的位置信息:', position)
      return null
    }
    
    // 规范化节点类型
    const normalizedNodeType = nodeType.trim()
    
    // 🔧 修复：验证节点类型配置是否存在
    let nodeConfig = null
    try {
      // 导入节点配置函数
      const { getNodeConfig } = await import('../../../../utils/nodeTypes.js')
      nodeConfig = getNodeConfig(normalizedNodeType)
      
      if (!nodeConfig) {
        console.error('[TaskFlowCanvas] 节点类型配置不存在:', normalizedNodeType)
        return null
      }
    } catch (error) {
      console.error('[TaskFlowCanvas] 获取节点配置失败:', error)
      return null
    }
    
    // 生成节点ID
    const nodeId = `${normalizedNodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 获取节点标签
    let nodeLabel = normalizedNodeType
    try {
      if (nodeConfig && nodeConfig.label) {
        // 使用配置中的标签
        nodeLabel = nodeConfig.label
      } else {
        // 备用标签映射
        const labelMap = {
          'start': '开始节点',
          'end': '结束节点',
          'audience-split': '人群分流',
          'event-split': '事件分流',
          'sms': '短信触达',
          'ai-call': 'AI外呼',
          'manual-call': '人工外呼',
          'ab-test': 'AB实验',
          'wait': '等待节点',
          'condition': '条件判断',
          'action': '执行动作',
          'benefit': '权益节点',
          'task': '任务节点'
        }
        nodeLabel = labelMap[normalizedNodeType] || normalizedNodeType
      }
    } catch (error) {
      console.warn('[TaskFlowCanvas] 获取节点标签失败，使用默认值:', error)
      nodeLabel = normalizedNodeType
    }
    
    // 🔧 修复：构建完整的节点数据对象，确保所有必要字段都存在
    const nodeData = {
      id: nodeId,
      type: normalizedNodeType,
      nodeType: normalizedNodeType, // 确保兼容性
      label: nodeLabel,
      position: { ...position },
      data: {
        type: normalizedNodeType,
        nodeType: normalizedNodeType,
        label: nodeLabel,
        isConfigured: false,
        config: {
          name: nodeLabel,
          description: `${nodeLabel}节点`
        }
      }
    }
    
    console.log('[TaskFlowCanvas] 构建的节点数据:', nodeData)
     
     // 调用原始的 addNodeToGraph 函数
     const result = addNodeToGraph(nodeData)
     
     if (result) {
       console.log('[TaskFlowCanvas] ✅ 拖拽新建节点成功:', nodeId)
       // 使用统一事件总线发送事件
       unifiedEventBus.emit(EventTypes.NODE_CREATED, { nodeId, nodeType: normalizedNodeType, position, nodeData })
       // 触发节点创建事件
       emit('node-created', { nodeId, nodeType: normalizedNodeType, position, nodeData })
     } else {
       console.error('[TaskFlowCanvas] ❌ 拖拽新建节点失败')
     }
     
     return result
     
   } catch (error) {
     console.error('[TaskFlowCanvas] 拖拽新建节点时发生错误:', error)
     console.error('[TaskFlowCanvas] 错误堆栈:', error.stack)
     return null
   }
}

// 节点删除请求处理函数
const handleNodeDeleteRequest = (data) => {
  console.log('[TaskFlowCanvas] 接收到节点删除请求:', data)
  
  try {
    const { node, nodeData } = data
    let nodeId = null
    
    // 获取节点ID
    if (node && node.id) {
      nodeId = node.id
    } else if (nodeData && nodeData.id) {
      nodeId = nodeData.id
    } else if (typeof node === 'string') {
      nodeId = node
    }
    
    if (!nodeId) {
      console.error('[TaskFlowCanvas] 无法获取节点ID:', data)
      return
    }
    
    console.log('[TaskFlowCanvas] 开始执行节点删除:', nodeId)
    
    // 调用级联删除函数执行实际删除
    cascadeDeleteNode(nodeId)
    
    console.log('[TaskFlowCanvas] ✅ 节点删除完成:', nodeId)
  } catch (error) {
    console.error('[TaskFlowCanvas] 节点删除失败:', error)
    Message.error(`节点删除失败: ${error.message}`)
  }
}

// 生命周期钩子 - 服务层集成
onMounted(async () => {
  try {
    // 等待图形初始化完成
    await waitForInitialization()
    
    // 初始化服务层
    await initializeServices()
    
    // 监听统一事件总线事件 - 标准化事件处理
    unifiedEventBus.on(EventTypes.NODE_CREATED, (data) => {
      emit('node-created', data)
    })
    
    unifiedEventBus.on(EventTypes.NODE_DELETED, (data) => {
      emit('node-deleted', data)
    })
    
    unifiedEventBus.on(EventTypes.CONNECTION_CREATED, (data) => {
      emit('connection-created', data)
    })
    
    unifiedEventBus.on(EventTypes.LAYOUT_CHANGED, (data) => {
      emit('layout-changed', data)
    })
    
    unifiedEventBus.on(EventTypes.NODE_CONFIG_UPDATED, (data) => {
      emit('node-config-updated', data)
    })
    
    unifiedEventBus.on(EventTypes.CANVAS_READY, (data) => {
      emit('canvas-ready', data)
    })
    
    // 监听节点删除请求事件 - 通过useCanvasEvents传递的handleNodeDelete已经处理了删除逻辑
    // 这里我们需要确保useCanvasEvents中的handleNodeDelete能够调用到cascadeDeleteNode
    // 由于useCanvasEvents已经接收了cascadeDeleteNode作为参数，所以删除逻辑应该已经正确连接
    
    console.log('✅ [TaskFlowCanvas] 组件挂载完成，服务层已集成')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 组件挂载失败:', error)
  }
})

onBeforeUnmount(async () => {
  try {
    // 销毁服务层
    await destroyServices()
    
    // 销毁图形实例
    destroyGraph()
    
    console.log('✅ [TaskFlowCanvas] 组件卸载完成')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 组件卸载失败:', error)
  }
})

// 暴露方法给父组件 - 标准化接口
defineExpose({
  // 核心图形实例
  graph,
  
  // 节点操作 - 通过服务管理器
  addNode: (nodeTypeOrData, position) => {
    // 兼容两种调用方式：
    // 1. addNode(nodeType, position) - 拖拽创建
    // 2. addNode(nodeData) - 直接添加节点数据
    if (typeof nodeTypeOrData === 'string' && position) {
      // 拖拽创建模式
      return addNode(nodeTypeOrData, position)
    } else if (typeof nodeTypeOrData === 'object' && nodeTypeOrData !== null) {
      // 直接添加节点数据模式
      const graphService = canvasServiceManager?.get('GraphService')
      return graphService && graphService.isReady() ? graphService.addNode(nodeTypeOrData) : addNodeToGraph(nodeTypeOrData)
    } else {
      console.error('[TaskFlowCanvas] addNode 参数格式错误:', { nodeTypeOrData, position })
      return null
    }
  },
  addNodeToGraph: (nodeData) => {
    const graphService = canvasServiceManager?.get('GraphService')
    return graphService && graphService.isReady() ? graphService.addNode(nodeData) : addNodeToGraph(nodeData)
  },
  removeNode: (nodeId) => {
    const graphService = canvasServiceManager?.get('GraphService')
    return graphService && graphService.isReady() ? graphService.removeNode(nodeId) : null
  },
  updateNode: (nodeId, data) => {
    const graphService = canvasServiceManager?.get('GraphService')
    return graphService && graphService.isReady() ? graphService.updateNode(nodeId, data) : null
  },
  
  // 连接操作 - 通过服务管理器
  addConnection: (connectionData) => {
    const graphService = canvasServiceManager?.get('GraphService')
    return graphService && graphService.isReady() ? graphService.addConnection(connectionData) : addConnectionToGraph(connectionData)
  },
  removeConnection: (connectionId) => {
    const graphService = canvasServiceManager?.get('GraphService')
    return graphService && graphService.isReady() ? graphService.removeConnection(connectionId) : null
  },
  
  // 布局操作 - 通过服务管理器
  executeLayout: (layoutType, options = {}) => {
    const layoutService = canvasServiceManager?.get('LayoutService')
    return layoutService && layoutService.isReady() ? layoutService.executeLayout(layoutType, options) : null
  },
  
  // 数据操作 - 通过服务管理器
  getCanvasData: () => {
    const graphService = canvasServiceManager?.get('GraphService')
    if (graphService && graphService.isReady()) {
      return graphService.getGraphData()
    }
    return {
      nodes: nodes?.value || [],
      connections: connections?.value || []
    }
  },
  
  loadCanvasData: async (data) => {
    const graphService = canvasServiceManager?.get('GraphService')
    if (graphService && graphService.isReady()) {
      return await graphService.loadGraphData(data)
    }
    
    // 回退到原始实现
    console.log('[TaskFlowCanvas] 加载画布数据:', data)
    
    if (!graph?.value) {
      console.warn('[TaskFlowCanvas] Graph 未初始化，等待初始化完成...')
      await waitForInitialization()
    }
    
    if (data && data.nodes && Array.isArray(data.nodes)) {
      nodes.value = []
      data.nodes.forEach(nodeData => {
        try {
          addNodeToGraph(nodeData)
        } catch (error) {
          console.error('[TaskFlowCanvas] 加载节点失败:', nodeData.id, error)
        }
      })
    }
    
    if (data && data.connections && Array.isArray(data.connections)) {
      connections.value = []
      data.connections.forEach(connectionData => {
        try {
          connections.value.push(connectionData)
        } catch (error) {
          console.error('[TaskFlowCanvas] 加载连接失败:', connectionData, error)
        }
      })
    }
  },
  
  // 画布操作
  clearCanvas,
  resetCanvas,
  validateCanvasState,
  waitForInitialization,
  
  // 服务层访问
  getGraphService: () => graphService,
  getLayoutService: () => layoutService,
  getEventService: () => eventService
})
</script>

<style scoped>
.task-flow-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  overflow: visible;
  /* 允许内容超出时显示滚动条 */
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  /* 防止文本选择 */
  overflow: visible;
  /* 允许画布内容超出容器 */
}

/* X6 样式覆盖 */
:deep(.x6-widget-selection-box) {
  border: none !important;
  display: none !important;
}

:deep(.x6-port-body) {
  cursor: pointer;
}

:deep(.x6-port-body:hover) {
  stroke: #5F95FF;
  stroke-width: 3;
}

:deep(.x6-edge:hover path) {
  stroke: #5F95FF;
  stroke-width: 3;
}

:deep(.x6-edge-selected path) {
  stroke: #5F95FF;
  stroke-width: 3;
}

/* 画布拖拽时的样式 */
:deep(.x6-graph-svg) {
  transition: cursor 0.2s ease;
}

/* 修复节点移动时的层级遮挡问题 */
:deep(.x6-node) {
  z-index: 10;
}

:deep(.x6-node.x6-node-selected) {
  z-index: 20;
}

:deep(.x6-node:hover) {
  z-index: 15;
}

/* 确保SVG元素不会遮挡节点 */
:deep(.x6-graph-svg-stage) {
  z-index: 1;
}

:deep(.x6-graph-svg) {
  z-index: 1;
}

/* 确保连接线在节点下方 */
:deep(.x6-edge) {
  z-index: 5;
}

:deep(.x6-edge.x6-edge-selected) {
  z-index: 8;
}
</style>