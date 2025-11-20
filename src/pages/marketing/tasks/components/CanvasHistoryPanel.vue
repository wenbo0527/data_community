<template>
  <div 
    v-show="visible" 
    class="history-panel"
  >
    <div class="history-header">
      <span class="history-title">操作历史</span>
      <a-button 
        size="mini" 
        type="text" 
        @click="closePanel"
        title="关闭历史面板"
      >
        <template #icon><icon-close /></template>
      </a-button>
    </div>
    <div class="history-content">
      <div class="history-stats">
        <span class="history-stat">
          可撤销: {{ historyStack.undoStack.length }}
        </span>
        <span class="history-stat">
          可重做: {{ historyStack.redoStack.length }}
        </span>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in historyStack.undoStack.slice().reverse()" 
          :key="`undo-${index}`"
          class="history-item"
          :class="{ 'history-item-current': index === 0 }"
          @click="jumpToHistoryState(historyStack.undoStack.length - 1 - index)"
        >
          <div class="history-item-icon">
            <icon-check v-if="index === 0" />
            <icon-history v-else />
          </div>
          <div class="history-item-content">
            <div class="history-item-title">{{ item.description || getOperationDescription(item) }}</div>
            <div class="history-item-time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </div>
        <div v-if="historyStack.redoStack.length > 0" class="history-divider">
          <span>可重做操作</span>
        </div>
        <div 
          v-for="(item, index) in historyStack.redoStack" 
          :key="`redo-${index}`"
          class="history-item history-item-redo"
          @click="jumpToHistoryState(historyStack.undoStack.length + index + 1)"
        >
          <div class="history-item-icon">
            <icon-redo />
          </div>
          <div class="history-item-content">
            <div class="history-item-title">{{ item.description || getOperationDescription(item) }}</div>
            <div class="history-item-time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  IconClose,
  IconCheck,
  IconHistory,
  IconRedo
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'CanvasHistoryPanel',
  components: {
    IconClose,
    IconCheck,
    IconHistory,
    IconRedo
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    historyStack: {
      type: Object,
      default: () => ({
        undoStack: [],
        redoStack: []
      })
    }
  },
  emits: [
    'close',
    'jump-to-state'
  ],
  methods: {
    closePanel() {
      this.$emit('close')
    },
    jumpToHistoryState(index) {
      this.$emit('jump-to-state', index)
    },
    getOperationDescription(item) {
      if (!item || !item.type) return '未知操作'
      
      const descriptions = {
        'node:add': '添加节点',
        'node:remove': '删除节点',
        'node:move': '移动节点',
        'node:update': '更新节点',
        'edge:add': '添加连线',
        'edge:remove': '删除连线',
        'edge:update': '更新连线',
        'layout:apply': '应用布局',
        'canvas:clear': '清空画布',
        'batch:operation': '批量操作'
      }
      
      return descriptions[item.type] || item.type
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 小于1分钟
        return '刚刚'
      } else if (diff < 3600000) { // 小于1小时
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 小于1天
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleDateString()
      }
    }
  }
}
</script>

<style scoped>
.history-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 20;
  width: 300px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(95, 149, 255, 0.1);
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-header .arco-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
}

.history-header .arco-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.history-content {
  max-height: 450px;
  overflow-y: auto;
}

.history-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: #666;
}

.history-stat {
  font-weight: 500;
}

.history-list {
  padding: 8px 0;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.history-item:hover {
  background: rgba(95, 149, 255, 0.05);
  border-left-color: rgba(95, 149, 255, 0.3);
}

.history-item-current {
  background: rgba(95, 149, 255, 0.1);
  border-left-color: #5F95FF;
}

.history-item-current:hover {
  background: rgba(95, 149, 255, 0.15);
}

.history-item-redo {
  opacity: 0.6;
}

.history-item-redo:hover {
  opacity: 0.8;
  background: rgba(255, 193, 7, 0.05);
  border-left-color: rgba(255, 193, 7, 0.3);
}

.history-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(95, 149, 255, 0.1);
  color: #5F95FF;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.history-item-current .history-item-icon {
  background: #5F95FF;
  color: white;
}

.history-item-redo .history-item-icon {
  background: rgba(255, 193, 7, 0.1);
  color: #ff9800;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  word-break: break-word;
}

.history-item-time {
  font-size: 11px;
  color: #999;
}

.history-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin: 4px 0;
  font-size: 11px;
  color: #999;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.history-divider span {
  background: white;
  padding: 0 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-panel {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>