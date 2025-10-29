<template>
  <div 
    v-if="visible" 
    class="debug-panel" 
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    :class="{ 'dragging': isDragging }"
  >
    <div class="debug-header" @mousedown="startDrag">
      <div class="debug-title">
        <icon-bug />
        调试面板
      </div>
      <a-button @click="closePanel" size="mini" type="text">
        <template #icon><icon-close /></template>
      </a-button>
    </div>
    <div class="debug-content">
      <!-- 预览线调试部分 -->
      <div class="debug-section">
        <h4 class="section-title">预览线调试</h4>
        <a-button 
          @click="checkPreviewLineValidity" 
          type="primary" 
          size="small" 
          :loading="debugStats?.loading"
        >
          <template #icon><icon-check /></template>
          预览线有效性检查
        </a-button>
        <a-button 
          @click="triggerPreviewLineGeneration" 
          type="outline" 
          size="small" 
          :loading="isGeneratingPreviewLines" 
          style="margin-left: 8px;"
        >
          <template #icon><icon-thunderbolt /></template>
          触发预览线生成
        </a-button>
      </div>

      <!-- 端口坐标调试部分 -->
      <div class="debug-section">
        <h4 class="section-title">端口坐标调试</h4>
        <div class="port-debug-controls">
          <a-button 
            @click="togglePortDebugPanel" 
            type="primary" 
            size="small"
            :type="showPortDebugPanel ? 'primary' : 'outline'"
          >
            <template #icon><icon-location /></template>
            {{ showPortDebugPanel ? '关闭端口调试' : '打开端口调试' }}
          </a-button>
          <a-button 
            @click="debugAllNodePorts" 
            type="outline" 
            size="small" 
            style="margin-left: 8px;"
          >
            <template #icon><icon-dashboard /></template>
            调试所有节点端口
          </a-button>
          <!-- 新增：详细日志开关按钮 -->
          <a-button 
            @click="toggleDetailedLogs" 
            size="small" 
            :type="detailedLogsEnabled ? 'primary' : 'outline'"
            style="margin-left: 8px;"
          >
            <template #icon><icon-settings /></template>
            {{ detailedLogsEnabled ? '关闭详细日志' : '开启详细日志' }}
          </a-button>
        </div>
        
        <!-- 端口调试统计信息 -->
        <div v-if="portDebugStats" class="port-debug-stats">
          <div class="stats-row">
            <span class="stat-label">已调试节点:</span>
            <span class="stat-value">{{ portDebugStats.totalNodes }}</span>
          </div>
          <div class="stats-row">
            <span class="stat-label">发现问题:</span>
            <span class="stat-value error">{{ portDebugStats.totalIssues }}</span>
          </div>
        </div>

        <!-- 当前选中节点的端口信息 -->
        <div v-if="selectedNodePortInfo" class="selected-node-port-info">
          <h5>选中节点: {{ selectedNodePortInfo.id }}</h5>
          <div class="node-port-details">
            <div class="detail-item">
              <span class="detail-label">类型:</span>
              <span class="detail-value">{{ selectedNodePortInfo.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">位置:</span>
              <span class="detail-value">{{ selectedNodePortInfo.position.x }}, {{ selectedNodePortInfo.position.y }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">尺寸:</span>
              <span class="detail-value">{{ selectedNodePortInfo.size.width }}×{{ selectedNodePortInfo.size.height }}</span>
            </div>
          </div>
          
          <!-- 端口坐标详情 -->
          <div v-if="selectedNodePortInfo.portAnalysis" class="port-coordinates">
            <div v-for="(coords, groupName) in selectedNodePortInfo.portAnalysis.coordinates" :key="groupName" class="port-group-info">
              <div class="port-group-name">{{ groupName }} 端口</div>
              <div class="coord-info">
                <span class="coord-label">最终坐标:</span>
                <span class="coord-value">{{ coords.final.x.toFixed(1) }}, {{ coords.final.y.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- 问题提示 -->
          <div v-if="selectedNodePortInfo.portAnalysis && selectedNodePortInfo.portAnalysis.issues.length > 0" class="port-issues">
            <div class="issues-title">端口问题:</div>
            <div v-for="(issue, index) in selectedNodePortInfo.portAnalysis.issues" :key="index" class="issue-item">
              {{ issue }}
            </div>
          </div>
        </div>
      </div>

      <!-- 预览线统计信息 -->
      <div v-if="debugStats?.data" class="debug-stats">
        <h4 class="section-title">预览线统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">节点数</div>
            <div class="stat-value">{{ debugStats.data.nodeCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">配置数</div>
            <div class="stat-value">{{ debugStats.data.configuredNodeCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">应存在预览线数</div>
            <div class="stat-value">{{ debugStats.data.expectedPreviewLines }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">实际预览线数</div>
            <div class="stat-value">{{ debugStats.data.actualPreviewLines }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">应存在连接线数</div>
            <div class="stat-value">{{ debugStats.data.expectedConnections }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">实际连接线数</div>
            <div class="stat-value">{{ debugStats.data.actualConnections }}</div>
          </div>
        </div>
        <div v-if="debugStats.data.issues && debugStats.data.issues.length > 0" class="debug-issues">
          <div class="issues-title">发现的问题：</div>
          <div v-for="(issue, index) in debugStats.data.issues" :key="index" class="issue-item">
            {{ issue }}
          </div>
        </div>
      </div>
    </div>

    <!-- 端口调试面板 -->
    <PortDebugPanel
      v-if="showPortDebugPanel"
      :graph="graph"
      :visible="showPortDebugPanel"
      @close="showPortDebugPanel = false"
    />
  </div>
</template>

<script>
import {
  IconBug,
  IconClose,
  IconCheck,
  IconThunderbolt,
  IconLocation,
  IconDashboard,
  IconSettings
} from '@arco-design/web-vue/es/icon'
import PortDebugPanel from './PortDebugPanel.vue'
import { getPortCoordinateDebugger } from '../utils/canvas/PortCoordinateDebugger.js'

export default {
  name: 'CanvasDebugPanel',
  components: {
    IconBug,
    IconClose,
    IconCheck,
    IconThunderbolt,
    IconLocation,
    IconDashboard,
    IconSettings,
    PortDebugPanel
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ x: 100, y: 100 })
    },
    debugStats: {
      type: Object,
      default: null
    },
    isGeneratingPreviewLines: {
      type: Boolean,
      default: false
    },
    graph: {
      type: Object,
      default: null
    }
  },
  emits: [
    'close',
    'update:position',
    'check-preview-line-validity',
    'trigger-preview-line-generation'
  ],
  data() {
    return {
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      showPortDebugPanel: false,
      portDebugStats: null,
      selectedNodePortInfo: null,
      portDebugger: null,
      detailedLogsEnabled: false // 新增：详细日志开关
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    
    // 初始化端口调试器
    this.initPortDebugger()
    
    // 监听节点选择事件
    if (this.graph) {
      this.graph.on('selection:changed', this.handleNodeSelection)
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    
    // 清理事件监听
    if (this.graph) {
      this.graph.off('selection:changed', this.handleNodeSelection)
    }
  },
  methods: {
    closePanel() {
      this.$emit('close')
    },
    checkPreviewLineValidity() {
      this.$emit('check-preview-line-validity')
    },
    triggerPreviewLineGeneration() {
      this.$emit('trigger-preview-line-generation')
    },
    startDrag(e) {
      this.isDragging = true
      const rect = e.target.closest('.debug-panel').getBoundingClientRect()
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    },
    handleMouseMove(e) {
      if (this.isDragging) {
        const newPosition = {
          x: e.clientX - this.dragOffset.x,
          y: e.clientY - this.dragOffset.y
        }
        this.$emit('update:position', newPosition)
      }
    },
    handleMouseUp() {
      this.isDragging = false
    },
    
    // 端口调试相关方法
    initPortDebugger() {
      if (this.graph) {
        this.portDebugger = getPortCoordinateDebugger(this.graph)
        if (this.portDebugger) {
          this.portDebugger.setEnabled(true)
          this.portDebugger.setDebugMode(this.detailedLogsEnabled) // 设置初始调试模式
          this.updatePortDebugStats()
        }
      }
    },
    
    togglePortDebugPanel() {
      this.showPortDebugPanel = !this.showPortDebugPanel
    },
    
    // 新增：切换详细日志模式
    toggleDetailedLogs() {
      this.detailedLogsEnabled = !this.detailedLogsEnabled
      if (this.portDebugger) {
        this.portDebugger.setDebugMode(this.detailedLogsEnabled)
        this.portDebugger.setLogLevel(this.detailedLogsEnabled ? 'detailed' : 'basic')
      }
    },
    
    debugAllNodePorts() {
      if (this.portDebugger) {
        this.portDebugger.debugAllNodes()
        this.updatePortDebugStats()
      }
    },
    
    updatePortDebugStats() {
      if (!this.portDebugger) return
      
      let totalNodes = 0
      let totalIssues = 0
      
      this.portDebugger.debugInfo.forEach((debugData) => {
        totalNodes++
        if (debugData.portAnalysis && debugData.portAnalysis.issues) {
          totalIssues += debugData.portAnalysis.issues.length
        }
      })
      
      this.portDebugStats = { totalNodes, totalIssues }
    },
    
    handleNodeSelection(args) {
      if (args.selected && args.selected.length > 0) {
        const selectedNode = args.selected[0]
        this.updateSelectedNodePortInfo(selectedNode.id)
      } else {
        this.selectedNodePortInfo = null
      }
    },
    
    updateSelectedNodePortInfo(nodeId) {
      if (!this.portDebugger) return
      
      const report = this.portDebugger.generateDebugReport(nodeId)
      if (report && !report.error) {
        this.selectedNodePortInfo = {
          id: nodeId,
          type: report.nodeInfo.type,
          position: report.nodeInfo.position,
          size: report.nodeInfo.size,
          shape: report.nodeInfo.shape,
          portAnalysis: report.portAnalysis
        }
      }
    }
  }
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  z-index: 1000;
  width: 400px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(95, 149, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
}

.debug-panel:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(95, 149, 255, 0.1), rgba(64, 128, 255, 0.1));
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  cursor: move;
  font-weight: 600;
  color: #333;
}

.debug-header:hover {
  background: linear-gradient(135deg, rgba(95, 149, 255, 0.15), rgba(64, 128, 255, 0.15));
}

.debug-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.debug-content {
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.port-debug-controls {
  margin-bottom: 12px;
}

.port-debug-stats {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #666;
  font-size: 12px;
}

.stat-value {
  font-weight: 600;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.stat-value.error {
  color: #ff4d4f;
}

.selected-node-port-info {
  background: #f0f8ff;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.selected-node-port-info h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #1890ff;
  font-weight: 600;
}

.node-port-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #333;
}

.port-coordinates {
  margin-bottom: 12px;
}

.port-group-info {
  background: white;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.port-group-name {
  font-weight: 600;
  color: #1890ff;
  font-size: 11px;
  margin-bottom: 4px;
}

.coord-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.coord-label {
  color: #666;
}

.coord-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1890ff;
}

.port-issues {
  background: #fff2f0;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #ff4d4f;
}

.issues-title {
  font-weight: 600;
  color: #ff4d4f;
  font-size: 11px;
  margin-bottom: 4px;
}

.issue-item {
  font-size: 11px;
  color: #ff4d4f;
  margin-bottom: 2px;
}

.debug-stats {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.stat-item .stat-label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.stat-item .stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  font-family: 'Monaco', 'Menlo', monospace;
}

.debug-issues {
  background: #fff2f0;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #ff4d4f;
}

.debug-issues .issues-title {
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
  font-size: 12px;
}

.debug-issues .issue-item {
  font-size: 12px;
  color: #ff4d4f;
  margin-bottom: 4px;
  padding-left: 8px;
}

.dragging {
  cursor: move;
  opacity: 0.9;
}
</style>