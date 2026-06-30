<template>
  <div class="loan-record-table">
    <div class="section-header">
      <div class="header-left">
        <IconSwap class="section-icon" />
        <span class="section-title">用信列表</span>
        <a-badge :count="data.length" class="section-badge" />
      </div>
      <div class="header-right">
        <a-button size="mini" @click="showAll = !showAll">
          <template #icon>
            <IconExpand :class="{ 'icon-expanded': showAll }" />
          </template>
          {{ showAll ? '收起更多列' : '展开更多列' }}
        </a-button>
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
      :columns="visibleColumns"
      row-key="id"
      size="small"
      @page-change="handlePageChange"
    >
      <template #loanNo="{ record }">
        <a-tooltip content="点击复制">
          <span class="copyable" @click="copyText(record.loanNo)">{{ record.loanNo || '-' }}</span>
        </a-tooltip>
      </template>

      <template #thirdPartyCustomerId="{ record }">
        <a-tooltip content="点击复制">
          <span class="copyable" @click="copyText(record.thirdPartyCustomerId)">
            {{ record.thirdPartyCustomerId || '-' }}
          </span>
        </a-tooltip>
      </template>

      <template #loanDate="{ record }">
        <span>{{ record.loanDate || '-' }}</span>
      </template>

      <template #channel="{ record }">
        <a-tag v-if="record.channel" :color="getChannelColor(record.channel)" size="small">
          {{ record.channel }}
        </a-tag>
        <span v-else>-</span>
      </template>

      <template #productName="{ record }">
        <span>{{ record.productName || '-' }}</span>
      </template>

      <template #result="{ record }">
        <a-tag :color="getResultColor(record.result)" size="small">
          {{ record.result || '-' }}
        </a-tag>
      </template>

      <template #rejectReason="{ record }">
        <span v-if="record.rejectReason" class="text-red-500">{{ record.rejectReason }}</span>
        <span v-else>-</span>
      </template>

      <template #contractNo="{ record }">
        <a-tooltip v-if="record.contractNo" content="点击复制">
          <span class="copyable" @click="copyText(record.contractNo)">{{ record.contractNo }}</span>
        </a-tooltip>
        <span v-else>-</span>
      </template>

      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" size="small">
          {{ record.status || '-' }}
        </a-tag>
      </template>

      <template #amount="{ record }">
        <span class="amount amount-blue">{{ formatAmount(record.amount) }}</span>
      </template>

      <template #balance="{ record }">
        <span class="amount amount-green">{{ formatAmount(record.balance) }}</span>
      </template>

      <template #installments="{ record }">
        <span>{{ record.installments || '-' }}{{ record.installments ? '期' : '' }}</span>
      </template>

      <template #overdueDays="{ record }">
        <span :class="{ 'amount-red font-medium': (record.overdueDays || 0) > 0 }">
          {{ record.overdueDays || 0 }}
        </span>
      </template>

      <template #maxOverdueDays="{ record }">
        <span :class="{ 'amount-red font-medium': (record.maxOverdueDays || 0) > 0 }">
          {{ record.maxOverdueDays || 0 }}
        </span>
      </template>

      <template #settlementDate="{ record }">
        <span v-if="record.settlementDate" class="text-green-600">{{ record.settlementDate }}</span>
        <span v-else>-</span>
      </template>

      <template #currentPeriod="{ record }">
        <span>{{ record.currentPeriod || '-' }}{{ record.currentPeriod ? '/' + (record.installments || '?') : '' }}</span>
      </template>

      <template #remainingPrincipal="{ record }">
        <span class="amount amount-blue">{{ formatAmount(record.remainingPrincipal) }}</span>
      </template>

      <template #remainingInterest="{ record }">
        <span class="amount amount-orange">{{ formatAmount(record.remainingInterest) }}</span>
      </template>

      <template #remainingPenalty="{ record }">
        <span class="amount amount-red">{{ formatAmount(record.remainingPenalty) }}</span>
      </template>

      <template #remainingTotal="{ record }">
        <span class="amount amount-purple font-semibold">{{ formatAmount(record.remainingTotal) }}</span>
      </template>

      <template #interestRate="{ record }">
        <span class="amount-green font-medium">
          {{ record.interestRate != null ? record.interestRate + '%' : '-' }}
        </span>
      </template>

      <template #actions="{ record }">
        <a-space>
          <a-button size="mini" type="primary" @click="$emit('view-loan-detail', record)">
            <template #icon><IconEye /></template>
            详情
          </a-button>
          <a-dropdown trigger="click">
            <a-button size="mini">
              <template #icon><IconMore /></template>
              更多
            </a-button>
            <template #content>
              <a-doption
                :disabled="record.status === '已结清'"
                @click="$emit('view-disbursement-details', record)"
              >
                <template #icon><IconStorage /></template>
                放款信息
              </a-doption>
              <a-doption @click="$emit('view-repayment-details', record)">
                <template #icon><IconHistory /></template>
                还款信息
              </a-doption>
              <a-doption @click="$emit('view-loan-tags', record)">
                <template #icon><IconTag /></template>
                查看标签
              </a-doption>
              <a-doption @click="$emit('view-initial-repayment-plan', record)">
                <template #icon><IconCalendar /></template>
                初始还款计划
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconSwap,
  IconEye,
  IconMore,
  IconStorage,
  IconHistory,
  IconTag,
  IconExpand,
  IconCalendar
} from '@arco-design/web-vue/es/icon'

interface LoanRecord {
  id?: string
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
  (e: 'view-loan-tags', record: LoanRecord): void
  (e: 'view-initial-repayment-plan', record: LoanRecord): void
}

const emit = defineEmits<Emits>()

const showAll = ref(false)

const paginationConfig = computed(() => ({
  current: 1,
  pageSize: 10,
  total: props.data.length,
  showTotal: true,
  showPageSize: true
}))

// 列分组定义：core 常驻，extra 仅在展开更多列时显示
const columnGroups: Record<string, { title: string; columns: any[] }> = {
  basic: {
    title: '基本信息',
    columns: [
      { title: '用信编号', dataIndex: 'loanNo', slotName: 'loanNo', width: 150, fixed: 'left' },
      { title: '用信日期', dataIndex: 'loanDate', slotName: 'loanDate', width: 120 },
      { title: '产品名称', dataIndex: 'productName', slotName: 'productName', width: 130 },
      { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 }
    ]
  },
  result: {
    title: '用信结果',
    columns: [
      { title: '结果', dataIndex: 'result', slotName: 'result', width: 80 },
      { title: '拒绝原因', dataIndex: 'rejectReason', slotName: 'rejectReason', width: 140 },
      { title: '合同编号', dataIndex: 'contractNo', slotName: 'contractNo', width: 160 },
      { title: '渠道', dataIndex: 'channel', slotName: 'channel', width: 80 }
    ]
  },
  amount: {
    title: '金额信息',
    columns: [
      { title: '用信金额', dataIndex: 'amount', slotName: 'amount', width: 110 },
      { title: '当前余额', dataIndex: 'balance', slotName: 'balance', width: 110 },
      { title: '分期数', dataIndex: 'installments', slotName: 'installments', width: 80 }
    ]
  },
  remaining: {
    title: '剩余应还',
    columns: [
      { title: '剩余本金', dataIndex: 'remainingPrincipal', slotName: 'remainingPrincipal', width: 110 },
      { title: '剩余利息', dataIndex: 'remainingInterest', slotName: 'remainingInterest', width: 110 },
      { title: '剩余罚息', dataIndex: 'remainingPenalty', slotName: 'remainingPenalty', width: 110 },
      { title: '剩余应还', dataIndex: 'remainingTotal', slotName: 'remainingTotal', width: 120 },
      { title: '当前期次', dataIndex: 'currentPeriod', slotName: 'currentPeriod', width: 100 },
      { title: '结清日期', dataIndex: 'settlementDate', slotName: 'settlementDate', width: 120 },
      { title: '逾期天数', dataIndex: 'overdueDays', slotName: 'overdueDays', width: 90 },
      { title: '历史最大逾期', dataIndex: 'maxOverdueDays', slotName: 'maxOverdueDays', width: 110 },
      { title: '利率', dataIndex: 'interestRate', slotName: 'interestRate', width: 80 },
      { title: '三方客户号', dataIndex: 'thirdPartyCustomerId', slotName: 'thirdPartyCustomerId', width: 180 }
    ]
  }
}

// 核心列（默认显示）：基本信息 + 用信结果 + 金额信息
const coreColumnKeys = ['basic', 'result', 'amount']
const extraColumnKeys = ['remaining']

const visibleColumns = computed(() => {
  const keys = [...coreColumnKeys, ...(showAll.value ? extraColumnKeys : [])]
  const cols: any[] = []
  keys.forEach((key) => {
    cols.push(...columnGroups[key].columns)
  })
  cols.push({ title: '操作', slotName: 'actions', width: 160, fixed: 'right' })
  return cols
})

const handlePageChange = (page: number) => {
  paginationConfig.value.current = page
}

const formatAmount = (amount?: number | null) => {
  if (amount === null || amount === undefined) return '-'
  if (amount === 0) return '¥0'
  return `¥${amount.toLocaleString()}`
}

// 用信状态颜色
const getStatusColor = (status?: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '已结清': 'gray',
    '冻结': 'orange',
    '审批中': 'blue'
  }
  return colorMap[status || ''] || 'default'
}

// 用信结果颜色
const getResultColor = (result?: string) => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '失败': 'red',
    '审批中': 'orange',
    '已拒绝': 'red',
    '待审批': 'blue'
  }
  return colorMap[result || ''] || 'default'
}

// 渠道颜色
const getChannelColor = (channel?: string) => {
  const colorMap: Record<string, string> = {
    'APP': 'blue',
    'H5': 'cyan',
    '小程序': 'green',
    '人工': 'orange',
    'API': 'purple',
    '网银': 'gold'
  }
  return colorMap[channel || ''] || 'default'
}

const copyText = async (text?: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(String(text))
    Message.success('已复制到剪贴板')
  } catch (error) {
    console.error('Copy failed:', error)
    Message.error('复制失败')
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
  color: #1f2937;
  border-bottom: 1px dashed transparent;
  transition: all 0.2s;
}

.copyable:hover {
  color: #1655d0;
  border-bottom-color: #1655d0;
}

.amount {
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 500;
}

.amount-blue { color: #1655d0; }
.amount-green { color: #00b42a; }
.amount-orange { color: #ff7d00; }
.amount-red { color: #f53f3f; }
.amount-purple { color: #722ed1; }

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

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
}

.icon-expanded {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}
</style>