<template>
  <div class="data-filter-controls">
    <a-space direction="vertical" :size="12" fill>
      <!-- 时间范围选择 -->
      <div class="filter-section">
        <div class="filter-label">
          <IconCalendar />
          <span>时间范围</span>
        </div>
        <a-radio-group 
          v-model="localFilters.timeRange" 
          type="button"
          size="small"
          @change="handleTimeRangeChange"
        >
          <a-radio value="day">今日</a-radio>
          <a-radio value="week">本周</a-radio>
          <a-radio value="month">本月</a-radio>
          <a-radio value="quarter">本季度</a-radio>
          <a-radio value="custom">自定义</a-radio>
        </a-radio-group>
        
        <!-- 自定义时间范围 -->
        <div v-if="localFilters.timeRange === 'custom'" class="custom-date-range">
          <a-range-picker
            v-model="customDateRange"
            size="small"
            style="width: 100%"
            @change="handleCustomDateChange"
          />
        </div>
      </div>

      <!-- 节点类型筛选 -->
      <div class="filter-section">
        <div class="filter-label">
          <IconApps />
          <span>节点类型</span>
        </div>
        <a-select
          v-model="localFilters.nodeType"
          placeholder="选择节点类型"
          size="small"
          multiple
          allow-clear
          @change="handleFilterChange"
        >
          <a-option value="start">开始节点</a-option>
          <a-option value="end">结束节点</a-option>
          <a-option value="condition">条件节点</a-option>
          <a-option value="action">动作节点</a-option>
          <a-option value="delay">延时节点</a-option>
          <a-option value="tag">标签节点</a-option>
          <a-option value="sms">短信节点</a-option>
          <a-option value="email">邮件节点</a-option>
          <a-option value="push">推送节点</a-option>
        </a-select>
      </div>

      <!-- 用户群体筛选 -->
      <div class="filter-section">
        <div class="filter-label">
          <IconUserGroup />
          <span>用户群体</span>
        </div>
        <a-select
          v-model="localFilters.userGroup"
          placeholder="选择用户群体"
          size="small"
          multiple
          allow-clear
          @change="handleFilterChange"
        >
          <a-option value="new">新用户</a-option>
          <a-option value="active">活跃用户</a-option>
          <a-option value="inactive">非活跃用户</a-option>
          <a-option value="vip">VIP用户</a-option>
          <a-option value="churn">流失用户</a-option>
        </a-select>
      </div>

      <!-- 快速操作 -->
      <div class="filter-actions">
        <a-space>
          <a-button 
            type="primary" 
            size="small"
            @click="applyFilters"
          >
            <IconRefresh />
            应用筛选
          </a-button>
          <a-button 
            size="small"
            @click="resetFilters"
          >
            <IconUndo />
            重置
          </a-button>
        </a-space>
      </div>

      <!-- 当前筛选条件标签 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="filter-tags">
          <a-tag
            v-for="tag in filterTags"
            :key="tag.key"
            closable
            @close="removeFilterTag(tag.key)"
            size="small"
          >
            <IconClose v-if="tag.key === 'clearAll'" />
            {{ tag.label }}
          </a-tag>
        </div>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { 
  IconCalendar, 
  IconApps, 
  IconUserGroup, 
  IconRefresh, 
  IconUndo, 
  IconClose 
} from '@arco-design/web-vue/es/icon'

interface FilterState {
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'custom'
  dateFrom?: string
  dateTo?: string
  nodeType?: string[]
  userGroup?: string[]
}

interface Props {
  modelValue: FilterState
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

// 本地筛选状态
const localFilters = reactive<FilterState>({
  timeRange: 'day',
  nodeType: [],
  userGroup: []
})

// 自定义日期范围
const customDateRange = ref<string[]>([])

// 初始化本地状态
const initializeFilters = () => {
  Object.assign(localFilters, props.modelValue)
  if (localFilters.timeRange === 'custom' && localFilters.dateFrom && localFilters.dateTo) {
    customDateRange.value = [localFilters.dateFrom, localFilters.dateTo]
  }
}

// 监听props变化
watch(() => props.modelValue, initializeFilters, { immediate: true })

// 处理时间范围变化
const handleTimeRangeChange = () => {
  if (localFilters.timeRange !== 'custom') {
    const now = new Date()
    let dateFrom: Date
    
    switch (localFilters.timeRange) {
      case 'day':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        break
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        dateFrom = new Date(now.getFullYear(), quarter * 3, 1)
        break
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    
    localFilters.dateFrom = dateFrom.toISOString().split('T')[0]
    localFilters.dateTo = now.toISOString().split('T')[0]
  }
  
  emit('change', localFilters)
}

// 处理自定义日期变化
const handleCustomDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    localFilters.dateFrom = customDateRange.value[0]
    localFilters.dateTo = customDateRange.value[1]
    emit('change', localFilters)
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  emit('change', localFilters)
}

// 应用筛选
const applyFilters = () => {
  emit('update:modelValue', localFilters)
  emit('change', localFilters)
}

// 重置筛选
const resetFilters = () => {
  localFilters.timeRange = 'day'
  localFilters.nodeType = []
  localFilters.userGroup = []
  localFilters.dateFrom = undefined
  localFilters.dateTo = undefined
  customDateRange.value = []
  
  emit('update:modelValue', localFilters)
  emit('change', localFilters)
}

// 计算活动筛选条件
const hasActiveFilters = computed(() => {
  return (
    localFilters.timeRange !== 'day' ||
    (localFilters.nodeType && localFilters.nodeType.length > 0) ||
    (localFilters.userGroup && localFilters.userGroup.length > 0)
  )
})

// 筛选条件标签
const filterTags = computed(() => {
  const tags = []
  
  if (localFilters.timeRange !== 'day') {
    const timeRangeMap = {
      'week': '本周',
      'month': '本月',
      'quarter': '本季度',
      'custom': '自定义时间'
    }
    tags.push({
      key: 'timeRange',
      label: `时间: ${timeRangeMap[localFilters.timeRange]}`
    })
  }
  
  if (localFilters.nodeType && localFilters.nodeType.length > 0) {
    tags.push({
      key: 'nodeType',
      label: `节点类型: ${localFilters.nodeType.length}个`
    })
  }
  
  if (localFilters.userGroup && localFilters.userGroup.length > 0) {
    tags.push({
      key: 'userGroup',
      label: `用户群体: ${localFilters.userGroup.length}个`
    })
  }
  
  if (tags.length > 0) {
    tags.push({
      key: 'clearAll',
      label: '清空全部'
    })
  }
  
  return tags
})

// 移除筛选标签
const removeFilterTag = (key: string) => {
  if (key === 'clearAll') {
    resetFilters()
    return
  }
  
  switch (key) {
    case 'timeRange':
      localFilters.timeRange = 'day'
      break
    case 'nodeType':
      localFilters.nodeType = []
      break
    case 'userGroup':
      localFilters.userGroup = []
      break
  }
  
  emit('change', localFilters)
}
</script>

<style scoped lang="scss">
.data-filter-controls {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  
  span {
    margin-left: 4px;
  }
}

.custom-date-range {
  margin-top: 8px;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.active-filters {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.arco-radio-group-button) {
  .arco-radio-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

:deep(.arco-select-view-multiple) {
  .arco-select-view-tag {
    margin: 2px 4px 2px 0;
  }
}
</style>