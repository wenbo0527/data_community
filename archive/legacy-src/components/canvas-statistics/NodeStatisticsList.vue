<template>
  <div class="node-statistics-list">
    <div class="section-header">
      <div class="section-title">
        <IconUnorderedList />
        <span>节点统计</span>
      </div>
      <div class="section-actions">
        <a-space>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索节点"
            size="mini"
            style="width: 120px"
            @search="handleSearch"
          />
          <a-select
            v-model="sortBy"
            placeholder="排序方式"
            size="mini"
            style="width: 100px"
            @change="handleSortChange"
          >
            <a-option value="visits">访问量</a-option>
            <a-option value="conversions">转化数</a-option>
            <a-option value="stayTime">停留时长</a-option>
            <a-option value="conversionRate">转化率</a-option>
          </a-select>
          <a-button 
            type="text" 
            size="mini"
            @click="toggleViewMode"
          >
            <IconApps v-if="viewMode === 'list'" />
            <IconUnorderedList v-else />
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 节点统计列表 -->
    <div class="nodes-container" v-if="viewMode === 'list'">
      <div class="nodes-list">
        <div 
          v-for="node in paginatedNodes" 
          :key="node.nodeId"
          class="node-item"
          :class="{ 'selected': selectedNodes.includes(node.nodeId) }"
          @click="selectNode(node.nodeId)"
          @mouseenter="showNodeTooltip(node)"
          @mouseleave="hideNodeTooltip"
        >
          <div class="node-header">
            <div class="node-info">
              <div class="node-icon" :class="node.nodeType">
                <component :is="getNodeIcon(node.nodeType)" />
              </div>
              <div class="node-details">
                <div class="node-name">{{ node.nodeLabel }}</div>
                <div class="node-type">{{ getNodeTypeLabel(node.nodeType) }}</div>
              </div>
            </div>
            <div class="node-metrics">
              <div class="metric">
                <span class="metric-label">访问量</span>
                <span class="metric-value">{{ formatNumber(node.enterCount) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">转化率</span>
                <span class="metric-value">{{ node.conversionRate }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">停留</span>
                <span class="metric-value">{{ formatDuration(node.avgStayTime) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div class="node-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: node.conversionRate + '%' }"
                :class="getProgressClass(node.conversionRate)"
              ></div>
            </div>
            <span class="progress-text">{{ node.conversionRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 网格视图 -->
    <div class="nodes-grid" v-else>
      <a-row :gutter="12">
        <a-col :span="12" v-for="node in paginatedNodes" :key="node.nodeId">
          <div 
            class="node-card"
            :class="{ 'selected': selectedNodes.includes(node.nodeId) }"
            @click="selectNode(node.nodeId)"
            @mouseenter="showNodeTooltip(node)"
            @mouseleave="hideNodeTooltip"
          >
            <div class="card-header">
              <div class="node-icon" :class="node.nodeType">
                <component :is="getNodeIcon(node.nodeType)" />
              </div>
              <div class="card-title">
                <div class="node-name">{{ node.nodeLabel }}</div>
                <div class="node-type">{{ getNodeTypeLabel(node.nodeType) }}</div>
              </div>
            </div>
            
            <div class="card-stats">
              <div class="stat-item">
                <div class="stat-label">访问量</div>
                <div class="stat-value">{{ formatNumber(node.enterCount) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">转化率</div>
                <div class="stat-value">{{ node.conversionRate }}%</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">停留</div>
                <div class="stat-value">{{ formatDuration(node.avgStayTime) }}</div>
              </div>
            </div>
            
            <div class="card-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: node.conversionRate + '%' }"
                  :class="getProgressClass(node.conversionRate)"
                ></div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="filteredNodes.length"
        :page-size-options="[10, 20, 50, 100]"
        size="small"
        show-total
        show-jumper
        @change="handlePageChange"
      />
    </div>

    <!-- 节点详情悬浮卡片 -->
    <teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="node-tooltip"
        :style="{ 
          left: tooltip.x + 'px', 
          top: tooltip.y + 'px' 
        }"
      >
        <div class="tooltip-header">
          <div class="node-name">{{ tooltip.node?.nodeLabel }}</div>
          <a-button 
            type="text" 
            size="mini"
            @click="hideNodeTooltip"
          >
            <IconClose />
          </a-button>
        </div>
        
        <div class="tooltip-content">
          <div class="tooltip-stat">
            <span class="stat-label">进入人数</span>
            <span class="stat-value">{{ formatNumber(tooltip.node?.enterCount || 0) }}</span>
          </div>
          <div class="tooltip-stat">
            <span class="stat-label">离开人数</span>
            <span class="stat-value">{{ formatNumber(tooltip.node?.exitCount || 0) }}</span>
          </div>
          <div class="tooltip-stat">
            <span class="stat-label">转化率</span>
            <span class="stat-value">{{ tooltip.node?.conversionRate }}%</span>
          </div>
          <div class="tooltip-stat">
            <span class="stat-label">平均停留</span>
            <span class="stat-value">{{ formatDuration(tooltip.node?.avgStayTime || 0) }}</span>
          </div>
          <div class="tooltip-stat">
            <span class="stat-label">最大停留</span>
            <span class="stat-value">{{ formatDuration(tooltip.node?.maxStayTime || 0) }}</span>
          </div>
          <div class="tooltip-stat">
            <span class="stat-label">最小停留</span>
            <span class="stat-value">{{ formatDuration(tooltip.node?.minStayTime || 0) }}</span>
          </div>
        </div>
        
        <div class="tooltip-actions">
          <a-button 
            type="primary" 
            size="mini"
            @click="viewNodeDetails(tooltip.node?.nodeId)"
          >
            查看详情
          </a-button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { 
  IconApps, 
  IconUnorderedList,
  IconClose,
  IconPlayCircle,
  IconPauseCircle,
  IconStop,
  IconSend,
  IconUser,
  IconClockCircle,
  IconCheckCircle,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon'

interface NodeStats {
  nodeId: string
  nodeType: string
  nodeLabel: string
  position: { x: number; y: number }
  enterCount: number
  exitCount: number
  conversionRate: number
  avgStayTime: number
  maxStayTime: number
  minStayTime: number
  uniqueUsers: number
  trend: any[]
}

interface Props {
  canvasId: string
  filters: any
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['node-select', 'update:loading'])

// 搜索和排序状态
const searchKeyword = ref('')
const sortBy = ref('visits')
const sortOrder = ref<'asc' | 'desc'>('desc')
const viewMode = ref<'list' | 'grid'>('list')
const currentPage = ref(1)
const pageSize = ref(20)

// 选中的节点
const selectedNodes = ref<string[]>([])

// 悬浮提示
const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null as NodeStats | null
})

// 模拟节点数据
const nodesData = ref<NodeStats[]>([
  {
    nodeId: 'node1',
    nodeType: 'start',
    nodeLabel: '开始节点',
    position: { x: 100, y: 100 },
    enterCount: 8500,
    exitCount: 8500,
    conversionRate: 100.0,
    avgStayTime: 2,
    maxStayTime: 10,
    minStayTime: 1,
    uniqueUsers: 8500,
    trend: []
  },
  {
    nodeId: 'node2',
    nodeType: 'condition',
    nodeLabel: '新用户判断',
    position: { x: 200, y: 100 },
    enterCount: 6800,
    exitCount: 6800,
    conversionRate: 80.0,
    avgStayTime: 5,
    maxStayTime: 30,
    minStayTime: 2,
    uniqueUsers: 6800,
    trend: []
  },
  {
    nodeId: 'node3',
    nodeType: 'action',
    nodeLabel: '发送欢迎短信',
    position: { x: 300, y: 50 },
    enterCount: 4200,
    exitCount: 4150,
    conversionRate: 98.8,
    avgStayTime: 8,
    maxStayTime: 45,
    minStayTime: 3,
    uniqueUsers: 4200,
    trend: []
  },
  {
    nodeId: 'node4',
    nodeType: 'delay',
    nodeLabel: '等待1小时',
    position: { x: 300, y: 150 },
    enterCount: 2600,
    exitCount: 2580,
    conversionRate: 99.2,
    avgStayTime: 3600,
    maxStayTime: 3600,
    minStayTime: 3600,
    uniqueUsers: 2600,
    trend: []
  },
  {
    nodeId: 'node5',
    nodeType: 'tag',
    nodeLabel: '添加新用户标签',
    position: { x: 400, y: 100 },
    enterCount: 3420,
    exitCount: 3420,
    conversionRate: 100.0,
    avgStayTime: 3,
    maxStayTime: 15,
    minStayTime: 1,
    uniqueUsers: 3420,
    trend: []
  },
  {
    nodeId: 'node6',
    nodeType: 'end',
    nodeLabel: '结束节点',
    position: { x: 500, y: 100 },
    enterCount: 3420,
    exitCount: 0,
    conversionRate: 0.0,
    avgStayTime: 1,
    maxStayTime: 5,
    minStayTime: 1,
    uniqueUsers: 3420,
    trend: []
  }
])

// 过滤和排序后的节点
const filteredNodes = computed(() => {
  let filtered = nodesData.value
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(node => 
      node.nodeLabel.toLowerCase().includes(keyword) ||
      node.nodeType.toLowerCase().includes(keyword)
    )
  }
  
  // 应用筛选条件
  if (props.filters.nodeType && props.filters.nodeType.length > 0) {
    filtered = filtered.filter(node => 
      props.filters.nodeType.includes(node.nodeType)
    )
  }
  
  // 排序
  filtered.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'visits':
        aValue = a.enterCount
        bValue = b.enterCount
        break
      case 'conversions':
        aValue = Math.floor(a.enterCount * a.conversionRate / 100)
        bValue = Math.floor(b.enterCount * b.conversionRate / 100)
        break
      case 'stayTime':
        aValue = a.avgStayTime
        bValue = b.avgStayTime
        break
      case 'conversionRate':
        aValue = a.conversionRate
        bValue = b.conversionRate
        break
      default:
        return 0
    }
    
    return sortOrder.value === 'desc' ? bValue - aValue : aValue - bValue
  })
  
  return filtered
})

// 分页节点
const paginatedNodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNodes.value.slice(start, end)
})

// 获取节点图标
const getNodeIcon = (nodeType: string) => {
  const icons: Record<string, any> = {
    start: IconPlayCircle,
    end: IconStop,
    condition: IconExclamationCircle,
    action: IconSend,
    delay: IconClockCircle,
    tag: IconCheckCircle,
    sms: IconSend,
    email: IconSend,
    push: IconSend
  }
  return icons[nodeType] || IconApps
}

// 获取节点类型标签
const getNodeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    start: '开始',
    end: '结束',
    condition: '条件',
    action: '动作',
    delay: '延时',
    tag: '标签',
    sms: '短信',
    email: '邮件',
    push: '推送'
  }
  return labels[type] || type
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千'
  }
  return num.toString()
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}时${minutes}分`
  }
}

// 获取进度条样式类
const getProgressClass = (rate: number): string => {
  if (rate >= 80) return 'excellent'
  if (rate >= 60) return 'good'
  if (rate >= 40) return 'fair'
  return 'poor'
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1
}

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

// 处理分页变化
const handlePageChange = () => {
  // 分页变化时的处理
}

// 选择节点
const selectNode = (nodeId: string) => {
  const index = selectedNodes.value.indexOf(nodeId)
  if (index > -1) {
    selectedNodes.value.splice(index, 1)
  } else {
    selectedNodes.value.push(nodeId)
  }
  emit('node-select', selectedNodes.value)
}

// 显示节点悬浮提示
const showNodeTooltip = (node: NodeStats, event?: MouseEvent) => {
  if (!event) return
  
  tooltip.visible = true
  tooltip.node = node
  tooltip.x = event.clientX + 10
  tooltip.y = event.clientY + 10
}

// 隐藏节点悬浮提示
const hideNodeTooltip = () => {
  tooltip.visible = false
  tooltip.node = null
}

// 查看节点详情
const viewNodeDetails = (nodeId?: string) => {
  if (!nodeId) return
  // TODO: 实现查看节点详情逻辑
  console.log('View node details:', nodeId)
  hideNodeTooltip()
}

// 监听筛选条件变化
watch(() => props.filters, () => {
  currentPage.value = 1
  // TODO: 根据筛选条件重新加载数据
}, { deep: true })
</script>

<style scoped lang="scss">
.node-statistics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.nodes-container {
  max-height: 400px;
  overflow-y: auto;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f6ffed;
    border-color: #b7eb8f;
    transform: translateX(2px);
  }
  
  &.selected {
    background: #e6f7ff;
    border-color: #91d5ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  
  &.start { background: #52c41a; }
  &.end { background: #ff4d4f; }
  &.condition { background: #fa8c16; }
  &.action { background: #1890ff; }
  &.delay { background: #722ed1; }
  &.tag { background: #13c2c2; }
  &.sms { background: #eb2f96; }
  &.email { background: #531dab; }
  &.push { background: #f5222d; }
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.node-type {
  font-size: 12px;
  color: #8c8c8c;
}

.node-metrics {
  display: flex;
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  
  .metric-label {
    font-size: 11px;
    color: #8c8c8c;
  }
  
  .metric-value {
    font-size: 13px;
    font-weight: 600;
    color: #262626;
  }
}

.node-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  
  &.excellent { background: #52c41a; }
  &.good { background: #95de64; }
  &.fair { background: #faad14; }
  &.poor { background: #ff4d4f; }
}

.progress-text {
  font-size: 11px;
  color: #8c8c8c;
  min-width: 30px;
  text-align: right;
}

.nodes-grid {
  .node-card {
    padding: 16px;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    
    &:hover {
      background: #f6ffed;
      border-color: #b7eb8f;
      transform: translateY(-2px);
    }
    
    &.selected {
      background: #e6f7ff;
      border-color: #91d5ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .card-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .card-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-label {
      font-size: 11px;
      color: #8c8c8c;
    }
    
    .stat-value {
      font-size: 13px;
      font-weight: 600;
      color: #262626;
    }
  }
  
  .card-progress {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.node-tooltip {
  position: fixed;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 240px;
  
  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .node-name {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
    }
  }
  
  .tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .tooltip-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .stat-label {
      font-size: 12px;
      color: #8c8c8c;
    }
    
    .stat-value {
      font-size: 13px;
      font-weight: 600;
      color: #262626;
    }
  }
  
  .tooltip-actions {
    display: flex;
    justify-content: flex-end;
  }
}

:deep(.arco-pagination) {
  .arco-pagination-item {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
  
  .arco-pagination-jumper {
    height: 28px;
    
    .arco-input-wrapper {
      height: 28px;
    }
  }
}
</style>