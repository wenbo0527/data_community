<template>
  <div class="lineage-graph-container" ref="graphContainer">
    <div class="floating-toolbar">
      <div class="toolbar-group action-controls">
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
      title="加工任务详情"
      :width="500"
      :footer="false"
      :popup-container="popupContainer"
    >
      <div v-if="selectedNodeData" class="drawer-content">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="任务名称">
            {{ selectedNodeData.taskName }}
          </a-descriptions-item>
          <a-descriptions-item label="任务ID">
            {{ selectedNodeData.taskId }}
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
          <div class="section-title">SQL语句</div>
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
import { Graph, Shape } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import dagre from '@dagrejs/dagre'
import LineageNode from './LineageNode.vue'
import { IconRefresh, IconFullscreen } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  tableName: {
    type: String,
    required: true
  },
  layers: {
    type: Number,
    default: 1
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

// 注册自定义节点
register({
  shape: 'lineage-node',
  width: 240,
  height: 120,
  component: LineageNode,
})

// 辅助函数：生成节点数据
const createNodeData = (id, label, type, dbName, owner) => {
  return {
      label,
      type,
      dbName,
      owner,
      taskName: `任务_${label}`,
      taskId: `task-${type}-${Math.random().toString(36).substr(2, 5)}`,
      taskStatus: Math.random() > 0.8 ? 'failed' : (Math.random() > 0.5 ? 'running' : 'success'),
      lastRunTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
      sql: `SELECT * FROM ${label} \nWHERE dt = '${new Date().toISOString().slice(0, 10)}'`,
      upstreamExpanded: false,
      downstreamExpanded: false
  }
}

// 辅助函数：生成指定方向的节点
  const generateNodes = (sourceId, direction, count = 1) => {
      const newNodes = []
      const newEdges = []
      
      for(let i=0; i<count; i++) {
          const id = `${direction}-${Date.now()}-${i}`
          const label = direction === 'upstream' ? `ods_source_${i}` : `ads_app_${i}`
          
          newNodes.push({
              id,
              shape: 'lineage-node',
              data: createNodeData(id, label, direction, direction === 'upstream' ? 'ods' : 'ads', 'User'),
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

// 展开节点逻辑
const expandNode = (nodeId, direction) => {
    // 查找节点
    const node = graphData.value.nodes.find(n => n.id === nodeId)
    if (!node) return

    // 如果已展开，不再处理
    if (direction === 'left' && node.data.upstreamExpanded) return
    if (direction === 'right' && node.data.downstreamExpanded) return

    const dirType = direction === 'left' ? 'upstream' : 'downstream'
    
    // 生成新节点
    const count = Math.floor(Math.random() * 2) + 1
    const { nodes: newNodes, edges: newEdges } = generateNodes(nodeId, dirType, count)
    
    // 更新数据
    graphData.value.nodes.push(...newNodes)
    graphData.value.edges.push(...newEdges)
    
    // 更新节点展开状态
    if (direction === 'left') {
        node.data.upstreamExpanded = true
    } else {
        node.data.downstreamExpanded = true
    }
    
    // 重新渲染布局
    render()
}

// 提供给子组件
provide('expandNode', expandNode)

// 初始化数据
const initData = () => {
  const nodes = []
  const edges = []
  const mainNodeId = `main-${props.tableName}`
  
  // 主节点
  nodes.push({
    id: mainNodeId,
    shape: 'lineage-node',
    data: {
      ...createNodeData(mainNodeId, props.tableName, 'main', 'dw', '张三'),
      taskStatus: 'success',
      upstreamExpanded: true, // 初始默认展开一层
      downstreamExpanded: true // 初始默认展开一层
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
  
  // 初始上游（默认一层）
  const upRes = generateNodes(mainNodeId, 'upstream', Math.floor(Math.random() * 2) + 1)
  nodes.push(...upRes.nodes)
  edges.push(...upRes.edges)
  
  // 初始下游（默认一层）
  const downRes = generateNodes(mainNodeId, 'downstream', Math.floor(Math.random() * 2) + 1)
  nodes.push(...downRes.nodes)
  edges.push(...downRes.edges)
  
  graphData.value = { nodes, edges }
}

// 自动布局
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
    // 避免点击展开按钮时触发抽屉
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
  // 如果是初始化，graphData可能为空，先init
  if (graphData.value.nodes.length === 0) {
      initData()
  }
  const layoutData = layout()
  graph.value.fromJSON(layoutData)
  
  // 只有第一次渲染或数据完全重置时才居中，避免展开时跳动太大
  // 但dagre布局可能会大幅改变位置，所以重新居中通常是安全的
  // 为了更好的体验，可以尝试只移动视口，不过简单起见先centerContent
  // 也可以使用 zoomToFit 或其他
  // graph.value.centerContent()
  // 实际上，每次layout后，位置都会变，如果不centerContent，可能部分节点跑出视野
  // 所以还是保持centerContent
  graph.value.centerContent()
}

watch(() => [props.tableName], () => {
  initData() // 重置数据
  render()
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
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
}

.drawer-content {
  padding: 0 4px;
}

.sql-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.sql-block {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #4e5969;
  overflow-x: auto;
}

.sql-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
<style>
@import '@/styles/enhanced-toolbar-styles.css';
</style>
