<template>
  <div v-if="!readonly" class="canvas-toolbar">
    <a-button-group v-if="showZoom">
      <a-dropdown @select="handleZoomSelect" position="bottom">
        <a-button size="small" title="缩放比例">
          <template #icon><icon-zoom-in /></template>
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
        <template #icon><icon-fullscreen /></template>
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
        <template #icon><icon-thunderbolt /></template>
        快速布局
      </a-button>
      <a-button @click="onToggleMinimapClick($event)" size="small" :type="showMinimap ? 'primary' : 'secondary'">
        <template #icon><icon-eye /></template>
        小地图
      </a-button>
      <a-dropdown v-if="showLayoutDirection" @select="handleLayoutDirectionChange">
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
    </a-button-group>

    <a-button-group v-if="showMinimapToggle" style="margin-left: 8px;">
      <a-button @click="onToggleMinimapClick($event)" size="small" :type="showMinimap ? 'primary' : 'secondary'">
        <template #icon><icon-eye /></template>
        预览图
      </a-button>
    </a-button-group>

    <a-button-group v-if="showExtras" style="margin-left: 8px;">
      <a-button v-if="showClear" @click="clearCanvas" size="small" status="danger">
        <template #icon><icon-delete /></template>
        清空画布
      </a-button>
      <a-button v-if="showUndoRedo" @click="undo" size="small" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <template #icon><icon-up /></template>
        撤销
      </a-button>
      <a-button v-if="showUndoRedo" @click="redo" size="small" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <template #icon><icon-down /></template>
        重做
      </a-button>
      <a-button v-if="showHistory" @click="toggleHistoryPanel" size="small" :type="showHistoryPanel ? 'primary' : 'secondary'" title="操作历史">
        <template #icon><icon-history /></template>
        历史
      </a-button>
      <a-button v-if="showStatistics" @click="toggleStatisticsPanel" size="small" :type="showStatisticsPanel ? 'primary' : 'secondary'" title="统计信息">
        <template #icon><icon-bar-chart /></template>
        统计
      </a-button>
      <a-dropdown v-if="showExport" @select="handleExport">
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
      <a-button v-if="showDebug" @click="toggleDebugPanel" size="small" :type="showDebugPanel ? 'primary' : 'secondary'" title="调试功能">
        <template #icon><icon-bug /></template>
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

const props = defineProps({
  readonly: { type: Boolean, default: false },
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
  scaleDisplayText: { type: String, default: '100%' },
  currentDragMode: { type: String, default: 'default' },
  isApplyingLayout: { type: Boolean, default: false },
  currentLayoutDirection: { type: String, default: 'TB' },
  showMinimap: { type: Boolean, default: false },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  showHistoryPanel: { type: Boolean, default: false },
  showStatisticsPanel: { type: Boolean, default: false },
  showDebugPanel: { type: Boolean, default: false },
  showStatistics: { type: Boolean, default: false }
})

const emit = defineEmits([
  'zoom-in','zoom-out','reset-zoom','set-zoom','fit-to-content','fit-content','set-drag-mode','apply-quick-layout','apply-unified-structured-layout','apply-layout','layout-direction-change','toggle-minimap','clear-canvas','undo','redo','toggle-history-panel','toggle-statistics-panel','export','toggle-debug-panel','add-node'
])

const zoomIn = () => { emit('zoom-in') }
const zoomOut = () => { emit('zoom-out') }
const resetZoom = () => { emit('reset-zoom') }
const fitToContent = () => { emit('fit-to-content'); emit('fit-content') }
const setDragMode = (m) => { emit('set-drag-mode', m) }
const applyQuickLayout = () => { emit('apply-quick-layout') }
const applyUnifiedStructuredLayout = () => { emit('apply-unified-structured-layout'); emit('apply-layout') }
const handleLayoutDirectionChange = (d) => { emit('layout-direction-change', d) }
const onToggleMinimapClick = (e) => { try { const rect = e?.currentTarget?.getBoundingClientRect?.(); emit('toggle-minimap', { anchorRect: rect }) } catch { emit('toggle-minimap') } }
const clearCanvas = () => { emit('clear-canvas') }
const undo = () => { emit('undo') }
const redo = () => { emit('redo') }
const toggleHistoryPanel = () => { emit('toggle-history-panel') }
const toggleStatisticsPanel = (e) => { try { const rect = e?.currentTarget?.getBoundingClientRect?.(); emit('toggle-statistics-panel', { anchorRect: rect }) } catch { emit('toggle-statistics-panel') } }
const handleExport = (f) => { emit('export', f) }
const toggleDebugPanel = () => { emit('toggle-debug-panel') }
const handleZoomSelect = (v) => {
  switch (v) {
    case '50':
    case '75':
    case '100':
    case '125':
    case '150':
    case '200':
      emit('set-zoom', parseInt(v) / 100)
      break
    case 'fit':
      emit('fit-content')
      break
    case 'reset':
      emit('reset-zoom')
      break
  }
}
const onAddNodeClick = (e) => { try { const rect = e?.currentTarget?.getBoundingClientRect?.(); emit('add-node', { anchorRect: rect }) } catch { emit('add-node') } }
</script>

<style scoped>
.canvas-toolbar { position: relative; display: flex; gap: 12px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-radius: 12px; padding: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) }
.canvas-toolbar:hover { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); transform: translateY(-2px) }
.canvas-toolbar .arco-btn-group { display: flex; gap: 2px }
.canvas-toolbar .arco-btn-group .arco-btn { border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 500; border: 1px solid rgba(226, 232, 240, 0.8); background: rgba(255, 255, 255, 0.9); color: #475569; min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center }
.canvas-toolbar .arco-btn-group .arco-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); background: rgba(255, 255, 255, 1); border-color: #cbd5e1; color: #1e293b }
.canvas-toolbar .arco-btn-group .arco-btn:active { transform: translateY(0); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) }
.canvas-toolbar .arco-btn-group .arco-btn:has(.zoom-percentage) { min-width: 80px; font-weight: 600; color: #1e293b; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) }
.canvas-toolbar .arco-btn-group .arco-btn[type="primary"] { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-color: #3b82f6; color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) }
.canvas-toolbar .arco-btn-group .arco-btn[type="primary"]:hover { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4) }
.canvas-toolbar .arco-btn-group .arco-btn[type="secondary"] { background: rgba(241, 245, 249, 0.8); border-color: rgba(226, 232, 240, 0.8); color: #64748b }
.canvas-toolbar .arco-btn-group .arco-btn[type="secondary"]:hover { background: rgba(241, 245, 249, 1) }
</style>
