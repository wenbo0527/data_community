<template>
  <div class="limit-adjustment-table">
    <div class="table-header">
      <h3 class="table-title">
        <TrendingUp class="title-icon" />
        调额历史
      </h3>
      <div class="table-actions">
        <a-input-search
          v-model="searchText"
          placeholder="搜索授信单号、产品名称"
          style="width: 240px"
          @search="handleSearch"
          @clear="handleSearch"
          allow-clear
        />
        <a-select
          v-model="operationFilter"
          placeholder="操作类型"
          style="width: 120px"
          allow-clear
          @change="handleFilter"
        >
          <a-option value="提额">提额</a-option>
          <a-option value="降额">降额</a-option>
          <a-option value="恢复">恢复</a-option>
          <a-option value="冻结">冻结</a-option>
        </a-select>
        <a-range-picker
          v-model="dateRange"
          style="width: 240px"
          @change="handleDateFilter"
          allow-clear
        />
        <a-button type="outline" size="small" @click="refreshData">
          <RefreshCw class="action-icon" />
          刷新
        </a-button>
        <a-button type="outline" size="small" @click="exportData">
          <Download class="action-icon" />
          导出
        </a-button>
      </div>
    </div>

    <div class="table-content">
      <a-table
        :data="filteredData"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 1200 }"
        row-key="adjustDate"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="授信单号" data-index="creditNo" width="140" fixed="left">
            <template #cell="{ record }">
              <div class="credit-no-cell">
                <span class="credit-no">{{ record.creditNo }}</span>
                <a-button type="text" size="mini" @click="copyText(record.creditNo)">
                  <Copy class="copy-icon" />
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="产品名称" data-index="productName" width="120" />

          <a-table-column title="调整时间" data-index="adjustDate" width="160" sortable>
            <template #cell="{ record }">
              {{ formatDateTime(record.adjustDate) }}
            </template>
          </a-table-column>

          <a-table-column title="原授信额度" data-index="beforeAmount" width="120" align="right" sortable>
            <template #cell="{ record }">
              <span class="amount before">{{ formatAmount(record.beforeAmount) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="调整后额度" data-index="afterAmount" width="120" align="right" sortable>
            <template #cell="{ record }">
              <span class="amount after">{{ formatAmount(record.afterAmount) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="调整金额" width="120" align="right">
            <template #cell="{ record }">
              <span :class="getAdjustmentClass(record.afterAmount - record.beforeAmount)">
                {{ formatAdjustmentAmount(record.afterAmount - record.beforeAmount) }}
              </span>
            </template>
          </a-table-column>

          <a-table-column title="调整幅度" width="100" align="right">
            <template #cell="{ record }">
              <span :class="getAdjustmentClass(record.afterAmount - record.beforeAmount)">
                {{ formatAdjustmentPercentage(record.beforeAmount, record.afterAmount) }}
              </span>
            </template>
          </a-table-column>

          <a-table-column title="原利率" data-index="beforeRate" width="80" align="right">
            <template #cell="{ record }">
              <span class="rate">{{ record.beforeRate }}%</span>
            </template>
          </a-table-column>

          <a-table-column title="调整后利率" data-index="afterRate" width="100" align="right">
            <template #cell="{ record }">
              <span class="rate">{{ record.afterRate }}%</span>
            </template>
          </a-table-column>

          <a-table-column title="原期限" data-index="beforePeriod" width="80" align="center">
            <template #cell="{ record }">
              <span class="period">{{ record.beforePeriod }}月</span>
            </template>
          </a-table-column>

          <a-table-column title="调整后期限" data-index="afterPeriod" width="100" align="center">
            <template #cell="{ record }">
              <span class="period">{{ record.afterPeriod }}月</span>
            </template>
          </a-table-column>

          <a-table-column title="调整原因" data-index="adjustReason" width="150">
            <template #cell="{ record }">
              <a-tooltip :content="record.adjustReason">
                <span class="reason">{{ truncateText(record.adjustReason, 20) }}</span>
              </a-tooltip>
            </template>
          </a-table-column>

          <a-table-column title="操作人" data-index="operator" width="100" />

          <a-table-column title="操作结果" data-index="result" width="100">
            <template #cell="{ record }">
              <a-tag :color="getResultColor(record.result)" size="small">
                {{ record.result }}
              </a-tag>
            </template>
          </a-table-column>

          <a-table-column title="操作" width="120" fixed="right">
            <template #cell="{ record }">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="viewDetails(record)">
                  <Eye class="action-icon" />
                  详情
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { TrendingUp, RefreshCw, Download, Copy, Eye } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'
import { exportToExcel } from '@/utils/export'

interface LimitAdjustment {
  customerNo: string
  productKey: string
  productName: string
  creditNo?: string
  adjustDate: string
  beforeAmount: number
  afterAmount: number
  adjustReason: string
  beforeRate: number
  afterRate: number
  beforePeriod: number
  afterPeriod: number
  operator: string
  result: string
}

interface Props {
  data: LimitAdjustment[]
  loading?: boolean
  productKey?: string
}

interface Emits {
  refresh: []
  export: []
  viewDetails: [record: LimitAdjustment]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  productKey: ''
})

const emit = defineEmits<Emits>()

// 搜索和筛选状态
const searchText = ref('')
const operationFilter = ref('')
const dateRange = ref<[string, string] | undefined>()

// 分页配置
const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 过滤后的数据
const filteredData = computed(() => {
  let result = props.data

  // 产品过滤
  if (props.productKey) {
    result = result.filter(item => item.productKey === props.productKey)
  }

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(item => 
      (item.creditNo && item.creditNo.toLowerCase().includes(searchLower)) ||
      item.productName.toLowerCase().includes(searchLower)
    )
  }

  // 操作类型过滤
  if (operationFilter.value) {
    result = result.filter(item => {
      const adjustmentAmount = item.afterAmount - item.beforeAmount
      if (operationFilter.value === '提额') return adjustmentAmount > 0
      if (operationFilter.value === '降额') return adjustmentAmount < 0
      if (operationFilter.value === '恢复') return item.adjustReason.includes('恢复')
      if (operationFilter.value === '冻结') return item.adjustReason.includes('冻结')
      return true
    })
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(item => {
      const adjustDate = new Date(item.adjustDate)
      return adjustDate >= new Date(startDate) && adjustDate <= new Date(endDate)
    })
  }

  // 更新总数
  paginationConfig.value.total = result.length

  // 分页
  const start = (paginationConfig.value.current - 1) * paginationConfig.value.pageSize
  const end = start + paginationConfig.value.pageSize
  return result.slice(start, end)
})

// 监听产品切换，重置分页
watch(() => props.productKey, () => {
  paginationConfig.value.current = 1
})

// 格式化金额
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
}

// 格式化调整金额
const formatAdjustmentAmount = (amount: number): string => {
  const prefix = amount > 0 ? '+' : ''
  return prefix + formatAmount(amount)
}

// 格式化调整幅度
const formatAdjustmentPercentage = (beforeAmount: number, afterAmount: number): string => {
  if (beforeAmount === 0) return '-'
  const percentage = ((afterAmount - beforeAmount) / beforeAmount * 100).toFixed(2)
  const prefix = afterAmount > beforeAmount ? '+' : ''
  return `${prefix}${percentage}%`
}

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取调整金额样式类
const getAdjustmentClass = (amount: number): string => {
  if (amount > 0) return 'adjustment positive'
  if (amount < 0) return 'adjustment negative'
  return 'adjustment neutral'
}

// 获取结果颜色
const getResultColor = (result: string): string => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '失败': 'red',
    '待审核': 'orange',
    '审核中': 'blue'
  }
  return colorMap[result] || 'gray'
}

// 复制文本
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 搜索处理
const handleSearch = () => {
  paginationConfig.value.current = 1
}

// 筛选处理
const handleFilter = () => {
  paginationConfig.value.current = 1
}

// 日期筛选处理
const handleDateFilter = () => {
  paginationConfig.value.current = 1
}

// 分页处理
const handlePageChange = (page: number) => {
  paginationConfig.value.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.value.pageSize = pageSize
  paginationConfig.value.current = 1
}

// 刷新数据
const refreshData = () => {
  emit('refresh')
}

// 导出数据
const exportData = () => {
  const exportList = filteredData.value.map(record => {
    const adjustmentAmount = record.afterAmount - record.beforeAmount
    return {
      '授信单号': record.creditNo,
      '调整时间': formatDateTime(record.adjustDate),
      '产品名称': record.productName,
      '原授信额度': formatAmount(record.beforeAmount),
      '调整后额度': formatAmount(record.afterAmount),
      '调整金额': formatAdjustmentAmount(adjustmentAmount),
      '原期限': `${record.beforePeriod}月`,
      '调整后期限': `${record.afterPeriod}月`,
      '生效起始时间': record.effectiveStartDate,
      '生效结束时间': record.effectiveEndDate,
      '操作类型': adjustmentAmount > 0 ? '提额' : adjustmentAmount < 0 ? '降额' : '无变化',
      '调整结果': record.result
    }
  })
  
  const fileName = `调额历史_${new Date().toISOString().split('T')[0]}`
  exportToExcel(exportList, fileName)
}

// 查看详情
const viewDetails = (record: LimitAdjustment) => {
  emit('viewDetails', record)
}
</script>

<style scoped>
.limit-adjustment-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.title-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.table-content {
  padding: 0;
}

.credit-no-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.credit-no {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.copy-icon {
  width: 12px;
  height: 12px;
  color: #86909c;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.credit-no-cell:hover .copy-icon {
  opacity: 1;
}

.copy-icon:hover {
  color: #165dff;
}

.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.amount.before {
  color: #86909c;
}

.amount.after {
  color: #165dff;
}

.adjustment {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.adjustment.positive {
  color: #00b42a;
}

.adjustment.negative {
  color: #f53f3f;
}

.adjustment.neutral {
  color: #86909c;
}

.rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #165dff;
  font-weight: 500;
}

.period {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.reason {
  font-size: 13px;
  color: #1d2129;
  cursor: help;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-buttons .action-icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .table-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>