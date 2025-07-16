<template>
  <div class="task-flow-canvas">

    
    <!-- X6 画布容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>
    
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
    
    <!-- 节点配置抽屉 -->
    <NodeConfigDrawer
      v-if="showConfigDrawer"
      :visible="showConfigDrawer"
      :node="selectedNode"
      @close="closeConfigDrawer"
      @update="handleNodeDataUpdate"
    />
    
    <!-- 统一配置抽屉组件 -->
    <TaskFlowConfigDrawers
      v-if="configDrawers"
      :drawer-states="configDrawers?.drawerStates"
      @config-confirm="({ drawerType, config }) => configDrawers?.handleConfigConfirm(drawerType, config)"
      @config-cancel="({ drawerType }) => configDrawers?.handleConfigCancel(drawerType)"
    />
    
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <!-- 缩放控制工具栏 -->
      <a-button-group>
        <a-button @click="zoomIn" size="small" title="放大 (+)">
          <template #icon><icon-plus /></template>
        </a-button>
        <a-button @click="zoomOut" size="small" title="缩小 (-)">
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
      
      <a-button-group style="margin-left: 8px;">
        <a-button 
          @click="applyStructuredLayout" 
          size="small" 
          type="primary"
          :loading="isApplyingLayout"
        >
          <template #icon><icon-sort /></template>
          结构化布局
        </a-button>
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
import { 
  IconPlus, 
  IconMinus, 
  IconFullscreen, 
  IconRefresh, 
  IconDelete, 
  IconDownload,
  IconSort
} from '@arco-design/web-vue/es/icon'

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

// 手动布局状态
const isApplyingLayout = ref(false)

// 缩放相关状态
const currentScale = ref(1)
let panZoomManager = null

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
    // 使用 setTimeout 确保在下一个事件循环重置
    setTimeout(() => {
      isUpdatingLayout.value = false
    }, 0)
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
      nodeMovable: true,
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
      pannable: true,
      cursor: 'grab',
      passive: false,
      modifiers: [], // 移除修饰键要求，支持直接拖拽移动画布
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
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
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
    configDrawers.value.structuredLayout.initLayoutEngine()
    console.log('[TaskFlowCanvas] 布局引擎初始化完成')
    
    // 获取初始化后的管理器实例
    const layoutEngine = configDrawers.value.structuredLayout.getLayoutEngine()
    const branchManager = configDrawers.value.structuredLayout.getBranchManager()
    const connectionPreviewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()
    
    console.log('[TaskFlowCanvas] 结构化布局组件初始化结果:', {
      layoutEngine: !!layoutEngine,
      branchManager: !!branchManager,
      connectionPreviewManager: !!connectionPreviewManager
    })
    
    if (connectionPreviewManager) {
      console.log('[TaskFlowCanvas] ConnectionPreviewManager 已成功初始化并绑定事件监听器')
    } else {
      console.error('[TaskFlowCanvas] ConnectionPreviewManager 初始化失败')
    }
  }

  // 绑定事件
  bindEvents()
  console.log('[TaskFlowCanvas] 事件绑定完成')
  
  // 初始化缩放监听
  watchZoomChange()
  updateCurrentScale()
  console.log('[TaskFlowCanvas] 缩放监听初始化完成')
  
  // 初始化拖拽缩放管理器
  panZoomManager = new CanvasPanZoomManager(graph)
  console.log('[TaskFlowCanvas] 拖拽缩放管理器初始化完成')
  
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
  
  // 节点点击事件
  graph.on('node:click', ({ node }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      selectedNodeId.value = node.id
      emit('node-selected', nodeData)
    }
  })
  
  // 节点双击事件 - 打开配置
  graph.on('node:dblclick', ({ node }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      selectedNodeId.value = node.id
      
      if (nodeData.type === 'start') {
        // 开始节点打开专用配置抽屉
        selectedStartNodeData.value = nodeData.data || {}
        showStartNodeConfigDrawer.value = true
      } else if (nodeData.type === 'audience-split') {
        // 人群分流节点打开专用配置抽屉
        configDrawers.value?.openConfigDrawer('audience-split', nodeData, nodeData.config || {})
      } else {
        // 其他节点打开通用配置抽屉
        showConfigDrawer.value = true
      }
    }
  })
  
  // 节点移动事件
  graph.on('node:moved', ({ node }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      const position = node.getPosition()
      nodeData.position = position
      emit('node-moved', { nodeId: node.id, position })
    }
  })
  
  // 节点拖拽开始事件
  graph.on('node:move', ({ node }) => {
    isDragging.value = true
    dragNodeType.value = node.getData()?.type || 'unknown'
    console.log('[TaskFlowCanvas] 开始拖拽节点:', node.id, dragNodeType.value)
  })
  
  // 节点拖拽结束事件
  graph.on('node:moved', ({ node }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData) {
      const position = node.getPosition()
      nodeData.position = position
      emit('node-moved', { nodeId: node.id, position })
      
      // 分流节点移动时只更新分支布局，不触发结构化布局
      if (['audience-split', 'event-split', 'ab-test'].includes(nodeData.type)) {
        console.log('[TaskFlowCanvas] 分流节点移动，仅更新分支布局（不触发结构化布局）')
        // 延迟执行，确保位置更新完成
        setTimeout(() => {
          if (configDrawers.value?.structuredLayout?.branchLayoutManager) {
            const config = nodeData.config || {}
            // 只更新分支布局，不调用结构化布局
            configDrawers.value.structuredLayout.branchLayoutManager.updateBranchLayout(node, config, false)
          }
        }, 100)
      } else {
        // 非分流节点移动时，可以触发结构化布局（如果需要的话）
        console.log('[TaskFlowCanvas] 非分流节点移动，可触发结构化布局')
      }
    }
    
    isDragging.value = false
    dragNodeType.value = null
    console.log('[TaskFlowCanvas] 节点拖拽结束:', node.id)
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
      const index = nodes.value.findIndex(n => n.id === cell.id)
      if (index >= 0) {
        const nodeData = nodes.value[index]
        nodes.value.splice(index, 1)
        emit('node-deleted', nodeData)
      }
    }
  })
  
  // Vue组件自定义事件监听
  graph.on('vue:delete', ({ node }) => {
    console.log('[TaskFlowCanvas] 收到Vue组件删除事件:', node.id)
    handleNodeDelete({ node })
  })
  
  graph.on('vue:slot-click', ({ node, data }) => {
    console.log('[TaskFlowCanvas] 收到Vue组件预设位点击事件:', node.id, data)
    handlePresetSlotClick(data)
  })
  
  // 端口点击事件 - 显示节点选择器
  graph.on('node:port:click', ({ node, port }) => {
    const nodeData = nodes.value.find(n => n.id === node.id)
    if (nodeData && port.group === 'out') {
      const portPosition = node.getPortPosition(port.id)
      const graphPosition = graph.localToGraph(portPosition)
      const clientPosition = graph.graphToClient(graphPosition)
      
      nodeSelectorPosition.value = {
        x: clientPosition.x,
        y: clientPosition.y
      }
      nodeSelectorSourceNode.value = nodeData
      showNodeSelector.value = true
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
  const ports = createNodePorts(nodeConfig)
  
  // 创建节点
  const node = graph.addNode({
    id: nodeData.id,
    shape: 'vue-shape',
    x: nodeData.position.x,
    y: nodeData.position.y,
    width: nodeConfig.width || 100,
    height: nodeConfig.height || 100,
    ports,
    data: {
      nodeType: nodeData.type,
      label: nodeData.label,
      selected: false,
      deletable: nodeData.type !== 'start',
      level: nodeData.data?.level || 0,
      levelIndex: nodeData.data?.levelIndex || 0,
      ...nodeData.data
    }
  })
  
  console.log('[TaskFlowCanvas] X6节点创建成功，节点数据:', node.getData())
  
  // 添加到节点列表
  nodes.value.push(nodeData)
  console.log('[TaskFlowCanvas] 节点已添加到nodes数组，当前节点总数:', nodes.value.length)
  
  // 更新布局统计信息
  updateLayoutStats()
  
  emit('node-created', nodeData)
}

// 创建节点端口配置
const createNodePorts = (nodeConfig) => {
  const ports = {
    groups: {
      in: {
        position: {
          name: 'top',
          args: {
            dx: 0,  // 水平偏移为0，确保在中心
            dy: 0   // 垂直偏移为0，确保在边缘
          }
        },
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff',
            style: {
              visibility: 'visible'
            }
          },
        },
        markup: [{
          tagName: 'circle',
          selector: 'circle'
        }]
      },
      out: {
        position: {
          name: 'bottom',
          args: {
            dx: 0,  // 水平偏移为0，确保在中心
            dy: 0   // 垂直偏移为0，确保在边缘
          }
        },
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            stroke: nodeConfig.color,
            strokeWidth: 2,
            fill: '#fff',
            style: {
              visibility: 'visible'
            }
          },
        },
        markup: [{
          tagName: 'circle',
          selector: 'circle'
        }]
      },
    },
    items: []
  }
  
  // 添加输入端口（除了开始节点）
  if (nodeConfig.label !== '开始节点') {
    ports.items.push({
      group: 'in',
      id: 'in1'
    })
  }
  
  // 添加输出端口
  if (nodeConfig.maxOutputs === 'dynamic') {
    // 动态端口，默认2个
    for (let i = 0; i < 2; i++) {
      ports.items.push({
        group: 'out',
        id: `out${i + 1}`
      })
    }
  } else if (nodeConfig.maxOutputs > 0) {
    for (let i = 0; i < nodeConfig.maxOutputs; i++) {
      ports.items.push({
        group: 'out',
        id: `out${i + 1}`
      })
    }
  }
  
  return ports
}

// 添加连接到图中
const addConnectionToGraph = (connectionData) => {
  if (!graph) return
  
  const sourceNode = graph.getCellById(connectionData.source)
  const targetNode = graph.getCellById(connectionData.target)
  
  if (sourceNode && targetNode) {
    graph.addEdge({
      id: connectionData.id,
      source: {
        cell: connectionData.source,
        port: connectionData.sourcePort
      },
      target: {
        cell: connectionData.target,
        port: connectionData.targetPort
      }
    })
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
    
    // 确定输出端口ID
    const sourcePortId = maxOutputs === 'dynamic' || maxOutputs > 1 
      ? `out${branchIndex + 1}` 
      : 'out1'
    
    // 创建连接
    const connection = {
      id: `edge_${Date.now()}`,
      source: nodeSelectorSourceNode.value.id,
      target: result.nodeData.id,
      sourcePort: sourcePortId,
      targetPort: 'in1',
      label: result.connectionLabel || ''
    }
    
    addConnectionToGraph(connection)
    connections.value.push(connection)
    
    console.log(`[TaskFlowCanvas] 节点已通过增强布局添加: ${result.nodeData.id}, 层级: ${result.level}, 连接: ${sourcePortId} -> in1`)
    
    // 更新布局统计信息
    updateLayoutStats()
    
    // 如果是动态端口且需要添加新的输出端口
    if (maxOutputs === 'dynamic' && branchIndex >= 1) {
      addDynamicOutputPort(sourceNode, branchIndex + 2)
    }
  }
  
  // 关闭节点选择器
  closeNodeSelector()
}

// 为动态端口节点添加新的输出端口
const addDynamicOutputPort = (node, portNumber) => {
  const ports = node.getPorts()
  const newPortId = `out${portNumber}`
  
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
  
  const nodeId = node.id
  
  // 从图中删除节点（这会自动删除相关的连接）
  graph.removeCell(nodeId)
  
  // 从节点数据中删除
  const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
  if (nodeIndex >= 0) {
    const deletedNode = nodes.value[nodeIndex]
    nodes.value.splice(nodeIndex, 1)
    
    // 触发节点删除事件
    emit('node-deleted', deletedNode)
  }
  
  // 删除相关连接
  const deletedConnections = connections.value.filter(conn => 
    conn.source === nodeId || conn.target === nodeId
  )
  connections.value = connections.value.filter(conn => 
    conn.source !== nodeId && conn.target !== nodeId
  )
  
  // 清理增强布局管理器的坐标系统
  if (autoLayout && typeof autoLayout.removeNodeFromCoordinateSystem === 'function') {
    autoLayout.removeNodeFromCoordinateSystem(nodeId)
  }
  
  // 更新布局统计信息
  updateLayoutStats()
  
  // 如果删除的节点有子节点，需要重新布局
  const hasChildNodes = deletedConnections.some(conn => conn.source === nodeId)
  if (hasChildNodes && autoLayout && typeof autoLayout.relayoutAll === 'function') {
    // 延迟重新布局，确保删除操作完成
    nextTick(() => {
      const remainingNodes = graph.getNodes()
      const remainingEdges = graph.getEdges()
      autoLayout.relayoutAll(remainingNodes, remainingEdges)
      console.log('[TaskFlowCanvas] 节点删除后重新布局完成')
    })
  }
  
  // 清除选中状态
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null
  }
  
  // 关闭配置抽屉（如果正在配置被删除的节点）
  if (selectedNode.value?.id === nodeId) {
    closeConfigDrawer()
  }
  
  console.log(`[TaskFlowCanvas] 节点 ${nodeId} 已删除，清理了 ${deletedConnections.length} 个连接`)
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

// 开始节点配置抽屉事件处理
const handleStartNodeConfigConfirm = (configData) => {
  console.log('[TaskFlowCanvas] 开始节点配置确认:', configData)
  
  // 找到开始节点并更新其数据
  const startNodeIndex = nodes.value.findIndex(n => n.type === 'start')
  if (startNodeIndex >= 0) {
    const startNode = nodes.value[startNodeIndex]
    
    // 更新节点数据
    startNode.data = {
      ...startNode.data,
      ...configData
    }
    
    // 更新图中的节点数据
    const graphNode = graph.getCellById(startNode.id)
    if (graphNode) {
      graphNode.setData({
        ...graphNode.getData(),
        ...configData
      })
    }
    
    emit('node-updated', startNode)
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
const applyStructuredLayout = async () => {
  if (isApplyingLayout.value || isUpdatingLayout.value) {
    console.log('[TaskFlowCanvas] 布局操作正在进行中，跳过')
    return
  }
  
  try {
    isApplyingLayout.value = true
    isUpdatingLayout.value = true
    
    console.log('[TaskFlowCanvas] 开始应用结构化布局')
    
    // 清理节点样式缓存
    nodeStyleCache.clear()
    
    console.log('[TaskFlowCanvas] 图实例:', graph)
    console.log('[TaskFlowCanvas] configDrawers:', configDrawers.value)
    console.log('[TaskFlowCanvas] structuredLayout:', configDrawers.value?.structuredLayout)
    console.log('[TaskFlowCanvas] isReady:', configDrawers.value?.structuredLayout?.isReady?.value)
    
    if (!graph) {
      console.warn('[TaskFlowCanvas] 图实例不存在')
      return
    }
    
    if (!configDrawers.value?.structuredLayout) {
      console.warn('[TaskFlowCanvas] 结构化布局对象不存在')
      return
    }
    
    if (!configDrawers.value.structuredLayout.isReady.value) {
      console.warn('[TaskFlowCanvas] 结构化布局未就绪，尝试初始化')
      // 尝试初始化布局引擎
      if (configDrawers.value.structuredLayout.initLayoutEngine) {
        configDrawers.value.structuredLayout.initLayoutEngine()
        console.log('[TaskFlowCanvas] 布局引擎初始化完成，重新检查就绪状态:', configDrawers.value.structuredLayout.isReady.value)
      }
      
      if (!configDrawers.value.structuredLayout.isReady.value) {
        console.error('[TaskFlowCanvas] 结构化布局初始化失败')
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
      zoomToFit()
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
  clearCanvas,
  exportData,
  zoomIn,
  zoomOut,
  zoomToFit,
  resetZoom
})
</script>

<style scoped>
.task-flow-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden; /* 防止滚动条出现 */
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none; /* 防止文本选择 */
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
</style>
