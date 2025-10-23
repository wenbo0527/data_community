<template>
  <div v-if="!readonly" class="canvas-toolbar">
    <!-- 缩放控制工具栏 -->
    <a-button-group>
      <a-button @click="zoomIn" size="small" title="放大 (Ctrl++)">
        <template #icon><icon-plus /></template>
      </a-button>
      <a-button @click="zoomOut" size="small" title="缩小 (Ctrl-)">
        <template #icon><icon-minus /></template>
      </a-button>
      <a-button @click="resetZoom" size="small" title="重置缩放 (Ctrl+0)">
        <template #icon><icon-refresh /></template>
        {{ scaleDisplayText }}
      </a-button>
      <a-button @click="fitToContent" size="small" title="适应内容 (Ctrl+F)">
        <template #icon><icon-fullscreen /></template>
      </a-button>
    </a-button-group>

    <!-- 拖拽模式控制工具栏 -->
    <a-button-group style="margin-left: 8px;">
      <a-button @click="setDragMode('default')" size="small"
        :type="currentDragMode === 'default' ? 'primary' : 'secondary'" title="默认拖拽模式 (1)">
        <template #icon><icon-drag-dot /></template>
        默认
      </a-button>
      <a-button @click="setDragMode('precise')" size="small"
        :type="currentDragMode === 'precise' ? 'primary' : 'secondary'" title="精确拖拽模式 (2)">
        <template #icon><icon-location /></template>
        精确
      </a-button>
      <a-button @click="setDragMode('fast')" size="small" :type="currentDragMode === 'fast' ? 'primary' : 'secondary'"
        title="快速拖拽模式 (3)">
        <template #icon><icon-thunderbolt /></template>
        快速
      </a-button>
    </a-button-group>

    <a-button-group style="margin-left: 8px;">
      <!-- 🎯 统一结构化布局按钮 -->
      <a-button @click="applyUnifiedStructuredLayout" size="small" type="primary" :loading="isApplyingLayout">
        <template #icon><icon-sort /></template>
        统一布局
      </a-button>
      
      <!-- 布局方向切换按钮 -->
      <a-dropdown @select="handleLayoutDirectionChange">
        <a-button size="small" :type="currentLayoutDirection === 'TB' ? 'primary' : 'secondary'">
          <template #icon><icon-swap /></template>
          {{ currentLayoutDirection === 'TB' ? '从上到下' : '从左到右' }}
        </a-button>
        <template #content>
          <a-doption value="TB" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'TB' }">
            <icon-down style="margin-right: 8px;" />
            从上到下
          </a-doption>
          <a-doption value="LR" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'LR' }">
            <icon-right style="margin-right: 8px;" />
            从左到右
          </a-doption>
        </template>
      </a-dropdown>
      
      <!-- 小地图控制按钮 -->
      <a-button @click="toggleMinimap" size="small" :type="showMinimap ? 'primary' : 'secondary'">
        <template #icon><icon-eye /></template>
        预览图
      </a-button>
      
      <a-button @click="clearCanvas" size="small" status="danger">
        <template #icon><icon-delete /></template>
        清空画布
      </a-button>
      
      <!-- 撤销重做按钮 -->
      <a-button @click="undo" size="small" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <template #icon><icon-up /></template>
        撤销
      </a-button>
      <a-button @click="redo" size="small" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <template #icon><icon-down /></template>
        重做
      </a-button>
      
      <!-- 历史面板按钮 -->
      <a-button @click="toggleHistoryPanel" size="small" :type="showHistoryPanel ? 'primary' : 'secondary'" title="操作历史">
        <template #icon><icon-history /></template>
        历史
      </a-button>
      
      <!-- 导出图片按钮 -->
      <a-dropdown @select="handleExport">
        <a-button size="small">
          <template #icon><icon-download /></template>
          导出图片
        </a-button>
        <template #content>
          <a-doption value="png">导出PNG</a-doption>
          <a-doption value="jpg">导出JPG</a-doption>
          <a-doption value="svg">导出SVG</a-doption>
        </template>
      </a-dropdown>
      
      <!-- 调试功能按钮 -->
      <a-button @click="toggleDebugPanel" size="small" :type="showDebugPanel ? 'primary' : 'secondary'" title="调试功能">
        <template #icon><icon-bug /></template>
        调试
      </a-button>
    </a-button-group>
  </div>
</template>

<script setup>
import { 
  IconMinus, 
  IconPlus, 
  IconRefresh, 
  IconFullscreen,
  IconDragDot,
  IconLocation,
  IconThunderbolt,
  IconSort,
  IconSwap,
  IconDown,
  IconRight,
  IconEye,
  IconDelete,
  IconUp,
  IconHistory,
  IconDownload,
  IconBug
} from '@arco-design/web-vue/es/icon'

// Props定义
const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  },
  scaleDisplayText: {
    type: String,
    default: '100%'
  },
  currentDragMode: {
    type: String,
    default: 'default'
  },
  isApplyingLayout: {
    type: Boolean,
    default: false
  },
  currentLayoutDirection: {
    type: String,
    default: 'TB'
  },
  showMinimap: {
    type: Boolean,
    default: false
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  showHistoryPanel: {
    type: Boolean,
    default: false
  },
  showDebugPanel: {
    type: Boolean,
    default: false
  }
})

// Emits定义
const emit = defineEmits([
  'zoom-in',
  'zoom-out', 
  'reset-zoom',
  'fit-to-content',
  'set-drag-mode',
  'apply-unified-structured-layout',
  'layout-direction-change',
  'toggle-minimap',
  'clear-canvas',
  'undo',
  'redo',
  'toggle-history-panel',
  'export',
  'toggle-debug-panel'
])

// 事件处理方法
const zoomIn = () => {
  emit('zoom-in')
}

const zoomOut = () => {
  emit('zoom-out')
}

const resetZoom = () => {
  emit('reset-zoom')
}

const fitToContent = () => {
  emit('fit-to-content')
}

const setDragMode = (mode) => {
  emit('set-drag-mode', mode)
}

const applyUnifiedStructuredLayout = () => {
  emit('apply-unified-structured-layout')
}

const handleLayoutDirectionChange = (direction) => {
  emit('layout-direction-change', direction)
}

const toggleMinimap = () => {
  emit('toggle-minimap')
}

const clearCanvas = () => {
  emit('clear-canvas')
}

const undo = () => {
  emit('undo')
}

const redo = () => {
  emit('redo')
}

const toggleHistoryPanel = () => {
  emit('toggle-history-panel')
}

const handleExport = (format) => {
  emit('export', format)
}

const toggleDebugPanel = () => {
  emit('toggle-debug-panel')
}
</script>

<style scoped>
.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 缩放按钮样式优化 */
.canvas-toolbar .arco-btn-group .arco-btn {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.canvas-toolbar .arco-btn-group .arco-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 缩放比例显示样式 */
.canvas-toolbar .arco-btn-group .arco-btn:has(.zoom-percentage) {
  min-width: 80px;
  font-weight: 500;
}

/* 拖拽模式按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[type="primary"] {
  background: linear-gradient(135deg, #5F95FF, #4080FF);
  border-color: #5F95FF;
  color: white;
  font-weight: 600;
}

.canvas-toolbar .arco-btn-group .arco-btn[type="primary"]:hover {
  background: linear-gradient(135deg, #4080FF, #3366FF);
  border-color: #4080FF;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(95, 149, 255, 0.3);
}

/* 拖拽模式按钮图标样式 */
.canvas-toolbar .arco-btn-group .arco-btn .arco-icon {
  margin-right: 4px;
  font-size: 14px;
}
</style>