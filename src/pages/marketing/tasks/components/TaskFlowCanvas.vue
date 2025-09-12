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
      </a-button-group>
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

import CanvasPanZoomManager from '../../../../utils/CanvasPanZoomManager.js'
import { nodeConfigManager } from '../../../../utils/NodeConfigManager.js'
import { registerCustomShapes } from '../../../../utils/x6Config.js'
import { createBranchConnectionConfig, validateConnectionConfig } from '../../../../utils/connectionConfigFactory.js'
import { connectionErrorHandler, logger } from '../../../../utils/enhancedErrorHandler.js'
import portConfigFactory from '../../../../utils/portConfigFactory.js'
import { coordinateManager } from '../../../../utils/CoordinateSystemManager.js'
import EdgeOverlapManager from '../../../../utils/EdgeOverlapManager.js'
import { dragSnapLogger, startNodeDragLogging, endNodeDragLogging } from '../../../../utils/DragSnapLogger.js'
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
  IconRight
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
  'connection-created'
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

// 节点操作管理器
let nodeOperations = null

// 布局方向状态管理
const currentLayoutDirection = computed(() => {
  return configDrawers.value?.structuredLayout?.layoutDirection?.value || 'TB'
})

// 布局方向切换处理函数
const handleLayoutDirectionChange = async (direction) => {
  // console.log(`[TaskFlowCanvas] 切换布局方向: ${direction}`)
  
  if (!configDrawers.value?.structuredLayout?.switchLayoutDirection) {
    // console.error('[TaskFlowCanvas] 布局方向切换功能不可用')
    Message.error('布局方向切换功能不可用')
    return
  }

  try {
    isApplyingLayout.value = true
    const result = await configDrawers.value.structuredLayout.switchLayoutDirection(direction)
    
    if (result && result.success) {
      // console.log(`[TaskFlowCanvas] 布局方向切换成功: ${direction}`)
      Message.success(`布局方向已切换为${direction === 'TB' ? '从上到下' : '从左到右'}`)
      
      // 更新连线重叠管理器的布局方向
      if (edgeOverlapManager && edgeOverlapManager.updateLayoutDirection) {
        edgeOverlapManager.updateLayoutDirection(direction)
        // console.log(`[TaskFlowCanvas] 连线重叠管理器布局方向已更新: ${direction}`)
      }
      
      // 自动缩放到合适大小
      await nextTick()
      setTimeout(() => {
        graph.zoomToFit({ padding: 50 })
        
        // 检查并限制缩放比例
        const currentZoom = graph.zoom()
        if (currentZoom > 1.2) {
          // console.log(`[TaskFlowCanvas] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
          graph.zoomTo(1.2, { center: graph.getGraphArea().center })
        }
      }, 300)
    } else {
      // console.error('[TaskFlowCanvas] 布局方向切换失败')
      Message.error('布局方向切换失败')
    }
  } catch (error) {
    // console.error('[TaskFlowCanvas] 布局方向切换异常:', error)
    Message.error('布局方向切换异常: ' + error.message)
  } finally {
    isApplyingLayout.value = false
  }
}

// 手动更新统计信息的函数
const updateLayoutStats = () => {
  if (isUpdatingLayout.value) {
    // console.log('[TaskFlowCanvas] 统计信息更新正在进行中，跳过')
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
    // console.warn('[TaskFlowCanvas] 获取布局统计信息失败:', error)
    layoutStats.value = null
  } finally {
    // 立即重置状态，不使用异步
    isUpdatingLayout.value = false
  }
}

// 初始化画布
// 全局初始化标志，防止重复初始化
let isCanvasInitialized = false
let initializationAttempts = 0 // 🔧 新增：初始化尝试次数计数器
const MAX_INIT_ATTEMPTS = 3 // 🔧 新增：最大初始化尝试次数

const initCanvas = async () => {
  // 🔧 修复：严格的初始化状态检查，防止循环调用
  if (isCanvasInitialized && graph) {
    console.log('[TaskFlowCanvas] 画布已初始化且图形实例存在，跳过重复初始化')
    return
  }

  // 🔧 修复：检查初始化尝试次数，防止无限循环
  if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
    console.error('[TaskFlowCanvas] 初始化尝试次数超限，停止初始化以防止循环调用')
    return
  }

  initializationAttempts++
  console.log(`[TaskFlowCanvas] 开始初始化画布 (第${initializationAttempts}次尝试)`)
  
  await nextTick()

  if (!canvasContainer.value) {
    console.error('[TaskFlowCanvas] 画布容器不存在')
    initializationAttempts-- // 重置计数器
    return
  }

  const containerWidth = canvasContainer.value.clientWidth
  const containerHeight = canvasContainer.value.clientHeight
  
  console.log('[TaskFlowCanvas] 画布容器尺寸:', {
    width: containerWidth,
    height: containerHeight,
    offsetWidth: canvasContainer.value.offsetWidth,
    offsetHeight: canvasContainer.value.offsetHeight,
    scrollWidth: canvasContainer.value.scrollWidth,
    scrollHeight: canvasContainer.value.scrollHeight
  })
  
  // 🔧 修复：检查容器尺寸，但不再递归调用initCanvas
  if (containerWidth === 0 || containerHeight === 0) {
    console.error('[TaskFlowCanvas] 画布容器尺寸无效，宽度或高度为0')
    initializationAttempts-- // 重置计数器
    
    // 🔧 修复：使用Promise延迟而不是递归调用，避免循环
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      console.log('[TaskFlowCanvas] 容器尺寸无效，等待DOM更新后重试')
      await new Promise(resolve => setTimeout(resolve, 200))
      return initCanvas() // 使用return避免继续执行
    } else {
      console.error('[TaskFlowCanvas] 容器尺寸持续无效，停止初始化')
      return
    }
  }

  // 🔧 修复ResizeObserver问题：在创建新图形实例前，确保清理旧实例
  if (graph) {
    console.log('[TaskFlowCanvas] 检测到现有图形实例，正在清理以避免ResizeObserver冲突')
    try {
      // 移除所有事件监听器
      graph.off()
      // 销毁图形实例，这会清理内部的ResizeObserver
      graph.dispose()
      graph = null
      console.log('[TaskFlowCanvas] 旧图形实例已清理')
    } catch (error) {
      console.error('[TaskFlowCanvas] 清理旧图形实例时出错:', error)
      graph = null // 强制重置
    }
  }

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

  // console.log('[TaskFlowCanvas] X6图形实例创建成功')
  
  // 🔧 调试用：立即将graph实例暴露到window对象，便于浏览器调试
  if (typeof window !== 'undefined') {
    window.graph = graph
    console.log('🔍 [TaskFlowCanvas] 图形实例已暴露到window.graph，可在浏览器控制台调试')
  }

  // 初始化插件
  // console.log('[TaskFlowCanvas] 开始初始化插件')
  
  // 初始化导出插件
  graph.use(new Export())
  // console.log('[TaskFlowCanvas] 导出插件初始化完成')
  
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
  // console.log('[TaskFlowCanvas] 历史记录插件初始化完成，已启用操作过滤')
  // console.log('[TaskFlowCanvas] 历史记录插件配置:', {
  //   enabled: historyPlugin.options.enabled,
  //   ignoreAdd: historyPlugin.options.ignoreAdd,
  //   ignoreRemove: historyPlugin.options.ignoreRemove,
  //   ignoreChange: historyPlugin.options.ignoreChange,
  //   hasBeforeAddCommand: !!historyPlugin.options.beforeAddCommand
  // })
  
  // 初始化对齐线插件
  graph.use(new Snapline({
    enabled: true,
    sharp: true,
    resizing: true,
    clean: 1000
  }))
  // console.log('[TaskFlowCanvas] 对齐线插件初始化完成')

  // 监听历史记录变化
  graph.on('history:change', () => {
    const canUndoValue = graph.canUndo()
    const canRedoValue = graph.canRedo()
    canUndo.value = canUndoValue
    canRedo.value = canRedoValue
    
    // 更新历史栈信息
    updateHistoryStack()
    
    // console.log('[历史记录] 状态变化:', {
    //   canUndo: canUndoValue,
    //   canRedo: canRedoValue,
    //   undoStackLength: graph.history?.undoStack?.length || 0,
    //   redoStackLength: graph.history?.redoStack?.length || 0
    // })
  })

  // 监听命令添加事件
  graph.on('history:command:added', (args) => {
    const { command } = args
    // console.log('[历史记录] 命令添加:', {
    //   event: command.event,
    //   cellId: command.data?.cell?.id,
    //   timestamp: Date.now()
    // })
    updateHistoryStack()
  })

  // 监听撤销事件
  graph.on('history:undo', (args) => {
    const { command } = args
    const description = getOperationDescription(command)
    Message.success(`已撤销: ${description}`)
    // console.log('[历史记录] 撤销操作:', description)
    updateHistoryStack()
  })

  // 监听重做事件
  graph.on('history:redo', (args) => {
    const { command } = args
    const description = getOperationDescription(command)
    Message.success(`已重做: ${description}`)
    // console.log('[历史记录] 重做操作:', description)
    updateHistoryStack()
  })

  // 监听其他可能影响历史记录的事件
  graph.on('cell:added', (args) => {
    // console.log('[历史记录] 节点/边添加:', args.cell.id)
  })
  
  graph.on('cell:removed', (args) => {
    // console.log('[历史记录] 节点/边删除:', args.cell.id)
  })
  
  graph.on('cell:changed', (args) => {
    // console.log('[历史记录] 节点/边变化:', args.cell.id, args.options)
  })

  // console.log('[TaskFlowCanvas] 所有插件初始化完成')
  
  // 检查历史记录插件状态
  setTimeout(() => {
    // console.log('[历史记录] 插件状态检查:', {
    //   historyExists: !!graph.history,
    //   canUndo: graph.canUndo(),
    //   canRedo: graph.canRedo(),
    //   undoStackLength: graph.history?.undoStack?.length || 0,
    //   redoStackLength: graph.history?.redoStack?.length || 0,
    //   historyEnabled: graph.history?.options?.enabled
    // })
  }, 1000)

  // 输出画布配置调试信息
  // console.log('⚙️ [TaskFlowCanvas] 画布配置信息:', {
  //   scroller: {
  //     enabled: true,
  //     pannable: false, // 已禁用X6内置拖拽
  //     modifiers: ['ctrl']
  //   },
  //   interacting: {
  //     nodeMovable: !props.readonly
  //   },
  //   readonly: props.readonly
  // })

  // 检查scroller是否正确启用
  const scrollerEnabled = graph.scroller && graph.scroller.options.enabled
  const scrollerPannable = graph.scroller && graph.scroller.options.pannable
  // console.log('🔍 [TaskFlowCanvas] Scroller状态检查:', {
  //   scrollerExists: !!graph.scroller,
  //   scrollerEnabled,
  //   scrollerPannable,
  //   scrollerOptions: graph.scroller ? graph.scroller.options : null
  // })

  // 注册自定义边形状
  registerCustomShapes(Graph)
  // console.log('[TaskFlowCanvas] 自定义边形状注册完成')

  // 🔧 初始化坐标系统管理器
  coordinateManager.setGraph(graph)
  coordinateManager.setDebugMode(process.env.NODE_ENV === 'development')
  // console.log('[TaskFlowCanvas] 坐标系统管理器初始化完成')

  // 初始化配置抽屉管理器（只初始化一次）
  if (!configDrawers.value) {
    // 🔧 修复：使用组件级别的nodeOperations变量
    nodeOperations = {}
    configDrawers.value = useConfigDrawers(() => graph, nodeOperations)
    // console.log('[TaskFlowCanvas] 配置抽屉管理器初始化完成')
    
    // 添加全局调试标记
    window.TASK_FLOW_DEBUG = true
    console.log('🎯 [TaskFlowCanvas] 画布初始化完成，开启调试模式')
    
    // 加载测试脚本
    if (import.meta.env.DEV) {
      const script = document.createElement('script')
      script.src = '/test-preview-line.js'
      script.onload = () => {
        console.log('📝 [TaskFlowCanvas] 预览线测试脚本已加载')
      }
      document.head.appendChild(script)
    }
    
    // 延迟设置全局预览线管理器引用到数据加载完成后
    console.log('[TaskFlowCanvas] 跳过初始化时的全局预览线管理器设置，将在数据加载后设置')
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

  console.log('[TaskFlowCanvas] 画布初始化完成，当前节点数:', nodes.value.length)

  // 🔧 新增：画布加载后的状态检查
  performCanvasLoadCheck()

  // 设置图形实例就绪状态
  await nextTick()
  isGraphReady.value = true
  
  // 设置初始化完成标志
  isCanvasInitialized = true
  
  console.log('[TaskFlowCanvas] 图形实例已就绪，自动布局已启用')

  // 🔧 新增：画布初始化完成后的详细状态检查日志
  console.log('✅ [TaskFlowCanvas] 画布初始化完成 - 状态检查:', {
    timestamp: new Date().toISOString(),
    canvasInitialized: isCanvasInitialized,
    graphReady: isGraphReady.value,
    graphExists: !!graph,
    configDrawersExists: !!configDrawers.value,
    panZoomManagerExists: !!panZoomManager,
    edgeOverlapManagerExists: !!edgeOverlapManager,
    nodesCount: nodes.value.length,
    connectionsCount: connections.value.length,
    containerSize: {
      width: canvasContainer.value?.clientWidth || 0,
      height: canvasContainer.value?.clientHeight || 0
    },
    layoutEngineInitialized: layoutEngineInitialized,
    unifiedPreviewManagerExists: !!window.unifiedPreviewLineManager
  })

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
      
      // console.log('🎯 [TaskFlowCanvas] 画布容器调试事件监听器已添加（冒泡阶段）')
    }
  }

  // 节点点击事件 - 选择节点并打开配置抽屉
  graph.on('node:click', ({ node }) => {
    // 检查是否正在删除节点，如果是则忽略点击事件
    if (isDeletingNode.value) {
      // console.log('[TaskFlowCanvas] 正在删除节点，忽略点击事件:', node.id)
      return
    }
    
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      selectedNodeId.value = node.id
      emit('node-selected', nodeData)

      // console.log('[TaskFlowCanvas] 节点被点击:', nodeData.type, nodeData.id)

      // 只读模式下不打开配置抽屉
      if (props.readonly) {
        // console.log('[TaskFlowCanvas] 只读模式，不打开配置抽屉')
        return
      }

      // 从图形节点实例中获取最新的配置数据
      const graphNodeData = node.getData() || {}
      const latestConfig = graphNodeData.config || {}

      // console.log('[TaskFlowCanvas] 从图形节点获取最新配置:', latestConfig)

      if (nodeData.type === 'start') {
        // 开始节点打开专用配置抽屉
        // 构造完整的节点数据结构，确保包含最新的配置信息
        const completeNodeData = {
          ...nodeData,
          config: latestConfig || nodeData.config || {}
        }
        selectedStartNodeData.value = completeNodeData
        showStartNodeConfigDrawer.value = true
        // console.log('[TaskFlowCanvas] 打开开始节点配置抽屉，节点数据:', completeNodeData)
      } else if (['audience-split', 'event-split', 'ai-call', 'sms', 'manual-call', 'ab-test', 'wait'].includes(nodeData.type)) {
        // 使用专门的配置抽屉
        // console.log('[TaskFlowCanvas] 调用configDrawers.openConfigDrawer:', nodeData.type)
        if (configDrawers.value && typeof configDrawers.value.openConfigDrawer === 'function') {
          // 构造正确的数据结构，包含config属性
          const drawerData = {
            ...nodeData,
            config: latestConfig,
            nodeId: node.id,
            nodeType: nodeData.type
          }
          // console.log('[TaskFlowCanvas] 传递给抽屉的数据结构:', drawerData)
          configDrawers.value.openConfigDrawer(nodeData.type, node, drawerData)
        } else {
          console.error('[TaskFlowCanvas] configDrawers.value 或 openConfigDrawer 方法不存在')
        }
      } else {
        // 其他节点打开通用配置抽屉
        showConfigDrawer.value = true
        // console.log('[TaskFlowCanvas] 打开通用配置抽屉')
      }
    }
  })

  // 节点拖拽开始事件
  graph.on('node:move', ({ node }) => {
    isDragging.value = true
    const nodeData = node.getData() || {}
    dragNodeType.value = nodeData.type || 'unknown'
    
    // 只对endpoint启动吸附日志记录
    if (nodeData.isEndpoint || nodeData.type === 'endpoint') {
      const position = node.getPosition()
      currentDragSession.value = startNodeDragLogging(node, position)
      
      // 记录拖拽会话数据
      dragSessionData.value.set(currentDragSession.value, {
        startTime: Date.now(),
        node: node,
        startPosition: { ...position },
        nearestNodes: [] // 将在拖拽过程中收集
      })
    }
  })

  // 连接添加事件 - 确保连接数据同步到 connections 数组
  graph.on('edge:added', ({ edge }) => {
    // 过滤掉预览线，只处理真正的连接
    const edgeId = edge.id
    if (edgeId.includes('preview') || edgeId.includes('unified_preview')) {
      // console.log('🔍 [TaskFlowCanvas] 跳过预览线，不添加到连接数组:', edgeId)
      return
    }
    
    // 验证边的源和目标是否为有效的节点ID
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    
    // 检查是否是临时连线（拖拽过程中的连线，targetId 为 undefined）
    if (!targetId) {
      // console.log('🔍 [TaskFlowCanvas] 跳过临时连线（拖拽中），不添加到连接数组:', {
      //   edgeId,
      //   sourceId,
      //   targetId
      // })
      return
    }
    
    if (!sourceId || !targetId) {
      // console.warn('⚠️ [TaskFlowCanvas] 边缺少有效的源或目标节点ID，跳过添加:', {
      //   edgeId,
      //   sourceId,
      //   targetId
      // })
      return
    }
    
    // 验证源和目标是否为字符串类型的节点ID
    if (typeof sourceId !== 'string' || typeof targetId !== 'string') {
      // console.warn('⚠️ [TaskFlowCanvas] 边的源或目标不是有效的节点ID，跳过添加:', {
      //   edgeId,
      //   sourceId,
      //   targetId,
      //   sourceType: typeof sourceId,
      //   targetType: typeof targetId
      // })
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
      // console.log('✅ [TaskFlowCanvas] 连接已添加到数据数组:', connectionData)
    } else {
      // console.log('🔍 [TaskFlowCanvas] 连接已存在，跳过重复添加:', connectionData.id)
    }
  })

  // 连接删除事件 - 确保连接数据从 connections 数组中移除
  graph.on('edge:removed', ({ edge }) => {
    const edgeId = edge.id
    
    // 过滤掉预览线，只处理真正的连接
    if (edgeId.includes('preview') || edgeId.includes('unified_preview')) {
      // console.log('🔍 [TaskFlowCanvas] 跳过预览线删除，不从连接数组中移除:', edgeId)
      return
    }
    
    const index = connections.value.findIndex(conn => conn.id === edgeId)
    if (index !== -1) {
      const removedConnection = connections.value.splice(index, 1)[0]
      // console.log('✅ [TaskFlowCanvas] 连接已从数据数组中移除:', removedConnection)
    } else {
      // console.log('🔍 [TaskFlowCanvas] 连接不在数据数组中，无需移除:', edgeId)
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
    
    // 只对endpoint进行坐标修正和吸附相关的日志记录
    const isEndpoint = nodeData.isEndpoint || nodeData.type === 'endpoint'
    
    // 🔧 修复：为普通节点添加预览线实时更新
    if (!isEndpoint) {
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.immediateUpdatePosition === 'function') {
        try {
          // 立即更新预览线位置，确保拖拽时实时跟随
          unifiedPreviewManager.immediateUpdatePosition(node)
        } catch (error) {
          console.error('❌ [预览线跟随] 节点移动时预览线更新失败:', {
            nodeId: node.id,
            error: error.message,
            stack: error.stack
          })
        }
      } else {
        console.warn('⚠️ [预览线跟随] 预览线管理器不可用:', {
          nodeId: node.id,
          hasManager: !!unifiedPreviewManager,
          hasMethod: !!(unifiedPreviewManager && typeof unifiedPreviewManager.immediateUpdatePosition === 'function'),
          configDrawers: !!configDrawers.value,
          structuredLayout: !!configDrawers.value?.structuredLayout
        })
      }
    }
    
    if (isEndpoint) {
      // 通过坐标管理器验证和修正坐标
      const coordinateValidation = coordinateManager.validateCoordinateTransform(node)
      if (coordinateValidation && coordinateValidation.difference && currentDragSession.value) {
        // 记录坐标修正信息到拖拽会话（不立即输出）
        dragSnapLogger.logProcess(currentDragSession.value, 'coordinate_correction', {
          nodeId: node.id,
          rawPosition,
          coordinateValidation
        })
      }
    }
    
    // 计算节点中心点（使用修正后的坐标）
    const centerX = rawPosition.x + size.width / 2
    const centerY = rawPosition.y + size.height / 2

    // 在节点拖拽过程中触发吸附逻辑
    const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
      // 调用统一预览线管理器的吸附高亮逻辑
      unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)
      
      // 🔧 添加预览线终点吸附检查
      if (typeof unifiedPreviewManager.checkSnapToPreviewLines === 'function') {
        unifiedPreviewManager.checkSnapToPreviewLines(node, rawPosition, size)
      }

      // 同时检测是否接近预览线的endpoint
      const endpoints = ((graph && graph.getNodes ? graph.getNodes() : []) || []).filter(n => {
        const data = n && n.getData ? n.getData() : {}
        return data.isEndpoint || data.type === 'endpoint'
      })

      // 只对endpoint收集附近的节点信息（用于最终日志）
      if (isEndpoint && currentDragSession.value) {
        const sessionData = dragSessionData.value.get(currentDragSession.value)
        if (sessionData) {
          // 更新附近节点信息
          const nearbyNodes = []
          
          // 检查普通节点
          const allNodes = graph && graph.getNodes ? graph.getNodes() : []
          allNodes.forEach(n => {
            if (n.id !== node.id) {
              const nData = n.getData() || {}
              if (!nData.isEndpoint && nData.type !== 'endpoint') {
                const nPos = n.getPosition()
                const nSize = n.getSize()
                const nCenterX = nPos.x + nSize.width / 2
                const nCenterY = nPos.y + nSize.height / 2
                const distance = Math.sqrt(
                  Math.pow(centerX - nCenterX, 2) +
                  Math.pow(centerY - nCenterY, 2)
                )
                
                if (distance <= 150) { // 收集150px范围内的节点
                  nearbyNodes.push({
                    id: n.id,
                    type: nData.type,
                    position: nPos,
                    size: nSize,
                    distance: distance
                  })
                }
              }
            }
          })
          
          // 按距离排序
          nearbyNodes.sort((a, b) => a.distance - b.distance)
          sessionData.nearestNodes = nearbyNodes.slice(0, 5) // 只保留最近的5个节点
        }
      }

      endpoints.forEach(hint => {
        const hintPos = hint.getPosition()
        const hintSize = hint.getSize()
        
        // 🔧 使用坐标管理器修正endpoint位置
        const hintValidation = coordinateManager.validateCoordinateTransform(hint)
        let hintCenterX = hintPos.x + hintSize.width / 2
        let hintCenterY = hintPos.y + hintSize.height / 2
        
        // 如果检测到坐标偏差，进行修正
        if (hintValidation && hintValidation.difference) {
          hintCenterX -= hintValidation.difference.x
          hintCenterY -= hintValidation.difference.y
        }

        const distance = Math.sqrt(
          Math.pow(centerX - hintCenterX, 2) +
          Math.pow(centerY - hintCenterY, 2)
        )

        if (distance <= 50) { // 50px 吸附范围
          // 高亮endpoint
          hint.setAttrs({
            body: {
              ...hint.getAttrs().body,
              stroke: '#ff4d4f',
              strokeWidth: 3,
              fill: 'rgba(255, 77, 79, 0.1)'
            }
          })
          
          // 只对endpoint记录高亮变化到拖拽会话（不立即输出）
          if (isEndpoint && currentDragSession.value) {
            dragSnapLogger.logProcess(currentDragSession.value, 'highlight_change', {
              hintId: hint.id,
              distance: distance,
              highlighted: true
            })
          }
        }
      })
    }
  
  })

  // 节点位置变化事件（备用方案）
  graph.on('node:change:position', ({ node, current, previous, options }) => {
    // 🎯 关键修复：检查是否是系统发起的位置变更
    if (options && (options.systemInitiated || options.layoutEngine)) {
      console.log('🤖 [系统位置变化] 检测到系统发起的位置变更，跳过用户拖拽处理:', {
        nodeId: node.id,
        source: options.source || 'unknown',
        systemInitiated: options.systemInitiated,
        layoutEngine: options.layoutEngine,
        current,
        previous
      })
      return // 🎯 关键：系统操作直接返回，不执行后续的用户拖拽逻辑
    }
    
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
      // 🔧 添加防抖机制，避免频繁调用导致性能问题
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
        // 清除之前的防抖定时器
        if (window.highlightNodesTimer) {
          clearTimeout(window.highlightNodesTimer)
        }
        
        // 设置防抖延迟，避免频繁调用
        window.highlightNodesTimer = setTimeout(() => {
          // 调用统一预览线管理器的吸附高亮逻辑
          unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)
          
          // 🔧 添加预览线终点吸附检查
          if (typeof unifiedPreviewManager.checkSnapToPreviewLines === 'function') {
            unifiedPreviewManager.checkSnapToPreviewLines(node, current, size)
          }
        }, 50) // 50ms防抖延迟，比node:moved更短因为需要实时反馈
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
    
    // 🔧 修复：检查是否是endpoint移动
    if (cellData.isEndpoint || cellData.type === 'endpoint') {
      // console.log('🎯 [endpoint移动] 检测到endpoint移动:', {
      //   hintId: node.id,
      //   newPosition: node.getPosition(),
      //   hintData: cellData
      // })
      
      // 获取统一预览线管理器 - 已改为预览线终点拖拽，不再使用endpoint
      /*
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.updateHintPosition === 'function') {
        try {
          // 调用专门的endpoint位置更新方法
          unifiedPreviewManager.updateHintPosition(node, node.getPosition())
          
          // 🔍 添加手工拖拽点移动结束的最终位置日志
          // console.log('📍 [手工拖拽点移动结束] 最终位置已确定:', {
          //   hintId: node.id,
          //   finalPosition: node.getPosition(),
          //   timestamp: new Date().toLocaleTimeString(),
          //   sourceNodeId: cellData.sourceNodeId,
          //   branchId: cellData.branchId,
          //   branchLabel: cellData.branchLabel
          // })
          
          // console.log('✅ [拖拽提示点移动] 已更新拖拽提示点位置')
        } catch (error) {
          console.warn('⚠️ [拖拽提示点移动] 更新拖拽提示点位置失败:', error)
        }
      }
      */
      return // endpoint移动不需要后续的普通节点处理逻辑
    }
    
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
      // 检测是否需要自动连接到预览线
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
        
        // 🔧 使用坐标系统管理器进行坐标转换
        const coordinateValidation = coordinateManager.validateCoordinateTransform(node)
        let centerX = position.x + size.width / 2
        let centerY = position.y + size.height / 2
        
        // 🔧 安全检查：确保计算出的中心坐标是有效数字
        if (isNaN(centerX) || isNaN(centerY)) {
          console.error('❌ [节点移动] 计算节点中心坐标失败:', {
            nodeId: node.id,
            position: position,
            size: size,
            centerX: centerX,
            centerY: centerY
          })
          return
        }
        
        // 如果检测到坐标偏差，进行修正
        if (coordinateValidation && coordinateValidation.difference) {
          centerX -= coordinateValidation.difference.x
          centerY -= coordinateValidation.difference.y
          
          console.log('🔍 [节点移动坐标修正] 检测到坐标偏差:', {
            nodeId: node.id,
            position,
            coordinateValidation,
            correctedCenter: { x: centerX, y: centerY }
          })
        }

        // 检测是否接近拖拽提示点，如果是则尝试自动连接
        const endpoints = ((graph && graph.getNodes ? graph.getNodes() : []) || []).filter(n => {
          const data = n && n.getData ? n.getData() : {}
          return data.isEndpoint || data.type === 'endpoint'
        })

        // 🔍 添加详细的拖拽点检测日志
        // console.log('🔍 [拖拽点检测] 开始检测吸附条件:', {
        //   timestamp: new Date().toISOString(),
        //   nodeId: node.id,
        //   nodeType: nodeData.type,
        //   nodeCenter: { x: centerX, y: centerY },
        //   endpointsCount: endpoints.length,
        //   endpointsInfo: endpoints.map(hint => ({
        //     id: hint.id,
        //     position: hint.getPosition(),
        //     size: hint.getSize(),
        //     data: hint.getData()
        //   }))
        // })

        // 找到最近的拖拽提示点
        let nearestHint = null
        let nearestDistance = Infinity

        endpoints.forEach(hint => {
          const hintPos = hint.getPosition()
          const hintSize = hint.getSize()
          
          // 🔧 安全检查：确保拖拽点位置和尺寸有效
          if (!hintPos || typeof hintPos.x !== 'number' || typeof hintPos.y !== 'number') {
            console.warn('⚠️ [拖拽点检测] 拖拽点位置信息无效，跳过:', {
              hintId: hint.id,
              hintPos: hintPos
            })
            return
          }
          
          if (!hintSize || typeof hintSize.width !== 'number' || typeof hintSize.height !== 'number') {
            console.warn('⚠️ [拖拽点检测] 拖拽点尺寸信息无效，跳过:', {
              hintId: hint.id,
              hintSize: hintSize
            })
            return
          }
          
          // 🔧 使用坐标管理器修正拖拽提示点位置
          const hintValidation = coordinateManager.validateCoordinateTransform(hint)
          let hintCenterX = hintPos.x + hintSize.width / 2
          let hintCenterY = hintPos.y + hintSize.height / 2
          
          // 🔧 安全检查：确保计算出的拖拽点中心坐标是有效数字
          if (isNaN(hintCenterX) || isNaN(hintCenterY)) {
            console.warn('⚠️ [拖拽点检测] 计算拖拽点中心坐标失败，跳过:', {
              hintId: hint.id,
              hintPos: hintPos,
              hintSize: hintSize,
              hintCenterX: hintCenterX,
              hintCenterY: hintCenterY
            })
            return
          }
          
          // 如果检测到坐标偏差，进行修正
          if (hintValidation && hintValidation.difference) {
            hintCenterX -= hintValidation.difference.x
            hintCenterY -= hintValidation.difference.y
          }

          const distance = Math.sqrt(
            Math.pow(centerX - hintCenterX, 2) +
            Math.pow(centerY - hintCenterY, 2)
          )
          
          // 🔧 安全检查：确保距离计算结果有效
          if (isNaN(distance)) {
            console.warn('⚠️ [拖拽点检测] 距离计算失败，跳过:', {
              hintId: hint.id,
              nodeCenter: { x: centerX, y: centerY },
              hintCenter: { x: hintCenterX, y: hintCenterY },
              distance: distance
            })
            return
          }

          // 🔍 添加每个拖拽点的距离计算日志
          // console.log('📏 [距离计算] 拖拽点距离检测:', {
          //   hintId: hint.id,
          //   hintPosition: hintPos,
          //   hintSize: hintSize,
          //   hintCenter: { x: hintCenterX, y: hintCenterY },
          //   nodeCenter: { x: centerX, y: centerY },
          //   distance: distance,
          //   threshold: 80,
          //   withinRange: distance <= 80,
          //   coordinateValidation: hintValidation
          // })

          if (distance <= 80 && distance < nearestDistance) { // 80px 吸附范围（增加范围）
            nearestDistance = distance
            nearestHint = hint
            // console.log('🎯 [最近拖拽点] 更新最近的拖拽点:', {
            //   hintId: hint.id,
            //   distance: distance,
            //   previousNearest: nearestDistance
            // })
          }
        })

        // 🔍 添加吸附检测结果日志
        if (currentDragSession.value) {
          // 记录吸附检测结果到拖拽会话
          dragSnapLogger.logProcess(currentDragSession.value, 'snap_detection', {
            nearestHintFound: !!nearestHint,
            nearestHintId: nearestHint?.id,
            nearestDistance: nearestDistance,
            threshold: 80,
            willTriggerSnap: !!nearestHint
          })
        }

        // 如果找到最近的拖拽提示点，则进行连接
        if (nearestHint) {
          // 🔍 记录吸附前的位置信息（不立即输出）
          if (currentDragSession.value) {
            dragSnapLogger.logProcess(currentDragSession.value, 'before_snap', {
              draggedNode: {
                id: node.id,
                type: nodeData.type,
                position: { ...position },
                center: { x: centerX, y: centerY }
              },
              dragHint: {
                id: nearestHint.id,
                position: { ...nearestHint.getPosition() },
                size: { ...nearestHint.getSize() },
                distance: nearestDistance
              }
            })
          }

          // 获取拖拽提示点对应的预览线信息
          const hintData = nearestHint.getData() || {}
          const parentPreviewLine = hintData.parentPreviewLine

          if (parentPreviewLine) {
            // 解析预览线ID，格式可能是: unified_preview_sourceNodeId_branchId_timestamp
            // 或者从hintData中直接获取源节点ID
            let sourceNodeId = hintData.sourceNodeId

            if (!sourceNodeId && parentPreviewLine) {
              // 尝试从预览线ID中解析
              const parts = parentPreviewLine.split('_')
              
              if (parts.length >= 4 && parts[0] === 'unified' && parts[1] === 'preview') {
                // 源节点ID通常是 node_timestamp 格式，在第2和第3个位置
                const lastPart = parts[parts.length - 1]
                if (/^\d+$/.test(lastPart)) {
                  // 最后一部分是时间戳，往前找到源节点ID
                  for (let i = 2; i < parts.length - 1; i++) {
                    if (/^\d+$/.test(parts[i])) {
                      sourceNodeId = `${parts[i - 1]}_${parts[i]}`
                      break
                    }
                  }
                }
              }
            }

            if (sourceNodeId) {
              // 首先尝试直接查找
              let sourceNode = graph.getCellById(sourceNodeId)

              // 如果直接查找失败，尝试模糊匹配（节点ID可能包含分支标识符）
              if (!sourceNode) {
                const allNodes = (graph && graph.getNodes ? graph.getNodes() : []) || []
                sourceNode = allNodes.find(node => node && node.id && node.id.startsWith(sourceNodeId))
              }

              if (sourceNode && sourceNode.isNode && sourceNode.isNode() && sourceNode.id !== node.id) {
                // 🔍 记录即将进行吸附的详细信息
                const snapInfo = {
                  sourceNode: {
                    id: sourceNode.id,
                    type: sourceNode.getData()?.type,
                    position: sourceNode.getPosition()
                  },
                  targetNode: {
                    id: node.id,
                    type: nodeData.type,
                    positionBeforeSnap: { ...position }
                  },
                  dragHint: {
                    id: nearestHint.id,
                    branchId: hintData.branchId,
                    branchLabel: hintData.branchLabel,
                    parentPreviewLine: parentPreviewLine,
                    position: nearestHint.getPosition()
                  }
                }

                // 创建连接
                try {
                  const branchId = hintData.branchId || 'default'
                  const branchLabel = hintData.branchLabel // 获取分支标签
                  const sourcePort = 'out' // 统一使用'out'端口，从UI层面的同一个位置出发
                  
                  // 🔍 记录连接创建前的状态
                  // console.log('🔗 [拖拽点吸附] 开始创建连接:', {
                  //   timestamp: new Date().toISOString(),
                  //   connectionInfo: {
                  //     source: { nodeId: sourceNode.id, port: sourcePort },
                  //     target: { nodeId: node.id, port: 'in' },
                  //     branchId: branchId,
                  //     branchLabel: branchLabel
                  //   },
                  //   snapInfo
                  // })

                  // 使用连接配置工厂创建配置
                  const connectionConfig = createBranchConnectionConfig(
                    { cell: sourceNode.id, port: sourcePort },
                    { cell: node.id, port: 'in' },
                    branchId,
                    branchLabel
                  )

                  // 验证连接配置
                  const validationResult = validateConnectionConfig(connectionConfig)
                  if (!validationResult.valid) {
                    console.error('❌ [拖拽点吸附] 连接配置验证失败:', { 
                      connectionConfig, 
                      errors: validationResult.errors,
                      snapInfo
                    })
                    return
                  }

                  const connectionResult = await connectionErrorHandler.safeCreateConnection(
                    graph,
                    connectionConfig
                  )

                  if (!connectionResult.success) {
                    console.error('❌ [拖拽点吸附] 连接创建失败:', { 
                      errors: connectionResult.errors,
                      snapInfo
                    })
                    return
                  }

                  const connection = connectionResult.result

                  // 🔍 记录连接创建成功后的状态（不立即输出）
                  if (currentDragSession.value) {
                    dragSnapLogger.logProcess(currentDragSession.value, 'connection_created', {
                      targetNode: {
                        id: node.id,
                        positionAfterSnap: node.getPosition()
                      },
                      connection: {
                        id: connection.id,
                        sourceId: connection.getSourceNode()?.id,
                        targetId: connection.getTargetNode()?.id,
                        branchId: connection.getData()?.branchId,
                        branchLabel: connection.getData()?.branchLabel
                      }
                    })
                  }

                  // 检查拖拽点是否会被删除
                  let dragHintWillBeDeleted = false
                  try {
                    // 通知统一预览线管理器节点已连接，传递标签信息
                    if (unifiedPreviewManager.onNodeConnected) {
                      unifiedPreviewManager.onNodeConnected(sourceNode, branchId, branchLabel)
                      dragHintWillBeDeleted = true // 连接后拖拽点通常会被删除
                    }
                  } catch (error) {
                    console.error('❌ [拖拽点吸附] 通知预览线管理器失败:', error)
                  }

                } catch (error) {
                  console.error('💥 [拖拽点吸附] 吸附过程失败:', {
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    stack: error.stack
                  })
                }
              } else {
                // 记录无法找到有效源节点的情况（不立即输出）
                if (currentDragSession.value) {
                  dragSnapLogger.logProcess(currentDragSession.value, 'source_node_not_found', {
                    sourceNodeId,
                    sourceNodeFound: !!sourceNode,
                    isValidNode: sourceNode?.isNode?.(),
                    isSameNode: sourceNode?.id === node.id
                  })
                }
              }
            } else {
              // 记录无法解析源节点ID的情况（不立即输出）
              if (currentDragSession.value) {
                dragSnapLogger.logProcess(currentDragSession.value, 'source_id_parse_failed', {
                  parentPreviewLine,
                  hintData
                })
              }
            }
          } else {
            // 记录拖拽点缺少父预览线信息的情况（不立即输出）
            if (currentDragSession.value) {
              dragSnapLogger.logProcess(currentDragSession.value, 'missing_preview_line', {
                hintData
              })
            }
          }

          // 清除拖拽过程中的高亮效果
          unifiedPreviewManager.clearNodeHighlights()

          endpoints.forEach(hint => {
            // 恢复拖拽提示点的原始样式
            const hintData = hint.getData() || {}
            if (hintData.originalAttrs) {
              hint.setAttrs(hintData.originalAttrs)
            } else {
              // 如果没有保存原始样式，使用默认样式
              hint.setAttrs({
                body: {
                  fill: '#f0f0f0',
                  stroke: '#d9d9d9',
                  strokeWidth: 1
                }
              })
            }
          })
        }

        // 🔧 修复：在自动连接逻辑完成后，刷新所有预览线和拖拽提示点位置
        // 🔧 添加防抖机制，避免频繁调用导致页面卡死
        if (unifiedPreviewManager && typeof unifiedPreviewManager.refreshAllPreviewLines === 'function') {
          try {
            // 清除之前的防抖定时器
            if (window.previewLineRefreshTimer) {
              clearTimeout(window.previewLineRefreshTimer)
            }
            
            // 设置防抖延迟，避免频繁调用
            window.previewLineRefreshTimer = setTimeout(() => {
              unifiedPreviewManager.refreshAllPreviewLines(false, false) // 节点移动时不是智能布局
            }, 100) // 100ms防抖延迟
          } catch (error) {
            console.warn('⚠️ [节点移动] 刷新预览线位置失败:', error)
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

                  const sessionNodeData = sessionData.node.getData() || {}
                  if (false) { // 已禁用endpoint检查
                    const endPosition = sessionData.node.getPosition()
                    
                    // 查找最近的普通节点in端口坐标
                    let nearestInPortCoord = null
                    if (sessionData.nearestNodes && sessionData.nearestNodes.length > 0) {
                      const nearestNode = sessionData.nearestNodes[0] // 最近的节点
                      // 计算in端口坐标（通常在节点顶部中央）
                      nearestInPortCoord = {
                        x: nearestNode.position.x + nearestNode.size.width / 2,
                        y: nearestNode.position.y
                      }
                    }
                    
                    endNodeDragLogging(currentDragSession.value, endPosition, nearestInPortCoord)
                  }
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

              const sessionNodeData = sessionData.node.getData() || {}
              if (false) { // 已禁用endpoint检查
                const endPosition = sessionData.node.getPosition()
                
                // 查找最近的普通节点in端口坐标
                let nearestInPortCoord = null
                if (sessionData.nearestNodes && sessionData.nearestNodes.length > 0) {
                  const nearestNode = sessionData.nearestNodes[0] // 最近的节点
                  // 计算in端口坐标（通常在节点顶部中央）
                  nearestInPortCoord = {
                    x: nearestNode.position.x + nearestNode.size.width / 2,
                    y: nearestNode.position.y
                  }
                }
                
                endNodeDragLogging(currentDragSession.value, endPosition, nearestInPortCoord)
              }
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
  })

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
  })

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

    // 🔧 修复：恢复预览线管理器初始化，确保预览线功能正常工作
    console.log('[TaskFlowCanvas] 数据加载完成，开始初始化布局引擎和预览线管理器')
    initializeLayoutEngineAfterDataLoad() // 恢复调用，确保预览线管理器正确初始化
  })
}

// 🔧 新增函数：在数据加载完成后初始化布局引擎
// 🔧 修复：添加初始化状态检查，避免重复初始化
let isLayoutEngineInitializing = false
let layoutEngineInitialized = false

// 🔧 修复：nodeOperations已在组件初始化时定义，无需重复定义

const initializeLayoutEngineAfterDataLoad = async () => {
  // 🔧 增强防护机制：避免重复初始化和循环调用
  if (isLayoutEngineInitializing) {
    console.debug('[TaskFlowCanvas] 布局引擎正在初始化中，跳过重复调用')
    return { success: false, reason: 'already_initializing' }
  }
  
  if (layoutEngineInitialized) {
    console.debug('[TaskFlowCanvas] 布局引擎已初始化，跳过重复调用')
    // 执行状态检查确保组件正常
    const checkResult = performCanvasLoadCheck()
    return { success: true, reason: 'already_initialized', statusCheck: checkResult }
  }
  
  // 🔧 新增：检查必要的依赖项
  if (!graph || !graph.container) {
    console.error('[TaskFlowCanvas] 图形实例不存在或未完全初始化，等待图形实例准备就绪')
    
    // 等待图形实例准备就绪
    let retryCount = 0
    const maxRetries = 10
    
    while ((!graph || !graph.container) && retryCount < maxRetries) {
      console.log(`🔄 [TaskFlowCanvas] 等待图形实例准备就绪，重试 ${retryCount + 1}/${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount++
    }
    
    if (!graph || !graph.container) {
      console.error('[TaskFlowCanvas] 图形实例在等待后仍不可用，无法初始化布局引擎')
      return { success: false, reason: 'missing_graph' }
    }
    
    console.log('✅ [TaskFlowCanvas] 图形实例已准备就绪')
  }
  
  if (!nodeOperations) {
    console.error('[TaskFlowCanvas] 节点操作实例不存在，无法初始化布局引擎')
    return { success: false, reason: 'missing_node_operations' }
  }
  
  isLayoutEngineInitializing = true
  const initStartTime = Date.now()
  
  console.log('🚀 [TaskFlowCanvas] 开始数据加载后的布局引擎初始化')
  
  try {
    // 🔧 优化：确保configDrawers正确初始化
    await ensureConfigDrawersInitialized()
    
    // 🔧 优化：分步骤初始化，提高成功率
    const initResult = await initializeLayoutEngineSteps()
    
    if (initResult.success) {
      layoutEngineInitialized = true
      const initDuration = Date.now() - initStartTime
      console.log(`✅ [TaskFlowCanvas] 布局引擎初始化完成，耗时: ${initDuration}ms`)
      
      // 执行初始化后的状态检查
      const statusCheck = performCanvasLoadCheck()
      
      return { 
        success: true, 
        reason: 'initialization_completed',
        duration: initDuration,
        statusCheck: statusCheck
      }
    } else {
      throw new Error(`初始化失败: ${initResult.reason}`)
    }
    
  } catch (error) {
    console.error('[TaskFlowCanvas] 布局引擎初始化过程中发生错误:', error)
    console.error('[TaskFlowCanvas] 错误堆栈:', error.stack)
    
    // 🔧 新增：重置初始化状态以允许重试
    layoutEngineInitialized = false
    
    return { 
      success: false, 
      reason: 'initialization_error',
      error: error.message,
      duration: Date.now() - initStartTime
    }
  } finally {
    // 🔧 修复：重置初始化状态
    isLayoutEngineInitializing = false
  }
}

// 🔧 新增：确保configDrawers正确初始化
const ensureConfigDrawersInitialized = async () => {
  if (!configDrawers.value) {
    console.log('🔧 [TaskFlowCanvas] configDrawers未初始化，开始初始化')
    configDrawers.value = useConfigDrawers(() => graph, nodeOperations)
    await nextTick()
  }
  
  if (!configDrawers.value?.structuredLayout) {
    console.warn('⚠️ [TaskFlowCanvas] structuredLayout组件不存在，尝试重新初始化')
    
    // 重新初始化configDrawers
    if (graph && nodeOperations) {
      configDrawers.value = useConfigDrawers(() => graph, nodeOperations)
      await nextTick()
      
      if (!configDrawers.value?.structuredLayout) {
        throw new Error('structuredLayout组件初始化失败')
      }
    } else {
      throw new Error('graph或nodeOperations不可用，无法初始化configDrawers')
    }
  }
  
  console.log('✅ [TaskFlowCanvas] configDrawers初始化确认完成')
}

// 🔧 新增：分步骤初始化布局引擎
const initializeLayoutEngineSteps = async () => {
  try {
    // 步骤1：初始化布局引擎
    console.log('🔧 [TaskFlowCanvas] 步骤1：初始化布局引擎')
    const initResult = configDrawers.value.structuredLayout.initializeLayoutEngine()
    console.log('✅ [TaskFlowCanvas] 布局引擎基础初始化完成，结果:', initResult)
    
    // 步骤2：创建布局引擎实例
    console.log('🔧 [TaskFlowCanvas] 步骤2：创建布局引擎实例')
    const layoutEngineInstance = await createLayoutEngineInstance()
    
    // 步骤3：获取预览线管理器
    console.log('🔧 [TaskFlowCanvas] 步骤3：获取预览线管理器')
    const previewManager = await getPreviewLineManager()
    
    // 步骤4：建立关联
    console.log('🔧 [TaskFlowCanvas] 步骤4：建立布局引擎与预览线管理器的关联')
    const linkResult = await linkLayoutEngineAndPreviewManager(layoutEngineInstance, previewManager)
    
    return {
      success: true,
      layoutEngine: layoutEngineInstance,
      previewManager: previewManager,
      linkResult: linkResult
    }
    
  } catch (error) {
    console.error('[TaskFlowCanvas] 分步骤初始化失败:', error)
    return {
      success: false,
      reason: error.message
    }
  }
}

// 🔧 新增：创建布局引擎实例
const createLayoutEngineInstance = async () => {
  if (!configDrawers.value?.structuredLayout?.createLayoutEngineInstance) {
    throw new Error('createLayoutEngineInstance方法不可用')
  }
  
  const layoutEngineInstance = configDrawers.value.structuredLayout.createLayoutEngineInstance(graph)
  
  if (!layoutEngineInstance) {
    throw new Error('布局引擎实例创建失败')
  }
  
  console.log('✅ [TaskFlowCanvas] 布局引擎实例创建成功')
  
  // 调试用：暴露到window对象
  if (typeof window !== 'undefined') {
    window.layoutEngine = layoutEngineInstance
    window.graph = graph
    console.log('🔍 [TaskFlowCanvas] 布局引擎已暴露到window.layoutEngine，可在浏览器控制台调试')
  }
  
  return layoutEngineInstance
}

// 🔧 新增：获取预览线管理器
const getPreviewLineManager = async () => {
  let previewManager = null
  const maxRetries = 3
  
  for (let retry = 1; retry <= maxRetries; retry++) {
    console.log(`🔄 [TaskFlowCanvas] 尝试获取预览线管理器 (第${retry}次)`)
    
    // 方式1：通过unifiedPreviewManager获取
    if (configDrawers.value?.structuredLayout?.unifiedPreviewManager?.value) {
      previewManager = configDrawers.value.structuredLayout.unifiedPreviewManager.value
      console.log('✅ [TaskFlowCanvas] 通过unifiedPreviewManager获取成功')
      break
    }
    
    // 方式2：通过getConnectionPreviewManager方法获取
    if (configDrawers.value?.structuredLayout?.getConnectionPreviewManager) {
      try {
        previewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()
        if (previewManager) {
          console.log('✅ [TaskFlowCanvas] 通过getConnectionPreviewManager获取成功')
          break
        }
      } catch (error) {
        console.warn(`⚠️ [TaskFlowCanvas] getConnectionPreviewManager调用失败 (第${retry}次):`, error.message)
      }
    }
    
    // 如果还没获取到，等待后重试
    if (retry < maxRetries) {
      console.log(`⏳ [TaskFlowCanvas] 第${retry}次获取失败，等待100ms后重试`)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  if (!previewManager) {
    console.warn('⚠️ [TaskFlowCanvas] 预览线管理器获取失败，但允许继续初始化')
    // 不抛出错误，允许布局引擎在没有预览线管理器的情况下工作
  } else {
    console.log('✅ [TaskFlowCanvas] 预览线管理器获取成功')
  }
  
  return previewManager
}

// 🔧 新增：建立布局引擎与预览线管理器的关联
const linkLayoutEngineAndPreviewManager = async (layoutEngine, previewManager) => {
  const results = {
    layoutEngineSet: false,
    globalReferenceSet: false,
    loadCompleteCheckTriggered: false
  }
  
  try {
    // 验证参数
    if (!layoutEngine) {
      console.error('❌ [TaskFlowCanvas] 布局引擎实例不存在')
      throw new Error('布局引擎实例不存在')
    }
    
    if (!previewManager) {
      console.error('❌ [TaskFlowCanvas] 预览线管理器实例不存在')
      throw new Error('预览线管理器实例不存在')
    }
    
    // 设置全局引用
    if (typeof window !== 'undefined') {
      window.unifiedStructuredLayoutEngine = layoutEngine
      window.unifiedPreviewLineManager = previewManager
      window.unifiedPreviewManager = previewManager // 保持兼容性
      results.globalReferenceSet = true
      console.log('✅ [TaskFlowCanvas] 全局引用已设置')
    }
    
    // 设置布局引擎引用
    if (typeof previewManager.setLayoutEngine === 'function') {
      try {
        previewManager.setLayoutEngine(layoutEngine)
        results.layoutEngineSet = true
        console.log('✅ [TaskFlowCanvas] 布局引擎引用已设置到预览线管理器')
      } catch (error) {
        console.error('❌ [TaskFlowCanvas] 设置布局引擎引用失败:', error)
      }
    } else {
      console.warn('⚠️ [TaskFlowCanvas] 预览线管理器不支持setLayoutEngine方法')
    }
    
    // 触发数据加载完成检查
    if (typeof previewManager.performLoadCompleteCheck === 'function') {
      try {
        previewManager.performLoadCompleteCheck()
        results.loadCompleteCheckTriggered = true
        console.log('✅ [TaskFlowCanvas] 数据加载完成检查已触发')
      } catch (error) {
        console.error('❌ [TaskFlowCanvas] 数据加载完成检查失败:', error)
      }
    } else {
      console.warn('⚠️ [TaskFlowCanvas] 预览线管理器不支持数据加载完成检查方法')
    }
    
    console.log('✅ [TaskFlowCanvas] 布局引擎和预览线管理器链接成功')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 链接布局引擎和预览线管理器失败:', error)
    // 清理可能的部分设置
    if (typeof window !== 'undefined') {
      window.unifiedStructuredLayoutEngine = null
      window.unifiedPreviewLineManager = null
      window.unifiedPreviewManager = null
    }
  }
  
  return results
}

// 🔧 新增：画布加载后的状态检查
const performCanvasLoadCheck = () => {
  console.log('🔍 [TaskFlowCanvas] 开始画布加载后状态检查')
  
  try {
    // 检查图形实例状态
    if (!graph) {
      console.error('❌ [TaskFlowCanvas] 图形实例未初始化')
      return false
    }
    console.log('✅ [TaskFlowCanvas] 图形实例状态正常')
    
    // 检查布局引擎状态
    if (!layoutEngineInitialized) {
      console.warn('⚠️ [TaskFlowCanvas] 布局引擎未完全初始化')
    } else {
      console.log('✅ [TaskFlowCanvas] 布局引擎状态正常')
    }
    
    // 检查预览线管理器状态
    const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    if (unifiedPreviewManager) {
      console.log('✅ [TaskFlowCanvas] 预览线管理器状态正常')
    } else {
      console.warn('⚠️ [TaskFlowCanvas] 预览线管理器未初始化')
    }
    
    // 检查数据状态
    const nodeCount = nodes.value.length
    const connectionCount = connections.value.length
    const graphNodeCount = graph.getNodes().length
    const graphEdgeCount = graph.getEdges().length
    
    console.log(`📊 [TaskFlowCanvas] 数据状态检查:`)
    console.log(`   - 数据数组: nodes(${nodeCount}), connections(${connectionCount})`)
    console.log(`   - 图形实例: nodes(${graphNodeCount}), edges(${graphEdgeCount})`)
    
    // 检查数据一致性
    if (Math.abs(nodeCount - graphNodeCount) > 1) {
      console.warn('⚠️ [TaskFlowCanvas] 节点数据可能不一致')
    }
    
    console.log('✅ [TaskFlowCanvas] 画布状态检查完成')
    return true
    
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 画布状态检查失败:', error)
    return false
  }
}

// 汇总日志 - 统计页面中各种元素的数量（仅在开发环境下执行详细统计）
// 🔧 修复：添加增强防护机制避免日志循环
let lastLogTime = 0
let logCallCount = 0
let logCallStack = [] // 记录调用堆栈，用于检测循环调用
let isLogSuppressed = false // 日志抑制标志
const LOG_THROTTLE_INTERVAL = 3000 // 增加到3秒内最多执行一次
const MAX_LOG_CALLS_PER_MINUTE = 5 // 减少到每分钟最多5次
const MAX_CONSECUTIVE_CALLS = 3 // 连续调用最大次数
const LOG_SUPPRESS_DURATION = 10000 // 日志抑制持续时间（10秒）

const logCanvasSummary = () => {
  if (!graph) {
    console.warn('[TaskFlowCanvas] 图形实例不存在，无法统计汇总信息')
    return
  }

  const now = Date.now()
  
  // 🔧 检查日志抑制状态
  if (isLogSuppressed) {
    return // 静默跳过，不输出任何日志
  }
  
  // 🔧 新增：调用栈检测，防止循环调用
  const stack = new Error().stack
  if (stack) {
    const stackLines = stack.split('\n')
    const logCanvasSummaryLines = stackLines.filter(line => line.includes('logCanvasSummary'))
    if (logCanvasSummaryLines.length > 2) { // 如果调用栈中有多个logCanvasSummary，说明可能存在循环调用
      console.error('[TaskFlowCanvas] 🚨 检测到logCanvasSummary循环调用，调用栈深度:', logCanvasSummaryLines.length)
      console.error('[TaskFlowCanvas] 调用栈:', stackLines.slice(0, 10).join('\n'))
      isLogSuppressed = true
      setTimeout(() => {
        isLogSuppressed = false
        logCallCount = 0
        console.log('[TaskFlowCanvas] 📢 循环调用检测抑制模式已解除')
      }, LOG_SUPPRESS_DURATION)
      return
    }
  }
  
  // 🔧 增强防护机制：检测连续快速调用
  logCallStack.push(now)
  if (logCallStack.length > MAX_CONSECUTIVE_CALLS) {
    logCallStack.shift() // 保持数组长度
  }
  
  // 检测是否在短时间内有过多连续调用
  if (logCallStack.length >= MAX_CONSECUTIVE_CALLS) {
    const timeDiff = logCallStack[logCallStack.length - 1] - logCallStack[0]
    if (timeDiff < 1000) { // 1秒内连续调用3次
      console.error('[TaskFlowCanvas] 🚨 检测到日志循环调用，启动抑制模式！调用间隔:', timeDiff + 'ms')
      isLogSuppressed = true
      logCallStack = [] // 清空调用栈
      
      // 设置定时器恢复日志
      setTimeout(() => {
        isLogSuppressed = false
        logCallCount = 0
        console.log('[TaskFlowCanvas] 📢 日志抑制模式已解除，恢复正常日志输出')
      }, LOG_SUPPRESS_DURATION)
      
      return
    }
  }

  // 🔧 防护机制：限制调用频率
  if (now - lastLogTime < LOG_THROTTLE_INTERVAL) {
    console.debug('[TaskFlowCanvas] 日志调用过于频繁，跳过本次统计')
    return
  }
  
  // 🔧 防护机制：限制每分钟调用次数
  logCallCount++
  if (logCallCount > MAX_LOG_CALLS_PER_MINUTE) {
    console.warn('[TaskFlowCanvas] 日志调用次数超限，可能存在循环调用问题')
    return
  }
  
  // 重置计数器（每分钟）
  if (now - lastLogTime > 60000) {
    logCallCount = 1
    logCallStack = [] // 同时清空调用栈
  }
  
  lastLogTime = now

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
  const allNodes = graph && graph.getNodes ? graph.getNodes() : []
  const normalNodes = (allNodes || []).filter(node => {
    const nodeData = node && node.getData ? node.getData() : null
    return nodeData && nodeData.type !== 'start'
  })
  const startNodes = (allNodes || []).filter(node => {
    const nodeData = node && node.getData ? node.getData() : null
    return nodeData && nodeData.type === 'start'
  })
  
  // 统计可拖拽节点（除了开始节点，其他节点都是可拖拽的）
  const draggableNodes = (allNodes || []).filter(node => {
    const nodeData = node && node.getData ? node.getData() : null
    return nodeData && nodeData.deletable !== false && nodeData.type !== 'start'
  })

  // 统计连接线数量
  const allEdges = graph && graph.getEdges ? graph.getEdges() : []
  const connectionLines = (allEdges || []).filter(edge => {
    const edgeId = edge && edge.id ? edge.id : ''
    // 连接线不包含 preview 关键字
    return !edgeId.includes('preview') && !edgeId.includes('unified_preview')
  })

  // 统计预览线数量
  const previewLines = (allEdges || []).filter(edge => {
    const edgeId = edge && edge.id ? edge.id : ''
    // 预览线包含 preview 关键字
    return edgeId.includes('preview') || edgeId.includes('unified_preview')
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
      
      // 统计活跃的预览线
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
    isConfigured: nodeData.data?.isConfigured || 
                  nodeData.isConfigured || 
                  // 如果节点有配置信息，则认为已配置
                  (nodeData.config && Object.keys(nodeData.config).length > 0) ||
                  // 对于开始节点，默认为已配置
                  nodeData.type === 'start' ||
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
  
  // 使用专门的端口配置工厂，传递布局方向
  const portConfig = portConfigFactory.createNodePortConfig(nodeType, nodeConfig, layoutDirection)
  
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
  const existingConnections = (connections.value || []).filter(conn => conn.source === sourceNode.id)

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
    },
    config: nodeConfig
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

    const outgoingConnections = ((connections.value || []) || []).filter(conn => conn.source === nodeId)
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
      const remainingChildren = (getAllChildNodes(nodeToDelete) || []).filter(child =>
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

  // 使用统一结构化布局重新布局
  if (configDrawers.value?.structuredLayout?.applyUnifiedStructuredLayout && graph) {
    nextTick(() => {
      configDrawers.value.structuredLayout.applyUnifiedStructuredLayout(graph)
      console.log('[TaskFlowCanvas] 级联删除后重新布局完成（统一结构化布局）')
    })
  }

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
    const deletedConnections = (connections.value || []).filter(conn =>
      conn.source === nodeId || conn.target === nodeId
    )
    connections.value = (connections.value || []).filter(conn =>
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
            if (!nodeData.isEndpoint && !nodeData.isUnifiedPreview && !nodeData.isPersistentPreview) {
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
      
      // 🎯 新增：统一布局后的预览线清理
      setTimeout(() => {
        if (connectionPreviewManager && typeof connectionPreviewManager.performLoadCompleteCheck === 'function') {
          console.log('🧹 [TaskFlowCanvas] 统一布局完成，执行预览线清理检查')
          connectionPreviewManager.performLoadCompleteCheck()
        } else if (connectionPreviewManager && typeof connectionPreviewManager.cleanupOrphanedPreviewLines === 'function') {
          console.log('🧹 [TaskFlowCanvas] 统一布局完成，执行孤立预览线清理')
          const cleanedCount = connectionPreviewManager.cleanupOrphanedPreviewLines()
          if (cleanedCount > 0) {
            console.log(`🧹 [TaskFlowCanvas] 清理了 ${cleanedCount} 条无效预览线`)
          }
        } else {
          console.warn('⚠️ [TaskFlowCanvas] 预览线管理器不可用，跳过预览线清理')
        }
      }, 500) // 延迟500ms执行，确保布局完全稳定
      
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
        return nodeData?.isEndpoint || nodeType === 'endpoint' || node.id.includes('hint_')
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
      
      // 🎯 新增：统一布局后的预览线清理
      setTimeout(() => {
        if (connectionPreviewManager && typeof connectionPreviewManager.performLoadCompleteCheck === 'function') {
          console.log('🧹 [TaskFlowCanvas] 统一布局完成，执行预览线清理检查')
          connectionPreviewManager.performLoadCompleteCheck()
        } else if (connectionPreviewManager && typeof connectionPreviewManager.cleanupOrphanedPreviewLines === 'function') {
          console.log('🧹 [TaskFlowCanvas] 统一布局完成，执行孤立预览线清理')
          const cleanedCount = connectionPreviewManager.cleanupOrphanedPreviewLines()
          if (cleanedCount > 0) {
            console.log(`🧹 [TaskFlowCanvas] 清理了 ${cleanedCount} 条无效预览线`)
          }
        } else {
          console.warn('⚠️ [TaskFlowCanvas] 预览线管理器不可用，跳过预览线清理')
        }
      }, 500) // 延迟500ms执行，确保布局完全稳定
      
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
  
  try {
    isApplyingLayout.value = true
    await applyUnifiedStructuredLayout()
  } catch (error) {
    console.error('[TaskFlowCanvas] 智能布局应用失败:', error)
    Message.error('智能布局应用失败: ' + error.message)
  } finally {
    isApplyingLayout.value = false
  }
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

  // 注意：预览线不需要保存，它们是动态生成的UI元素
  // 在任务恢复时，预览线会根据节点配置自动重新创建
  console.log('[TaskFlowCanvas] 导出画布数据:', {
    nodeCount: nodes.value.length,
    connectionCount: connections.value.length
  })

  return {
    nodes: nodes.value,
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
            const realConnections = (outgoingEdges || []).filter(edge => {
              const edgeData = edge.getData() || {}
              // 排除预览线，只检查真实连接
              return !edgeData.isPersistentPreview && 
                     !edgeData.isPreview && 
                     !edgeData.isUnifiedPreview &&
                     edgeData.type !== 'preview-line' &&
                     edgeData.type !== 'unified-preview-line' &&
                     edgeData.type !== 'draggable-preview'
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
            
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            
            if (isPreview) {
              previewLines.push({
                id: edge.id,
                type: edgeData.type,
                source: sourceId,
                target: targetId,
                branchId: edgeData.branchId,
                labels: edge.getLabels()?.length || 0
              })
            } else {
              // 真实连接
              realConnections.push({
                id: edge.id,
                source: sourceId,
                target: targetId,
                branchId: edgeData.branchId
              })
              
              // 更新节点连接状态
              if (nodeConnections.has(sourceId)) {
                const sourceConn = nodeConnections.get(sourceId)
                sourceConn.hasOutgoing = true
                if (edgeData.branchId) {
                  sourceConn.branches.add(edgeData.branchId)
                }
              }
              
              if (nodeConnections.has(targetId)) {
                const targetConn = nodeConnections.get(targetId)
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
          console.log(`✅ [TaskFlowCanvas] 预览线清理完成: 删除 ${previewLinesToRemove.length} 条已连接预览线，保留 ${remainingPreviewLines} 条未连接预览线`)
          
          // 🔧 注释掉自动布局触发，避免从列表页进入画布时自动重绘
          // setTimeout(async () => {
          //   try {
          //     await applyUnifiedStructuredLayout()
          //   } catch (error) {
          //     console.error('❌ [TaskFlowCanvas] 统一布局执行失败:', error)
          //   }
          // }, 100)
          
          console.log('✅ [TaskFlowCanvas] 数据加载完成，跳过自动布局以避免不必要的重绘')
          
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
            const sourceId = edge.getSourceCellId()
            const targetId = edge.getTargetCellId()
            const labels = edge.getLabels() || []
            
            // 判断连接类型
            const isPreview = edgeData.isPersistentPreview || 
                             edgeData.isPreview || 
                             edgeData.isUnifiedPreview ||
                             edgeData.type === 'preview-line' ||
                             edgeData.type === 'unified-preview-line' ||
                             edgeData.type === 'draggable-preview'
            
            if (isPreview) {
              previewLines++
              console.log(`  ${index + 1}. [预览线] ${sourceId} -> ${targetId}, 类型: ${edgeData.type || 'unknown'}, 标签数: ${labels.length}`)
            } else {
              realConnections++
              console.log(`  ${index + 1}. [真实连接] ${sourceId} -> ${targetId}, 分支ID: ${edgeData.branchId || 'none'}, 标签数: ${labels.length}`)
            }
            
            // 统计标签
            labelCount += labels.length
            if (labels.length > 0) {
              labels.forEach((label, labelIndex) => {
                console.log(`    标签 ${labelIndex + 1}: "${label.markup || label.text || 'empty'}", 位置: ${JSON.stringify(label.position || {})}`)
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
            
            // 🎯 智能验证预览线的有效性
            console.log('🔍 [TaskFlowCanvas] 开始智能验证预览线有效性...')
            const previewEdges = allEdges.filter(edge => {
              const edgeData = edge.getData() || {}
              return edgeData.isPersistentPreview || 
                     edgeData.isPreview || 
                     edgeData.isUnifiedPreview ||
                     edgeData.type === 'preview-line' ||
                     edgeData.type === 'unified-preview-line' ||
                     edgeData.type === 'draggable-preview'
            })
            
            let invalidCount = 0
            let validCount = 0
            
            previewEdges.forEach(edge => {
              const sourceId = edge.getSourceCellId()
              const sourceNode = graph.getCellById(sourceId)
              
              // 检查源节点是否存在且有效
              if (!sourceNode) {
                console.log(`[TaskFlowCanvas] 清理无效预览线(源节点不存在): ${edge.id}`)
                try {
                  graph.removeCell(edge)
                  invalidCount++
                } catch (error) {
                  console.error(`❌ [TaskFlowCanvas] 清理预览线失败: ${edge.id}`, error)
                }
                return
              }
              
              // 检查源节点是否已配置
              const sourceData = sourceNode.getData() || {}
              const nodeType = sourceData.nodeType || sourceData.type
              
              // 🎯 区分分流类节点和普通节点的清理标准
              const isSplitNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
              
              if (!sourceData.isConfigured) {
                // 对于分流类节点，如果未配置则清理
                // 对于普通节点，如果未配置也清理
                console.log(`[TaskFlowCanvas] 清理无效预览线(源节点未配置): ${edge.id}, 节点类型: ${nodeType}`)
                try {
                  graph.removeCell(edge)
                  invalidCount++
                } catch (error) {
                  console.error(`❌ [TaskFlowCanvas] 清理预览线失败: ${edge.id}`, error)
                }
                return
              }
              
              // 🎯 对于已配置的分流类节点，检查是否有分支配置
              if (isSplitNode && sourceData.isConfigured) {
                // 分流类节点已配置，保留其预览线（即使目标节点不存在）
                validCount++
                console.log(`✅ [TaskFlowCanvas] 保留分流节点预览线: ${edge.id}, 节点类型: ${nodeType}`)
                return
              }
              
              // 🎯 对于普通节点，检查目标节点是否存在
              const targetId = edge.getTargetCellId()
              const targetNode = graph.getCellById(targetId)
              
              if (!targetNode && !isSplitNode) {
                // 普通节点的预览线如果没有有效目标，则清理
                console.log(`[TaskFlowCanvas] 清理无效预览线(目标节点不存在): ${edge.id}, 源节点类型: ${nodeType}`)
                try {
                  graph.removeCell(edge)
                  invalidCount++
                } catch (error) {
                  console.error(`❌ [TaskFlowCanvas] 清理预览线失败: ${edge.id}`, error)
                }
                return
              }
              
              // 🎯 默认情况：普通节点的有效预览线，保留
              validCount++
              console.log(`✅ [TaskFlowCanvas] 保留有效预览线: ${edge.id}, 节点类型: ${nodeType || 'unknown'}`)
            })
            
            console.log(`✅ [TaskFlowCanvas] 智能清理完成，清理了 ${invalidCount} 条无效预览线，保留了 ${validCount} 条有效预览线`)
            
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
            console.log(`✅ [TaskFlowCanvas] 预览线数量(${previewLines})在合理范围内，已配置节点数量: ${configuredNodes.length}`)
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
onMounted(async () => {
  console.log('🚀🚀🚀 [TaskFlowCanvas] ===== 组件开始挂载 =====')
  console.log('🚀🚀🚀 [TaskFlowCanvas] 当前时间:', new Date().toISOString())
  console.log('🚀🚀🚀 [TaskFlowCanvas] 页面URL:', window.location.href)
  
  // 启用全局调试模式
  window.TASK_FLOW_DEBUG = true
  console.log('🔧 [TaskFlowCanvas] 调试模式已启用')
  
  // 🚀 集成自动修复系统
  try {
    if (window.TaskFlowAutoRepairSystem) {
      console.log('🔧 [TaskFlowCanvas] 初始化自动修复系统')
      const autoRepair = new window.TaskFlowAutoRepairSystem()
      await autoRepair.initialize()
      
      // 设置画布引用供自动修复系统使用
      autoRepair.setCanvasContext({
        initCanvas,
        graph: () => graph,
        canvasContainer: canvasContainer.value,
        getPreviewLineManager: () => getPreviewLineManager(),
        getLayoutEngine: () => getLayoutEngine()
      })
      
      // 启动健康检查
      await autoRepair.performHealthCheck()
      
      // 如果检测到问题，尝试自动修复
      const healthStatus = autoRepair.getHealthStatus()
      if (!healthStatus.isHealthy) {
        console.log('🔧 [TaskFlowCanvas] 检测到问题，启动自动修复')
        await autoRepair.performAutoRepair()
      }
      
      // 将自动修复实例保存到组件实例
      window.taskFlowAutoRepairInstance = autoRepair
    }
  } catch (error) {
    console.warn('⚠️ [TaskFlowCanvas] 自动修复系统初始化失败:', error)
  }
  
  // 初始化画布
  await initCanvas()
  
  // 🚀 画布初始化后的自动检查和修复
  try {
    if (window.taskFlowAutoRepairInstance) {
      // 等待画布完全初始化
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 执行画布初始化后的健康检查
      await window.taskFlowAutoRepairInstance.performHealthCheck()
      
      // 如果有开始节点，确保其正确配置
      const startNodes = graph?.getNodes()?.filter(node => node.getData()?.type === 'start')
      if (startNodes && startNodes.length > 0) {
        console.log('🔧 [TaskFlowCanvas] 检查开始节点配置')
        for (const startNode of startNodes) {
          await window.taskFlowAutoRepairInstance.ensureNodeConfiguration(startNode)
        }
      }
      
      // 启动智能监控
      if (window.TaskFlowMonitoringSystem) {
        const monitoring = new window.TaskFlowMonitoringSystem()
        await monitoring.initialize()
        monitoring.startMonitoring({
          graph: () => graph,
          canvas: canvasContainer.value,
          autoRepair: window.taskFlowAutoRepairInstance
        })
        window.taskFlowMonitoringInstance = monitoring
      }
    }
  } catch (error) {
    console.warn('⚠️ [TaskFlowCanvas] 画布初始化后检查失败:', error)
  }
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  
  // 🔧 修复：暴露自动修复系统需要的初始化函数到window对象
  try {
    console.log('🔧 [TaskFlowCanvas] 开始暴露自动修复系统函数到window对象')
    
    // 1. 暴露现有的initializeLayoutEngineAfterDataLoad函数
    window.initializeLayoutEngineAfterDataLoad = initializeLayoutEngineAfterDataLoad
    console.log('✅ [TaskFlowCanvas] initializeLayoutEngineAfterDataLoad函数已暴露')
    
    // 2. 创建并暴露initializeGraph函数（检查和修复现有图形实例）
    window.initializeGraph = async () => {
      try {
        console.log('🔧 [AutoRepair] 开始检查图形实例状态')
        
        // 检查图形实例是否存在且有效
        if (!graph || !graph.container) {
          console.log('🔧 [AutoRepair] 图形实例不存在或无效，需要重新创建')
          
          // 只有在图形实例确实不存在时才重新初始化
          if (!isCanvasInitialized) {
            console.log('🔧 [AutoRepair] 画布未初始化，调用initCanvas')
            await initCanvas()
            
            // 等待图形实例完全初始化
            await new Promise(resolve => setTimeout(resolve, 200))
          } else {
            console.log('🔧 [AutoRepair] 画布已初始化但图形实例丢失，重新创建图形实例')
            // 直接重新创建图形实例，不调用完整的initCanvas
            const container = canvasContainer.value
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
              graph = new Graph({
                container: container,
                background: { color: '#f8f9fa' },
                grid: { size: 20, visible: true, type: 'dot', args: { color: '#e0e0e0', thickness: 1 } },
                selecting: { enabled: true, rubberband: true, movable: true, showNodeSelectionBox: true },
                interacting: { nodeMovable: true, edgeMovable: false, edgeLabelMovable: false, arrowheadMovable: false, vertexMovable: false, vertexAddable: false, vertexDeletable: false },
                scroller: { enabled: true, pageVisible: false, pageBreak: false, pannable: true },
                mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'], factor: 1.1, maxScale: 3, minScale: 0.05 },
                connecting: {
                  router: 'manhattan',
                  connector: { name: 'rounded', args: { radius: 8 } },
                  anchor: 'center',
                  connectionPoint: 'anchor',
                  allowBlank: false,
                  allowLoop: false,
                  allowNode: true,
                  allowEdge: false,
                  allowMulti: true,
                  highlight: true
                }
              })
              
              // 重新绑定事件
              bindEvents()
              
              // 重新加载数据
              loadInitialData()
              
              // 等待图形实例完全初始化
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          }
        } else {
          console.log('🔧 [AutoRepair] 图形实例存在且有效，无需重新初始化')
        }
        
        console.log('✅ [AutoRepair] 图形实例检查完成')
        return { success: true, message: '图形实例检查和修复成功' }
      } catch (error) {
        console.error('❌ [AutoRepair] 图形实例检查失败:', error)
        return { success: false, error: error.message }
      }
    }
    console.log('✅ [TaskFlowCanvas] initializeGraph函数已暴露')
    
    // 3. 创建并暴露initializeNodeOperations函数（重新初始化节点操作）
    window.initializeNodeOperations = async () => {
      try {
        console.log('🔧 [AutoRepair] 开始重新初始化节点操作')
        
        // 检查图形实例是否存在，如果不存在则先重新初始化
        if (!graph || !graph.container) {
          console.log('🔧 [AutoRepair] 图形实例不存在或未完全初始化，先重新初始化图形实例')
          const initResult = await window.initializeGraph()
          if (!initResult.success) {
            throw new Error('图形实例重新初始化失败: ' + initResult.error)
          }
          
          // 等待图形实例完全准备就绪
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // 确保图形实例存在且完全初始化后再绑定事件
        if (!graph || !graph.container) {
          throw new Error('图形实例仍然不存在或未完全初始化，无法初始化节点操作')
        }
        
        // 重新绑定节点事件
        bindEvents()
        
        // 重新初始化节点配置
        const allNodes = graph.getNodes()
        for (const node of allNodes) {
          const nodeData = node.getData()
          if (nodeData && !nodeData.isConfigured && nodeData.type !== 'start') {
            // 重新设置节点配置状态
            node.setData({ ...nodeData, isConfigured: false })
          }
        }
        
        console.log('✅ [AutoRepair] 节点操作重新初始化完成')
        return { success: true, message: '节点操作重新初始化成功' }
      } catch (error) {
        console.error('❌ [AutoRepair] 节点操作重新初始化失败:', error)
        return { success: false, error: error.message }
      }
    }
    console.log('✅ [TaskFlowCanvas] initializeNodeOperations函数已暴露')
    
    // 4. 创建并暴露initializeConfigDrawers函数（重新初始化配置抽屉）
    window.initializeConfigDrawers = async () => {
      try {
        console.log('🔧 [AutoRepair] 开始重新初始化配置抽屉')
        
        // 重新初始化配置抽屉
        await ensureConfigDrawersInitialized()
        
        // 验证配置抽屉是否正确初始化
        if (!configDrawers.value) {
          throw new Error('配置抽屉初始化失败')
        }
        
        console.log('✅ [AutoRepair] 配置抽屉重新初始化完成')
        return { success: true, message: '配置抽屉重新初始化成功' }
      } catch (error) {
        console.error('❌ [AutoRepair] 配置抽屉重新初始化失败:', error)
        return { success: false, error: error.message }
      }
    }
    console.log('✅ [TaskFlowCanvas] initializeConfigDrawers函数已暴露')
    
    // 验证函数是否正确暴露
    console.log('🔧 [TaskFlowCanvas] 验证函数暴露状态:')
    console.log('  - initializeLayoutEngineAfterDataLoad:', typeof window.initializeLayoutEngineAfterDataLoad)
    console.log('  - initializeGraph:', typeof window.initializeGraph)
    console.log('  - initializeNodeOperations:', typeof window.initializeNodeOperations)
    console.log('  - initializeConfigDrawers:', typeof window.initializeConfigDrawers)
    
    console.log('🔧 [TaskFlowCanvas] 自动修复系统所需函数已暴露到window对象')
    console.log('🔧 [TaskFlowCanvas] 可用函数: initializeLayoutEngineAfterDataLoad, initializeGraph, initializeNodeOperations, initializeConfigDrawers')
    
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 暴露自动修复函数失败:', error)
    console.error('❌ [TaskFlowCanvas] 错误详情:', error.stack)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)

  // 🔧 修复：清理全局定时器，防止内存泄漏和页面卡死
  if (window.previewLineRefreshTimer) {
    clearTimeout(window.previewLineRefreshTimer)
    window.previewLineRefreshTimer = null
  }
  
  if (window.highlightNodesTimer) {
    clearTimeout(window.highlightNodesTimer)
    window.highlightNodesTimer = null
  }

  // 🔧 修复：清理graph事件监听器，防止EventEmitter内存泄漏
  if (graph) {
    // 移除所有graph事件监听器
    graph.off('node:click')
    graph.off('node:move')
    graph.off('node:moving')
    graph.off('edge:added')
    graph.off('edge:removed')
    graph.off('blank:click')
    graph.off('blank:mousedown')
    graph.off('blank:mouseup')
    graph.off('history:change')
    graph.off('history:command:added')
    graph.off('history:undo')
    graph.off('history:redo')
    graph.off('cell:added')
    graph.off('cell:removed')
    graph.off('cell:changed')
    
    // 移除开发环境下的调试事件监听器
    if (import.meta.env.DEV && graph.container) {
      const container = graph.container
      // 注意：这里需要移除之前添加的具体函数引用，但由于函数是在bindEvents中定义的局部函数
      // 我们无法直接引用，所以这里使用removeAllListeners的方式
      // 或者在实际项目中应该将这些函数定义在组件级别以便清理
    }
  }

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

  // 🔧 修复ResizeObserver问题：最后销毁graph实例，确保清理所有ResizeObserver
  if (graph) {
    try {
      // 确保移除所有事件监听器
      graph.off()
      // 销毁图形实例，这会清理内部的ResizeObserver和其他资源
      graph.dispose()
      console.log('[TaskFlowCanvas] 图形实例已完全销毁，ResizeObserver已清理')
    } catch (error) {
      console.error('[TaskFlowCanvas] 销毁图形实例时出错:', error)
    } finally {
      graph = null
    }
  }
  
  // 🔧 修复：清理暴露到window对象的自动修复系统函数
  try {
    delete window.initializeLayoutEngineAfterDataLoad
    delete window.initializeGraph
    delete window.initializeNodeOperations
    delete window.initializeConfigDrawers
    console.log('🔧 [TaskFlowCanvas] 已清理window对象上的自动修复系统函数')
  } catch (error) {
    console.error('❌ [TaskFlowCanvas] 清理自动修复函数失败:', error)
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
</style>
