<template>
  <div class="task-flow-canvas">


    <!-- X6 画布容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>

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
        <!-- 智能布局下拉菜单 -->
        <a-dropdown>
          <a-button size="small" type="primary" :loading="isApplyingLayout">
            <template #icon><icon-sort /></template>
            智能布局
            <template #suffix><icon-down /></template>
          </a-button>
          <template #content>
            <a-doption @click="() => handleLayoutOptionSelect('enhanced')">
              <template #icon><icon-sort /></template>
              增强型布局
            </a-doption>
            <a-doption @click="() => handleLayoutOptionSelect('intelligent')">
              <template #icon><icon-thunderbolt /></template>
              智能分层布局
            </a-doption>
            <a-doption @click="() => handleLayoutOptionSelect('native-dagre')">
              <template #icon><icon-sort /></template>
              原生Dagre布局
            </a-doption>
            <a-doption @click="() => handleLayoutOptionSelect('center')">
              <template #icon><icon-location /></template>
              居中对齐
            </a-doption>
          </template>
        </a-dropdown>
        
        <a-button @click="clearCanvas" size="small" status="danger">
          <template #icon><icon-delete /></template>
          清空画布
        </a-button>
        <a-button @click="exportData" size="small">
          <template #icon><icon-download /></template>
          导出数据
        </a-button>
      </a-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Graph, Shape, Cell } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import NodeTypeSelector from '../../../../components/NodeTypeSelector.vue'
import NodeConfigDrawer from '../../../../components/NodeConfigDrawer.vue'
import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import TaskFlowConfigDrawers from './TaskFlowConfigDrawers.vue'
import FlowNode from '../../../../components/FlowNode.vue'
import { getNodeConfig } from '../../../../utils/nodeTypes.js'
import { useConfigDrawers } from '../../../../composables/useConfigDrawers.js'
import { useEnhancedAutoLayout } from '../../../../composables/useEnhancedAutoLayout.js'
import CanvasPanZoomManager from '../../../../utils/CanvasPanZoomManager.js'
import { nodeConfigManager } from '../../../../utils/NodeConfigManager.js'
import { registerCustomShapes } from '../../../../utils/x6Config.js'
import { createBranchConnectionConfig, validateConnectionConfig } from '../../../../utils/connectionConfigFactory.js'
import { connectionErrorHandler, logger } from '../../../../utils/enhancedErrorHandler.js'
import portConfigFactory from '../../../../utils/portConfigFactory.js'
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
  IconDown
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
let graph = null

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

// 删除状态
const isDeletingNode = ref(false)

// 手动布局状态
const isApplyingLayout = ref(false)

// 缩放相关状态
const currentScale = ref(1)
let panZoomManager = null

// 拖拽模式相关状态
const currentDragMode = ref('default')

// 添加防护标志，避免递归更新
const isUpdatingScale = ref(false)
const isUpdatingLayout = ref(false)

// 初始化增强自动布局管理
const autoLayout = useEnhancedAutoLayout(() => graph)

// 使用 ref 而不是 computed 来避免递归更新问题
const layoutStats = ref(null)

// 手动更新统计信息的函数
const updateLayoutStats = () => {
  if (isUpdatingLayout.value) {
    console.log('[TaskFlowCanvas] 统计信息更新正在进行中，跳过')
    return // 防止递归更新
  }

  try {
    isUpdatingLayout.value = true
    const stats = autoLayout.currentStats.value
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

// 配置抽屉管理器（响应式变量）
const configDrawers = ref(null)

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
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      // anchor: 自动处理端口连接
      connectionPoint: 'anchor',
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

  // 初始化配置抽屉管理器（只初始化一次）
  if (!configDrawers.value) {
    const nodeOperations = {}
    configDrawers.value = useConfigDrawers(() => graph, nodeOperations)
    console.log('[TaskFlowCanvas] 配置抽屉管理器初始化完成')
  }

  // 初始化自动布局管理器
  autoLayout.initLayoutManager()
  console.log('[TaskFlowCanvas] 自动布局管理器初始化完成')

  // 初始化统计信息
  updateLayoutStats()
  console.log('[TaskFlowCanvas] 布局统计信息初始化完成')

  // 手动初始化结构化布局和连接预览管理器
  console.log('[TaskFlowCanvas] 开始手动初始化结构化布局')
  if (configDrawers.value?.structuredLayout) {
    // 首先初始化布局引擎
    configDrawers.value.structuredLayout.initializeLayoutEngine()
    console.log('[TaskFlowCanvas] 布局引擎初始化完成')

    // 获取初始化后的管理器实例
    const layoutEngine = configDrawers.value.structuredLayout.getLayoutEngine()
    const branchManager = configDrawers.value.structuredLayout.getBranchManager()
    const connectionPreviewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()

    console.log('[TaskFlowCanvas] 结构化布局组件初始化结果:', {
      layoutEngine: !!layoutEngine,
      branchManager: !!branchManager,
      unifiedPreviewManager: !!connectionPreviewManager
    })

    if (connectionPreviewManager) {
      console.log('[TaskFlowCanvas] 统一预览线管理器已成功初始化并绑定事件监听器')
    } else {
      console.error('[TaskFlowCanvas] 统一预览线管理器初始化失败')
    }
  }

  // 获取已有的统一预览线管理器（避免重复创建）
  console.log('[TaskFlowCanvas] 获取已有的统一预览线管理器')
  let enhancedPreviewManager = null
  if (configDrawers.value?.structuredLayout) {
    enhancedPreviewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()

    if (enhancedPreviewManager) {
      console.log('[TaskFlowCanvas] 已获取现有的统一预览线管理器')

      // 暴露到全局变量以便调试（保持兼容性）
      window.enhancedPreviewManager = enhancedPreviewManager
      console.log('🔍 [TaskFlowCanvas] 统一预览线管理器已暴露到全局变量')
    } else {
      console.error('[TaskFlowCanvas] 无法获取统一预览线管理器')
    }
  } else {
    console.error('[TaskFlowCanvas] StructuredLayout 不存在，无法获取统一预览线管理器')
  }

  // 初始化拖拽缩放管理器（在绑定其他事件之前）
  panZoomManager = new CanvasPanZoomManager(graph)
  console.log('[TaskFlowCanvas] 拖拽缩放管理器初始化完成')

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

  // 添加画布级别的鼠标事件监听（用于调试）
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
        selectedStartNodeData.value = latestConfig
        showStartNodeConfigDrawer.value = true
        console.log('[TaskFlowCanvas] 打开开始节点配置抽屉')
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
    dragNodeType.value = node.getData()?.type || 'unknown'
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
    // 在节点拖拽过程中触发吸附逻辑
    const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
    if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
      const position = node.getPosition()
      const size = node.getSize()
      const centerX = position.x + size.width / 2
      const centerY = position.y + size.height / 2

      // 调用统一预览线管理器的吸附高亮逻辑
      unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)

      // 同时检测是否接近预览线的拖拽提示点
      const dragHints = graph.getNodes().filter(n => {
        const data = n.getData() || {}
        return data.isDragHint || data.type === 'drag-hint'
      })

      dragHints.forEach(hint => {
        const hintPos = hint.getPosition()
        const hintSize = hint.getSize()
        const hintCenterX = hintPos.x + hintSize.width / 2
        const hintCenterY = hintPos.y + hintSize.height / 2

        const distance = Math.sqrt(
          Math.pow(centerX - hintCenterX, 2) +
          Math.pow(centerY - hintCenterY, 2)
        )

        if (distance <= 50) { // 50px 吸附范围
          // 高亮拖拽提示点
          hint.setAttrs({
            body: {
              ...hint.getAttrs().body,
              stroke: '#ff4d4f',
              strokeWidth: 3,
              fill: 'rgba(255, 77, 79, 0.1)'
            }
          })
        }
      })
    }
  
  })

  // 节点位置变化事件（备用方案）
  graph.on('node:change:position', ({ node, current, previous }) => {
    if (isDragging.value) {
      // 在节点位置变化时触发吸附逻辑
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.highlightNearbyNodes === 'function') {
        const size = node.getSize()
        const centerX = current.x + size.width / 2
        const centerY = current.y + size.height / 2

        // 调用统一预览线管理器的吸附高亮逻辑
        unifiedPreviewManager.highlightNearbyNodes(centerX, centerY)
      }
    }
  })

  // 节点移动完成事件（合并处理）
  graph.on('node:moved', async ({ node }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      const position = node.getPosition()
      nodeData.position = position
      emit('node-moved', { nodeId: node.id, position })

      // 强制刷新所有拖拽提示点位置（解决自动化布局后位置不同步问题）
      const unifiedPreviewManager = configDrawers.value?.structuredLayout?.getConnectionPreviewManager()
      if (unifiedPreviewManager && typeof unifiedPreviewManager.refreshAllPreviewLines === 'function') {
        try {
          unifiedPreviewManager.refreshAllPreviewLines()
          console.log('🔄 [节点移动] 已刷新所有预览线和拖拽提示点位置')
        } catch (error) {
          console.warn('⚠️ [节点移动] 刷新预览线位置失败:', error)
        }
      }

      // 检测是否需要自动连接到预览线
      if (unifiedPreviewManager) {
        const size = node.getSize()
        const centerX = position.x + size.width / 2
        const centerY = position.y + size.height / 2

        // 检测是否接近拖拽提示点，如果是则尝试自动连接
        const dragHints = graph.getNodes().filter(n => {
          const data = n.getData() || {}
          return data.isDragHint || data.type === 'drag-hint'
        })

        // 找到最近的拖拽提示点
        let nearestHint = null
        let nearestDistance = Infinity

        dragHints.forEach(hint => {
          const hintPos = hint.getPosition()
          const hintSize = hint.getSize()
          const hintCenterX = hintPos.x + hintSize.width / 2
          const hintCenterY = hintPos.y + hintSize.height / 2

          const distance = Math.sqrt(
            Math.pow(centerX - hintCenterX, 2) +
            Math.pow(centerY - hintCenterY, 2)
          )

          if (distance <= 80 && distance < nearestDistance) { // 80px 吸附范围（增加范围）
            nearestDistance = distance
            nearestHint = hint
          }
        })

        // 如果找到最近的拖拽提示点，则进行连接
        if (nearestHint) {
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
                const allNodes = graph.getNodes()
                sourceNode = allNodes.find(node => node.id.startsWith(sourceNodeId))
              }

              if (sourceNode && sourceNode.isNode && sourceNode.isNode() && sourceNode.id !== node.id) {
                // 创建连接
                try {
                  const branchId = hintData.branchId || 'default'
                  const branchLabel = hintData.branchLabel // 获取分支标签
                  const sourcePort = 'out' // 统一使用'out'端口，从UI层面的同一个位置出发
                  


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
                    logger.error('连接配置验证失败', { 
                      connectionConfig, 
                      errors: validationResult.errors 
                    })
                    return
                  }

                  const connectionResult = await connectionErrorHandler.safeCreateConnection(
                    graph,
                    connectionConfig
                  )

                  if (!connectionResult.success) {
                    logger.error('连接创建失败', { errors: connectionResult.errors })
                    return
                  }

                  const connection = connectionResult.result

                  // 通知统一预览线管理器节点已连接，传递标签信息
                  if (unifiedPreviewManager.onNodeConnected) {
                    unifiedPreviewManager.onNodeConnected(sourceNode, branchId, branchLabel)
                  }

                } catch (error) {
                  console.error('💥 [自动连接] 自动连接失败:', error)
                }
              }
            }
          }

          // 清除拖拽过程中的高亮效果
          unifiedPreviewManager.clearNodeHighlights()

          dragHints.forEach(hint => {
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

          // 分流节点移动时只更新分支布局，不触发结构化布局
          if (['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)) {
            // 延迟执行，确保位置更新完成
            setTimeout(() => {
              if (configDrawers.value?.structuredLayout?.branchLayoutManager) {
                const config = nodeData.config || {}
                // 只更新分支布局，不调用结构化布局
                configDrawers.value.structuredLayout.branchLayoutManager.updateBranchLayout(node, config, false)
              }
              isDragging.value = false
              dragNodeType.value = null
            }, 100)
          }
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
      
      connections.value.push(connection)
      emit('connection-created', connection)
    }
  })

  // 连接删除事件
  graph.on('edge:removed', ({ edge }) => {
    const index = connections.value.findIndex(c => c.id === edge.id)
    if (index >= 0) {
      connections.value.splice(index, 1)
    }
  })

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
      if (cellData.isDragHint || cellData.type === 'drag-hint' || cell.id.includes('hint_')) {
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
        
        let portX = nodePosition.x
        let portY = nodePosition.y
        
        // 根据端口配置计算位置
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
        const centerPosition = {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height / 2
        }
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

      // 更新本地节点数据，保持与图形节点实例的数据结构一致
      nodeData.config = config
      nodeData.data = {
        ...nodeData.data,
        config: config,
        lastUpdated: Date.now()
      }

      emit('node-updated', nodeData)
    }
  })
}

// 加载初始数据
const loadInitialData = () => {
  if (props.initialNodes.length > 0) {
    props.initialNodes.forEach(nodeData => {
      addNodeToGraph(nodeData)
    })
  }

  if (props.initialConnections.length > 0) {
    props.initialConnections.forEach(connectionData => {
      addConnectionToGraph(connectionData)
    })
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

  // 使用增强布局管理器添加开始节点
  const result = autoLayout.addNodeWithEnhancedLayout('start', null, {
    forceLevel: 0
  })

  if (result) {
    // 更新节点数据以包含固定属性
    result.nodeData.data = {
      ...result.nodeData.data,
      fixed: true,
      level: 0
    }

    console.log('[TaskFlowCanvas] 创建的开始节点数据:', result.nodeData)
    addNodeToGraph(result.nodeData)

    // 初始化布局管理器的坐标系统
    autoLayout.initLayoutManager()

    console.log(`[TaskFlowCanvas] 开始节点已通过增强布局添加: ${result.nodeData.id}, 层级: ${result.level}`)
  } else {
    // 降级处理：如果增强布局失败，使用传统方式
    const startNodeData = {
      id: 'start-node',
      type: 'start',
      label: nodeConfig.label,
      position: { x: 400, y: 100 },
      data: {
        fixed: true,
        level: 0
      },
      config: nodeConfig
    }

    console.log('[TaskFlowCanvas] 降级处理：创建的开始节点数据:', startNodeData)
    addNodeToGraph(startNodeData)
  }
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
  
  // 创建节点
  const node = graph.addNode({
    id: nodeData.id,
    shape: 'vue-shape',
    x: position.x,
    y: position.y,
    width: nodeConfig.width || 100,
    height: nodeConfig.height || 100,
    ports,
    data: {
      ...nodeData.data,
      type: nodeData.type,  // 确保节点类型正确设置
      nodeType: nodeData.type,  // 保持兼容性
      label: nodeData.label,
      selected: false,
      deletable: nodeData.type !== 'start',
      level: nodeData.data?.level || 0,
      levelIndex: nodeData.data?.levelIndex || 0
    }
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
  
  // 使用专门的端口配置工厂
  const portConfig = portConfigFactory.createNodePortConfig(nodeType, nodeConfig)
  
  console.log('[TaskFlowCanvas] 端口配置结果:', portConfig)
  
  return portConfig
}

// 添加连接到图中
const addConnectionToGraph = (connectionData) => {
  console.log('🔗 [TaskFlowCanvas] 开始创建连接:', connectionData)
  
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
        name: 'manhattan'
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 确保连接从端口开始
      connectionPoint: 'anchor'
    }
    
    console.log('⚙️ [TaskFlowCanvas] 连接配置:', edgeConfig)
    
    try {
      const edge = graph.addEdge(edgeConfig)
      console.log('✅ [TaskFlowCanvas] 连接创建成功:', {
        edgeId: edge.id,
        sourceCell: edge.getSourceCellId(),
        sourcePort: edge.getSourcePortId(),
        targetCell: edge.getTargetCellId(),
        targetPort: edge.getTargetPortId()
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

  // 使用增强自动布局添加节点
  const result = autoLayout.addNodeWithEnhancedLayout(nodeType, sourceNode, {
    branchIndex,
    totalBranches,
    connectionLabel: `分支${branchIndex + 1}`
  })

  if (result) {
    // 添加节点到图中
    addNodeToGraph(result.nodeData)

    // 统一使用'out'端口，从UI层面的同一个位置出发
    let sourcePortId = 'out'

    // 创建连接
    const connection = {
      id: `edge_${Date.now()}`,
      source: nodeSelectorSourceNode.value.id,
      target: result.nodeData.id,
      sourcePort: sourcePortId,
      targetPort: 'in',
      label: result.connectionLabel || ''
    }

    addConnectionToGraph(connection)
    connections.value.push(connection)

    console.log(`[TaskFlowCanvas] 节点已通过增强布局添加: ${result.nodeData.id}, 层级: ${result.level}, 连接: ${sourcePortId} -> in`)

    // 更新布局统计信息
    updateLayoutStats()

    // 如果是动态端口且需要添加新的输出端口
    if (maxOutputs === 'dynamic' && branchIndex >= 0) {
      addDynamicOutputPort(sourceNode, branchIndex + 2)
    }
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

  // 级联删除完成后重新布局
  if (autoLayout && typeof autoLayout.relayoutAll === 'function') {
    nextTick(() => {
      const remainingNodes = graph.getNodes()
      const remainingEdges = graph.getEdges()
      autoLayout.relayoutAll(remainingNodes, remainingEdges)
      console.log('[TaskFlowCanvas] 级联删除后重新布局完成')
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

    // 7. 清理增强布局管理器的坐标系统
    if (autoLayout && typeof autoLayout.removeNodeFromCoordinateSystem === 'function') {
      autoLayout.removeNodeFromCoordinateSystem(nodeId)
    }

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
            if (!nodeData.isDragHint && !nodeData.isUnifiedPreview && !nodeData.isPersistentPreview) {
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
        startNode.config = configData
        startNode.data = {
          ...startNode.data,
          config: configData,
          lastUpdated: Date.now()
        }

        console.log('[TaskFlowCanvas] 本地节点数据已更新:', startNode)

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

// 处理布局选项选择
const handleLayoutOptionSelect = async (value) => {
  // 强制重置所有状态，确保没有残留
  forceResetLayoutStates()
  
  console.log('[TaskFlowCanvas] 选择布局选项:', value)

  try {
    // 设置布局状态
    isApplyingLayout.value = true

    switch (value) {
      case 'enhanced':
        await applyEnhancedLayout()
        break
      case 'intelligent':
        await applyIntelligentLayout()
        break
      case 'native-dagre':
        await applyNativeDagreLayout()
        break
      case 'center':
        await applyCenterAlignment()
        break
      default:
        console.warn('[TaskFlowCanvas] 未知的布局选项:', value)
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 应用布局失败:', error)
    Message.error('布局应用失败，请重试')
  } finally {
    setTimeout(() => {
      isApplyingLayout.value = false
      isUpdatingLayout.value = false
    }, 200)
  }
}

// 应用增强型布局
const applyEnhancedLayout = async () => {
  console.log('[TaskFlowCanvas] 应用增强型布局')
  await applyStructuredLayout()
}

// 应用智能分层布局
const applyIntelligentLayout = async () => {
  console.log('[TaskFlowCanvas] 应用智能分层布局')
  
  if (!configDrawers.value?.structuredLayout) {
    console.error('[TaskFlowCanvas] 结构化布局对象不存在')
    return
  }

  // 确保布局引擎已初始化
  if (!configDrawers.value.structuredLayout.isReady) {
    console.log('[TaskFlowCanvas] 布局引擎未就绪，尝试初始化')
    if (configDrawers.value.structuredLayout.initializeLayoutEngine) {
      const initSuccess = configDrawers.value.structuredLayout.initializeLayoutEngine()
      console.log('[TaskFlowCanvas] 布局引擎初始化结果:', initSuccess)
      if (!initSuccess) {
        console.error('[TaskFlowCanvas] 布局引擎初始化失败')
        Message.error('布局引擎初始化失败')
        return
      }
    }
  }

  // 调试：检查structuredLayout对象的所有方法
  console.log('[TaskFlowCanvas] structuredLayout 可用方法:', Object.keys(configDrawers.value.structuredLayout))
  console.log('[TaskFlowCanvas] applyIntelligentLayout 方法存在:', !!configDrawers.value.structuredLayout.applyIntelligentLayout)
  console.log('[TaskFlowCanvas] applyIntelligentLayout 类型:', typeof configDrawers.value.structuredLayout.applyIntelligentLayout)

  // 检查智能布局引擎是否可用
  if (!configDrawers.value.structuredLayout.applyIntelligentLayout) {
    console.error('[TaskFlowCanvas] 智能布局功能不可用')
    Message.error('智能布局功能不可用，请使用增强型布局')
    return
  }

  try {
    // 应用智能布局
    const success = await configDrawers.value.structuredLayout.applyIntelligentLayout({
      centerAfterLayout: true,
      animateTransition: true
    })

    if (success) {
      console.log('[TaskFlowCanvas] 智能分层布局应用成功')
      Message.success('智能分层布局应用成功')
      
      // 自动缩放到合适大小
      await nextTick()
      setTimeout(() => {
        zoomToFit()
      }, 300)
    } else {
      console.error('[TaskFlowCanvas] 智能分层布局应用失败')
      Message.error('智能分层布局应用失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 智能分层布局应用异常:', error)
    Message.error('智能分层布局应用异常')
  }
}

// 应用原生Dagre布局
const applyNativeDagreLayout = async () => {
  console.log('[TaskFlowCanvas] 应用原生Dagre布局')
  
  if (!configDrawers.value?.structuredLayout) {
    console.error('[TaskFlowCanvas] 结构化布局对象不存在')
    return
  }

  // 检查原生Dagre布局方法是否可用
  if (!configDrawers.value.structuredLayout.applyNativeDagreLayout) {
    console.error('[TaskFlowCanvas] 原生Dagre布局功能不可用')
    Message.error('原生Dagre布局功能不可用')
    return
  }

  try {
    // 应用原生Dagre布局
    const result = await configDrawers.value.structuredLayout.applyNativeDagreLayout(graph)

    if (result && result.success) {
      console.log('[TaskFlowCanvas] 原生Dagre布局应用成功:', result)
      Message.success(`原生Dagre布局应用成功 (${result.layoutTime.toFixed(2)}ms)`)
      
      // 自动缩放到合适大小
      await nextTick()
      setTimeout(() => {
        zoomToFit()
      }, 300)
    } else {
      console.error('[TaskFlowCanvas] 原生Dagre布局应用失败')
      Message.error('原生Dagre布局应用失败')
    }
  } catch (error) {
    console.error('[TaskFlowCanvas] 原生Dagre布局应用异常:', error)
    Message.error('原生Dagre布局应用异常: ' + error.message)
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
  try {
    isApplyingLayout.value = true
    isUpdatingLayout.value = true

    console.log('[TaskFlowCanvas] 开始应用结构化布局')

    // 清理节点样式缓存
    nodeStyleCache.clear()

    console.log('[TaskFlowCanvas] 图实例:', graph)
    console.log('[TaskFlowCanvas] configDrawers:', configDrawers.value)
    console.log('[TaskFlowCanvas] structuredLayout:', configDrawers.value?.structuredLayout)
    
    // 使用getIsReady方法获取正确的isReady值
    const isReadyValue = configDrawers.value?.structuredLayout?.getIsReady?.()
    console.log('[TaskFlowCanvas] isReady:', isReadyValue)

    if (!graph) {
      console.warn('[TaskFlowCanvas] 图实例不存在')
      return
    }

    if (!configDrawers.value?.structuredLayout) {
      console.warn('[TaskFlowCanvas] 结构化布局对象不存在')
      return
    }

    // 检查结构化布局是否就绪
    const isLayoutReady = configDrawers.value.structuredLayout.getIsReady?.()
    console.log('[TaskFlowCanvas] 布局就绪状态:', isLayoutReady)
    
    if (!isLayoutReady) {
      console.warn('[TaskFlowCanvas] 结构化布局未就绪，尝试初始化')
      // 尝试初始化布局引擎
      if (configDrawers.value.structuredLayout.initializeLayoutEngine) {
        configDrawers.value.structuredLayout.initializeLayoutEngine()
        const newReadyState = configDrawers.value.structuredLayout.getIsReady?.()
        console.log('[TaskFlowCanvas] 布局引擎初始化完成，重新检查就绪状态:', newReadyState)
        
        if (!newReadyState) {
          console.error('[TaskFlowCanvas] 结构化布局初始化失败')
          return
        }
      } else {
        console.error('[TaskFlowCanvas] 初始化方法不存在')
        return
      }
    }

    console.log('[TaskFlowCanvas] 开始应用结构化布局')

    // 应用结构化布局
    await configDrawers.value.structuredLayout.applyLayout()

    // 自动缩放到合适大小
    await nextTick()

    // 延迟执行缩放，避免与布局冲突
    setTimeout(() => {
      if (!isApplyingLayout.value) return // 如果布局已经结束，不执行缩放
      
      // 限制结构化布局的最大缩放比例为120%
      const currentZoom = graph.zoom()
      const targetZoom = Math.min(currentZoom, 1.2) // 限制最大缩放比例为120%
      
      if (currentZoom > 1.2) {
        console.log(`[TaskFlowCanvas] 限制缩放比例从 ${currentZoom.toFixed(2)} 到 1.2`)
        graph.zoomTo(1.2, { center: graph.getGraphArea().center })
      } else {
        zoomToFit()
      }
    }, 200)

    console.log('[TaskFlowCanvas] 结构化布局应用完成')
  } catch (error) {
    console.error('[TaskFlowCanvas] 应用结构化布局失败:', error)
  } finally {
    // 使用较长的延迟确保所有操作完成
    setTimeout(() => {
      isApplyingLayout.value = false
      isUpdatingLayout.value = false
    }, 200)
  }
}

const clearCanvas = () => {
  if (graph) {
    isGraphReady.value = false
    graph.clearCells()
    nodes.value = []
    connections.value = []
    selectedNodeId.value = null

    // 清理增强布局管理器的坐标系统
    if (autoLayout && typeof autoLayout.clearEnhancedLayout === 'function') {
      autoLayout.clearEnhancedLayout()
    }

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
  return {
    nodes: nodes.value,
    connections: connections.value
  }
}

// 加载画布数据（用于自动修复后重新渲染）
const loadCanvasData = (data) => {
  if (!graph || !data) return

  try {
    // 清空当前画布
    graph.clearCells()
    
    // 重新加载节点
    data.nodes.forEach(nodeData => {
      addNodeToGraph(nodeData)
    })
    
    // 重新加载连接
    data.connections.forEach(connectionData => {
      addConnectionToGraph(connectionData)
    })
    
    console.log('[TaskFlowCanvas] 画布数据已重新加载')
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
}

// 生命周期
onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // 销毁拖拽缩放管理器
  if (panZoomManager) {
    panZoomManager.destroy()
    panZoomManager = null
  }

  if (graph) {
    graph.dispose()
  }
})

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
  currentDragMode
})
</script>

<style scoped>
.task-flow-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
  /* 防止滚动条出现 */
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  /* 防止文本选择 */
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
</style>
