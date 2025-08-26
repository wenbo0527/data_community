<template>
  <div class="loan-record-table">
    <div class="table-header">
      <h3 class="table-title">
        <CreditCard class="title-icon" />
        用信列表
      </h3>
      <div class="table-actions">
        <a-input-search
          v-model="searchText"
          placeholder="搜索用信单号、银行卡号、借据号"
          style="width: 280px"
          @search="handleSearch"
          @clear="handleSearch"
          allow-clear
        />
        <a-select
          v-model="statusFilter"
          placeholder="借据状态"
          style="width: 120px"
          allow-clear
          @change="handleFilter"
        >
          <a-option value="正常">正常</a-option>
          <a-option value="逾期">逾期</a-option>
          <a-option value="结清">结清</a-option>
          <a-option value="呆账">呆账</a-option>
        </a-select>
        <a-range-picker
          v-model="dateRange"
          placeholder="选择日期范围"
          style="width: 240px"
          allow-clear
          @change="handleFilter"
        />
        <a-button type="text" size="small" @click="refreshData">
          <RefreshCw class="action-icon" />
          刷新
        </a-button>
        <a-button type="text" size="small" @click="exportData">
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
        :scroll="{ x: 1400 }"
        row-key="loanNo"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="用信单号" data-index="loanNo" width="140" fixed="left">
            <template #cell="{ record }">
              <div class="loan-no-cell">
                <span class="loan-no">{{ record.loanNo }}</span>
                <a-button type="text" size="mini" @click="copyText(record.loanNo)">
                  <Copy class="copy-icon" />
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="用信日期" data-index="loanDate" width="120">
            <template #cell="{ record }">
              {{ formatDate(record.loanDate) }}
            </template>
          </a-table-column>

          <a-table-column title="银行卡号" data-index="bankCard" width="140">
            <template #cell="{ record }">
              <div class="bank-card-cell">
                <span class="bank-card">{{ record.bankCard }}</span>
                <a-button type="text" size="mini" @click="copyText(record.bankCard)">
                  <Copy class="copy-icon" />
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="渠道" data-index="channel" width="100" />

          <a-table-column title="产品名称" data-index="productName" width="120" />

          <a-table-column title="用信结果" data-index="result" width="100">
            <template #cell="{ record }">
              <a-tag :color="getLoanStatusColor(record.result)" size="small">
                {{ record.result }}
              </a-tag>
            </template>
          </a-table-column>

          <a-table-column title="拒绝原因" data-index="rejectReason" width="120">
            <template #cell="{ record }">
              <span v-if="record.rejectReason && record.rejectReason !== '-'" class="reject-reason">
                {{ record.rejectReason }}
              </span>
              <span v-else class="no-reason">-</span>
            </template>
          </a-table-column>

          <a-table-column title="借据号" data-index="contractNo" width="140">
            <template #cell="{ record }">
              <div class="contract-no-cell">
                <span class="contract-no">{{ record.contractNo }}</span>
                <a-button type="text" size="mini" @click="copyText(record.contractNo)">
                  <Copy class="copy-icon" />
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="借据状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getContractStatusColor(record.status)" size="small">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>

          <a-table-column title="借款金额" data-index="amount" width="120" align="right">
            <template #cell="{ record }">
              <span class="amount">{{ formatAmount(record.amount) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="剩余本金" data-index="balance" width="120" align="right">
            <template #cell="{ record }">
              <span class="balance">{{ formatAmount(record.balance) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="期数" data-index="installments" width="80" align="center">
            <template #cell="{ record }">
              <span class="installments">{{ record.installments }}</span>
            </template>
          </a-table-column>

          <a-table-column title="已还期数" data-index="paidInstallments" width="100" align="center">
            <template #cell="{ record }">
              <span class="paid-installments">{{ record.paidInstallments }}/{{ record.installments }}</span>
            </template>
          </a-table-column>

          <a-table-column title="下期应还" data-index="nextPayment" width="120" align="right">
            <template #cell="{ record }">
              <span class="next-payment">{{ formatAmount(record.nextPayment) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="下期还款日" data-index="nextPaymentDate" width="120">
            <template #cell="{ record }">
              {{ formatDate(record.nextPaymentDate) }}
            </template>
          </a-table-column>

          <a-table-column title="操作" width="180" fixed="right">
            <template #cell="{ record }">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="viewRepaymentDetails(record)">
                  <Eye class="action-icon" />
                  还款详情
                </a-button>
                <a-button type="text" size="small" @click="viewDisbursementDetails(record)">
                  <FileText class="action-icon" />
                  放款详情
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
import { CreditCard, RefreshCw, Download, Copy, Eye, FileText } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'
import { exportToExcel } from '@/utils/export'

interface LoanRecord {
  productKey: string
  loanNo: string
  loanDate: string
  bankCard: string
  channel: string
  productName: string
  result: string
  rejectReason: string
  contractNo: string
  status: string
  amount: number
  balance: number
  installments: number
  paidInstallments: number
  nextPayment: number
  nextPaymentDate: string
  repaymentDetails?: any[]
  repaymentPlan?: any[]
}

interface Props {
  data: LoanRecord[]
  loading?: boolean
  productKey?: string
}

interface Emits {
  refresh: []
  export: []
  viewRepaymentDetails: [record: LoanRecord]
  viewDisbursementDetails: [record: LoanRecord]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  productKey: ''
})

const emit = defineEmits<Emits>()

// 搜索和筛选状态
const searchText = ref('')
const statusFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)

// 分页配置
const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 计算属性 - 过滤后的数据
const filteredData = computed(() => {
  let data = props.data || []
  
  // 产品过滤
  if (props.productKey) {
    data = data.filter((item: LoanRecord) => item.productKey === props.productKey)
  }
  
  // 搜索过滤
  if (searchText.value) {
    data = data.filter((item: LoanRecord) => {
      const searchLower = searchText.value.toLowerCase()
      return (
        item.loanNo?.toLowerCase().includes(searchLower) ||
        item.bankCard?.toLowerCase().includes(searchLower) ||
        item.contractNo?.toLowerCase().includes(searchLower)
      )
    })
  }
  
  // 状态过滤
  if (statusFilter.value) {
    data = data.filter((item: LoanRecord) => item.status === statusFilter.value)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    data = data.filter((item: LoanRecord) => {
      const itemDate = new Date(item.loanDate)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  return data
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

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取用信状态颜色
const getLoanStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '通过': 'green',
    '拒绝': 'red',
    '待审核': 'orange',
    '审核中': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 获取借据状态颜色
const getContractStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'blue',
    '呆账': 'red'
  }
  return colorMap[status] || 'gray'
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
  const exportList = filteredData.value.map(record => ({
    '用信单号': record.loanNo,
    '用信日期': record.loanDate,
    '银行卡号': record.bankCard,
    '渠道': record.channel,
    '产品名称': record.productName,
    '用信结果': record.result,
    '拒绝原因': record.rejectReason || '-',
    '借据号': record.contractNo,
    '借据状态': record.status,
    '借款金额': formatAmount(record.amount),
    '剩余本金': formatAmount(record.balance),
    '期数': `${record.installments}期`,
    '已还期数': `${record.paidInstallments}/${record.installments}`,
    '下期应还': formatAmount(record.nextPayment),
    '下期还款日': record.nextPaymentDate
  }))
  
  const fileName = `用信列表_${new Date().toISOString().split('T')[0]}`
  exportToExcel(exportList, fileName)
}

// 查看还款详情
const viewRepaymentDetails = (record: LoanRecord) => {
  emit('viewRepaymentDetails', record)
}

// 查看放款详情
const viewDisbursementDetails = (record: LoanRecord) => {
  emit('viewDisbursementDetails', record)
}
</script>

<style scoped>
.loan-record-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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
  gap: 12px;
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

.loan-no-cell,
.bank-card-cell,
.contract-no-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loan-no,
.bank-card,
.contract-no {
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

.loan-no-cell:hover .copy-icon,
.bank-card-cell:hover .copy-icon,
.contract-no-cell:hover .copy-icon {
  opacity: 1;
}

.copy-icon:hover {
  color: #165dff;
}

.reject-reason {
  color: #f53f3f;
  font-size: 12px;
}

.no-reason {
  color: #86909c;
}

.amount,
.balance,
.next-payment {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.amount {
  color: #165dff;
}

.balance {
  color: #f53f3f;
}

.next-payment {
  color: #ff7d00;
}

.installments,
.paid-installments {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>