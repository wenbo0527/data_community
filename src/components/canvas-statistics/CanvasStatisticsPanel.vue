<template>
  <div 
    class="canvas-statistics-panel"
    :class="{ 'collapsed': isCollapsed }"
    :style="{ width: panelWidth + 'px' }"
  >
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="panel-title">
        <icon-bar-chart class="title-icon" />
        <span>统计信息</span>
      </div>
      <div class="panel-controls">
        <a-button 
          type="text" 
          size="mini"
          @click="toggleCollapse"
        >
          <icon-minus v-if="!isCollapsed" />
          <icon-plus v-else />
        </a-button>
        <div class="resize-handle" @mousedown="startResize"></div>
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content" v-show="!isCollapsed">
      <!-- 数据筛选控制 -->
      <data-filter-controls 
        v-model="filters"
        @change="handleFiltersUpdate"
      />

      <!-- 统计概览 -->
      <statistics-overview 
        :canvas-id="canvasId"
        :filters="filters"
        :loading="loading"
      />

      <!-- 用户路径分析 -->
      <user-path-analyzer
        :canvas-id="canvasId"
        :filters="filters"
        @path-highlight="handlePathHighlight"
      />

      <!-- 节点统计列表 -->
      <node-statistics-list
        :canvas-id="canvasId"
        :filters="filters"
        :loading="loading"
        @node-select="handleNodeSelect"
      />

      <!-- 图表展示区域 -->
      <chart-display-area
        :canvas-id="canvasId"
        :filters="filters"
        :selected-nodes="selectedNodes"
        :loading="loading"
      />

      <!-- 数据导出面板 -->
      <data-export-panel
        :canvas-id="canvasId"
        :filters="filters"
        :export-data="exportData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { IconBarChart, IconMinus, IconPlus } from '@arco-design/web-vue/es/icon'
import DataFilterControls from './DataFilterControls.vue'
import StatisticsOverview from './StatisticsOverview.vue'
import UserPathAnalyzer from './UserPathAnalyzer.vue'
import NodeStatisticsList from './NodeStatisticsList.vue'
import ChartDisplayArea from './ChartDisplayArea.vue'
import DataExportPanel from './DataExportPanel.vue'

interface Props {
  canvasId: string
  graph?: any
  focusNodeId?: string
}

interface FilterState {
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'custom'
  dateFrom?: string
  dateTo?: string
  nodeType?: string[]
  userGroup?: string[]
}

const props = withDefaults(defineProps<Props>(), { focusNodeId: '' })

// 面板状态
const isCollapsed = ref(false)
const panelWidth = ref(400)
const minWidth = 320
const maxWidth = 800
const loading = ref(false)

// 筛选条件
const filters = ref<FilterState>({
  timeRange: 'day'
})

const selectedNodes = ref<string[]>([])

// 导出数据
const exportData = ref({})

// 拖拽调整宽度
let isResizing = false
let startX = 0
let startWidth = 0

const startResize = (event: MouseEvent) => {
  isResizing = true
  startX = event.clientX
  startWidth = panelWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  event.preventDefault()
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing) return
  
  const deltaX = startX - event.clientX
  const newWidth = startWidth + deltaX
  
  panelWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth))
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 处理筛选条件更新
const handleFiltersUpdate = (newFilters: FilterState) => {
  Object.assign(filters.value, newFilters)
  // 触发数据重新加载
  loadStatisticsData()
}

// 处理节点选择
const handleNodeSelect = (nodeIds: string[]) => {
  selectedNodes.value = nodeIds
}

// 处理路径高亮
const handlePathHighlight = (pathData: any) => {
  // 处理用户路径高亮逻辑
  console.log('Path highlight:', pathData)
}

// 加载统计数据
const loadStatisticsData = async () => {
  loading.value = true
  try {
    // 这里调用API获取统计数据
    console.log('Loading statistics data with filters:', filters.value)
    // TODO: 实现API调用
  } catch (error) {
    console.error('Failed to load statistics data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatisticsData()
})

watch(() => props.focusNodeId, (nv: string | undefined) => {
  const id = String(nv || '')
  selectedNodes.value = id ? [id] : []
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.canvas-statistics-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s ease;

  &.collapsed {
    width: 40px !important;
    
    .panel-header {
      padding: 8px 4px;
      
      .panel-title span {
        display: none;
      }
    }
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  
  .title-icon {
    font-size: 18px;
    color: #1890ff;
  }
}

.panel-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resize-handle {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: transparent;
  
  &:hover {
    background: rgba(24, 144, 255, 0.1);
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 自定义滚动条
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  
  &:hover {
    background: #a8a8a8;
  }
}
</style>
