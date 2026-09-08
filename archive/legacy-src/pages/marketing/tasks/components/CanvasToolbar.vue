<template>
  <div v-if="!readonly" class="canvas-toolbar">
    <a-button-group v-if="showZoom">
      <a-dropdown @select="handleZoomSelect" position="bottom">
        <a-button size="small" title="缩放比例">
          <template #icon><IconZoomIn /></template>
          {{ scaleDisplayText }}
        </a-button>
        <template #content>
          <a-doption value="50">50%</a-doption>
          <a-doption value="75">75%</a-doption>
          <a-doption value="100">100%</a-doption>
          <a-doption value="125">125%</a-doption>
          <a-doption value="150">150%</a-doption>
          <a-doption value="200">200%</a-doption>
          <a-divider />
          <a-doption value="fit">适应内容</a-doption>
          <a-doption value="reset">重置缩放</a-doption>
        </template>
      </a-dropdown>
      <a-button @click="fitToContent" size="small" title="适应内容 (Ctrl+F)">
        <template #icon><IconFullscreen /></template>
      </a-button>
    </a-button-group>

    <a-button-group v-if="showAddNode" style="margin-left: 8px;">
      <a-button @click="onAddNodeClick($event)" size="small" type="primary">
        <template #icon><icon-plus /></template>
        添加节点
      </a-button>
    </a-button-group>

    <a-button-group v-if="showLayout" style="margin-left: 8px;">
      <a-button @click="applyQuickLayout" size="small" type="primary" :loading="isApplyingLayout">
        <template #icon><icon-lightning /></template>
        快速布局
      </a-button>
      <a-button @click="onToggleMinimapClick($event)" size="small" :type="showMinimap ? 'primary' : 'secondary'">
        <template #icon><IconEye /></template>
        小地图
      </a-button>
      <a-dropdown v-if="showLayoutDirection" @select="handleLayoutDirectionChange">
        <a-button size="small" :type="currentLayoutDirection === 'TB' ? 'primary' : 'secondary'">
          <template #icon><IconSwap /></template>
          {{ currentLayoutDirection === 'TB' ? '从上到下' : '从左到右' }}
        </a-button>
        <template #content>
          <a-doption value="TB" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'TB' }">
            <IconDown style="margin-right: 8px;" />
            从上到下
          </a-doption>
          <a-doption value="LR" :class="{ 'arco-dropdown-option-selected': currentLayoutDirection === 'LR' }">
            <IconRight style="margin-right: 8px;" />
            从左到右
          </a-doption>
        </template>
      </a-dropdown>
    </a-button-group>

    <a-button-group v-if="showMinimapToggle" style="margin-left: 8px;">
      <a-button @click="onToggleMinimapClick($event)" size="small" :type="showMinimap ? 'primary' : 'secondary'">
        <template #icon><IconEye /></template>
        预览图
      </a-button>
    </a-button-group>

    <a-button-group v-if="showExtras" style="margin-left: 8px;">
      <a-button v-if="showClear" @click="clearCanvas" size="small" status="danger">
        <template #icon><IconDelete /></template>
        清空画布
      </a-button>
      <a-button v-if="showUndoRedo" @click="undo" size="small" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <template #icon><IconUp /></template>
        撤销
      </a-button>
      <a-button v-if="showUndoRedo" @click="redo" size="small" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <template #icon><IconDown /></template>
        重做
      </a-button>
      <a-button v-if="showHistory" @click="toggleHistoryPanel" size="small" :type="showHistoryPanel ? 'primary' : 'secondary'" title="操作历史">
        <template #icon><IconHistory /></template>
        历史
      </a-button>
      <a-button v-if="showStatistics" @click="toggleStatisticsPanel" size="small" :type="showStatisticsPanel ? 'primary' : 'secondary'" title="统计信息">
        <template #icon><IconBarChart /></template>
        统计
      </a-button>
      <a-dropdown v-if="showExport" @select="handleExport">
        <a-button size="small">
          <template #icon><IconDownload /></template>
          导出图片
        </a-button>
        <template #content>
          <a-doption value="png">导出PNG</a-doption>
          <a-doption value="jpg">导出JPG</a-doption>
          <a-doption value="svg">导出SVG</a-doption>
        </template>
      </a-dropdown>
      <a-button v-if="showDebug" @click="toggleDebugPanel" size="small" :type="showDebugPanel ? 'primary' : 'secondary'" title="调试功能">
        <template #icon><IconBug /></template>
        调试
      </a-button>
    </a-button-group>
  </div>
</template>

<script setup>
import { 
  IconZoomIn,
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
  IconBug,
  IconBarChart
} from '@arco-design/web-vue/es/icon'

// Props定义
const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  },
  showZoom: { type: Boolean, default: true },
  showAddNode: { type: Boolean, default: false },
  showLayout: { type: Boolean, default: true },
  showLayoutDirection: { type: Boolean, default: true },
  showMinimapToggle: { type: Boolean, default: true },
  showExtras: { type: Boolean, default: true },
  showClear: { type: Boolean, default: true },
  showUndoRedo: { type: Boolean, default: true },
  showHistory: { type: Boolean, default: true },
  showExport: { type: Boolean, default: true },
  showDebug: { type: Boolean, default: true },
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
  showStatisticsPanel: {
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
  'set-zoom',
  'fit-to-content',
  'fit-content',
  'set-drag-mode',
  'apply-quick-layout',
  'apply-unified-structured-layout',
  'apply-layout',
  'layout-direction-change',
  'toggle-minimap',
  'clear-canvas',
  'undo',
  'redo',
  'toggle-history-panel',
  'toggle-statistics-panel',
  'export',
  'toggle-debug-panel',
  'add-node'
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
  emit('fit-content')
}

const setDragMode = (mode) => {
  emit('set-drag-mode', mode)
}

const applyQuickLayout = () => {
  emit('apply-quick-layout')
}

const applyUnifiedStructuredLayout = () => {
  emit('apply-unified-structured-layout')
  emit('apply-layout')
}

const handleLayoutDirectionChange = (direction) => {
  emit('layout-direction-change', direction)
}

const onToggleMinimapClick = (e) => {
  try {
    const rect = e?.currentTarget?.getBoundingClientRect?.()
    emit('toggle-minimap', { anchorRect: rect })
  } catch {
    emit('toggle-minimap')
  }
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

const toggleStatisticsPanel = () => {
  emit('toggle-statistics-panel')
}

const handleExport = (format) => {
  emit('export', format)
}

const toggleDebugPanel = () => {
  emit('toggle-debug-panel')
}

const handleZoomSelect = (value) => {
  switch (value) {
    case '50':
    case '75':
    case '100':
    case '125':
    case '150':
    case '200':
      // 设置具体缩放比例
      emit('set-zoom', parseInt(value) / 100)
      break
    case 'fit':
      // 适应内容
      emit('fit-content')
      break
    case 'reset':
      // 重置缩放
      emit('reset-zoom')
      break
  }
}

const onAddNodeClick = (e) => {
  try {
    const rect = e?.currentTarget?.getBoundingClientRect?.()
    emit('add-node', { anchorRect: rect })
  } catch {
    emit('add-node')
  }
}
</script>

<style scoped>
.canvas-toolbar {
  position: relative;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.canvas-toolbar:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 按钮组样式 */
.canvas-toolbar .arco-btn-group {
  display: flex;
  gap: 2px;
}

/* 缩放按钮样式优化 */
.canvas-toolbar .arco-btn-group .arco-btn {
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-toolbar .arco-btn-group .arco-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
  border-color: #cbd5e1;
  color: #1e293b;
}

.canvas-toolbar .arco-btn-group .arco-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 缩放比例显示样式 */
.canvas-toolbar .arco-btn-group .arco-btn:has(.zoom-percentage) {
  min-width: 80px;
  font-weight: 600;
  color: #1e293b;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

/* 主要操作按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[type="primary"] {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.canvas-toolbar .arco-btn-group .arco-btn[type="primary"]:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* 次要操作按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[type="secondary"] {
  background: rgba(241, 245, 249, 0.8);
  border-color: rgba(226, 232, 240, 0.8);
  color: #64748b;
}

.canvas-toolbar .arco-btn-group .arco-btn[type="secondary"]:hover {
  background: rgba(241, 245, 249, 1);
  border-color: #cbd5e1;
  color: #475569;
}

/* 危险操作按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[status="danger"] {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #ef4444;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.canvas-toolbar .arco-btn-group .arco-btn[status="danger"]:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: #dc2626;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

/* 禁用状态按钮样式 */
.canvas-toolbar .arco-btn-group .arco-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 按钮图标样式 */
.canvas-toolbar .arco-btn-group .arco-btn .arco-icon {
  margin-right: 4px;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.canvas-toolbar .arco-btn-group .arco-btn:hover .arco-icon {
  transform: scale(1.1);
}

/* 下拉菜单样式 */
.canvas-toolbar :deep(.arco-dropdown) {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.canvas-toolbar :deep(.arco-dropdown-option) {
  border-radius: 6px;
  margin: 2px;
  transition: all 0.2s ease;
}

.canvas-toolbar :deep(.arco-dropdown-option:hover) {
  background: rgba(241, 245, 249, 0.8);
}

.canvas-toolbar :deep(.arco-dropdown-option-selected) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .canvas-toolbar {
    flex-wrap: wrap;
    max-width: 280px;
    right: 12px;
    top: 12px;
  }
  
  .canvas-toolbar .arco-btn-group .arco-btn {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

/* 动画效果 */
@keyframes toolbarSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.canvas-toolbar {
  animation: toolbarSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
const onAddNodeClick = (e) => {
  const rect = e?.currentTarget?.getBoundingClientRect?.()
  emit('add-node', { anchorRect: rect })
}
// 兼容宿主与子应用用法：内部模板使用了 showStatistics
// 增加缺失的 props，避免渲染警告
const propsCompat = defineProps({
  showStatistics: { type: Boolean, default: false }
})
