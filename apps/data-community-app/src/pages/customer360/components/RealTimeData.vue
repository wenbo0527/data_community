<template>
  <div class="real-time-data-container">

    <!-- 额度指标卡 -->
    <div class="data-section">
      <div class="quota-grid">
        <div class="quota-card">
          <div class="quota-label">授信额度</div>
          <div class="quota-value">{{ formatCurrency(totalCreditLimit) }}</div>
          <div class="quota-desc">总授信额度</div>
        </div>
        <div class="quota-card">
          <div class="quota-label">可用额度</div>
          <div class="quota-value available">{{ formatCurrency(availableCredit) }}</div>
          <div class="quota-desc">当前可用额度</div>
        </div>
      </div>
    </div>

    <!-- 授信列表 -->
    <div class="data-section">
      <h3 class="section-title">授信列表</h3>
      <a-table :data="creditList" :columns="creditColumns" :pagination="false" size="small" :bordered="true">
        <template #totalAmount="{ record }">
          {{ formatCurrency(record.totalAmount) }}
        </template>
        <template #currentAmount="{ record }">
          {{ formatCurrency(record.currentAmount) }}
        </template>
        <template #interestRate="{ record }">
          {{ record.interestRate != null ? record.interestRate + '%' : '-' }}
        </template>
        <template #result="{ record }">
          <a-tag :color="getResultColor(record.result)">{{ record.result || '-' }}</a-tag>
        </template>
        <template #rejectReason="{ record }">
          <span v-if="record.rejectReason" class="text-red-500">{{ record.rejectReason }}</span>
          <span v-else>-</span>
        </template>
        <template #availableDays="{ record }">
          {{ record.availableDays != null ? record.availableDays + '天' : '-' }}
        </template>
      </a-table>
    </div>

    <!-- 用信列表 -->
    <div class="data-section">
      <h3 class="section-title">用信列表</h3>
      <a-table :data="loanList" :columns="loanColumns" :pagination="false" size="small" :bordered="true" :scroll="{ x: 1400 }">
        <template #loanNo="{ record }">
          <span class="copyable" @click="copyText(record.loanNo)">{{ record.loanNo || '-' }}</span>
        </template>
        <template #bankCardNo="{ record }">
          <span class="copyable" @click="copyText(record.bankCardNo)">{{ record.bankCardNo || '-' }}</span>
        </template>
        <template #result="{ record }">
          <a-tag :color="getResultColor(record.result)">{{ record.result || '-' }}</a-tag>
        </template>
        <template #rejectReason="{ record }">
          <span v-if="record.rejectReason" style="color: #f5222d;">{{ record.rejectReason }}</span>
          <span v-else>-</span>
        </template>
        <template #iouNo="{ record }">
          <span v-if="record.iouNo" class="copyable" @click="copyText(record.iouNo)">{{ record.iouNo }}</span>
          <span v-else>-</span>
        </template>
        <template #thirdPartyIouNo="{ record }">
          <span v-if="record.thirdPartyIouNo" class="copyable" @click="copyText(record.thirdPartyIouNo)">{{ record.thirdPartyIouNo }}</span>
          <span v-else>-</span>
        </template>
        <template #iouStatus="{ record }">
          <a-tag :color="getIouStatusColor(record.iouStatus)">{{ record.iouStatus || '-' }}</a-tag>
        </template>
        <template #amount="{ record }">
          {{ formatCurrency(record.amount) }}
        </template>
        <template #installments="{ record }">
          {{ record.installments != null && record.installments > 0 ? record.installments + '期' : '-' }}
        </template>
        <template #loanActions="{ record }">
          <a-space :size="4">
            <a-button type="text" size="mini" @click="handleLoanDetail(record)">查看</a-button>
            <a-button type="text" size="mini" @click="copyText(JSON.stringify(record, null, 2))">复制</a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 授信记录
interface CreditRecord {
  creditNo?: string
  creditDate?: string
  channel?: string
  result?: string
  rejectReason?: string
  totalAmount?: number
  currentAmount?: number
  interestRate?: number
  riskLevel?: string
  availableDays?: number
}

// 用信记录
interface LoanRecord {
  loanNo?: string
  loanDate?: string
  bankCardNo?: string
  result?: string
  rejectReason?: string
  iouNo?: string
  thirdPartyIouNo?: string
  iouStatus?: string
  amount?: number
  installments?: number
}

interface Props {
  productKey?: string
  productData?: any
  userRealTimeData?: any
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 授信额度汇总
const totalCreditLimit = computed(() => {
  if (props.userRealTimeData?.totalCreditLimit) return props.userRealTimeData.totalCreditLimit
  if (props.productData?.currentTotalCreditAmount) return props.productData.currentTotalCreditAmount
  return 250000
})

// 可用额度
const availableCredit = computed(() => {
  if (props.userRealTimeData?.availableCredit !== undefined) return props.userRealTimeData.availableCredit
  if (props.productData) {
    const total = props.productData.currentTotalCreditAmount || 0
    const used = props.productData.currentTotalLoanBalance || 0
    return Math.max(0, total - used)
  }
  return props.userRealTimeData?.usedCredit
    ? props.userRealTimeData.totalCreditLimit - props.userRealTimeData.usedCredit
    : 50000
})

// 授信列表
const creditList = computed<CreditRecord[]>(() =>
  (props.userRealTimeData?.creditList?.length)
    ? props.userRealTimeData.creditList
    : [
        { creditNo: 'CR20260501001', creditDate: '2026-05-01', channel: 'APP', result: '成功', rejectReason: null, totalAmount: 100000, currentAmount: 85000, interestRate: 4.2, riskLevel: 'A', availableDays: 180 },
        { creditNo: 'CR20260415002', creditDate: '2026-04-15', channel: 'H5', result: '成功', rejectReason: null, totalAmount: 50000, currentAmount: 50000, interestRate: 5.1, riskLevel: 'B', availableDays: 90 },
        { creditNo: 'CR20260301003', creditDate: '2026-03-01', channel: '人工', result: '拒绝', rejectReason: '信用评分不足', totalAmount: 80000, currentAmount: 0, interestRate: null, riskLevel: 'C', availableDays: 0 },
        { creditNo: 'CR20260110004', creditDate: '2026-01-10', channel: 'APP', result: '成功', rejectReason: null, totalAmount: 150000, currentAmount: 0, interestRate: 3.9, riskLevel: 'A', availableDays: 0 }
      ]
)

// 用信列表
const loanList = computed<LoanRecord[]>(() =>
  (props.userRealTimeData?.loanList?.length)
    ? props.userRealTimeData.loanList
    : [
        { loanNo: 'LN20260501001', loanDate: '2026-05-01', bankCardNo: '****1234', result: '成功', rejectReason: null, iouNo: 'IOU-2026-0501-001', thirdPartyIouNo: 'TPI-2026-0501-001', iouStatus: '正常', amount: 50000, installments: 12 },
        { loanNo: 'LN20260420002', loanDate: '2026-04-20', bankCardNo: '****5678', result: '成功', rejectReason: null, iouNo: 'IOU-2026-0420-002', thirdPartyIouNo: 'TPI-2026-0420-002', iouStatus: '正常', amount: 30000, installments: 6 },
        { loanNo: 'LN20260315003', loanDate: '2026-03-15', bankCardNo: '****9012', result: '成功', rejectReason: null, iouNo: 'IOU-2026-0315-003', thirdPartyIouNo: 'TPI-2026-0315-003', iouStatus: '已结清', amount: 20000, installments: 9 },
        { loanNo: 'LN20260110005', loanDate: '2026-01-10', bankCardNo: '****3456', result: '失败', rejectReason: '风险拦截', iouNo: null, thirdPartyIouNo: null, iouStatus: '拒绝', amount: 0, installments: 0 }
      ]
)

// 授信列表列
const creditColumns = [
  { title: '授信单号', dataIndex: 'creditNo', width: 150 },
  { title: '授信日期', dataIndex: 'creditDate', width: 110 },
  { title: '渠道', dataIndex: 'channel', width: 80 },
  { title: '授信结果', dataIndex: 'result', slotName: 'result', width: 90 },
  { title: '拒绝原因', dataIndex: 'rejectReason', slotName: 'rejectReason', width: 140 },
  { title: '总授信额度', dataIndex: 'totalAmount', slotName: 'totalAmount', width: 120 },
  { title: '当前额度', dataIndex: 'currentAmount', slotName: 'currentAmount', width: 110 },
  { title: '授信定价', dataIndex: 'interestRate', slotName: 'interestRate', width: 90 },
  { title: '风险评级', dataIndex: 'riskLevel', width: 90 },
  { title: '可用期限', dataIndex: 'availableDays', slotName: 'availableDays', width: 90 }
]

// 用信列表列
const loanColumns = [
  { title: '用信单号', dataIndex: 'loanNo', slotName: 'loanNo', width: 140 },
  { title: '用信日期', dataIndex: 'loanDate', slotName: 'loanDate', width: 110 },
  { title: '银行卡号', dataIndex: 'bankCardNo', slotName: 'bankCardNo', width: 130 },
  { title: '用信结果', dataIndex: 'result', slotName: 'result', width: 90 },
  { title: '拒绝原因', dataIndex: 'rejectReason', slotName: 'rejectReason', width: 120 },
  { title: '借据号', dataIndex: 'iouNo', slotName: 'iouNo', width: 150 },
  { title: '三方借据号', dataIndex: 'thirdPartyIouNo', slotName: 'thirdPartyIouNo', width: 150 },
  { title: '借据状态', dataIndex: 'iouStatus', slotName: 'iouStatus', width: 90 },
  { title: '借款金额', dataIndex: 'amount', slotName: 'amount', width: 110 },
  { title: '期数', dataIndex: 'installments', slotName: 'installments', width: 70 },
  { title: '操作', dataIndex: 'actions', slotName: 'loanActions', width: 100, fixed: 'right' }
]

const formatCurrency = (value: number): string => {
  if (value == null) return '-'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(value)
}

const getResultColor = (result?: string) => {
  const map: Record<string, string> = { '成功': 'green', '失败': 'red', '拒绝': 'orange', '待处理': 'blue' }
  return map[result || ''] || 'default'
}

const getStatusColor = (status?: string) => {
  const map: Record<string, string> = { '正常': 'green', '逾期': 'red', '已结清': 'gray', '冻结': 'orange', '拒绝': 'red' }
  return map[status || ''] || 'default'
}

const getIouStatusColor = (status?: string) => {
  const map: Record<string, string> = { '正常': 'green', '逾期': 'red', '已结清': 'gray', '冻结': 'orange', '拒绝': 'red', '放款中': 'blue' }
  return map[status || ''] || 'default'
}

const handleLoanDetail = (record: LoanRecord) => {
  console.log('查看用信详情:', record)
}

const copyText = async (text?: string) => {
  if (!text) return
  try { await navigator.clipboard.writeText(String(text)) } catch {}
}
</script>

<style scoped>
.real-time-data-container {
  padding: 16px;
  background: #fafafa;
  min-height: 400px;
}

.data-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary, #1f2329);
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.quota-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.quota-card {
  background: #f8f9fb;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px 24px;
  text-align: center;
}

.quota-label {
  font-size: 14px;
  color: var(--subapp-text-tertiary, #89929a);
  margin-bottom: 8px;
}

.quota-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--subapp-text-primary, #1f2329);
  margin-bottom: 4px;
}

.quota-value.available {
  color: rgb(var(--green-6));
}

.quota-desc {
  font-size: 12px;
  color: var(--subapp-text-tertiary, #89929a);
}

.text-red-500 {
  color: #f53f3f;
}

.copyable {
  cursor: pointer;
  transition: color 0.2s;
}

.copyable:hover {
  color: #1655d0;
}

@media (max-width: 768px) {
  .quota-grid { grid-template-columns: 1fr; }
  .real-time-data-container { padding: 12px; }
  .data-section { padding: 12px; }
}
</style>