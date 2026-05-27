<template>
  <div class="loan-record-table">
    <div class="section-header">
      <div class="header-left">
        <IconSwap class="section-icon" />
        <span class="section-title">用信列表</span>
        <a-badge :count="data.length" class="section-badge" />
      </div>
      <div class="header-right">
        <a-tag color="blue" size="small">
          <template #icon><span class="live-dot"></span></template>
          实时
        </a-tag>
      </div>
    </div>
    
    <a-table 
      :data="data" 
      :loading="loading" 
      :pagination="paginationConfig"
      :columns="columns"
      size="small"
      @page-change="handlePageChange"
    >
      <template #loanNo="{ record }">
        <span class="copyable" @click="copyText(record.loanNo)">{{ record.loanNo || '-' }}</span>
      </template>
      
      <template #thirdPartyCustomerId="{ record }">
        <span class="copyable" @click="copyText(record.thirdPartyCustomerId)">
          {{ record.thirdPartyCustomerId || '-' }}
        </span>
      </template>
      
      <template #loanDate="{ record }">
        <span>{{ record.loanDate || '-' }}</span>
      </template>
      
      <template #channel="{ record }">
        <a-tag v-if="record.channel">{{ record.channel }}</a-tag>
        <span v-else>-</span>
      </template>
      
      <template #productName="{ record }">
        <span>{{ record.productName || '-' }}</span>
      </template>
      
      <template #result="{ record }">
        <a-tag :color="record.result === '成功' ? 'green' : record.result === '失败' ? 'red' : 'default'">
          {{ record.result || '-' }}
        </a-tag>
      </template>
      
      <template #rejectReason="{ record }">
        <span v-if="record.rejectReason" class="text-red-500">{{ record.rejectReason }}</span>
        <span v-else>-</span>
      </template>
      
      <template #contractNo="{ record }">
        <span class="copyable" @click="copyText(record.contractNo)" v-if="record.contractNo">{{ record.contractNo }}</span>
        <span v-else>-</span>
      </template>
      
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ record.status || '-' }}</a-tag>
      </template>
      
      <template #amount="{ record }">
        <span class="font-medium text-blue-600">{{ formatAmount(record.amount) }}</span>
      </template>
      
      <template #balance="{ record }">
        <span class="font-medium text-green-600">{{ formatAmount(record.balance) }}</span>
      </template>
      
      <template #installments="{ record }">
        <span>{{ record.installments || '-' }}</span>
      </template>
      
      <template #overdueDays="{ record }">
        <span :class="{ 'text-red-500 font-medium': record.overdueDays > 0 }">
          {{ record.overdueDays || 0 }}
        </span>
      </template>
      
      <template #maxOverdueDays="{ record }">
        <span :class="{ 'text-red-500 font-medium': record.maxOverdueDays > 0 }">
          {{ record.maxOverdueDays || 0 }}
        </span>
      </template>
      
      <template #settlementDate="{ record }">
        <span v-if="record.settlementDate" class="text-green-600">{{ record.settlementDate }}</span>
        <span v-else>-</span>
      </template>
      
      <template #currentPeriod="{ record }">
        <span>{{ record.currentPeriod || '-' }}</span>
      </template>
      
      <template #remainingPrincipal="{ record }">
        <span class="font-medium text-blue-600">{{ formatAmount(record.remainingPrincipal) }}</span>
      </template>
      
      <template #remainingInterest="{ record }">
        <span class="font-medium text-orange-600">{{ formatAmount(record.remainingInterest) }}</span>
      </template>
      
      <template #remainingPenalty="{ record }">
        <div class="flex items-center">
          <span class="font-medium text-red-600">{{ formatAmount(record.remainingPenalty) }}</span>
        </div>
      </template>
      
      <template #remainingTotal="{ record }">
        <span class="font-medium text-purple-600">{{ formatAmount(record.remainingTotal) }}</span>
      </template>
      
      <template #interestRate="{ record }">
        <span class="font-medium text-green-600">{{ record.interestRate ? record.interestRate + '%' : '-' }}</span>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button size="mini" type="primary" @click="$emit('view-loan-detail', record)">
            <template #icon><IconEye /></template>
            详情
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { IconSwap, IconEye } from '@arco-design/web-vue/es/icon'

interface LoanRecord {
  loanNo?: string
  thirdPartyCustomerId?: string
  loanDate?: string
  channel?: string
  productName?: string
  result?: string
  rejectReason?: string
  contractNo?: string
  status?: string
  amount?: number
  balance?: number
  installments?: number
  overdueDays?: number
  maxOverdueDays?: number
  settlementDate?: string
  currentPeriod?: number
  remainingPrincipal?: number
  remainingInterest?: number
  remainingPenalty?: number
  remainingTotal?: number
  interestRate?: number
}

interface Props {
  data: LoanRecord[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false
})

interface Emits {
  (e: 'view-loan-detail', record: LoanRecord): void
  (e: 'view-disbursement-details', record: LoanRecord): void
  (e: 'view-repayment-details', record: LoanRecord): void
}

const emit = defineEmits<Emits>()

const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: computed(() => props.data.length),
  showTotal: true,
  showPageSize: true
})

const columns = [
  { title: '用信编号', dataIndex: 'loanNo', slotName: 'loanNo', width: 140 },
  { title: '三方客户号', dataIndex: 'thirdPartyCustomerId', slotName: 'thirdPartyCustomerId', width: 160 },
  { title: '用信日期', dataIndex: 'loanDate', slotName: 'loanDate', width: 120 },
  { title: '渠道', dataIndex: 'channel', slotName: 'channel', width: 80 },
  { title: '产品名称', dataIndex: 'productName', slotName: 'productName', width: 120 },
  { title: '结果', dataIndex: 'result', slotName: 'result', width: 80 },
  { title: '拒绝原因', dataIndex: 'rejectReason', slotName: 'rejectReason', width: 120 },
  { title: '合同编号', dataIndex: 'contractNo', slotName: 'contractNo', width: 140 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '金额', dataIndex: 'amount', slotName: 'amount', width: 100 },
  { title: '余额', dataIndex: 'balance', slotName: 'balance', width: 100 },
  { title: '分期数', dataIndex: 'installments', slotName: 'installments', width: 70 },
  { title: '逾期天数', dataIndex: 'overdueDays', slotName: 'overdueDays', width: 80 },
  { title: '历史最大逾期', dataIndex: 'maxOverdueDays', slotName: 'maxOverdueDays', width: 100 },
  { title: '结清日期', dataIndex: 'settlementDate', slotName: 'settlementDate', width: 120 },
  { title: '当前期次', dataIndex: 'currentPeriod', slotName: 'currentPeriod', width: 80 },
  { title: '剩余本金', dataIndex: 'remainingPrincipal', slotName: 'remainingPrincipal', width: 100 },
  { title: '剩余利息', dataIndex: 'remainingInterest', slotName: 'remainingInterest', width: 100 },
  { title: '剩余罚息', dataIndex: 'remainingPenalty', slotName: 'remainingPenalty', width: 100 },
  { title: '剩余应还', dataIndex: 'remainingTotal', slotName: 'remainingTotal', width: 100 },
  { title: '利率', dataIndex: 'interestRate', slotName: 'interestRate', width: 80 },
  { title: '操作', slotName: 'actions', width: 80 }
]

const handlePageChange = (page: number) => {
  paginationConfig.value.current = page
}

const formatAmount = (amount: number) => {
  if (amount === 0) return '¥0'
  if (!amount) return '-'
  return `¥${amount.toLocaleString()}`
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '已结清': 'gray',
    '冻结': 'orange'
  }
  return colorMap[status] || 'default'
}

const copyText = async (text: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(String(text))
  } catch (error) {
    console.error('Copy failed:', error)
  }
}
</script>

<style scoped>
.loan-record-table {
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 16px;
  color: #4b5563;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copyable {
  cursor: pointer;
  transition: color 0.2s;
}

.copyable:hover {
  color: #1655d0;
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  margin-right: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>