<template>
  <div class="task-flow-canvas">
    <!-- X6 画布容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 小地图容器 -->
    <div 
      v-show="showMinimap" 
      ref="minimapContainer" 
      class="minimap-container"
      :class="{ 'minimap-collapsed': minimapCollapsed }"
    >
      <div class="minimap-header">
        <span class="minimap-title">预览图</span>
        <div class="minimap-controls">
          <a-button 
            size="mini" 
            type="text" 
            @click="toggleMinimapCollapse"
            :title="minimapCollapsed ? '展开预览图' : '收起预览图'"
          >
            <template #icon>
              <icon-up v-if="!minimapCollapsed" />
              <icon-down v-else />
            </template>
          </a-button>
          <a-button 
            size="mini" 
            type="text" 
            @click="closeMinimap"
            title="关闭预览图"
          >
            <template #icon><icon-close /></template>
          </a-button>
        </div>
      </div>
      <div v-show="!minimapCollapsed" class="minimap-content" ref="minimapContent"></div>
    </div>

    <!-- 历史面板 -->
    <div 
      v-show="showHistoryPanel" 
      class="history-panel"
    >
      <div class="history-header">
        <span class="history-title">操作历史</span>
        <a-button 
          size="mini" 
          type="text" 
          @click="toggleHistoryPanel"
          title="关闭历史面板"
        >
          <template #icon><icon-close /></template>
        </a-button>
      </div>
      <div class="history-content">
        <div class="history-stats">
          <span class="history-stat">
            可撤销: {{ historyStack.undoStack.length }}
          </span>
          <span class="history-stat">
            可重做: {{ historyStack.redoStack.length }}
          </span>
        </div>
        <div class="history-list">
          <div 
            v-for="(item, index) in historyStack.undoStack.slice().reverse()" 
            :key="`undo-${index}`"
            class="history-item"
            :class="{ 'history-item-current': index === 0 }"
            @click="jumpToHistoryState(historyStack.undoStack.length - 1 - index)"
          >
            <div class="history-item-icon">
              <IconCheck v-if="index === 0" />
              <IconHistory v-else />
            </div>
            <div class="history-item-content">
              <div class="history-item-title">{{ getOperationDescription(item) }}</div>
              <div class="history-item-time">{{ formatTime(item.timestamp) }}</div>
            </div>
          </div>
          <div v-if="historyStack.redoStack.length > 0" class="history-divider">
            <span>可重做操作</span>
          </div>
          <div 
            v-for="(item, index) in historyStack.redoStack" 
            :key="`redo-${index}`"
            class="history-item history-item-redo"
            @click="jumpToHistoryState(historyStack.undoStack.length + index + 1)"
          >
            <div class="history-item-icon">
              <icon-redo />
            </div>
            <div class="history-item-content">
              <div class="history-item-title">{{ getOperationDescription(item) }}</div>
              <div class="history-item-time">{{ formatTime(item.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点类型选择器 -->
    <NodeTypeSelector v-if="showNodeSelector" :visible="showNodeSelector" :position="nodeSelectorPosition"
      :source-node="nodeSelectorSourceNode" @select="handleNodeTypeSelected" @close="closeNodeSelector" />

    <!-- 开始节点配置抽屉 -->
    <StartNodeConfigDrawer v-if="showStartNodeConfigDrawer" :visible="showStartNodeConfigDrawer"
      :node-data="selectedStartNodeData" @update:visible="showStartNodeConfigDrawer = $event"
      @confirm="handleStartNodeConfigConfirm" @cancel="handleStartNodeConfigCancel" />

    <!-- 节点配置抽屉 -->
    <NodeConfigDrawer v-if="showConfigDrawer" :visible="showConfigDrawer" :node="selectedNode"
      @close="closeConfigDrawer" @update="handleNodeDataUpdate" />

    <!-- 统一配置抽屉组件 -->
    <TaskFlowConfigDrawers v-if="configDrawers" :drawer-states="configDrawers?.drawerStates"
      @config-confirm="handleConfigConfirm" @config-cancel="handleConfigCancel"
      @visibility-change="handleDrawerVisibilityChange" />

    <!-- 工具栏 -->
    <div v-if="!readonly" class="canvas-toolbar">
      <!-- 缩放控制工具栏 -->
      <a-button-group>
        <a-button @click="zoomIn" size="small" title="放大 (Ctrl++)">
          <template #icon><icon-plus /></template>
        </a-button>
        <a-button @click="zoomOut" size="small" title="缩小 (Ctrl+-)">
          <template #icon><icon-minus /></template>
        </a-button>
        <a-button @click="resetZoom" size="small" title="重置缩放 (Ctrl+0)">
          <template #icon><icon-refresh /></template>
          {{ scaleDisplayText }}
        </a-button>
        <a-button @click="fitToContent" size="small" title="适应内容 (Ctrl+F)">
          <template #icon><icon-fullscreen /></template>
        </a-button>
      </a-button-group>

      <!-- 拖拽模式控制工具栏 -->
      <a-button-group style="margin-left: 8px;">
        <a-button @click="setDragMode('default')" size="small"
          :type="currentDragMode === 'default' ? 'primary' : 'secondary'" title="默认拖拽模式 (1)">
          <template #icon><icon-drag-dot /></template>
          默认
        </a-button>
        <a-button @click="setDragMode('precise')" size="small"
          :type="currentDragMode === 'precise' ? 'primary' : 'secondary'" title="精确拖拽模式 (2)">
          <template #icon><icon-location /></template>
          精确
        </a-button>
        <a-button @click="setDragMode('fast')" size="small" :type="currentDragMode === 'fast' ? 'primary' : 'secondary'"
          title="快速拖拽模式 (3)">
          <template #icon><icon-thunderbolt /></template>
          快速
        </a-button>
      </a-button-group>

      <a-button-group style="margin-left: 8px;">
        <!-- 🎯 统一结构化布局按钮 -->
        <a-button @click="applyUnifiedStructuredLayout" size="small" type="primary" :loading="isApplyingLayout">
          <template #icon><icon-sort /></template>
          统一布局
        </a-button>
        
        <!-- 布局方向切换按钮 -->
        <a-dropdown @select="handleLayoutDirectionChange">
          <a-button size="small" :type="currentLayoutDirection === 'TB' ? 'primary' : 'secondary'">
            <template #icon><icon-swap /></template>
            {{ currentLayoutDirection === 'TB' ? '从上到下' : '从左到右' }}
          </a-button>
          <template #content>
            <a-doption value="TB" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'TB' }">
              <icon-down style="margin-right: 8px;" />
              从上到下
            </a-doption>
            <a-doption value="LR" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'LR' }">
              <icon-right style="margin-right: 8px;" />
              从左到右
            </a-doption>
          </template>
        </a-dropdown>
        
        <!-- 小地图控制按钮 -->
        <a-button @click="toggleMinimap" size="small" :type="showMinimap ? 'primary' : 'secondary'">
          <template #icon><icon-eye /></template>
          预览图
        </a-button>
        
        <a-button @click="clearCanvas" size="small" status="danger">
          <template #icon><icon-delete /></template>
          清空画布
        </a-button>
        
        <!-- 撤销重做按钮 -->
        <a-button @click="undo" size="small" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
          <template #icon><icon-up /></template>
          撤销
        </a-button>
        <a-button @click="redo" size="small" :disabled="!canRedo" title="重做 (Ctrl+Y)">
          <template #icon><icon-down /></template>
          重做
        </a-button>
        
        <!-- 历史面板按钮 -->
        <a-button @click="toggleHistoryPanel" size="small" :type="showHistoryPanel ? 'primary' : 'secondary'" title="操作历史">
          <template #icon><icon-history /></template>
          历史
        </a-button>
        
        <!-- 导出图片按钮 -->
        <a-dropdown @select="handleExport">
          <a-button size="small">
            <template #icon><icon-download /></template>
            导出图片
          </a-button>
          <template #content>
            <a-doption value="png">导出PNG</a-doption>
            <a-doption value="jpg">导出JPG</a-doption>
            <a-doption value="svg">导出SVG</a-doption>
          </template>
        </a-dropdown>
        
        <!-- 调试功能按钮 -->
        <a-button @click="toggleDebugPanel" size="small" :type="showDebugPanel ? 'primary' : 'secondary'" title="调试功能">
          <template #icon><icon-bug /></template>
          调试
        </a-button>
      </a-button-group>
    </div>
  </div>

  <!-- 调试功能悬浮框 -->
  <div v-if="showDebugPanel" class="debug-panel" :style="{ left: debugPanelPosition.x + 'px', top: debugPanelPosition.y + 'px' }">
    <div class="debug-header" @mousedown="startDragDebugPanel">
      <div class="debug-title">
        <icon-bug />
        调试面板
      </div>
      <a-button @click="closeDebugPanel" size="mini" type="text">
        <template #icon><icon-close /></template>
      </a-button>
    </div>
    <div class="debug-content">
      <div class="debug-section">
        <a-button @click="checkPreviewLineValidity" type="primary" size="small" :loading="debugStats?.loading">
          <template #icon><icon-check /></template>
          预览线有效性检查
        </a-button>
        <a-button @click="triggerPreviewLineGeneration" type="outline" size="small" :loading="isGeneratingPreviewLines" style="margin-left: 8px;">
          <template #icon><icon-thunderbolt /></template>
          触发预览线生成
        </a-button>
      </div>
      <div v-if="debugStats?.data" class="debug-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">节点数</div>
            <div class="stat-value">{{ debugStats.data.nodeCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">配置数</div>
            <div class="stat-value">{{ debugStats.data.configuredNodeCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">应存在预览线数</div>
            <div class="stat-value">{{ debugStats.data.expectedPreviewLines }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">实际预览线数</div>
            <div class="stat-value">{{ debugStats.data.actualPreviewLines }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">应存在连接线数</div>
            <div class="stat-value">{{ debugStats.data.expectedConnections }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">实际连接线数</div>
            <div class="stat-value">{{ debugStats.data.actualConnections }}</div>
          </div>
        </div>
        <div v-if="debugStats.data.issues && debugStats.data.issues.length > 0" class="debug-issues">
          <div class="issues-title">发现的问题：</div>
          <div v-for="(issue, index) in debugStats.data.issues" :key="index" class="issue-item">
            {{ issue }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Graph, Shape, Cell } from '@antv/x6'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { Export } from '@antv/x6-plugin-export'
import { History } from '@antv/x6-plugin-history'
import { Snapline } from '@antv/x6-plugin-snapline'
import { register } from '@antv/x6-vue-shape'
import NodeTypeSelector from '../../../../components/NodeTypeSelector.vue'
import NodeConfigDrawer from '../../../../components/NodeConfigDrawer.vue'
import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import TaskFlowConfigDrawers from './TaskFlowConfigDrawers.vue'
import FlowNode from '../../../../components/FlowNode.vue'
import { getNodeConfig } from '../../../../utils/nodeTypes.js'
import { useConfigDrawers } from '../../../../composables/useConfigDrawers.js'
import { useStructuredLayout } from '../../../../composables/useStructuredLayout.js'
// import { useEnhancedAutoLayout } from '../../../../composables/useEnhancedAutoLayout.js' // 已删除，功能已整合到原生Dagre布局
import CanvasPanZoomManager from '../../../../utils/CanvasPanZoomManager.js'
import { nodeConfigManager } from '../../../../utils/NodeConfigManager.js'
import { registerCustomShapes } from '../../../../utils/x6Config.js'
import { createBranchConnectionConfig, validateConnectionConfig } from '../../../../utils/connectionConfigFactory.js'
import { connectionErrorHandler, logger } from '../../../../utils/enhancedErrorHandler.js'
import portConfigFactory from '../../../../utils/portConfigFactory.js'
import { coordinateManager } from '../../../../utils/CoordinateSystemManager.js'
import EdgeOverlapManager from '../../../../utils/EdgeOverlapManager.js'
import { dragSnapLogger, startNodeDragLogging, endNodeDragLogging } from '../../../../utils/DragSnapLogger.js'
import UnifiedPreviewLineManager from '../../../../utils/UnifiedPreviewLineManager.js'
import {
  IconPlus,
  IconMinus,
  IconFullscreen,
  IconRefresh,
  IconDelete,
  IconDownload,
  IconSort,
  IconDragDot,
  IconLocation,
  IconThunderbolt,
  IconEye,
  IconUp,
  IconDown,
  IconClose,
  IconHistory,
  IconCheck,
  IconRedo,
  IconSwap,
  IconRight,
  IconBug,
  IconDragArrow
} from '@arco-design/web-vue/es/icon'
import { Modal, Message } from '@arco-design/web-vue'

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
  'node-created',
  'node-moved',
  'node-selected',
  'node-updated',
  'node-deleted',
  'connection-created',
  'drop',
  'dragover'
])

// 画布容器引用
const canvasContainer = ref(null)
const minimapContainer = ref(null)
const minimapContent = ref(null)
let graph = null
let minimap = null

// 小地图相关状态
const showMinimap = ref(false)
const minimapCollapsed = ref(false)

// 图形实例就绪状态
const isGraphReady = ref(false)

// 节点数据
const nodes = ref([])
const connections = ref([])

// 选中状态
const selectedNodeId = ref(null)
const selectedNode = computed(() => {
  return nodes.value.find(node => node.id === selectedNodeId.value) || null
})

// 缩放显示文本（避免在模板中直接计算）
const scaleDisplayText = computed(() => {
  try {
    return `${Math.round(currentScale.value * 100)}%`
  } catch (error) {
    return '100%'
  }
})

// 节点选择器状态
const showNodeSelector = ref(false)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const nodeSelectorSourceNode = ref(null)

// 配置抽屉状态
const showConfigDrawer = ref(false)

// 开始节点配置抽屉状态
const showStartNodeConfigDrawer = ref(false)
const selectedStartNodeData = ref(null)

// 拖拽状态
const isDragging = ref(false)
const dragNodeType = ref(null)

// 拖拽会话管理
const currentDragSession = ref(null) // 当前拖拽会话ID
const dragSessionData = ref(new Map()) // 拖拽会话数据缓存

// 删除状态
const isDeletingNode = ref(false)

// 手动布局状态
const isApplyingLayout = ref(false)

// 缩放相关状态
const currentScale = ref(1)
let panZoomManager = null
let edgeOverlapManager = null

// 拖拽模式相关状态
const currentDragMode = ref('default')

// 撤销重做相关状态
const canUndo = ref(false)
const canRedo = ref(false)

// 历史面板相关状态
const showHistoryPanel = ref(false)
const historyStack = ref({
  undoStack: [],
  redoStack: []
})
const currentHistoryIndex = ref(-1)
const lastOperationTime = ref(0)
const operationThrottleDelay = 300 // 操作节流延迟（毫秒）

// 添加防护标志，避免递归更新
const isUpdatingScale = ref(false)
const isUpdatingLayout = ref(false)

// 初始化增强自动布局管理（已废弃，使用原生Dagre布局）
// const autoLayout = useEnhancedAutoLayout(() => graph)

// 使用 ref 而不是 computed 来避免递归更新问题
const layoutStats = ref(null)

// 配置抽屉管理器（响应式变量）
const configDrawers = ref(null)

// 统一预览线管理器
let unifiedPreviewLineManager = null

// 调试面板相关状态
const showDebugPanel = ref(false)
const debugPanelPosition = ref({ x: 100, y: 100 })
const isDraggingDebugPanel = ref(false)
const isGeneratingPreviewLines = ref(false)
const debugStats = ref(null)

// 布局方向状态管理
const currentLayoutDirection = computed(() => {
  return configDrawers.value?.structuredLayout?.layoutDirection?.value || 'TB'
})

// 布局方向切换处理函数
const handleLayoutDirectionChange = async (direction) => {
  console.log(`[TaskFlowCanvas] 切换布局方向: ${direction}`)
  
  if (!configDrawers.value?.structuredLayout?.switchLayoutDirection) {
    console.error('[TaskFlowCanvas] 布局方向切换功能不可用')
    Message.error('布局方向切换功能不可用')
    return
  }

  try {
    isApplyingLayout.value = true
    const result = await configDrawers.value.structuredLayout.switchLayoutDirection(direction)
    
    if (result && result.success) {
      console.log(`[TaskFlowCanvas] 布局方向切换成功: ${direction}`)
      Message.success(`布局方向已切换为${direction === 'TB' ? '从上到下' : '从左到右'}`)
      
      // 更新连线重叠管理器的布局方向
      if (edgeOverlapManager && edgeOverlapManager.updateLayoutDirection) {
        edgeOverlapManager.updateLayoutDirection(direction)
        console.log(`[TaskFlowCanvas] 连线重叠管理器布局方向已更新: ${direction}`)
      }
      
      // 自动缩放到合适大小
      await nextTick()
      setTimeout(() => {
        graph.zoomToFit({ padding: 50 })
        
        // 检查并限制缩放比例
        const currentZoom = graph.zoom()
        if (currentZoom > 1.2) {
          console.log(`[TaskFlowCanvas] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
          graph.zoomTo(1.2, { center: graph.getGraphArea().center })
        }
      }, 300)
    } else {
      console.error('[TaskFlowCanvas] 布局方向切换失败')
      Message.error('布局方向切换失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 布局方向切换异常:', error)
    Message.error('布局方向切换异常: ' + error.message)
  } finally {
    isApplyingLayout.value = false
  }
}

// 手动更新统计信息的函数
const updateLayoutStats = () => {
  if (isUpdatingLayout.value) {
    console.log('[TaskFlowCanvas] 统计信息更新正在进行中，跳过')
    return // 防止递归更新
  }

  try {
    isUpdatingLayout.value = true
    // 使用原生Dagre布局的统计信息
    const stats = configDrawers.value?.structuredLayout?.layoutStats?.value
    if (stats) {
      // 深拷贝避免引用问题
      layoutStats.value = JSON.parse(JSON.stringify(stats))
    } else {
      layoutStats.value = null
    }
  } catch (error) {
    console.warn('[TaskFlowCanvas] 获取布局统计信息失败:', error)
    layoutStats.value = null
  } finally {
    // 立即重置状态，不使用异步
    isUpdatingLayout.value = false
  }
}

// 初始化画布
// 全局初始化标志，防止重复初始化
let isCanvasInitialized = false

const initCanvas = async () => {
  if (isCanvasInitialized) {
    console.log('[TaskFlowCanvas] 画布已初始化，跳过重复初始化')
    return
  }

  console.log('[TaskFlowCanvas] 开始初始化画布')
  isCanvasInitialized = true

  await nextTick()

  if (!canvasContainer.value) {
    console.error('[TaskFlowCanvas] 画布容器不存在')
    return
  }

  console.log('[TaskFlowCanvas] 画布容器尺寸:', {
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight
  })

  // 创建 X6 图实例
  graph = new Graph({
    container: canvasContainer.value,
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight,
    background: {
      color: '#f8f9fa'
    },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee',
          thickness: 1,
          size: 20
        },
        {
          color: '#ddd',
          thickness: 1,
          factor: 4,
          size: 80
        }
      ]
    },
    selecting: {
      enabled: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
      multiple: true,
      strict: false,
      modifiers: ['shift', 'ctrl']
    },
    // 启用节点拖拽
    interacting: {
      nodeMovable: !props.readonly,
      edgeMovable: false,
      edgeLabelMovable: false,
      arrowheadMovable: false,
      vertexMovable: false,
      vertexAddable: false,
      vertexDeletable: false,
      useEdgeTools: false
    },
    scroller: {
      enabled: true,
      pannable: false, // 🔧 禁用X6内置拖拽，使用CanvasPanZoomManager接管
      cursor: 'default',
      passive: false,
      modifiers: ['ctrl'], // 需要Ctrl键才能拖拽（实际不会生效，因为pannable已禁用）
      pageVisible: false,
      pageBreak: false,
      autoResize: true,
      padding: 100, // 增加边距以支持更好的延展
      // 添加画布延展配置
      width: 2000, // 设置画布宽度
      height: 2000, // 设置画布高度
      minVisibleWidth: 50,
      minVisibleHeight: 50,
      // 启用画布自动延展
      autoExpand: true,
      expandThreshold: 100 // 当节点接近边界时自动延展
    },
    mousewheel: {
      enabled: false, // 禁用鼠标滚轮缩放
      modifiers: [],
      factor: 1.1,
      maxScale: 3.0,
      minScale: 0.2,
      passive: false,
      global: false,
      center: true
    },
    connecting: {
      router: {
        name: 'orth',
        args: {
          padding: 15,
          step: 15,
          startDirections: ['bottom'],
          endDirections: ['top']
          // 🚀 [智能路径] 移除fallbackRoute，完全依赖orth路由器的自动最短路径算法
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 6,
        },
      },
      // 🔧 修复：使用端口位置而不是节点中心点
      connectionPoint: {
        name: 'anchor',
        args: {
          // 自定义端口位置计算函数
          getConnectionPoint(terminal, view, magnet, connectionPoint, type, options) {
            if (!magnet || !view) {
              return connectionPoint
            }
            
            try {
              const node = view.cell
              const nodePosition = node.getPosition()
              const nodeSize = node.getSize()
              
              // 获取端口配置
              const portId = magnet.getAttribute('port')
              if (!portId) {
                return connectionPoint
              }
              
              const portConfig = node.getPortProp(portId, 'position') || {}
              
              let portX = nodePosition.x
              let portY = nodePosition.y
              
              // 根据端口配置计算精确位置
              if (portConfig.name === 'bottom') {
                const args = portConfig.args || {}
                const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
                  parseFloat(args.x) / 100 : 0.5
                portX = nodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
                portY = nodePosition.y + nodeSize.height + (args.dy || 0)
              } else if (portConfig.name === 'top') {
                const args = portConfig.args || {}
                const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
                  parseFloat(args.x) / 100 : 0.5
                portX = nodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
                portY = nodePosition.y + (args.dy || 0)
              } else if (portConfig.name === 'left') {
                const args = portConfig.args || {}
                const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
                  parseFloat(args.y) / 100 : 0.5
                portX = nodePosition.x + (args.dx || 0)
                portY = nodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
              } else if (portConfig.name === 'right') {
                const args = portConfig.args || {}
                const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
                  parseFloat(args.y) / 100 : 0.5
                portX = nodePosition.x + nodeSize.width + (args.dx || 0)
                portY = nodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
              } else {
                // 默认使用节点中心
                portX = nodePosition.x + nodeSize.width / 2
                portY = nodePosition.y + nodeSize.height / 2
              }
              
              console.log('🎯 [连接点计算] 端口位置:', {
                nodeId: node.id,
                portId,
                portConfig: portConfig.name,
                calculatedPosition: { x: portX, y: portY },
                nodePosition,
                nodeSize
              })
              
              return { x: portX, y: portY }
            } catch (error) {
              console.warn('⚠️ [连接点计算] 端口位置计算失败，使用默认位置:', error)
              return connectionPoint
            }
          }
        }
      },
      // 为新创建的边设置默认连接点
      defaultConnectionPoint: {
        name: 'anchor'
      },
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        if (props.readonly) {
          return null // 只读模式下不允许创建连接
        }
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#5F95FF',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        if (props.readonly) {
          return false // 只读模式下不允许连接
        }
        return !!targetMagnet
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF'
          }
        }
      }
    },
    resizing: true,
    rotating: false,
    snapline: true,
    keyboard: true,
    clipboard: true,
    history: true
  })

  console.log('[TaskFlowCanvas] X6图形实例创建成功')

  // 初始化插件
  console.log('[TaskFlowCanvas] 开始初始化插件')
  
  // 初始化导出插件
  graph.use(new Export())
  console.log('[TaskFlowCanvas] 导出插件初始化完成')
  
  // 初始化历史记录插件
  const historyPlugin = new History({
    enabled: true,
    ignoreAdd: false,
    ignoreRemove: false,
    ignoreChange: false,
    beforeAddCommand: (event, args) => {
      const now = Date.now()
      
      // 过滤频繁的位置更新操作
      if (event === 'cell:change:position' && 
          now - lastOperationTime.value < operationThrottleDelay) {
        return false
      }
      
      // 过滤临时的样式变化
      if (event === 'cell:change:attrs' && args.options?.temp) {
        return false
      }
      
      // 过滤预览线相关的操作
      if (args.cell && args.cell.id && args.cell.id.includes('preview-line')) {
        return false
      }
      
      lastOperationTime.value = now
      return true
    }
  })
  graph.use(historyPlugin)
  console.log('[TaskFlowCanvas] 历史记录插件初始化完成，已启用操作过滤')
  console.log('[TaskFlowCanvas] 历史记录插件配置:', {
    enabled: historyPlugin.options.enabled,
    ignoreAdd: historyPlugin.options.ignoreAdd,
    ignoreRemove: historyPlugin.options.ignoreRemove,
    ignoreChange: historyPlugin.options.ignoreChange,
    hasBeforeAddCommand: !!historyPlugin.options.beforeAddCommand
  })
  
  // 初始化对齐线插件
  graph.use(new Snapline({
    enabled: true,
    sharp: true,
    resizing: true,
    clean: 1000
  }))
  console.log('[TaskFlowCanvas] 对齐线插件初始化完成')

  // 监听历史记录变化
  graph.on('history:change', () => {
    const canUndoValue = graph.canUndo()
    const canRedoValue = graph.canRedo()
    canUndo.value = canUndoValue
    canRedo.value = canRedoValue
    
    // 更新历史栈信息
    updateHistoryStack()
    
    console.log('[历史记录] 状态变化:', {
      canUndo: canUndoValue,
      canRedo: canRedoValue,
      undoStackLength: graph.history?.undoStack?.length || 0,
      redoStackLength: graph.history?.redoStack?.length || 0
    })
  })

  // 监听命令添加事件
  graph.on('history:command:added', (args) => {
    const { command } = args
    console.log('[历史记录] 命令添加:', {
      event: command.event,
      cellId: command.data?.cell?.id,
      timestamp: Date.now()
    })
    updateHistoryStack()
  })

  // 监听撤销事件
  graph.on('history:undo', (args) => {
    const { command } = args
    const description = getOperationDescription(command)
    Message.success(`已撤销: ${description}`)
    console.log('[历史记录] 撤销操作:', description)
    updateHistoryStack()
  })

  // 监听重做事件
  graph.on('history:redo', (args) => {
    const { command } = args
    const description = getOperationDescription(command)
    Message.success(`已重做: ${description}`)
    console.log('[历史记录] 重做操作:', description)
    updateHistoryStack()
  })

  // 监听其他可能影响历史记录的事件
  graph.on('cell:added', (args) => {
    console.log('[历史记录] 节点/边添加:', args.cell.id)
  })
  
  graph.on('cell:removed', (args) => {
    console.log('[历史记录] 节点/边删除:', args.cell.id)
  })
  
  graph.on('cell:changed', (args) => {
    console.log('[历史记录] 节点/边变化:', args.cell.id, args.options)
  })

  console.log('[TaskFlowCanvas] 所有插件初始化完成')
  
  // 检查历史记录插件状态
  setTimeout(() => {
    console.log('[历史记录] 插件状态检查:', {
      historyExists: !!graph.history,
      canUndo: graph.canUndo(),
      canRedo: graph.canRedo(),
      undoStackLength: graph.history?.undoStack?.length || 0,
      redoStackLength: graph.history?.redoStack?.length || 0,
      historyEnabled: graph.history?.options?.enabled
    })
  }, 1000)

  // 输出画布配置调试信息
  console.log('⚙️ [TaskFlowCanvas] 画布配置信息:', {
    scroller: {
      enabled: true,
      pannable: false, // 已禁用X6内置拖拽
      modifiers: ['ctrl']
    },
    interacting: {
      nodeMovable: !props.readonly
    },
    readonly: props.readonly
  })

  // 检查scroller是否正确启用
  const scrollerEnabled = graph.scroller && graph.scroller.options.enabled
  const scrollerPannable = graph.scroller && graph.scroller.options.pannable
  console.log('🔍 [TaskFlowCanvas] Scroller状态检查:', {
    scrollerExists: !!graph.scroller,
    scrollerEnabled,
    scrollerPannable,
    scrollerOptions: graph.scroller ? graph.scroller.options : null
  })

  // 注册自定义边形状
  registerCustomShapes(Graph)
  console.log('[TaskFlowCanvas] 自定义边形状注册完成')

  // 🔧 初始化坐标系统管理器
  coordinateManager.setGraph(graph)
  coordinateManager.setDebugMode(process.env.NODE_ENV === 'development')
  console.log('[TaskFlowCanvas] 坐标系统管理器初始化完成')

  // 初始化配置抽屉管理器（只初始化一次）
  if (!configDrawers.value) {
    const nodeOperations = {}
    configDrawers.value = useConfigDrawers(() => graph, nodeOperations)
    console.log('[TaskFlowCanvas] 配置抽屉管理器初始化完成')
  }

  // 初始化自动布局管理器（已废弃，使用原生Dagre布局）
  // autoLayout.initLayoutManager()
  console.log('[TaskFlowCanvas] 自动布局管理器初始化完成（使用原生Dagre布局）')

  // 初始化统计信息
  updateLayoutStats()
  console.log('[TaskFlowCanvas] 布局统计信息初始化完成')

  // 🔧 时序修复：先初始化基础组件，稍后在节点加载后再初始化布局引擎
  console.log('[TaskFlowCanvas] 开始初始化结构化布局基础组件')
  if (configDrawers.value?.structuredLayout) {
    // 只初始化基础组件，不立即初始化布局引擎
    console.log('[TaskFlowCanvas] 结构化布局基础组件初始化完成，等待节点加载后再初始化布局引擎')
  }

  // 🔧 方案D：移除过早的预览线管理器访问，避免初始化时序问题
  // 预览线管理器将在数据加载完成后通过 initializeLayoutEngineAfterDataLoad 方法初始化
  console.log('[TaskFlowCanvas] 跳过预览线管理器的过早访问，将在数据加载后初始化')

  // 初始化拖拽缩放管理器（在绑定其他事件之前）
  panZoomManager = new CanvasPanZoomManager(graph)
  console.log('[TaskFlowCanvas] 拖拽缩放管理器初始化完成')

  // 初始化连线重叠管理器
  const layoutDirection = currentLayoutDirection.value || 'TB'
  edgeOverlapManager = new EdgeOverlapManager(graph, layoutDirection)
  console.log('[TaskFlowCanvas] 连线重叠管理器初始化完成, 布局方向:', layoutDirection)

  // 绑定事件
  bindEvents()
  console.log('[TaskFlowCanvas] 事件绑定完成')

  // 初始化缩放监听
  watchZoomChange()
  updateCurrentScale()
  console.log('[TaskFlowCanvas] 缩放监听初始化完成')

  // 加载初始数据
  loadInitialData()
  console.log('[TaskFlowCanvas] 初始数据加载完成')

  // 自动添加开始节点（如果没有开始节点）
  if (props.autoAddStartNode) {
    const hasStartNode = nodes.value.some(node => node.type === 'start')
    console.log('[TaskFlowCanvas] 检查是否需要添加开始节点，当前是否有开始节点:', hasStartNode)
    if (!hasStartNode) {
      addStartNode()
    }
  }

  // 添加汇总日志 - 统计页面中各种元素的数量
  logCanvasSummary()

  console.log('[TaskFlowCanvas] 画布初始化完成，当前节点数:', nodes.value.length)

  // 设置图形实例就绪状态
  await nextTick()
  isGraphReady.value = true
  console.log('[TaskFlowCanvas] 图形实例已就绪，自动布局已启用')

  // 触发画布就绪事件
  emit('canvas-ready', {
    nodes: nodes.value,
    connections: connections.value
  })
}

// 绑定事件
const bindEvents = () => {
  if (!graph) return

  console.log('🔗 [TaskFlowCanvas] 开始绑定画布事件')

  // 添加画布级别的鼠标事件监听（仅在开发环境下用于调试）
  if (import.meta.env.DEV) {
    const container = graph.container
    if (container) {
      console.log('📦 [TaskFlowCanvas] 画布容器信息:', {
        container,
        containerTagName: container.tagName,
        containerClasses: container.className,
        containerId: container.id
      })

      // 添加调试用的鼠标事件监听器（使用冒泡阶段，避免干扰CanvasPanZoomManager）
      const debugMouseDown = (e) => {
        console.log('🖱️ [TaskFlowCanvas] 画布容器鼠标按下事件:', {
          target: e.target,
          targetTagName: e.target.tagName,
          targetClasses: e.target.className,
          button: e.button,
          clientX: e.clientX,
          clientY: e.clientY,
          eventPhase: e.eventPhase,
          bubbles: e.bubbles,
          cancelable: e.cancelable
        })
      }

      const debugMouseMove = (e) => {
        // 移除鼠标移动日志，避免日志过多
      }

      // 使用冒泡阶段，不干扰CanvasPanZoomManager的事件处理
      container.addEventListener('mousedown', debugMouseDown, false)
      container.addEventListener('mousemove', debugMouseMove, false)
      
      console.log('🎯 [TaskFlowCanvas] 画布容器调试事件监听器已添加（冒泡阶段）')
    }
  }

  // 节点点击事件 - 选择节点并打开配置抽屉
  graph.on('node:click', ({ node }) => {
    // 检查是否正在删除节点，如果是则忽略点击事件
    if (isDeletingNode.value) {
      console.log('[TaskFlowCanvas] 正在删除节点，忽略点击事件:', node.id)
      return
    }
    
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      selectedNodeId.value = node.id
      emit('node-selected', nodeData)

      console.log('[TaskFlowCanvas] 节点被点击:', nodeData.type, nodeData.id)

      // 只读模式下不打开配置抽屉
      if (props.readonly) {
        console.log('[TaskFlowCanvas] 只读模式，不打开配置抽屉')
        return
      }

      // 从图形节点实例中获取最新的配置数据
      const graphNodeData = node.getData() || {}
      const latestConfig = graphNodeData.config || {}

      console.log('[TaskFlowCanvas] 从图形节点获取最新配置:', latestConfig)

      if (nodeData.type === 'start') {
        // 开始节点打开专用配置抽屉
        // 构造完整的节点数据结构，确保包含最新的配置信息
        const completeNodeData = {
          ...nodeData,
          config: latestConfig || nodeData.config || {}
        }
        selectedStartNodeData.value = completeNodeData
        showStartNodeConfigDrawer.value = true
        console.log('[TaskFlowCanvas] 打开开始节点配置抽屉，节点数据:', completeNodeData)
      } else if (['audience-split', 'event-split', 'ai-call', 'sms', 'manual-call', 'ab-test', 'wait'].includes(nodeData.type)) {
        // 使用专门的配置抽屉
        console.log('[TaskFlowCanvas] 调用configDrawers.openConfigDrawer:', nodeData.type)
        if (configDrawers.value && typeof configDrawers.value.openConfigDrawer === 'function') {
          // 构造正确的数据结构，包含config属性
          const drawerData = {
            ...nodeData,
            config: latestConfig,
            nodeId: node.id,
            nodeType: nodeData.type
          }
          console.log('[TaskFlowCanvas] 传递给抽屉的数据结构:', drawerData)
          configDrawers.value.openConfigDrawer(nodeData.type, node, drawerData)
        } else {
          console.error('[TaskFlowCanvas] configDrawers.value 或 openConfigDrawer 方法不存在')
        }
      } else {
        // 其他节点打开通用配置抽屉
        showConfigDrawer.value = true
        console.log('[TaskFlowCanvas] 打开通用配置抽屉')
      }
    }
  })

  // 节点拖拽开始事件
  graph.on('node:move', ({ node }) => {
    isDragging.value = true
    const nodeData = node.getData() || {}
    dragNodeType.value = nodeData.type || 'unknown'
  })

  // 连接添加事件 - 确保连接数据同步到 connections 数组
  graph.on('edge:added', ({ edge }) => {
    // 过滤掉预览线，只处理真正的连接
    const edgeId = edge.id
    if (edgeId.includes('preview') || edgeId.includes('unified_preview')) {
      console.log('🔍 [TaskFlowCanvas] 跳过预览线，不添加到连接数组:', edgeId)
      return
    }
    
    // 验证边的源和目标是否为有效的节点ID
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    
    // 检查是否是临时连线（拖拽过程中的连线，targetId 为 undefined）
    if (!targetId) {
      console.log('🔍 [TaskFlowCanvas] 跳过临时连线（拖拽中），不添加到连接数组:', {
        edgeId,
        sourceId,
        targetId
      })
      return
    }
    
    if (!sourceId || !targetId) {
      console.warn('⚠️ [TaskFlowCanvas] 边缺少有效的源或目标节点ID，跳过添加:', {
        edgeId,
        sourceId,
        targetId
      })
      return
    }
    
    // 验证源和目标是否为字符串类型的节点ID
    if (typeof sourceId !== 'string' || typeof targetId !== 'string') {
      console.warn('⚠️ [TaskFlowCanvas] 边的源或目标不是有效的节点ID，跳过添加:', {
        edgeId,
        sourceId,
        targetId,
        sourceType: typeof sourceId,
        targetType: typeof targetId
      })
      return
    }
    
    const edgeData = edge.getData() || {}
    
    // 获取标签信息 - 优先从 edge.getLabels() 中获取，然后从 edgeData 中获取
    let label = ''
    const labels = edge.getLabels() || []
    if (labels.length > 0) {
      // 尝试从多个可能的位置获取标签文本
      const labelData = labels[0]
      if (labelData.markup && typeof labelData.markup === 'string') {
        // 如果标签是通过 markup 设置的（直接文本）
        label = labelData.markup
      } else if (labelData.attrs && labelData.attrs.text && labelData.attrs.text.text) {
        // 如果标签是通过 attrs.text.text 设置的
        label = labelData.attrs.text.text
      } else if (labelData.attrs && labelData.attrs.label && labelData.attrs.label.text) {
        // 如果标签是通过 attrs.label.text 设置的
        label = labelData.attrs.label.text
      }
    }
    
    // 如果从标签中没有获取到，则从 edgeData 中获取
    if (!label) {
      label = edgeData.branchLabel || edgeData.label || ''
    }
    
    const connectionData = {
      id: edge.id,
      source: sourceId,
      target: targetId,
      sourcePort: edge.getSourcePortId() || 'out',
      targetPort: edge.getTargetPortId() || 'in',
      branchId: edgeData.branchId,
      label: label
    }
    
    // 检查连接是否已存在，避免重复添加
    const existingConnection = connections.value.find(conn => conn.id === connectionData.id)
    if (!existingConnection) {
      connections.value.push(connectionData)
      console.log('✅ [TaskFlowCanvas] 连接已添加到数据数组:', connectionData)
    } else {
      console.log('🔍 [TaskFlowCanvas] 连接已存在，跳过重复添加:', connectionData.id)
    }
  })

  

  // 连接删除事件 - 确保连接数据从 connections 数组中移除
  graph.on('edge:removed', ({ edge }) => {
    const edgeId = edge.id
    
    // 过滤掉预览线，只处理真正的连接
    if (edgeId.includes('preview') || edgeId.includes('unified_preview')) {
      console.log('🔍 [TaskFlowCanvas] 跳过预览线删除，不从连接数组中移除:', edgeId)
      return
    }
    
    const index = connections.value.findIndex(conn => conn.id === edgeId)
    if (index !== -1) {
      const removedConnection = connections.value.splice(index, 1)[0]
      console.log('✅ [TaskFlowCanvas] 连接已从数据数组中移除:', removedConnection)
    } else {
      console.log('🔍 [TaskFlowCanvas] 连接不在数据数组中，无需移除:', edgeId)
    }
  })

  // 添加画布空白区域点击事件监听
  graph.on('blank:mousedown', (e) => {
    // 空白区域鼠标按下事件
  })

  // 添加画布空白区域鼠标移动事件监听
  graph.on('blank:mousemove', (e) => {
    // 移除鼠标移动日志，避免日志过多
  })

  // 添加画布空白区域鼠标抬起事件监听
  graph.on('blank:mouseup', (e) => {
    // 空白区域鼠标抬起事件
  })

  // 节点拖拽过程中的事件（实时更新）
  graph.on('node:moving', ({ node }) => {
    // 🔧 使用坐标系统管理器进行坐标转换
    const rawPosition = node.getPosition()
    const size = node.getSize()
    const nodeData = node.getData() || {}
    
    // 🔧 修复：节点拖拽时不应该触发预览线位置更新
    // 预览线位置更新应该只在预览线本身被拖拽时触发
    // 节点拖拽时预览线会通过其他机制自动跟随节点移动
    
    // 注释掉错误的预览线更新调用
    // const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    // if (unifiedPreviewManager && typeof unifiedPreviewManager.immediateUpdatePosition === 'function') {
    //   try {
    //     // 立即更新预览线位置，确保拖拽时实时跟随
    //     unifiedPreviewManager.immediateUpdatePosition(node)
    //   } catch (error) {
    //     // 静默处理错误，避免影响拖拽性能
    //   }
    // }
    
    // 计算节点中心点（使用修正后的坐标）
    const centerX = rawPosition.x + size.width / 2
    const centerY = rawPosition.y + size.height / 2

    // 🔧 修复：获取预览线管理器用于吸附逻辑
    const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    
    // 在节点拖拽过程中触发吸附逻辑
    if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
      // 调用统一预览线管理器的吸附高亮逻辑
      unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)
      
      // 🔧 添加预览线终点吸附检查
      if (typeof unifiedPreviewManager.checkSnapToPreviewLines === 'function') {
        unifiedPreviewManager.checkSnapToPreviewLines(node, rawPosition, size)
      }
    }
  
  })

  // 节点位置变化事件（备用方案）
  graph.on('node:change:position', ({ node, current, previous }) => {
    if (isDragging.value) {
      // 🔧 使用坐标系统管理器进行坐标转换
      const size = node.getSize()
      
      // 通过坐标管理器验证和修正坐标
      const coordinateValidation = coordinateManager.validateCoordinateTransform(node)
      let centerX = current.x + size.width / 2
      let centerY = current.y + size.height / 2
      
      // 如果检测到坐标偏差，进行修正
      if (coordinateValidation && coordinateValidation.difference) {
        centerX -= coordinateValidation.difference.x
        centerY -= coordinateValidation.difference.y
        
        console.log('🔍 [位置变化坐标修正] 检测到坐标偏差:', {
          nodeId: node.id,
          current,
          previous,
          coordinateValidation,
          correctedCenter: { x: centerX, y: centerY }
        })
      }
      
      // 在节点位置变化时触发吸附逻辑
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
        // 调用统一预览线管理器的吸附高亮逻辑
        unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)
        
        // 🔧 添加预览线终点吸附检查
        if (typeof unifiedPreviewManager.checkSnapToPreviewLines === 'function') {
          unifiedPreviewManager.checkSnapToPreviewLines(node, current, size)
        }
      }
    }
  })

  // 节点移动完成事件（合并处理）
  graph.on('node:moved', async ({ node, options }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    const cellData = node.getData() || {}
    
    // 🎯 关键修复：检查是否是系统发起的位置变更
    if (options && (options.systemInitiated || options.layoutEngine)) {
      console.log('🤖 [系统拖拽] 检测到系统发起的位置变更，跳过用户拖拽处理:', {
        nodeId: node.id,
        source: options.source || 'unknown',
        systemInitiated: options.systemInitiated,
        layoutEngine: options.layoutEngine,
        newPosition: node.getPosition()
      })
      
      // 🎯 系统发起的位置变更：只更新数据数组，不执行用户拖拽逻辑
      const nodeIndex = nodes.value.findIndex(n => n.id === node.id)
      if (nodeIndex >= 0) {
        const position = node.getPosition()
        nodes.value[nodeIndex] = {
          ...nodes.value[nodeIndex],
          position: { ...position }
        }
        console.log('✅ [系统拖拽] 节点位置已同步到数据数组:', {
          nodeId: node.id,
          nodeIndex,
          newPosition: position,
          source: options.source
        })
      }
      
      // 发出事件但标记为系统操作
      emit('node-moved', { 
        nodeId: node.id, 
        position: node.getPosition(),
        systemInitiated: true,
        source: options.source
      })
      
      return // 🎯 关键：系统操作直接返回，不执行后续的用户拖拽逻辑
    }
    
    // 🎯 以下是用户手动拖拽的处理逻辑
    console.log('👤 [用户拖拽] 检测到用户手动拖拽操作:', {
      nodeId: node.id,
      newPosition: node.getPosition()
    })
    

    
    if (nodeData) {
      // 🔧 安全获取节点位置，添加多重检查
      let position = node.getPosition()
      
      // 如果getPosition()返回无效值，尝试其他方法
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        console.warn('⚠️ [节点移动] getPosition()返回无效值，尝试备用方案:', {
          nodeId: node.id,
          getPosition: position,
          isNaN_x: isNaN(position?.x),
          isNaN_y: isNaN(position?.y)
        })
        
        // 尝试从节点属性中获取位置
        const nodeAttrs = node.getAttrs()
        if (nodeAttrs && nodeAttrs.transform) {
          const transform = nodeAttrs.transform
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/)
          if (match) {
            position = {
              x: parseFloat(match[1]),
              y: parseFloat(match[2])
            }
            console.log('🔧 [节点移动] 从transform属性获取位置:', position)
          }
        }
        
        // 如果还是无效，尝试从节点数据中获取
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          if (nodeData.position && typeof nodeData.position.x === 'number' && typeof nodeData.position.y === 'number') {
            position = { ...nodeData.position }
            console.log('🔧 [节点移动] 从节点数据获取位置:', position)
          }
        }
        
        // 最后的备用方案：使用默认位置
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          position = { x: 0, y: 0 }
          console.error('❌ [节点移动] 无法获取有效位置，使用默认位置:', position)
        }
      }
      
      // 🔧 修复：确保节点位置更新正确同步到nodes数组
      const nodeIndex = nodes.value.findIndex(n => n.id === node.id)
      if (nodeIndex >= 0) {
        // 使用响应式更新确保数据同步
        nodes.value[nodeIndex] = {
          ...nodes.value[nodeIndex],
          position: { ...position }
        }
        console.log('✅ [节点移动] 节点位置已同步到数据数组:', {
          nodeId: node.id,
          nodeIndex,
          newPosition: position,
          nodeType: nodes.value[nodeIndex].type
        })
      } else {
        console.warn('⚠️ [节点移动] 在nodes数组中未找到对应节点:', {
          nodeId: node.id,
          nodesCount: nodes.value.length
        })
      }
      
      emit('node-moved', { nodeId: node.id, position })

      // 获取统一预览线管理器
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      
      // 🔧 修复：先执行吸附和自动连接逻辑，再刷新预览线位置
      // 原问题：之前是先刷新预览线，再执行自动连接，可能导致位置不一致
      // 修复后顺序：节点移动 → 吸附检测 → 自动连接 → 预览线刷新 → 清除高亮
      // 使用统一预览线管理器的新吸附检测方法
      if (unifiedPreviewManager) {
        const size = node.getSize()
        
        // 🔧 安全检查：确保position和size都有有效值
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          console.warn('⚠️ [节点移动] 节点位置信息无效，跳过吸附检测:', {
            nodeId: node.id,
            position: position,
            nodePosition: node.getPosition()
          })
          return
        }
        
        if (!size || typeof size.width !== 'number' || typeof size.height !== 'number') {
          console.warn('⚠️ [节点移动] 节点尺寸信息无效，跳过吸附检测:', {
            nodeId: node.id,
            size: size,
            nodeSize: node.getSize()
          })
          return
        }

        // 使用新的预览线吸附检测方法
        const snapResult = unifiedPreviewManager.checkNodeSnapToPreviewLines(node, position, size)
        
        if (snapResult && snapResult.success) {
          // 记录吸附成功的日志
          if (currentDragSession.value) {
            dragSnapLogger.logProcess(currentDragSession.value, 'snap_success', {
              draggedNode: {
                id: node.id,
                type: nodeData.type,
                position: { ...position }
              },
              connection: snapResult.connection,
              snapTarget: snapResult.snapTarget
            })
          }

          // 使用连接配置工厂创建配置
          const connectionConfig = createBranchConnectionConfig(
            { cell: snapResult.connection.source, port: snapResult.connection.sourcePort },
            { cell: snapResult.connection.target, port: snapResult.connection.targetPort },
            snapResult.connection.branchId,
            snapResult.connection.branchLabel
          )

          // 验证连接配置
          const validationResult = validateConnectionConfig(connectionConfig)
          if (!validationResult.valid) {
            console.error('连接配置验证失败:', { 
              connectionConfig, 
              errors: validationResult.errors,
              snapResult
            })
          } else {
            try {
              // 创建连接
              const connectionResult = await connectionErrorHandler.safeCreateConnection(
                graph,
                connectionConfig
              )

              if (connectionResult.success) {
                const connection = connectionResult.result
                
                // 连接创建成功
                console.log('连接创建成功:', {
                  edgeId: connection.id,
                  connection: snapResult.connection
                })

                // 触发连接创建事件
                emit('connection-created', {
                  edge: connection,
                  source: snapResult.connection.source,
                  target: snapResult.connection.target,
                  branchId: snapResult.connection.branchId,
                  branchLabel: snapResult.connection.branchLabel,
                  snapResult: snapResult
                })

                // 记录拖拽吸附成功
                if (currentDragSession.value) {
                  dragSnapLogger.logProcess(currentDragSession.value, 'connection_created', {
                    edgeId: connection.id,
                    connectionConfig: connectionConfig
                  })
                }
              } else {
                console.error('连接创建失败:', connectionResult.errors)
              }
            } catch (error) {
              console.error('连接创建异常:', error)
            }
          }

          // 清除拖拽过程中的高亮效果
          unifiedPreviewManager.clearNodeHighlights()
        }

        // 🔧 优化：节点移动后只刷新该节点为源节点的预览线，而不是所有预览线
        if (unifiedPreviewManager && typeof unifiedPreviewManager.updatePreviewLinePosition === 'function') {
          try {
            // 只更新移动节点的预览线位置，提升性能
            unifiedPreviewManager.updatePreviewLinePosition(node)
            // 已刷新节点预览线位置
          } catch (error) {
            console.warn('刷新节点预览线位置失败:', error)
          }

          // 🔧 清理吸附状态，防止循环连接
          if (typeof unifiedPreviewManager.clearSnapState === 'function') {
            unifiedPreviewManager.clearSnapState()
          }

          // 🔧 新增：节点移动后更新所有普通连接线的路由器，防止变成直线
          try {
            const allEdges = graph.getEdges()
            let updatedEdgesCount = 0
            
            allEdges.forEach(edge => {
              const edgeData = edge.getData() || {}
              
              // 跳过预览线，只处理普通连接线
              if (edgeData.isPersistentPreview || edgeData.isPreview) {
                return
              }
              
              const sourceNode = edge.getSourceNode()
              const targetNode = edge.getTargetNode()
              
              if (sourceNode && targetNode) {
                const sourcePos = sourceNode.getPosition()
                const targetPos = targetNode.getPosition()
                const sourceSize = sourceNode.getSize()
                const targetSize = targetNode.getSize()
                
                if (sourcePos && targetPos && sourceSize && targetSize) {
                  const sourceCenterX = sourcePos.x + sourceSize.width / 2
                  const targetCenterX = targetPos.x + targetSize.width / 2
                  const sourceCenterY = sourcePos.y + sourceSize.height / 2
                  const targetCenterY = targetPos.y + targetSize.height / 2
                  const xDiff = Math.abs(sourceCenterX - targetCenterX)
                  const yDiff = Math.abs(targetCenterY - sourceCenterY)
                  
                  // 使用与智能布局相同的路由器选择逻辑
                  if (xDiff < 5 && yDiff > 80) {
                    // 节点几乎完全垂直对齐且距离较远时使用直线
                    edge.setRouter('normal')
                  } else {
                    // 其他情况使用orth路由器
                    edge.setRouter({
                      name: 'orth',
                      args: {
                        padding: 15,
                        step: 10,
                        startDirections: ['bottom'],
                        endDirections: ['top']
                      }
                    })
                  }
                  updatedEdgesCount++
                }
              }
            })
            
            if (updatedEdgesCount > 0) {
              console.log(`✅ [节点移动] 已更新 ${updatedEdgesCount} 条连接线的路由器`)
            }
          } catch (error) {
            console.warn('⚠️ [节点移动] 更新连接线路由器失败:', error)
          }
        }

        // 分流节点移动时只更新分支布局，不触发结构化布局
        if (['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)) {
            // 延迟执行，确保位置更新完成
            setTimeout(() => {
              if (configDrawers.value?.structuredLayout?.branchLayoutManager) {
                const config = nodeData.config || {}
                
                // 🔧 修复：检查是否有已连接的未命中人群节点，如果有则保护其位置
                const connectedNodes = new Set()
                const protectedPositions = new Map()
                const outgoingEdges = graph.getOutgoingEdges(node) || []
                
                outgoingEdges.forEach(edge => {
                  const targetNode = edge.getTargetNode()
                  if (targetNode) {
                    const edgeData = edge.getData() || {}
                    // 如果是未命中人群相关的连接，记录目标节点位置
                    if (edgeData.branchId === 'default' || edgeData.branchLabel === '未命中人群') {
                      connectedNodes.add(targetNode.id)
                      protectedPositions.set(targetNode.id, targetNode.getPosition())
                      console.log('🔒 [TaskFlowCanvas] 保护已连接的未命中人群节点位置:', {
                        nodeId: targetNode.id,
                        position: targetNode.getPosition(),
                        branchId: edgeData.branchId,
                        branchLabel: edgeData.branchLabel
                      })
                    }
                  }
                })
                
                // 🔧 修复：人工移动后不重新计算位置，只更新分支数据
                console.log('[TaskFlowCanvas] 分流节点移动完成，跳过位置重新计算:', {
                  nodeId: node.id,
                  nodeType: nodeData.type,
                  position: node.getPosition(),
                  protectedNodes: Array.from(connectedNodes)
                })
                
                // 改为只更新分支数据，不触发位置变更
                if (configDrawers.value.structuredLayout.branchLayoutManager.updateNodeBranchData) {
                  const branches = configDrawers.value.structuredLayout.branchLayoutManager.getNodeBranches?.(node) || []
                  configDrawers.value.structuredLayout.branchLayoutManager.updateNodeBranchData(node, branches)
                  console.log('[TaskFlowCanvas] 已更新分支数据，保持当前位置')
                } else {
                  // 如果没有单独的更新方法，则调用原方法但跳过结构化布局
                  configDrawers.value.structuredLayout.branchLayoutManager.updateBranchLayout(node, config, true)
                }
                
                // 确保被保护的节点位置不被改变
                protectedPositions.forEach((position, nodeId) => {
                  const protectedNode = graph.getCellById(nodeId)
                  if (protectedNode && protectedNode.isNode()) {
                    const currentPosition = protectedNode.getPosition()
                    if (currentPosition.x !== position.x || currentPosition.y !== position.y) {
                      console.log('🔧 [TaskFlowCanvas] 恢复被保护节点的位置:', {
                        nodeId: nodeId,
                        originalPosition: position,
                        currentPosition: currentPosition
                      })
                      protectedNode.setPosition(position.x, position.y)
                    }
                  }
                })
              }
              
              // 结束拖拽会话日志记录（仅针对拖拽点）
              if (currentDragSession.value) {
                const sessionData = dragSessionData.value.get(currentDragSession.value)
                if (sessionData) {
                  // 注意：endpoint 相关的拖拽点检查已移除
                }
                
                // 清理拖拽会话数据
                dragSessionData.value.delete(currentDragSession.value)
                currentDragSession.value = null
              }
              
              isDragging.value = false
              dragNodeType.value = null
            }, 100)
        } else {
          // 通用拖拽结束逻辑（针对非分流节点）
          if (currentDragSession.value) {
            const sessionData = dragSessionData.value.get(currentDragSession.value)
            if (sessionData) {
              // 注意：endpoint 相关的拖拽点检查已移除
            }
            
            // 清理拖拽会话数据
            dragSessionData.value.delete(currentDragSession.value)
            currentDragSession.value = null
          }
          
          isDragging.value = false
          dragNodeType.value = null
        }
      }
    }
  });

  // 连接创建事件
  graph.on('edge:connected', ({ edge }) => {
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (sourceNode && targetNode) {
      const connection = {
        id: edge.id,
        source: sourceNode.id,
        target: targetNode.id,
        sourcePort: edge.getSourcePortId(),
        targetPort: edge.getTargetPortId()
      }
      
      // 注意：不需要手动添加到 connections.value，edge:added 事件会自动处理
      emit('connection-created', connection)
    }
  })

  // 注意：edge:removed 事件监听器已在前面定义，这里移除重复的监听器

  // 空白区域点击事件
  graph.on('blank:click', () => {
    selectedNodeId.value = null
    closeNodeSelector()
    closeConfigDrawer()
    showStartNodeConfigDrawer.value = false
    selectedStartNodeData.value = null
  })

  // 键盘删除事件
  graph.on('cell:removed', ({ cell }) => {
    if (cell.isNode()) {
      const cellData = cell.getData() || {}

      // 检查是否是拖拽提示点
      if (cell.id.includes('hint_')) {
        // 拖拽提示点不在nodes数组中，直接返回
        return
      }

      const index = nodes.value.findIndex(n => n.id === cell.id)
      if (index >= 0) {
        const nodeData = nodes.value[index]

        nodes.value.splice(index, 1)

        emit('node-deleted', nodeData)
      }
    } else if (cell.isEdge()) {
      // 边删除处理
    }
  });

  // Vue组件自定义事件监听
  graph.on('vue:delete', ({ node }) => {
    handleNodeDelete({ node })
  })

  graph.on('vue:slot-click', ({ node, data }) => {
    handlePresetSlotClick(data)
  })

  // 端口点击事件 - 显示节点选择器
  graph.on('node:port:click', ({ node, port }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData && port.group === 'out') {
      try {
        // 计算端口的绝对位置
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        const portConfig = node.getPortProp(port.id, 'position') || {}
        
        // 🔧 使用坐标系统管理器进行坐标转换
        const coordinateValidation = coordinateManager.validateCoordinateTransform(node)
        let adjustedNodePosition = { ...nodePosition }
        
        // 如果检测到坐标偏差，进行修正
        if (coordinateValidation && coordinateValidation.difference) {
          adjustedNodePosition.x -= coordinateValidation.difference.x
          adjustedNodePosition.y -= coordinateValidation.difference.y
          
          console.log('🔍 [端口位置计算坐标修正] 检测到坐标偏差:', {
            nodeId: node.id,
            portId: port.id,
            originalPosition: nodePosition,
            coordinateValidation,
            adjustedPosition: adjustedNodePosition
          })
        }
        
        let portX = adjustedNodePosition.x
        let portY = adjustedNodePosition.y
        
        // 根据端口配置计算位置
        if (portConfig.name === 'bottom') {
          const args = portConfig.args || {}
          const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
            parseFloat(args.x) / 100 : 0.5
          portX = adjustedNodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
          portY = adjustedNodePosition.y + nodeSize.height + (args.dy || 0)
        } else if (portConfig.name === 'top') {
          const args = portConfig.args || {}
          const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
            parseFloat(args.x) / 100 : 0.5
          portX = adjustedNodePosition.x + nodeSize.width * xPercent + (args.dx || 0)
          portY = adjustedNodePosition.y + (args.dy || 0)
        } else if (portConfig.name === 'left') {
          const args = portConfig.args || {}
          const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
            parseFloat(args.y) / 100 : 0.5
          portX = adjustedNodePosition.x + (args.dx || 0)
          portY = adjustedNodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
        } else if (portConfig.name === 'right') {
          const args = portConfig.args || {}
          const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
            parseFloat(args.y) / 100 : 0.5
          portX = adjustedNodePosition.x + nodeSize.width + (args.dx || 0)
          portY = adjustedNodePosition.y + nodeSize.height * yPercent + (args.dy || 0)
        }
        
        const portPosition = { x: portX, y: portY }
        const graphPosition = graph.localToGraph(portPosition)
        const clientPosition = graph.graphToClient(graphPosition)

        nodeSelectorPosition.value = {
          x: clientPosition.x,
          y: clientPosition.y
        }
        nodeSelectorSourceNode.value = nodeData
        showNodeSelector.value = true
      } catch (error) {
        console.warn('端口位置计算失败:', error)
        // 降级处理：使用节点中心位置
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        
        // 🔧 在降级处理中也使用坐标系统管理器
        const coordinateValidation = coordinateManager.validateCoordinateTransform(node)
        let centerX = nodePosition.x + nodeSize.width / 2
        let centerY = nodePosition.y + nodeSize.height / 2
        
        // 如果检测到坐标偏差，进行修正
        if (coordinateValidation && coordinateValidation.difference) {
          centerX -= coordinateValidation.difference.x
          centerY -= coordinateValidation.difference.y
        }
        
        const centerPosition = { x: centerX, y: centerY }
        const graphPosition = graph.localToGraph(centerPosition)
        const clientPosition = graph.graphToClient(graphPosition)

        nodeSelectorPosition.value = {
          x: clientPosition.x,
          y: clientPosition.y
        }
        nodeSelectorSourceNode.value = nodeData
        showNodeSelector.value = true
      }
    }
  })

  // 节点配置更新事件 - 同步本地节点数据
  graph.on('node:config-updated', ({ node, nodeType, config }) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === node.id)
    if (nodeIndex >= 0) {
      const nodeData = nodes.value[nodeIndex]

      // 获取图形节点中NodeConfigManager处理后的完整数据
      const graphNodeData = node.getData() || {}
      const processedConfig = graphNodeData.config || config
      
      // 🔧 修复：检查配置更新前后的isConfigured状态
      const beforeIsConfigured = graphNodeData.isConfigured
      console.log(`[TaskFlowCanvas] 节点配置更新事件 - ${nodeType}:`, {
        nodeId: node.id,
        originalConfig: config,
        processedConfig: processedConfig,
        beforeIsConfigured: beforeIsConfigured,
        hasBranches: !!(processedConfig.branches && processedConfig.branches.length > 0)
      })

      // 🔧 修复：确保图形节点的isConfigured状态被正确设置为true
      const updatedGraphNodeData = {
        ...graphNodeData,
        isConfigured: true,
        config: processedConfig,
        lastUpdated: Date.now()
      }
      
      // 更新图形节点数据
      node.setData(updatedGraphNodeData)
      
      // 验证图形节点的isConfigured状态是否正确设置
      const afterGraphNodeData = node.getData() || {}
      console.log(`[TaskFlowCanvas] 图形节点isConfigured状态同步:`, {
        nodeId: node.id,
        nodeType: nodeType,
        beforeIsConfigured: beforeIsConfigured,
        afterIsConfigured: afterGraphNodeData.isConfigured,
        syncSuccess: afterGraphNodeData.isConfigured === true
      })

      // 更新本地节点数据，使用NodeConfigManager处理后的配置
      nodeData.config = processedConfig
      nodeData.data = {
        ...nodeData.data,
        config: processedConfig,
        isConfigured: true,
        lastUpdated: Date.now()
      }

      // 对于分流节点，确保branches数据正确同步
      if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
        if (processedConfig.branches && Array.isArray(processedConfig.branches)) {
          nodeData.branches = processedConfig.branches
          console.log(`[TaskFlowCanvas] 分流节点分支数据已同步:`, {
            nodeId: node.id,
            nodeType: nodeType,
            branchCount: processedConfig.branches.length,
            branches: processedConfig.branches.map(b => ({ id: b.id, name: b.name }))
          })
        } else {
          console.warn(`[TaskFlowCanvas] 分流节点缺少分支数据:`, {
            nodeId: node.id,
            nodeType: nodeType,
            processedConfig: processedConfig
          })
        }
      }
      
      // 🔧 修复：确保本地节点数据和图形节点数据的isConfigured状态保持一致
      console.log(`[TaskFlowCanvas] 节点配置同步完成:`, {
        nodeId: node.id,
        nodeType: nodeType,
        localIsConfigured: nodeData.data.isConfigured,
        graphIsConfigured: afterGraphNodeData.isConfigured,
        dataConsistent: nodeData.data.isConfigured === afterGraphNodeData.isConfigured
      })

      // 🔧 关键修复：手动触发预览线管理器的重新评估
      if (unifiedPreviewLineManager && typeof unifiedPreviewLineManager.handleNodeConfigUpdated === 'function') {
        console.log(`[TaskFlowCanvas] 手动触发预览线管理器重新评估:`, {
          nodeId: node.id,
          nodeType: nodeType,
          managerExists: !!unifiedPreviewLineManager
        })
        
        // 手动调用预览线管理器的配置更新处理方法
        unifiedPreviewLineManager.handleNodeConfigUpdated({ node, nodeType, config: processedConfig })
        
        // 延迟执行以确保配置更新完全完成
        setTimeout(() => {
          forceRegeneratePreviewLines()
        }, 100)
      } else {
        console.warn(`[TaskFlowCanvas] 预览线管理器不可用或方法不存在:`, {
          nodeId: node.id,
          managerExists: !!unifiedPreviewLineManager,
          hasMethod: unifiedPreviewLineManager ? typeof unifiedPreviewLineManager.handleNodeConfigUpdated : 'manager不存在'
        })
      }

      emit('node-updated', nodeData)
    }
  })
}

// 加载初始数据
const loadInitialData = () => {
  console.log('[TaskFlowCanvas] 开始加载初始数据')
  
  // 首先加载所有节点
  if (props.initialNodes.length > 0) {
    console.log('[TaskFlowCanvas] 加载初始节点，数量:', props.initialNodes.length)
    props.initialNodes.forEach(nodeData => {
      addNodeToGraph(nodeData)
    })
    console.log('[TaskFlowCanvas] 所有初始节点加载完成')
  }

  // 等待下一个 tick，确保所有节点都已经添加到图中
  nextTick(() => {
    // 然后加载连接
    if (props.initialConnections.length > 0) {
      console.log('[TaskFlowCanvas] 加载初始连接，数量:', props.initialConnections.length)
      console.log('[TaskFlowCanvas] 初始连接数据详情:', props.initialConnections)
      
      props.initialConnections.forEach((connectionData, index) => {
        // 详细验证连接数据结构
        console.log(`[TaskFlowCanvas] 处理连接 ${index + 1}:`, {
          connectionData,
          hasId: !!connectionData.id,
          hasSource: !!connectionData.source,
          hasTarget: !!connectionData.target,
          sourceType: typeof connectionData.source,
          targetType: typeof connectionData.target
        })
        
        // 检查必要字段
        if (!connectionData.source) {
          console.error(`[TaskFlowCanvas] 连接 ${index + 1} 缺少 source 字段:`, connectionData)
          return
        }
        
        if (!connectionData.target) {
          console.error(`[TaskFlowCanvas] 连接 ${index + 1} 缺少 target 字段:`, connectionData)
          return
        }
        
        // 验证源节点和目标节点是否存在
        const sourceNode = graph.getCellById(connectionData.source)
        const targetNode = graph.getCellById(connectionData.target)
        
        console.log(`[TaskFlowCanvas] 连接 ${index + 1} 节点查找结果:`, {
          sourceNodeId: connectionData.source,
          targetNodeId: connectionData.target,
          sourceNodeFound: !!sourceNode,
          targetNodeFound: !!targetNode,
          allNodesInGraph: graph.getNodes().map(n => ({ id: n.id, type: n.getData()?.type }))
        })
        
        if (sourceNode && targetNode) {
          addConnectionToGraph(connectionData)
        } else {
          console.warn('[TaskFlowCanvas] 跳过连接创建，节点不存在:', {
            connectionId: connectionData.id,
            source: connectionData.source,
            target: connectionData.target,
            sourceExists: !!sourceNode,
            targetExists: !!targetNode
          })
        }
      })
      console.log('[TaskFlowCanvas] 所有初始连接加载完成')
    }

    // 🔧 关键时序修复：在节点和连接都加载完成后，再初始化布局引擎
    console.log('[TaskFlowCanvas] 开始初始化布局引擎（节点已加载）')
    initializeLayoutEngineAfterDataLoad()
  })
}

// 🔧 新增函数：在数据加载完成后初始化布局引擎
const initializeLayoutEngineAfterDataLoad = async () => {
  if (!configDrawers.value?.structuredLayout) {
    console.warn('[TaskFlowCanvas] 结构化布局组件不存在，跳过布局引擎初始化')
    return
  }

  try {
    // 首先初始化布局引擎
    configDrawers.value.structuredLayout.initializeLayoutEngine()
    console.log('[TaskFlowCanvas] 布局引擎初始化完成')

    // 🔧 统一布局只在用户点击按钮时触发，不在此处自动创建布局引擎实例
    console.log('✅ [TaskFlowCanvas] 等待用户手动点击统一布局按钮')

    // 获取初始化后的管理器实例
    const connectionPreviewManager = configDrawers.value.structuredLayout.unifiedPreviewManager
    
    // 初始化全局unifiedPreviewLineManager变量
    if (connectionPreviewManager) {
      unifiedPreviewLineManager = new UnifiedPreviewLineManager(graph)
      // 🔧 关键修复：调用init()方法设置事件监听器
      unifiedPreviewLineManager.init()
      console.log('[TaskFlowCanvas] 全局unifiedPreviewLineManager已初始化并设置事件监听器')
    }

    console.log('[TaskFlowCanvas] 结构化布局组件初始化结果:', {
      layoutEngineStatus: configDrawers.value.structuredLayout.getLayoutEngineStatus?.() || 'unknown',
      unifiedPreviewManager: !!connectionPreviewManager,
      globalUnifiedPreviewLineManager: !!unifiedPreviewLineManager,
      isReady: configDrawers.value.structuredLayout.isReady || false
    })

    if (connectionPreviewManager) {
      console.log('[TaskFlowCanvas] 统一预览线管理器已成功初始化并绑定事件监听器')
      
      // 🔧 修复：设置布局引擎引用到预览线管理器
      const setupLayoutEngineReference = () => {
        const layoutEngine = configDrawers.value.structuredLayout.getLayoutEngine?.()
        console.log('🔍 [TaskFlowCanvas] 获取布局引擎实例:', {
          layoutEngine: !!layoutEngine,
          isNull: layoutEngine === null,
          isUndefined: layoutEngine === undefined,
          type: typeof layoutEngine,
          hasSetMethod: typeof unifiedPreviewLineManager.setLayoutEngine === 'function'
        })
        
        if (layoutEngine && typeof unifiedPreviewLineManager.setLayoutEngine === 'function') {
          unifiedPreviewLineManager.setLayoutEngine(layoutEngine)
          // 布局引擎引用已设置到新的预览线管理器实例
          return true
        } else {
          console.warn('⚠️ [TaskFlowCanvas] 无法设置布局引擎引用:', {
            layoutEngine: !!layoutEngine,
            setLayoutEngineMethod: typeof unifiedPreviewLineManager.setLayoutEngine,
            reason: !layoutEngine ? 'layoutEngine不存在' : 
                    typeof unifiedPreviewLineManager.setLayoutEngine !== 'function' ? 'setLayoutEngine方法不可用' : '未知原因'
          })
          return false
        }
      }
      
      // 🔧 统一布局只在用户点击按钮时触发，不在此处自动创建布局引擎实例
      console.log('✅ [TaskFlowCanvas] 等待用户手动点击统一布局按钮')

      // 🔧 新增：执行数据加载完成后的预览线清理检查
      if (typeof unifiedPreviewLineManager.performLoadCompleteCheck === 'function') {
        unifiedPreviewLineManager.performLoadCompleteCheck()
        // 已触发数据加载完成后的预览线清理检查
      } else {
        console.warn('预览线管理器不支持数据加载完成检查方法')
      }
    } else {
      console.error('[TaskFlowCanvas] 统一预览线管理器初始化失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 布局引擎初始化过程中发生错误:', error)
  }
}

// 汇总日志 - 统计页面中各种元素的数量（仅在开发环境下执行详细统计）
const logCanvasSummary = () => {
  if (!graph) {
    console.warn('[TaskFlowCanvas] 图形实例不存在，无法统计汇总信息')
    return
  }

  // 在生产环境下只输出简要统计
  if (import.meta.env.PROD) {
    const allNodes = graph.getNodes()
    const allEdges = graph.getEdges()
    console.log(`📊 [画布汇总] 节点: ${allNodes.length}, 边: ${allEdges.length}, 数据: nodes(${nodes.value.length}), connections(${connections.value.length})`)
    return {
      nodes: { total: allNodes.length },
      connections: { total: allEdges.length },
      dataArrays: { nodes: nodes.value.length, connections: connections.value.length }
    }
  }

  // 开发环境下执行详细统计
  const allNodes = graph.getNodes()
  const normalNodes = allNodes.filter(node => {
    const nodeData = node.getData()
    return nodeData && nodeData.type !== 'start'
  })
  const startNodes = allNodes.filter(node => {
    const nodeData = node.getData()
    return nodeData && nodeData.type === 'start'
  })
  
  // 统计可拖拽节点（除了开始节点，其他节点都是可拖拽的）
  const draggableNodes = allNodes.filter(node => {
    const nodeData = node.getData()
    return nodeData && nodeData.deletable !== false && nodeData.type !== 'start'
  })

  // 统计连接线数量 - 简化逻辑：有源节点和目标节点的边就是连接线
  const allEdges = graph.getEdges()
  const connectionLines = allEdges.filter(edge => {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    // 连接线：有源节点和目标节点
    return sourceId && targetId
  })

  // 统计预览线数量 - 简化逻辑：有源节点但没有目标节点的边就是预览线
  const previewLines = allEdges.filter(edge => {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    // 预览线：有源节点但没有目标节点
    return sourceId && !targetId
  })

  // 从预览线管理器获取更准确的预览线统计
  let previewLineManagerStats = null
  try {
    const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    if (unifiedPreviewManager && unifiedPreviewManager.previewLines) {
      previewLineManagerStats = {
        totalPreviewInstances: unifiedPreviewManager.previewLines.size,
        activePreviewLines: 0
      }
      
      // 统计活跃的预览线 - 基于简化逻辑
      unifiedPreviewManager.previewLines.forEach((previewInstance, nodeId) => {
        if (Array.isArray(previewInstance)) {
          previewLineManagerStats.activePreviewLines += previewInstance.length
        } else if (previewInstance && previewInstance.line) {
          previewLineManagerStats.activePreviewLines += 1
        }
      })
    }
  } catch (error) {
    console.warn('[TaskFlowCanvas] 获取预览线管理器统计失败:', error)
  }

  // 输出汇总日志
  console.log('📊 [画布汇总统计] ==========================================')
  console.log('📊 [画布汇总统计] 节点统计:')
  console.log(`📊 [画布汇总统计]   - 普通节点: ${normalNodes.length} 个`)
  console.log(`📊 [画布汇总统计]   - 开始节点: ${startNodes.length} 个`)
  console.log(`📊 [画布汇总统计]   - 可拖拽节点: ${draggableNodes.length} 个`)
  console.log(`📊 [画布汇总统计]   - 节点总数: ${allNodes.length} 个`)
  console.log('📊 [画布汇总统计] 连接统计:')
  console.log(`📊 [画布汇总统计]   - 连接线: ${connectionLines.length} 条`)
  console.log(`📊 [画布汇总统计]   - 预览线(图形): ${previewLines.length} 条`)
  
  if (previewLineManagerStats) {
    console.log(`📊 [画布汇总统计]   - 预览线实例: ${previewLineManagerStats.totalPreviewInstances} 个`)
    console.log(`📊 [画布汇总统计]   - 活跃预览线: ${previewLineManagerStats.activePreviewLines} 条`)
  }
  
  console.log(`📊 [画布汇总统计]   - 边总数: ${allEdges.length} 条`)
  console.log('📊 [画布汇总统计] 数据数组统计:')
  console.log(`📊 [画布汇总统计]   - nodes数组: ${nodes.value.length} 个`)
  console.log(`📊 [画布汇总统计]   - connections数组: ${connections.value.length} 个`)
  console.log('📊 [画布汇总统计] ==========================================')

  // 返回统计数据，供其他地方使用
  return {
    nodes: {
      normal: normalNodes.length,
      start: startNodes.length,
      draggable: draggableNodes.length,
      total: allNodes.length
    },
    connections: {
      connectionLines: connectionLines.length,
      previewLines: previewLines.length,
      total: allEdges.length
    },
    dataArrays: {
      nodes: nodes.value.length,
      connections: connections.value.length
    },
    previewLineManager: previewLineManagerStats
  }
}

// 添加开始节点
const addStartNode = () => {
  console.log('[TaskFlowCanvas] 开始添加开始节点')

  const nodeConfig = getNodeConfig('start')
  if (!nodeConfig) {
    console.error('[TaskFlowCanvas] 无法获取开始节点配置')
    return
  }
  console.log('[TaskFlowCanvas] 获取到开始节点配置:', nodeConfig)

  // 使用增强布局管理器添加开始节点（已废弃，改用原生Dagre布局）
  // const result = autoLayout.addNodeWithEnhancedLayout('start', null, {
  //   forceLevel: 0
  // })

  // 直接创建开始节点，不使用已废弃的增强布局
  const startNodeData = {
    id: 'start-node',
    type: 'start',
    label: nodeConfig.label,
    position: { x: 400, y: 100 },
    data: {
      fixed: true,
      level: 0,
      // 🔧 修复：开始节点默认为已配置状态
      isConfigured: true
    },
    config: nodeConfig,
    // 🔧 修复：在顶层也设置isConfigured字段
    isConfigured: true
  }

  console.log('[TaskFlowCanvas] 创建的开始节点数据:', startNodeData)
  addNodeToGraph(startNodeData)

  // 初始化布局管理器的坐标系统（已废弃）
  // autoLayout.initLayoutManager()

  console.log(`[TaskFlowCanvas] 开始节点已添加: ${startNodeData.id}, 层级: 0`)
}

// 添加节点到图中
const addNodeToGraph = (nodeData) => {
  console.log('[TaskFlowCanvas] 开始添加节点到图中:', nodeData.id, nodeData.type)

  if (!graph) {
    console.error('[TaskFlowCanvas] 图形实例不存在')
    return
  }

  const nodeConfig = getNodeConfig(nodeData.type)
  if (!nodeConfig) {
    console.error('[TaskFlowCanvas] 无法获取节点配置:', nodeData.type)
    return
  }

  // 创建端口配置
  const ports = createNodePorts(nodeConfig, nodeData.type)

  // 确保position对象存在
  const position = nodeData.position || { x: 100, y: 100 }
  
  // 准备节点数据，确保config和branches数据正确传递
  const nodeDataForGraph = {
    ...nodeData.data,
    type: nodeData.type,  // 确保节点类型正确设置
    nodeType: nodeData.type,  // 保持兼容性
    label: nodeData.label,
    selected: false,
    deletable: nodeData.type !== 'start',
    level: nodeData.data?.level || 0,
    levelIndex: nodeData.data?.levelIndex || 0,
    // 确保config数据正确传递
    config: nodeData.config || {},
    // 对于分流节点，确保branches数据正确传递
    branches: nodeData.branches || (nodeData.config?.branches) || [],
    // 🔧 修复：正确初始化isConfigured字段
    isConfigured: nodeData.data?.isConfigured !== undefined ? nodeData.data.isConfigured :
                  nodeData.isConfigured !== undefined ? nodeData.isConfigured :
                  // 对于开始节点，默认为已配置
                  nodeData.type === 'start' ? true :
                  // 其他节点默认为未配置，需要用户手动配置
                  false
  }

  // 对于分流节点，添加额外的调试信息
  if (['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)) {
    console.log('[TaskFlowCanvas] 添加分流节点，分支数据:', {
      nodeId: nodeData.id,
      nodeType: nodeData.type,
      configBranches: nodeData.config?.branches,
      directBranches: nodeData.branches,
      finalBranches: nodeDataForGraph.branches
    })
  }
  
  // 创建节点
  const node = graph.addNode({
    id: nodeData.id,
    shape: 'vue-shape',
    x: position.x,
    y: position.y,
    width: nodeConfig.width || 100,
    height: nodeConfig.height || 100,
    ports,
    data: nodeDataForGraph
  })

  console.log('[TaskFlowCanvas] X6节点创建成功，节点数据:', node.getData())

  // 注意：分支节点的端口配置应该在配置确认后进行，而不是在节点创建时
  // 因为此时还没有分支配置信息，端口配置会在 useConfigDrawers.js 的 handleConfigConfirm 中处理

  // 添加到节点列表
  nodes.value.push(nodeData)
  console.log('[TaskFlowCanvas] 节点已添加到nodes数组，当前节点总数:', nodes.value.length)

  // X6会自动触发 node:added 事件，无需手动触发
  // 预览线管理器会自动监听并处理

  // 更新布局统计信息
  updateLayoutStats()

  emit('node-created', nodeData)
}

// 创建节点端口配置
const createNodePorts = (nodeConfig, nodeType) => {
  console.log('[TaskFlowCanvas] 创建端口配置:', { nodeType, nodeConfig })
  
  // 获取当前布局方向
  const layoutDirection = currentLayoutDirection.value || 'TB'
  
  // 使用专门的端口配置工厂
  const portConfig = portConfigFactory.createNodePortConfig(nodeType, nodeConfig)
  
  console.log('[TaskFlowCanvas] 端口配置结果:', { portConfig, layoutDirection })
  
  return portConfig
}

// 添加连接到图中
const addConnectionToGraph = (connectionData) => {
  console.log('🔗 [TaskFlowCanvas] 开始创建连接:', connectionData)
  
  // 详细验证连接数据
  if (!connectionData) {
    console.error('❌ [TaskFlowCanvas] 连接数据为空')
    return
  }
  
  if (!connectionData.source) {
    console.error('❌ [TaskFlowCanvas] 连接数据缺少 source 字段:', connectionData)
    return
  }
  
  if (!connectionData.target) {
    console.error('❌ [TaskFlowCanvas] 连接数据缺少 target 字段:', connectionData)
    return
  }
  
  if (typeof connectionData.source !== 'string' || typeof connectionData.target !== 'string') {
    console.error('❌ [TaskFlowCanvas] source 或 target 字段类型错误:', {
      source: connectionData.source,
      target: connectionData.target,
      sourceType: typeof connectionData.source,
      targetType: typeof connectionData.target
    })
    return
  }
  
  if (!graph) {
    console.error('❌ [TaskFlowCanvas] 图形实例不存在')
    return
  }

  const sourceNode = graph.getCellById(connectionData.source)
  const targetNode = graph.getCellById(connectionData.target)

  console.log('📍 [TaskFlowCanvas] 节点查找结果:', {
    sourceNodeId: connectionData.source,
    targetNodeId: connectionData.target,
    sourceNodeFound: !!sourceNode,
    targetNodeFound: !!targetNode,
    sourceNodeType: sourceNode?.getData()?.nodeType || sourceNode?.getData()?.type,
    targetNodeType: targetNode?.getData()?.nodeType || targetNode?.getData()?.type
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
      sourcePorts: sourcePorts.map(p => ({ id: p.id, group: p.group })),
      targetPorts: targetPorts.map(p => ({ id: p.id, group: p.group }))
    })
    
    // 获取当前布局方向
    const layoutDirection = currentLayoutDirection.value || 'TB'
    
    // 根据布局方向配置连接方向
    const getDynamicDirectionConfig = (layoutDirection) => {
      if (layoutDirection === 'LR') {
        return {
          startDirections: ['right'],
          endDirections: ['left']
        }
      } else {
        return {
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      }
    }
    
    const directionConfig = getDynamicDirectionConfig(layoutDirection)
    
    const edgeConfig = {
      id: connectionData.id,
      source: {
        cell: connectionData.source,
        port: connectionData.sourcePort
      },
      target: {
        cell: connectionData.target,
        port: connectionData.targetPort
      },
      router: {
        name: 'orth',
        args: {
          padding: 20,
          step: 20,
          ...directionConfig
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 使用更可靠的boundary连接点
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
      // 🔧 修复：添加连接线样式配置，确保颜色一致性
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
      zIndex: 0,
      // 添加边数据，包含分支信息
      data: {
        branchId: connectionData.branchId,
        label: connectionData.label,
        branchLabel: connectionData.label, // 确保branchLabel也被设置
        sourceNodeId: connectionData.source,
        targetNodeId: connectionData.target
      }
    }
    
    console.log('⚙️ [TaskFlowCanvas] 连接配置:', edgeConfig)
    
    try {
      const edge = graph.addEdge(edgeConfig)
      
      // 🔧 修复：如果连接有label，设置连线标签（不仅限于分支连接）
      if (connectionData.label) {
        // 使用简化的X6标签格式，确保兼容性
        edge.setLabels([{
          markup: [
            {
              tagName: 'rect',
              selector: 'body'
            },
            {
              tagName: 'text',
              selector: 'label'
            }
          ],
          attrs: {
            label: {
              text: connectionData.label,
              fontSize: 12,
              fill: '#333333',
              textAnchor: 'middle',
              textVerticalAnchor: 'middle'
            },
            body: {
              fill: '#ffffff',
              stroke: '#5F95FF',
              strokeWidth: 1,
              rx: 4,
              ry: 4,
              refWidth: '100%',
              refHeight: '100%',
              refX: '-50%',
              refY: '-50%'
            }
          },
          position: {
            distance: 0.5, // 在连线中点
            offset: 0      // 无偏移
          }
        }])
        
        console.log('🏷️ [TaskFlowCanvas] 为恢复的连接添加标签:', {
          edgeId: edge.id,
          branchId: connectionData.branchId || 'none',
          label: connectionData.label,
          labelType: typeof connectionData.label
        })
      }
      
      console.log('✅ [TaskFlowCanvas] 连接创建成功:', {
        edgeId: edge.id,
        sourceCell: edge.getSourceCellId(),
        sourcePort: edge.getSourcePortId(),
        targetCell: edge.getTargetCellId(),
        targetPort: edge.getTargetPortId(),
        branchId: connectionData.branchId,
        label: connectionData.label
      })
    } catch (error) {
      console.error('❌ [TaskFlowCanvas] 连接创建失败:', error)
    }
  } else {
    console.error('❌ [TaskFlowCanvas] 节点不存在，无法创建连接')
  }
}

// 处理节点类型选择
const handleNodeTypeSelected = (nodeType) => {
  if (!nodeSelectorSourceNode.value) return

  const sourceNode = graph.getCellById(nodeSelectorSourceNode.value.id)
  if (!sourceNode) return

  // 检查源节点的现有连接数量，确保符合连接规则
  const sourceNodeData = sourceNode.getData()
  const existingConnections = connections.value.filter(conn => conn.source === sourceNode.id)

  // 获取源节点配置以确定最大输出数
  const sourceNodeConfig = getNodeConfig(sourceNodeData.nodeType || sourceNodeData.type)
  const maxOutputs = sourceNodeConfig?.maxOutputs || 1

  // 验证连接规则：每个out对应一个in
  if (maxOutputs !== 'dynamic' && existingConnections.length >= maxOutputs) {
    console.warn(`[TaskFlowCanvas] 连接规则限制：节点 ${sourceNode.id} 已达到最大输出连接数 ${maxOutputs}`)
    closeNodeSelector()
    return
  }

  // 计算分支信息
  const branchIndex = existingConnections.length
  const totalBranches = Math.min(maxOutputs === 'dynamic' ? 3 : maxOutputs, branchIndex + 1)

  // 获取源节点的分支信息
  let branchId = null
  let branchLabel = `分支${branchIndex + 1}`
  
  // 如果是分流节点，获取对应的分支ID
  if (['audience-split', 'event-split', 'ab-test'].includes(sourceNodeData.nodeType || sourceNodeData.type)) {
    // 使用统一预览线管理器获取分支信息
    if (unifiedPreviewManager && unifiedPreviewManager.getNodeBranches) {
      const branches = unifiedPreviewManager.getNodeBranches(sourceNode)
      if (branches && branches[branchIndex]) {
        branchId = branches[branchIndex].id
        branchLabel = branches[branchIndex].label
      }
    }
  }

  // 使用增强自动布局添加节点（已废弃，改用原生Dagre布局）
  // const result = autoLayout.addNodeWithEnhancedLayout(nodeType, sourceNode, {
  //   branchIndex,
  //   totalBranches,
  //   connectionLabel: branchLabel
  // })

  // 直接创建节点，不使用已废弃的增强布局
  const newNodeId = `${nodeType}_${Date.now()}`
  const nodeConfig = getNodeConfig(nodeType)
  
  if (!nodeConfig) {
    console.error('[TaskFlowCanvas] 无法获取节点配置:', nodeType)
    return
  }

  // 计算新节点位置（简单的垂直布局）
  const sourcePosition = nodeSelectorSourceNode.value.position || { x: 400, y: 100 }
  const newPosition = {
    x: sourcePosition.x,
    y: sourcePosition.y + 150 // 在源节点下方150px
  }

  const newNodeData = {
    id: newNodeId,
    type: nodeType,
    label: nodeConfig.label,
    position: newPosition,
    data: {
      level: (nodeSelectorSourceNode.value.data?.level || 0) + 1,
      branchIndex,
      totalBranches
    }
    // 注意：不设置config字段，让节点保持未配置状态
    // config字段应该在用户完成配置后才设置
  }

  // 添加节点到图中
  addNodeToGraph(newNodeData)

  // 统一使用'out'端口，从UI层面的同一个位置出发
  let sourcePortId = 'out'

  // 创建连接
  const connection = {
    id: `edge_${Date.now()}`,
    source: nodeSelectorSourceNode.value.id,
    target: newNodeData.id,
    sourcePort: sourcePortId,
    targetPort: 'in',
    branchId: branchId, // 添加分支ID
    label: branchLabel || ''
  }

  addConnectionToGraph(connection)
  // 注意：不需要手动添加到 connections.value，edge:added 事件会自动处理

  console.log(`[TaskFlowCanvas] 节点已添加: ${newNodeData.id}, 层级: ${newNodeData.data.level}, 连接: ${sourcePortId} -> in`)

  // 更新布局统计信息
  updateLayoutStats()

  // 如果是动态端口且需要添加新的输出端口
  if (maxOutputs === 'dynamic' && branchIndex >= 0) {
    addDynamicOutputPort(sourceNode, branchIndex + 2)
  }

  // 关闭节点选择器
  closeNodeSelector()
}

// 为动态端口节点添加新的输出端口
const addDynamicOutputPort = (node, portNumber) => {
  const ports = node.getPorts()
  const newPortId = 'out' // 统一使用'out'端口

  // 检查端口是否已存在
  const existingPort = ports.find(port => port.id === newPortId)
  if (existingPort) return

  // 添加新的输出端口
  node.addPort({
    group: 'out',
    id: newPortId
  })

  console.log(`[TaskFlowCanvas] 为节点 ${node.id} 添加动态输出端口: ${newPortId}`)
}

// 递归获取所有子节点
const getAllChildNodes = (nodeId, visited = new Set()) => {
  // 防止循环引用
  if (visited.has(nodeId)) {
    return []
  }
  visited.add(nodeId)

  const childNodes = []

  console.log(`[TaskFlowCanvas] 查找节点 ${nodeId} 的子节点`)

  // 优先从X6图形库获取连接信息
  if (graph) {
    const node = graph.getCellById(nodeId)
    if (node) {
      const x6OutgoingEdges = graph.getOutgoingEdges(node) || []
      console.log(`[TaskFlowCanvas] X6图形库中找到 ${x6OutgoingEdges.length} 个出边:`, x6OutgoingEdges.map(edge => ({
        id: edge.id,
        source: edge.getSourceCellId(),
        target: edge.getTargetCellId()
      })))

      // 从X6边获取子节点
      for (const edge of x6OutgoingEdges) {
        const targetNodeId = edge.getTargetCellId()

        // 添加直接子节点
        if (targetNodeId && !childNodes.includes(targetNodeId)) {
          childNodes.push(targetNodeId)
          console.log(`[TaskFlowCanvas] 添加子节点: ${targetNodeId}`)
        }

        // 递归获取子节点的子节点
        if (targetNodeId) {
          const grandChildren = getAllChildNodes(targetNodeId, visited)
          for (const grandChild of grandChildren) {
            if (!childNodes.includes(grandChild)) {
              childNodes.push(grandChild)
              console.log(`[TaskFlowCanvas] 添加孙子节点: ${grandChild}`)
            }
          }
        }
      }
    }
  } else {
    // 如果X6图形库不可用，回退到connections.value
    console.log(`[TaskFlowCanvas] X6图形库不可用，使用connections.value`)
    console.log(`[TaskFlowCanvas] 当前连接数据:`, connections.value)

    const outgoingConnections = connections.value.filter(conn => conn.source === nodeId)
    console.log(`[TaskFlowCanvas] 找到 ${outgoingConnections.length} 个出边连接:`, outgoingConnections)

    for (const connection of outgoingConnections) {
      const targetNodeId = connection.target

      // 添加直接子节点
      if (!childNodes.includes(targetNodeId)) {
        childNodes.push(targetNodeId)
        console.log(`[TaskFlowCanvas] 添加子节点: ${targetNodeId}`)
      }

      // 递归获取子节点的子节点
      const grandChildren = getAllChildNodes(targetNodeId, visited)
      for (const grandChild of grandChildren) {
        if (!childNodes.includes(grandChild)) {
          childNodes.push(grandChild)
          console.log(`[TaskFlowCanvas] 添加孙子节点: ${grandChild}`)
        }
      }
    }
  }

  console.log(`[TaskFlowCanvas] 节点 ${nodeId} 的所有子节点:`, childNodes)
  return childNodes
}

// 级联删除节点及其所有子节点
const cascadeDeleteNode = (nodeId) => {
  console.log(`[TaskFlowCanvas] 开始级联删除节点: ${nodeId}`)

  // 获取所有需要删除的子节点
  const childNodes = getAllChildNodes(nodeId)
  console.log(`[TaskFlowCanvas] 找到 ${childNodes.length} 个子节点需要删除:`, childNodes)

  // 按照从叶子节点到根节点的顺序删除（避免删除顺序问题）
  const allNodesToDelete = [...childNodes, nodeId]
  const sortedNodesToDelete = []

  // 先删除没有子节点的节点（叶子节点）
  while (sortedNodesToDelete.length < allNodesToDelete.length) {
    for (const nodeToDelete of allNodesToDelete) {
      if (sortedNodesToDelete.includes(nodeToDelete)) continue

      // 检查这个节点是否还有未删除的子节点
      const remainingChildren = getAllChildNodes(nodeToDelete).filter(child =>
        !sortedNodesToDelete.includes(child)
      )

      // 如果没有未删除的子节点，可以删除这个节点
      if (remainingChildren.length === 0) {
        sortedNodesToDelete.push(nodeToDelete)
      }
    }
  }

  console.log(`[TaskFlowCanvas] 删除顺序:`, sortedNodesToDelete)

  // 按顺序删除节点
  for (const nodeToDeleteId of sortedNodesToDelete) {
    const nodeToDelete = graph.getCellById(nodeToDeleteId)
    if (nodeToDelete) {
      // 调用单个节点删除方法，但跳过级联删除
      handleSingleNodeDelete({ node: nodeToDelete }, false)
    }
  }

  // 级联删除完成后重新布局（已废弃，使用原生Dagre布局）
  // if (autoLayout && typeof autoLayout.relayoutAll === 'function') {
  //   nextTick(() => {
  //     const remainingNodes = graph.getNodes()
  //     const remainingEdges = graph.getEdges()
  //     autoLayout.relayoutAll(remainingNodes, remainingEdges)
  //     console.log('[TaskFlowCanvas] 级联删除后重新布局完成')
  //   })
  // }

  // 🔧 级联删除完成，不再自动执行统一布局
  // 统一布局现在只在用户手动点击"统一布局"按钮时触发
  console.log('[TaskFlowCanvas] 级联删除完成，等待用户手动触发统一布局')

  console.log(`[TaskFlowCanvas] 级联删除完成，共删除 ${sortedNodesToDelete.length} 个节点`)
}

// 处理节点删除
const handleNodeDelete = (data) => {
  const { node } = data

  if (!node || !graph) return

  // 检查是否是开始节点，开始节点不能删除
  const nodeData = node.getData ? node.getData() : node.data
  if (nodeData?.nodeType === 'start' || nodeData?.type === 'start') {
    // 可以显示提示信息
    console.warn('开始节点不能删除')
    return
  }

  // 设置删除状态，防止删除过程中触发节点点击事件
  isDeletingNode.value = true

  const nodeId = node.id

  // 获取所有需要删除的子节点
  const childNodes = getAllChildNodes(nodeId)
  const totalNodesToDelete = childNodes.length + 1 // 包括当前节点

  // 如果有子节点，显示确认对话框
  if (childNodes.length > 0) {
    Modal.confirm({
      title: '确认删除',
      content: `删除此节点将同时删除 ${childNodes.length} 个子节点，共计 ${totalNodesToDelete} 个节点。是否继续？`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        // 执行级联删除
        cascadeDeleteNode(nodeId)
        // 删除完成后重置状态
        setTimeout(() => {
          isDeletingNode.value = false
        }, 100)
      },
      onCancel: () => {
        console.log('[TaskFlowCanvas] 用户取消删除操作')
        // 取消删除时重置状态
        isDeletingNode.value = false
      }
    })
  } else {
    // 没有子节点，直接删除
    cascadeDeleteNode(nodeId)
    // 删除完成后重置状态
    setTimeout(() => {
      isDeletingNode.value = false
    }, 100)
  }
}

// 单个节点删除方法（不进行级联删除）
const handleSingleNodeDelete = (data, shouldCascade = true) => {
  const { node } = data

  if (!node || !graph) return

  // 检查是否是开始节点，开始节点不能删除
  const nodeData = node.getData ? node.getData() : node.data
  if (nodeData?.nodeType === 'start' || nodeData?.type === 'start') {
    console.warn('开始节点不能删除')
    return
  }

  const nodeId = node.id
  console.log(`[TaskFlowCanvas] 开始删除单个节点: ${nodeId}`)

  // 如果需要级联删除，调用级联删除方法
  if (shouldCascade) {
    cascadeDeleteNode(nodeId)
    return
  }

  try {
    console.log(`[TaskFlowCanvas] 开始处理节点删除: ${nodeId}`)
    
    // 1. 获取所有相关的边，包括输入和输出边（在删除之前获取）
    const incomingEdges = graph.getIncomingEdges(nodeId) || []
    const outgoingEdges = graph.getOutgoingEdges(nodeId) || []
    const allRelatedEdges = [...incomingEdges, ...outgoingEdges]

    console.log(`[TaskFlowCanvas] 找到 ${allRelatedEdges.length} 条相关边需要删除`)

    // 2. 在删除边之前，先通知预览线管理器节点即将被删除（传递传入连接信息）
    if (configDrawers.value?.structuredLayout) {
      const previewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()
      
      if (previewManager && typeof previewManager.handleNodeRemoved === 'function') {
        console.log(`[TaskFlowCanvas] 通知预览线管理器节点即将删除: ${nodeId}，传入边数量: ${incomingEdges.length}`)
        // 传递传入连接信息给预览线管理器
        previewManager.handleNodeRemoved({ node }, incomingEdges)
      } else {
        console.warn(`[TaskFlowCanvas] 预览线管理器不存在或handleNodeRemoved方法不可用`)
      }
    } else {
      console.warn(`[TaskFlowCanvas] configDrawers.value.structuredLayout 不存在`)
    }

    // 3. 删除所有相关的边
    allRelatedEdges.forEach(edge => {
      if (edge && graph.hasCell(edge)) {
        console.log(`[TaskFlowCanvas] 删除边: ${edge.id}`)
        graph.removeCell(edge)
      }
    })

    // 4. 从连接数据中删除相关连接
    const deletedConnections = connections.value.filter(conn =>
      conn.source === nodeId || conn.target === nodeId
    )
    connections.value = connections.value.filter(conn =>
      conn.source !== nodeId && conn.target !== nodeId
    )

    // 5. 删除节点本身
    if (graph.hasCell(node)) {
      graph.removeCell(node)
    }

    // 6. 从节点数据中删除
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      const deletedNode = nodes.value[nodeIndex]
      nodes.value.splice(nodeIndex, 1)

      // 触发节点删除事件
      emit('node-deleted', deletedNode)
    }

    // 7. 清理增强布局管理器的坐标系统（已废弃，使用原生Dagre布局）
    // if (autoLayout && typeof autoLayout.removeNodeFromCoordinateSystem === 'function') {
    //   autoLayout.removeNodeFromCoordinateSystem(nodeId)
    // }

    // 8. 更新布局统计信息
    updateLayoutStats()

    // 9. 清除选中状态
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }

    // 10. 关闭配置抽屉（如果正在配置被删除的节点）
    if (selectedNode.value?.id === nodeId) {
      closeConfigDrawer()
    }

    // 11. 刷新剩余节点的预览线（确保删除节点后预览线正确显示）
    if (configDrawers.value?.structuredLayout) {
      const previewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()
      
      if (previewManager && typeof previewManager.refreshAllPreviewLines === 'function') {
        console.log(`[TaskFlowCanvas] 刷新所有预览线以确保正确显示`)
        setTimeout(() => {
          previewManager.refreshAllPreviewLines(true) // 传入true表示是节点删除后的刷新
        }, 100) // 延迟执行，确保节点删除完全完成
      } else if (previewManager) {
        // 如果没有refreshAllPreviewLines方法，手动刷新所有有预览线的节点
        console.log(`[TaskFlowCanvas] 手动刷新预览线`)
        setTimeout(() => {
          const remainingNodes = graph.getNodes()
          remainingNodes.forEach(node => {
            const nodeData = node.getData() || {}
            // 跳过拖拽提示点和预览相关节点
            if (!nodeData.isUnifiedPreview && !nodeData.isPersistentPreview) {
              if (previewManager.previewLines && previewManager.previewLines.has(node.id)) {
                console.log(`[TaskFlowCanvas] 刷新节点 ${node.id} 的预览线`)
                previewManager.updatePreviewLinePosition(node)
              }
            }
          })
        }, 100)
      }
    }

    console.log(`[TaskFlowCanvas] 单个节点 ${nodeId} 删除完成，清理了 ${deletedConnections.length} 个连接`)

  } catch (error) {
    console.error(`[TaskFlowCanvas] 删除节点 ${nodeId} 时发生错误:`, error)
  }
}

// 处理节点数据更新
const handleNodeDataUpdate = (nodeData) => {
  const index = nodes.value.findIndex(n => n.id === nodeData.id)
  if (index >= 0) {
    nodes.value[index] = { ...nodes.value[index], ...nodeData }

    // 更新图中的节点数据
    const graphNode = graph.getCellById(nodeData.id)
    if (graphNode) {
      graphNode.setData({
        ...graphNode.getData(),
        ...nodeData.data
      })
    }

    emit('node-updated', nodeData)
  }

  closeConfigDrawer()
}

// 关闭节点选择器
const closeNodeSelector = () => {
  showNodeSelector.value = false
  nodeSelectorSourceNode.value = null
}

// 关闭配置抽屉
const closeConfigDrawer = () => {
  showConfigDrawer.value = false
}

// 处理抽屉可见性变化
const handleDrawerVisibilityChange = ({ drawerType, visible }) => {
  console.log('[TaskFlowCanvas] 处理抽屉可见性变化:', drawerType, visible)

  if (!visible && configDrawers.value) {
    // 当抽屉关闭时，通过 configDrawers 来关闭对应的抽屉
    console.log('[TaskFlowCanvas] 通过 configDrawers 关闭抽屉:', drawerType)
    configDrawers.value.closeConfigDrawer(drawerType)
  }
}

// 处理配置确认
const handleConfigConfirm = ({ drawerType, config }) => {
  console.log('[TaskFlowCanvas] 接收到配置确认事件:', { drawerType, config })

  if (configDrawers.value && configDrawers.value.handleConfigConfirm) {
    console.log('[TaskFlowCanvas] 调用 configDrawers.handleConfigConfirm')
    configDrawers.value.handleConfigConfirm(drawerType, config)
  } else {
    console.error('[TaskFlowCanvas] configDrawers 或 handleConfigConfirm 方法不存在')
  }
}

// 处理配置取消
const handleConfigCancel = ({ drawerType }) => {
  console.log('[TaskFlowCanvas] 接收到配置取消事件:', { drawerType })

  if (configDrawers.value && configDrawers.value.handleConfigCancel) {
    console.log('[TaskFlowCanvas] 调用 configDrawers.handleConfigCancel')
    configDrawers.value.handleConfigCancel(drawerType)
  } else {
    console.error('[TaskFlowCanvas] configDrawers 或 handleConfigCancel 方法不存在')
  }
}

// 开始节点配置抽屉事件处理
const handleStartNodeConfigConfirm = async (configData) => {
  console.log('[TaskFlowCanvas] 开始节点配置确认:', configData)

  try {
    // 找到开始节点
    const startNodeIndex = nodes.value.findIndex(n => n.type === 'start')
    if (startNodeIndex >= 0) {
      const startNode = nodes.value[startNodeIndex]
      const graphNode = graph.getCellById(startNode.id)

      if (graphNode && configDrawers.value?.nodeConfigManager) {
        // 准备上下文对象
        const context = {
          nodeOperations: {},
          structuredLayout: configDrawers.value.structuredLayout,
          graph: graph
        }

        // 使用统一的节点配置管理器处理配置
        await configDrawers.value.nodeConfigManager.processNodeConfig('start', graphNode, configData, context)

        // 更新本地节点数据，保持与图形节点实例的数据结构一致
        const updatedNodeData = {
          ...startNode,
          config: configData,
          data: {
            ...startNode.data,
            config: configData,
            isConfigured: true,  // 标记为已配置
            lastUpdated: Date.now()
          }
        }

        // 更新 nodes.value 数组中的节点数据（触发响应式更新）
        nodes.value[startNodeIndex] = updatedNodeData

        // 更新图形节点的数据
        graphNode.setData({
          ...graphNode.getData(),
          config: configData,
          isConfigured: true,  // 标记为已配置
          lastUpdated: Date.now()
        })

        console.log('[TaskFlowCanvas] 本地节点数据已更新:', updatedNodeData)

        // 触发节点配置更新事件，让预览线管理器创建预览线
        graph.trigger('node:config-updated', {
          node: graphNode,
          nodeType: 'start',
          config: configData
        })

        emit('node-updated', startNode)
        console.log('[TaskFlowCanvas] 开始节点配置处理完成')
      } else {
        console.error('[TaskFlowCanvas] 图形节点或配置管理器不存在')
      }
    } else {
      console.error('[TaskFlowCanvas] 未找到开始节点')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 开始节点配置处理失败:', error)
  }

  showStartNodeConfigDrawer.value = false
  selectedStartNodeData.value = null
}

// 开始节点配置抽屉取消处理
const handleStartNodeConfigCancel = () => {
  console.log('[TaskFlowCanvas] 开始节点配置取消')
  showStartNodeConfigDrawer.value = false
  selectedStartNodeData.value = null
}

// 工具栏方法
const zoomIn = () => {
  if (panZoomManager) {
    panZoomManager.zoomIn()
    updateCurrentScale()
  } else if (graph) {
    graph.zoom(0.1)
    updateCurrentScale()
  }
}

const zoomOut = () => {
  if (panZoomManager) {
    panZoomManager.zoomOut()
    updateCurrentScale()
  } else if (graph) {
    graph.zoom(-0.1)
    updateCurrentScale()
  }
}

const resetZoom = () => {
  if (panZoomManager) {
    panZoomManager.resetZoom()
    updateCurrentScale()
  } else if (graph) {
    graph.zoom(1, { absolute: true })
    updateCurrentScale()
  }
}

const fitToContent = () => {
  if (panZoomManager) {
    panZoomManager.fitToContent()
    updateCurrentScale()
  } else if (graph) {
    graph.zoomToFit({ padding: 20 })
    updateCurrentScale()
  }
}

const zoomToFit = () => {
  if (panZoomManager) {
    panZoomManager.fitToContent()
    updateCurrentScale()
  } else if (graph) {
    graph.zoomToFit({ padding: 20 })
    updateCurrentScale()
  }
}

// 小地图相关方法
const initMinimap = () => {
  if (!graph || !minimapContainer.value) return
  
  try {
    minimap = new MiniMap({
      container: minimapContainer.value,
      width: 200,
      height: 150,
      padding: 10,
      scalable: false,
      minScale: 0.01,
      maxScale: 16,
    })
    
    graph.use(minimap)
    console.log('[TaskFlowCanvas] 小地图初始化成功')
  } catch (error) {
    console.error('[TaskFlowCanvas] 小地图初始化失败:', error)
  }
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
  if (showMinimap.value && !minimap) {
    nextTick(() => {
      initMinimap()
    })
  }
}

const toggleMinimapCollapse = () => {
  minimapCollapsed.value = !minimapCollapsed.value
}

const closeMinimap = () => {
  showMinimap.value = false
  if (minimap) {
    graph.disposePlugin(minimap)
    minimap = null
  }
}

// 拖拽模式切换方法
const setDragMode = (mode) => {
  if (panZoomManager && typeof panZoomManager.setDragMode === 'function') {
    panZoomManager.setDragMode(mode)
    currentDragMode.value = mode
  } else {
    console.warn('[TaskFlowCanvas] 拖拽管理器不可用，无法切换拖拽模式')
  }
}

// 更新当前缩放比例
const updateCurrentScale = () => {
  if (isUpdatingScale.value) {
    return // 防止递归更新
  }

  try {
    isUpdatingScale.value = true

    let newScale = 1
    if (panZoomManager && typeof panZoomManager.getCurrentScale === 'function') {
      newScale = panZoomManager.getCurrentScale()
    } else if (graph && typeof graph.zoom === 'function') {
      newScale = graph.zoom()
    }

    // 只在值真正改变时更新，避免不必要的响应式触发
    if (Math.abs(currentScale.value - newScale) > 0.001) {
      currentScale.value = newScale
    }
  } catch (error) {
    console.warn('[TaskFlowCanvas] 更新缩放比例失败:', error)
  } finally {
    // 使用 setTimeout 确保在下一个事件循环重置
    setTimeout(() => {
      isUpdatingScale.value = false
    }, 10)
  }
}

// 监听缩放变化
const watchZoomChange = () => {
  if (graph) {
    // 使用防抖避免频繁触发
    let scaleTimeout = null
    let isScaleEventProcessing = false

    graph.on('scale', () => {
      // 防止递归调用
      if (isScaleEventProcessing) {
        return
      }

      if (scaleTimeout) {
        clearTimeout(scaleTimeout)
      }

      scaleTimeout = setTimeout(() => {
        if (!isScaleEventProcessing) {
          isScaleEventProcessing = true
          try {
            updateCurrentScale()
          } finally {
            setTimeout(() => {
              isScaleEventProcessing = false
            }, 50)
          }
        }
      }, 150) // 增加防抖时间
    })
  }
}

// 应用结构化布局
// 强制重置所有布局状态
const forceResetLayoutStates = () => {
  console.log('[TaskFlowCanvas] 强制重置布局状态', {
    isApplyingLayout: isApplyingLayout.value,
    isUpdatingLayout: isUpdatingLayout.value
  })
  isApplyingLayout.value = false
  isUpdatingLayout.value = false
}

// 🎯 应用统一结构化布局
const applyUnifiedStructuredLayout = async () => {
  console.log('[TaskFlowCanvas] 应用统一结构化布局')
  
  if (!configDrawers.value?.structuredLayout) {
    console.error('[TaskFlowCanvas] 结构化布局对象不存在')
    return
  }

  // 检查统一结构化布局方法是否可用
  if (!configDrawers.value.structuredLayout.applyUnifiedStructuredLayout) {
    console.error('[TaskFlowCanvas] 统一结构化布局功能不可用')
    Message.error('统一结构化布局功能不可用')
    return
  }

  try {
    isApplyingLayout.value = true
    
    // 应用统一结构化布局
    const result = await configDrawers.value.structuredLayout.applyUnifiedStructuredLayout(graph)

    if (result && result.success) {
      console.log('[TaskFlowCanvas] 统一结构化布局应用成功:', result)
      Message.success(`统一结构化布局应用成功 (${result.layoutTime.toFixed(2)}ms)`)
      
      // 生成布局总结日志
      generateLayoutSummary()
      
      // 自动缩放到合适大小，限制最大缩放比例为120%
      await nextTick()
      setTimeout(() => {
        // 先执行适应内容缩放
        graph.zoomToFit({ padding: 50 })
        
        // 检查并限制缩放比例
        const currentZoom = graph.zoom()
        if (currentZoom > 1.2) {
          console.log(`[TaskFlowCanvas] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
          graph.zoomTo(1.2, { center: graph.getGraphArea().center })
        }
      }, 300)
    } else {
      console.error('[TaskFlowCanvas] 统一结构化布局应用失败')
      Message.error('统一结构化布局应用失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 统一结构化布局应用异常:', error)
    Message.error('统一结构化布局应用异常: ' + error.message)
  } finally {
    isApplyingLayout.value = false
  }
}

// 生成布局总结日志
const generateLayoutSummary = () => {
  if (!graph) {
    console.warn('[TaskFlowCanvas] 无法生成布局总结：图实例不存在')
    return
  }

  try {
    // 调用useStructuredLayout中的专业分层分析功能
    if (configDrawers.value?.structuredLayout && configDrawers.value.structuredLayout.generateRedrawSummary) {
      console.log('📊 [TaskFlowCanvas] 调用专业分层分析功能...')
      configDrawers.value.structuredLayout.generateRedrawSummary(graph)
    } else {
      console.warn('[TaskFlowCanvas] useStructuredLayout的分层分析功能不可用，使用简化版本')
      
      // 简化版本：仅统计基本信息
      const allNodes = graph.getNodes()
      const allEdges = graph.getEdges()
      
      const businessNodes = allNodes.filter(node => {
        const nodeData = node.getData()
        return !(nodeData?.isUnifiedPreview || nodeData?.isPersistentPreview)
      })
      
      const endpoints = businessNodes.filter(node => {
        const nodeData = node.getData()
        const nodeType = nodeData?.type || nodeData?.nodeType
        return node.id.includes('hint_')
      })
      
      const pureBusinessNodes = businessNodes.filter(node => !endpoints.includes(node))
        
        console.log('📊 [TaskFlowCanvas] 简化布局总结:')
        console.log(`   总节点数: ${allNodes.length}`)
        console.log(`   业务节点数: ${pureBusinessNodes.length}`)
        console.log(`   拖拽点数: ${endpoints.length}`)
      console.log(`   连接线数: ${allEdges.length}`)
    }

  } catch (error) {
    console.error('[TaskFlowCanvas] 生成布局总结失败:', error)
  }
}

// 应用居中对齐
const applyCenterAlignment = async () => {
  console.log('[TaskFlowCanvas] 应用居中对齐')
  
  if (!graph) {
    console.error('[TaskFlowCanvas] 图实例不存在')
    return
  }

  try {
    // 居中内容
    graph.centerContent()
    
    // 适应内容大小
    await nextTick()
    graph.zoomToFit({ padding: 50 })
    
    console.log('[TaskFlowCanvas] 居中对齐完成')
    Message.success('居中对齐完成')
  } catch (error) {
    console.error('[TaskFlowCanvas] 居中对齐失败:', error)
    Message.error('居中对齐失败')
  }
}

const applyStructuredLayout = async () => {
  console.log('[TaskFlowCanvas] 应用结构化布局（统一结构化布局）')
  
  if (!graph) {
    console.error('[TaskFlowCanvas] 图实例不存在，无法应用结构化布局')
    Message.error('图实例不存在，无法应用结构化布局')
    return
  }
  
  if (!configDrawers.value?.structuredLayout) {
    console.error('[TaskFlowCanvas] 结构化布局对象不存在')
    return
  }

  // 检查统一结构化布局方法是否可用
  if (!configDrawers.value.structuredLayout.applyUnifiedStructuredLayout) {
    console.error('[TaskFlowCanvas] 统一结构化布局功能不可用')
    Message.error('统一结构化布局功能不可用')
    return
  }
  
  try {
    isApplyingLayout.value = true
    
    // 应用统一结构化布局
    const result = await configDrawers.value.structuredLayout.applyUnifiedStructuredLayout(graph)

    if (result && result.success) {
      console.log('[TaskFlowCanvas] 统一结构化布局应用成功:', result)
      Message.success(`统一结构化布局应用成功 (${result.layoutTime.toFixed(2)}ms)`)
      
      // 生成布局总结日志
      generateLayoutSummary()
      
      // 自动缩放到合适大小，限制最大缩放比例为120%
      await nextTick()
      setTimeout(() => {
        // 先执行适应内容缩放
        graph.zoomToFit({ padding: 50 })
        
        // 检查并限制缩放比例
        const currentZoom = graph.zoom()
        if (currentZoom > 1.2) {
          console.log(`[TaskFlowCanvas] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
          graph.zoomTo(1.2, { center: graph.getGraphArea().center })
        }
      }, 300)
    } else {
      console.error('[TaskFlowCanvas] 统一结构化布局应用失败')
      Message.error('统一结构化布局应用失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 结构化布局应用失败:', error)
    Message.error('结构化布局应用失败: ' + error.message)
  } finally {
    isApplyingLayout.value = false
  }
}

// 智能布局（直接运行原生dagre布局）
const applySmartLayout = async () => {
  console.log('[TaskFlowCanvas] 应用智能布局（原生Dagre）')
  
  if (!graph) {
    console.error('[TaskFlowCanvas] 图实例不存在，无法应用智能布局')
    Message.error('图实例不存在，无法应用智能布局')
    return
  }
  
  // 🔧 智能布局方法已废弃，统一使用手动触发的统一结构化布局
  console.log('[TaskFlowCanvas] 智能布局方法已废弃，请使用"统一布局"按钮')
  Message.info('请使用"统一布局"按钮进行布局调整')
  isApplyingLayout.value = false
}

const clearCanvas = () => {
  if (graph) {
    isGraphReady.value = false
    graph.clearCells()
    nodes.value = []
    connections.value = []
    selectedNodeId.value = null

    // 清理增强布局管理器的坐标系统（已废弃，使用原生Dagre布局）
    // if (autoLayout && typeof autoLayout.clearEnhancedLayout === 'function') {
    //   autoLayout.clearEnhancedLayout()
    // }

    // 重新添加开始节点
    if (props.autoAddStartNode) {
      addStartNode()
      // 重新设置图形就绪状态
      nextTick(() => {
        isGraphReady.value = true
      })
    }

    console.log('[TaskFlowCanvas] 画布已清理，增强布局系统已重置')
  }
}

const exportData = () => {
  // 检查是否需要开始节点但还没有
  if (props.autoAddStartNode) {
    const hasStartNode = nodes.value.some(node => node.type === 'start')
    if (!hasStartNode) {
      console.log('[TaskFlowCanvas] 导出数据时发现缺少开始节点，立即添加')
      addStartNode()
    }
  }

  // 🔧 修复：同步图形节点的最新配置状态到本地数据
  const syncedNodes = nodes.value.map(nodeData => {
    const graphNode = graph ? graph.getCellById(nodeData.id) : null
    if (graphNode) {
      const graphData = graphNode.getData() || {}
      
      // 确定节点是否已配置
      let isConfigured = false
      
      // 1. 开始节点默认已配置
      if (nodeData.type === 'start') {
        isConfigured = true
      }
      // 2. 检查图形节点数据中的配置状态
      else if (graphData.isConfigured === true) {
        isConfigured = true
      }
      // 3. 检查本地节点数据中的配置状态
      else if (nodeData.data?.isConfigured === true || nodeData.isConfigured === true) {
        isConfigured = true
      }
      // 4. 检查是否有实际配置数据
      else if (graphData.config && Object.keys(graphData.config).length > 0) {
        isConfigured = true
      }
      else if (nodeData.config && Object.keys(nodeData.config).length > 0) {
        isConfigured = true
      }
      
      // 合并配置数据
      const mergedConfig = {
        ...(nodeData.config || {}),
        ...(graphData.config || {})
      }
      
      console.log(`[exportData] 同步节点 ${nodeData.id}:`, {
        type: nodeData.type,
        isConfigured,
        hasGraphConfig: !!(graphData.config && Object.keys(graphData.config).length > 0),
        hasLocalConfig: !!(nodeData.config && Object.keys(nodeData.config).length > 0),
        graphConfigured: graphData.isConfigured,
        localConfigured: nodeData.data?.isConfigured || nodeData.isConfigured
      })
      
      return {
        ...nodeData,
        data: {
          ...nodeData.data,
          isConfigured,
          config: mergedConfig
        },
        config: mergedConfig,
        isConfigured
      }
    }
    
    // 如果没有图形节点，使用本地数据
    const isConfigured = nodeData.type === 'start' || 
                        nodeData.data?.isConfigured === true || 
                        nodeData.isConfigured === true ||
                        (nodeData.config && Object.keys(nodeData.config).length > 0)
    
    console.log(`[exportData] 处理本地节点 ${nodeData.id}:`, {
      type: nodeData.type,
      isConfigured,
      hasConfig: !!(nodeData.config && Object.keys(nodeData.config).length > 0)
    })
    
    return {
      ...nodeData,
      data: {
        ...nodeData.data,
        isConfigured
      },
      isConfigured
    }
  })

  // 注意：预览线不需要保存，它们是动态生成的UI元素
  // 在任务恢复时，预览线会根据节点配置自动重新创建
  const configuredNodes = syncedNodes.filter(n => n.isConfigured === true)
  const unconfiguredNodes = syncedNodes.filter(n => n.isConfigured !== true)
  
  console.log('[TaskFlowCanvas] 导出画布数据:', {
    nodeCount: syncedNodes.length,
    connectionCount: connections.value.length,
    configuredNodes: configuredNodes.length,
    unconfiguredNodes: unconfiguredNodes.length,
    nodeDetails: syncedNodes.map(n => ({
      id: n.id,
      type: n.type,
      isConfigured: n.isConfigured,
      hasConfig: !!(n.config && Object.keys(n.config).length > 0)
    }))
  })
  
  if (unconfiguredNodes.length > 0) {
    console.warn('[TaskFlowCanvas] 发现未配置的节点:', unconfiguredNodes.map(n => ({
      id: n.id,
      type: n.type,
      isConfigured: n.isConfigured
    })))
  }

  return {
    nodes: syncedNodes,
    connections: connections.value
    // 移除 previewLines 字段 - 预览线应该动态生成，不需要持久化
  }
}

// 加载画布数据（用于自动修复后重新渲染）
const loadCanvasData = (data) => {
  if (!graph || !data) return

  try {
    // 清空当前画布
    graph.clearCells()
    
    // 清空当前节点和连接数组
    nodes.value = []
    connections.value = []
    
    // 重新加载节点
    data.nodes.forEach(nodeData => {
      addNodeToGraph(nodeData)
    })
    
    // 重新加载连接
    data.connections.forEach(connectionData => {
      addConnectionToGraph(connectionData)
    })
    
    // 检查是否需要开始节点但还没有
    if (props.autoAddStartNode) {
      const hasStartNode = nodes.value.some(node => node.type === 'start')
      if (!hasStartNode) {
        console.log('[TaskFlowCanvas] 加载数据时发现缺少开始节点，检查原始数据中是否有开始节点配置')
        
        // 检查原始数据中是否有开始节点的配置信息
        const originalStartNode = data.nodes?.find(node => node.type === 'start')
        if (originalStartNode && originalStartNode.config) {
          console.log('[TaskFlowCanvas] 找到原始开始节点配置，使用原始配置重新创建:', originalStartNode.config)
          
          // 使用原始配置信息重新创建开始节点
          const startNodeData = {
            id: 'start-node',
            type: 'start',
            label: originalStartNode.label || '开始',
            position: originalStartNode.position || { x: 400, y: 100 },
            data: {
              ...originalStartNode.data,
              fixed: true,
              level: 0,
              isConfigured: true
            },
            config: originalStartNode.config  // 保持原始配置
          }
          
          addNodeToGraph(startNodeData)
          console.log('[TaskFlowCanvas] 使用原始配置重新创建开始节点完成')
        } else {
          console.log('[TaskFlowCanvas] 未找到原始开始节点配置，创建默认开始节点')
          addStartNode()
        }
      }
    }
    
    // 延迟触发预览线重新生成，确保所有节点和连接都已加载完成
    nextTick(() => {
      setTimeout(() => {
        // 获取所有已配置的节点，为它们重新生成预览线
        nodes.value.forEach(nodeData => {
          const graphNode = graph.getCellById(nodeData.id)
          if (graphNode && nodeData.config) {
            // 检查节点是否已有实际连接（从图中检查，更准确）
            const outgoingEdges = graph.getOutgoingEdges(graphNode) || []
            const realConnections = outgoingEdges.filter(edge => {
              // 排除预览线，只检查真实连接 - 简化逻辑：有源节点和目标节点的边就是真实连接
              const edgeSource = edge.getSourceCellId()
              const edgeTarget = edge.getTargetCellId()
              return edgeSource && edgeTarget
            })
            
            const hasRealConnections = realConnections.length > 0
            
            // 分流节点特殊处理：需要检查每个分支是否有连接
            const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)
            
            // 检查是否需要重新生成预览线
            // 使用智能配置验证逻辑
            const configValidation = validateNodeConfiguration(nodeData, realConnections)
            
            if (configValidation.shouldCreatePreview) {
              // 触发节点配置更新事件，让预览线管理器重新创建预览线
              graph.trigger('node:config-updated', {
                node: graphNode,
                nodeType: nodeData.type,
                config: nodeData.config
              })
            }
          }
        })
        
        // 🔧 修复：在加载完成后删除已有连接的节点的预览线，保留未连接节点的预览线
        // 预览线的作用是引导用户连接，只有已经有真实连接的节点才应该删除预览线
        setTimeout(() => {
          const allEdges = graph.getEdges() || []
          const allNodes = graph.getNodes() || []
          
          // 1. 统计每个节点的真实连接情况
          const nodeConnections = new Map() // nodeId -> { hasOutgoing: boolean, hasIncoming: boolean, branches: Set }
          
          allNodes.forEach(node => {
            nodeConnections.set(node.id, {
              hasOutgoing: false,
              hasIncoming: false,
              branches: new Set()
            })
          })
          
          // 2. 分析真实连接
          const realConnections = []
          const previewLines = []
          
          allEdges.forEach(edge => {
            const edgeData = edge.getData() || {}
            const isPreview = edgeData.isPersistentPreview || 
                             edgeData.isPreview || 
                             edgeData.isUnifiedPreview ||
                             edgeData.type === 'preview-line' ||
                             edgeData.type === 'unified-preview-line' ||
                             edgeData.type === 'draggable-preview'
            
            const edgeSourceId = edge.getSourceCellId()
            const edgeTargetId = edge.getTargetCellId()
            
            // 简化逻辑：根据是否有目标节点来分类
            const isPreviewLine = edgeSourceId && !edgeTargetId
            
            if (isPreviewLine) {
              previewLines.push({
                id: edge.id,
                type: edgeData.type || 'preview-line',
                source: edgeSourceId,
                target: edgeTargetId,
                branchId: edgeData.branchId,
                labels: edge.getLabels()?.length || 0
              })
            } else if (edgeSourceId && edgeTargetId) {
              // 真实连接：有源节点和目标节点
              realConnections.push({
                id: edge.id,
                source: edgeSourceId,
                target: edgeTargetId,
                branchId: edgeData.branchId
              })
              
              // 更新节点连接状态
              if (nodeConnections.has(edgeSourceId)) {
                const sourceConn = nodeConnections.get(edgeSourceId)
                sourceConn.hasOutgoing = true
                if (edgeData.branchId) {
                  sourceConn.branches.add(edgeData.branchId)
                }
              }
              
              if (nodeConnections.has(edgeTargetId)) {
                const targetConn = nodeConnections.get(edgeTargetId)
                targetConn.hasIncoming = true
              }
            }
          })
          
          // 3. 确定需要删除的预览线
          const previewLinesToRemove = []
          
          previewLines.forEach(previewInfo => {
            const sourceConn = nodeConnections.get(previewInfo.source)
            
            if (sourceConn) {
              let shouldRemove = false
              
              if (previewInfo.branchId) {
                // 分支预览线：检查该分支是否已有真实连接
                if (sourceConn.branches.has(previewInfo.branchId)) {
                  shouldRemove = true
                }
              } else {
                // 单一预览线：检查节点是否已有任何出向连接
                if (sourceConn.hasOutgoing) {
                  shouldRemove = true
                }
              }
              
              if (shouldRemove) {
                previewLinesToRemove.push(previewInfo)
              }
            }
          })
          
          // 4. 删除已连接的预览线
          previewLinesToRemove.forEach(previewInfo => {
            const edge = graph.getCellById(previewInfo.id)
            if (edge) {
              graph.removeCell(edge) // 这会同时删除边和它的所有标签
            }
          })
          
          // 5. 保留的预览线统计
          const remainingPreviewLines = previewLines.length - previewLinesToRemove.length
          // 预览线清理完成
          
          // 🔧 预览线清理完成，不再自动执行统一布局
          // 统一布局现在只在用户手动点击"统一布局"按钮时触发
          // 预览线清理完成，等待用户手动触发统一布局
          
        }, 100) // 短暂延迟确保预览线生成完成后再清理
        
        // 🔍 添加详细的加载完成日志
        setTimeout(() => {
          console.log('📊 [TaskFlowCanvas] ===== 加载完成状态检查 =====')
          
          // 1. 统计所有节点
          const allNodes = graph.getNodes() || []
          console.log(`📍 [TaskFlowCanvas] 画布上共有 ${allNodes.length} 个节点:`)
          allNodes.forEach((node, index) => {
            const nodeData = node.getData() || {}
            const nodeType = nodeData.type || 'unknown'
            const nodeId = node.id
            const position = node.getPosition()
            console.log(`  ${index + 1}. 节点ID: ${nodeId}, 类型: ${nodeType}, 位置: (${position.x}, ${position.y})`)
            
            // 如果是分流节点，输出分支信息
            if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
              const branches = nodeData.branches || []
              console.log(`    分支数据: ${branches.length} 个分支`)
              branches.forEach((branch, branchIndex) => {
                console.log(`      分支 ${branchIndex + 1}: ID="${branch.id}", 标签="${branch.label || branch.name || 'unknown'}"`)
              })
            }
          })
          
          // 2. 统计所有连接和预览线
          const allEdges = graph.getEdges() || []
          console.log(`🔗 [TaskFlowCanvas] 画布上共有 ${allEdges.length} 个连接/预览线:`)
          
          let realConnections = 0
          let previewLines = 0
          let labelCount = 0
          
          allEdges.forEach((edge, index) => {
            const edgeData = edge.getData() || {}
            const edgeSourceId = edge.getSourceCellId()
            const edgeTargetId = edge.getTargetCellId()
            const labels = edge.getLabels() || []
            
            // 🔧 改进显示逻辑：对于预览线，显示更有意义的信息
            let displaySourceId = edgeSourceId
            let displayTargetId = edgeTargetId
            
            // 如果是预览线且有sourceNodeId信息，使用它
            if (edgeData.sourceNodeId) {
              displaySourceId = edgeData.sourceNodeId
            }
            
            // 如果target是坐标对象，显示为"坐标"
            if (edgeTargetId === undefined) {
              displayTargetId = '坐标'
            }
            
            // 统一预览线识别逻辑：有源节点但没有目标节点的边就是预览线
            const isPreview = edgeSourceId && !edgeTargetId
            
            if (isPreview) {
              previewLines++
              console.log(`  ${index + 1}. [预览线] ${displaySourceId} -> ${displayTargetId}, 标签数: ${labels.length}`)
            } else {
              realConnections++
              console.log(`  ${index + 1}. [连接线] ${displaySourceId} -> ${displayTargetId}, 分支ID: ${edgeData.branchId || 'none'}, 标签数: ${labels.length}`)
            }
            
            // 统计标签
            labelCount += labels.length
            if (labels.length > 0) {
              labels.forEach((label, labelIndex) => {
                // 🔧 改进标签显示逻辑，优先显示attrs.text.text
                let labelText = 'empty'
                if (label.attrs && label.attrs.text && label.attrs.text.text) {
                  labelText = label.attrs.text.text
                } else if (label.markup) {
                  labelText = label.markup
                } else if (label.text) {
                  labelText = label.text
                }
                console.log(`    标签 ${labelIndex + 1}: "${labelText}", 位置: ${label.position || 0.8}`)
              })
            }
          })
          
          // 3. 统计connections.value数组
          console.log(`📋 [TaskFlowCanvas] connections.value 数组中有 ${connections.value.length} 个连接:`)
          connections.value.forEach((conn, index) => {
            console.log(`  ${index + 1}. ${conn.source} -> ${conn.target}, 分支ID: ${conn.branchId || 'none'}, 标签: "${conn.label || 'none'}"`)
          })
          
          // 4. 汇总统计
          console.log('📈 [TaskFlowCanvas] 汇总统计:')
          console.log(`  - 节点总数: ${allNodes.length}`)
          console.log(`  - 真实连接: ${realConnections}`)
          console.log(`  - 预览线: ${previewLines}`)
          console.log(`  - 标签总数: ${labelCount}`)
          console.log(`  - connections数组: ${connections.value.length}`)
          
          // 5. 检查是否有异常预览线并智能清理
          if (previewLines > 0) {
            console.log(`🔍 [TaskFlowCanvas] 加载完成后检测到 ${previewLines} 条预览线，开始智能验证...`)
            
            // 🎯 智能验证预览线的有效性 - 简化逻辑：有源节点但没有目标节点的边就是预览线
            console.log('🔍 [TaskFlowCanvas] 开始智能验证预览线有效性...')
            const previewEdges = allEdges.filter(edge => {
              const edgeSourceId = edge.getSourceCellId()
              const edgeTargetId = edge.getTargetCellId()
              return edgeSourceId && !edgeTargetId
            })
            
            let invalidCount = 0
            let validCount = 0
            
            previewEdges.forEach(edge => {
              const edgeData = edge.getData() || {};
              // 统一获取源节点ID：优先使用sourceNodeId，否则使用getSourceCellId
              const edgeSourceId = edgeData.sourceNodeId || edge.getSourceCellId();
              const sourceNode = graph.getCellById(edgeSourceId);
              
              // 检查源节点是否存在且有效
              if (!sourceNode) {
                console.log(`🗑️ [TaskFlowCanvas] 清理无效预览线(源节点不存在): ${edge.id}`)
                try {
                  graph.removeCell(edge)
                  invalidCount++
                } catch (error) {
                  console.error(`清理预览线失败: ${edge.id}`, error)
                }
                return
              }
              
              // 检查源节点是否已配置
              const sourceData = sourceNode.getData() || {}
              const nodeType = sourceData.nodeType || sourceData.type
              
              // 🎯 区分分流类节点和普通节点的清理标准
              const isSplitNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
              const isStartNode = nodeType === 'start'
              
              // 🔧 修复：开始节点特殊处理，开始节点默认为已配置
              const isNodeConfigured = sourceData.isConfigured || isStartNode
              
              if (!isNodeConfigured) {
                // 对于分流类节点，如果未配置则清理
                // 对于普通节点，如果未配置也清理
                // 开始节点不会进入此分支，因为isNodeConfigured已经考虑了开始节点的特殊情况
                console.log(`🗑️ [TaskFlowCanvas] 清理无效预览线(源节点未配置): ${edge.id}, 节点类型: ${nodeType}`)
                try {
                  graph.removeCell(edge)
                  invalidCount++
                } catch (error) {
                  console.error(`清理预览线失败: ${edge.id}`, error)
                }
                return
              }
              
  
              
              // 🎯 对于已配置的分流类节点，检查是否有分支配置
              if (isSplitNode && isNodeConfigured) {
                // 分流类节点已配置，保留其预览线（即使目标节点不存在）
                validCount++
                // 保留分流节点预览线
                return
              }
              
              // 🎯 对于开始节点，始终保留预览线
  
              
              // 🎯 对于普通节点，检查目标节点是否存在
              // const targetId = edge.getTargetCellId()
              // const targetNode = graph.getCellById(targetId)
              
              
              // 🎯 默认情况：普通节点的有效预览线，保留
              validCount++
              // 保留有效预览线
            })
            
            // 智能清理完成
            
            // 🎯 如果仍有无效预览线，触发预览线管理器清理
            if (invalidCount > 0 && window.unifiedPreviewLineManager) {
              console.log('🧹 [TaskFlowCanvas] 触发预览线管理器清理无效数据...')
              window.unifiedPreviewLineManager.validateAndCleanupDuplicates()
            }
          }
          
          // 6. 检查预览线数量是否合理
          const configuredNodes = allNodes.filter(node => {
            const nodeData = node.getData() || {}
            return nodeData.isConfigured
          })
          
          if (previewLines > configuredNodes.length) {
            console.log(`🔍 [TaskFlowCanvas] 预览线数量(${previewLines})超过已配置节点数量(${configuredNodes.length})，触发重复检查清理`)
            
            // 🎯 触发预览线管理器的重复检查清理
            if (window.unifiedPreviewLineManager) {
              console.log('🔍 [TaskFlowCanvas] 触发预览线管理器重复检查清理...')
              window.unifiedPreviewLineManager.validateAndCleanupDuplicates()
            }
          } else {
            // 预览线数量在合理范围内
          }
          
          if (labelCount > realConnections + previewLines) {
            console.warn(`⚠️ [TaskFlowCanvas] 标签数量(${labelCount})超过连接总数(${realConnections + previewLines})，可能存在重复标签`)
          }
          
          console.log('📊 [TaskFlowCanvas] ===== 状态检查完成 =====')
        }, 300) // 再延迟200ms确保清理操作完成
        
      }, 200) // 延迟200ms确保所有节点都已完全初始化
    })
    
    console.log('[TaskFlowCanvas] 画布数据已重新加载，预览线将自动重新创建')
  } catch (error) {
    console.error('[TaskFlowCanvas] 加载画布数据失败:', error)
  }
}

// 添加节点方法（兼容性）
const addNode = (nodeType, position) => {
  const nodeConfig = getNodeConfig(nodeType)
  if (!nodeConfig) return

  const newNodeData = {
    id: `node_${Date.now()}`,
    type: nodeType,
    label: nodeConfig.label,
    position: position || { x: 200, y: 200 },
    data: {},
    config: nodeConfig
  }

  addNodeToGraph(newNodeData)
  return newNodeData
}

// 获取画布数据方法（兼容性）
const getCanvasData = () => {
  return exportData()
}

// 获取图形节点
const getGraphNode = (nodeId) => {
  return graph ? graph.getCellById(nodeId) : null
}

// 节点样式缓存
const nodeStyleCache = new Map()
const isCalculatingStyle = ref(false)

// 获取节点覆盖层样式
const getNodeOverlayStyle = (node) => {
  // 首先检查缓存
  const cached = nodeStyleCache.get(node.id)
  if (cached && !isCalculatingStyle.value) {
    return cached
  }

  if (isCalculatingStyle.value) {
    // 如果正在计算样式，返回缓存的样式或默认样式
    if (cached) {
      return cached
    }
    // 返回默认样式避免递归
    const position = node.position || { x: 0, y: 0 }
    const config = node.config || {}
    return {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${config.width || 100}px`,
      height: `${config.height || 100}px`,
      pointerEvents: 'none'
    }
  }

  try {
    isCalculatingStyle.value = true

    if (!isGraphReady.value || !graph || typeof graph.getCellById !== 'function') {
      // 使用节点的原始位置数据
      const position = node.position || { x: 0, y: 0 }
      const config = node.config || {}
      const style = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${config.width || 100}px`,
        height: `${config.height || 100}px`,
        pointerEvents: 'none'
      }
      nodeStyleCache.set(node.id, style)
      return style
    }

    const graphNode = graph.getCellById(node.id)
    if (!graphNode) {
      const position = node.position || { x: 0, y: 0 }
      const config = node.config || {}
      const style = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${config.width || 100}px`,
        height: `${config.height || 100}px`,
        pointerEvents: 'none'
      }
      nodeStyleCache.set(node.id, style)
      return style
    }

    const position = graphNode.getPosition()
    const size = graphNode.getSize()

    const style = {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      pointerEvents: 'none'
    }

    // 缓存样式
    nodeStyleCache.set(node.id, style)
    return style
  } catch (error) {
    console.warn('[TaskFlowCanvas] 计算节点样式失败:', error)
    // 返回默认样式
    const position = node.position || { x: 0, y: 0 }
    const config = node.config || {}
    const defaultStyle = {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${config.width || 100}px`,
      height: `${config.height || 100}px`,
      pointerEvents: 'none'
    }
    nodeStyleCache.set(node.id, defaultStyle)
    return defaultStyle
  } finally {
    // 使用 setTimeout 确保在下一个事件循环重置
    setTimeout(() => {
      isCalculatingStyle.value = false
    }, 5)
  }
}

// 窗口大小变化处理
const handleResize = () => {
  if (graph && canvasContainer.value) {
    graph.resize(
      canvasContainer.value.clientWidth,
      canvasContainer.value.clientHeight
    )
  }
};

// 撤销重做功能
const undo = () => {
  if (!graph) {
    Message.error('画布未初始化，无法撤销')
    return
  }
  
  if (graph.canUndo()) {
    try {
      graph.undo()
    } catch (error) {
      console.error('[撤销功能] 撤销操作执行失败:', error)
      Message.error('撤销操作失败')
    }
  } else {
    Message.warning('没有可撤销的操作')
  }
}

const redo = () => {
  if (!graph) {
    Message.error('画布未初始化，无法重做')
    return
  }
  
  if (graph.canRedo()) {
    try {
      graph.redo()
    } catch (error) {
      console.error('[重做功能] 重做操作执行失败:', error)
      Message.error('重做操作失败')
    }
  } else {
    Message.warning('没有可重做的操作')
  }
}

// 历史面板相关辅助函数
const updateHistoryStack = () => {
  if (!graph || !graph.history) return
  
  try {
    const undoStack = graph.history.undoStack || []
    const redoStack = graph.history.redoStack || []
    
    historyStack.value = {
      undoStack: undoStack.map((command, index) => ({
        ...command,
        timestamp: command.timestamp || Date.now(),
        index
      })),
      redoStack: redoStack.map((command, index) => ({
        ...command,
        timestamp: command.timestamp || Date.now(),
        index
      }))
    }
    
    currentHistoryIndex.value = undoStack.length - 1
  } catch (error) {
    console.error('[历史面板] 更新历史栈失败:', error)
  }
}

const getOperationDescription = (command) => {
  if (!command) return '未知操作'
  
  const { event, data } = command
  
  switch (event) {
    case 'cell:added':
      return data?.cell?.shape === 'vue-shape' ? '添加节点' : '添加元素'
    case 'cell:removed':
      return data?.cell?.shape === 'vue-shape' ? '删除节点' : '删除元素'
    case 'cell:change:position':
      return '移动节点'
    case 'cell:change:size':
      return '调整大小'
    case 'cell:change:attrs':
      return '修改样式'
    case 'edge:connected':
      return '连接节点'
    case 'edge:disconnected':
      return '断开连接'
    default:
      return event ? event.replace('cell:', '').replace(':', ' ') : '操作'
  }
}

const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value
  if (showHistoryPanel.value) {
    updateHistoryStack()
  }
}

const jumpToHistoryState = (targetIndex) => {
  if (!graph || !graph.history) return
  
  try {
    const currentIndex = graph.history.undoStack.length - 1
    const diff = targetIndex - currentIndex
    
    if (diff > 0) {
      // 需要重做
      for (let i = 0; i < diff; i++) {
        if (graph.canRedo()) {
          graph.redo()
        }
      }
    } else if (diff < 0) {
      // 需要撤销
      for (let i = 0; i < Math.abs(diff); i++) {
        if (graph.canUndo()) {
          graph.undo()
        }
      }
    }
    
    updateHistoryStack()
  } catch (error) {
    console.error('[历史面板] 跳转到历史状态失败:', error)
    Message.error('跳转失败')
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleString()
  }
}

// 导出图片功能
const handleExport = (format) => {
  if (!graph) {
    Message.error('画布未初始化')
    return
  }

  try {
    const fileName = `canvas_${new Date().getTime()}`
    
    switch (format) {
      case 'png':
        graph.exportPNG(fileName, {
          backgroundColor: '#f8f9fa',
          padding: 20,
          quality: 1
        })
        Message.success('PNG图片导出成功')
        break
      case 'jpg':
        graph.exportJPEG(fileName, {
          backgroundColor: '#f8f9fa',
          padding: 20,
          quality: 0.9
        })
        Message.success('JPG图片导出成功')
        break
      case 'svg':
        graph.exportSVG(fileName, {
          preserveDimensions: true,
          copyStyles: true,
          serializeImages: true
        })
        Message.success('SVG图片导出成功')
        break
      default:
        Message.error('不支持的导出格式')
    }
  } catch (error) {
    console.error('导出图片失败:', error)
    Message.error('导出图片失败')
  }
}

// 键盘快捷键支持
const handleKeydown = (e) => {
  console.log('[键盘快捷键] 按键事件:', {
    key: e.key,
    metaKey: e.metaKey,
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    target: e.target.tagName
  })
  
  // Mac: Command + Z, Windows: Ctrl + Z
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
    console.log('[键盘快捷键] 检测到撤销快捷键')
    e.preventDefault()
    undo()
  }
  // Mac: Command + Shift + Z, Windows: Ctrl + Y
  else if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) || 
           ((e.ctrlKey) && e.key === 'y')) {
    console.log('[键盘快捷键] 检测到重做快捷键')
    e.preventDefault()
    redo()
  }
}

// 生命周期
onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)

  // 清理小地图
  if (minimap) {
    graph.disposePlugin(minimap)
    minimap = null
  }

  // 销毁拖拽缩放管理器
  if (panZoomManager) {
    panZoomManager.destroy()
    panZoomManager = null
  }

  // 清理连线重叠管理器
  if (edgeOverlapManager) {
    edgeOverlapManager.cleanup()
    edgeOverlapManager = null
  }

  if (graph) {
    graph.dispose()
  }
})
const validateNodeConfiguration = (nodeData, realConnections = []) => {
  // 1. 检查基础配置标志
  const hasConfigFlag = !!nodeData.isConfigured
  
  // 2. 检查实际配置数据
  let hasActualConfig = false
  let configValidationDetails = {}
  
  if (nodeData.config && typeof nodeData.config === 'object') {
    const configKeys = Object.keys(nodeData.config)
    hasActualConfig = configKeys.length > 0
    
    // 对分流节点进行特殊验证
    const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)
    if (isBranchNode) {
      switch (nodeData.type) {
        case 'audience-split':
          configValidationDetails.crowdLayers = nodeData.config.crowdLayers?.length || 0
          hasActualConfig = configValidationDetails.crowdLayers > 0
          break
        case 'event-split':
          configValidationDetails.events = nodeData.config.events?.length || 0
          hasActualConfig = configValidationDetails.events > 0
          break
        case 'ab-test':
          configValidationDetails.testGroups = nodeData.config.testGroups?.length || 0
          hasActualConfig = configValidationDetails.testGroups > 0
          break
      }
    }
  }
  
  // 3. 检查分支数据（即使没有明确配置）
  let hasBranchData = false
  let branchValidationDetails = {}
  
  if (nodeData.branches && Array.isArray(nodeData.branches)) {
    hasBranchData = nodeData.branches.length > 0
    branchValidationDetails = {
      branchCount: nodeData.branches.length,
      branches: nodeData.branches.map(b => ({
        id: b.id,
        label: b.label || b.name,
        hasLabel: !!(b.label || b.name)
      }))
    }
  }
  
  // 4. 特殊节点处理
  const isStartNode = nodeData.type === 'start'
  const hasMeaningfulData = hasActualConfig || hasBranchData || isStartNode
  
  // 5. 检查连接状态
  const hasConnections = realConnections && realConnections.length > 0
  
  // 6. 智能判断逻辑
  let shouldCreatePreview = false
  let validationMethod = 'unknown'
  let reason = '未知原因'
  
  if (hasConnections) {
    // 如果已有连接，需要进一步检查分支节点的分支连接情况
    const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)
    if (isBranchNode) {
      // 统计已连接的分支
      const connectedBranches = new Set()
      realConnections.forEach(edge => {
        const edgeData = edge.getData() || {}
        if (edgeData.branchId) {
          connectedBranches.add(edgeData.branchId)
        }
      })
      
      // 计算期望的分支数量
      let expectedBranches = 2 // 默认分支数
      if (nodeData.type === 'audience-split' && nodeData.config?.crowdLayers) {
        expectedBranches = nodeData.config.crowdLayers.length + 1
      } else if (nodeData.type === 'ab-test' && nodeData.config?.testGroups) {
        expectedBranches = nodeData.config.testGroups.length
      } else if (hasBranchData) {
        expectedBranches = nodeData.branches.length
      }
      
      shouldCreatePreview = connectedBranches.size < expectedBranches
      validationMethod = 'branch-connection-check'
      reason = shouldCreatePreview ? 
        `分支节点有 ${expectedBranches} 个分支，但只连接了 ${connectedBranches.size} 个` :
        `分支节点的所有 ${expectedBranches} 个分支都已连接`
    } else {
      shouldCreatePreview = false
      validationMethod = 'has-connections'
      reason = '非分支节点已有连接'
    }
  } else {
    // 没有连接的情况下，根据配置状态判断
    if (hasConfigFlag && hasActualConfig) {
      shouldCreatePreview = true
      validationMethod = 'config-flag-and-data'
      reason = '节点已配置且有实际配置数据'
    } else if (hasBranchData) {
      shouldCreatePreview = true
      validationMethod = 'branch-data-fallback'
      reason = '节点虽未标记为已配置，但有分支数据'
    } else if (isStartNode) {
      shouldCreatePreview = true
      validationMethod = 'start-node-special'
      reason = '开始节点特殊处理'
    } else if (hasMeaningfulData) {
      shouldCreatePreview = true
      validationMethod = 'meaningful-data'
      reason = '节点有有意义的数据'
    } else {
      shouldCreatePreview = false
      validationMethod = 'no-valid-config'
      reason = '节点未配置且无有效数据'
    }
  }
  
  const result = {
    shouldCreatePreview,
    isConfigured: hasConfigFlag,
    hasActualConfig,
    hasBranchData,
    hasConnections,
    validationMethod,
    reason,
    details: {
      configValidation: configValidationDetails,
      branchValidation: branchValidationDetails,
      connectionCount: realConnections ? realConnections.length : 0
    }
  }
  
  return result
}

// 调试面板相关方法
const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
  if (showDebugPanel.value) {
    updateDebugStats()
  }
}

const closeDebugPanel = () => {
  showDebugPanel.value = false
}

const startDragDebugPanel = (e) => {
  isDraggingDebugPanel.value = true
  const rect = e.target.closest('.debug-panel').getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
  
  const handleMouseMove = (moveEvent) => {
    if (isDraggingDebugPanel.value) {
      debugPanelPosition.value = {
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY
      }
    }
  }
  
  const handleMouseUp = () => {
    isDraggingDebugPanel.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const updateDebugStats = () => {
  if (!graph) {
    debugStats.value = {
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
  if (!debugStats.value) {
    debugStats.value = { loading: false, data: null }
  }
  debugStats.value.loading = true
  
  try {
    const nodes = graph.getNodes()
    const edges = graph.getEdges()
    const issues = []
    
    console.log('[调试统计] 开始统计画布数据...')
    console.log('[调试统计] 画布节点数:', nodes.length)
    console.log('[调试统计] 画布边数:', edges.length)
    
    // 统计节点数
    const nodeCount = nodes.length
    
    // 统计已配置的节点数和详细信息
    let configuredNodeCount = 0
    const nodeDetails = []
    
    nodes.forEach(node => {
      try {
        if (!node || typeof node.getData !== 'function') {
          console.warn('[调试统计] 无效的节点对象:', node)
          return
        }
        
        const nodeData = node.getData() || {}
        const configKeys = nodeData.config ? Object.keys(nodeData.config) : []
        const configSummary = configKeys.length > 0 ? configKeys.slice(0, 3).join(', ') + (configKeys.length > 3 ? '...' : '') : '无配置'
        
        const nodeInfo = {
          id: node.id || 'unknown',
          type: nodeData.type || 'unknown',
          isConfigured: nodeData.isConfigured || false,
          configCount: configKeys.length,
          configSummary: configSummary,
          position: typeof node.getPosition === 'function' ? node.getPosition() : { x: 0, y: 0 },
          size: typeof node.getSize === 'function' ? node.getSize() : { width: 0, height: 0 }
        }
        
        nodeDetails.push(nodeInfo)
        
        if (nodeData.isConfigured) {
          configuredNodeCount++
        }
      } catch (error) {
        console.warn('[调试统计] 处理节点时出错:', error, node)
        issues.push(`节点处理错误: ${error.message}`)
      }
    })
    
    console.log('[调试统计] 节点详情:', nodeDetails.map(n => `${n.id}(${n.type}, 配置:${n.isConfigured}[${n.configCount}项], ${n.configSummary})`).join(', '))
    console.log('[调试统计] 节点详细数据:', nodeDetails)
    
    // 统计连接线详情（严格区分连接和预览线）
    const connectionDetails = []
    let realConnections = 0
    let previewConnections = 0
    let invalidConnections = 0
    
    // 统一的预览线识别函数
    const isPreviewLine = (edge, edgeData, edgeId) => {
      return (
        // 1. 通过边数据属性判断（宽松检查，兼容各种情况）
        edgeData.isPreview || 
        edgeData.isPersistentPreview || 
        edgeData.isUnifiedPreview ||
        // 2. 通过类型判断
        edgeData.type === 'preview-line' ||
        edgeData.type === 'unified-preview-line' ||
        edgeData.type === 'draggable-preview' ||
        // 3. 通过ID模式判断（最重要的识别方式）
        edgeId.includes('preview') ||
        edgeId.includes('unified_preview') ||
        edgeId.startsWith('preview-') ||
        edgeId.startsWith('unified-preview-') ||
        edgeId.startsWith('preview_node_') ||
        // 4. 通过边的样式属性判断（预览线通常有特殊样式）
        (edge.attrs && edge.attrs.line && edge.attrs.line.strokeDasharray)
      )
    }
    
    edges.forEach(edge => {
      try {
        if (!edge || typeof edge.getData !== 'function') {
          console.warn('[调试统计] 无效的边对象:', edge)
          invalidConnections++
          return
        }
        
        const edgeData = edge.getData() || {}
        const edgeId = edge.id || 'unknown'
        
        // 使用统一的预览线识别函数
        const isPreview = isPreviewLine(edge, edgeData, edgeId)
        
        // 调试：记录预览线识别过程
        if (edgeId.includes('unified_preview')) {
          console.log(`[调试统计] 预览线识别: ${edgeId}`, {
            edgeData,
            isPreview,
            checks: {
              isPreview: edgeData.isPreview,
              isPersistentPreview: edgeData.isPersistentPreview,
              isUnifiedPreview: edgeData.isUnifiedPreview,
              type: edgeData.type,
              idIncludes: edgeId.includes('unified_preview')
            }
          })
        }
        
        // 获取源节点和目标节点信息
        const sourceId = typeof edge.getSourceCellId === 'function' ? edge.getSourceCellId() : 'unknown'
        const targetId = typeof edge.getTargetCellId === 'function' ? edge.getTargetCellId() : 'unknown'
        
        // 验证连接的有效性：连接必须有源节点和目标节点
        const hasValidSource = sourceId && sourceId !== 'unknown'
        const hasValidTarget = targetId && targetId !== 'unknown'
        const isValidConnection = hasValidSource && hasValidTarget
        
        // 确定连接类别 - 修复无效连接判断逻辑
        let category = 'invalid'
        if (isPreview) {
          // 预览线单独分类，不参与有效性判断
          category = 'preview'
          previewConnections++
        } else if (isValidConnection) {
          // 真实连接且有效
          category = 'real'
          realConnections++
        } else {
          // 只有非预览线且无效的连接才算作无效连接
          category = 'invalid'
          invalidConnections++
        }
        
        const connectionInfo = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: edgeData.type || 'unknown',
          isPreview: isPreview,
          isValidConnection: isValidConnection,
          category: category,
          branchId: edgeData.branchId,
          label: edgeData.label || edge.getLabels()?.[0]?.attrs?.text?.text
        }
        
        connectionDetails.push(connectionInfo)
        
        // 记录问题连接 - 只有非预览线且无效的连接才是真正的问题
        if (!isValidConnection && !isPreview) {
          console.warn('[调试统计] 发现无效连接:', connectionInfo)
          issues.push(`无效连接: ${edgeId} (源: ${sourceId}, 目标: ${targetId})`)
        } else if (isPreview) {
          console.log('[调试统计] 预览线:', connectionInfo)
        }
      } catch (error) {
        console.warn('[调试统计] 处理边时出错:', error, edge)
        issues.push(`连接线处理错误: ${error.message}`)
        invalidConnections++
      }
    })
    
    // 概念区分说明：
    // 1. 连接(Connection/Real Connection): 真实的节点间连线，表示实际的业务流程路径
    // 2. 预览线(Preview Line): 辅助显示的虚拟连线，用于预览可能的连接路径，不代表实际业务流程
    // 3. 无效连接(Invalid Connection): 缺少源节点或目标节点的连线，通常是数据错误导致
    
    console.log('[调试统计] === 连接线统计详情 ===')
    console.log('[调试统计] 真实连接数(实际业务流程):', realConnections)
    console.log('[调试统计] 预览线数(辅助显示):', previewConnections) 
    console.log('[调试统计] 无效连接数(数据错误):', invalidConnections)
    console.log('[调试统计] 连接分类详情:', connectionDetails.map(c => {
      const sourceNode = nodes.find(n => n.id === c.source)
      const targetNode = nodes.find(n => n.id === c.target)
      const sourceConfigured = sourceNode?.getData()?.isConfigured || false
      const targetConfigured = targetNode?.getData()?.isConfigured || false
      return `${c.id}(${c.category === 'real' ? '真实连接' : c.category === 'preview' ? '预览线' : '无效连接'}, 源配置:${sourceConfigured}, 目标配置:${targetConfigured})`
    }).join(', '))
    console.log('[调试统计] 连接线详情:', connectionDetails)
    
    // 获取预览线统计信息
    let expectedPreviewLines = 0
    let actualPreviewLines = 0
    let expectedConnections = 0
    let previewLineDetails = {}
    
    if (unifiedPreviewLineManager) {
      try {
        // 统计应该存在的预览线数（基于已配置的节点，但需要排除已有连接的部分）
        if (!nodes || !Array.isArray(nodes)) {
          console.warn('[调试统计] 节点数据无效')
          issues.push('节点数据无效')
          return
        }
        
        // 1. 先统计每个节点的真实连接情况
        const nodeConnections = new Map() // nodeId -> { hasOutgoing: boolean, branches: Set, totalBranches: number }
        
        nodes.forEach(node => {
          try {
            const nodeData = node.getData() || {}
            let totalBranches = 1 // 默认单分支
            
            // 根据节点类型计算总分支数
            const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)
            if (isBranchNode && nodeData.config) {
              if (nodeData.type === 'audience-split' && nodeData.config.crowdLayers) {
                totalBranches = nodeData.config.crowdLayers.length + 1
              } else if (nodeData.type === 'ab-test' && nodeData.config.testGroups) {
                totalBranches = nodeData.config.testGroups.length
              } else if (nodeData.branches) {
                totalBranches = nodeData.branches.length
              } else {
                totalBranches = 2 // 默认分支数
              }
            }
            
            nodeConnections.set(node.id, {
              hasOutgoing: false,
              branches: new Set(),
              totalBranches: totalBranches,
              nodeType: nodeData.type,
              isConfigured: nodeData.isConfigured
            })
          } catch (error) {
            console.warn('[调试统计] 初始化节点连接信息时出错:', error, node)
            nodeConnections.set(node.id, {
              hasOutgoing: false,
              branches: new Set(),
              totalBranches: 1,
              nodeType: 'unknown',
              isConfigured: false
            })
          }
        })
        
        // 2. 遍历所有边，统计真实连接
        edges.forEach(edge => {
          try {
            if (!edge || typeof edge.getData !== 'function') return
            
            const edgeData = edge.getData() || {}
            const edgeId = edge.id || 'unknown'
            
            // 使用统一的预览线识别函数
            const isPreview = isPreviewLine(edge, edgeData, edgeId)
            
            // 获取源节点和目标节点信息
            let sourceId = null
            let targetId = null
            
            // 优先从边数据中获取源和目标信息
            if (edgeData.source) {
              sourceId = edgeData.source
            } else if (edgeData.sourceNodeId) {
              sourceId = edgeData.sourceNodeId
            } else if (typeof edge.getSourceCellId === 'function') {
              sourceId = edge.getSourceCellId()
            }
            
            if (edgeData.target) {
              targetId = edgeData.target
            } else if (edgeData.targetNodeId) {
              targetId = edgeData.targetNodeId
            } else if (typeof edge.getTargetCellId === 'function') {
              targetId = edge.getTargetCellId()
            }
            
            // 调试：记录备用方案中的预览线识别
            if (edgeId.includes('unified_preview')) {
              console.log(`[调试统计] 备用方案预览线识别: ${edgeId}`, {
                isPreview,
                sourceId,
                targetId
              })
            }
            
            // 验证连接的有效性：连接必须有源节点和目标节点
            const hasValidSource = sourceId && sourceId !== 'unknown'
            const hasValidTarget = targetId && targetId !== 'unknown'
            const isValidConnection = hasValidSource && hasValidTarget
            
            // 只统计有效的真实连接（非预览线且有效）
            if (!isPreview && isValidConnection) {
              if (nodeConnections.has(sourceId)) {
                const sourceConn = nodeConnections.get(sourceId)
                sourceConn.hasOutgoing = true
                
                // 如果有分支ID，记录该分支已连接
                if (edgeData.branchId) {
                  sourceConn.branches.add(edgeData.branchId)
                }
                
                // 获取源节点和目标节点的配置状态
                const sourceNode = nodes.find(n => n.id === sourceId)
                const targetNode = nodes.find(n => n.id === targetId)
                const sourceConfigured = sourceNode?.getData()?.isConfigured || false
                const targetConfigured = targetNode?.getData()?.isConfigured || false
                const sourceConfig = sourceNode?.getData()?.config ? Object.keys(sourceNode.getData().config).length : 0
                const targetConfig = targetNode?.getData()?.config ? Object.keys(targetNode.getData().config).length : 0
                
                console.log(`[调试统计] 记录真实连接: ${sourceId} -> ${targetId}, 分支ID: ${edgeData.branchId || 'none'}, 边ID: ${edgeId}, 源配置状态: ${sourceConfigured}(${sourceConfig}项), 目标配置状态: ${targetConfigured}(${targetConfig}项)`)
              }
            } else if (!isValidConnection) {
              // 获取源节点的配置状态信息
              const sourceNode = nodes.find(n => n.id === sourceId)
              const sourceConfigured = sourceNode?.getData()?.isConfigured || false
              const sourceConfig = sourceNode?.getData()?.config ? Object.keys(sourceNode.getData().config).length : 0
              const sourceType = sourceNode?.getData()?.type || 'unknown'
              
              console.warn(`[调试统计] 跳过无效连接: ${edgeId} (源: ${sourceId}, 目标: ${targetId}, 源节点类型: ${sourceType}, 源配置状态: ${sourceConfigured}(${sourceConfig}项))`)
            }
          } catch (error) {
            console.warn('[调试统计] 处理边连接统计时出错:', error, edge)
          }
        })
        
        // 3. 基于已配置节点和连接状态计算期望预览线数
        nodes.forEach(node => {
          try {
            if (!node || typeof node.getData !== 'function') {
              console.warn('[调试统计] 跳过无效节点:', node)
              return
            }
            
            const nodeData = node.getData() || {}
            if (nodeData.isConfigured) {
              const nodeConn = nodeConnections.get(node.id)
              if (!nodeConn) return
              
              // 检查节点类型，分支节点可能有多条预览线
              const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)
              
              if (isBranchNode) {
                // 分支节点根据分支数量计算预览线数，但要排除已连接的分支
                let branchCount = 2 // 默认分支数
                if (nodeData.config) {
                  if (nodeData.type === 'audience-split' && nodeData.config.crowdLayers) {
                    branchCount = nodeData.config.crowdLayers.length + 1
                  } else if (nodeData.type === 'ab-test' && nodeData.config.testGroups) {
                    branchCount = nodeData.config.testGroups.length
                  } else if (nodeData.branches) {
                    branchCount = nodeData.branches.length
                  }
                }
                
                // 减去已连接的分支数
                const unconnectedBranches = branchCount - nodeConn.branches.size
                if (unconnectedBranches > 0) {
                  expectedPreviewLines += unconnectedBranches
                  const configKeys = nodeData.config ? Object.keys(nodeData.config) : []
                  const configSummary = configKeys.length > 0 ? `配置项: ${configKeys.join(', ')}` : '无配置数据'
                  console.log(`[调试统计] 分支节点 ${node.id} (${nodeData.type}) 预期预览线数: ${unconnectedBranches} (总分支: ${branchCount}, 已连接: ${nodeConn.branches.size}), 配置状态: ${nodeData.isConfigured}(${configKeys.length}项), ${configSummary}`)
                } else {
                  const configKeys = nodeData.config ? Object.keys(nodeData.config) : []
                  const configSummary = configKeys.length > 0 ? `配置项: ${configKeys.join(', ')}` : '无配置数据'
                  console.log(`[调试统计] 分支节点 ${node.id} (${nodeData.type}) 所有分支已连接，无需预览线, 配置状态: ${nodeData.isConfigured}(${configKeys.length}项), ${configSummary}`)
                }
              } else {
                // 普通节点：如果没有出向连接，则需要1条预览线
                if (!nodeConn.hasOutgoing) {
                  expectedPreviewLines += 1
                  const configKeys = nodeData.config ? Object.keys(nodeData.config) : []
                  const configSummary = configKeys.length > 0 ? `配置项: ${configKeys.join(', ')}` : '无配置数据'
                  console.log(`[调试统计] 普通节点 ${node.id} (${nodeData.type}) 预期预览线数: 1, 配置状态: ${nodeData.isConfigured}(${configKeys.length}项), ${configSummary}`)
                } else {
                  const configKeys = nodeData.config ? Object.keys(nodeData.config) : []
                  const configSummary = configKeys.length > 0 ? `配置项: ${configKeys.join(', ')}` : '无配置数据'
                  console.log(`[调试统计] 普通节点 ${node.id} (${nodeData.type}) 已有连接，无需预览线, 配置状态: ${nodeData.isConfigured}(${configKeys.length}项), ${configSummary}`)
                }
              }
            }
          } catch (error) {
            console.warn('[调试统计] 处理节点预览线统计时出错:', error, node)
            issues.push(`节点预览线统计错误: ${error.message}`)
          }
        })
        
        // 获取实际预览线数和详情 - 优化预览线管理器数据访问方式
        if (unifiedPreviewLineManager) {
          try {
            console.log('[调试统计] 预览线管理器状态:', {
              exists: !!unifiedPreviewLineManager,
              hasGetAllMethod: typeof unifiedPreviewLineManager.getAllPreviewLines === 'function',
              hasGetDataMethod: typeof unifiedPreviewLineManager.getPreviewLineData === 'function',
              hasGetLinesMethod: typeof unifiedPreviewLineManager.getPreviewLines === 'function',
              hasGetActiveMethod: typeof unifiedPreviewLineManager.getActivePreviewLines === 'function',
              hasGetVisibleMethod: typeof unifiedPreviewLineManager.getVisiblePreviewLines === 'function',
              hasDataProperty: !!unifiedPreviewLineManager.data,
              hasLinesProperty: !!unifiedPreviewLineManager.lines,
              hasPreviewLinesProperty: !!unifiedPreviewLineManager.previewLines
            })
            
            let previewLines = null
            let accessMethod = 'none'
            
            // 按优先级尝试多种方法获取预览线数据
            const accessMethods = [
              { method: 'getAllPreviewLines', func: () => unifiedPreviewLineManager.getAllPreviewLines?.() },
              { method: 'getActivePreviewLines', func: () => unifiedPreviewLineManager.getActivePreviewLines?.() },
              { method: 'getVisiblePreviewLines', func: () => unifiedPreviewLineManager.getVisiblePreviewLines?.() },
              { method: 'getPreviewLineData', func: () => unifiedPreviewLineManager.getPreviewLineData?.() },
              { method: 'getPreviewLines', func: () => unifiedPreviewLineManager.getPreviewLines?.() },
              { method: 'data', func: () => unifiedPreviewLineManager.data },
              { method: 'lines', func: () => unifiedPreviewLineManager.lines },
              { method: 'previewLines', func: () => unifiedPreviewLineManager.previewLines }
            ]
            
            for (const { method, func } of accessMethods) {
              try {
                const result = func()
                if (result !== null && result !== undefined) {
                  previewLines = result
                  accessMethod = method
                  console.log(`[调试统计] 通过${method}成功获取数据:`, result)
                  break
                }
              } catch (methodError) {
                console.warn(`[调试统计] 方法${method}调用失败:`, methodError)
              }
            }
            
            console.log(`[调试统计] 预览线管理器数据访问结果: 方法=${accessMethod}, 数据=`, previewLines)
            
            if (previewLines && typeof previewLines === 'object') {
              previewLineDetails = { 
                data: previewLines, 
                accessMethod: accessMethod,
                timestamp: Date.now()
              }
              
              // 更准确的预览线数量计算
              if (Array.isArray(previewLines)) {
                actualPreviewLines = previewLines.length
                console.log(`[调试统计] 数组形式预览线数据，长度: ${actualPreviewLines}`)
              } else if (previewLines && typeof previewLines === 'object') {
                // 如果是对象，统计有效的预览线条目
                const validEntries = Object.entries(previewLines).filter(([key, value]) => {
                  return value && typeof value === 'object' && (value.id || value.nodeId || value.source || value.target)
                })
                actualPreviewLines = validEntries.length
                console.log('[调试统计] 对象形式预览线数据，有效条目:', validEntries.length, '详情:', validEntries)
              } else {
                actualPreviewLines = 0
              }
              
              console.log(`[调试统计] 通过${accessMethod}获取到预览线数据，数量: ${actualPreviewLines}`)
            } else {
              previewLineDetails = { 
                accessMethod: accessMethod, 
                error: '无有效数据',
                timestamp: Date.now()
              }
              actualPreviewLines = 0
              console.warn(`[调试统计] 预览线管理器通过${accessMethod}返回无效数据:`, previewLines)
              issues.push(`预览线管理器返回空数据或无效数据 (访问方法: ${accessMethod})`)
            }
          } catch (error) {
            console.error('[调试统计] 获取预览线数据时出错:', error)
            previewLineDetails = {}
            actualPreviewLines = 0
            issues.push(`预览线数据获取失败: ${error.message}`)
          }
        } else {
          // 备用方案：直接从画布边数据中统计预览线
          console.warn('[调试统计] 预览线管理器不可用，使用备用统计方案')
          
          const canvasPreviewLines = []
          edges.forEach(edge => {
            try {
              if (!edge || typeof edge.getData !== 'function') return
              
              const edgeData = edge.getData() || {}
              const edgeId = edge.id || 'unknown'
              
              // 使用严格一致的预览线识别逻辑
              const isPreview = 
                edgeData.isPreview === true || 
                edgeData.isPersistentPreview === true || 
                edgeData.isUnifiedPreview === true ||
                edgeData.type === 'preview-line' ||
                edgeData.type === 'unified-preview-line' ||
                edgeData.type === 'draggable-preview' ||
                edgeId.includes('preview') ||
                edgeId.includes('unified_preview') ||
                edgeId.startsWith('preview-') ||
                edgeId.startsWith('unified-preview-') ||
                (edge.attrs && edge.attrs.line && edge.attrs.line.strokeDasharray)
              
              if (isPreview) {
                const sourceId = typeof edge.getSourceCellId === 'function' ? edge.getSourceCellId() : null
                const targetId = typeof edge.getTargetCellId === 'function' ? edge.getTargetCellId() : null
                
                canvasPreviewLines.push({
                  id: edgeId,
                  sourceId,
                  targetId,
                  type: edgeData.type,
                  branchId: edgeData.branchId
                })
              }
            } catch (error) {
              console.warn('[调试统计] 统计画布预览线时出错:', error, edge)
            }
          })
          
          previewLineDetails = { canvasPreviewLines }
          actualPreviewLines = canvasPreviewLines.length
          console.log('[调试统计] 从画布统计到预览线:', canvasPreviewLines, '数量:', actualPreviewLines)
          
          if (!unifiedPreviewLineManager) {
            issues.push('预览线管理器未初始化')
          } else {
            issues.push('预览线管理器方法缺失')
          }
        }
        
        console.log('[调试统计] 预览线管理器数据:', previewLineDetails)
        console.log('[调试统计] 期望预览线数:', expectedPreviewLines, '实际预览线数:', actualPreviewLines)
        
        // 期望连接数 = 总节点数 - 1（连接线应该将所有节点连接成一个连通图）
        expectedConnections = Math.max(0, nodeCount - 1)
        
        console.log('[调试统计] 期望连接数计算: 总节点数', nodeCount, '- 1 =', expectedConnections)
        
      } catch (error) {
        console.error('[调试统计] 获取预览线统计信息失败:', error)
        issues.push(`预览线统计失败: ${error.message}`)
        // 设置默认值以防止界面崩溃
        expectedPreviewLines = 0
        actualPreviewLines = 0
        previewLineDetails = {}
      }
    } else {
      issues.push('统一预览线管理器未初始化')
    }
    
    // 检查问题
    if (actualPreviewLines < expectedPreviewLines) {
      issues.push(`预览线不完整: 期望${expectedPreviewLines}条，实际${actualPreviewLines}条`)
    }
    
    if (configuredNodeCount === 0 && nodeCount > 0) {
      issues.push('存在未配置的节点')
    }
    
    debugStats.value = {
      loading: false,
      data: {
        nodeCount,
        configuredNodeCount,
        expectedPreviewLines,
        actualPreviewLines,
        expectedConnections,
        actualConnections: realConnections,
        issues,
        // 详细信息用于调试
        nodeDetails,
        connectionDetails,
        previewLineDetails
      }
    }
    
    console.log('[调试统计] 统计完成:', debugStats.value.data)
    
  } catch (error) {
    console.error('[调试统计] 统计失败:', error)
    debugStats.value = {
      loading: false,
      data: {
        nodeCount: 0,
        configuredNodeCount: 0,
        expectedPreviewLines: 0,
        actualPreviewLines: 0,
        expectedConnections: 0,
        actualConnections: 0,
        issues: [`统计失败: ${error.message}`]
      }
    }
  }
}

// 预览线有效性检查方法
const checkPreviewLineValidity = async () => {
  // 先运行有效性检查
  runPreviewLineValidityCheck()
  
  // 如果发现预览线不完整，提供重新生成选项
  if (debugStats.value && debugStats.value.data && debugStats.value.data.expectedPreviewLines > debugStats.value.data.actualPreviewLines) {
    const shouldRegenerate = await new Promise((resolve) => {
      Modal.confirm({
        title: '发现预览线不完整',
        content: `应该存在 ${debugStats.value.data.expectedPreviewLines} 条预览线，但实际只有 ${debugStats.value.data.actualPreviewLines} 条。是否要重新生成预览线？`,
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })
    
    if (shouldRegenerate) {
      await triggerPreviewLineGeneration()
    }
  }
}

// 触发预览线生成方法
const triggerPreviewLineGeneration = async () => {
  if (!unifiedPreviewLineManager) {
    console.error('[预览线生成] 统一预览线管理器未初始化')
    Message.error('预览线管理器未初始化，无法生成预览线')
    return
  }
  
  isGeneratingPreviewLines.value = true
  
  try {
    console.log('[预览线生成] 开始触发预览线生成...')
    
    // 调用统一预览线管理器的触发方法
    const result = unifiedPreviewLineManager.triggerPreviewLineGeneration()
    
    console.log('[预览线生成] 生成完成:', result)
    
    // 更新调试统计信息
    updateDebugStats()
    
    // 显示成功消息
    const successCount = result.success ? result.success.length : 0
    const failedCount = result.failed ? result.failed.length : 0
    const skippedCount = result.skipped ? result.skipped.length : 0
    
    Message.success(`预览线生成完成！成功: ${successCount} 条，失败: ${failedCount} 条，跳过: ${skippedCount} 条`)
    
    // 在预览线属性中添加触发生成的函数和动作信息
    if (result && result.success && result.success.length > 0) {
      try {
        const allPreviewLines = unifiedPreviewLineManager.getAllPreviewLines()
        
        if (!allPreviewLines) {
          console.warn('[预览线生成] 无法获取预览线列表')
          return
        }
        
        result.success.forEach(item => {
          if (!item || !item.nodeId) {
            console.warn('[预览线生成] 无效的成功项:', item)
            return
          }
          
          // 查找对应节点的预览线
          const nodePreviewLines = Array.isArray(allPreviewLines) ? 
            allPreviewLines.filter(line => 
              line && line.sourceNode && line.sourceNode.id === item.nodeId
            ) : []
          
          nodePreviewLines.forEach(previewLine => {
            if (!previewLine) {
              console.warn('[预览线生成] 无效的预览线对象')
              return
            }
            // 添加触发生成的函数和动作信息到预览线属性中
            previewLine.triggerInfo = {
              triggerFunction: 'triggerPreviewLineGeneration',
              triggerAction: 'manual_generation',
              triggeredAt: new Date().toISOString(),
              triggeredBy: 'debug_panel',
              nodeId: item.nodeId,
              branchCount: item.branchCount || 0,
              previewType: item.previewType || 'unknown',
              branchId: previewLine.branchId || null,
              branchLabel: previewLine.branchLabel || null
            }
          })
        })
        
        console.log(`🎯 [预览线生成] 触发信息添加完成，共处理 ${result.success.length} 个节点的预览线`)
        
      } catch (error) {
        console.error('添加触发信息失败:', error)
      }
    }
    
  } catch (error) {
    console.error('[预览线生成] 生成失败:', error)
    Message.error('预览线生成失败: ' + error.message)
  } finally {
    isGeneratingPreviewLines.value = false
  }
}

const runPreviewLineValidityCheck = () => {
  updateDebugStats()
  
  if (!debugStats.value?.data) {
    console.error('[预览线有效性检查] 调试统计数据不可用')
    return
  }
  
  const data = debugStats.value.data
  
  // 输出详细的检查结果到控制台
  console.group('[预览线有效性检查] 详细统计结果')
  console.log('节点统计:', {
    总节点数: data.nodeCount,
    已配置节点数: data.configuredNodeCount,
    配置率: data.nodeCount > 0 ? `${((data.configuredNodeCount / data.nodeCount) * 100).toFixed(1)}%` : '0%'
  })
  
  console.log('预览线统计:', {
    应该存在的预览线数: data.expectedPreviewLines,
    实际预览线数: data.actualPreviewLines,
    预览线完整率: data.expectedPreviewLines > 0 ? 
      `${((data.actualPreviewLines / data.expectedPreviewLines) * 100).toFixed(1)}%` : '0%'
  })
  
  console.log('连接线统计:', {
      应该存在的总连线数: data.expectedConnections,
      实际连接线数: data.actualConnections,
      实际预览线数: data.actualPreviewLines,
      实际总连线数: data.actualConnections + data.actualPreviewLines,
      连线完整率: data.expectedConnections > 0 ? 
        `${(((data.actualConnections + data.actualPreviewLines) / data.expectedConnections) * 100).toFixed(1)}%` : '0%'
    })
  
  // 输出详细的节点信息
  if (data.nodeDetails && data.nodeDetails.length > 0) {
    console.log('节点详细信息:')
    data.nodeDetails.forEach((node, index) => {
      console.log(`  ${index + 1}. 节点 ${node.id}:`, {
        类型: node.type,
        已配置: node.isConfigured ? '是' : '否',
        位置: `(${node.position.x}, ${node.position.y})`,
        尺寸: `${node.size.width}x${node.size.height}`
      })
    })
  }
  
  // 输出详细的连接线信息
  if (data.connectionDetails && data.connectionDetails.length > 0) {
    console.log('连接线详细信息:')
    data.connectionDetails.forEach((conn, index) => {
      console.log(`  ${index + 1}. 连接 ${conn.id}:`, {
        源节点: conn.source,
        目标节点: conn.target,
        类型: conn.type,
        是否预览线: conn.isPreview ? '是' : '否',
        分支ID: conn.branchId || '无'
      })
    })
  }
  
  // 输出预览线管理器详情
  if (data.previewLineDetails && Object.keys(data.previewLineDetails).length > 0) {
    console.log('预览线管理器详情:')
    Object.entries(data.previewLineDetails).forEach(([key, value]) => {
      console.log(`  预览线 ${key}:`, value)
    })
  }
  
  // 输出发现的问题
  if (data.issues && data.issues.length > 0) {
    console.warn('发现的问题:')
    data.issues.forEach((issue, index) => {
      console.warn(`  ${index + 1}. ${issue}`)
    })
  } else {
    console.log('✅ 未发现问题')
  }
  
  console.groupEnd()
  
  // 显示检查完成消息
  Message.success('预览线有效性检查完成，详细结果请查看控制台')
}

/**
 * 强制重新生成预览线
 * 用于在节点配置状态更新后重新生成预览线
 */
const forceRegeneratePreviewLines = () => {
  if (unifiedPreviewLineManager && typeof unifiedPreviewLineManager.forceRegeneratePreviewLines === 'function') {
    try {
      console.log('🔄 [调试统计] 开始强制重新生成预览线...')
      
      // 在重新生成前检查节点状态
      const nodes = graph.getNodes()
      console.log('🔍 [调试统计] 重新生成前节点状态检查:', {
        totalNodes: nodes.length,
        configuredNodes: nodes.filter(node => {
          const nodeData = node.getData() || {}
          return nodeData.isConfigured === true
        }).length
      })
      
      // 特别检查分支节点
      const branchNodes = nodes.filter(node => {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || nodeData.nodeType
        return ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
      })
      
      branchNodes.forEach(node => {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || nodeData.nodeType
        
        console.log('🌿 [调试统计] 分支节点重新生成前状态:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: nodeData.isConfigured,
          configKeys: Object.keys(nodeData.config || {}),
          shouldCreate: unifiedPreviewLineManager.shouldCreatePreviewLine(node),
          hasExistingPreview: unifiedPreviewLineManager.previewLines.has(node.id),
          existingPreviewType: unifiedPreviewLineManager.previewLines.has(node.id) ? 
            (Array.isArray(unifiedPreviewLineManager.previewLines.get(node.id)) ? 'branch' : 'single') : 'none'
        })
      })
      
      // 执行重新生成
      const result = unifiedPreviewLineManager.forceRegeneratePreviewLines()
      console.log('🔄 [调试统计] 强制重新生成预览线结果:', result)
      
      // 重新生成后再次检查分支节点
      branchNodes.forEach(node => {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || nodeData.nodeType
        
        console.log('🌿 [调试统计] 分支节点重新生成后状态:', {
          nodeId: node.id,
          nodeType: nodeType,
          hasPreviewAfter: unifiedPreviewLineManager.previewLines.has(node.id),
          previewTypeAfter: unifiedPreviewLineManager.previewLines.has(node.id) ? 
            (Array.isArray(unifiedPreviewLineManager.previewLines.get(node.id)) ? 'branch' : 'single') : 'none',
          previewCountAfter: unifiedPreviewLineManager.previewLines.has(node.id) ? 
            (Array.isArray(unifiedPreviewLineManager.previewLines.get(node.id)) ? 
              unifiedPreviewLineManager.previewLines.get(node.id).length : 1) : 0
        })
        
        // 如果分支节点仍然没有预览线，尝试手动创建
        if (nodeData.isConfigured && !unifiedPreviewLineManager.previewLines.has(node.id)) {
          console.log('🔧 [调试统计] 尝试手动创建分支节点预览线:', node.id)
          try {
            const createResult = unifiedPreviewLineManager.createUnifiedPreviewLine(node)
            console.log('✅ [调试统计] 手动创建预览线结果:', {
              nodeId: node.id,
              success: !!createResult,
              result: createResult,
              type: Array.isArray(createResult) ? 'branch' : (createResult ? 'single' : 'null')
            })
          } catch (error) {
            console.error('❌ [调试统计] 手动创建预览线失败:', {
              nodeId: node.id,
              error: error.message,
              stack: error.stack
            })
          }
        }
      })
      
      // 更新调试统计
      updateDebugStats()
      
      Message.success('预览线已重新生成')
    } catch (error) {
      console.error('预览线重新生成失败:', error)
      Message.error('预览线重新生成失败')
    }
  } else {
    console.warn('预览线管理器未初始化或方法不存在')
    Message.warning('预览线管理器未就绪')
  }
}

// 暴露方法
defineExpose({
  addNode,
  getCanvasData,
  loadCanvasData,
  clearCanvas,
  exportData,
  zoomIn,
  zoomOut,
  zoomToFit,
  resetZoom,
  setDragMode,
  currentDragMode,
  undo,
  redo,
  handleExport,
  applySmartLayout,
  applyUnifiedStructuredLayout, // 🎯 新增：统一结构化布局方法
  forceRegeneratePreviewLines, // 强制重新生成预览线方法
  // 暴露graph实例用于坐标转换
  graph: computed(() => graph)
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

.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* X6 样式覆盖 */
:deep(.x6-widget-selection-box) {
  border: 2px solid #5F95FF;
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

/* 缩放按钮样式优化 */
.canvas-toolbar .arco-btn-group .arco-btn {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.canvas-toolbar .arco-btn-group .arco-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 缩放比例显示样式 */
.canvas-toolbar .arco-btn-group .arco-btn:has(.zoom-percentage) {
  min-width: 80px;
  font-weight: 500;
}

/* 拖拽模式按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[type="primary"] {
  background: linear-gradient(135deg, #5F95FF, #4080FF);
  border-color: #5F95FF;
  color: white;
  font-weight: 600;
}

.canvas-toolbar .arco-btn-group .arco-btn[type="primary"]:hover {
  background: linear-gradient(135deg, #4080FF, #3366FF);
  border-color: #4080FF;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(95, 149, 255, 0.3);
}

/* 拖拽模式按钮图标样式 */
.canvas-toolbar .arco-btn-group .arco-btn .arco-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 小地图样式 */
.minimap-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.minimap-container.collapsed .minimap-content {
  height: 0;
  opacity: 0;
}

.minimap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(95, 149, 255, 0.1);
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.minimap-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.minimap-controls {
  display: flex;
  gap: 4px;
}

.minimap-controls .arco-btn {
  padding: 2px 4px;
  min-width: auto;
  height: 20px;
  font-size: 12px;
}

.minimap-content {
  padding: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.minimap-content > div {
  border-radius: 4px;
  overflow: hidden;
}

/* 小地图内部样式覆盖 */
:deep(.x6-widget-minimap) {
  border: none !important;
  border-radius: 4px;
}

:deep(.x6-widget-minimap-viewport) {
  border: 2px solid #5F95FF !important;
  border-radius: 2px;
}

:deep(.x6-widget-minimap-viewport-zoom) {
  border: 2px solid #ff6b6b !important;
}

/* 历史面板样式 */
.history-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 20;
  width: 300px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(95, 149, 255, 0.1);
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-content {
  max-height: 450px;
  overflow-y: auto;
}

.history-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: #666;
}

.history-stat {
  font-weight: 500;
}

.history-list {
  padding: 8px 0;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.history-item:hover {
  background: rgba(95, 149, 255, 0.05);
  border-left-color: rgba(95, 149, 255, 0.3);
}

.history-item-current {
  background: rgba(95, 149, 255, 0.1);
  border-left-color: #5F95FF;
}

.history-item-current:hover {
  background: rgba(95, 149, 255, 0.15);
}

.history-item-redo {
  opacity: 0.6;
}

.history-item-redo:hover {
  opacity: 0.8;
  background: rgba(255, 193, 7, 0.05);
  border-left-color: rgba(255, 193, 7, 0.3);
}

.history-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(95, 149, 255, 0.1);
  color: #5F95FF;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.history-item-current .history-item-icon {
  background: #5F95FF;
  color: white;
}

.history-item-redo .history-item-icon {
  background: rgba(255, 193, 7, 0.1);
  color: #ff9800;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  word-break: break-word;
}

.history-item-time {
  font-size: 11px;
  color: #999;
}

.history-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin: 4px 0;
  font-size: 11px;
  color: #999;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.history-divider span {
  background: white;
  padding: 0 8px;
}
/* 调试面板样式 */
.debug-panel {
  position: fixed;
  z-index: 1000;
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(95, 149, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
}

.debug-panel:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.debug-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(95, 149, 255, 0.1), rgba(64, 128, 255, 0.1));
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  cursor: move;
  font-weight: 600;
  color: #333;
}

.debug-panel-header:hover {
  background: linear-gradient(135deg, rgba(95, 149, 255, 0.15), rgba(64, 128, 255, 0.15));
}

.debug-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.debug-panel-title .arco-icon {
  color: #5F95FF;
  font-size: 16px;
}

.debug-panel-close {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.debug-panel-close:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4f;
}

.debug-panel-content {
  padding: 16px;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.debug-section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(135deg, #5F95FF, #4080FF);
  border-radius: 2px;
}

.debug-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.debug-stat-item {
  background: rgba(95, 149, 255, 0.05);
  border: 1px solid rgba(95, 149, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.debug-stat-item:hover {
  background: rgba(95, 149, 255, 0.08);
  border-color: rgba(95, 149, 255, 0.2);
  transform: translateY(-1px);
}

.debug-stat-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.debug-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.debug-stat-value.highlight {
  color: #5F95FF;
}

.debug-stat-value.warning {
  color: #ff7d00;
}

.debug-stat-value.error {
  color: #ff4d4f;
}

.debug-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.debug-action-btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.debug-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(95, 149, 255, 0.3);
}

.debug-panel.dragging {
  cursor: move;
  transform: rotate(1deg);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

/* 调试面板动画 */
.debug-panel-enter-active,
.debug-panel-leave-active {
  transition: all 0.3s ease;
}

.debug-panel-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.debug-panel-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .debug-panel {
    width: 300px;
    font-size: 12px;
  }
  
  .debug-stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .debug-stat-value {
    font-size: 16px;
  }
}

</style>
