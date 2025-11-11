<template>
  <div class="horizontal-task-flow-page">
    <div class="page-header">
      <div class="title">横版任务流原型</div>
      <div class="actions">
        <button class="btn" @click="resetCanvas">重置画布</button>
        <button class="btn" @click="toggleStartDrawer">打开开始节点抽屉</button>
      </div>
    </div>

    <div class="content">
      <div ref="canvasContainerRef" class="canvas-container"></div>
    </div>

    <!-- 复用原版抽屉：保持类型和交互一致 -->
    <TaskFlowConfigDrawers
      v-if="drawerStates"
      :drawer-states="drawerStates"
      @config-confirm="handleConfigConfirm"
      @config-cancel="handleConfigCancel"
      @visibility-change="handleDrawerVisibilityChange"
    />

    <!-- 节点类型选择器（空白处点击唤起） -->
    <NodeTypeSelector
      :visible="showNodeSelector"
      :position="nodeSelectorPosition"
      :source-node="nodeSelectorSourceNode"
      @select="handleNodeTypeSelected"
      @close="closeNodeSelector"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Graph, Shape } from '@antv/x6'
import TaskFlowConfigDrawers from '../components/TaskFlowConfigDrawers.vue'
import NodeTypeSelector from '../components/canvas/NodeTypeSelector.vue'
import { getNodeLabel } from '@/utils/nodeTypes.js'
// 水平连接校验：目标在源节点右侧
import { createHorizontalPortConfig } from './utils/portConfigFactoryHorizontal.js'

const canvasContainerRef = ref(null)
let graph = null

// 抽屉状态：与原版保持同类型结构
const drawerStates = ref({
  start: { visible: false, data: {} },
  'crowd-split': { visible: false, data: {} },
  'event-split': { visible: false, data: {} },
  'ab-test': { visible: false, data: {} },
  'ai-call': { visible: false, data: {} },
  sms: { visible: false, data: {} },
  'manual-call': { visible: false, data: {} },
  wait: { visible: false, data: {} },
  benefit: { visible: false, data: {} }
})

// 节点选择器状态
const showNodeSelector = ref(false)
const nodeSelectorPosition = ref({ x: 0, y: 0 })
const nodeSelectorSourceNode = ref(null)
let pendingCreatePoint = { x: 0, y: 0 }
let pendingInsertionEdge = null
// 当前正在配置的抽屉与节点
const activeDrawerKey = ref(null)
const activeNodeId = ref(null)

const toggleStartDrawer = () => {
  drawerStates.value.start.visible = !drawerStates.value.start.visible
}

const handleDrawerVisibilityChange = ({ drawerType, visible }) => {
  if (drawerStates.value[drawerType]) {
    drawerStates.value[drawerType].visible = visible
  }
}

const resetCanvas = () => {
  if (!graph) return
  graph.clearCells()
  ensureStartNode()
}

onMounted(() => {
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
    }
  })

  // 基础边交互：悬停时显示删除按钮与“+”插入按钮
  graph.on('edge:mouseenter', ({ edge }) => {
    edge.addTools([
      {
        name: 'button-remove',
        args: { distance: -30, offset: { x: 0, y: 0 } }
      },
      {
        name: 'button',
        args: {
          markup: [
            { tagName: 'circle', attrs: { r: 10, fill: '#4C78FF', stroke: '#4C78FF', cursor: 'pointer' } },
            { tagName: 'text', attrs: { fill: '#fff', fontSize: 12, textAnchor: 'middle', pointerEvents: 'none', y: 4, text: '+' } }
          ],
          distance: 0,
          offset: { x: 0, y: 0 },
          onClick: ({ e }) => {
            // 在边中心位置唤起节点选择器，并记录待插入的边
            const bbox = edge.getBBox()
            const x = bbox.x + bbox.width / 2
            const y = bbox.y + bbox.height / 2
            pendingCreatePoint = { x, y }
            nodeSelectorPosition.value = { x, y }
            nodeSelectorSourceNode.value = null
            pendingInsertionEdge = edge
            showNodeSelector.value = true
          }
        }
      }
    ])
  })
  graph.on('edge:mouseleave', ({ edge }) => {
    edge.removeTools()
  })

  // 空白点击 -> 打开节点选择器
  graph.on('blank:click', ({ e, x, y }) => {
    pendingCreatePoint = { x, y }
    nodeSelectorPosition.value = { x, y }
    nodeSelectorSourceNode.value = null
    showNodeSelector.value = true
  })

  ensureStartNode()
})

onBeforeUnmount(() => {
  if (graph) {
    graph.dispose()
    graph = null
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
  const ports = createHorizontalPortConfig(outCount, portsOptions)
  return {
    id,
    x,
    y,
    width: 280,
    height: Math.max(100, 60 + (outCount - 1) * 24),
    shape: 'rect',
    attrs: {
      label: { text: label || '节点', fill: '#1F2937', fontSize: 14 },
      body: { fill: '#FFFFFF', stroke: '#D1D5DB', strokeWidth: 1, rx: 8, ry: 8 }
    },
    data,
    ports
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
  // 新建后立即打开配置抽屉
  openDrawerForNode(nodeType, newNodeId)
  showNodeSelector.value = false
  return node
}

function closeNodeSelector() {
  showNodeSelector.value = false
}

// 处理抽屉事件：写回节点数据并标记已配置
function handleConfigConfirm({ drawerType, config }) {
  try {
    const nodeId = activeNodeId.value || drawerStates.value[drawerType]?.data?.id
    const node = nodeId ? graph.getCellById(nodeId) : null
    if (node && node.setData) {
      const prev = node.getData() || {}
      node.setData({ ...prev, config: config || {}, isConfigured: true })
    }
  } catch (e) {
    console.warn('[Horizontal] 配置写回失败:', e)
  } finally {
    if (drawerStates.value[drawerType]) {
      drawerStates.value[drawerType].visible = false
    }
    activeDrawerKey.value = null
    activeNodeId.value = null
  }
}

function handleConfigCancel({ drawerType }) {
  if (drawerStates.value[drawerType]) {
    drawerStates.value[drawerType].visible = false
  }
  activeDrawerKey.value = null
  activeNodeId.value = null
}
</script>

<style scoped>
.horizontal-task-flow-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.title { font-weight: 600; }
.actions { display: flex; gap: 8px; }
.btn {
  background: #4C78FF;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.content { flex: 1; overflow: hidden; }
.canvas-container {
  height: 100%;
  width: 100%;
}
</style>
// 打开配置抽屉（统一入口）
function openDrawerForNode(nodeType, nodeId) {
  const typeToDrawerKey = {
    start: 'start',
    'audience-split': 'crowd-split',
    'event-split': 'event-split',
    'ab-test': 'ab-test',
    'ai-call': 'ai-call',
    sms: 'sms',
    'manual-call': 'manual-call',
    wait: 'wait',
    benefit: 'benefit'
  }
  const drawerKey = typeToDrawerKey[nodeType]
  if (!drawerKey || !drawerStates.value[drawerKey]) return
  const node = graph.getCellById(nodeId)
  const pos = node?.getPosition?.() || { x: 0, y: 0 }
  const size = node?.getSize?.() || { width: 0, height: 0 }
  drawerStates.value[drawerKey].visible = true
  drawerStates.value[drawerKey].data = {
    id: nodeId,
    type: nodeType,
    position: pos,
    size: size,
    config: node?.getData?.()?.config || {}
  }
  activeDrawerKey.value = drawerKey
  activeNodeId.value = nodeId
}