<template>
  <div class="loan-record-table">
    <div class="table-header">
      <div class="table-header-left">
        <h3 class="table-title">
          <CreditCard class="title-icon" />
          用信列表
        </h3>
        <div class="data-update-time">
          <a-tag color="green" size="small">
            <template #icon><span class="live-dot"></span></template>
            数据时效为实时
          </a-tag>
        </div>
      </div>
      <div class="table-actions">
        <a-button type="primary" size="small" @click="copyAllData" style="background-color: var(--subapp-primary); border-color: var(--subapp-primary);">
          <Copy class="action-icon" />
          一键复制
        </a-button>
      </div>
    </div>

    <div class="table-content">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 1400 }"
        row-key="loanNo"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column 
            title="产品名称" 
            data-index="productName" 
            :width="120" 
            fixed="left"
            :filterable="{
              filters: getProductFilters(),
              filter: (value, record) => record.productName === value,
              multiple: true
            }"
          />

          <a-table-column title="借据号" data-index="contractNo" :width="140">
            <template #cell="{ record }">
              <div class="contract-no-cell">
                <span class="contract-no">{{ record.contractNo }}</span>
                <a-button type="text" size="mini" @click="copyText(record.contractNo)">
                  <Copy class="copy-icon" />
                </a-button>
              </div>
            </template>
          </a-table-column>

          <a-table-column 
            title="放款时间" 
            data-index="loanDate" 
            :width="120"
            :sortable="{
              sortDirections: ['ascend', 'descend']
            }"
          >
            <template #cell="{ record }">
              {{ formatDate(record.loanDate) }}
            </template>
          </a-table-column>

          <a-table-column 
            title="借据状态" 
            data-index="status" 
            :width="100"
            :filterable="{
              filters: [
                { text: '正常', value: '正常' },
                { text: '逾期', value: '逾期' },
                { text: '结清', value: '结清' },
                { text: '呆账', value: '呆账' }
              ],
              filter: (value, record) => record.status === value,
              multiple: true
            }"
          >
            <template #cell="{ record }">
              <a-tag :color="getContractStatusColor(record.status)" size="small">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>

          <a-table-column 
            title="借款金额" 
            data-index="amount" 
            :width="120" 
            align="right"
            :sortable="{
              sortDirections: ['ascend', 'descend']
            }"
          >
            <template #cell="{ record }">
              <span class="amount">{{ formatAmount(record.amount) }}</span>
            </template>
          </a-table-column>

          <a-table-column title="期数" data-index="installments" :width="80" align="center">
            <template #cell="{ record }">
              <span class="installments">{{ record.installments }}</span>
            </template>
          </a-table-column>

          <a-table-column 
            title="逾期天数" 
            data-index="overdueDays" 
            :width="100" 
            align="center"
            :sortable="{
              sortDirections: ['ascend', 'descend']
            }"
          >
            <template #cell="{ record }">
              <span :class="{ 'text-red-500': record.overdueDays > 0 }">
                {{ record.overdueDays }}
              </span>
            </template>
          </a-table-column>

          <a-table-column 
            title="历史最大逾期天数" 
            data-index="maxOverdueDays" 
            :width="140" 
            align="center"
            :sortable="{
              sortDirections: ['ascend', 'descend']
            }"
          >
            <template #cell="{ record }">
              <span :class="{ 'text-orange-500': record.maxOverdueDays > 0 }">
                {{ record.maxOverdueDays }}
              </span>
            </template>
          </a-table-column>

          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="viewLoanDetail(record)">
                  详情
                </a-button>
                <a-button type="text" size="small" @click="viewDisbursementDetail(record)">
                  放款明细
                </a-button>
                <a-button type="text" size="small" @click="viewRepaymentDetail(record)">
                  还款明细
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>

  <!-- 借据详情抽屉 -->
  <LoanDetailDrawer
    v-model:visible="drawerVisible"
    :loan-data="selectedLoan"
    @view-disbursement-details="handleViewDisbursementDetails"
    @view-repayment-details="handleViewRepaymentDetails"
  />

  <!-- 放款明细抽屉 -->
  <DisbursementDrawer
    v-model:visible="disbursementDrawerVisible"
    :loan-record="selectedLoan"
  />

  <!-- 还款明细抽屉 -->
  <RepaymentDrawer
    v-model:visible="repaymentDrawerVisible"
    :loan-record="selectedLoan"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CreditCard, Copy } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'
import LoanDetailDrawer from './LoanDetailDrawer.vue'
import DisbursementDrawer from './DisbursementDrawer.vue'
import RepaymentDrawer from './RepaymentDrawer.vue'

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
  // 新增字段
  overdueDays: number
  maxOverdueDays: number
  settlementDate?: string
  currentPeriod: number
  remainingPrincipal: number
  remainingInterest: number
  remainingPenalty: number
  remainingTotal: number
  loanRate: number
  repaymentDetails?: any[]
  repaymentPlan?: any[]
  // 券使用信息
  voucherTemplateId?: string
  voucherInventoryId?: string
  voucherName?: string
  hasLockPeriod?: boolean
  lockPeriodValue?: number
  limitMethod?: string
  resolveLockDate?: string
}

interface Props {
  data: LoanRecord[]
  loading?: boolean
  productKey?: string
}

interface Emits {
  viewLoanDetail: [record: LoanRecord]
  viewDisbursementDetails: [record: LoanRecord]
  viewRepaymentDetails: [record: LoanRecord]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  productKey: ''
})

const emit = defineEmits<Emits>()

// 组件状态
const drawerVisible = ref(false)
const disbursementDrawerVisible = ref(false)
const repaymentDrawerVisible = ref(false)
const selectedLoan = ref<LoanRecord | null>(null)

// 分页配置
const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 计算属性 - 当前日期
const currentDateTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
})

// 获取产品筛选器选项
const getProductFilters = () => {
  const products = [...new Set(props.data.map(item => item.productName))]
  return products.map(product => ({ text: product, value: product }))
}

// 计算属性 - 表格数据
const tableData = computed(() => {
  return props.data || []
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

// 一键复制所有数据
const copyAllData = async () => {
  try {
    const headers = [
      // 基础信息
      '产品名称', '借据号', '放款时间', '借据状态', '借款金额', '期数', '借款利率', '当前期次', '还款日',
      // 状态信息
      '结清日期', '逾期日期', '是否核销', '是否理赔',
      // 还款信息
      '实际还款本金', '实际还款利息', '实际还款罚息', '剩余本金', '剩余利息', '剩余罚息', '剩余应还总额',
      // 用信信息
      '用信单号', '用信日期', '用信结果', '拒绝原因',
      // 券使用信息
      '券模板ID', '券库存ID', '券名称', '是否设定锁定期', '锁定期限值', '限定方式', '解决锁定接触日期',
      // 账户信息
      '银行卡号', '渠道',
      // 其他字段
      '逾期天数', '历史最大逾期天数', '已还期数', '下期应还', '下期还款日'
    ]
    const headerRow = headers.join('\t')
    
    const dataRows = tableData.value.map(record => [
      // 基础信息
      record.productName || '-',
      record.contractNo || '-',
      record.loanDate ? formatDate(record.loanDate) : '-',
      record.status || '-',
      record.amount ? formatAmount(record.amount) : '-',
      record.installments || '-',
      record.loanRate ? `${(record.loanRate * 100).toFixed(2)}%` : '-',
      record.currentPeriod || '-',
      record.nextPaymentDate ? formatDate(record.nextPaymentDate) : '-',
      // 状态信息
      record.settlementDate ? formatDate(record.settlementDate) : '-',
      record.overdueDate ? formatDate(record.overdueDate) : '-',
      record.isWriteOff ? '是' : '否',
      record.isClaimed ? '是' : '否',
      // 还款信息
      record.actualPaidPrincipal ? formatAmount(record.actualPaidPrincipal) : '-',
      record.actualPaidInterest ? formatAmount(record.actualPaidInterest) : '-',
      record.actualPaidPenalty ? formatAmount(record.actualPaidPenalty) : '-',
      record.remainingPrincipal ? formatAmount(record.remainingPrincipal) : '-',
      record.remainingInterest ? formatAmount(record.remainingInterest) : '-',
      record.remainingPenalty ? formatAmount(record.remainingPenalty) : '-',
      record.remainingTotal ? formatAmount(record.remainingTotal) : '-',
      // 用信信息
      record.loanNo || '-',
      record.loanDate ? formatDate(record.loanDate) : '-',
      record.result || '-',
      record.rejectReason || '-',
      // 券使用信息
      record.voucherTemplateId || '-',
      record.voucherInventoryId || '-',
      record.voucherName || '-',
      record.hasLockPeriod === true ? '是' : (record.hasLockPeriod === false ? '否' : '-'),
      record.lockPeriodValue !== undefined ? record.lockPeriodValue : '-',
      record.limitMethod || '-',
      record.resolveLockDate ? formatDate(record.resolveLockDate) : '-',
      // 账户信息
      record.bankCard || '-',
      record.channel || '-',
      // 其他字段
      record.overdueDays || '0',
      record.maxOverdueDays || '0',
      `${record.paidInstallments || 0}/${record.installments || 0}`,
      record.nextPayment ? formatAmount(record.nextPayment) : '-',
      record.nextPaymentDate ? formatDate(record.nextPaymentDate) : '-'
    ].join('\t'))
    
    const allData = [headerRow, ...dataRows].join('\n')
    await navigator.clipboard.writeText(allData)
    Message.success(`复制成功！已复制 ${tableData.value.length} 条记录的完整数据到剪贴板`)
  } catch (error) {
    Message.error('复制失败')
  }
}



// 分页处理
const handlePageChange = (page: number) => {
  paginationConfig.value.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.value.pageSize = pageSize
  paginationConfig.value.current = 1
}

// 监听数据变化，更新分页总数
watch(() => tableData.value, (newData) => {
  paginationConfig.value.total = newData.length
  paginationConfig.value.current = 1
}, { immediate: true })



// 查看借据详情
const viewLoanDetail = (record: LoanRecord) => {
  selectedLoan.value = record
  drawerVisible.value = true
}

// 查看放款明细
const viewDisbursementDetail = (record: LoanRecord) => {
  selectedLoan.value = record
  disbursementDrawerVisible.value = true
}

// 查看还款明细
const viewRepaymentDetail = (record: LoanRecord) => {
  selectedLoan.value = record
  repaymentDrawerVisible.value = true
}

// 处理从借据详情抽屉打开放款明细
const handleViewDisbursementDetails = (loanData: LoanRecord) => {
  selectedLoan.value = loanData
  drawerVisible.value = false // 关闭借据详情抽屉
  disbursementDrawerVisible.value = true // 打开放款明细抽屉
}

// 处理从借据详情抽屉打开还款明细
const handleViewRepaymentDetails = (loanData: LoanRecord) => {
  selectedLoan.value = loanData
  drawerVisible.value = false // 关闭借据详情抽屉
  repaymentDrawerVisible.value = true // 打开还款明细抽屉
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--subapp-border);
  background: #fafafa;
}

.table-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.data-update-time {
  display: flex;
  align-items: center;
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--subapp-success);
  margin-right: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.title-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: var(--subapp-primary);
}

.action-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.dropdown-icon {
  width: 12px;
  height: 12px;
  margin-left: 4px;
  transition: transform 0.2s;
}

.menu-icon {
  width: 14px;
  height: 14px;
  margin-right: 8px;
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
  color: var(--subapp-text-tertiary);
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
  color: var(--subapp-primary);
}

.reject-reason {
  color: var(--subapp-danger);
  font-size: 12px;
}

.no-reason {
  color: var(--subapp-text-tertiary);
}

.amount,
.balance,
.next-payment,
.remaining-principal,
.remaining-interest,
.remaining-penalty,
.remaining-total {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.amount {
  color: var(--subapp-primary);
}

.balance {
  color: var(--subapp-danger);
}

.next-payment {
  color: var(--subapp-warning);
}

.remaining-principal {
  color: var(--subapp-primary);
}

.remaining-interest {
  color: var(--subapp-warning);
}

.remaining-penalty {
  color: var(--subapp-danger);
}

.remaining-total {
  color: var(--subapp-info);
  font-weight: 700;
}

.penalty-tooltip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.penalty-icon {
  width: 14px;
  height: 14px;
  color: var(--subapp-danger);
  cursor: help;
}

.overdue-days {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: var(--subapp-danger);
}

.overdue-days.zero {
  color: var(--subapp-success);
}

.loan-rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  color: var(--subapp-info);
}

.installments,
.paid-installments {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 6px;
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
  border-bottom: 1px solid var(--subapp-border);
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