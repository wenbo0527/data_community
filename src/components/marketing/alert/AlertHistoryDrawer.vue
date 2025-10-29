<template>
  <a-drawer
    v-model:visible="visible"
    title="预警历史"
    width="800"
    placement="right"
    :footer="false"
    @cancel="handleClose"
  >
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="24" :md="12">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索预警标题或类型"
            allow-clear
            @search="handleSearch"
            @clear="handleSearch"
          />
        </a-col>
        <a-col :span="24" :md="12">
          <a-range-picker
            v-model="dateRange"
            style="width: 100%"
            :shortcuts="dateShortcuts"
            @change="handleDateRangeChange"
          />
        </a-col>
      </a-row>
      
      <a-row :gutter="16" class="mb-4">
        <a-col :span="12">
          <a-select
            v-model="filterType"
            placeholder="预警类型"
            allow-clear
            style="width: 100%"
            @change="handleFilter"
          >
            <a-option value="inventory">库存预警</a-option>
            <a-option value="expiry">过期预警</a-option>
            <a-option value="failure">失败预警</a-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <a-select
            v-model="filterStatus"
            placeholder="处理状态"
            allow-clear
            style="width: 100%"
            @change="handleFilter"
          >
            <a-option value="pending">待处理</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="resolved">已解决</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <!-- 预警列表 -->
    <div class="alert-list-section">
      <a-spin :loading="loading" style="width: 100%">
        <div v-if="filteredAlerts.length > 0" class="alert-list">
          <div
            v-for="alert in paginatedAlerts"
            :key="alert.id"
            class="alert-item"
            @click="handleAlertClick(alert)"
          >
            <div class="alert-item__header">
              <div class="alert-tags">
                <a-tag :color="getTypeColor(alert.type)" size="small">
                  {{ getTypeText(alert.type) }}
                </a-tag>
                <a-tag :color="getStatusColor(alert.status)" size="small">
                  {{ getStatusText(alert.status) }}
                </a-tag>
              </div>
              <div class="alert-time">
                {{ formatDateTime(alert.createTime) }}
              </div>
            </div>
            
            <div class="alert-item__content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-message">{{ alert.message || '暂无详细信息' }}</div>
            </div>
            
            <div class="alert-item__actions">
              <a-space size="mini">
                <!-- 失败类预警显示处理按钮 -->
                <a-button
                  v-if="alert.type === 'failure' && alert.status === 'pending'"
                  type="primary"
                  size="mini"
                  @click.stop="handleProcessAlert(alert)"
                >
                  处理
                </a-button>
                <!-- 库存和过期预警只显示查看详情 -->
                <a-button
                  type="text"
                  size="mini"
                  @click.stop="handleViewDetail(alert)"
                >
                  详情
                </a-button>
                <!-- 所有类型都可以标记已知 -->
                <a-button
                  v-if="alert.status !== 'resolved'"
                  type="text"
                  size="mini"
                  status="success"
                  @click.stop="handleResolveAlert(alert)"
                >
                  {{ alert.type === 'failure' ? '标记解决' : '标记已知' }}
                </a-button>
              </a-space>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <a-empty description="暂无预警记录" />
        </div>
      </a-spin>
    </div>

    <!-- 分页 -->
    <div v-if="filteredAlerts.length > 0" class="pagination-section">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="filteredAlerts.length"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:visible',
  'alert-click',
  'process-alert',
  'view-detail',
  'resolve-alert'
])

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const dateRange = ref([])
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const alertHistory = ref([])

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const filteredAlerts = computed(() => {
  let filtered = [...alertHistory.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(alert => 
      alert.title.toLowerCase().includes(keyword) ||
      getTypeText(alert.type).toLowerCase().includes(keyword)
    )
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(alert => {
      const alertDate = dayjs(alert.createTime)
      return alertDate.isAfter(dayjs(startDate).startOf('day')) && 
             alertDate.isBefore(dayjs(endDate).endOf('day'))
    })
  }
  
  // 类型过滤
  if (filterType.value) {
    filtered = filtered.filter(alert => alert.type === filterType.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(alert => alert.status === filterStatus.value)
  }
  
  return filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAlerts.value.slice(start, end)
})

// 日期快捷选项
const dateShortcuts = [
  {
    label: '近7天',
    value: () => [dayjs().subtract(7, 'day'), dayjs()]
  },
  {
    label: '近30天',
    value: () => [dayjs().subtract(30, 'day'), dayjs()]
  },
  {
    label: '近3个月',
    value: () => [dayjs().subtract(3, 'month'), dayjs()]
  }
]

// 方法
const handleClose = () => {
  visible.value = false
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleDateRangeChange = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleAlertClick = (alert) => {
  emit('alert-click', alert)
}

const handleProcessAlert = (alert) => {
  emit('process-alert', alert)
}

const handleViewDetail = (alert) => {
  emit('view-detail', alert)
}

const handleResolveAlert = (alert) => {
  emit('resolve-alert', alert)
}

// 工具方法
const getTypeColor = (type) => {
  const colorMap = {
    inventory: 'blue',
    expiry: 'purple',
    failure: 'red'
  }
  return colorMap[type] || 'gray'
}

const getTypeText = (type) => {
  const textMap = {
    inventory: '库存',
    expiry: '过期',
    failure: '失败'
  }
  return textMap[type] || '未知'
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    processing: 'blue',
    resolved: 'green'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  }
  return textMap[status] || '未知'
}

const formatDateTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 加载预警历史数据
const loadAlertHistory = async () => {
  loading.value = true
  try {
    // 调用实际的API接口
    const { alertAPI } = await import('@/api/alert')
    
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      type: filterType.value,
      status: filterStatus.value
    }
    
    // 添加日期范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0].format('YYYY-MM-DD')
      params.endDate = dateRange.value[1].format('YYYY-MM-DD')
    }
    
    const response = await alertAPI.getAlertHistory(params)
    
    if (response.success) {
      alertHistory.value = response.data.list
    } else {
      Message.error('加载预警历史失败')
    }
  } catch (error) {
    Message.error('加载预警历史失败')
    console.error('Load alert history error:', error)
  } finally {
    loading.value = false
  }
}

// 监听抽屉显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 设置默认日期范围为近7天
    dateRange.value = [dayjs().subtract(7, 'day'), dayjs()]
    loadAlertHistory()
  } else {
    // 重置搜索条件
    searchKeyword.value = ''
    dateRange.value = []
    filterType.value = ''
    filterStatus.value = ''
    currentPage.value = 1
  }
})
</script>

<style scoped>
.search-filter-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e6eb;
}

.alert-list-section {
  flex: 1;
  min-height: 400px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alert-item:hover {
  border-color: #1890FF;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}



.alert-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.alert-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.alert-time {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
  margin-left: 8px;
}

.alert-item__content {
  margin-bottom: 12px;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 6px;
  line-height: 1.4;
}

.alert-message {
  font-size: 13px;
  color: #86909c;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-item__actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.pagination-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
  display: flex;
  justify-content: center;
}

.mb-4 {
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .alert-item {
    padding: 12px;
  }
  
  .alert-item__header {
    flex-direction: column;
    gap: 8px;
  }
  
  .alert-time {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .alert-title {
    font-size: 13px;
  }
  
  .alert-message {
    font-size: 12px;
  }
}
</style>