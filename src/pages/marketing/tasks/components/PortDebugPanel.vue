<template>
  <div v-if="showDebugPanel" class="port-debug-panel">
    <div class="debug-header">
      <h3>端口坐标调试面板</h3>
      <div class="debug-controls">
        <a-button size="small" @click="refreshDebugInfo">刷新</a-button>
        <a-button size="small" @click="clearDebugInfo">清除</a-button>
        <a-button size="small" type="primary" @click="togglePanel">
          {{ panelExpanded ? '收起' : '展开' }}
        </a-button>
        <a-button size="small" @click="closePanel">关闭</a-button>
      </div>
    </div>

    <div v-if="panelExpanded" class="debug-content">
      <!-- 当前选中节点信息 -->
      <div v-if="selectedNodeInfo" class="selected-node-info">
        <h4>当前选中节点: {{ selectedNodeInfo.id }}</h4>
        <div class="node-details">
          <div class="detail-row">
            <span class="label">节点类型:</span>
            <span class="value">{{ selectedNodeInfo.type }}</span>
          </div>
          <div class="detail-row">
            <span class="label">节点位置:</span>
            <span class="value">x: {{ selectedNodeInfo.position.x }}, y: {{ selectedNodeInfo.position.y }}</span>
          </div>
          <div class="detail-row">
            <span class="label">节点尺寸:</span>
            <span class="value">{{ selectedNodeInfo.size.width }} × {{ selectedNodeInfo.size.height }}</span>
          </div>
          <div class="detail-row">
            <span class="label">节点形状:</span>
            <span class="value">{{ selectedNodeInfo.shape }}</span>
          </div>
        </div>

        <!-- 端口坐标信息 -->
        <div v-if="selectedNodeInfo.portAnalysis" class="port-analysis">
          <h5>端口坐标分析</h5>
          <div v-for="(coords, groupName) in selectedNodeInfo.portAnalysis.coordinates" :key="groupName" class="port-group">
            <div class="port-group-title">{{ groupName }} 端口组</div>
            <div class="coordinate-details">
              <div class="coord-row">
                <span class="coord-label">基础坐标:</span>
                <span class="coord-value">x: {{ coords.base.x.toFixed(1) }}, y: {{ coords.base.y.toFixed(1) }}</span>
              </div>
              <div class="coord-row">
                <span class="coord-label">偏移量:</span>
                <span class="coord-value">dx: {{ coords.offset.dx }}, dy: {{ coords.offset.dy }}</span>
              </div>
              <div class="coord-row">
                <span class="coord-label">最终坐标:</span>
                <span class="coord-value final-coord">x: {{ coords.final.x.toFixed(1) }}, y: {{ coords.final.y.toFixed(1) }}</span>
              </div>
              <div v-if="coords.isCircle" class="coord-row">
                <span class="coord-label">圆形半径:</span>
                <span class="coord-value">{{ coords.nodeRadius }}px</span>
              </div>
            </div>
          </div>

          <!-- 问题和建议 -->
          <div v-if="selectedNodeInfo.portAnalysis.issues.length > 0" class="issues-section">
            <h6>发现的问题:</h6>
            <ul class="issue-list">
              <li v-for="(issue, index) in selectedNodeInfo.portAnalysis.issues" :key="index" class="issue-item">
                {{ issue }}
              </li>
            </ul>
          </div>

          <div v-if="selectedNodeInfo.portAnalysis.recommendations && selectedNodeInfo.portAnalysis.recommendations.length > 0" class="recommendations-section">
            <h6>修复建议:</h6>
            <ul class="recommendation-list">
              <li v-for="(rec, index) in selectedNodeInfo.portAnalysis.recommendations" :key="index" class="recommendation-item">
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>

        <!-- DOM坐标验证 -->
        <div class="dom-verification">
          <a-button size="small" @click="verifyDOMCoordinates" :loading="verifyingDOM">
            验证DOM坐标
          </a-button>
          <div v-if="domCoordinates" class="dom-coords">
            <h6>DOM坐标验证结果:</h6>
            <div class="dom-node-info">
              <div class="coord-row">
                <span class="coord-label">节点DOM位置:</span>
                <span class="coord-value">x: {{ domCoordinates.nodeBBox.x.toFixed(1) }}, y: {{ domCoordinates.nodeBBox.y.toFixed(1) }}</span>
              </div>
              <div class="coord-row">
                <span class="coord-label">节点DOM尺寸:</span>
                <span class="coord-value">{{ domCoordinates.nodeBBox.width.toFixed(1) }} × {{ domCoordinates.nodeBBox.height.toFixed(1) }}</span>
              </div>
            </div>
            <div v-if="domCoordinates.ports.length > 0" class="dom-ports">
              <div v-for="(port, index) in domCoordinates.ports" :key="index" class="dom-port">
                <div class="port-title">端口 {{ port.id }} ({{ port.group }})</div>
                <div class="coord-row">
                  <span class="coord-label">DOM位置:</span>
                  <span class="coord-value">x: {{ port.bbox.x.toFixed(1) }}, y: {{ port.bbox.y.toFixed(1) }}</span>
                </div>
                <div class="coord-row">
                  <span class="coord-label">相对节点:</span>
                  <span class="coord-value">x: {{ port.relative.x.toFixed(1) }}, y: {{ port.relative.y.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全局调试信息 -->
      <div class="global-debug-info">
        <h4>全局调试信息</h4>
        <div class="debug-stats">
          <div class="stat-item">
            <span class="stat-label">已调试节点数:</span>
            <span class="stat-value">{{ debugStats.totalNodes }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">发现问题数:</span>
            <span class="stat-value error">{{ debugStats.totalIssues }}</span>
          </div>
        </div>
        <a-button size="small" @click="debugAllNodes">调试所有节点</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getPortCoordinateDebugger } from '../utils/canvas/PortCoordinateDebugger.js'

const props = defineProps({
  graph: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// 响应式数据
const showDebugPanel = ref(props.visible)
const panelExpanded = ref(true)
const selectedNodeInfo = ref(null)
const domCoordinates = ref(null)
const verifyingDOM = ref(false)
const debugStats = ref({
  totalNodes: 0,
  totalIssues: 0
})

// 调试器实例
let portDebugger = null

// 计算属性
const hasSelectedNode = computed(() => !!selectedNodeInfo.value)

// 初始化调试器
const initDebugger = () => {
  if (props.graph) {
    portDebugger = getPortCoordinateDebugger(props.graph)
    if (portDebugger) {
      portDebugger.setEnabled(true)
      portDebugger.setLogLevel('detailed')
    }
  }
}

// 监听节点选择事件
const handleNodeSelection = (args) => {
  if (args.selected && args.selected.length > 0) {
    const selectedNode = args.selected[0]
    updateSelectedNodeInfo(selectedNode.id)
  } else {
    selectedNodeInfo.value = null
    domCoordinates.value = null
  }
}

// 更新选中节点信息
const updateSelectedNodeInfo = (nodeId) => {
  if (!portDebugger) return

  const report = portDebugger.generateDebugReport(nodeId)
  if (report && !report.error) {
    selectedNodeInfo.value = {
      id: nodeId,
      type: report.nodeInfo.type,
      position: report.nodeInfo.position,
      size: report.nodeInfo.size,
      shape: report.nodeInfo.shape,
      portAnalysis: report.portAnalysis
    }
  }
}

// 验证DOM坐标
const verifyDOMCoordinates = async () => {
  if (!selectedNodeInfo.value || !props.graph) return

  verifyingDOM.value = true
  try {
    const nodeId = selectedNodeInfo.value.id
    const node = props.graph.getCellById(nodeId)
    if (!node) return

    const nodeView = props.graph.findViewByCell(node)
    if (!nodeView) return

    // 获取节点DOM信息
    const nodeElement = nodeView.container
    const nodeBBox = nodeElement.getBoundingClientRect()

    // 获取端口DOM信息
    const portElements = nodeElement.querySelectorAll('[port]')
    const ports = Array.from(portElements).map(portElement => {
      const portId = portElement.getAttribute('port')
      const portGroup = portElement.getAttribute('port-group')
      const portBBox = portElement.getBoundingClientRect()

      return {
        id: portId,
        group: portGroup,
        bbox: {
          x: portBBox.x,
          y: portBBox.y,
          width: portBBox.width,
          height: portBBox.height,
          center: {
            x: portBBox.x + portBBox.width / 2,
            y: portBBox.y + portBBox.height / 2
          }
        },
        relative: {
          x: portBBox.x - nodeBBox.x,
          y: portBBox.y - nodeBBox.y
        }
      }
    })

    domCoordinates.value = {
      nodeBBox: {
        x: nodeBBox.x,
        y: nodeBBox.y,
        width: nodeBBox.width,
        height: nodeBBox.height,
        center: {
          x: nodeBBox.x + nodeBBox.width / 2,
          y: nodeBBox.y + nodeBBox.height / 2
        }
      },
      ports
    }

    // 在控制台输出详细信息
    if (portDebugger) {
      portDebugger.debugRenderedPortCoordinates(nodeId)
    }
  } catch (error) {
    console.error('验证DOM坐标时出错:', error)
  } finally {
    verifyingDOM.value = false
  }
}

// 刷新调试信息
const refreshDebugInfo = () => {
  if (selectedNodeInfo.value) {
    updateSelectedNodeInfo(selectedNodeInfo.value.id)
  }
  updateDebugStats()
}

// 清除调试信息
const clearDebugInfo = () => {
  if (portDebugger) {
    portDebugger.clearDebugInfo()
  }
  selectedNodeInfo.value = null
  domCoordinates.value = null
  updateDebugStats()
}

// 调试所有节点
const debugAllNodes = () => {
  if (portDebugger) {
    portDebugger.debugAllNodes()
  }
  updateDebugStats()
}

// 更新调试统计信息
const updateDebugStats = () => {
  if (!portDebugger) return

  let totalNodes = 0
  let totalIssues = 0

  portDebugger.debugInfo.forEach((debugData) => {
    totalNodes++
    if (debugData.portAnalysis && debugData.portAnalysis.issues) {
      totalIssues += debugData.portAnalysis.issues.length
    }
  })

  debugStats.value = { totalNodes, totalIssues }
}

// 切换面板展开状态
const togglePanel = () => {
  panelExpanded.value = !panelExpanded.value
}

// 关闭面板
const closePanel = () => {
  showDebugPanel.value = false
  emit('close')
}

// 监听props变化
const updateVisibility = () => {
  showDebugPanel.value = props.visible
}

// 生命周期
onMounted(() => {
  initDebugger()
  
  // 监听节点选择事件
  if (props.graph) {
    props.graph.on('selection:changed', handleNodeSelection)
  }
  
  updateDebugStats()
})

onUnmounted(() => {
  // 清理事件监听
  if (props.graph) {
    props.graph.off('selection:changed', handleNodeSelection)
  }
})

// 监听props变化
const unwatchVisible = () => {
  updateVisibility()
}

// 暴露方法给父组件
defineExpose({
  show: () => { showDebugPanel.value = true },
  hide: () => { showDebugPanel.value = false },
  toggle: () => { showDebugPanel.value = !showDebugPanel.value },
  refreshDebugInfo,
  clearDebugInfo
})
</script>

<style scoped>
.port-debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.debug-controls {
  display: flex;
  gap: 8px;
}

.debug-content {
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.selected-node-info {
  margin-bottom: 20px;
}

.selected-node-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.node-details {
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #595959;
}

.value {
  color: #262626;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.port-analysis {
  margin-top: 16px;
}

.port-analysis h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

.port-group {
  background: #f0f8ff;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.port-group-title {
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
  font-size: 12px;
}

.coordinate-details {
  font-size: 11px;
}

.coord-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.coord-label {
  color: #595959;
  font-weight: 500;
}

.coord-value {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #262626;
}

.final-coord {
  font-weight: 600;
  color: #1890ff;
}

.issues-section {
  margin-top: 12px;
  padding: 12px;
  background: #fff2f0;
  border-radius: 4px;
}

.issues-section h6 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #cf1322;
  font-weight: 600;
}

.issue-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
}

.issue-item {
  color: #cf1322;
  margin-bottom: 4px;
}

.recommendations-section {
  margin-top: 12px;
  padding: 12px;
  background: #f6ffed;
  border-radius: 4px;
}

.recommendations-section h6 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #389e0d;
  font-weight: 600;
}

.recommendation-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
}

.recommendation-item {
  color: #389e0d;
  margin-bottom: 4px;
}

.dom-verification {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.dom-coords {
  margin-top: 12px;
}

.dom-coords h6 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #262626;
}

.dom-node-info {
  background: white;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 11px;
}

.dom-ports {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.dom-port {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
}

.dom-port:last-child {
  border-bottom: none;
}

.port-title {
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.global-debug-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.global-debug-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.debug-stats {
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #595959;
  font-weight: 500;
}

.stat-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
}

.stat-value.error {
  color: #cf1322;
}
</style>