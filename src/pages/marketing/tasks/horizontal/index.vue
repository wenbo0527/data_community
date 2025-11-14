<template>
  <div class="horizontal-task-flow-page">
    <div class="page-header">
      <div class="title">横版任务流原型</div>
      <div class="actions">
        <button class="btn" @click="resetCanvas">重置画布</button>
        <button class="btn" @click="toggleStartDrawer">打开开始节点抽屉</button>
        <button class="btn" @click="testDebugFunction">测试调试功能</button>
        <button class="btn" @click="validateLayoutCoordinates">验证布局坐标</button>
      </div>
    </div>

    <div class="content">
      <!-- 画布工具栏（补充调试入口） -->
      <CanvasToolbar
        :show-debug-panel="showDebugPanel"
        @toggle-debug-panel="toggleDebugPanel"
      />

      <div ref="canvasContainerRef" class="canvas-container"></div>
      <!-- 节点类型选择器（左上角固定显示） -->
      <NodeTypeSelector
        :visible="showNodeSelector"
        :position="nodeSelectorPosition"
        :source-node="nodeSelectorSourceNode"
        :dock="true"
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
    </div>

    <!-- 复用原版抽屉：保持类型和交互一致 -->
    <TaskFlowConfigDrawers
      v-if="configDrawers && configDrawers.drawerStates"
      :drawer-states="configDrawers.drawerStates"
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
      @close="closeDebugPanel"
      @update:position="onDebugPanelPositionUpdate"
    />
    
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Graph, Shape } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import TaskFlowConfigDrawers from '../components/TaskFlowConfigDrawers.vue'
import NodeTypeSelector from '../components/canvas/NodeTypeSelector.vue'
import CanvasToolbar from '../components/CanvasToolbar.vue'
import CanvasDebugPanel from '../components/CanvasDebugPanel.vue'
import { getNodeLabel } from '@/utils/nodeTypes.js'
// 水平连接校验：目标在源节点右侧
import { createHorizontalPortConfig } from './utils/portConfigFactoryHorizontal.js'
import { useConfigDrawers } from '../composables/canvas/useConfigDrawers.js'
import { CanvasController } from './services/CanvasController.js'
// 导入样式常量
import { 
  NODE_DIMENSIONS, 
  COLORS, 
  TYPOGRAPHY, 
  POSITIONS, 
  getNodeIconText,
  getBaseNodeStyles,
  INTERACTION_STATES
} from './styles/nodeStyles.js'

const canvasContainerRef = ref(null)
let graph = null

// 统一抽屉系统：使用已有 useConfigDrawers
// 传入横版节点操作，以确保配置确认后刷新内容与端口
const configDrawers = useConfigDrawers(() => graph, { updateNodeFromConfig })

// 节点选择器状态
const showNodeSelector = ref(true)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const nodeSelectorSourceNode = ref(null)
let pendingCreatePoint = { x: 0, y: 0 }
let pendingInsertionEdge = null
const nodeActionsMenu = ref({ visible: false, x: 0, y: 0, nodeId: null })
// 当前正在配置的抽屉与节点
const activeDrawerKey = ref(null)
const activeNodeId = ref(null)
// 调试面板状态
const showDebugPanel = ref(false)
const debugPanelPosition = ref({ x: 120, y: 100 })
 
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
  console.log('🔍 [Horizontal] 简化调试函数被调用，节点ID:', nodeId)
  
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
    
  } catch (error) {
    console.error('❌ [Horizontal] 简化调试函数异常:', error)
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
  graph = new Graph({
    container: canvasContainerRef.value,
    background: { color: '#F8F9FB' },
    grid: {
      size: 10,
      visible: true,
      type: 'dot',
      color: '#E5E7EB'
    },
    panning: true,
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta']
    },
    connecting: {
      allowBlank: false,
      snap: true,
      allowNode: false,
      allowLoop: false,
      router: { name: 'orth', args: { startDirections: ['right'], endDirections: ['left'], padding: 12 } },
      connector: { name: 'smooth' },
      connectionPoint: { name: 'boundary', args: { anchor: 'center' } },
      createEdge() {
        return new Shape.Edge({
          attrs: { line: { stroke: '#4C78FF', strokeWidth: 2 } }
        })
      },
      validateConnection({ sourceMagnet, targetMagnet, sourceView, targetView }) {
        // 仅允许 out -> in
        if (!sourceMagnet || !targetMagnet) return false
        const sg = sourceMagnet.getAttribute('port-group')
        const tg = targetMagnet.getAttribute('port-group')
        if (sg !== 'out' || tg !== 'in') return false

        // 水平连线校验：目标在右侧
        const srcCell = sourceView?.cell
        const tgtCell = targetView?.cell
        // 简单水平判断：目标节点的 x 必须大于源节点
        try {
          const sp = srcCell.getPosition()
          const tp = tgtCell.getPosition()
          if (!sp || !tp || tp.x <= sp.x) return false
        } catch (e) {
          return false
        }

        // 限制同一 out 端口仅一条连接
        const sourcePortId = sourceMagnet.getAttribute('port')
        const exists = (graph.getOutgoingEdges(srcCell) || []).some(e => e.getSourcePortId() === sourcePortId)
        if (exists) return false

        // 限制 target 的 in 端口仅一条连接
        const targetPortId = targetMagnet.getAttribute('port')
        const targetUsed = (graph.getIncomingEdges(tgtCell) || []).some(e => e.getTargetPortId() === targetPortId)
        if (targetUsed) return false

        return true
      }
    },
    selecting: {
      enabled: true,
      multiple: false,
      rubberband: false,
      showNodeSelectionBox: false,
      modifiers: 'shift',
      selectNodeOnClick: true
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
  
  // 使用Selection插件
  graph.use(new Selection({
    enabled: true,
    multiple: false,
    rubberband: false,
    showNodeSelectionBox: false,
    selectNodeOnClick: true
  }))
  
  const controller = new CanvasController({
    graph,
    openConfigDrawer: (type, node, data) => configDrawers.openConfigDrawer(type, node, data),
    setShowNodeSelector: v => { showNodeSelector.value = v },
    setNodeSelectorPosition: v => { nodeSelectorPosition.value = v },
    setNodeSelectorSourceNode: v => { nodeSelectorSourceNode.value = v },
    setPendingCreatePoint: p => { pendingCreatePoint = p },
    setPendingInsertionEdge: e => { pendingInsertionEdge = e },
    deleteNodeCascade: id => deleteNodeCascade(id),
    getContainerRect: () => canvasContainerRef.value.getBoundingClientRect(),
    setNodeActionsMenu: v => { nodeActionsMenu.value = v }
  })

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
            updateNodeFromConfig(n, nodeType, cfg)
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
      updateNodeFromConfig(node, nodeType, config)
    } catch (err) {}
  })
  
  // 添加节点交互事件监听
  graph.on('node:mouseenter', ({ node }) => {
    try {
      // 应用悬停状态样式
      const interactionStyles = node.getProp?.('interactionStyles') || {}
      const hoverStyles = interactionStyles.hover || {}
      if (node.setAttrs) {
        node.setAttrs(hoverStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:mouseenter 异常:', e)
    }
  })
  
  graph.on('node:mouseleave', ({ node }) => {
    try {
      // 恢复默认样式，但要考虑选中状态
      if (node.isSelected && node.isSelected()) {
        // 如果节点被选中，保持选中状态样式
        const interactionStyles = node.getProp?.('interactionStyles') || {}
        const selectedStyles = interactionStyles.selected || {}
        if (node.setAttrs) {
          node.setAttrs(selectedStyles)
        }
      } else {
        // 否则恢复默认样式
        const baseStyles = getBaseNodeStyles()
        if (node.setAttrs) {
          node.setAttrs(baseStyles)
        }
      }
    } catch (e) {
      console.warn('[Horizontal] node:mouseleave 异常:', e)
    }
  })
  
  graph.on('node:selected', ({ node }) => {
    try {
      // 应用选中状态样式
      const interactionStyles = node.getProp?.('interactionStyles') || {}
      const selectedStyles = interactionStyles.selected || {}
      if (node.setAttrs) {
        node.setAttrs(selectedStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:selected 异常:', e)
    }
  })
  
  graph.on('node:unselected', ({ node }) => {
    try {
      // 恢复默认样式
      const baseStyles = getBaseNodeStyles()
      if (node.setAttrs) {
        node.setAttrs(baseStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:unselected 异常:', e)
    }
  })
  
  // 添加节点选择支持
  graph.on('blank:click', () => {
    graph.cleanSelection()
  })
  
  // 添加拖拽状态处理
  graph.on('node:moved', ({ node }) => {
    try {
      // 拖拽时应用拖拽状态样式
      const interactionStyles = node.getProp?.('interactionStyles') || {}
      const draggingStyles = interactionStyles.dragging || {
        body: {
          opacity: INTERACTION_STATES.DRAGGING.OPACITY,
          filter: `drop-shadow(0 4px 8px ${INTERACTION_STATES.DRAGGING.SHADOW_COLOR})`
        }
      }
      if (node.setAttrs) {
        node.setAttrs(draggingStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:moved 异常:', e)
    }
  })
  
  graph.on('node:moving', ({ node }) => {
    try {
      // 拖拽过程中保持拖拽状态
      const draggingStyles = {
        body: {
          opacity: INTERACTION_STATES.DRAGGING.OPACITY
        }
      }
      if (node.setAttrs) {
        node.setAttrs(draggingStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:moving 异常:', e)
    }
  })
  
  graph.on('node:moved', ({ node }) => {
    try {
      // 拖拽结束后恢复默认样式
      const baseStyles = getBaseNodeStyles()
      if (node.setAttrs) {
        node.setAttrs(baseStyles)
      }
    } catch (e) {
      console.warn('[Horizontal] node:moved 恢复样式异常:', e)
    }
  })
  
  ensureStartNode()
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

function ensureStartNode() {
  const nodes = graph.getNodes()
  const hasStart = nodes.some(n => {
    const d = n.getData ? n.getData() : {}
    return d?.type === 'start' || d?.nodeType === 'start' || String(n.id).includes('start')
  })
  if (hasStart) return

  const startNodeId = 'start-node'
  graph.addNode(createRectNode({
    id: startNodeId,
    x: 80,
    y: 160,
    label: '开始',
    outCount: 1,
    data: { type: 'start', nodeType: 'start', isConfigured: true },
    portsOptions: { includeIn: false, outIds: ['out'] }
  }))
}

function createRectNode({ id, x, y, label, outCount = 1, data = {}, portsOptions = {} }) {
  const nodeType = data?.nodeType || data?.type
  const cfg = data?.config || {}
  const rows = buildDisplayLines(nodeType, cfg)
  const headerTitle = (cfg?.nodeName) || getNodeLabel(nodeType) || label || '节点'
  const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
  const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
  const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
  const width = NODE_DIMENSIONS.WIDTH
  const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)
  const isSplit = nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
  const contentHeight = Math.max(1, rows.length) * rowHeight
  const contentCenter = headerHeight + contentPadding + Math.floor(contentHeight / 2)
  const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST
  const verticalOffsets = isSplit
    ? rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
    : [contentCenter]
  const outIds = isSplit && rows.length > 0 ? rows.map((_, i) => `out-${i}`) : ['out']
  const ports = createHorizontalPortConfig(isSplit ? Math.max(1, rows.length) : 1, { includeIn: true, outIds, verticalOffsets, nodeHeight: height, inVerticalOffset: contentCenter })
  const markup = [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'rect', selector: 'header-icon' },
    { tagName: 'text', selector: 'header-icon-text' },
    { tagName: 'text', selector: 'header-title' },
    { tagName: 'rect', selector: 'menu-dot-0' },
    { tagName: 'rect', selector: 'menu-dot-1' },
    { tagName: 'rect', selector: 'menu-dot-2' },
    ...rows.map((_, i) => ({ tagName: 'text', selector: `row-${i}` }))
  ]
  const iconText = getNodeIconText(nodeType)
  const baseStyles = getBaseNodeStyles()
  const attrs = {
    ...baseStyles,
    'header-icon-text': { 
      text: iconText, 
      fill: COLORS.ICON_TEXT, 
      fontSize: TYPOGRAPHY.ICON_FONT_SIZE, 
      textAnchor: TYPOGRAPHY.ICON_TEXT_ANCHOR, 
      ref: 'header',
      x: 26, 
      y: 22 
    },
    'header-title': { 
      text: headerTitle, 
      fill: COLORS.TITLE_TEXT, 
      fontSize: TYPOGRAPHY.TITLE_FONT_SIZE, 
      fontWeight: TYPOGRAPHY.TITLE_FONT_WEIGHT, 
      textAnchor: TYPOGRAPHY.TITLE_TEXT_ANCHOR, 
      ref: 'header',
      x: POSITIONS.TITLE_X, 
      y: POSITIONS.TITLE_Y 
    },
    label: { text: '', style: { display: 'none' } },
    'menu-dot-0': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 24, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    'menu-dot-1': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 18, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    'menu-dot-2': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 12, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    ...Object.fromEntries(rows.map((text, i) => {
      const v = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + TYPOGRAPHY.CONTENT_BASELINE_ADJUST
      return [
        `row-${i}`,
        { 
          text, 
          fill: COLORS.CONTENT_TEXT, 
          fontSize: TYPOGRAPHY.CONTENT_FONT_SIZE, 
          textAnchor: TYPOGRAPHY.CONTENT_TEXT_ANCHOR, 
          ref: 'body',
          x: POSITIONS.CONTENT_START_X, 
          y: v 
        }
      ]
    }))
  }
  
  // 添加交互状态样式配置
  const interactionStyles = {
    // 悬停状态
    hover: {
      body: {
        stroke: INTERACTION_STATES.HOVER.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.HOVER.BODY_STROKE_WIDTH
      },
      header: {
        stroke: INTERACTION_STATES.HOVER.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.HOVER.BODY_STROKE_WIDTH
      }
    },
    // 选中状态
    selected: {
      body: {
        stroke: INTERACTION_STATES.SELECTED.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.SELECTED.BODY_STROKE_WIDTH
      },
      header: {
        stroke: INTERACTION_STATES.SELECTED.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.SELECTED.BODY_STROKE_WIDTH
      }
    },
    // 禁用状态
    disabled: {
      body: {
        fill: INTERACTION_STATES.DISABLED.BODY_FILL,
        stroke: INTERACTION_STATES.DISABLED.BODY_STROKE,
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      header: {
        fill: INTERACTION_STATES.DISABLED.HEADER_FILL,
        stroke: INTERACTION_STATES.DISABLED.BODY_STROKE
      },
      'header-icon': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      'header-icon-text': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      'header-title': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      }
    }
  }
  
  // 添加交互状态样式
  const node = {
    id, 
    x, 
    y, 
    width, 
    height, 
    shape: 'rect', 
    markup, 
    attrs, 
    data: { ...data }, 
    ports, 
    label: '',
    // 添加交互状态配置
    interactionStyles,
    zIndex: 1
  }
  
  // 添加事件监听以支持交互状态
  node.interactionStates = INTERACTION_STATES
  node.getInteractionStyles = function(state) {
    return INTERACTION_STATES[state] || {}
  }
  
  return node
}

// 节点禁用/启用功能
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
    
    // 应用禁用状态样式
    if (disabled) {
      const interactionStyles = node.getProp?.('interactionStyles') || {}
      const disabledStyles = interactionStyles.disabled || {}
      if (node.setAttrs) {
        node.setAttrs(disabledStyles)
      }
    } else {
      // 恢复默认样式
      const baseStyles = getBaseNodeStyles()
      if (node.setAttrs) {
        node.setAttrs(baseStyles)
      }
    }
  } catch (e) {
    console.warn('[Horizontal] setNodeDisabled 异常:', e)
  }
}
// 节点选择器：添加节点
function handleNodeTypeSelected(nodeType) {
  const label = getNodeLabel(nodeType) || nodeType
  // 简单规则：分流/AB 默认4个出口，其余1个
  const fourOutTypes = ['crowd-split', 'event-split', 'ab-test']
  const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
  const newNodeId = `${nodeType}-${Date.now()}`
  const node = graph.addNode(createRectNode({
    id: newNodeId,
    x: pendingCreatePoint.x,
    y: pendingCreatePoint.y,
    label,
    outCount,
    data: { type: nodeType, nodeType: nodeType, isConfigured: false }
  }))

  // 若来源于边插入，则拆分原边并重连
  if (pendingInsertionEdge) {
    try {
      const source = pendingInsertionEdge.getSource()
      const target = pendingInsertionEdge.getTarget()
      graph.removeEdge(pendingInsertionEdge.id)

      graph.addEdge({
        source: { cell: source.cell, port: source.port },
        target: { cell: newNodeId, port: 'in' },
        attrs: { line: { stroke: '#4C78FF', strokeWidth: 2 } }
      })
      graph.addEdge({
        source: { cell: newNodeId, port: 'out-0' },
        target: { cell: target.cell, port: target.port },
        attrs: { line: { stroke: '#4C78FF', strokeWidth: 2 } }
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
  showNodeSelector.value = true
}

// 处理抽屉事件：写回节点数据并标记已配置
function handleConfigConfirmProxy({ drawerType, config }) {
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

function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  if (nodeType === 'start') {
    if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
    if (Array.isArray(config?.targetAudience) && config.targetAudience.length) lines.push(`目标人群：${config.targetAudience.join('、')}`)
  } else if (nodeType === 'crowd-split') {
    const layers = Array.isArray(config?.crowdLayers) ? config.crowdLayers : []
    if (layers.length) {
      layers.forEach(l => {
        const name = l?.crowdName || l?.name || '分流'
        lines.push(`命中：${name}`)
      })
      const un = config?.unmatchBranch?.name || '未命中人群'
      lines.push(`否则：${un}`)
    } else if (typeof config?.splitCount === 'number' && config.splitCount > 0) {
      for (let i = 0; i < config.splitCount; i++) {
        lines.push(`命中：分流${i + 1}`)
      }
      lines.push('否则：未命中人群')
    } else if (Array.isArray(config?.branches) && config.branches.length) {
      config.branches.forEach((b, i) => {
        const name = b?.name || `分流${i + 1}`
        lines.push(`命中：${name}`)
      })
      lines.push('否则：未命中人群')
    }
  } else if (nodeType === 'event-split') {
    const yes = config?.yesLabel || '是'
    const timeout = config?.timeout != null ? String(config.timeout) : ''
    lines.push(`命中：${yes}`)
    if (timeout) lines.push(`等待 ${timeout} 分钟未命中`)
    else lines.push('未命中')
  } else if (nodeType === 'ab-test') {
    const branches = Array.isArray(config?.branches) ? config.branches : []
    const variants = Array.isArray(config?.variants) ? config.variants : []
    const versions = Array.isArray(config?.versions) ? config.versions : []
    const merged = branches.length ? branches : (variants.length ? variants : versions)
    merged.forEach((b, i) => {
      const name = b?.name || `变体${String.fromCharCode(65 + i)}`
      const pct = b?.percentage != null ? b.percentage : (b?.ratio != null ? b.ratio : '')
      lines.push(`${name}：${pct}%`)
    })
  } else if (nodeType === 'ai-call') {
    if (config?.taskId) lines.push(`触达任务ID：${config.taskId}`)
  } else if (nodeType === 'sms') {
    if (config?.smsTemplate) lines.push(`短信模板：${config.smsTemplate}`)
  } else if (nodeType === 'manual-call') {
    if (config?.configId) lines.push(`配置ID：${config.configId}`)
    if (config?.description) lines.push(config.description)
  } else if (nodeType === 'wait') {
    if (config?.value) lines.push(`等待：${config.value} ${config.unit || ''}`)
  } else if (nodeType === 'benefit') {
    if (config?.benefitName) lines.push(`权益包名称：${config.benefitName}`)
  }
  return lines.length ? lines : [getNodeLabel(nodeType) || '节点']
}

function getOutCountByType(nodeType, lines) {
  if (nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test') return Math.max(1, lines.length)
  return 1
}

function updateNodeFromConfig(node, nodeType, config) {
  const rows = buildDisplayLines(nodeType, config)
  const headerTitle = config?.nodeName || getNodeLabel(nodeType)
  const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
  const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
  const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
  const width = NODE_DIMENSIONS.WIDTH
  const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)
  const isSplit = nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
  const contentHeight = Math.max(1, rows.length) * rowHeight
  const contentCenter = headerHeight + contentPadding + Math.floor(contentHeight / 2)
  const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST
  const verticalOffsets = isSplit
    ? rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
    : [contentCenter]
  const outIds = isSplit && rows.length > 0 ? rows.map((_, i) => `out-${i}`) : ['out']
  const ports = createHorizontalPortConfig(isSplit ? Math.max(1, rows.length) : 1, { includeIn: true, outIds, verticalOffsets, nodeHeight: height, inVerticalOffset: contentCenter })
  const markup = [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'header' },
    { tagName: 'rect', selector: 'header-icon' },
    { tagName: 'text', selector: 'header-icon-text' },
    { tagName: 'text', selector: 'header-title' },
    { tagName: 'rect', selector: 'menu-dot-0' },
    { tagName: 'rect', selector: 'menu-dot-1' },
    { tagName: 'rect', selector: 'menu-dot-2' },
    ...rows.map((_, i) => ({ tagName: 'text', selector: `row-${i}` }))
  ]
  const iconText = getNodeIconText(nodeType)
  const baseStyles = getBaseNodeStyles()
  const attrs = {
    ...baseStyles,
    'header-icon-text': { 
      text: iconText, 
      fill: COLORS.ICON_TEXT, 
      fontSize: TYPOGRAPHY.ICON_FONT_SIZE, 
      textAnchor: TYPOGRAPHY.ICON_TEXT_ANCHOR, 
      x: 26, 
      y: 22 
    },
    'header-title': { 
      text: headerTitle, 
      fill: COLORS.TITLE_TEXT, 
      fontSize: TYPOGRAPHY.TITLE_FONT_SIZE, 
      fontWeight: TYPOGRAPHY.TITLE_FONT_WEIGHT, 
      textAnchor: TYPOGRAPHY.TITLE_TEXT_ANCHOR, 
      x: POSITIONS.TITLE_X, 
      y: POSITIONS.TITLE_Y 
    },
    label: { text: '', style: { display: 'none' } },
    'menu-dot-0': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 24, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    'menu-dot-1': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 18, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    'menu-dot-2': { 
      fill: COLORS.MENU_DOT, 
      stroke: COLORS.MENU_DOT, 
      rx: 1.5, 
      ry: 1.5, 
      ref: 'body', 
      x: width - 12, 
      y: POSITIONS.MENU_DOT_Y, 
      width: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      height: NODE_DIMENSIONS.MENU_DOT_SIZE, 
      style: { cursor: 'pointer', visibility: nodeType === 'start' || nodeType === 'end' ? 'hidden' : 'visible' } 
    },
    ...Object.fromEntries(rows.map((text, i) => {
      const v = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2)
      const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST
      return [
        `row-${i}`,
        { 
          text, 
          fill: COLORS.CONTENT_TEXT, 
          fontSize: TYPOGRAPHY.CONTENT_FONT_SIZE, 
          textAnchor: TYPOGRAPHY.CONTENT_TEXT_ANCHOR, 
          ref: 'body',
          x: POSITIONS.CONTENT_START_X, 
          y: v + baselineAdjust 
        }
      ]
    }))
  }
  
  // 添加交互状态样式配置
  const interactionStyles = {
    // 悬停状态
    hover: {
      body: {
        stroke: INTERACTION_STATES.HOVER.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.HOVER.BODY_STROKE_WIDTH
      },
      header: {
        stroke: INTERACTION_STATES.HOVER.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.HOVER.BODY_STROKE_WIDTH
      }
    },
    // 选中状态
    selected: {
      body: {
        stroke: INTERACTION_STATES.SELECTED.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.SELECTED.BODY_STROKE_WIDTH
      },
      header: {
        stroke: INTERACTION_STATES.SELECTED.BODY_STROKE,
        strokeWidth: INTERACTION_STATES.SELECTED.BODY_STROKE_WIDTH
      }
    },
    // 禁用状态
    disabled: {
      body: {
        fill: INTERACTION_STATES.DISABLED.BODY_FILL,
        stroke: INTERACTION_STATES.DISABLED.BODY_STROKE,
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      header: {
        fill: INTERACTION_STATES.DISABLED.HEADER_FILL,
        stroke: INTERACTION_STATES.DISABLED.BODY_STROKE
      },
      'header-icon': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      'header-icon-text': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      },
      'header-title': {
        opacity: INTERACTION_STATES.DISABLED.TEXT_OPACITY
      }
    }
  }
  
  node.resize(width, height)
  try {
    const existingPorts = node.getPorts ? node.getPorts() : []
    existingPorts.forEach(p => node.removePort && node.removePort(p.id))
    if (node.setProp) node.setProp('ports/groups', ports.groups)
    if (ports.items && ports.items.length) {
      ports.items.forEach(it => node.addPort && node.addPort(it))
    }
    if (node.setMarkup) node.setMarkup(markup)
    if (node.setAttrs) node.setAttrs(attrs)
    // 强制清空X6默认外部label，避免在节点下方重复显示
    if (node.setLabel) node.setLabel('')
    if (node.setProp) node.setProp('label', '')
    // 更新交互状态样式
    if (node.setProp) {
      node.setProp('interactionStyles', interactionStyles)
    }
  } catch (e) {
    console.warn('[Horizontal] updateNodeFromConfig 异常:', e)
  }
}

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
  graph.addNode(createRectNode({
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
    
    console.log(`📋 [Horizontal] 节点基本信息:`, {
      nodeId,
      nodeType,
      nodeName,
      configKeys: Object.keys(cfg),
      dataKeys: Object.keys(data)
    })
    
    // 获取设计规范中的标准文字内容
    const standardLabel = getNodeLabel(nodeType) || '未知节点类型'
    const standardIconText = getNodeIconText(nodeType)
    
    // 构建显示内容
    const rows = buildDisplayLines(nodeType, cfg)
    const position = node.getPosition?.() || { x: 0, y: 0 }
    const size = node.getSize?.() || { width: 0, height: 0 }
    
    console.log(`📝 [Horizontal] 文字内容分析:`, {
      standardLabel,
      standardIconText,
      configContent: cfg,
      displayRows: rows,
      rowCount: rows.length
    })
    
    // 节点基础尺寸
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const width = NODE_DIMENSIONS.WIDTH
    const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)
    const isSplit = nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
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
    console.log(`   - 菜单点0: 选择器 [selector="menu-dot-0"], 位置 (${width - 24}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 菜单点1: 选择器 [selector="menu-dot-1"], 位置 (${width - 18}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 菜单点2: 选择器 [selector="menu-dot-2"], 位置 (${width - 12}, ${POSITIONS.MENU_DOT_Y}) [相对节点], 尺寸 3×3`)
    console.log(`   - 颜色: ${COLORS.MENU_DOT}`)
    console.log(`   - 圆角: 1.5px`)
    console.log(`   - 可见性: ${nodeType === 'start' || nodeType === 'end' ? '隐藏' : '可见'}`)
    
    // 内容区域详细信息
    console.log('\n📋 内容区域:')
    console.log(`   - 内容起始Y坐标: ${headerHeight + contentPadding}`)
    console.log(`   - 内容高度: ${contentHeight}`)
    console.log(`   - 内容中心Y坐标: ${contentCenter}`)
    console.log(`   - 基线调整: ${baselineAdjust}`)
    console.log(`   - 第0行Y坐标验证: ${headerHeight} + ${contentPadding} + 0×${rowHeight} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust} = ${headerHeight + contentPadding + Math.floor(rowHeight / 2) + baselineAdjust}`)
    
    if (rows.length > 0) {
      console.log(`   - 行信息详情:`)
      rows.forEach((text, i) => {
        // 修正Y坐标计算：headerHeight + contentPadding + i * rowHeight + rowHeight/2 + baselineAdjust
        const v = headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust
        console.log(`     第${i + 1}行:`)
        console.log(`       - 选择器: [selector="row-${i}"]`)
        console.log(`       - Y坐标: ${v} [相对节点]`)
        console.log(`       - 计算过程: ${headerHeight} + ${contentPadding} + ${i}×${rowHeight} + ${Math.floor(rowHeight / 2)} + ${baselineAdjust} = ${v}`)
        console.log(`       - 文本内容: "${text}"`)
        console.log(`       - 字体大小: ${TYPOGRAPHY.CONTENT_FONT_SIZE}px`)
        console.log(`       - 颜色: ${COLORS.CONTENT_TEXT}`)
        console.log(`       - 文本锚点: ${TYPOGRAPHY.CONTENT_TEXT_ANCHOR}`)
      })
      
      if (isSplit) {
        const verticalOffsets = rows.map((_, i) => headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2) + baselineAdjust)
        console.log(`   - 分流节点垂直偏移: [${verticalOffsets.join(', ')}]`)
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
      console.log(`   - 输出端口Y坐标: [${verticalOffsets.join(', ')}] (相对节点)`)
    } else {
      console.log(`   - 输出端口Y坐标: ${contentCenter} (相对节点)`)
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
    const rect = canvasContainerRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nodeType = e.dataTransfer.getData('nodeType')
    if (!nodeType) return
    const label = getNodeLabel(nodeType) || nodeType
    const fourOutTypes = ['crowd-split', 'event-split', 'ab-test']
    const outCount = fourOutTypes.includes(nodeType) ? 4 : 1
    const newNodeId = `${nodeType}-${Date.now()}`
    graph.addNode(createRectNode({
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
</script>

<style scoped>
.horizontal-task-flow-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fb;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
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

.content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  background: #f8f9fb;
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
</style>
