<template>
  <div class="history-container">
    <!-- 页面标题 -->
    <a-page-header title="批量创建历史" subtitle="查看批量创建券库存的历史记录和统计信息">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>营销画布</a-breadcrumb-item>
          <a-breadcrumb-item>券管理</a-breadcrumb-item>
          <a-breadcrumb-item>创建历史</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stats-card">
          <a-statistic 
            title="总申请数" 
            :value="statistics.totalApplications"
            :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <icon-file-text />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stats-card">
          <a-statistic 
            title="已通过" 
            :value="statistics.approvedCount"
            :value-style="{ color: '#52c41a' }">
            <template #prefix>
              <icon-check-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stats-card">
          <a-statistic 
            title="已拒绝" 
            :value="statistics.rejectedCount"
            :value-style="{ color: '#ff4d4f' }">
            <template #prefix>
              <icon-close-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stats-card">
          <a-statistic 
            title="累计库存" 
            :value="statistics.totalInventory"
            :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <icon-gift />
            </template>
            <template #suffix>
              <span style="font-size: 14px;">张</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 筛选条件 -->
    <a-card class="filter-card">
      <a-form 
        :model="filterForm" 
        layout="inline" 
        @submit="handleSearch">
        <a-form-item field="status" label="创建状态">
          <a-select 
            v-model="filterForm.status" 
            placeholder="请选择创建状态"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="pending">审批中</a-option>
            <a-option value="processing">创建中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="failed">创建失败</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="usageScenario" label="使用场景">
          <a-select 
            v-model="filterForm.usageScenario" 
            placeholder="请选择使用场景"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="batch_distribute">批量下发</a-option>
            <a-option value="telesales">电销使用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="configMode" label="配置模式">
          <a-select 
            v-model="filterForm.configMode" 
            placeholder="请选择配置模式"
            allow-clear
            style="width: 150px">
            <a-option value="">全部</a-option>
            <a-option value="unified">统一配置</a-option>
            <a-option value="individual">分别编辑</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="创建时间">
          <a-range-picker 
            v-model="filterForm.dateRange"
            style="width: 240px" />
        </a-form-item>
        <a-form-item field="keyword" label="关键词">
          <a-input 
            v-model="filterForm.keyword"
            placeholder="搜索操作人、批次ID"
            style="width: 200px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetFilter">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
            <a-button @click="exportHistory">
              <template #icon><icon-download /></template>
              导出
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 历史记录列表 -->
    <a-card class="table-card">
      <template #title>
        <a-space>
          <span>历史记录</span>
          <a-tag color="blue">共 {{ pagination.total }} 条记录</a-tag>
        </a-space>
      </template>
      
      <a-table 
        :data="historyList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange">
        <template #columns>
          <a-table-column title="批次ID" dataIndex="batchId" width="120" />
          <a-table-column title="操作人" dataIndex="operator" width="100" />
          <a-table-column title="使用场景" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.usageScenario === 'batch_distribute' ? 'blue' : 'green'">
                {{ record.usageScenario === 'batch_distribute' ? '批量下发' : '电销使用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="配置模式" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.configMode === 'unified' ? 'purple' : 'orange'">
                {{ record.configMode === 'unified' ? '统一配置' : '分别编辑' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="券模板数量" dataIndex="templateCount" width="100" align="right" />
          <a-table-column title="成功/总数" width="120" align="right">
            <template #cell="{ record }">
              <span :style="{ color: record.successCount === record.totalCount ? '#52c41a' : '#ff4d4f' }">
                {{ record.successCount }}/{{ record.totalCount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="库存总数" dataIndex="totalInventory" width="100" align="right" />
          <a-table-column title="创建状态" width="100">
            <template #cell="{ record }">
              <a-tag :color="getBatchStatusColor(record.status)">
                {{ getBatchStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" dataIndex="createTime" width="160" />
          <a-table-column title="完成时间" dataIndex="completeTime" width="160">
            <template #cell="{ record }">
              {{ record.completeTime || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  type="text" 
                  size="small"
                  @click="viewDetail(record)">
                  查看详情
                </a-button>
                <a-button 
                  v-if="record.status === 'failed'"
                  type="text" 
                  size="small"
                  status="warning"
                  @click="retryCreate(record)">
                  重试
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal 
      v-model:visible="detailModalVisible"
      title="批量创建详情"
      width="1200px"
      :footer="false">
      <div v-if="currentDetail" class="detail-content">
        <!-- 基础信息 -->
        <h4>基础信息</h4>
        <a-descriptions :column="3" bordered>
          <a-descriptions-item label="批次ID">
            {{ currentDetail.batchId }}
          </a-descriptions-item>
          <a-descriptions-item label="操作人">
            {{ currentDetail.operator }}
          </a-descriptions-item>
          <a-descriptions-item label="创建状态">
            <a-tag :color="getBatchStatusColor(currentDetail.status)">
              {{ getBatchStatusText(currentDetail.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="使用场景">
            <a-tag :color="currentDetail.usageScenario === 'batch_distribute' ? 'blue' : 'green'">
              {{ currentDetail.usageScenario === 'batch_distribute' ? '批量下发' : '电销使用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="配置模式">
            <a-tag :color="currentDetail.configMode === 'unified' ? 'purple' : 'orange'">
              {{ currentDetail.configMode === 'unified' ? '统一配置' : '分别编辑' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="券模板数量">
            {{ currentDetail.templateCount }} 个
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ currentDetail.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="完成时间">
            {{ currentDetail.completeTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="耗时">
            {{ calculateDuration(currentDetail.createTime, currentDetail.completeTime) }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 执行结果统计 -->
        <h4 style="margin-top: 24px;">执行结果统计</h4>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card class="result-stats-card">
              <a-statistic 
                title="总数" 
                :value="currentDetail.totalCount"
                :value-style="{ color: '#1890ff' }" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="result-stats-card">
              <a-statistic 
                title="成功" 
                :value="currentDetail.successCount"
                :value-style="{ color: '#52c41a' }" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="result-stats-card">
              <a-statistic 
                title="失败" 
                :value="currentDetail.failedCount"
                :value-style="{ color: '#ff4d4f' }" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="result-stats-card">
              <a-statistic 
                title="成功率" 
                :value="calculateSuccessRate(currentDetail.successCount, currentDetail.totalCount)"
                :value-style="{ color: '#722ed1' }"
                suffix="%" />
            </a-card>
          </a-col>
        </a-row>

        <!-- 创建结果详情 -->
        <h4 style="margin-top: 24px;">创建结果详情</h4>
        <a-table 
          :data="currentDetail.results"
          :pagination="false"
          :bordered="{ cell: true }">
          <template #columns>
            <a-table-column title="券模板名称" dataIndex="templateName" />
            <a-table-column title="模板ID" dataIndex="templateId" />
            <a-table-column title="预期数量" dataIndex="expectedQuantity" align="right" />
            <a-table-column title="实际创建" dataIndex="actualQuantity" align="right" />
            <a-table-column title="创建状态" width="100">
              <template #cell="{ record }">
                <a-tag :color="record.success ? 'green' : 'red'">
                  {{ record.success ? '成功' : '失败' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="错误信息">
              <template #cell="{ record }">
                {{ record.errorMessage || '-' }}
              </template>
            </a-table-column>
          </template>
        </a-table>

        <!-- 操作日志 -->
        <h4 style="margin-top: 24px;">操作日志</h4>
        <a-timeline>
          <a-timeline-item 
            v-for="log in currentDetail.logs" 
            :key="log.id"
            :dot-color="getLogDotColor(log.level)">
            <template #dot>
              <icon-info-circle v-if="log.level === 'info'" />
              <icon-check-circle v-else-if="log.level === 'success'" />
              <icon-exclamation-circle v-else-if="log.level === 'warning'" />
              <icon-close-circle v-else-if="log.level === 'error'" />
            </template>
            <div class="log-item">
              <div class="log-time">{{ log.timestamp }}</div>
              <div class="log-message">{{ log.message }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconRefresh, 
  IconDownload,
  IconFileText,
  IconCheckCircle,
  IconCloseCircle,
  IconGift,
  IconInfoCircle,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon'
import { inventoryAPI } from '@/api/coupon.js'

// 统计数据
const statistics = reactive({
  totalApplications: 0,
  approvedCount: 0,
  rejectedCount: 0,
  totalInventory: 0
})

// 筛选表单
const filterForm = reactive({
  status: '',
  usageScenario: '',
  configMode: '',
  dateRange: [],
  keyword: ''
})

// 历史记录列表
const historyList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 详情弹窗
const detailModalVisible = ref(false)
const currentDetail = ref(null)

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // 这里可以调用统计API，暂时使用模拟数据
    statistics.totalApplications = 156
    statistics.approvedCount = 128
    statistics.rejectedCount = 18
    statistics.totalInventory = 2580000
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取历史记录列表
const fetchHistoryList = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: filterForm.status,
      usageScenario: filterForm.usageScenario,
      configMode: filterForm.configMode,
      keyword: filterForm.keyword
    }

    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }

    const response = await inventoryAPI.getBatchCreateHistory(params)
    
    if (response.code === 200) {
      historyList.value = response.data.list
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '获取历史记录失败')
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
    Message.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchHistoryList()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    usageScenario: '',
    configMode: '',
    dateRange: [],
    keyword: ''
  })
  pagination.current = 1
  fetchHistoryList()
}

// 导出历史记录
const exportHistory = () => {
  Message.info('导出功能开发中...')
}

// 分页变化
const onPageChange = (page) => {
  pagination.current = page
  fetchHistoryList()
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchHistoryList()
}

// 查看详情
const viewDetail = async (record) => {
  try {
    const response = await inventoryAPI.getBatchCreateDetail(record.batchId)
    if (response.code === 200) {
      currentDetail.value = response.data
      detailModalVisible.value = true
    } else {
      Message.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    Message.error('获取详情失败')
  }
}

// 重试创建
const retryCreate = (record) => {
  Modal.confirm({
    title: '确认重试',
    content: '确定要重新执行这个批量创建任务吗？',
    onOk: () => {
      Message.info('重试功能开发中...')
    }
  })
}

// 获取批次状态颜色
const getBatchStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取批次状态文本
const getBatchStatusText = (status) => {
  const textMap = {
    pending: '审批中',
    processing: '创建中',
    completed: '已完成',
    failed: '创建失败',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 获取日志点颜色
const getLogDotColor = (level) => {
  const colorMap = {
    info: 'blue',
    success: 'green',
    warning: 'orange',
    error: 'red'
  }
  return colorMap[level] || 'gray'
}

// 计算耗时
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '-'
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const duration = Math.floor((end - start) / 1000) // 秒
  
  if (duration < 60) {
    return `${duration}秒`
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}分${duration % 60}秒`
  } else {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}小时${minutes}分`
  }
}

// 计算成功率
const calculateSuccessRate = (successCount, totalCount) => {
  if (totalCount === 0) return 0
  return Math.round((successCount / totalCount) * 100)
}

// 初始化
onMounted(() => {
  fetchStatistics()
  fetchHistoryList()
})
</script>

<style scoped>
.history-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.stats-row {
  margin-bottom: 16px;
}

.stats-card,
.result-stats-card {
  text-align: center;
}

.filter-card,
.table-card {
  margin-bottom: 16px;
}

.detail-content h4 {
  margin: 16px 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-content h4:first-child {
  margin-top: 0;
}

.log-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.log-message {
  font-size: 14px;
  color: var(--color-text-1);
}

:deep(.arco-table-th) {
  background-color: var(--color-bg-2);
  font-weight: 600;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 600;
}

:deep(.arco-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.arco-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>