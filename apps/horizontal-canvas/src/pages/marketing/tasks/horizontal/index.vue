<template>
  <div class="horizontal-task-flow-page">
  <div class="page-header">
    <div class="title">横版任务流</div>
    <a-card title="基础信息" class="basic-info-card">
      <a-form :model="formModel" layout="vertical" @submit.prevent>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="任务名称" required>
              <a-input v-model="taskName" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="任务说明">
              <a-input v-model="taskDescription" placeholder="请输入任务说明" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="当前版本">
              <a-input-number v-model="taskVersion" :min="1" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 4px;">
          <a-col :span="8">
            <a-form-item label="任务状态">
              <a-tag :color="taskStatus === 'published' ? 'green' : 'blue'">{{ taskStatus === 'published' ? '已发布' : '草稿' }}</a-tag>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="创建时间">
              <span>{{ createdTime }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8" style="text-align: right;">
            <a-space>
              <a-button @click="goBack">返回</a-button>
              <a-button v-if="!isViewMode" type="primary" @click="saveTask">保存</a-button>
              <a-button v-if="!isViewMode" type="primary" status="success" @click="publishTask">发布</a-button>
              <!-- 测试按钮 -->
              <a-button @click="testClick" size="small">测试</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>

  <div class="content" ref="contentRef" :style="{ paddingRight: (showStatisticsPanel && isViewMode && isPublished) ? (statisticsPanelWidth + 'px') : '0px' }">

    

    <CanvasHistoryPanel
      v-if="showHistoryPanel"
      :visible="showHistoryPanel"
      :history-stack="historyStack"
      @close="showHistoryPanel = false"
      @jump-to-state="handleJumpToHistoryState"
    />

      <!-- 工具栏 - 移动到画布容器外部 -->
      <div class="canvas-toolbar-wrapper" ref="toolbarWrapperRef">
        <CanvasToolbar
          :show-debug-panel="false"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @reset-zoom="handleResetZoom"
          @set-zoom="handleSetZoom"
          @fit-content="handleFitContent"
          @apply-quick-layout="handleQuickLayout"
          @toggle-minimap="handleToggleMinimap"
          @add-node="handleAddNode"
          @toggle-history-panel="showHistoryPanel = !showHistoryPanel"
          @toggle-statistics-panel="onToggleStatisticsPanel"
          @undo="handleUndo"
          @redo="handleRedo"
          :show-zoom="true"
          :show-add-node="!isViewMode"
          :show-layout="true"
          :show-layout-direction="false"
          :show-minimap-toggle="true"
          :show-extras="true"
          :show-clear="!isViewMode"
          :show-undo-redo="!isViewMode"
          :show-history="!isViewMode"
          :show-statistics="isViewMode && isPublished"
          :can-undo="canUndo"
          :can-redo="canRedo"
          :show-history-panel="showHistoryPanel"
          :show-statistics-panel="showStatisticsPanel"
          :show-export="false"
          :show-debug="false"
          :scale-display-text="scaleDisplayText"
        />
      </div>
      
      <div ref="canvasContainerRef" class="canvas-container" :class="{ 'is-panning': isPanning }">
        <!-- 预览图容器 -->
        <div 
          v-if="showMinimap" 
          ref="minimapContainer" 
          class="minimap-container"
          :style="{ left: minimapPosition.left + 'px', top: minimapPosition.top + 'px' }"
        ></div>
      </div>
      <div 
        v-if="showNodeSelector" 
        class="selector-backdrop" 
        @click="closeNodeSelector"
        @dragover.prevent
        @drop="onCanvasDrop"
      ></div>
      <!-- 节点类型选择器（左上角固定显示） -->
      <NodeTypeSelector
        :visible="showNodeSelector"
        :position="nodeSelectorPosition"
        :source-node="nodeSelectorSourceNode"
        :dock="false"
        @select="handleNodeTypeSelected"
        @close="closeNodeSelector"
      />
      <div
        v-if="nodeActionsMenu.visible"
        class="node-actions-menu"
        :style="{ left: nodeActionsMenu.x + 'px', top: nodeActionsMenu.y + 'px' }"
      >
        <button class="menu-item" @click="renameCurrentNode">重命名</button>
        <button class="menu-item" @click="copyCurrentNode">复制</button>
        <button class="menu-item" @click="debugCurrentNode">调试</button>
        <button class="menu-item danger" @click="deleteCurrentNode">删除</button>
        <button class="menu-item" @click="toggleNodeDisabled">{{ currentNodeDisabled ? '启用' : '禁用' }}</button>
      </div>
      <div
        v-if="edgeActionsMenu.visible"
        class="edge-actions-menu"
        :style="{ left: edgeActionsMenu.x + 'px', top: edgeActionsMenu.y + 'px' }"
      >
        <button class="menu-item danger" @click="deleteCurrentEdge">删除连接线</button>
        <button class="menu-item" @click="closeEdgeMenu">取消</button>
      </div>
      <div
        v-if="portActionsMenu.visible"
        class="edge-actions-menu"
        :style="{ left: portActionsMenu.x + 'px', top: portActionsMenu.y + 'px' }"
      >
        <button class="menu-item danger" @click="deleteCurrentPortEdge">删除端口的连接</button>
        <button class="menu-item" @click="closePortMenu">取消</button>
      </div>
    </div>

    <!-- 复用原版抽屉：保持类型和交互一致 -->
    <TaskFlowConfigDrawers
      v-if="configDrawers && configDrawers.drawerStates"
      :drawer-states="configDrawers.drawerStates"
      :read-only="isViewMode"
      @config-confirm="handleConfigConfirmProxy"
      @config-cancel="handleConfigCancelProxy"
      @visibility-change="handleDrawerVisibilityChange"
    />

    <!-- 调试面板 -->
    <CanvasDebugPanel
      v-if="showDebugPanel"
      :visible="showDebugPanel"
      :position="debugPanelPosition"
      :graph="graph"
      :dock-bounds="debugDockBounds"
      @close="closeDebugPanel"
      @update:position="onDebugPanelPositionUpdate"
    />
    
    <!-- 统计信息面板 - 仅在查看模式且发布状态下显示 -->
    <div 
      v-if="showStatisticsPanel && isViewMode && isPublished" 
      class="statistics-panel-container"
      :style="{ left: debugDockBounds.left + 'px', width: debugDockBounds.width + 'px', height: statisticsPanelHeight + 'px' }"
      ref="statisticsPanelRef"
    >
      <div class="statistics-panel-resize-handle--top" @mousedown="startVerticalResize"></div>
      <CanvasStatisticsPanel
        :canvas-id="editingTaskId || 'default-canvas'"
        :graph="graph"
        @close="showStatisticsPanel = false"
        @node-select="handleNodeSelect"
        @path-highlight="handlePathHighlight"
      />
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, provide, reactive, watch } from 'vue';
import { Graph, Shape } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import HorizontalNode from './HorizontalNode.vue';
import { Selection } from '@antv/x6-plugin-selection';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { History } from '@antv/x6-plugin-history';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { provideGraphInstance } from '@/composables/useGraphInstance.js';
import TaskFlowConfigDrawers from '@/components/task/TaskFlowConfigDrawers.vue';
import NodeTypeSelector from '@/components/canvas/NodeTypeSelector.vue';
import CanvasToolbar from '@/components/toolbar/CanvasToolbar.vue';
import CanvasHistoryPanel from '@/components/history/CanvasHistoryPanel.vue';
import CanvasDebugPanel from '@/components/debug/CanvasDebugPanel.vue';
import { getNodeLabel } from '@/utils/nodeTypes.js';
// 水平连接校验：目标在源节点右侧
import { createHorizontalPortConfig } from './utils/portConfigFactoryHorizontal.js';
import { createVueShapeNode } from './createVueShapeNode.js';
import { buildDisplayLines } from './createVueShapeNode.js';
import { useConfigDrawers } from '@/composables/canvas/useConfigDrawers.js';
import { useCanvasHistory } from '@/composables/canvas/useCanvasHistory.js';
import { CanvasController } from './services/CanvasController.js';
// 导入样式常量
import { 
  NODE_DIMENSIONS, 
  COLORS, 
  TYPOGRAPHY, 
  POSITIONS, 
  getNodeIconText,
  getBaseNodeStyles,
  INTERACTION_STATES
} from './styles/nodeStyles.js';
// 导入性能监控和端口验证
import { performanceMonitor } from './utils/performanceMonitor.js';
import { usePortValidation } from './composables/usePortValidation.js';
// 导入横版专用快速布局
import HorizontalQuickLayout from './utils/quickLayout.js';
import { cleanupEdgeVertices } from './layout/LayoutService.ts'
// 导入测试用例
 
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { TaskStorage } from '../../../../utils/taskStorage.js'
import CanvasStatisticsPanel from '@/components/statistics/CanvasStatisticsPanel.vue'
import { collectCanvasData, loadCanvasData as loadCanvasDataSvc, saveTask as saveTaskSvc, publishTask as publishTaskSvc, validateForPublish } from './persistence/PersistenceService'
import { ensureStartNode as ensureStartNodeSvc, updateNodeUnified as updateNodeUnifiedSvc } from './node/NodeService'
import { bindConnectionPolicies, toggleMinimap, useHistory, useKeyboard, useSelection, createGraph, bindDefaultShortcuts, configureSelectionRubberbandGate } from './graph/GraphService.ts'
import { useCanvasState } from './state/useCanvasState.ts'

// 任务基础信息变量
const router = useRouter()
const route = useRoute()
const taskName = ref('')
const taskDescription = ref('')
const taskVersion = ref(1)
const taskStatus = ref('draft')
const createdTime = ref(new Date().toLocaleString('zh-CN'))

const formModel = reactive({ taskName: '', taskDescription: '', taskVersion: 1 })
watch(taskName, v => { formModel.taskName = v })
watch(taskDescription, v => { formModel.taskDescription = v })
watch(taskVersion, v => { formModel.taskVersion = v })

// 编辑模式相关变量
const isEditMode = ref(false)
const editingTaskId = ref(null)
const editingTaskVersion = ref(null)

// 统计面板与画布状态
const { showStatisticsPanel, showMinimap, scaleDisplayText, statisticsPanelWidth, statisticsPanelHeight } = useCanvasState()
const isViewMode = computed(() => route.query.mode === 'view')
const isPublished = computed(() => taskStatus.value === 'published' || taskStatus.value === 'running')

const canvasContainerRef = ref(null)
const contentRef = ref(null)
let graph = null

// 配置抽屉将在后面初始化，确保updateNodeFromConfig函数已定义
let configDrawers = null

// 节点选择器状态
const showNodeSelector = ref(false)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const nodeSelectorSourceNode = ref(null)
let pendingCreatePoint = { x: 0, y: 0 }
let pendingInsertionEdge = null
const nodeActionsMenu = ref({ visible: false, x: 0, y: 0, nodeId: null })
const edgeActionsMenu = ref({ visible: false, x: 0, y: 0, edgeId: null })
const portActionsMenu = ref({ visible: false, x: 0, y: 0, nodeId: null, portId: null, edgeId: null })
// 当前正在配置的抽屉与节点
const activeDrawerKey = ref(null)
const activeNodeId = ref(null)
// 调试面板状态
const showDebugPanel = ref(false)
const debugPanelPosition = ref({ x: 120, y: 100 })
const debugDockBounds = ref({ left: 0, width: 0 })

const canUndo = ref(false)
const canRedo = ref(false)
const showHistoryPanel = ref(false)

// 预览图状态
// 由 useCanvasState 提供 showMinimap
const minimapContainer = ref(null)
let minimap = null
const minimapPosition = ref({ left: 0, top: 0 })
const isPanning = ref(false)
let minimapPaused = false

// 辅助线状态
const showSnapline = ref(true)

// 横版专用快速布局实例
const quickLayout = ref(null)

// 统计面板尺寸与拖拽状态
// 由 useCanvasState 提供 statisticsPanelWidth/statisticsPanelHeight
  const statsPanelPosition = ref({ left: 16, top: 64 })
  const statisticsPanelRef = ref(null)
  const toolbarWrapperRef = ref(null)
const isResizing = ref(false)
const statisticsPanelTop = ref(0)

function updateStatisticsPanelTop() {
  try { useCanvasState().updateStatisticsPanelTop(toolbarWrapperRef.value, statisticsPanelTop) } catch { statisticsPanelTop.value = 0 }
}

function updateDebugDockBounds() {
  try { useCanvasState().updateDebugDockBounds(contentRef.value, showStatisticsPanel, isViewMode.value, isPublished.value, statisticsPanelWidth, debugDockBounds) } catch {}
}

// 计算属性：当前节点是否禁用
const currentNodeDisabled = computed(() => {
  if (!nodeActionsMenu.value.nodeId || !graph) return false
  try {
    const node = graph.getCellById(nodeActionsMenu.value.nodeId)
    if (!node) return false
    const data = node.getData?.() || {}
    return data.disabled === true
  } catch (e) {
    return false
  }
})

/**
 * 测试横版快速布局功能
 */
const testQuickLayout = async () => {
  console.log('🧪 [Horizontal] 开始测试快速布局...')
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  try {
    const currentNodes = graph.getNodes()
    if (currentNodes.length > 0) {
      console.log(`🎯 [Horizontal] 当前画布有${currentNodes.length}个节点，执行实际快速布局...`)
      await handleQuickLayout()
      console.log('✅ [Horizontal] 实际布局完成')
    } else {
      console.log('💡 [Horizontal] 当前画布无节点，建议先添加一些节点进行测试')
    }
  } catch (error) {
    console.error('❌ [Horizontal] 测试失败:', error)
  }
}

const testConnectionRules = () => {
  console.log('🔗 [Horizontal] 开始测试连接规则...')
  
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  
  try {
    // 创建两个测试节点
    const node1Id = `test-conn-1-${Date.now()}`
    const node2Id = `test-conn-2-${Date.now()}`
    
    const node1 = graph.addNode(createVueShapeNode({
      id: node1Id,
      x: 100,
      y: 200,
      label: '连接测试节点1',
      outCount: 2,
      data: { 
        type: 'crowd-split', 
        nodeType: 'crowd-split', 
        isConfigured: true,
        config: { 
          nodeName: '测试分流1',
          crowdLayers: ['分支A', '分支B'],
          splitCount: 2
        }
      }
    }))
    
    const node2 = graph.addNode(createVueShapeNode({
      id: node2Id,
      x: 400,
      y: 200,
      label: '连接测试节点2',
      outCount: 1,
      data: { 
        type: 'sms', 
        nodeType: 'sms', 
        isConfigured: true,
        config: { 
          nodeName: '测试短信',
          smsTemplate: '测试模板'
        }
      }
    }))
    
    console.log('✅ [Horizontal] 测试节点创建成功:', {
      node1: { id: node1.id, ports: node1.getPorts?.().length || 0 },
      node2: { id: node2.id, ports: node2.getPorts?.().length || 0 }
    })
    
    // 获取端口信息
    const node1Ports = node1.getPorts?.() || []
    const node2Ports = node2.getPorts?.() || []
    
    console.log('🔌 端口详情:')
    node1Ports.forEach(port => {
      console.log(`  节点1 - ${port.id}: group=${port.group}, position=${port.position?.name}`)
    })
    node2Ports.forEach(port => {
      console.log(`  节点2 - ${port.id}: group=${port.group}, position=${port.position?.name}`)
    })
    
    // 尝试创建连接（应该成功）
    try {
      const outPort = node1Ports.find(p => p.group === 'out')
      const inPort = node2Ports.find(p => p.group === 'in')
      
      if (outPort && inPort) {
        const edge = graph.addEdge({
          source: { cell: node1Id, port: outPort.id },
          target: { cell: node2Id, port: inPort.id },
          router: { name: 'normal' },
          connector: { name: 'smooth' },
          attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } }
        })
        
        if (edge) {
          console.log('✅ [Horizontal] 连接创建成功:', {
            edgeId: edge.id,
            source: `${node1Id}:${outPort.id}`,
            target: `${node2Id}:${inPort.id}`
          })
        } else {
          console.warn('⚠️ [Horizontal] 连接创建失败，返回null')
        }
      } else {
        console.warn('⚠️ [Horizontal] 未找到合适的端口进行连接')
      }
    } catch (connError) {
      console.error('❌ [Horizontal] 连接创建失败:', connError.message)
    }
    
    // 测试反向连接（应该失败）
    try {
      const inPort1 = node1Ports.find(p => p.group === 'in')
      const outPort2 = node2Ports.find(p => p.group === 'out')
      
      if (inPort1 && outPort2) {
        const invalidEdge = graph.addEdge({
          source: { cell: node2Id, port: outPort2.id },
          target: { cell: node1Id, port: inPort1.id },
          router: { name: 'normal' },
          connector: { name: 'smooth' },
          attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } }
        })
        
        if (invalidEdge) {
          console.log('⚠️ [Horizontal] 反向连接创建成功（可能规则未生效）:', invalidEdge.id)
        } else {
          console.log('✅ [Horizontal] 反向连接被正确阻止')
        }
      }
    } catch (reverseError) {
      console.log('✅ [Horizontal] 反向连接被正确阻止:', reverseError.message)
    }
    
  } catch (error) {
    console.error('❌ [Horizontal] 连接测试失败:', error)
  }
}

const toggleStartDrawer = () => {
  const g = graph
  if (!g) return
  // 强制打开开始节点抽屉，如果不存在开始节点则创建

  let start = g.getNodes().find(n => {
    const d = n.getData?.() || {}
    return d?.type === 'start' || d?.nodeType === 'start'
  })
  if (!start) {
    ensureStartNode()
    start = g.getNodes().find(n => (n.getData?.() || {}).nodeType === 'start')
  }
  if (start) configDrawers.openConfigDrawer('start', start, start.getData?.() || {})
}
  
function startResize(event) {
  isResizing.value = true
  const startX = event.clientX
  const startWidth = statisticsPanelWidth.value
  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX
    const newWidth = Math.max(300, Math.min(800, startWidth - deltaX))
    statisticsPanelWidth.value = newWidth
  }
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function startVerticalResize(event) {
  isResizing.value = true
  const startY = event.clientY
  const startHeight = statisticsPanelHeight.value
  const handleMouseMove = (e) => {
    const deltaY = startY - e.clientY
    const newHeight = Math.max(180, Math.min(520, startHeight + deltaY))
    statisticsPanelHeight.value = newHeight
  }
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}



/**
 * 处理节点选择事件
 */
const handleNodeSelect = (nodeIds) => {
  console.log('📊 [Horizontal] 选中节点:', nodeIds)
  // 这里可以实现节点高亮或其他交互逻辑
  if (graph && nodeIds && nodeIds.length > 0) {
    // 清除之前的选中状态
    graph.getSelectedCells().forEach(cell => {
      if (cell.isNode()) {
        graph.unselect(cell)
      }
    })
    
    // 选中新节点
    nodeIds.forEach(nodeId => {
      const node = graph.getCellById(nodeId)
      if (node && node.isNode()) {
        graph.select(node)
      }
    })
  }
}

/**
 * 处理路径高亮事件
 */
const handlePathHighlight = (pathData) => {
  console.log('🛤️ [Horizontal] 路径高亮:', pathData)
  // 这里可以实现路径高亮逻辑
  if (graph && pathData && pathData.path) {
    // 清除之前的高亮
    graph.getEdges().forEach(edge => {
      edge.setAttrs({
        line: {
          stroke: '#94a3b8',
          strokeWidth: 2
        }
      })
    })
    
    // 高亮路径中的边
    pathData.path.forEach((node, index) => {
      if (index < pathData.path.length - 1) {
        const nextNode = pathData.path[index + 1]
        const edges = graph.getEdges().filter(edge => {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          return sourceId === node.nodeId && targetId === nextNode.nodeId
        })
        
        edges.forEach(edge => {
          edge.setAttrs({
            line: {
              stroke: '#f59e0b',
              strokeWidth: 3
            }
          })
        })
      }
    })
  }
}

// 测试调试功能的函数
function testDebugFunction() {
  console.log('🧪 [Horizontal] 开始测试调试功能...')
  console.log('📋 当前nodeActionsMenu状态:', JSON.parse(JSON.stringify(nodeActionsMenu.value)))
  
  // 检查是否存在节点
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  
  const nodes = graph.getNodes()
  console.log(`📊 [Horizontal] 当前画布中有 ${nodes.length} 个节点`)
  
  if (nodes.length === 0) {
    console.log('💡 [Horizontal] 没有节点，创建一个测试节点...')
    // 创建一个测试节点
    try {
      const testNode = graph.addNode({
        id: 'test-node-' + Date.now(),
        x: 100,
        y: 100,
        width: NODE_DIMENSIONS.WIDTH,
        height: NODE_DIMENSIONS.MIN_HEIGHT,
        shape: 'rect',
        data: {
          nodeType: 'crowd-filter',
          nodeName: '测试人群筛选节点',
          config: {
            nodeName: '测试人群筛选节点',
            crowdName: '高价值用户群体',
            filterCondition: '消费金额 > 1000元'
          }
        }
      })
      console.log('✅ [Horizontal] 测试节点创建成功:', testNode.id)
      
      // 模拟点击调试按钮
      nodeActionsMenu.value = {
        visible: false,
        x: 0,
        y: 0,
        nodeId: testNode.id
      }
      
      // 延迟执行调试函数
      setTimeout(() => {
        console.log('🔍 [Horizontal] 执行调试函数...')
        simpleDebugNode(testNode.id)
      }, 500)
      
    } catch (error) {
      console.error('❌ [Horizontal] 创建测试节点失败:', error)
    }
  } else {
    // 使用第一个节点进行测试
    const firstNode = nodes[0]
    console.log(`🎯 [Horizontal] 使用第一个节点进行测试: ${firstNode.id}`)
    
    nodeActionsMenu.value = {
      visible: false,
      x: 0,
      y: 0,
      nodeId: firstNode.id
    }
    
    setTimeout(() => {
      console.log('🔍 [Horizontal] 执行调试函数...')
      simpleDebugNode(firstNode.id)
    }, 500)
  }
}

// 简化的调试函数，用于快速测试
function simpleDebugNode(nodeId) {
  console.log('🔄 [Horizontal] 简化调试函数被调用，节点ID:', nodeId)
  
  if (!nodeId || !graph) {
    console.warn('❌ [Horizontal] 缺少节点ID或图形实例')
    return
  }
  
  try {
    const node = graph.getCellById(nodeId)
    if (!node) {
      console.warn(`❌ [Horizontal] 未找到节点: ${nodeId}`)
      return
    }
    
    const data = node.getData?.() || {}
    const nodeType = data?.nodeType || data?.type
    const cfg = data?.config || {}
    const nodeName = data?.nodeName || cfg?.nodeName || '未命名节点'
    
    console.log('✅ [Horizontal] 节点基本信息:')
    console.log(`   - 节点ID: ${nodeId}`)
    console.log(`   - 节点类型: ${nodeType}`)
    console.log(`   - 节点名称: ${nodeName}`)
    console.log(`   - 配置内容:`, cfg)
    
    // 获取标准标签和图标文字
    const standardLabel = getNodeLabel(nodeType) || '未知节点类型'
    const standardIconText = getNodeIconText(nodeType)
    
    console.log('📝 [Horizontal] 标准文字内容:')
    console.log(`   - 标准标签: ${standardLabel}`)
    console.log(`   - 标准图标文字: ${standardIconText}`)
    
    // 验证端口对齐
    validateLayoutCoordinates()
    
  } catch (error) {
    console.error('❌ [Horizontal] 简化调试函数异常:', error)
  }
}

// 测试节点样式验证功能
function testNodeStyleValidation() {
  console.log('🎨 [Horizontal] 开始测试节点样式验证...')
  
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  
  // 创建测试节点
  try {
    const testNodeId = `test-style-${Date.now()}`
    const testNode = graph.addNode(createVueShapeNode({
      id: testNodeId,
      x: 200,
      y: 200,
      label: '样式测试节点',
      outCount: 2,
      data: { 
        type: 'crowd-split', 
        nodeType: 'crowd-split', 
        isConfigured: true,
        config: {
          nodeName: '样式测试分流',
          crowdLayers: ['高价值用户', '普通用户'],
          splitCount: 2
        }
      }
    }))
    
    console.log('✅ [Horizontal] 测试节点创建成功:', {
      nodeId: testNode.id,
      nodeType: testNode.getData?.().nodeType,
      hasInteractionStyles: !!testNode.getProp?.('interactionStyles'),
      hasPorts: !!testNode.getPorts?.(),
      portCount: testNode.getPorts?.().length || 0
    })
    
    // 验证菜单点位置
    const attrs = testNode.getAttrs?.() || {}
    console.log('📐 [Horizontal] 菜单点位置验证:', {
      menuDot0: attrs['menu-dot-0']?.x,
      menuDot1: attrs['menu-dot-1']?.x,
      menuDot2: attrs['menu-dot-2']?.x,
      expectedBase: NODE_DIMENSIONS.WIDTH,
      offset0: POSITIONS.MENU_DOT_OFFSETS[0],
      offset1: POSITIONS.MENU_DOT_OFFSETS[1],
      offset2: POSITIONS.MENU_DOT_OFFSETS[2]
    })
    
  } catch (error) {
    console.error('❌ [Horizontal] 测试节点创建失败:', error)
  }
}

function testPortRegistration() {
  console.log('🔌 [Horizontal] 开始测试端口注册...')
  
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  
  // 创建测试节点
  try {
    const testNodeId = `test-port-${Date.now()}`
    const testNode = graph.addNode(createVueShapeNode({
      id: testNodeId,
      x: 300,
      y: 300,
      label: '端口测试节点',
      outCount: 3,
      data: { 
        type: 'crowd-split', 
        nodeType: 'crowd-split', 
        isConfigured: true,
        config: { 
          nodeName: '端口测试分流',
          crowdLayers: ['高价值用户', '普通用户', '新用户'],
          splitCount: 3
        }
      }
    }))
    
    console.log('✅ [Horizontal] 端口测试节点创建成功:', {
      nodeId: testNode.id,
      nodeType: testNode.getData?.().nodeType,
      ports: testNode.getPorts?.(),
      portCount: testNode.getPorts?.().length || 0
    })
    
    // 验证端口配置
    const ports = testNode.getPorts?.() || []
    ports.forEach(port => {
      console.log(`🔌 端口详情:`, {
        id: port.id,
        group: port.group,
        args: port.args,
        position: port.position
      })
    })
    
    // 验证端口组配置
    const portGroups = testNode.getProp?.('ports')?.groups || {}
    console.log('📋 端口组配置:', {
      inGroup: portGroups.in,
      outGroup: portGroups.out,
      hasLeftPosition: portGroups.in?.position === 'left',
      hasRightPosition: portGroups.out?.position === 'right'
    })
    
  } catch (error) {
    console.error('❌ [Horizontal] 端口测试节点创建失败:', error)
  }
}

// 布局验证函数
function validateLayoutCoordinates() {
  console.log('📐 [Horizontal] 布局坐标验证开始...')
  
  const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT // 36
  const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT // 32
  const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING // 12
  const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST // 5
  
  console.log('📏 基础尺寸:')
  console.log(`   - headerHeight: ${headerHeight}`)
  console.log(`   - rowHeight: ${rowHeight}`)
  console.log(`   - contentPadding: ${contentPadding}`)
  console.log(`   - baselineAdjust: ${baselineAdjust}`)
  
  console.log('\n🎯 标题区域验证 (36px高度):')
  console.log(`   - header-icon Y: 8 (合理，距离顶部8px)`)
  console.log(`   - header-icon-text Y: ${POSITIONS.ICON_TEXT_Y} (文字基线)`)
  console.log(`   - header-title Y: ${POSITIONS.TITLE_Y} (文字基线)`)
  console.log(`   - menu-dots Y: ${POSITIONS.MENU_DOT_Y} (菜单点中心)`)
  console.log(`   - 垂直中心: ${headerHeight / 2} = 18px`)
  
  console.log('\n📋 内容区域验证:')
  const contentStartY = headerHeight + contentPadding
  console.log(`   - 内容起始Y: ${contentStartY} (${headerHeight} + ${contentPadding})`)
  
  const row0Y = contentStartY + Math.floor(rowHeight / 2) + baselineAdjust
  console.log(`   - 第0行Y坐标: ${row0Y} (${contentStartY} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust})`)
  
  const row1Y = contentStartY + rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
  console.log(`   - 第1行Y坐标: ${row1Y} (${contentStartY} + ${rowHeight} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust})`)
  
  console.log('\n✅ 验证结果:')
  console.log(`   - 第0行Y坐标应为: 69 (当前计算: ${row0Y})`)
  console.log(`   - 第1行Y坐标应为: 101 (当前计算: ${row1Y})`)
  
  if (row0Y === 69) {
    console.log('✅ 第0行Y坐标计算正确！')
  } else {
    console.log(`❌ 第0行Y坐标计算错误: 期望69，实际${row0Y}`)
  }
  
  console.log('\n📐 布局对齐验证完成')
}

const handleDrawerVisibilityChange = ({ drawerType, visible }) => {
  if (!visible) configDrawers.closeConfigDrawer(drawerType)
}

const resetCanvas = () => {
  if (!graph) return
  graph.clearCells()
  ensureStartNode()
}

// 调试面板控制
const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
  try { localStorage.setItem('horizontal:debug:visible', showDebugPanel.value ? '1' : '0') } catch {}
}
const closeDebugPanel = () => {
  showDebugPanel.value = false
  try { localStorage.setItem('horizontal:debug:visible', '0') } catch {}
}
const onDebugPanelPositionUpdate = (pos) => {
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return
  debugPanelPosition.value = pos
  try { localStorage.setItem('horizontal:debug:pos', JSON.stringify(pos)) } catch {}
}

onMounted(async () => {
  console.log('[Horizontal] 组件挂载完成，开始初始化...') // 添加挂载日志
  
  // 添加全局点击测试
  setTimeout(() => {
    console.log('[Horizontal] 全局点击测试 - 请在控制台输入: testClick()')
    window.testClick = () => {
      console.log('[Horizontal] 全局测试点击成功！')
      console.log('[Horizontal] 当前graph状态:', graph ? '已初始化' : '未初始化')
      console.log('[Horizontal] 当前taskName:', taskName.value)
    }
  }, 1000)
  
  // 恢复调试面板持久化状态
  try {
    const persistedVisible = localStorage.getItem('horizontal:debug:visible')
    const persistedPos = localStorage.getItem('horizontal:debug:pos')
    if (persistedVisible != null) {
      showDebugPanel.value = persistedVisible === '1'
    }
    if (persistedPos) {
      const p = JSON.parse(persistedPos)
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        debugPanelPosition.value = p
      }
    }
  } catch {}
  
  // 初始化横版专用快速布局
  quickLayout.value = new HorizontalQuickLayout({
    columnSpacing: 350,  // 增加列间距，避免节点重叠
    rowHeight: 200,      // 增加行高，提供更好的垂直间距
    startX: 100,
    startY: 150,         // 调整起始Y坐标，居中效果更好
    centerAlign: true
  })
  
  // 注册Vue组件到vue-shape系统
  register({
    shape: 'horizontal-node',
    component: HorizontalNode
  })

  graph = createGraph(canvasContainerRef.value, {
    container: canvasContainerRef.value,
    background: { 
      color: '#ffffff',
      opacity: 0.8
    },
    grid: {
      size: 20,
      visible: true,
      type: 'dot',
      color: '#e2e8f0',
      thickness: 1,
      opacity: 0.6
    },
    scroller: {
      enabled: true,
      pannable: false,
      cursor: 'grab'
    },
    highlighting: {
      magnetAvailable: {
        name: 'stroke',
        args: { 
          padding: 8, 
          attrs: { 
            stroke: '#3b82f6', 
            'stroke-width': 2,
            'stroke-dasharray': '4,4'
          } 
        }
      },
      magnetAdsorbed: {
        name: 'stroke',
        args: { 
          padding: 10, 
          attrs: { 
            stroke: '#2563eb', 
            'stroke-width': 2.5,
            'stroke-dasharray': 'none'
          } 
        }
      }
    },
    // 添加对齐辅助线配置
    snapline: {
      enabled: true,
      tolerance: 8,
      sharp: true,
      stroke: '#3b82f6',
      strokeWidth: 1.5,
      strokeDasharray: '6,4',
      opacity: 0.8
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown']
    },
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      factor: 1.15,
      maxScale: 3,
      minScale: 0.1
    },
    history: {
      enabled: false
    },
  connecting: {
    allowBlank: false,
    allowMulti: true,
    snap: { radius: 60 },
    highlight: true,
    allowNode: false,
    allowLoop: false,
    router: { name: 'normal' },
    connector: { name: 'smooth' },
    connectionPoint: { name: 'anchor' },
    createEdge() {
      return new Shape.Edge({
          attrs: { 
            line: { 
              stroke: '#4C78FF', 
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                args: {
                  size: 6,
                  fill: '#4C78FF'
                }
              },
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }
          },
          connector: { name: 'smooth' },
          transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease',
          // 确保在不同缩放级别下的显示效果
          zIndex: 1,
          // 添加平滑过渡动画
          animate: {
            duration: 300,
            easing: 'ease-in-out'
          }
        })
      },
      validateEdge({ edge, type, previous }) {
        try {
          const targetPoint = edge.getTargetPoint?.() || { x: NaN, y: NaN }
          const targetCell = edge.getTargetCell?.()
          const targetNodeId = targetCell?.id || null
          const targetPortId = edge.getTargetPortId?.() || null
          const ports = (targetCell?.getPorts?.() || []).filter(p => p?.group === 'in')
          const positions = ports.map(p => {
            let pos = null
            try { pos = targetCell.getPortPosition?.(p.id) || null } catch {}
            return { id: p.id, pos }
          })
          let nearest = null
          let minDist = Infinity
          positions.forEach(c => {
            if (c.pos && Number.isFinite(c.pos.x) && Number.isFinite(c.pos.y)) {
              const dx = targetPoint.x - c.pos.x
              const dy = targetPoint.y - c.pos.y
              const d = Math.sqrt(dx * dx + dy * dy)
              if (d < minDist) { minDist = d; nearest = c }
            }
          })
          console.log('🧲 连接拖拽完成判定', {
            type,
            previous,
            targetNodeId,
            targetPortId,
            targetPoint,
            nearestInPortId: nearest?.id || null,
            nearestInPortPos: nearest?.pos || null,
            nearestDistance: Number.isFinite(minDist) ? Math.round(minDist) : null
          })
          if (!targetNodeId || !targetPortId) {
            const nodes = graph.getNodes?.() || []
            const candidates = []
            nodes.forEach(n => {
              const ps = (n.getPorts?.() || []).filter(p => p?.group === 'in')
              ps.forEach(p => {
                let pos = null
                try { pos = n.getPortPosition?.(p.id) || null } catch {}
                if (pos) candidates.push({ node: n, id: p.id, pos })
  })

  // 初始化统计面板顶部偏移（位于工具栏以下）并监听窗口尺寸变化
  updateStatisticsPanelTop()
  updateDebugDockBounds()
  const resizeHandlers = useCanvasState().setupPanelResizeListeners(toolbarWrapperRef.value, contentRef.value, showStatisticsPanel, isViewMode.value, isPublished.value, statisticsPanelWidth, debugDockBounds, statisticsPanelTop)
})
            let best = null
            let bestDist = Infinity
            candidates.forEach(c => {
              const dx = targetPoint.x - c.pos.x
              const dy = targetPoint.y - c.pos.y
              const d = Math.sqrt(dx * dx + dy * dy)
              if (d < bestDist) { bestDist = d; best = c }
            })
            if (best && bestDist <= 100) {
              try {
                edge.setTarget({ cell: best.node.id, port: best.id })
                console.log('🧲 最近端口回填', {
                  targetNodeId: best.node.id,
                  targetPortId: best.id,
                  attachDistance: Math.round(bestDist)
                })
              } catch {}
            }
          }
        } catch (e) {
          console.warn('连接拖拽完成判定日志失败', e)
        }
        return true
      },
      // DocRef: 架构文档「关键代码片段/图初始化的连接校验」
      validateConnection(args) {
        const { validateConnection } = bindConnectionPolicies(graph, { isViewMode: () => isViewMode.value, isPanning: () => isPanning.value, Message })
        return validateConnection(args)
      },
      validateMagnet(args) {
        const { validateMagnet } = bindConnectionPolicies(graph, { isViewMode: () => isViewMode.value, isPanning: () => isPanning.value, Message })
        return validateMagnet(args)
      }
    },
    selecting: {
      enabled: false
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown']
    },
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      factor: 1.1,
      maxScale: 2,
      minScale: 0.5
    }
  })

  useHistory(graph, { enabled: true, ignoreAdd: false, ignoreRemove: false, ignoreChange: ['tools'], beforeAddCommand: (event, args) => { try { if (args?.key === 'tools') return false } catch {} return true } })
  useKeyboard(graph, { enabled: true })
  
  // 添加键盘快捷键支持
  bindDefaultShortcuts(graph, { handleUndo, handleRedo, handleZoomIn, handleZoomOut })

  graph.bindKey(['delete', 'backspace'], () => {
    // DocRef: 架构文档「关键代码片段/键盘删除屏蔽（查看模式）」
    try {
      const cells = graph.getSelectedCells?.() || []
      if (!cells.length) return false
      cells.forEach(cell => {
        try {
          if (cell.isNode?.()) {
            deleteNodeCascade(cell.id)
          } else if (cell.isEdge?.()) {
            if (isViewMode.value) return
            graph.removeEdge(cell)
          }
        } catch {}
      })
      try { graph.cleanSelection && graph.cleanSelection() } catch {}
      Message.success('已删除选中元素')
    } catch {}
    return false
  })
  
  graph.bindKey(['ctrl+0', 'cmd+0'], () => {
    handleResetZoom()
    return false
  })
  
  graph.bindKey(['ctrl+f', 'cmd+f'], () => {
    handleFitContent()
    return false
  })
  
  graph.bindKey(['ctrl+l', 'cmd+l'], () => {
    handleQuickLayout()
    return false
  })

  // 自检：端口配置与原版实现差异点验证（3 行内容）
  function selfValidatePortConfig() {
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0
    const rows = ['A', 'B', 'C']
    const contentHeight = rows.length * rowHeight
    const contentStart = headerHeight + contentPadding
    const contentEnd = contentStart + contentHeight
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + rows.length * rowHeight + 12)
    const verticalOffsets = rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
    const cfg = createHorizontalPortConfig(rows.length, {
      includeIn: true,
      includeOut: true,
      outIds: rows.map((_, i) => `out-${i}`),
      verticalOffsets,
      nodeHeight: height,
      inVerticalOffset: contentStart + Math.floor(contentHeight / 2),
      contentStart,
      contentEnd
    })
    const inItem = cfg.items.find(i => i.id === 'in')
    const outs = cfg.items.filter(i => i.group === 'out')
    const allWithin = outs.every(o => o.args?.y >= contentStart && o.args?.y <= contentEnd)
    const countOk = outs.length === rows.length
    const hasAttrs = outs.every(o => !!o.attrs?.circle && (o.attrs.circle['port-group'] === 'out' || o.attrs.circle['data-port-group'] === 'out'))
    console.log('[SelfTest] portConfig', { inItem, outsCount: outs.length, firstOut: outs[0], allWithin, countOk, hasAttrs, groups: cfg.groups })
  }
  selfValidatePortConfig()

  // 提供graph实例给子组件使用
  provideGraphInstance(graph)

  const {
    historyStack,
    jumpToHistoryState,
    setupHistoryListeners,
    updateHistoryStack
  } = useCanvasHistory(graph)

  setupHistoryListeners()
  updateHistoryStack()

  // DocRef: 架构文档「关键代码片段/历史栈监听与撤销重做」
  graph.on('history:change', () => {
    try {
      canUndo.value = typeof graph.canUndo === 'function' ? graph.canUndo() : false
      canRedo.value = typeof graph.canRedo === 'function' ? graph.canRedo() : false
      updateHistoryStack()
    } catch {}
  })

  graph.on('node:added', () => {
    try { updateHistoryStack() } catch {}
  })
  graph.on('edge:added', () => {
    try { updateHistoryStack() } catch {}
  })
  graph.on('cell:change:position', () => {
    try { updateHistoryStack() } catch {}
  })

  try {
    Graph.registerPortLayout('fixed-right-y', (ports, args) => {
      const h = args?.bbox?.height || 0
      const w = args?.bbox?.width || 0
      const cy = h / 2
      return (ports || []).map(p => {
        const a = p?.args || {}
        const hasRow = typeof a.rowIndex === 'number'
        const dy = typeof a.dy === 'number' ? a.dy : 0
        const baseY = hasRow
          ? (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + a.rowIndex * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2) + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0))
          : (cy + dy)
        const y = baseY
        return { position: { x: w, y } }
      })
    })
    Graph.registerPortLayout('fixed-left-y', (ports, args) => {
      const h = args?.bbox?.height || 0
      const cy = h / 2
      return (ports || []).map(p => {
        const a = p?.args || {}
        const hasRow = typeof a.rowIndex === 'number'
        const dy = typeof a.dy === 'number' ? a.dy : 0
        const baseY = hasRow
          ? (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + a.rowIndex * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2) + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0))
          : (cy + dy)
        const y = baseY
        return { position: { x: 0, y } }
      })
    })
  } catch {}
  
  // 使用Selection插件（支持橡皮框），在事件中按Ctrl/Command进行门控
  const selectionPlugin = useSelection(graph, {
    enabled: true,
    multiple: true,
    rubberband: true,
    showNodeSelectionBox: true,
    movable: true,
    selectNodeOnClick: false
  })
  try { selectionPlugin.disableRubberband && selectionPlugin.disableRubberband() } catch {}

  configureSelectionRubberbandGate(selectionPlugin, graph)

  

  graph.on('blank:click', ({ e }) => {
    const add = !!(e && (e.ctrlKey || e.metaKey))
    if (!add) {
      try { graph.cleanSelection() } catch {}
    }
  })

  // 按住Ctrl/Command时允许橡皮框，否则禁用以避免误触
  graph.on('blank:mousedown', ({ e }) => {
    const allowBand = modifierPressed.value
    try {
      if (allowBand && selectionPlugin.enableRubberband) selectionPlugin.enableRubberband()
      else if (!allowBand && selectionPlugin.disableRubberband) selectionPlugin.disableRubberband()
    } catch {}
  })
  graph.on('blank:mouseup', () => {
    try { selectionPlugin.disableRubberband && selectionPlugin.disableRubberband() } catch {}
  })
  onBeforeUnmount(() => {
    try {
      if (listenersRegistered) {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        listenersRegistered = false
      }
    } catch {}
    try { resizeHandlers?.detach && resizeHandlers.detach() } catch {}
  })
  
  const statsFocusNodeId = ref('')
  const controller = new CanvasController({
    graph,
    readOnly: isViewMode.value,
    isStatisticsMode: () => !!showStatisticsPanel.value,
    onNodeClickForStats: (node) => { 
      try { 
        console.log('[Stats] onNodeClickForStats -> node:', node?.id)
        const id = String(node?.id || '')
        statsFocusNodeId.value = id
        console.log('[Stats] focusNodeId set:', id)
        try { window.dispatchEvent(new CustomEvent('stats:focus', { detail: { id } })) } catch {}
        showStatisticsPanel.value = true 
      } catch {} 
    },
    openConfigDrawer: (type, node, data) => configDrawers.openConfigDrawer(type, node, { ...(data || {}), __readOnly: isViewMode.value }),
    setShowNodeSelector: v => { showNodeSelector.value = v },
    setNodeSelectorPosition: v => { nodeSelectorPosition.value = v },
    setNodeSelectorSourceNode: v => { nodeSelectorSourceNode.value = v },
    setPendingCreatePoint: p => { pendingCreatePoint = p },
    setPendingInsertionEdge: e => { pendingInsertionEdge = e },
    deleteNodeCascade: id => deleteNodeCascade(id),
    getContainerRect: () => canvasContainerRef.value.getBoundingClientRect(),
    setNodeActionsMenu: v => { nodeActionsMenu.value = v }
  })

  // 面板开关时重新计算顶部偏移
  // DocRef: 架构文档「关键代码片段/统计面板停靠与尺寸更新」
  useCanvasState().setupPanelWatchers(showStatisticsPanel, statisticsPanelWidth, async () => { await nextTick(); updateStatisticsPanelTop() }, async () => { await nextTick(); updateDebugDockBounds() })

  // 保留空声明以避免未定义警告（模板已使用内联表达式）

  try {
    if (configDrawers && configDrawers.structuredLayout) {
      await configDrawers.structuredLayout.initializeLayoutEngine()
      await configDrawers.structuredLayout.switchLayoutDirection('LR')
      await configDrawers.structuredLayout.applyUnifiedStructuredLayout(graph)

      // 热更新后，统一对现有节点应用最新的样式与端口定位修正
      try {
        const nodes = graph.getNodes?.() || []
        nodes.forEach(n => {
          const d = n.getData?.() || {}
          const nodeType = d?.type || d?.nodeType
          const cfg = d?.config || {}
          if (nodeType) {
            updateNodeFromConfigUnified(n, nodeType, cfg)
          }
        })
      } catch (e) {
        console.warn('[Horizontal] 初始化后应用节点样式失败:', e)
      }
    }
  } catch (e) {
    console.warn('[Horizontal] 结构化布局初始化失败:', e)
  }

  graph.on('node:config-updated', ({ node, nodeType, config }) => {
    try {
      updateNodeFromConfigUnified(node, nodeType, config)
    } catch (err) {}
  })
  
  // 添加节点交互事件监听（简化版，使用Vue组件状态）
  graph.on('node:mouseenter', ({ node }) => {
    if (isPanning.value) return
    try { node.addClass && node.addClass('node-hover') } catch {}
  })
  
  graph.on('node:mouseleave', ({ node }) => {
    if (isPanning.value) return
    try { node.removeClass && node.removeClass('node-hover') } catch {}
  })
  
  graph.on('node:selected', ({ node }) => {
    if (isPanning.value) return
    try { node.addClass && node.addClass('node-selected') } catch {}
  })
  
  graph.on('node:unselected', ({ node }) => {
    if (isPanning.value) return
    try { node.removeClass && node.removeClass('node-selected') } catch {}
  })
  
  // 添加节点选择支持
  

  // 拖拽期间关闭辅助线，结束后恢复，降低重绘抖动
  graph.on('blank:mousedown', ({ e }) => {
    const allowBand = modifierPressed.value
    if (allowBand) {
      // 橡皮框：禁用画布平移
      try { graph.disablePanning && graph.disablePanning() } catch {}
      isPanning.value = false
      minimapPaused = false
    } else {
      // 画布平移：开启性能优化
      try { graph.enablePanning && graph.enablePanning() } catch {}
      isPanning.value = true
      minimapPaused = true
      try { graph.setSnaplineEnabled(false) } catch {}
    }
  })
  graph.on('blank:mouseup', ({ e }) => {
    // 拖拽结束：恢复默认平移与辅助线
    try { graph.enablePanning && graph.enablePanning() } catch {}
    isPanning.value = false
    try { graph.setSnaplineEnabled(true) } catch {}
    setTimeout(() => { minimapPaused = false; try { minimap && minimap.updateGraph && minimap.updateGraph() } catch {} }, 100)
  })

  graph.on('node:added', ({ node }) => {
    try {
      const ports = node.getPorts?.() || []
      const details = ports.map(p => {
        let pos = null
        try { pos = node.getPortPosition?.(p.id) || null } catch {}
        return { id: p.id, group: p.group, pos }
      })
      console.log('🧩 节点端口检查', { nodeId: node.id, ports: details })
      
      // 初始化端口动画状态 - 默认缩小至80%
      setTimeout(() => {
        const ports = node.getPorts?.() || []
        ports.forEach(port => {
          const portElement = node.findPortElem?.(port.id)
          if (portElement) {
            const circle = portElement.querySelector?.('circle') || portElement
            if (circle) {
              circle.style.transform = 'scale(0.8)'
              circle.style.transformOrigin = 'center center'
            }
          }
        })
      }, 100)
    } catch (e) {
      console.warn('节点端口检查失败', e)
    }
  })

  graph.on('edge:added', ({ edge }) => {
    try {
      console.log('📌 边已添加', {
        id: edge.id,
        source: edge.getSource?.(),
        target: edge.getTarget?.()
      })
      // 清除手动控制点，避免在布局后残留
      if (edge.setVertices) edge.setVertices([])
    } catch {}
  })

  graph.on('edge:change:target', ({ edge }) => {
    try {
      const tgt = edge.getTarget?.()
      console.log('🎯 边目标变更', { id: edge.id, target: tgt })
    } catch {}
  })

  graph.on('edge:contextmenu', ({ edge, e }) => {
    try {
      if (isViewMode.value) return
      if (e && typeof e.preventDefault === 'function') e.preventDefault()
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
      const rect = canvasContainerRef.value && canvasContainerRef.value.getBoundingClientRect
        ? canvasContainerRef.value.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 }
      const clientX = e && (typeof e.clientX === 'number' ? e.clientX : (typeof e.x === 'number' ? e.x : 0))
      const clientY = e && (typeof e.clientY === 'number' ? e.clientY : (typeof e.y === 'number' ? e.y : 0))
      let x = clientX - rect.left
      let y = clientY - rect.top
      const menuW = 140
      const menuH = 80
      if (rect.width) x = Math.max(0, Math.min(x, rect.width - menuW))
      if (rect.height) y = Math.max(0, Math.min(y, rect.height - menuH))
      edgeActionsMenu.value = { visible: true, x, y, edgeId: edge.id }
      return false
    } catch {}
  })

  graph.on('node:contextmenu', ({ node, e }) => {
    try {
      if (isViewMode.value) return
      if (e && typeof e.preventDefault === 'function') e.preventDefault()
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
      const target = e?.target
      const group = target?.getAttribute?.('port-group') || target?.getAttribute?.('data-port-group')
      const portId = target?.getAttribute?.('port') || target?.getAttribute?.('data-port') || target?.getAttribute?.('data-port-id')
      if (group !== 'out' || !portId) return
      const edges = graph.getOutgoingEdges?.(node) || []
      const portEdge = edges.find(ed => {
        try {
          const s = ed.getSourceCellId?.()
          const t = ed.getTargetCellId?.()
          if (!s || !t) return false
          return ed.getSourcePortId?.() === portId
        } catch { return false }
      })
      const rect = canvasContainerRef.value?.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 }
      const clientX = typeof e.clientX === 'number' ? e.clientX : (typeof e.x === 'number' ? e.x : 0)
      const clientY = typeof e.clientY === 'number' ? e.clientY : (typeof e.y === 'number' ? e.y : 0)
      let x = clientX - rect.left
      let y = clientY - rect.top
      const menuW = 160
      const menuH = 80
      if (rect.width) x = Math.max(0, Math.min(x, rect.width - menuW))
      if (rect.height) y = Math.max(0, Math.min(y, rect.height - menuH))
      portActionsMenu.value = { visible: true, x, y, nodeId: node.id, portId, edgeId: portEdge?.id || null }
    } catch {}
  })

  // 悬停时显示插入按钮，默认纯线样式
  graph.on('edge:mouseenter', ({ edge }) => {
    try {
      if (isPanning.value) return
      const sp = edge.getSourcePoint?.() || { x: 0, y: 0 }
      const tp = edge.getTargetPoint?.() || { x: 0, y: 0 }
      const mx = (sp.x + tp.x) / 2
      const my = (sp.y + tp.y) / 2
      const onClick = () => {
        pendingInsertionEdge = edge
        pendingCreatePoint = { x: mx, y: my }
        const client = graph.localToClient ? graph.localToClient({ x: mx, y: my }) : { x: mx, y: my }
        const contentRect = contentRef.value?.getBoundingClientRect?.()
        const x = contentRect ? (client.x - contentRect.left) : client.x
        const y = contentRect ? (client.y - contentRect.top) : client.y
        nodeSelectorPosition.value = { x, y }
        const src = edge.getSource?.()
        nodeSelectorSourceNode.value = src?.cell || null
        showNodeSelector.value = true
      }
      edge.addTools([
        {
          name: 'button',
          args: {
            markup: [
              { tagName: 'circle', selector: 'plus-bg', attrs: { r: 10, fill: '#4C78FF', stroke: '#4C78FF' } },
              { tagName: 'path', selector: 'plus-icon', attrs: { d: 'M -4 0 L 4 0 M 0 -4 L 0 4', stroke: '#FFFFFF', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' } }
            ],
            distance: 0.5,
            onClick
          }
        }
      ])
    } catch {}
  })

  graph.on('edge:mouseleave', ({ edge }) => {
    try { edge.removeTools && edge.removeTools() } catch {}
  })

  // 保留工具以便点击交互

  // 精简边交互日志，避免频繁输出影响性能

  graph.on('edge:removed', ({ edge }) => {
    try {
      console.log('🗑️ 边已移除', { id: edge?.id })
    } catch {}
  })

  graph.on('edge:connected', ({ edge, isNew }) => {
    try {
      // 清除手动控制点，保持平滑连接且不显示控制柄
      if (edge.setVertices) edge.setVertices([])
      const tCell = edge.getTargetCell()
      const tNode = tCell
      const targetNodeId = tNode?.id
      const targetPortId = edge.getTargetPortId?.()
      const tp = edge.getTargetPoint?.() || { x: NaN, y: NaN }
      const ports = (tNode?.getPorts?.() || []).filter(p => p?.group === 'in')
      const bbox = tNode?.getBBox?.() || null
      const candidates = ports.map(p => {
        const dy = typeof p?.args?.dy === 'number' ? p.args.dy : 0
        const pos = bbox ? { x: bbox.x, y: bbox.y + bbox.height / 2 + dy } : null
        return { id: p?.id, pos }
      })
      let nearest = null
      let minDist = Infinity
      candidates.forEach(c => {
        if (c.pos) {
          const dx = tp.x - c.pos.x
          const dy = tp.y - c.pos.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < minDist) { minDist = d; nearest = c }
        }
      })
      console.log('🧲 连线完成吸附判定', {
        targetNodeId,
        targetPortId,
        targetPoint: tp,
        nearestInPortId: nearest?.id || null,
        nearestInPortPos: nearest?.pos || null,
        nearestDistance: Number.isFinite(minDist) ? Math.round(minDist) : null,
        isNew
      })
    } catch (e) {
      console.warn('连线完成吸附判定日志失败', e)
    }
  })
  
  // 添加拖拽状态处理（简化版，使用Vue组件状态）
  graph.on('node:moving', ({ node }) => {
    try {
      // 拖拽过程中更新Vue组件状态
      const data = node.getData?.() || {}
      if (node.setData) {
        node.setData({ ...data, dragging: true })
      }
    } catch (e) {
      console.warn('[Horizontal] node:moving 异常:', e)
    }
  })
  
  graph.on('node:moved', ({ node }) => {
    try {
      // 拖拽结束后恢复Vue组件状态
      const data = node.getData?.() || {}
      if (node.setData) {
        node.setData({ ...data, dragging: false })
      }
    } catch (e) {
      console.warn('[Horizontal] node:moved 恢复样式异常:', e)
    }
  })
  
  ensureStartNode()
  try {
    if (showMinimap.value && minimap) {
      setTimeout(() => {
        try {
          if (minimap.updateGraph) minimap.updateGraph()
          if (minimap.centerContent) minimap.centerContent()
        } catch {}
      }, 30)
    }
  } catch {}
  if (canvasContainerRef.value) {
    canvasContainerRef.value.addEventListener('dragover', onCanvasDragOver)
    canvasContainerRef.value.addEventListener('drop', onCanvasDrop)
  }
})

onBeforeUnmount(() => {
  if (graph) {
    graph.dispose()
    graph = null
  }
  if (canvasContainerRef.value) {
    canvasContainerRef.value.removeEventListener('dragover', onCanvasDragOver)
    canvasContainerRef.value.removeEventListener('drop', onCanvasDrop)
  }
})

function ensureStartNode() { ensureStartNodeSvc(graph) }



// 节点禁用/启用功能（简化版，使用Vue组件状态）
function setNodeDisabled(nodeId, disabled = true) {
  if (!graph || !nodeId) return
  try {
    const node = graph.getCellById(nodeId)
    if (!node) return
    
    const data = node.getData?.() || {}
    const newData = { ...data, disabled }
    
    if (node.setData) {
      node.setData(newData)
    }
  } catch (e) {
    console.warn('[Horizontal] setNodeDisabled 异常:', e)
  }
}
// 节点选择器：添加节点
function handleNodeTypeSelected(nodeType) {
  // 统一映射：横版页面将 audience-split 映射为 crowd-split
  if (nodeType === 'audience-split') nodeType = 'crowd-split'
  const label = getNodeLabel(nodeType) || nodeType
  // 简单规则：分流/AB 默认4个出口，其余1个
  const fourOutTypes = ['audience-split', 'crowd-split', 'event-split', 'ab-test']
  const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
  const newNodeId = `${nodeType}-${Date.now()}`
  const node = graph.addNode(createVueShapeNode({
    id: newNodeId,
    x: pendingCreatePoint.x,
    y: pendingCreatePoint.y,
    label,
    outCount,
    data: { type: nodeType, nodeType: nodeType, isConfigured: false }
  }))

  // 新建节点后，Vue组件会自动处理端口定位，无需手动重建

  // 若来源于边插入，则拆分原边并重连
  if (pendingInsertionEdge) {
    try {
      const source = pendingInsertionEdge.getSource()
      const target = pendingInsertionEdge.getTarget()
      graph.removeEdge(pendingInsertionEdge.id)

      graph.addEdge({
        source: { cell: source.cell, port: source.port },
        target: { cell: newNodeId, port: 'in' },
          router: { name: 'normal' },
          connector: { name: 'smooth' },
        attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } }
      })
      graph.addEdge({
        source: { cell: newNodeId, port: 'out-0' },
        target: { cell: target.cell, port: target.port },
        router: { name: 'normal' },
        connector: { name: 'smooth' },
        attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } }
      })
    } catch (err) {
      console.warn('[Horizontal] 插入节点失败:', err)
    } finally {
      pendingInsertionEdge = null
    }
  }
  // 新建后不自动打开抽屉，由点击节点触发
  return node
}

function closeNodeSelector() {
  showNodeSelector.value = false
  nodeSelectorSourceNode.value = null
}

// 处理抽屉事件：写回节点数据并标记已配置
function handleConfigConfirmProxy({ drawerType, config }) {
  console.log('🔧 [Horizontal] 配置确认代理调用:', {
    drawerType,
    hasConfig: !!config,
    configKeys: config ? Object.keys(config) : [],
    hasConfigDrawers: !!configDrawers,
    hasHandleConfigConfirm: !!configDrawers?.handleConfigConfirm
  })
  try {
    configDrawers.handleConfigConfirm(drawerType, config)
  } catch (e) {
    console.warn('[Horizontal] 配置确认处理异常:', e)
  }
}

function handleConfigCancelProxy({ drawerType }) {
  try {
    configDrawers.handleConfigCancel(drawerType)
  } catch (e) {
    console.warn('[Horizontal] 配置取消处理异常:', e)
  }
}



function getOutCountByType(nodeType, lines) {
  if (nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test') return Math.max(1, lines.length)
  return 1
}

function updateNodeFromConfig(node, nodeType, config) {
  console.log('🔄 [updateNodeFromConfig] 开始更新节点配置:', {
    nodeId: node?.id,
    nodeType,
    hasConfig: !!config,
    configKeys: config ? Object.keys(config) : []
  })
  
  // 性能监控：开始测量
  const endMeasure = performanceMonitor.measure('updateNodeFromConfig')
  
  try {
    console.log('📝 [updateNodeFromConfig] 准备调用buildDisplayLines:', {
      nodeType,
      config: config,
      configKeys: config ? Object.keys(config) : []
    })
    const rows = buildDisplayLines(nodeType, config)
    console.log('📝 [updateNodeFromConfig] buildDisplayLines结果:', {
      nodeType,
      hasConfig: !!config,
      configKeys: config ? Object.keys(config) : [],
      rowsCount: rows.length,
      rows: rows,
      // 🔧 增强调试：检查crowd-split类型的配置
      crowdLayers: config?.crowdLayers,
      branches: config?.branches,
      splitCount: config?.splitCount,
      unmatchBranch: config?.unmatchBranch
    })
    const headerTitle = config?.nodeName || getNodeLabel(nodeType)
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0
    const width = NODE_DIMENSIONS.WIDTH
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)
    const isSplit = nodeType === 'audience-split' || nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
    const contentHeight = Math.max(1, rows.length) * rowHeight
    const contentStart = headerHeight + contentPadding
    const contentEnd = contentStart + contentHeight
    const contentCenter = contentStart + (contentHeight / 2) // 🔧 修复：计算内容区中心
    
    // 输出端口对齐内容区每行的几何中点（与文本 dominantBaseline: middle 对齐）
    // 注意：这里计算的是相对于节点中心的dy偏移，不是绝对Y坐标
    const verticalOffsets = isSplit
      ? rows.map((_, i) => {
          const absoluteY = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
          return absoluteY
        })
      : [contentCenter]
    const outIds = isSplit && rows.length > 0 ? rows.map((_, i) => `out-${i}`) : ['out']
    
    // 性能监控：端口配置计算
    const endPortConfigMeasure = performanceMonitor.measure('portConfigCalculation')
    const includeOut = nodeType !== 'end'
    
    // 先调整节点大小，获取实际高度
    node.resize(width, height)
    const bbox = node.getBBox ? node.getBBox() : null
    const realH = Math.round(bbox?.height || height)
    
    console.log('📐 [updateNodeFromConfig] 端口配置完成:', {
      nodeType,
      isSplit,
      rowsCount: rows.length,
      outIds,
      verticalOffsets,
      hasInPort: nodeType !== 'start',
      hasOutPort: includeOut,
      nodeHeight: realH,
      // 🔧 增强调试：显示详细的计算参数
      headerHeight,
      contentPadding,
      rowHeight,
      baselineAdjust,
      height,
      contentCenter,
      contentHeight,
      contentStart,
      contentEnd
    })
    
    // 性能监控：节点更新操作
    const endNodeUpdateMeasure = performanceMonitor.measure('nodeUpdateOperation')
    
    const ports = createHorizontalPortConfig(isSplit ? Math.max(1, rows.length) : 1, {
      includeIn: nodeType !== 'start', // 开始节点不需要输入端口
      includeOut,
      outIds,
      verticalOffsets,
      nodeHeight: realH,
      // in端口不需要偏移，始终位于节点中心
      contentStart,
      contentEnd,
      contentLines: rows,
      enableValidation: true,
      tolerance: 2
    })
    endPortConfigMeasure()
    console.log('📐 [updateNodeFromConfig] 端口配置完成:', {
      nodeType,
      isSplit,
      rowsCount: rows.length,
      outIds,
      verticalOffsets,
      portItemsCount: ports.items?.length || 0,
      validationEnabled: !!ports._validation
    })
    
    try {
      // 更新Vue组件数据
      const componentData = {
        id: node.id,
        nodeType,
        headerTitle,
        displayLines: rows,
        disabled: node.getData?.()?.disabled || false,
        selected: node.isSelected?.() || false,
        hover: false
      }
      
      // 设置节点数据（包括配置和组件数据）
      let updatedData = null
      if (node.setData) {
        updatedData = {
          ...node.getData?.(),
          config: {
            ...config,
            nodeName: headerTitle,
            displayLines: rows // 添加显示行数据
          },
          nodeType,
          ...componentData
        }
        console.log('📊 [updateNodeFromConfig] 设置节点数据:', {
          nodeId: node.id,
          config: updatedData.config,
          hasDisplayLines: !!updatedData.config?.displayLines,
          displayLinesLength: updatedData.config?.displayLines?.length,
          displayLines: updatedData.config?.displayLines,
          nodeType: updatedData.nodeType,
          headerTitle: updatedData.headerTitle
        })
        
        // 🔧 触发Vue组件更新
        console.log('🔄 [updateNodeFromConfig] 触发组件更新:', {
          nodeId: node.id,
          triggerUpdate: true,
          timestamp: Date.now()
        })
        node.setData(updatedData)
        
        // 🔧 验证数据是否正确保存
        const verifyData = node.getData?.()
        console.log('🔍 [updateNodeFromConfig] 验证节点数据保存:', {
          nodeId: node.id,
          savedNodeType: verifyData?.nodeType,
          savedType: verifyData?.type,
          savedConfig: verifyData?.config,
          savedDisplayLines: verifyData?.config?.displayLines,
          hasSavedDisplayLines: !!verifyData?.config?.displayLines?.length
        })
      }
      
      // 覆盖式端口重建：先移除所有现有端口
      const existingPorts = node.getPorts ? node.getPorts() : []
      existingPorts.forEach(p => node.removePort && node.removePort(p.id))
      
      // 设置新的端口组配置
      if (node.setProp) node.setProp('ports/groups', ports.groups)
      
      // 添加新的端口（覆盖式重建）
      if (ports.items && ports.items.length) {
        ports.items.forEach(it => node.addPort && node.addPort(it))
      }
      
      // 🔧 关键：强制触发Vue组件重新渲染
      console.log('🔄 [updateNodeFromConfig] 强制触发Vue组件更新:', {
        nodeId: node.id,
        nodeType,
        hasDisplayLines: !!rows?.length,
        displayLinesCount: rows?.length
      })
      
      // 🔧 X6 vue-shape系统：正确更新组件数据
      if (node.setProp && updatedData) {
        console.log('🔄 [updateNodeFromConfig] 更新X6 vue-shape组件数据')
        
        // 关键：使用node.prop()方法更新数据，这会触发vue-shape重新渲染
        node.prop('data', updatedData)
        node.prop('nodeType', nodeType)
        node.prop('headerTitle', headerTitle)
        node.prop('displayLines', rows)
        
        // 🔧 触发change:data事件 - X6 vue-shape系统的标准做法
        console.log('🔄 [updateNodeFromConfig] 触发change:data事件')
        node.trigger('change:data', { 
          current: updatedData, 
          previous: node.getData() 
        })
      }
      
      // 🔧 X6 vue-shape系统：数据更新完成，不需要额外触发机制
      console.log('✅ [updateNodeFromConfig] X6 vue-shape数据更新完成')
      
    } catch (e) {
      console.warn('[Horizontal] updateNodeFromConfig 异常:', e)
      throw e // 重新抛出异常，让上层处理
    } finally {
      endNodeUpdateMeasure()
    }
    
  } catch (error) {
    console.error('[Horizontal] updateNodeFromConfig 配置更新失败:', error)
    throw error
  } finally {
    // 性能监控：结束测量
    const metric = endMeasure()
    
    // 检查性能是否达标
    if (metric.exceeded) {
      console.warn(`[Performance] updateNodeFromConfig 性能警告: ${metric.duration.toFixed(2)}ms (阈值: ${metric.threshold}ms)`)
    } else {
      console.log(`[Performance] updateNodeFromConfig 完成: ${metric.duration.toFixed(2)}ms`)
    }
  }
}

// 统一更新路径：复用创建逻辑生成规格并应用到现有节点
// DocRef: 架构文档「关键代码片段/节点统一更新：尺寸、端口映射与数据写回」
async function updateNodeFromConfigUnified(node, nodeType, config) {
  try {
    updateNodeUnifiedSvc(graph, node, nodeType, config)
    return
    const label = config?.nodeName || getNodeLabel(nodeType) || nodeType
    const spec = createVueShapeNode({
      id: node.id,
      x: pos.x,
      y: pos.y,
      label,
      data: { type: nodeType, nodeType: nodeType, config, isConfigured: true }
    })
    node.resize(spec.width, spec.height)
    const existingPorts = node.getPorts ? node.getPorts() : []
    const existingIds = new Set((existingPorts || []).map(p => p.id))
    const specIds = new Set((spec.ports.items || []).map(p => p.id))
    if (node.setProp) node.setProp('ports/groups', spec.ports.groups)
    // 处理不在规格中的旧端口：优先尝试保留连线并重绑定到最接近的新端口
    ;(existingPorts || []).forEach(p => {
      if (!specIds.has(p.id)) {
        try {
          const isOut = p.group === 'out'
          const edges = graph?.getConnectedEdges?.(node) || []
          const outgoing = edges.filter(e => {
            try { return e.getSourceCellId?.() === node.id && e.getSourcePortId?.() === p.id } catch { return false }
          })
          // 选择映射的新端口：
          let targetNewPortId = null
          if (isOut) {
            // 优先同序号映射，其次回退到 out-0
            const match = /^out-(\d+)$/.exec(p.id)
            const newOutIds = Array.from(specIds).filter(id => /^out-\d+$/.test(String(id))).sort((a,b)=>{
              return Number(a.split('-')[1]) - Number(b.split('-')[1])
            })
            if (match) {
              const num = Number(match[1])
              const clamped = Math.max(0, Math.min(num, newOutIds.length - 1))
              targetNewPortId = newOutIds[clamped] || newOutIds[0] || null
            } else {
              targetNewPortId = newOutIds[0] || null
            }
          } else {
            // 输入端口统一映射到 'in'（若存在）
            targetNewPortId = specIds.has('in') ? 'in' : null
          }
          // 重绑定边到新端口
          if (targetNewPortId) {
            outgoing.forEach(e => {
              try { e.setSource({ cell: node.id, port: targetNewPortId }) } catch {}
            })
          }
          // 移除旧端口
          node.removePort?.(p.id)
        } catch {}
      }
    })
    // 端口差异更新：保留已存在端口并更新属性；新增端口按规格添加
    if (spec.ports.items && spec.ports.items.length) {
      spec.ports.items.forEach(it => {
        if (existingIds.has(it.id)) {
          try {
            node.setPortProp?.(it.id, 'group', it.group)
            if (it.args != null) node.setPortProp?.(it.id, 'args', it.args)
            if (it.attrs?.circle) {
              const c = it.attrs.circle
              if (c['data-port'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port', c['data-port'])
              if (c['data-port-group'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port-group', c['data-port-group'])
              if (c['data-port-type'] != null) node.setPortProp?.(it.id, 'attrs/circle/data-port-type', c['data-port-type'])
            }
          } catch {}
        } else {
          node.addPort && node.addPort(it)
        }
      })
    }
    if (node.setProp) {
      if (node.setData) {
        node.setData(spec.data)
      }
      node.prop('data', spec.data)
      node.prop('nodeType', spec.data.nodeType)
      node.prop('headerTitle', spec.data.headerTitle)
      node.prop('displayLines', spec.data.displayLines)
      node.trigger('change:data', { current: spec.data, previous: node.getData?.() })
    }
    
    const verify = node.getData?.() || {}
    console.log('🔎 [UnifiedUpdate] 配置与展示校验', {
      nodeId: node.id,
      nodeType,
      headerTitle: verify?.headerTitle,
      configKeys: Object.keys(verify?.config || {}),
      crowdLayersCount: Array.isArray(verify?.config?.crowdLayers) ? verify.config.crowdLayers.length : 0,
      branchesCount: Array.isArray(verify?.config?.branches) ? verify.config.branches.length : 0,
      hasUnmatch: !!verify?.config?.unmatchBranch,
      displayLinesCount: Array.isArray(verify?.config?.displayLines) ? verify.config.displayLines.length : 0,
      displayLines: verify?.config?.displayLines,
    })
    console.log('✅ [updateNodeFromConfigUnified] 已应用统一更新路径', {
      nodeId: node.id,
      width: spec.width,
      height: spec.height,
      displayLinesCount: spec.data?.displayLines?.length || 0,
      portItemsCount: spec.ports.items?.length || 0
    })
  } catch (e) {
    console.error('[Horizontal] updateNodeFromConfigUnified 失败:', e)
  }
}

// 基于DOM测量重建端口功能已移除 - 现在通过Vue组件自动处理端口定位

// 节点操作菜单
function renameCurrentNode() {
  const nodeId = nodeActionsMenu.value.nodeId
  if (!nodeId || !graph) return
  const node = graph.getCellById(nodeId)
  if (!node) return
  const data = node.getData?.() || {}
  const nodeType = data?.type || data?.nodeType
  if (nodeType) {
    configDrawers.openConfigDrawer(nodeType, node, data)
  }
  nodeActionsMenu.value.visible = false
}

function copyCurrentNode() {
  const nodeId = nodeActionsMenu.value.nodeId
  if (!nodeId || !graph) return
  const node = graph.getCellById(nodeId)
  if (!node) return
  const data = node.getData?.() || {}
  const pos = node.getPosition?.() || { x: 0, y: 0 }
  const nodeType = data?.type || data?.nodeType
  if (!nodeType) return
  const label = getNodeLabel(nodeType) || nodeType
  const fourOutTypes = ['crowd-split', 'event-split', 'ab-test']
  const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
  const newNodeId = `${nodeType}-copy-${Date.now()}`
  graph.addNode(createVueShapeNode({
    id: newNodeId,
    x: pos.x + 40,
    y: pos.y + 40,
    label,
    outCount,
    data: { ...data, nodeName: `${data?.nodeName || label}_副本` }
  }))
  nodeActionsMenu.value.visible = false
}

function deleteCurrentNode() {
  const nodeId = nodeActionsMenu.value.nodeId
  if (!nodeId || !graph) return
  deleteNodeCascade(nodeId)
  nodeActionsMenu.value.visible = false
}

function deleteNodeCascade(nodeId) {
  if (!graph || !nodeId) return
  try {
    const node = graph.getCellById(nodeId)
    if (!node) return
    const edges = graph.getConnectedEdges(node)
    edges.forEach(e => graph.removeEdge(e))
    graph.removeNode(nodeId)
  } catch (e) {
    console.warn('[Horizontal] deleteNodeCascade 异常:', e)
  }
}

function deleteCurrentEdge() {
  const id = edgeActionsMenu.value.edgeId
  if (!id || !graph) return
  if (isViewMode.value) { edgeActionsMenu.value = { visible: false, x: 0, y: 0, edgeId: null }; return }
  try {
    graph.removeEdge(id)
  } catch {}
  edgeActionsMenu.value = { visible: false, x: 0, y: 0, edgeId: null }
}

function deleteCurrentPortEdge() {
  const id = portActionsMenu.value.edgeId
  if (!id || !graph) { portActionsMenu.value.visible = false; return }
  if (isViewMode.value) { portActionsMenu.value = { visible: false, x: 0, y: 0, nodeId: null, portId: null, edgeId: null }; return }
  try {
    graph.removeEdge(id)
  } catch {}
  portActionsMenu.value = { visible: false, x: 0, y: 0, nodeId: null, portId: null, edgeId: null }
}

function closePortMenu() {
  portActionsMenu.value = { visible: false, x: 0, y: 0, nodeId: null, portId: null, edgeId: null }
}

function closeEdgeMenu() {
  edgeActionsMenu.value = { visible: false, x: 0, y: 0, edgeId: null }
}

// 在updateNodeFromConfig函数定义后初始化配置抽屉
configDrawers = useConfigDrawers(() => graph, { updateNodeFromConfig: updateNodeFromConfigUnified })
console.log('✅ [Horizontal] 配置抽屉初始化完成:', {
  hasConfigDrawers: !!configDrawers,
  hasUpdateFunction: !!configDrawers?.updateNodeFromConfig,
  updateFunctionType: typeof configDrawers?.updateNodeFromConfig,
  hasHandleConfigConfirm: !!configDrawers?.handleConfigConfirm
})

// 处理编辑模式的参数 - 在graph完全初始化后
const query = route.query
console.log('[Horizontal] 路由查询参数:', query)

if ((query.mode === 'edit' || query.mode === 'view') && query.id) {
  console.log(`[Horizontal] ${query.mode === 'edit' ? '编辑' : '查看'}模式 - 任务ID: ${query.id}, 版本: ${query.version}`)
  try {
    setTimeout(() => { loadTaskData() }, 300)
  } catch (error) {
    console.error('[Horizontal] 加载任务数据时发生错误:', error)
    Message.error('加载任务数据失败: ' + error.message)
  }
} else {
  console.log('[Horizontal] 新建任务模式')
}

// 切换节点禁用状态
function toggleNodeDisabled() {
  const nodeId = nodeActionsMenu.value.nodeId
  if (!nodeId || !graph) return
  
  try {
    const node = graph.getCellById(nodeId)
    if (!node) return
    
    const data = node.getData?.() || {}
    const currentDisabled = data.disabled === true
    const newDisabled = !currentDisabled
    
    // 使用setNodeDisabled函数来切换状态
    setNodeDisabled(nodeId, newDisabled)
    
  } catch (e) {
    console.warn('[Horizontal] toggleNodeDisabled 异常:', e)
  }
  
  nodeActionsMenu.value.visible = false
}

function debugCurrentNode() {
  // 立即输出点击确认，确保函数被调用
  console.log('🎯 [Horizontal] 调试按钮被点击，开始处理...')
  
  const nodeId = nodeActionsMenu.value.nodeId
  if (!nodeId) {
    console.warn('❌ [Horizontal] 未获取到节点ID')
    return
  }
  
  if (!graph) {
    console.warn('❌ [Horizontal] 图形实例未初始化')
    return
  }
  
  try {
    const node = graph.getCellById(nodeId)
    if (!node) {
      console.warn(`❌ [Horizontal] 未找到节点: ${nodeId}`)
      return
    }
    
    console.log(`✅ [Horizontal] 成功获取节点: ${nodeId}`)
    
    // 获取节点数据用于调试
    const data = node.getData?.() || {}
    const nodeType = data?.nodeType || data?.type
    const cfg = data?.config || {}
    const nodeName = data?.nodeName || cfg?.nodeName || '未命名节点'
    
    // 获取节点位置信息
    const position = node.position?.() || node.getPosition?.() || { x: 0, y: 0 }
    const bbox = node.getBBox?.() || { x: position.x, y: position.y, width: 0, height: 0 }
    
    console.log(`📋 [Horizontal] 节点基本信息:`, {
      nodeId,
      nodeType,
      nodeName,
      configKeys: Object.keys(cfg),
      dataKeys: Object.keys(data),
      position,
      bbox: {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width || 0,
        height: bbox.height || 0
      }
    })
    
    // 获取设计规范中的标准文字内容
    const standardLabel = getNodeLabel(nodeType) || '未知节点类型'
    const standardIconText = getNodeIconText(nodeType)
    
    const rows = buildDisplayLines(nodeType, cfg)
    
    console.log(`📝 [Horizontal] 文字内容分析:`, {
      standardLabel,
      standardIconText,
      configContent: cfg,
      displayRows: rows,
      rowCount: rows.length
    })
    
    const ports = node.getPorts?.() || []
    console.log('🔌 [Horizontal] 端口信息:')
    console.log(`   - 端口总数: ${ports.length}`)
    ports.forEach(port => {
      console.log(`   - 端口: ${port.id} (组: ${port.group})`)
    })
    
    // 节点基础尺寸
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const width = NODE_DIMENSIONS.WIDTH
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)
  const isSplit = nodeType === 'audience-split' || nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
    const contentHeight = Math.max(1, rows.length) * rowHeight
    const contentCenter = headerHeight + contentPadding + Math.floor(contentHeight / 2)
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST
    
    console.log('==========================================')
    console.log(`🎯 [Horizontal] 节点元素位置调试信息 - ${nodeName}`)
    console.log('==========================================')
    
    // 节点基础信息区域
    console.log('📍 节点基础信息:')
    console.log(`   - 节点ID: ${nodeId}`)
    console.log(`   - 节点类型: ${nodeType}`)
    console.log(`   - 节点名称: ${nodeName}`)
    console.log(`   - 节点位置: (${position.x}, ${position.y})`)
    console.log(`   - 节点尺寸: ${width} × ${height}`)
    console.log(`   - 是否分流节点: ${isSplit}`)
    console.log(`   - 内容行数: ${rows.length}`)
    
    // 文字内容对比展示
    console.log('\n📝 文字内容详细对比:')
    console.log(`   - 标准标签: "${standardLabel}"`)
    console.log(`   - 配置名称: "${nodeName}"`)
    console.log(`   - 图标文字: "${standardIconText}"`)
    console.log(`   - 实际显示行数: ${rows.length}`)
    
    // 预先声明分流节点的垂直偏移数组，避免作用域问题
    let computedVerticalOffsets = []
    const compactMode = true
    try {
      const view = graph?.findViewByCell ? graph.findViewByCell(node) : null
      const contentEl = view?.container?.querySelector ? view.container.querySelector('.horizontal-node__content') : null
      const textElements = contentEl ? Array.from(contentEl.querySelectorAll('.port-indicator')) : []
      const cfgLines = cfg?.displayLines || []
      const topLines = (node.getData?.() || {}).displayLines || []
      const outPortsCount = ports.filter(p => p.group === 'out').length
      const inPortsCount = ports.filter(p => p.group === 'in').length
      const problems = []
      if (!contentEl) problems.push('NO_CONTENT_DOM')
      if (textElements.length === 0) problems.push('NO_CONTENT_ROWS')
      if (rows.length !== textElements.length) problems.push('ROW_COUNT_MISMATCH')
      if (outPortsCount !== rows.length) problems.push('OUT_PORT_COUNT_MISMATCH')
      let firstMismatch = null
      for (let i = 0; i < Math.min(rows.length, textElements.length); i++) {
        const actual = (textElements[i]?.textContent || '').trim()
        if (actual !== rows[i]) { firstMismatch = { index: i, expected: rows[i], actual } ; break }
      }
      const nodeRect = view?.container?.getBoundingClientRect ? view.container.getBoundingClientRect() : null
      const containerRect = graph?.container?.getBoundingClientRect ? graph.container.getBoundingClientRect() : { top: 0, left: 0 }
      const bbox = node.getBBox ? node.getBBox() : null
      const nodeTopGraph = Math.round(bbox?.y || position.y)
      const layoutCenterGraphY = nodeTopGraph + Math.round((bbox?.height || nodeRect?.height || height) / 2)
      const expectedRowYsGraph = rows.map((_, i) => nodeTopGraph + (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + i * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2)))
      const outPorts = node.getPorts ? node.getPorts().filter(p => p.group === 'out') : []
      const outComputed = outPorts.map(p => {
        const a = p?.args || {}
        const hasRow = typeof a.rowIndex === 'number'
        const yRel = hasRow
          ? (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + a.rowIndex * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2))
          : (typeof a.y === 'number'
            ? Number(a.y)
            : ((layoutCenterGraphY - nodeTopGraph) + (a.dy ?? 0)))
        return { id: p.id, yGraph: (bbox?.y || nodeTopGraph) + yRel }
      })
      const coordValidations = rows.map((_, i) => {
        const pid = `out-${i}`
        const port = outComputed.find(o => o.id === pid) || outComputed[i]
        const expY = expectedRowYsGraph[i]
        const portY = port ? port.yGraph : null
        const delta = portY != null ? Math.abs(portY - expY) : null
        const ok = delta != null ? delta <= 2 : false
        return { index: i, expectedY: expY, portId: port ? port.id : null, portY, delta, ok }
      })
      const firstCoordIssue = coordValidations.find(v => !v.ok)
      if (firstCoordIssue) problems.push('OUT_PORT_MISALIGNED')
      coordValidations.forEach(v => {
        console.log(`   - 行${v.index}: 期望Y=${v.expectedY} 端口(${v.portId})Y=${v.portY} 差值=${v.delta} 对齐=${v.ok ? '✅' : '❌'}`)
      })
      const allPorts = Array.from(view?.container?.querySelectorAll?.('.x6-port-body[data-port][data-port-group="out"]') || [])
      const circleInfos = allPorts.map(circleEl => {
        const id = circleEl.getAttribute('data-port') || ''
        const group = circleEl.getAttribute('data-port-group') || ''
        const absYAttr = circleEl.getAttribute('data-abs-y')
        let cyClient
        if (circleEl.ownerSVGElement) {
          const svg = circleEl.ownerSVGElement
          const pt = svg.createSVGPoint()
          pt.x = 0
          pt.y = 0
          const parentEl = circleEl.parentElement
          const ctm = parentEl && typeof parentEl.getScreenCTM === 'function' ? parentEl.getScreenCTM() : (typeof circleEl.getScreenCTM === 'function' ? circleEl.getScreenCTM() : null)
          const screenPt = ctm ? pt.matrixTransform(ctm) : null
          if (screenPt) {
            cyClient = Math.round(screenPt.y)
          } else {
            const rect = circleEl.getBoundingClientRect()
            cyClient = Math.round(rect.top + rect.height / 2)
          }
        } else {
          const rect = circleEl.getBoundingClientRect()
          cyClient = Math.round(rect.top + rect.height / 2)
        }
        const cg = graph.clientToGraphPoint ? graph.clientToGraphPoint({ x: 0, y: cyClient }) : { x: 0, y: Math.round(cyClient - containerRect.top) }
        return { id, group, cyGraph: Math.round(cg.y), cyClient: Math.round(cyClient), absYConfigured: absYAttr != null ? Number(absYAttr) : null }
      })
      let outDomInfos = circleInfos.filter(c => (c.group && c.group.includes('out')) || (c.id && c.id.startsWith('out')))
      if (!outDomInfos.length) {
        // 回退：按Y排序并按行索引映射
        outDomInfos = circleInfos.slice().sort((a, b) => a.cyGraph - b.cyGraph)
      }
      const domCoordValidations = rows.map((_, i) => {
        const relY = NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + i * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2)
        const expectedGraphY = nodeTopGraph + relY
        const expectedClientPt = graph?.graphToClientPoint ? graph.graphToClientPoint({ x: 0, y: expectedGraphY }) : { x: 0, y: Math.round(containerRect.top + expectedGraphY) }
        const expectedYClient = Math.round(expectedClientPt.y)
        const textEl = textElements[i]
        const textYClient = textEl ? (() => { const r = textEl.getBoundingClientRect(); return Math.round(r.top + r.height / 2) })() : null
        const domPort = outDomInfos.find(o => o.id === `out-${i}`) || outDomInfos[i]
        const portYClient = domPort ? domPort.cyClient : null
        const pObj = outPorts.find(po => po.id === `out-${i}`) || outPorts[i]
        const portAbsRelY = pObj && pObj.position && pObj.position.args && typeof pObj.position.args.y === 'number' ? Number(pObj.position.args.y) : null
        const portGraphY = portAbsRelY != null ? (bbox?.y || nodeTopGraph) + portAbsRelY : null
        const portClientFromGraph = portGraphY != null && graph?.graphToClientPoint ? Math.round(graph.graphToClientPoint({ x: 0, y: portGraphY }).y) : expectedYClient
        const configuredYClient = expectedYClient
        const deltaText = textYClient != null ? Math.abs(textYClient - expectedYClient) : null
        const deltaPortConv = portClientFromGraph != null ? Math.abs(portClientFromGraph - expectedYClient) : null
        const deltaPortDom = portYClient != null ? Math.abs(portYClient - expectedYClient) : null
        const configDelta = configuredYClient != null ? Math.abs(configuredYClient - expectedYClient) : null
        const ok = deltaText != null && deltaPortConv != null ? (deltaText <= 2 && deltaPortConv <= 2) : false
        console.log(`   - 公式[行${i}] relY=${relY} expectedGraphY=${expectedGraphY} expectedClientY=${expectedYClient} portAbsRelY=${portAbsRelY} portGraphY=${portGraphY} portClientY(DOM)=${portYClient} portClientY(GraphConv)=${portClientFromGraph}`)
        return { index: i, expectedY: expectedYClient, textY: textYClient, portId: domPort ? (domPort.id || '(unknown)') : null, portY: portYClient, portYConv: portClientFromGraph, configuredY: configuredYClient, deltaText, deltaPortDom, deltaPortConv, configDelta, ok }
      })
      const firstDomIssue = domCoordValidations.find(v => !v.ok)
      if (firstDomIssue) problems.push('DOM_MISALIGNED')
      domCoordValidations.forEach(v => {
        console.log(`   - DOM行${v.index}: 期望Y=${v.expectedY} 文本Y=${v.textY} 端口(${v.portId})Y_DOM=${v.portY} 端口Y_Conv=${v.portYConv} 文本差值=${v.deltaText} 端口差值(DOM)=${v.deltaPortDom} 端口差值(Conv)=${v.deltaPortConv} 配置Y=${v.configuredY} 配置差值=${v.configDelta} 对齐=${v.ok ? '✅' : '❌'}`)
      })

      try {
        const portIds = rows.map((_, i) => `out-${i}`)
        const yClients = rows.map((_, i) => {
          const el = contentEl?.querySelector?.(`[data-row="${i}"]`)
          if (!el || !el.getBoundingClientRect) return null
          const r = el.getBoundingClientRect()
          const cy = Math.round(r.top + r.height / 2)
          const cg = graph.clientToGraphPoint ? graph.clientToGraphPoint({ x: 0, y: cy }) : { x: 0, y: Math.round(cy - containerRect.top) }
          const yRel = Math.round(cg.y - (bbox?.y || nodeTopGraph))
          return yRel
        })
        // 保留布局器控制端口位置，不做DOM绝对位置覆盖
        
      } catch {}
      const summary = {
        nodeId,
        nodeType,
        displayLinesCount: rows.length,
        domContentCount: textElements.length,
        outPortsCount,
        inPortsCount,
        cfgDisplayLinesCount: Array.isArray(cfgLines) ? cfgLines.length : 0,
        topLevelDisplayLinesCount: Array.isArray(topLines) ? topLines.length : 0,
        firstExpected: rows[0] || '',
        firstActual: textElements[0]?.textContent?.trim() || '',
        firstMismatch,
        problems,
        coordValidations,
        firstCoordIssue,
        domCoordValidations,
        firstDomIssue
      }
      if (problems.length) {
        console.error('🔴 [Horizontal] 节点诊断失败', summary)
      } else {
        console.info('🟢 [Horizontal] 节点诊断通过', summary)
      }
      if (compactMode) {
        console.log('==========================================')
        nodeActionsMenu.value.visible = false
        return
      }
    } catch {}

    if (rows.length > 0) {
      console.log('   - 显示内容详情:')
      rows.forEach((text, index) => {
        console.log(`     第${index + 1}行: "${text}"`)
      })
    }
    
    // 标题区域详细信息
    console.log('\n🎯 标题区域 (header):')
    console.log(`   - 选择器: [selector="header"]`)
    console.log(`   - 位置: (0, 0) [相对节点]`)
    console.log(`   - 尺寸: ${width} × ${headerHeight}`)
    console.log(`   - 背景色: #F2F3F5`)
    console.log(`   - 边框: 1px solid #E5E6EB`)
    console.log(`   - 垂直对齐: 所有标题元素应在36px高度内垂直居中`)
    
    console.log('\n📐 标题元素垂直对齐验证:')
    console.log(`   - header-icon Y: 8 (图标顶部)`)
    console.log(`   - header-icon-text Y: ${POSITIONS.ICON_TEXT_Y} (文字基线)`)
    console.log(`   - header-title Y: ${POSITIONS.TITLE_Y} (文字基线)`)
    console.log(`   - menu-dots Y: ${POSITIONS.MENU_DOT_Y} (菜单点中心)`)
    console.log(`   - 垂直中心线: ${headerHeight / 2} = 18px`)
    
    console.log('\n🎨 图标区域 (header-icon):')
    console.log(`   - 选择器: [selector="header-icon"]`)
    console.log(`   - 位置: (12, 8) [相对header]`)
    console.log(`   - 绝对位置: (12, 8) [相对节点]`)
    console.log(`   - 尺寸: 24 × 24`)
    console.log(`   - 背景色: ${COLORS.HEADER_ICON}`)
    console.log(`   - 圆角: 4px`)
    console.log(`   - 图标文字: "${standardIconText}"`)
    
    console.log('\n🔤 图标文本 (header-icon-text):')
    console.log(`   - 选择器: [selector="header-icon-text"]`)
    console.log(`   - 位置: (${POSITIONS.ICON_TEXT_X}, ${POSITIONS.ICON_TEXT_Y}) [相对header]`)
    console.log(`   - 绝对位置: (${POSITIONS.ICON_TEXT_X}, ${POSITIONS.ICON_TEXT_Y}) [相对节点]`)
    console.log(`   - 文本: "${standardIconText}"`)
    console.log(`   - 颜色: ${COLORS.ICON_TEXT}`)
    console.log(`   - 字体大小: ${TYPOGRAPHY.ICON_FONT_SIZE}px`)
    console.log(`   - 文本锚点: ${TYPOGRAPHY.ICON_TEXT_ANCHOR}`)
    
    console.log('\n📝 标题文本 (header-title):')
    console.log(`   - 选择器: [selector="header-title"]`)
    console.log(`   - 位置: (${POSITIONS.TITLE_X}, ${POSITIONS.TITLE_Y}) [相对header]`)
    console.log(`   - 绝对位置: (${POSITIONS.TITLE_X}, ${POSITIONS.TITLE_Y}) [相对节点]`)
    console.log(`   - 标准文本: "${standardLabel}"`)
    console.log(`   - 实际文本: "${nodeName}"`)
    console.log(`   - 颜色: ${COLORS.TITLE_TEXT}`)
    console.log(`   - 字体大小: ${TYPOGRAPHY.TITLE_FONT_SIZE}px`)
    console.log(`   - 字重: ${TYPOGRAPHY.TITLE_FONT_WEIGHT}`)
    console.log(`   - 文本锚点: ${TYPOGRAPHY.TITLE_TEXT_ANCHOR}`)
    console.log(`   - 文字边界框: X=${POSITIONS.TITLE_X}, Y=${POSITIONS.TITLE_Y}, 宽度自适应`)
    
    // 菜单点详细信息
    console.log('\n⚙️ 菜单点 (menu-dots):')
    console.log(`   - 菜单点0: 选择器 [selector="menu-dot-0"], 位置 (${width + POSITIONS.MENU_DOT_OFFSETS[0]}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 菜单点1: 选择器 [selector="menu-dot-1"], 位置 (${width + POSITIONS.MENU_DOT_OFFSETS[1]}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 菜单点2: 选择器 [selector="menu-dot-2"], 位置 (${width + POSITIONS.MENU_DOT_OFFSETS[2]}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 颜色: ${COLORS.MENU_DOT}`)
    console.log(`   - 圆角: 1.5px`)
    console.log(`   - 可见性: ${nodeType === 'start' || nodeType === 'end' ? '隐藏' : '可见'}`)
    
    // 内容区域详细信息
    console.log('\n📋 内容区域:')
    console.log(`   - 内容起始Y坐标: ${headerHeight + contentPadding}`)
    console.log(`   - 内容高度: ${contentHeight}`)
    console.log(`   - 内容中心Y坐标: ${contentCenter}`)
    console.log(`   - 文本对齐: dominantBaseline=middle（按行几何中点对齐）`)
    console.log(`   - 第0行Y坐标验证: ${headerHeight} + ${contentPadding} + 0×${rowHeight} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust} = ${headerHeight + contentPadding + Math.floor(rowHeight / 2) + baselineAdjust}`)
    
    if (rows.length > 0) {
      console.log(`   - 行信息详情:`)
      rows.forEach((text, i) => {
        // 行几何中点：headerHeight + contentPadding + i * rowHeight + rowHeight/2
        const v = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
        const absTextX = position.x + POSITIONS.CONTENT_START_X
        const absTextY = position.y + v
        const clientText = graph?.graphToClientPoint ? graph.graphToClientPoint({ x: absTextX, y: absTextY }) : { x: absTextX, y: absTextY }
        console.log(`     第${i + 1}行:`)
        console.log(`       - 选择器: [selector="row-${i}"]`)
        console.log(`       - Y坐标: ${v} [相对节点]`)
        console.log(`       - 计算过程: ${headerHeight} + ${contentPadding} + ${i}×${rowHeight} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust} = ${v}`)
        console.log(`       - 绝对坐标(文本): (${absTextX}, ${absTextY}) [相对画布]`)
        console.log(`       - 屏幕坐标(文本): (${clientText.x}, ${clientText.y}) [考虑缩放/平移]`)
        console.log(`       - 文本内容: "${text}"`)
        console.log(`       - 字体大小: ${TYPOGRAPHY.CONTENT_FONT_SIZE}px`)
        console.log(`       - 颜色: ${COLORS.CONTENT_TEXT}`)
        console.log(`       - 文本锚点: ${TYPOGRAPHY.CONTENT_TEXT_ANCHOR}`)
        // 对应行的 out 端口坐标（相对节点）：行几何中点（与文本 dominantBaseline: middle 对齐）
        const outY = v
        const outId = isSplit ? `out-${i}` : 'out'
        const absOutX = position.x + width
        const absOutY = position.y + outY
        const clientOut = graph?.graphToClientPoint ? graph.graphToClientPoint({ x: absOutX, y: absOutY }) : { x: absOutX, y: absOutY }
        console.log(`       - 对齐的输出端口: id=${outId}, 坐标 (${width}, ${outY}) [相对节点]`)
        console.log(`       - 对齐的输出端口绝对坐标: (${absOutX}, ${absOutY}) [相对画布]`)
        console.log(`       - 对齐的输出端口屏幕坐标: (${clientOut.x}, ${clientOut.y}) [考虑缩放/平移]`)
        console.log(`       - 端口dy: ${outY} - (${height} / 2) = ${outY - (height / 2)}`)
      })

      // 追加：DOM实测（文本BBox中心 与 端口circle中心）
      try {
        const view = graph?.findViewByCell ? graph.findViewByCell(node) : null
        console.log('\n🔬 DOM测量: 文本BBox中心与端口circle中心对比')
        if (!view) {
          console.warn('   - 未能获取到节点视图，跳过DOM测量')
        } else {
          // 坐标基准：容器与节点的DOM矩形
          const bbox = node.getBBox ? node.getBBox() : null
          const nodeTopGraph = Math.round(bbox?.y || 0)
          const nodeCenterGraphY = Math.round((bbox?.y || 0) + ((bbox?.height || 0) / 2))
          console.log(`   - 坐标基准: nodeTopGraph=${nodeTopGraph} nodeCenterGraphY=${nodeCenterGraphY}`)

          // 文本BBox中心（增强内容行匹配）
          console.log('\n🔍 内容行DOM测量（增强匹配）:')
          
          // 获取所有内容元素
          const contentEl = view.container?.querySelector('.horizontal-node__content')
          if (contentEl) {
            const textElements = Array.from(contentEl.querySelectorAll('.port-indicator'))
            console.log(`   - 找到内容区域，共 ${textElements.length} 个.port-indicator元素`)
            console.log(`   - 期望内容行数: ${rows.length}`)
            if (textElements.length === 0) {
              const d = node.getData?.() || {}
              const cfgLines = d?.config?.displayLines || []
              const topLines = d?.displayLines || []
              const reasons = []
              if (!Array.isArray(cfgLines) || cfgLines.length === 0) reasons.push('config.displayLines为空')
              if (!Array.isArray(topLines) || topLines.length === 0) reasons.push('顶层displayLines为空')
              reasons.push('组件未渲染或outRows返回空')
              console.warn('   - ❗ 内容元素为0，可能原因: ' + reasons.join('、'))
              console.log('   - 数据检测: ', {
                cfgDisplayLinesCount: Array.isArray(cfgLines) ? cfgLines.length : 0,
                cfgDisplayLines: cfgLines,
                topLevelDisplayLinesCount: Array.isArray(topLines) ? topLines.length : 0,
                topLevelDisplayLines: topLines
              })
            }
            
            // 按顺序匹配内容行和DOM元素（使用data-row属性）
            rows.forEach((text, i) => {
              // 使用data-row属性查找对应的元素
              const textEl = contentEl.querySelector(`[data-row="${i}"]`)
              if (textEl && textEl.getBoundingClientRect) {
                const rect = textEl.getBoundingClientRect()
                const centerClientX = Math.round(rect.left + rect.width / 2)
                const centerClientY = Math.round(rect.top + rect.height / 2)
                // 使用容器Rect做简单转换，避免API不生效导致的坐标不一致
                const cg = graph.clientToGraphPoint ? graph.clientToGraphPoint({ x: centerClientX, y: centerClientY }) : { x: Math.round(centerClientX - containerRect.left), y: Math.round(centerClientY - containerRect.top) }
                
                // 获取文本内容进行对比
                const actualText = textEl.textContent?.trim() || ''
                const expectedText = text?.trim() || ''
                const textMatch = actualText === expectedText
                const dataText = textEl.getAttribute('data-text') || ''
                const dataTextMatch = dataText === expectedText
                
                console.log(`   - [row-${i}] ✅ 找到DOM元素:`)
                console.log(`       - 期望文本: "${expectedText}"`)
                console.log(`       - 实际文本: "${actualText}"`)
                console.log(`       - data-text: "${dataText}"`)
                console.log(`       - 文本匹配: ${textMatch ? '✅' : '❌'} (data-text: ${dataTextMatch ? '✅' : '❌'})`)
                console.log(`       - 元素尺寸: 宽=${Math.round(rect.width)} 高=${Math.round(rect.height)}`)
                console.log(`       - 中心坐标: 屏幕=(${centerClientX}, ${centerClientY}) 画布=(${Math.round(cg.x)}, ${Math.round(cg.y)})`)
                
                // 验证内容是否正确显示
                if (!textMatch) {
                  console.warn(`       - ⚠️ 文本内容不匹配！期望:"${expectedText}" vs 实际:"${actualText}"`)
                }
                if (rect.width === 0 || rect.height === 0) {
                  console.warn(`       - ⚠️ 元素尺寸为0，可能未正确渲染！`)
                }
              } else {
                console.log(`   - [row-${i}] ❌ 缺少DOM元素: 期望文本:"${text}"`)
                console.log(`       - 可能原因: Vue组件未渲染、数据未更新、元素选择器错误`)
                
                // 提供调试建议
                console.log(`       - 调试建议:`)
                console.log(`         1. 检查HorizontalNode组件的outRows计算`)
                console.log(`         2. 检查节点数据中的displayLines或配置内容`)
                console.log(`         3. 检查Vue组件是否正确挂载和渲染`)
                console.log(`         4. 检查data-row属性是否正确设置`)
              }
            })
            
            // 如果有额外的DOM元素，也显示出来
            if (textElements.length > rows.length) {
              console.log(`   - ⚠️ 发现额外的DOM元素:`)
              for (let i = rows.length; i < textElements.length; i++) {
                const extraEl = textElements[i]
                const rect = extraEl.getBoundingClientRect()
                const text = extraEl.textContent?.trim() || ''
                console.log(`     [extra-${i}] 文本:"${text}" 尺寸:宽=${Math.round(rect.width)} 高=${Math.round(rect.height)}`)
              }
            }
          } else {
            console.log(`   - ❌ 内容区域(.horizontal-node__content)未找到`)
            console.log(`   - 可能原因:`)
            console.log(`     1. HorizontalNode组件未正确渲染`)
            console.log(`     2. Vue组件挂载失败`)
            console.log(`     3. 节点选择器错误`)
            console.log(`   - 建议检查节点视图结构:`, view.container?.innerHTML?.substring(0, 500))
          }

          // 端口circle中心（增强端口识别）
          const container = view.container
          // 尝试多种端口选择器
          const portSelectors = ['.x6-port', '.x6-port-body', '[data-port]', '[port]', '.port']
          let allPorts = []
          
          for (const selector of portSelectors) {
            allPorts = Array.from(container?.querySelectorAll?.(selector) || [])
            if (allPorts.length > 0) {
              console.log(`   - 使用选择器 ${selector} 找到 ${allPorts.length} 个端口元素`)
              break
            }
          }
          
          if (!allPorts.length) {
            console.warn('   - 未找到任何端口元素，尝试查看DOM结构:', container?.innerHTML?.substring(0, 500))
          } else {
            const circleInfos = allPorts.map(el => {
              // 增强端口属性获取
              const id = el.getAttribute('data-port') || el.getAttribute('port') || el.getAttribute('data-port-id') || 
                        el.getAttribute('port-id') || el.id || ''
              const group = el.getAttribute('data-port-group') || el.getAttribute('port-group') || 
                             el.getAttribute('group') || ''
              const type = el.getAttribute('portType') || el.getAttribute('data-port-type') || 
                          el.getAttribute('type') || ''
              
              // 从父元素或子元素获取端口信息
              const parentEl = el.parentElement
              const childEl = el.querySelector('[data-port], [port]')
              
              const finalId = id || (parentEl && (parentEl.getAttribute('data-port') || parentEl.getAttribute('port'))) || 
                             (childEl && (childEl.getAttribute('data-port') || childEl.getAttribute('port'))) || ''
              const finalGroup = group || (parentEl && parentEl.getAttribute('data-port-group')) || 
                                (childEl && childEl.getAttribute('data-port-group')) || ''
              const finalType = type || (parentEl && parentEl.getAttribute('portType')) || 
                               (childEl && childEl.getAttribute('portType')) || ''
              
              const rect = el.getBoundingClientRect()
              const cxClient = Math.round(rect.left + rect.width / 2)
              const cyClient = Math.round(rect.top + rect.height / 2)
              const cg = graph.clientToGraphPoint ? graph.clientToGraphPoint({ x: cxClient, y: cyClient }) : { x: Math.round(cxClient - containerRect.left), y: Math.round(cyClient - containerRect.top) }
              
              return { 
                id: finalId, 
                group: finalGroup, 
                type: finalType, 
                cxClient, 
                cyClient, 
                cxGraph: Math.round(cg.x), 
                cyGraph: Math.round(cg.y),
                element: el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '')
              }
            })

            // 增强端口识别逻辑
            const outCircles = circleInfos.filter(c => {
              const isOut = (c.group && c.group.includes('out')) || 
                         (c.type === 'out') || 
                         (c.id && c.id.startsWith('out')) ||
                         (c.id === 'out') ||
                         (c.element && c.element.includes('out'))
              return isOut && c.id !== 'in' // 确保不将in端口误判为out
            })
            
            const inCircles = circleInfos.filter(c => {
              const isIn = (c.group && c.group.includes('in')) || 
                        (c.type === 'in') || 
                        (c.id === 'in') ||
                        (c.element && c.element.includes('in'))
              return isIn
            })

            // 未识别的端口
            const unidentified = circleInfos.filter(c => 
              !outCircles.includes(c) && !inCircles.includes(c)
            )

            console.log(`   - 端口DOM统计: 总计${circleInfos.length}`)
            console.log(`   - in端口: ${inCircles.length}个`)
            console.log(`   - out端口: ${outCircles.length}个`)
            if (unidentified.length > 0) {
              console.log(`   - 未识别端口: ${unidentified.length}个`)
            }

            // 详细显示所有端口信息
            console.log('   - 端口详细信息:')
            circleInfos.forEach(c => {
              const portType = inCircles.includes(c) ? 'IN' : 
                             outCircles.includes(c) ? 'OUT' : 'UNKNOWN'
              console.log(`   - [${portType} ${c.id || '(无id)'}] group=${c.group || '(无group)'} type=${c.type || '(无type)'} element=${c.element}`)
              console.log(`     屏幕中心=(${c.cxClient}, ${c.cyClient}) 画布中心=(${c.cxGraph}, ${c.cyGraph})`)
            })

            // 增强端口和内容行的匹配检测
            const nodeBBox = node.getBBox()
            const nodeCenterY = nodeBBox.y + nodeBBox.height / 2
            
            console.log('\n🎯 端口与内容行匹配检测:')
            console.log(`   - 内容行数: ${rows.length}`)
            console.log(`   - out端口数: ${outCircles.length}`)
            console.log(`   - in端口数: ${inCircles.length}`)
            
            // in端口检测：应该位于节点中心
            if (inCircles.length > 0) {
              console.log('   📍 in端口对齐检测:')
              inCircles.forEach(c => {
                const delta = Math.abs(c.cyGraph - nodeCenterY)
                console.log(`   - [IN端口 ${c.id}] 实测Y=${c.cyGraph} 期望中心Y=${nodeCenterY} 差值=${delta}`)
                if (delta > 2) {
                  console.warn(`   - ⚠️ IN端口 ${c.id} 未对齐到节点中心！`)
                } else {
                  console.log(`   - ✅ IN端口 ${c.id} 正确对齐到节点中心`)
                }
              })
            }
            
            // out端口与内容行匹配检测
            if (outCircles.length > 0 && rows.length > 0) {
              console.log('   📍 out端口与内容行匹配检测:')
              console.log(`   - out端口数量: ${outCircles.length}`)
              console.log(`   - 内容行数量: ${rows.length}`)
              console.log(`   - 期望的行Y坐标计算参数:`)
              console.log(`     - headerHeight: ${headerHeight}`)
              console.log(`     - contentPadding: ${contentPadding}`)
              console.log(`     - rowHeight: ${rowHeight}`)
              console.log(`     - baselineAdjust: ${baselineAdjust}`)
              
              // 获取内容元素的实际位置
              const contentEl = view.container?.querySelector('.horizontal-node__content')
              const textElements = contentEl ? Array.from(contentEl.querySelectorAll('.port-indicator')) : []
              
              console.log(`   - 找到 ${textElements.length} 个内容元素`)
              
              // 计算期望的行Y坐标（基于节点顶部 + 绝对偏移）
              const expectedRowYs = rows.map((_, i) => {
                const rowYFromNodeTop = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
                const expectedY = nodeBBox.y + rowYFromNodeTop
                console.log(`     - 行${i}: 相对节点顶部=${rowYFromNodeTop}, 绝对Y=${expectedY}`)
                return expectedY
              })
              
              // 将out端口按Y坐标排序
              const sortedOut = outCircles.slice().sort((a, b) => a.cyGraph - b.cyGraph)
              
              // 匹配端口和内容行
            rows.forEach((rowText, rowIndex) => {
              const expectedY = expectedRowYs[rowIndex]
                
                // 找到对应的端口（按Y坐标最接近的）
                const closestPort = sortedOut.find(c => {
                  const m = String(c.id || '').match(/out-(\d+)/)
                  const idIdx = m ? Number(m[1]) : -1
                  return idIdx === rowIndex
                }) || sortedOut[rowIndex]
                
                const contentEl = textElements[rowIndex]
                const actualContentY = contentEl ? (() => {
                  const rect = contentEl.getBoundingClientRect()
                  return Math.round(rect.top + rect.height / 2)
                })() : null
                
                if (closestPort) {
                  const delta = Math.abs(closestPort.cyGraph - expectedY)
                  console.log(`   - [行${rowIndex}] "${rowText}"`)
                  console.log(`     期望Y: ${expectedY}`)
                  console.log(`     端口Y: ${closestPort.cyGraph} (id: ${closestPort.id})`)
                  if (actualContentY) {
                    console.log(`     内容Y: ${actualContentY}`)
                  }
                  console.log(`     差值: ${delta}`)
                  
                  if (delta > 2) {
                    console.warn(`     ⚠️ 端口未对齐到内容行！`)
                  } else {
                    console.log(`     ✅ 端口正确对齐到内容行`)
                  }
                } else {
                  console.log(`   - [行${rowIndex}] "${rowText}" - 未找到对应端口`)
                }
              })
              const problems = []
              if (textElements.length !== rows.length) problems.push(`内容元素数量不匹配: 期望${rows.length} 实际${textElements.length}`)
              // 使用前面计算的 sortedOut
              if (sortedOut.length !== rows.length) problems.push(`out端口数量不匹配: 期望${rows.length} 实际${sortedOut.length}`)
              const allTextOk = textElements.length === rows.length && rows.every((t, i) => (textElements[i]?.textContent || '').trim() === t)
              if (!allTextOk) problems.push('内容文本与期望不一致')
              if (problems.length) {
                console.warn('\n❗ 诊断结论: ' + problems.join('；'))
              } else {
                console.log('\n✅ 诊断结论: 内容与端口完全匹配')
              }
            } else if (outCircles.length > 0) {
              console.log('   - out端口存在但无内容行，按Y坐标排序检测:')
              const sortedOut = outCircles.slice().sort((a, b) => a.cyGraph - b.cyGraph)
              sortedOut.forEach((c, idx) => {
                console.log(`   - [OUT端口 ${c.id}] Y=${c.cyGraph}`)
              })
            }

            // 建议补偿：按布局器基准给出每个out端口的理想dy（相对节点顶部）
            // 使用与端口创建时完全相同的dy计算
            const recommendedDys = rows.map((_, i) => {
              const rowYFromNodeTop = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
              // 转换为相对节点中心的dy（因为X6端口系统使用相对中心的dy）
              return rowYFromNodeTop - (height / 2)
            })
            console.log(`   - 建议端口dy(基于layout): [${recommendedDys.map(v => Math.round(v)).join(', ')}]  (height=${height})`)

            // 直接应用推荐dy到端口（按 out-i 映射），便于快速校正
            try {
              const portIds = rows.map((_, i) => `out-${i}`)
              portIds.forEach((pid, i) => {
                const dy = Math.round(recommendedDys[i])
                if (node.setPortProp) {
                  node.setPortProp(pid, 'position/args/dy', dy)
                  node.setPortProp(pid, 'args/dy', dy)
                  const yRel = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
                  node.setPortProp(pid, 'args/y', yRel)
                }
              })
              console.log('   - 已应用DOM推荐dy到端口: ', portIds.map((pid, i) => `${pid}:${Math.round(recommendedDys[i])}`).join(', '))
            } catch (applyErr) {
              console.warn('   - 应用推荐dy失败（忽略，继续调试）:', applyErr)
            }
          }
        }
      } catch (domErr) {
        console.warn('   - DOM测量异常:', domErr)
      }

      // 计算分流节点各行的垂直中点偏移（相对节点坐标），采用行几何中点
      if (isSplit && rows.length > 0) {
        computedVerticalOffsets = rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
        console.log(`   - 分流节点垂直偏移: [${computedVerticalOffsets.join(', ')}]`)
      }
    } else {
      console.log('   - 无内容行 (空节点)')
    }
    
    // 端口信息
    console.log('\n🔌 端口信息:')
    console.log(`   - 输入端口: Y坐标 ${contentCenter} (相对节点)`)
    console.log(`   - 输出端口数量: ${isSplit ? Math.max(1, rows.length) : 1}`)
    if (isSplit && rows.length > 0) {
      const outIds = rows.map((_, i) => `out-${i}`)
      console.log(`   - 输出端口ID: [${outIds.join(', ')}]`)
      console.log(`   - 输出端口Y坐标: [${computedVerticalOffsets.join(', ')}] (相对节点)`)
    } else {
      console.log(`   - 输出端口Y坐标: ${contentCenter} (相对节点)`)
    }

    // 端口-内容行对齐检测（读取实际端口配置与最终Y）
    try {
      const ports = node.getPorts ? node.getPorts() : []
      const outPorts = ports.filter(p => p.group === 'out')
      const contentStart = headerHeight + contentPadding
      const rowYs = rows.map((_, i) => contentStart + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
      // 统一以DOM节点中心为基准
      const view = graph?.findViewByCell ? graph.findViewByCell(node) : null
      const containerRect = graph?.container?.getBoundingClientRect ? graph.container.getBoundingClientRect() : { top: 0, left: 0 }
      const nodeRect = view?.container?.getBoundingClientRect ? view.container.getBoundingClientRect() : null
      const bbox = node.getBBox ? node.getBBox() : null
      const nodeTopGraph = nodeRect ? Math.round(nodeRect.top - containerRect.top) : position.y
      const layoutCenterGraphY = nodeTopGraph + Math.round((bbox?.height || nodeRect?.height || height) / 2)
      const modelHeight = height
      const domHeight = Math.round(nodeRect?.height || 0)
      const bboxHeight = Math.round(bbox?.height || 0)
      const expectedRowYsGraph = rows.map((_, i) => (bbox?.y || position.y) + contentStart + i * rowHeight + Math.floor(rowHeight / 2))
      const groupsConf = node.getProp ? (node.getProp('ports/groups') || {}) : {}
      const outLayoutName = groupsConf?.out?.portLayout?.name || groupsConf?.out?.portLayout || '(未知)'
      console.log('\n🧭 高度/基准与布局信息:')
      console.log(`   - modelHeight=${modelHeight} domHeight=${domHeight} bboxHeight=${bboxHeight} 使用布局中心Y=${layoutCenterGraphY}`)
      console.log(`   - 端口组布局: out.portLayout=${String(outLayoutName)}`)
      console.log('   - 期望行Y(画布):', expectedRowYsGraph)
      const outPortComputed = outPorts.map(p => {
        const a = p?.args || {}
        const hasRow = typeof a.rowIndex === 'number'
        const yRel = hasRow
          ? (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + a.rowIndex * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2) + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0))
          : (typeof a.y === 'number'
            ? Number(a.y)
            : ((layoutCenterGraphY - nodeTopGraph) + (a.dy ?? 0)))
        return { id: p.id, dy: a.dy ?? 0, yGraph: nodeTopGraph + yRel }
      })
      console.log('   - 端口dy与最终Y(布局):', outPortComputed)
      const sortedY = outPortComputed.map(o => o.yGraph).slice().sort((a,b)=>a-b)
      const steps = sortedY.map((y, i) => i>0 ? y - sortedY[i-1] : null).filter(v => v != null)
      const rowSteps = expectedRowYsGraph.map((y, i) => i>0 ? y - expectedRowYsGraph[i-1] : null).filter(v => v != null)
      console.log('   - 端口Y步进(布局):', steps)
      console.log('   - 行中心Y步进(期望):', rowSteps)
      console.log('\n🔎 端口-内容行对齐检测:')
      console.log('   - 期望行Y(画布):', rows.map((_, i) => nodeTopGraph + contentStart + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust))
      if (!outPorts.length) {
        console.log('   - 未发现输出端口')
      } else {
        outPorts.forEach(p => {
          const a = p?.args || {}
          const hasRow = typeof a.rowIndex === 'number'
          const yRel = hasRow
            ? (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING + a.rowIndex * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2) + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0))
            : (typeof a.y === 'number'
              ? Number(a.y)
              : ((layoutCenterGraphY - nodeTopGraph) + (a.dy ?? 0)))
          const yGraph = (bbox?.y || nodeTopGraph) + yRel
          const absY = yGraph
          const absX = position.x + width
          const clientOut = graph?.graphToClientPoint ? graph.graphToClientPoint({ x: absX, y: absY }) : { x: absX, y: absY }
          let targetIdx = -1
          const match = /^out-(\d+)$/.exec(p.id)
          if (match) {
            targetIdx = Number(match[1])
          } else if (isSplit) {
            let minDelta = Infinity
            rowYs.forEach((ry, idx) => {
              const expectedGraphY = nodeTopGraph + ry
              const d = Math.abs(expectedGraphY - yGraph)
              if (d < minDelta) { minDelta = d; targetIdx = idx }
            })
          } else {
            targetIdx = 0
          }
          const expectedGraphY = nodeTopGraph + (rowYs[targetIdx] ?? contentCenter)
          const delta = Math.abs(yGraph - expectedGraphY)
          const msg = `   - port=${p.id} group=${p.group} 最终Y(G)=${yGraph} 绝对坐标=(${absX}, ${absY}) 屏幕坐标=(${clientOut.x}, ${clientOut.y}) 期望行索引=${targetIdx} 行Y(G)=${expectedGraphY} 差值=${delta}`
          if (delta > 0) {
            console.warn(msg)
          } else {
            console.log(msg)
          }
        })
      }
    } catch (alignErr) {
      console.warn('   - 端口对齐检测异常:', alignErr)
    }
    
    // 尺寸计算过程
    console.log('\n📐 尺寸计算过程:')
    console.log(`   - 基础高度 = header(${headerHeight}) + padding(${contentPadding}) + 内容(${rows.length}×${rowHeight}) + 12`)
    console.log(`   - 计算高度 = ${headerHeight} + ${contentPadding} + ${rows.length}×${rowHeight} + 12 = ${headerHeight + contentPadding + rows.length * rowHeight + 12}`)
    console.log(`   - 最终高度 = max(MIN_HEIGHT(${NODE_DIMENSIONS.MIN_HEIGHT}), 计算高度) = ${height}`)
    
    // 样式常量汇总
    console.log('\n🎨 样式常量汇总:')
    console.log(`   - 节点宽度: ${NODE_DIMENSIONS.WIDTH}`)
    console.log(`   - 头部高度: ${NODE_DIMENSIONS.HEADER_HEIGHT}`)
    console.log(`   - 行高: ${NODE_DIMENSIONS.ROW_HEIGHT}`)
    console.log(`   - 内容内边距: ${NODE_DIMENSIONS.CONTENT_PADDING}`)
    console.log(`   - 菜单点Y位置: ${POSITIONS.MENU_DOT_Y}`)
    console.log(`   - 标题X位置: ${POSITIONS.TITLE_X}`)
    console.log(`   - 标题Y位置: ${POSITIONS.TITLE_Y}`)
    console.log(`   - 内容字体大小: ${TYPOGRAPHY.CONTENT_FONT_SIZE}px`)
    console.log(`   - 标题字体大小: ${TYPOGRAPHY.TITLE_FONT_SIZE}px`)
    console.log(`   - 图标字体大小: ${TYPOGRAPHY.ICON_FONT_SIZE}px`)
    
    console.log('\n✅ [Horizontal] 节点调试信息输出完成！')
    console.log('==========================================')
    
  } catch (e) {
    console.error('❌ [Horizontal] debugCurrentNode 异常:', e)
    console.error('异常堆栈:', e.stack)
  }
  
  // 确保关闭菜单
  nodeActionsMenu.value.visible = false
  console.log('🔄 [Horizontal] 已关闭节点操作菜单')
}
 
function onCanvasDragOver(e) {
  e.preventDefault()
}

function onCanvasDrop(e) {
  e.preventDefault()
  try {
    const local = graph?.pageToLocal ? graph.pageToLocal(e.pageX, e.pageY) : { x: e.offsetX, y: e.offsetY }
    const x = local.x
    const y = local.y
    const nodeType = e.dataTransfer.getData('nodeType')
    if (!nodeType) return
    const label = getNodeLabel(nodeType) || nodeType
    const fourOutTypes = ['crowd-split', 'event-split', 'ab-test']
    const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
    const newNodeId = `${nodeType}-${Date.now()}`
    graph.addNode(createVueShapeNode({
      id: newNodeId,
      x,
      y,
      label,
      outCount,
      data: { type: nodeType, nodeType: nodeType, isConfigured: false }
    }))
  } catch (e) {
    console.warn('[Horizontal] 拖放创建节点失败:', e)
  }
}

// 缩放比例显示
// 由 useCanvasState 提供 scaleDisplayText

// 工具栏功能方法
const handleZoomIn = () => {
  if (!graph) return
  const currentZoom = graph.zoom()
  const next = Math.min(3, currentZoom + 0.1)
  if (typeof graph.zoomTo === 'function') graph.zoomTo(next)
  else graph.zoom(next)
  useCanvasState().updateScaleDisplay(scaleDisplayText, graph.zoom?.() || next)
  console.log('[Toolbar] 放大画布，当前缩放:', graph.zoom?.())
  setTimeout(() => { try { minimap?.updateGraph?.() } catch {} }, 50)
}

const handleZoomOut = () => {
  if (!graph) return
  const currentZoom = graph.zoom()
  const next = Math.max(0.1, currentZoom - 0.1)
  if (typeof graph.zoomTo === 'function') graph.zoomTo(next)
  else graph.zoom(next)
  useCanvasState().updateScaleDisplay(scaleDisplayText, graph.zoom?.() || next)
  console.log('[Toolbar] 缩小画布，当前缩放:', graph.zoom?.())
  setTimeout(() => { try { minimap?.updateGraph?.() } catch {} }, 50)
}

const handleResetZoom = () => {
  if (!graph) return
  if (typeof graph.zoomTo === 'function') graph.zoomTo(1)
  else graph.zoom(1)
  if (typeof graph.centerContent === 'function') graph.centerContent()
  else graph.center?.()
  useCanvasState().updateScaleDisplay(scaleDisplayText, 1)
  console.log('[Toolbar] 重置缩放并居中')
  setTimeout(() => { try { minimap?.updateGraph?.() } catch {} }, 50)
}

const handleSetZoom = (scale) => {
  if (!graph) return
  const clamped = Math.max(0.1, Math.min(3, Number(scale) || 1))
  if (typeof graph.zoomTo === 'function') graph.zoomTo(clamped)
  else graph.zoom(clamped)
  useCanvasState().updateScaleDisplay(scaleDisplayText, graph.zoom?.() || clamped)
  console.log(`[Toolbar] 设置缩放比例: ${clamped} -> ${newZoom}%`)
  setTimeout(() => { try { minimap?.updateGraph?.() } catch {} }, 50)
}

const handleUndo = () => {
  if (!graph) return
  try {
    if (graph.canUndo?.()) graph.undo()
  } catch {}
}

const handleRedo = () => {
  if (!graph) return
  try {
    if (graph.canRedo?.()) graph.redo()
  } catch {}
}

const handleJumpToHistoryState = (index) => {
  try {
    if (typeof jumpToHistoryState === 'function') {
      jumpToHistoryState(index)
    }
  } catch {}
}

  const handleFitContent = () => {
    if (!graph) return
    // 优化适配：保留当前缩放，仅居中内容，避免画布缩小
    const currentZoom = graph.zoom()
    if (typeof graph.centerContent === 'function') {
      graph.centerContent()
    } else {
      graph.center?.()
    }
    if (typeof graph.zoomTo === 'function') graph.zoomTo(currentZoom)
    else graph.zoom(currentZoom)
    console.log('[Toolbar] 仅居中内容，保持缩放不变')
    
    // 显示友好的提示
    Message.success('画布已居中显示')
    
    // 同步更新预览图
    setTimeout(() => {
      try { if (!minimapPaused && minimap && minimap.updateGraph) minimap.updateGraph() } catch {}
    }, 100)
  }
  const onToggleStatisticsPanel = (payload) => {
    showStatisticsPanel.value = !showStatisticsPanel.value
    try {
      const canvasRect = canvasContainerRef.value?.getBoundingClientRect?.()
      const toolbarRect = toolbarWrapperRef.value?.getBoundingClientRect?.()
      const anchor = payload?.anchorRect || toolbarRect
      if (anchor && canvasRect) {
        const offsetY = 8
        const left = Math.max(16, anchor.left - canvasRect.left)
        const top = Math.max(16, anchor.bottom - canvasRect.top + offsetY)
        statsPanelPosition.value = { left, top }
      } else {
        statsPanelPosition.value = { left: 16, top: 64 }
      }
    } catch { statsPanelPosition.value = { left: 16, top: 64 } }

    nextTick(() => {
      try {
        const panel = statisticsPanelRef.value?.getBoundingClientRect?.()
        const canvasRect = canvasContainerRef.value?.getBoundingClientRect?.()
        if (panel && canvasRect) {
          const pad = 16
          const maxLeft = Math.max(pad, canvasRect.width - panel.width - pad)
          const maxTop = Math.max(pad, canvasRect.height - panel.height - pad)
          statsPanelPosition.value = {
            left: Math.min(statsPanelPosition.value.left, maxLeft),
            top: Math.min(statsPanelPosition.value.top, maxTop)
          }
          console.log('[Stats] panel-position:', statsPanelPosition.value)
          // 默认聚焦开始节点
          if (!statsFocusNodeId.value && graph) {
            const nodes = graph.getNodes?.() || []
            const start = nodes.find(n => {
              try { const d = n.getData?.() || {}; return d.type === 'start' || d.nodeType === 'start' } catch { return false }
            })
            statsFocusNodeId.value = String((start && start.id) || (nodes[0]?.id) || '')
            console.log('[Stats] default focusNodeId set:', statsFocusNodeId.value)
          }
        }
      } catch {}
    })
  }

const handleToggleMinimap = (payload) => {
  console.log('[Toolbar] 切换预览图')
  showMinimap.value = !showMinimap.value

  if (showMinimap.value && graph) {
    // 计算悬浮位置：预览图按钮下方
    try {
      const anchor = payload?.anchorRect || null
      const canvasRect = canvasContainerRef.value?.getBoundingClientRect?.() || null
      minimapPosition.value = useCanvasState().computeMinimapPosition(anchor, canvasRect)
    } catch { minimapPosition.value = { left: 16, top: 64 } }

    nextTick(() => {
      if (!minimapContainer.value) return
      try {
        minimap = toggleMinimap ? toggleMinimap(graph, minimapContainer.value, true, { width: 220, height: 160, padding: 10, scalable: true, graphOptions: { async: true, createCellView(cell) { if (cell.isEdge()) return null } } }) : new MiniMap({ container: minimapContainer.value })
        if (!toggleMinimap) graph.use(minimap)
      } catch {}
      setTimeout(() => {
        try {
          if (minimap && minimap.updateGraph) minimap.updateGraph()
          if (minimap && minimap.centerContent) minimap.centerContent()
        } catch {}
      }, 30)
    })
  } else if (!showMinimap.value && graph) {
    try { minimap = toggleMinimap ? toggleMinimap(graph, minimapContainer.value, false) : null } catch { minimap = null }
    console.log('[Toolbar] 预览图已移除')
  }
}

// 切换辅助线显示/隐藏
const toggleSnapline = () => {
  console.log('[Toolbar] 切换辅助线')
  showSnapline.value = !showSnapline.value
  
  if (graph) {
    // 更新辅助线配置
    graph.setSnaplineEnabled(showSnapline.value)
    console.log(`[Snapline] 辅助线已${showSnapline.value ? '开启' : '关闭'}`)
  }
}

const handleApplyLayout = () => {
  console.log('[Toolbar] 应用布局优化')
  applyStructuredLayout()
}

/**
 * 横版专用快速布局
 * 特点：仅重新排列节点位置，不改变端口和连线绑定
 */
const handleQuickLayout = async () => {
  console.log('[Toolbar] 应用横版快速布局')
  
  if (!graph) {
    console.warn('[Toolbar] 图实例未初始化')
    Message.warning('画布未初始化，请稍后再试')
    return
  }
  
  if (!quickLayout.value) {
    console.warn('[Toolbar] 快速布局实例未初始化')
    Message.warning('布局功能未准备好，请稍后再试')
    return
  }
  
  try {
    // 显示加载状态
    const loadingMessage = Message.loading('正在应用智能布局...')

    // 布局前暂时关闭辅助线，避免大量重绘引起闪屏
    try { graph.setSnaplineEnabled(false) } catch {}

    const result = await quickLayout.value.executeHierarchyTreeLayout(graph, { 
      startX: 200, // 增加左侧偏移，确保开始节点有足够空间
      startY: 0,   // 让算法自动计算垂直居中位置
      colSpacing: 250, // 增加列间距，避免节点重叠
      laneGapY: 200,   // 减少行间距，使布局更紧凑
      colScale: 1,     // 使用标准间距
      laneScale: 1,    // 使用标准行距
      spreadX: 1.5, 
      spreadY: 1.5, 
      expandX: 0       // 不使用额外扩展
    })
    
    // 布局后清理所有边的手动控制点，避免残留影响展示
    cleanupEdgeVertices(graph)
    
    // 恢复辅助线显示
    try { graph.setSnaplineEnabled(true) } catch {}

    // 关闭加载提示，显示成功消息
    loadingMessage.close()
    Message.success('智能布局应用成功！')
    
    // 布局完成后，调整画布视图以确保所有节点都在可视区域内
  setTimeout(() => {
    try {
      const containerRect = canvasContainerRef.value?.getBoundingClientRect?.()
      const layoutWidth = result?.bounds ? (result.bounds.maxX - result.bounds.minX) : undefined
      const containerWidth = containerRect?.width || 0
      // 当布局宽度未溢出容器时才居中，避免视图频繁跳变造成闪屏
      if (graph && containerWidth && layoutWidth && layoutWidth <= containerWidth) {
        const currentZoom = graph.zoom()
        if (typeof graph.centerContent === 'function') {
          graph.centerContent()
        } else if (typeof graph.center === 'function') {
          graph.center()
        }
        graph.zoom(currentZoom)
        console.log('[Toolbar] 画布居中（布局未溢出容器）')
      } else {
        console.log('[Toolbar] 跳过居中（布局宽度溢出容器，避免闪屏）')
      }
      // 拖拽恢复后更新最小地图
      try { if (!minimapPaused && minimap && minimap.updateGraph) minimap.updateGraph() } catch {}
    } catch {}
  }, 80)
    
    console.log('[Toolbar] 横版快速布局完成')
  } catch (error) {
    console.error('[Toolbar] 快速布局失败:', error)
    Message.error(`布局失败: ${error.message}`)
  }
}


const handleAddNode = (payload) => {
  console.log('[Toolbar] 点击添加节点按钮', payload)
  const anchorRect = payload?.anchorRect
  const contentRect = contentRef.value?.getBoundingClientRect()
  if (anchorRect && contentRect) {
    const x = anchorRect.left - contentRect.left + anchorRect.width / 2
    const y = anchorRect.bottom - contentRect.top + 8
    nodeSelectorPosition.value = { x, y }
    // 记录预创建坐标（转换为画布本地坐标）
    if (graph) {
      const pageX = anchorRect.left + anchorRect.width / 2
      const pageY = anchorRect.bottom + 8
      const local = graph.pageToLocal(pageX, pageY)
      pendingCreatePoint = { x: local.x, y: local.y }
    }
  } else {
    const containerRect = canvasContainerRef.value?.getBoundingClientRect()
    if (containerRect) {
      nodeSelectorPosition.value = {
        x: containerRect.width / 2,
        y: containerRect.height / 2
      }
      if (graph) {
        const pageX = containerRect.left + containerRect.width / 2
        const pageY = containerRect.top + containerRect.height / 2
        const local = graph.pageToLocal(pageX, pageY)
        pendingCreatePoint = { x: local.x, y: local.y }
      }
    }
  }
  showNodeSelector.value = true
  nodeSelectorSourceNode.value = null
}
// ===== 关键函数定义 - 确保模板可以访问 =====
// 这些函数必须在graph变量定义之后定义

// 返回函数
const goBack = () => {
  console.log('[goBack] 返回按钮被点击')
  router.push('/marketing/tasks')
}

// 获取画布数据函数
const getCanvasData = () => {
  console.log('[getCanvasData] 开始获取画布数据...')
  if (!graph) {
    console.warn('[getCanvasData] graph实例未初始化')
    return { nodes: [], connections: [] }
  }
  
  try { return collectCanvasData(graph) } catch (error) { return { nodes: [], connections: [] } }
}

// 加载任务数据 - 参考原版画布实现
const loadTaskData = async () => {
  try {
    const taskId = route.query.id
    const taskVersionParam = route.query.version || 1
    
    console.log('🔄 [Horizontal] 开始加载任务数据:', { taskId, version: taskVersion })
    
    // 参数验证
    if (!taskId) {
      throw new Error('任务ID不能为空')
    }
    
    // 首先尝试从本地存储加载
    const numericTaskId = parseInt(taskId)
    console.log('🔍 [Horizontal] 尝试加载任务ID:', numericTaskId)
    
    const storedTask = TaskStorage.getTaskById(numericTaskId)
    console.log('📦 [Horizontal] 本地存储返回的任务数据:', storedTask)
    
  if (storedTask) {
      // 使用本地存储的数据
      console.log('✅ [Horizontal] 从本地存储加载任务数据:', storedTask)
      
      // 设置编辑模式
      isEditMode.value = true
      editingTaskId.value = numericTaskId
      editingTaskVersion.value = parseInt(taskVersionParam)
      
      // 填充任务基础信息 - 增强错误处理
      try {
        taskName.value = storedTask.name || storedTask.taskName || ''
        taskDescription.value = storedTask.description || storedTask.taskDescription || ''
        // 已发布版本进入编辑时，预览下一个版本号
        const baseVersion = storedTask.version || storedTask.taskVersion || 1
        const isPublished = (storedTask.status || '') === 'published'
        taskVersion.value = isPublished ? (parseInt(baseVersion) + 1) : baseVersion
        taskStatus.value = storedTask.status || 'draft'
        createdTime.value = storedTask.createTime || storedTask.createdAt || new Date().toLocaleString('zh-CN')
        
        console.log('📝 [Horizontal] 任务基础信息设置完成:', {
          name: taskName.value,
          description: taskDescription.value,
          version: taskVersion.value,
          status: taskStatus.value,
          createTime: createdTime.value
        })
      } catch (infoError) {
        console.error('❌ [Horizontal] 设置任务基础信息失败:', infoError)
      }
      
      // 如果有画布数据，稍后加载到画布中
      if (storedTask.canvasData && storedTask.canvasData.nodes && storedTask.canvasData.nodes.length > 0) {
        console.log('[Horizontal] 开始加载画布数据，节点数量:', storedTask.canvasData.nodes.length)
        
        // 延迟加载画布数据，确保画布完全初始化
        setTimeout(() => {
          if (graph) {
            console.log('🎨 [Horizontal] 图形实例已准备好，开始加载画布数据')
            loadCanvasData(storedTask.canvasData)
          } else {
            console.warn('[Horizontal] 图形实例未准备好，延迟加载画布数据')
            // 如果graph还未初始化，再次延迟尝试
            setTimeout(() => {
              if (graph) {
                console.log('🎨 [Horizontal] 延迟后图形实例已准备好，开始加载画布数据')
                loadCanvasData(storedTask.canvasData)
              } else {
                console.error('❌ [Horizontal] 图形实例始终未准备好，无法加载画布数据')
              }
            }, 1000)
          }
        }, 500)
      } else {
        console.log('[Horizontal] 任务没有画布数据或数据格式不正确:', {
          hasCanvasData: !!storedTask.canvasData,
          hasNodes: !!storedTask.canvasData?.nodes,
          nodeCount: storedTask.canvasData?.nodes?.length
        })
      }
    } else {
      console.warn('[Horizontal] 未找到指定的任务数据，ID:', numericTaskId)
      
      // 显示所有可用任务ID供调试
      const allTasks = TaskStorage.getAllTasks()
      console.log('📋 [Horizontal] 当前存储中的所有任务ID:', allTasks.map(t => ({ 
        id: t.id, 
        name: t.name || t.taskName,
        status: t.status 
      })))
      
      Message.warning('未找到指定的任务数据，将创建新任务')
    }
  } catch (error) {
    console.error('❌ [Horizontal] 加载任务数据失败:', error)
    Message.error('加载任务数据失败: ' + error.message)
  }
}

// 加载画布数据函数 - 参考原版画布实现
const loadCanvasData = (canvasData) => {
  if (!graph) return false
  return loadCanvasDataSvc(graph, canvasData)
}

// 保存任务函数 - 参考原版画布实现
const saveTask = async () => {
  if (!taskName.value) { Message.error('请输入任务名称'); return }
  try {
    const canvasData = getCanvasData()
    let versionToUse = taskVersion.value || 1
    if (isEditMode.value && editingTaskId.value) { const existing = TaskStorage.getTaskById(parseInt(editingTaskId.value)); if (existing && existing.status === 'published') { versionToUse = (existing.version || 1) + 1; taskVersion.value = versionToUse } }
    const name = taskName.value || '未命名任务'
    const saveMeta = { name, description: taskDescription.value || '', version: versionToUse, type: 'marketing', status: 'draft', updateTime: new Date().toLocaleString('zh-CN'), creator: '当前用户' }
    let saved
    if (isEditMode.value && editingTaskId.value) { saved = TaskStorage.updateTask(editingTaskId.value, { ...saveMeta, canvasData }); Message.success('更新成功') }
    else { saved = saveTaskSvc(saveMeta, canvasData); Message.success('保存成功'); if (saved && saved.id) { isEditMode.value = true; editingTaskId.value = saved.id; router.replace({ path: '/marketing/tasks/horizontal', query: { mode: 'edit', id: saved.id, version: saved.version } }) } }
    taskStatus.value = 'draft'
    setTimeout(() => { router.push('/marketing/tasks') }, 1000)
    return saved
  } catch (e) { Message.error(`保存失败: ${e.message || '未知错误'}`) }
}

// 发布任务函数 - 参考原版画布实现
const publishTask = async () => {
  if (!taskName.value) { Message.error('请输入任务名称'); return }
  try {
    const canvasData = getCanvasData()
    const validation = validateForPublish(graph, canvasData)
    if (!validation.pass) { const detail = validation.messages.join('\n'); Modal.warning({ title: '发布校验未通过', content: `请修复以下问题:\n${detail}` }); return }
    const name = taskName.value || '未命名任务'
    let versionToUse = taskVersion.value || 1
    if (isEditMode.value && editingTaskId.value) { const existing = TaskStorage.getTaskById(parseInt(editingTaskId.value)); if (existing && existing.status === 'published') { versionToUse = (existing.version || 1) + 1; taskVersion.value = versionToUse } }
    const publishMeta = { name, description: taskDescription.value || '', version: versionToUse, type: 'marketing', status: 'published', publishTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN'), creator: '当前用户' }
    let saved
    if (isEditMode.value && editingTaskId.value) { saved = TaskStorage.updateTask(editingTaskId.value, { ...publishMeta, canvasData }); Message.success('发布成功') }
    else { saved = publishTaskSvc(publishMeta, canvasData); Message.success('发布成功'); if (saved && saved.id) { isEditMode.value = true; editingTaskId.value = saved.id; router.replace({ path: '/marketing/tasks/horizontal', query: { mode: 'edit', id: saved.id, version: saved.version } }) } }
    taskStatus.value = 'published'
    setTimeout(() => { router.push('/marketing/tasks') }, 1000)
    return saved
  } catch (e) { Message.error(`发布失败: ${e.message || '未知错误'}`) }
}

// 画布发布前校验
const validateCanvasForPublish = (canvasData) => validateForPublish(graph, canvasData)

// 测试函数
const testClick = () => {
  console.log('=== 测试按钮被点击了！ ===')
  console.log('函数状态:', {
    saveTask: typeof saveTask,
    publishTask: typeof publishTask,
    testClick: typeof testClick,
    goBack: typeof goBack,
    getCanvasData: typeof getCanvasData
  })
  
  try {
    saveTask()
  } catch (error) {
    console.error('测试调用saveTask失败:', error)
  }
}

</script>

<style scoped>
.horizontal-task-flow-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 20px 24px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-header .title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header .actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* 工具栏包装器 - 确保工具栏在画布上方显示 */
.canvas-toolbar-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1300;
  pointer-events: none; /* 确保不阻止画布交互 */
  /* 调试样式 - 如果工具栏仍不可见，可以临时启用 */
  /* border: 2px solid red; */
  /* background: rgba(255, 0, 0, 0.1); */
}

.canvas-toolbar-wrapper > * {
  pointer-events: auto; /* 恢复工具栏的交互能力 */
}

.content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.basic-info-card {
  margin: 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.basic-info-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.basic-info-card :deep(.arco-card-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
}

.basic-info-card :deep(.arco-card-body) {
  padding: 20px;
}

.basic-info-card :deep(.arco-form-item) {
  margin-bottom: 16px;
}

.basic-info-card :deep(.arco-input-wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.basic-info-card :deep(.arco-input-wrapper:hover) {
  border-color: #94a3b8;
}

.basic-info-card :deep(.arco-input-wrapper:focus-within) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.basic-info-card :deep(.arco-btn) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.canvas-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  border-radius: 0 0 12px 12px;
}

.canvas-container :deep(.x6-graph) {
  will-change: transform;
  transform: translateZ(0);
}

.canvas-container.is-panning :deep(.x6-node),
.canvas-container.is-panning :deep(.x6-edge) {
  transition: none !important;
  animation: none !important;
}

.canvas-container.is-panning :deep(.x6-edge-label) {
  display: none !important;
}

.canvas-container.is-panning :deep(.hover),
.canvas-container.is-panning :deep(.node-hover),
.canvas-container.is-panning :deep(.node-selected) {
  filter: none !important;
  box-shadow: none !important;
}

.minimap-container {
  position: absolute;
  width: 220px;
  height: 160px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.selector-backdrop {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 999;
}

.node-actions-menu {
  position: absolute;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 1000;
  min-width: 120px;
}

.edge-actions-menu {
  position: absolute;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 1000;
  min-width: 120px;
}

/* 测试按钮样式 */
.btn {
  padding: 8px 16px;
  margin: 0 4px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn:active {
  background: #e5e7eb;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #374151;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
}

/* 辅助线开关按钮样式 */
.btn.active {
  background: #4C78FF;
  color: white;
  border-color: #4C78FF;
}

.btn.active:hover {
  background: #3A67E8;
  border-color: #3A67E8;
}

/* 🎨 参考图片风格 - 紫色辅助线系统 */
:deep(.x6-snapline) {
  stroke: #a855f7;  /* 统一紫色辅助线 */
  stroke-width: 1;
  stroke-dasharray: 5,5;
  opacity: 0.7;
}

:deep(.x6-snapline-horizontal) {
  stroke: #a855f7;  /* 统一紫色 */
}

:deep(.x6-snapline-vertical) {
  stroke: #a855f7;  /* 统一紫色 */
}

/* 节点交互状态样式 */
:deep(.x6-node:hover) {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

:deep(.x6-node.x6-node-selected) {
  filter: drop-shadow(0 4px 12px rgba(76, 120, 255, 0.15));
}

:deep(.x6-node.x6-node-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.x6-node.x6-node-dragging) {
  opacity: 0.8;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}
 
/* 端口交互状态 */
:deep(.x6-port-body:hover) {
  stroke-width: 2.5;
  filter: brightness(1.1);
}
 
:deep(.x6-port-body[data-connected="true"]) {
  opacity: 0.8;
}
 
:deep(.x6-port-body[data-connecting="true"]) {
  stroke: #2563EB;
  stroke-width: 2;
}

:deep(.x6-port.x6-port-active .x6-port-body),
:deep(.x6-port-highlight .x6-port-body) {
  stroke: #ff0000 !important;
  fill: #ffe5e5 !important;
  stroke-width: 2.5 !important;
}
 .basic-info-card {
  margin: 12px 16px;
 }
 .basic-info-card :deep(.arco-card-body) {
  padding-top: 8px;
 }
 .basic-info-card :deep(.arco-form-item) {
  margin-bottom: 12px;
 }

/* 统计面板容器样式 */
.statistics-panel-container {
  position: fixed;
  left: 0;
  right: auto;
  top: auto;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.statistics-panel-resize-handle--top {
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  height: 8px;
  cursor: ns-resize;
  background: transparent;
  z-index: 1;
}
.statistics-panel-resize-handle--top:hover {
  background: rgba(59, 130, 246, 0.15);
}

/* 响应式布局调整 */
.horizontal-task-flow-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.horizontal-task-flow-page:has(.statistics-panel-container) .content {
  margin-right: 0;
}
</style>
