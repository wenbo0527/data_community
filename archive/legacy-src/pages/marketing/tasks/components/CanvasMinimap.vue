<template>
  <div 
    v-show="visible" 
    ref="minimapContainer" 
    class="minimap-container"
    :class="{ 'minimap-collapsed': collapsed }"
  >
    <div class="minimap-header">
      <span class="minimap-title">预览图</span>
      <div class="minimap-controls">
        <a-button 
          size="mini" 
          type="text" 
          @click="toggleCollapse"
          :title="collapsed ? '展开预览图' : '收起预览图'"
        >
          <template #icon>
            <IconUp v-if="!collapsed" />
            <IconDown v-else />
          </template>
        </a-button>
        <a-button 
          size="mini" 
          type="text" 
          @click="closeMinimap"
          title="关闭预览图"
        >
          <template #icon><IconClose /></template>
        </a-button>
      </div>
    </div>
    <div v-show="!collapsed" class="minimap-content" ref="minimapContent"></div>
  </div>
</template>

<script>
import {
  IconUp,
  IconDown,
  IconClose
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'CanvasMinimap',
  components: {
    IconUp,
    IconDown,
    IconClose
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'toggle-collapse',
    'close',
    'update:collapsed'
  ],
  methods: {
    toggleCollapse() {
      this.$emit('update:collapsed', !this.collapsed)
      this.$emit('toggle-collapse')
    },
    closeMinimap() {
      this.$emit('close')
    },
    getMinimapContainer() {
      return this.$refs.minimapContainer
    },
    getMinimapContent() {
      return this.$refs.minimapContent
    }
  }
}
</script>

<style scoped>
.minimap-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.minimap-container.collapsed .minimap-content {
  height: 0;
  opacity: 0;
}

.minimap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(95, 149, 255, 0.1);
  border-bottom: 1px solid rgba(95, 149, 255, 0.2);
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.minimap-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.minimap-controls {
  display: flex;
  gap: 4px;
}

.minimap-controls .arco-btn {
  padding: 2px 4px;
  min-width: auto;
  height: 20px;
  font-size: 12px;
}

.minimap-content {
  padding: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.minimap-content > div {
  border-radius: 4px;
  overflow: hidden;
}

/* 小地图内部样式覆盖 */
:deep(.x6-widget-minimap) {
  border: none !important;
  border-radius: 4px;
}

:deep(.x6-widget-minimap-viewport) {
  border: 2px solid #5F95FF !important;
  border-radius: 2px;
}

:deep(.x6-widget-minimap-viewport-zoom) {
  border: 2px solid #ff6b6b !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .minimap-container {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>