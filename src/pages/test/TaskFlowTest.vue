<template>
  <div class="task-flow-test">
    <div class="test-header">
      <h2>TaskFlow 重构测试页面</h2>
      <div class="test-controls">
        <a-button @click="clearCanvas">清空画布</a-button>
        <a-button @click="addRandomNode">添加随机节点</a-button>
        <a-button @click="exportData">导出数据</a-button>
        <a-button @click="showPresetSlots">显示预设位</a-button>
        <a-button @click="clearPresetSlots">清空预设位</a-button>
        <a-button @click="getPresetStats">预设位统计</a-button>
      </div>
    </div>
    
    <div class="test-content">
      <div class="canvas-wrapper">
        <LayeredFlowCanvas
          ref="canvasRef"
          @canvas-ready="handleCanvasReady"
          @node-created="handleNodeCreated"
          @node-moved="handleNodeMoved"
          @node-selected="handleNodeClicked"
          @node-updated="handleNodeUpdated"
          @connection-created="handleEdgeConnected"
          @preset-slot-created="handlePresetSlotCreated"
          @preset-slot-occupied="handlePresetSlotOccupied"
        />
      </div>
      
      <div class="test-panel">
        <div class="event-log">
          <h3>事件日志</h3>
          <div class="log-content">
            <div 
              v-for="(log, index) in eventLogs" 
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-event">{{ log.event }}</span>
              <span class="log-data">{{ log.data }}</span>
            </div>
          </div>
        </div>
        
        <div class="canvas-info">
          <h3>画布信息</h3>
          <div class="info-item">
            <label>节点数量:</label>
            <span>{{ canvasInfo.nodeCount }}</span>
          </div>
          <div class="info-item">
            <label>连接数量:</label>
            <span>{{ canvasInfo.edgeCount }}</span>
          </div>
          <div class="info-item">
            <label>画布状态:</label>
            <span>{{ canvasInfo.status }}</span>
          </div>
        </div>
        
        <div class="preset-info">
          <h3>预设位信息</h3>
          <div class="info-item">
            <label>总预设位:</label>
            <span>{{ presetSlotStats.total }}</span>
          </div>
          <div class="info-item">
            <label>空闲预设位:</label>
            <span>{{ presetSlotStats.empty }}</span>
          </div>
          <div class="info-item">
            <label>已占用:</label>
            <span>{{ presetSlotStats.occupied }}</span>
          </div>
          <div class="info-item">
            <label>已禁用:</label>
            <span>{{ presetSlotStats.disabled }}</span>
          </div>
          <div class="preset-types">
            <div class="info-item">
              <label>单一:</label>
              <span>{{ presetSlotStats.byType.single }}</span>
            </div>
            <div class="info-item">
              <label>分支:</label>
              <span>{{ presetSlotStats.byType.branch }}</span>
            </div>
            <div class="info-item">
              <label>并行:</label>
              <span>{{ presetSlotStats.byType.parallel }}</span>
            </div>
            <div class="info-item">
              <label>终端:</label>
              <span>{{ presetSlotStats.byType.terminal }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Button as AButton } from '@arco-design/web-vue'
import LayeredFlowCanvas from '../../components/LayeredFlowCanvas.vue'
import { getAllNodeTypes } from '../../utils/nodeTypes'

// 组件引用
const canvasRef = ref(null)

// 事件日志
const eventLogs = ref([])

// 画布信息
const canvasInfo = reactive({
  nodeCount: 0,
  edgeCount: 0,
  status: '未初始化'
})

// 预设位统计信息
const presetSlotStats = reactive({
  total: 0,
  empty: 0,
  occupied: 0,
  disabled: 0,
  byType: { single: 0, branch: 0, parallel: 0, terminal: 0 }
})

// 添加日志
const addLog = (event, data, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift({
    time,
    event,
    data: JSON.stringify(data),
    type
  })
  
  // 限制日志数量
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
}

// 更新画布信息
const updateCanvasInfo = () => {
  if (canvasRef.value?.nodes) {
    canvasInfo.nodeCount = canvasRef.value.nodes.length
    canvasInfo.edgeCount = canvasRef.value.connections.length
    canvasInfo.status = '已初始化'
    
    // 更新预设位统计
    const slots = canvasRef.value.presetSlots
    if (slots) {
      presetSlotStats.total = slots.length
      presetSlotStats.empty = slots.filter(slot => slot.state === 'empty').length
      presetSlotStats.occupied = slots.filter(slot => slot.state === 'occupied').length
      presetSlotStats.disabled = slots.filter(slot => slot.state === 'disabled').length
      
      // 按类型统计
      presetSlotStats.byType.single = slots.filter(slot => slot.type === 'single').length
      presetSlotStats.byType.branch = slots.filter(slot => slot.type === 'branch').length
      presetSlotStats.byType.parallel = slots.filter(slot => slot.type === 'parallel').length
      presetSlotStats.byType.terminal = slots.filter(slot => slot.type === 'terminal').length
    }
  }
}

// 事件处理器
const handleCanvasReady = (data) => {
  addLog('画布就绪', { nodes: data.nodes.length, connections: data.connections.length, presetSlots: data.presetSlots.length }, 'success')
  updateCanvasInfo()
}

const handleNodeCreated = (node) => {
  addLog('节点创建', { nodeType: node.type, nodeId: node.id }, 'success')
  updateCanvasInfo()
}

const handleNodeMoved = (data) => {
  addLog('节点移动', { nodeId: data.nodeId, position: data.position }, 'info')
}

const handleNodeClicked = (node) => {
  addLog('节点点击', { nodeType: node.type, nodeId: node.id }, 'info')
}

const handleNodeUpdated = (data) => {
  addLog('节点更新', { nodeId: data.nodeId, data: data.data }, 'warning')
  updateCanvasInfo()
}

const handlePresetSlotCreated = (data) => {
  addLog('预设位创建', { slotId: data.id, nodeId: data.nodeId, type: data.type }, 'info')
  updateCanvasInfo()
}

const handlePresetSlotOccupied = (data) => {
  addLog('预设位占用', { slotId: data.slotId, nodeId: data.nodeId }, 'info')
  updateCanvasInfo()
}

const handleEdgeConnected = (data) => {
  addLog('连接创建', { id: data.id, sourceId: data.sourceId, targetId: data.targetId }, 'success')
  updateCanvasInfo()
}

// 测试操作
const clearCanvas = () => {
  if (canvasRef.value?.clearCanvas) {
    canvasRef.value.clearCanvas()
    addLog('清空画布', {}, 'warning')
    updateCanvasInfo()
  }
}

const addRandomNode = () => {
  // 在新组件中，我们需要找到一个空闲的预设位来添加节点
  if (canvasRef.value?.presetSlots) {
    const emptySlots = canvasRef.value.presetSlots.filter(slot => slot.state === 'empty')
    if (emptySlots.length === 0) {
      addLog('没有可用的预设位', {}, 'error')
      return
    }
    
    // 随机选择一个空闲预设位
    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)]
    
    // 获取该预设位允许的节点类型
    const allowedTypes = randomSlot.allowedTypes || []
    const nodeTypes = allowedTypes.length > 0 ? allowedTypes : Object.keys(getAllNodeTypes()).filter(type => type !== 'start')
    
    // 随机选择一个节点类型
    const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
    
    // 添加节点到预设位
    if (canvasRef.value.addNodeToPresetSlot) {
      const node = canvasRef.value.addNodeToPresetSlot(randomSlot, randomType)
      if (node) {
        addLog('添加随机节点', { nodeType: randomType, slotId: randomSlot.id }, 'success')
        updateCanvasInfo()
      }
    }
  }
}

const exportData = () => {
  if (canvasRef.value?.getCanvasData) {
    const data = canvasRef.value.getCanvasData()
    
    const exportData = {
      canvas: data,
      stats: presetSlotStats,
      timestamp: new Date().toISOString()
    }
    
    console.log('导出数据:', exportData)
    addLog('导出数据', { nodeCount: data.nodes?.length, connectionCount: data.connections?.length, presetSlots: data.presetSlots?.length }, 'info')
  }
}

// 显示预设位
const showPresetSlots = () => {
  if (canvasRef.value && canvasRef.value.presetSlots) {
    const slots = canvasRef.value.presetSlots
    console.log('预设位:', slots)
    addLog('显示预设位', { count: slots.length }, 'info')
    updateCanvasInfo()
  }
}

// 清空预设位
const clearPresetSlots = () => {
  // 在新组件中，清空预设位实际上是清空画布，因为预设位是与节点关联的
  if (canvasRef.value && canvasRef.value.clearCanvas) {
    canvasRef.value.clearCanvas()
    addLog('清空预设位', {}, 'warning')
    updateCanvasInfo()
  }
}

// 获取预设位统计
const getPresetStats = () => {
  // 直接使用已经计算好的统计信息
  console.log('预设位统计:', presetSlotStats)
  addLog('预设位统计', presetSlotStats, 'info')
  updateCanvasInfo()
}
</script>

<style scoped>
.task-flow-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

.test-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.test-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.test-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.canvas-wrapper {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 0;
}

.test-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.event-log,
.canvas-info,
.preset-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preset-types {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.event-log {
  flex: 1;
  min-height: 0;
}

.event-log h3,
.canvas-info h3,
.preset-info h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.log-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #999;
  font-size: 11px;
}

.log-event {
  font-weight: 500;
}

.log-data {
  color: #666;
  font-family: monospace;
  word-break: break-all;
}

.log-item.success .log-event {
  color: #52c41a;
}

.log-item.warning .log-event {
  color: #fa8c16;
}

.log-item.error .log-event {
  color: #ff4d4f;
}

.log-item.info .log-event {
  color: #1890ff;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  color: #666;
  font-weight: 500;
}

.info-item span {
  color: #333;
}

/* 滚动条样式 */
.log-content::-webkit-scrollbar {
  width: 6px;
}

.log-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .test-content {
    flex-direction: column;
  }
  
  .test-panel {
    width: 100%;
    flex-direction: row;
    height: 300px;
  }
  
  .event-log,
  .canvas-info,
  .preset-info {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .test-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .test-controls {
    justify-content: center;
  }
  
  .test-panel {
    flex-direction: column;
    height: auto;
  }
}
</style>