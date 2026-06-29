<template>
  <div class="lineage-graph-container" ref="graphContainer">
    <div class="floating-toolbar">
      <div class="toolbar-group action-controls">
        <button class="toolbar-btn" @click="zoomIn">
          <IconZoomIn class="toolbar-icon" />
          <span class="toolbar-text">放大</span>
        </button>
        <button class="toolbar-btn" @click="zoomOut">
          <IconZoomOut class="toolbar-icon" />
          <span class="toolbar-text">缩小</span>
        </button>
        <button class="toolbar-btn" @click="fitView">
          <IconExpand class="toolbar-icon" />
          <span class="toolbar-text">自适应</span>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="refreshGraph">
          <IconRefresh class="toolbar-icon" />
          <span class="toolbar-text">刷新</span>
        </button>
        <button class="toolbar-btn" @click="toggleFullscreen">
          <IconFullscreen class="toolbar-icon" />
          <span class="toolbar-text">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
        </button>
      </div>
    </div>
    <div class="canvas-container" ref="canvasContainer"></div>

    <a-drawer
      v-model:visible="drawerVisible"
      title="资产详情"
      :width="500"
      :footer="false"
      :popup-container="popupContainer"
    >
      <div v-if="selectedNodeData" class="drawer-content">
        <div class="drawer-header-actions">
          <a-button type="primary" size="small" @click="jumpToDetail">
            <template #icon><IconLaunch /></template>
            查看资产详情
          </a-button>
        </div>

        <a-descriptions title="基本信息" :column="1" bordered>
          <a-descriptions-item label="名称">
            {{ selectedNodeData.label }}
          </a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag>{{ selectedNodeData.dataType }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedNodeData.owner }}
          </a-descriptions-item>
          <a-descriptions-item label="存储库">
            {{ selectedNodeData.dbName }}
          </a-descriptions-item>
          <a-descriptions-item label="数据量" v-if="selectedNodeData.rowCount">
            {{ selectedNodeData.rowCount.toLocaleString() }} 行 ({{ selectedNodeData.dataSize }})
          </a-descriptions-item>
        </a-descriptions>

        <a-descriptions title="加工任务" :column="1" bordered style="margin-top: 20px;">
          <a-descriptions-item label="任务名称">
            {{ selectedNodeData.taskName }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedNodeData.taskStatus === 'success' ? 'green' : selectedNodeData.taskStatus === 'running' ? 'blue' : 'red'">
              {{ selectedNodeData.taskStatus === 'success' ? '成功' : selectedNodeData.taskStatus === 'running' ? '运行中' : '失败' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="最近运行时间">
            {{ selectedNodeData.lastRunTime }}
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="sql-section">
          <div class="section-title">
            <span>SQL语句</span>
            <a-button type="text" size="mini" @click="copySQL">
              <template #icon><IconCopy /></template>
              复制
            </a-button>
          </div>
          <div class="sql-block">
            <pre>{{ selectedNodeData.sql }}</pre>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, provide } from 'vue'
import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import dagre from '@dagrejs/dagre'
import LineageNode from './LineageNode.vue'
import { IconRefresh, IconFullscreen, IconCopy, IconLaunch, IconZoomIn, IconZoomOut, IconExpand } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  tableName: {
    type: String,
    required: true
  },
  layers: {
    type: Number,
    default: 1
  },
  dataTypes: {
    type: Array,
    default: () => []
  },
  onlyFailed: {
    type: Boolean,
    default: false
  },
  upstream: {
    type: Array,
    default: () => []
  },
  downstream: {
    type: Array,
    default: () => []
  }
})

const canvasContainer = ref(null)
const graphContainer = ref(null)
const graph = ref(null)
const drawerVisible = ref(false)
const selectedNodeData = ref(null)
const popupContainer = computed(() => canvasContainer.value)
const graphData = ref({ nodes: [], edges: [] })
const isFullscreen = ref(false)

register({
  shape: 'lineage-node',
  width: 240,
  height: 120,
  component: LineageNode,
})

const createNodeData = (id, label, type, dbName, owner, dataType = 'Table') => {
  const status = Math.random() > 0.8 ? 'failed' : (Math.random() > 0.5 ? 'running' : 'success')
  const rowCount = Math.floor(Math.random() * 1000000)
  const dataSize = (Math.random() * 100).toFixed(2) + ' GB'
  
  return {
    label,
    type,
    dataType,
    dbName,
    owner,
    rowCount,
    dataSize,
    taskName: `任务_${label}`,
    taskId: `task-${type}-${Math.random().toString(36).substr(2, 5)}`,
    taskStatus: status,
    lastRunTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
    sql: `SELECT * FROM ${label} \nWHERE dt = '${new Date().toISOString().slice(0, 10)}'`,
    upstreamExpanded: false,
    downstreamExpanded: false
  }
}

const mapToDataType = (t) => {
  const v = String(t || '').toLowerCase()
  if (v === 'table') return 'Table'
  if (v === 'metric') return 'Metric'
  if (v === 'api') return 'API'
  if (v === 'variable') return 'Variable'
  if (v === 'model') return 'Metric'
  if (v === 'report') return 'API'
  return 'Table'
}

const getRandomDataType = () => {
  const types = ['Table', 'Metric', 'API', 'Variable']
  return types[Math.floor(Math.random() * types.length)]
}

const generateNodes = (sourceId, direction, count = 1) => {
  const newNodes = []
  const newEdges = []
  
  for (let i = 0; i < count; i++) {
    const id = `${direction}-${Date.now()}-${i}`
    const label = direction === 'upstream' ? `ods_source_${i}` : `ads_app_${i}`
    
    let dataType = 'Table'
    if (props.dataTypes && props.dataTypes.length > 0) {
      dataType = props.dataTypes[Math.floor(Math.random() * props.dataTypes.length)]
    } else {
      dataType = getRandomDataType()
    }

    const nodeData = createNodeData(id, label, direction, direction === 'upstream' ? 'ods' : 'ads', 'User', dataType)
    
    if (props.onlyFailed) {
      nodeData.taskStatus = 'failed'
    }

    newNodes.push({
      id,
      shape: 'lineage-node',
      data: nodeData,
      ports: {
        groups: {
          left: {
            position: 'left',
            attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
          },
          right: {
            position: 'right',
            attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
          }
        },
        items: [
          { id: 'left', group: 'left' },
          { id: 'right', group: 'right' }
        ]
      }
    })
    
    if (direction === 'upstream') {
      newEdges.push({
        source: { cell: id, port: 'right' },
        target: { cell: sourceId, port: 'left' },
        attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2, targetMarker: 'classic' } }
      })
    } else {
      newEdges.push({
        source: { cell: sourceId, port: 'right' },
        target: { cell: id, port: 'left' },
        attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2, targetMarker: 'classic' } }
      })
    }
  }
  return { nodes: newNodes, edges: newEdges }
}

const expandNode = (nodeId, direction) => {
  const node = graphData.value.nodes.find(n => n.id === nodeId)
  if (!node) return

  if (direction === 'left' && node.data.upstreamExpanded) return
  if (direction === 'right' && node.data.downstreamExpanded) return

  const dirType = direction === 'left' ? 'upstream' : 'downstream'
  
  const count = Math.floor(Math.random() * 2) + 1
  const { nodes: newNodes, edges: newEdges } = generateNodes(nodeId, dirType, count)
  
  graphData.value.nodes.push(...newNodes)
  graphData.value.edges.push(...newEdges)
  
  if (direction === 'left') {
    node.data.upstreamExpanded = true
  } else {
    node.data.downstreamExpanded = true
  }
  
  render()
}

provide('expandNode', expandNode)

const initData = () => {
  const nodes = []
  const edges = []

  let mainType = 'Table'
  if (props.dataTypes && props.dataTypes.length > 0) {
    mainType = props.dataTypes[0]
  }

  const mainNodeId = `main-${props.tableName}`

  nodes.push({
    id: mainNodeId,
    shape: 'lineage-node',
    data: {
      ...createNodeData(mainNodeId, props.tableName, 'main', 'dw', '张三', mainType),
      taskStatus: 'success',
      upstreamExpanded: true,
      downstreamExpanded: true
    },
    ports: {
      groups: {
        left: {
          position: 'left',
          attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
        },
        right: {
          position: 'right',
          attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
        }
      },
      items: [
        { id: 'left', group: 'left' },
        { id: 'right', group: 'right' }
      ]
    }
  })

  const hasInjected = Array.isArray(props.upstream) && props.upstream.length > 0
    || Array.isArray(props.downstream) && props.downstream.length > 0

  if (hasInjected) {
    const upstream = Array.isArray(props.upstream) ? props.upstream : []
    const downstream = Array.isArray(props.downstream) ? props.downstream : []

    upstream.forEach((u) => {
      const id = String(u.id)
      const dataType = mapToDataType(u.type)
      const nodeData = createNodeData(id, u.name || id, 'upstream', u.dbName || 'ods', u.owner || '—', dataType)
      if (props.onlyFailed) nodeData.taskStatus = 'failed'

      nodes.push({
        id,
        shape: 'lineage-node',
        data: nodeData,
        ports: {
          groups: {
            left: {
              position: 'left',
              attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
            },
            right: {
              position: 'right',
              attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
            }
          },
          items: [
            { id: 'left', group: 'left' },
            { id: 'right', group: 'right' }
          ]
        }
      })

      edges.push({
        source: { cell: id, port: 'right' },
        target: { cell: mainNodeId, port: 'left' },
        attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2, targetMarker: 'classic' } }
      })
    })

    downstream.forEach((d) => {
      const id = String(d.id)
      const dataType = mapToDataType(d.type)
      const nodeData = createNodeData(id, d.name || id, 'downstream', d.dbName || 'ads', d.owner || '—', dataType)
      if (props.onlyFailed) nodeData.taskStatus = 'failed'

      nodes.push({
        id,
        shape: 'lineage-node',
        data: nodeData,
        ports: {
          groups: {
            left: {
              position: 'left',
              attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
            },
            right: {
              position: 'right',
              attrs: { circle: { r: 4, magnet: false, stroke: 'transparent', fill: 'transparent' } }
            }
          },
          items: [
            { id: 'left', group: 'left' },
            { id: 'right', group: 'right' }
          ]
        }
      })

      edges.push({
        source: { cell: mainNodeId, port: 'right' },
        target: { cell: id, port: 'left' },
        attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2, targetMarker: 'classic' } }
      })
    })
  } else {
    const upRes = generateNodes(mainNodeId, 'upstream', Math.floor(Math.random() * 2) + 1)
    nodes.push(...upRes.nodes)
    edges.push(...upRes.edges)
    
    const downRes = generateNodes(mainNodeId, 'downstream', Math.floor(Math.random() * 2) + 1)
    nodes.push(...downRes.nodes)
    edges.push(...downRes.edges)
  }

  graphData.value = { nodes, edges }
}

const layout = () => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 80 })
  g.setDefaultEdgeLabel(() => ({}))

  const { nodes, edges } = graphData.value

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 240, height: 120 })
  })

  edges.forEach((edge) => {
    const sourceId = typeof edge.source === 'object' ? edge.source.cell : edge.source
    const targetId = typeof edge.target === 'object' ? edge.target.cell : edge.target
    g.setEdge(sourceId, targetId)
  })

  dagre.layout(g)

  nodes.forEach((node) => {
    const pos = g.node(node.id)
    node.x = pos.x
    node.y = pos.y
  })

  return { nodes, edges }
}

const initGraph = () => {
  if (graph.value) {
    graph.value.dispose()
  }

  graph.value = new Graph({
    container: canvasContainer.value,
    grid: true,
    mousewheel: {
      enabled: false
    },
    connecting: {
      enabled: false,
      allowNode: false,
      allowPort: false,
      allowEdge: false,
      allowMulti: false,
      allowLoop: false,
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'boundary',
      allowBlank: false,
      snap: {
        radius: 20,
      },
    },
    panning: {
      enabled: true,
      modifiers: null,
    },
    selecting: {
      enabled: false
    },
    background: {
      color: '#f5f7fa',
    },
    interacting: {
      nodeMovable: false,
      edgeMovable: false
    }
  })

  graph.value.on('node:click', ({ e, node }) => {
    if (e.target && e.target.closest && e.target.closest('.expand-btn')) {
      return
    }
    selectedNodeData.value = node.getData()
    drawerVisible.value = true
  })
  graph.value.on('node:change:data', ({ node }) => {
    const data = node.getData() || {}
    const action = data.__expandAction
    if (action === 'left' || action === 'right') {
      expandNode(node.id, action)
      node.setData({ ...data, __expandAction: undefined })
    }
  })
}

const render = () => {
  if (!graph.value) return
  if (graphData.value.nodes.length === 0) {
    initData()
  }
  const layoutData = layout()
  graph.value.fromJSON(layoutData)
  graph.value.centerContent()
}

watch(() => [props.tableName, props.layers, props.dataTypes, props.onlyFailed, props.upstream, props.downstream], () => {
  if (graph.value) {
    initData()
    render()
  }
})

onMounted(() => {
  initGraph()
  render()
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement && document.fullscreenElement === graphContainer.value
  })
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose()
  }
  document.removeEventListener('fullscreenchange', () => {})
})

const refreshGraph = () => {
  graphData.value = { nodes: [], edges: [] }
  initData()
  render()
}

const toggleFullscreen = async () => {
  const el = graphContainer.value
  if (!el) return
  if (!document.fullscreenElement || !isFullscreen.value) {
    if (el.requestFullscreen) {
      await el.requestFullscreen()
    }
  } else {
    await document.exitFullscreen()
  }
}

const zoomIn = () => {
  graph.value?.zoom(0.2)
}

const zoomOut = () => {
  graph.value?.zoom(-0.2)
}

const fitView = () => {
  graph.value?.zoomToFit({ padding: 40 })
  graph.value?.centerContent()
}

const copySQL = () => {
  if (selectedNodeData.value?.sql) {
    navigator.clipboard.writeText(selectedNodeData.value.sql)
    Message.success('SQL已复制到剪贴板')
  }
}

const jumpToDetail = () => {
  if (selectedNodeData.value) {
    Message.info(`跳转到 ${selectedNodeData.value.label} 的详情页面`)
  }
}
</script>

<style scoped>
.lineage-graph-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.canvas-container {
  flex: 1;
  overflow: hidden;
  min-height: 400px;
}

.floating-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.toolbar-group {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: #1d2129;
  font-size: 12px;
}

.toolbar-btn:hover {
  background: #f2f3f5;
}

.toolbar-icon {
  font-size: 14px;
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  background: #e5e6eb;
  margin: 0 2px;
}

.drawer-content {
  padding: 8px 0;
}

.drawer-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.sql-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
}

.sql-block {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  overflow: auto;
}

.sql-block pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
