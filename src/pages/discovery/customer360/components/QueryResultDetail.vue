<template>
  <!-- 查询结果抽屉 -->
  <a-drawer
    :visible="visible"
    title="查询结果详情"
    width="80%"
    :footer="false"
    placement="right"
    :mask-closable="false"
    @cancel="handleClose"
  >
    <div class="query-result-drawer">
      <!-- 抽屉头部操作 -->
      <div class="drawer-header">
        <div class="header-title">
          <h3>{{ queryDetail.name }}</h3>
          <a-tag :color="getStatusColor(queryDetail.status)" size="medium">
            {{ queryDetail.status }}
          </a-tag>
        </div>
        <div class="header-actions">
          <a-button @click="refreshData">
            <template #icon><IconRefresh /></template>
            刷新
          </a-button>
          <a-button
            v-if="queryDetail.status === 'failed' || queryDetail.status === 'completed'"
            type="primary"
            @click="retryQuery"
          >
            <template #icon><IconRefresh /></template>
            重试
          </a-button>
        </div>
      </div>

      <!-- 查询基本信息区域 -->
      <div class="info-section">
        <h4>查询基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>查询名称：</label>
            <span>{{ queryDetail.name }}</span>
          </div>
          <div class="info-item">
            <label>数据模型：</label>
            <span>{{ queryDetail.modelName }}</span>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ formatDateTime(queryDetail.createTime) }}</span>
          </div>
          <div class="info-item">
            <label>查询状态：</label>
            <a-tag :color="getStatusColor(queryDetail.status)">{{ queryDetail.status }}</a-tag>
          </div>
          <div class="info-item">
            <label>结果数量：</label>
            <span>{{ queryDetail.resultCount || 0 }} 条</span>
          </div>
          <div class="info-item">
            <label>执行时长：</label>
            <span>{{ queryDetail.executionTime || '0.5' }}s</span>
          </div>
        </div>
      </div>

      <!-- 查询条件展示区域 -->
      <div class="conditions-section">
        <h4>查询条件</h4>
        <div class="conditions-content">
          <div v-if="queryDetail.conditions && Object.keys(queryDetail.conditions).length > 0" class="conditions-grid">
            <div v-for="(value, key) in queryDetail.conditions" :key="key" class="condition-item">
              <label>{{ getConditionLabel(key) }}：</label>
              <span class="condition-value">{{ formatConditionValue(key, value) }}</span>
            </div>
          </div>
          <div v-else class="no-conditions">
            <IconInfoCircle />
            <span>未设置查询条件</span>
          </div>
        </div>
      </div>

      <!-- 结果数据表格区域 -->
      <div class="results-section">
        <div class="results-header">
          <h4>查询结果</h4>
          <div class="results-actions">
            <a-button @click="selectAllRows" :disabled="!resultData.length">
              <template #icon><IconCheckSquare /></template>
              全选
            </a-button>
            <a-button @click="clearSelection" :disabled="!selectedRowKeys.length">
              <template #icon><IconClose /></template>
              取消选择
            </a-button>
            <a-button type="primary" @click="copySelectedData" :disabled="!selectedRowKeys.length">
              <template #icon><IconCopy /></template>
              复制选中 ({{ selectedRowKeys.length }})
            </a-button>
            <a-button @click="copyAllData" :disabled="!resultData.length">
              <template #icon><IconCopy /></template>
              复制全部
            </a-button>
          </div>
        </div>
        
        <div class="results-table-container">
          <a-table
            v-if="resultData.length > 0"
            :columns="tableColumns"
            :data="resultData"
            :loading="resultLoading"
            :pagination="resultPagination"
            :row-selection="rowSelection"
            :scroll="{ x: 'max-content', y: '400px' }"
            row-key="id"
            size="small"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          >
            <template #cell="{ record, column }">
              <template v-if="['createTime', 'accountOpenDate', 'lastTransactionDate'].includes(column.dataIndex)">
                {{ formatDateTime(record[column.dataIndex]) }}
              </template>
              <template v-else-if="['balance', 'creditLimit', 'transactionAmount'].includes(column.dataIndex)">
                <span v-if="record[column.dataIndex]">¥{{ formatNumber(record[column.dataIndex]) }}</span>
                <span v-else>-</span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <a-tag :color="getDataStatusColor(record[column.dataIndex])">
                  {{ record[column.dataIndex] }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'riskLevel'">
                <a-tag :color="getRiskLevelColor(record[column.dataIndex])">
                  {{ record[column.dataIndex] }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'vipLevel'">
                <a-tag :color="getVipLevelColor(record[column.dataIndex])">
                  {{ record[column.dataIndex] }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'creditScore'">
                <span :style="{ color: getCreditScoreColor(record[column.dataIndex]) }">
                  {{ record[column.dataIndex] }}
                </span>
              </template>
              <template v-else>
                {{ record[column.dataIndex] }}
              </template>
            </template>
          </a-table>
          <div v-else class="no-results">
            <IconInfoCircle />
            <span>当前查询状态下暂无数据记录</span>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconRefresh,
  IconInfoCircle,
  IconCheckSquare,
  IconClose,
  IconCopy
} from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedQueryRecord: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'close'])

// 响应式数据
const queryDetail = computed(() => ({ ...props.selectedQueryRecord, executionTime: '2.3' }))
const resultData = ref([])
const resultLoading = ref(false)
const selectedRowKeys = ref([])
const tableColumns = ref([])

// 分页配置
const resultPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 行选择配置
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (rowKeys) => {
    selectedRowKeys.value = rowKeys
  },
  onSelectAll: (selected) => {
    if (selected) {
      selectedRowKeys.value = resultData.value.map(item => item.id)
    } else {
      selectedRowKeys.value = []
    }
  }
})

// 方法
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const getStatusColor = (status) => {
  const colorMap = {
    'completed': 'green',
    'running': 'blue',
    'failed': 'red',
    'pending': 'orange'
  }
  return colorMap[status] || 'gray'
}

const getDataStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '异常': 'red',
    '待处理': 'orange',
    '已处理': 'blue',
    '冻结': 'red',
    '注销': 'gray'
  }
  return colorMap[status] || 'gray'
}

const getRiskLevelColor = (riskLevel) => {
  const colorMap = {
    '低风险': 'green',
    '中低风险': 'lime',
    '中风险': 'orange',
    '中高风险': 'red',
    '高风险': 'magenta'
  }
  return colorMap[riskLevel] || 'gray'
}

const getVipLevelColor = (vipLevel) => {
  const colorMap = {
    '普通客户': 'gray',
    '银卡客户': 'cyan',
    '金卡客户': 'gold',
    '白金客户': 'blue',
    '钻石客户': 'purple'
  }
  return colorMap[vipLevel] || 'gray'
}

const getCreditScoreColor = (score) => {
  if (score >= 750) return '#52c41a'
  if (score >= 700) return '#1890ff'
  if (score >= 650) return '#faad14'
  if (score >= 600) return '#fa8c16'
  return '#f5222d'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatNumber = (num) => {
  if (!num) return '0.00'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getConditionLabel = (key) => {
  const labelMap = {
    id: '序号',
    name: '姓名',
    phone: '手机号',
    idCard: '身份证号',
    age: '年龄',
    ageRange: '年龄范围',
    gender: '性别',
    city: '城市',
    district: '区域',
    address: '地址',
    occupation: '职业',
    education: '学历',
    incomeRange: '收入范围',
    productId: '产品编号',
    productType: '产品类型',
    productName: '产品名称',
    balance: '账户余额',
    creditLimit: '信用额度',
    accountOpenDate: '开户日期',
    lastTransactionDate: '最后交易日期',
    createTime: '创建时间',
    riskLevel: '风险等级',
    creditScore: '信用评分',
    vipLevel: 'VIP等级',
    status: '状态',
    minBalance: '最小余额',
    isActive: '是否激活',
    startDate: '开始日期',
    endDate: '结束日期'
  }
  return labelMap[key] || key
}

const formatConditionValue = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  
  if (key === 'isActive') {
    return value ? '是' : '否'
  }
  if (key === 'minBalance') {
    return `¥${formatNumber(value)}`
  }
  if (key.includes('Date') || key.includes('Time')) {
    return formatDateTime(value)
  }
  
  return String(value)
}

const refreshData = async () => {
  await loadQueryDetail()
  await loadResultData()
  Message.success('数据已刷新')
}

const retryQuery = async () => {
  // 模拟重试逻辑
  queryDetail.value.status = 'pending'
  queryDetail.value.resultCount = 0
  Message.info('查询已重新提交，请稍候...')
  // 模拟异步查询过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  // 模拟查询完成，更新状态和数据
  queryDetail.value.status = 'completed'
  queryDetail.value.resultCount = 1250 // 假设重试成功后有数据
  await loadResultData()
  Message.success('查询重试成功！')
}



const selectAllRows = () => {
  selectedRowKeys.value = resultData.value.map(item => item.id)
}

const clearSelection = () => {
  selectedRowKeys.value = []
}

const copySelectedData = () => {
  const selectedData = resultData.value.filter(item => selectedRowKeys.value.includes(item.id))
  const csvContent = generateCSV(selectedData)
  copyToClipboard(csvContent)
  Message.success(`已复制 ${selectedRowKeys.value.length} 条数据到剪贴板`)
}

const copyAllData = () => {
  const csvContent = generateCSV(resultData.value)
  copyToClipboard(csvContent)
  Message.success(`已复制全部 ${resultData.value.length} 条数据到剪贴板`)
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).catch(() => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  })
}

const handlePageChange = (page) => {
  resultPagination.current = page
}

const handlePageSizeChange = (pageSize) => {
  resultPagination.pageSize = pageSize
  resultPagination.current = 1
}

// 加载查询详情
const loadQueryDetail = async () => {
  try {
    // 直接使用父组件传递的查询记录
    queryDetail.value = {
      ...props.selectedQueryRecord,
      // 补充模拟接口返回的额外字段
      executionTime: '2.3'
    }
  } catch (error) {
    console.error('加载查询详情失败:', error)
    Message.error('加载查询详情失败')
  }
}

const generateColumns = (data) => {
  if (data.length === 0) return []
  return Object.keys(data[0]).map(key => ({
    title: getConditionLabel(key),
    dataIndex: key,
    key: key
  }))
}

// 加载结果数据
const loadResultData = async () => {
  resultLoading.value = true
  try {
    // 如果查询状态不是 'completed'，则不加载结果数据
    if (queryDetail.value.status !== 'completed') {
      resultData.value = []
      tableColumns.value = []
      resultPagination.total = 0
      return
    }

    // 直接使用父组件传递的结果数据
    resultData.value = props.selectedQueryRecord.resultData || []
    resultPagination.total = resultData.value.length

    if (resultData.value.length > 0) {
      tableColumns.value = generateColumns(resultData.value)
    } else {
      tableColumns.value = []
    }
  } catch (error) {
    console.error('加载结果数据失败:', error)
    Message.error('加载结果数据失败')
  } finally {
    resultLoading.value = false
  }
}

// 监听抽屉显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loadQueryDetail()
    loadResultData()
  }
})

// 监听 selectedQueryRecord 变化
watch(() => props.selectedQueryRecord, (newRecord) => {
  if (newRecord && props.visible) {
    loadQueryDetail()
    loadResultData()
  }
}, { deep: true })

// 组件挂载时如果抽屉已显示则加载数据
onMounted(() => {
  if (props.visible) {
    loadQueryDetail()
    loadResultData()
  }
})
</script>

<style scoped>
.query-result-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.info-section,
.conditions-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  flex-shrink: 0;
}

.results-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 16px;
  min-height: 0;
  overflow: hidden;
}

.info-section h4,
.conditions-section h4,
.results-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #4e5969;
  margin-right: 8px;
  min-width: 80px;
}

.conditions-content {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.condition-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f7f8fa;
  border-radius: 4px;
}

.condition-item label {
  font-weight: 500;
  color: #4e5969;
  margin-right: 8px;
  min-width: 80px;
}

.condition-value {
  color: #1d2129;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.no-conditions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: #86909c;
  font-size: 14px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.results-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-table-container {
  flex: 1;
  overflow: auto;
  min-width: 0;
  min-height: 0;
}

:deep(.arco-table) {
  font-size: 13px;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
  white-space: nowrap;
}

:deep(.arco-table-td) {
  white-space: nowrap;
}

:deep(.arco-table-cell) {
  padding: 8px 12px;
}

:deep(.arco-drawer-body) {
  padding: 16px;
  height: 100%;
  overflow: hidden;
}

:deep(.arco-table-container) {
  height: 100%;
}

:deep(.arco-table-body) {
  max-height: 400px;
  overflow-y: auto;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 0;
  color: #86909c;
  font-size: 14px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  height: 100%;
}

.no-results .arco-icon {
  font-size: 32px;
  color: #c9cdd4;
}

.no-results span {
  margin-top: 8px;
}
</style>