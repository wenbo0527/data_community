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
      <div class="debug-section">
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
      <div v-if="debugStats?.data" class="debug-stats">
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
  </div>
</template>

<script>
import {
  IconBug,
  IconClose,
  IconCheck,
  IconThunderbolt
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'CanvasDebugPanel',
  components: {
    IconBug,
    IconClose,
    IconCheck,
    IconThunderbolt
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
      dragOffset: { x: 0, y: 0 }
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
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
    }
  }
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  z-index: 1000;
  width: 350px;
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

.debug-title .arco-icon {
  color: #5F95FF;
  font-size: 16px;
}

.debug-header .arco-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
}

.debug-header .arco-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.debug-content {
  padding: 16px;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.debug-section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(135deg, #5F95FF, #4080FF);
  border-radius: 2px;
}

.debug-stats {
  margin-top: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  background: rgba(95, 149, 255, 0.05);
  border: 1px solid rgba(95, 149, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(95, 149, 255, 0.08);
  border-color: rgba(95, 149, 255, 0.2);
  transform: translateY(-1px);
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-value.highlight {
  color: #5F95FF;
}

.stat-value.warning {
  color: #ff7d00;
}

.stat-value.error {
  color: #ff4d4f;
}

.debug-issues {
  background: rgba(255, 243, 243, 0.8);
  border: 1px solid rgba(245, 63, 63, 0.2);
  border-radius: 4px;
  padding: 8px;
  margin-top: 16px;
}

.issues-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.issue-item {
  padding: 8px 12px;
  background: rgba(255, 77, 79, 0.05);
  border: 1px solid rgba(255, 77, 79, 0.1);
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #ff4d4f;
}

.debug-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.debug-action-btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.debug-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(95, 149, 255, 0.3);
}

.debug-panel.dragging {
  cursor: move;
  transform: rotate(1deg);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

.dragging {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

/* 调试面板动画 */
.debug-panel-enter-active,
.debug-panel-leave-active {
  transition: all 0.3s ease;
}

.debug-panel-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.debug-panel-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .debug-panel {
    width: 300px;
    font-size: 12px;
    position: relative;
    margin-bottom: 10px;
  }
  
  .debug-header {
    cursor: default;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}
</style>