<template>
  <a-drawer
    v-model:visible="visible"
    title="用信详情"
    width="900px"
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="loanData" class="loan-detail-content">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <FileText class="section-icon" />
          基本信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>用信单号</label>
            <div class="info-value loan-no">
              {{ loanData.loanNo }}
              <Copy class="copy-icon" @click="copyText(loanData.loanNo)" />
            </div>
          </div>
          <div class="info-item">
            <label>用信日期</label>
            <div class="info-value">{{ formatDate(loanData.loanDate) }}</div>
          </div>
          <div class="info-item">
            <label>银行卡号</label>
            <div class="info-value bank-card">
              {{ loanData.bankCard }}
              <Copy class="copy-icon" @click="copyText(loanData.bankCard)" />
            </div>
          </div>
          <div class="info-item">
            <label>渠道</label>
            <div class="info-value">{{ loanData.channel }}</div>
          </div>
          <div class="info-item">
            <label>产品名称</label>
            <div class="info-value">{{ loanData.productName }}</div>
          </div>
          <div class="info-item">
            <label>用信结果</label>
            <div class="info-value">
              <a-tag :color="getLoanStatusColor(loanData.result)">{{ loanData.result }}</a-tag>
            </div>
          </div>
          <div class="info-item" v-if="loanData.rejectReason">
            <label>拒绝原因</label>
            <div class="info-value reject-reason">{{ loanData.rejectReason }}</div>
          </div>
        </div>
      </div>

      <!-- 借据信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <CreditCard class="section-icon" />
          借据信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>借据号</label>
            <div class="info-value contract-no">
              {{ loanData.contractNo }}
              <Copy class="copy-icon" @click="copyText(loanData.contractNo)" />
            </div>
          </div>
          <div class="info-item">
            <label>借据状态</label>
            <div class="info-value">
              <a-tag :color="getContractStatusColor(loanData.status)">{{ loanData.status }}</a-tag>
            </div>
          </div>
          <div class="info-item">
            <label>借款金额</label>
            <div class="info-value amount loan-amount">{{ formatAmount(loanData.amount) }}</div>
          </div>
          <div class="info-item">
            <label>借款利率</label>
            <div class="info-value loan-rate">{{ (loanData.loanRate * 100).toFixed(2) }}%</div>
          </div>
          <div class="info-item">
            <label>期数</label>
            <div class="info-value installments">{{ loanData.installments }}期</div>
          </div>
          <div class="info-item">
            <label>已还期数</label>
            <div class="info-value paid-installments">{{ loanData.paidInstallments }}/{{ loanData.installments }}</div>
          </div>
        </div>
      </div>

      <!-- 还款信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <DollarSign class="section-icon" />
          还款信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>当前期次</label>
            <div class="info-value current-period">第{{ loanData.currentPeriod }}期</div>
          </div>
          <div class="info-item">
            <label>剩余本金</label>
            <div class="info-value amount remaining-principal">{{ formatAmount(loanData.remainingPrincipal) }}</div>
          </div>
          <div class="info-item">
            <label>剩余利息</label>
            <div class="info-value amount remaining-interest">{{ formatAmount(loanData.remainingInterest) }}</div>
          </div>
          <div class="info-item">
            <label>剩余罚息</label>
            <div class="info-value amount remaining-penalty">
              {{ formatAmount(loanData.remainingPenalty) }}
              <a-tooltip v-if="loanData.remainingPenalty > 0" content="存在逾期罚息">
                <AlertCircle class="penalty-icon" />
              </a-tooltip>
            </div>
          </div>
          <div class="info-item">
            <label>剩余应还总额</label>
            <div class="info-value amount remaining-total">{{ formatAmount(loanData.remainingTotal) }}</div>
          </div>
          <div class="info-item">
            <label>下期应还</label>
            <div class="info-value amount next-payment">{{ formatAmount(loanData.nextPayment) }}</div>
          </div>
          <div class="info-item">
            <label>下期还款日</label>
            <div class="info-value next-payment-date">{{ formatDate(loanData.nextPaymentDate) }}</div>
          </div>
        </div>
      </div>

      <!-- 逾期信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <TriangleAlert class="section-icon" />
          逾期信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>逾期天数</label>
            <div class="info-value overdue-days" :class="{ 'zero': loanData.overdueDays === 0 }">
              {{ loanData.overdueDays }}天
            </div>
          </div>
          <div class="info-item">
            <label>历史最大逾期天数</label>
            <div class="info-value max-overdue-days">{{ loanData.maxOverdueDays }}天</div>
          </div>
          <div class="info-item" v-if="loanData.settlementDate">
            <label>结清日期</label>
            <div class="info-value settlement-date">{{ formatDate(loanData.settlementDate) }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-section">
        <h3 class="section-title">
          <Settings class="section-icon" />
          相关操作
        </h3>
        <div class="action-buttons">
          <a-button type="primary" @click="viewDisbursementDetails">
            <FileText class="action-icon" />
            查看放款记录
          </a-button>
          <a-button type="primary" @click="viewRepaymentDetails">
            <Eye class="action-icon" />
            查看还款记录
          </a-button>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <a-empty description="暂无数据" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, CreditCard, DollarSign, TriangleAlert, AlertCircle, Settings, Copy, Eye } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface LoanData {
  productKey: string
  loanNo: string
  loanDate: string
  bankCard: string
  channel: string
  productName: string
  result: string
  rejectReason?: string
  contractNo: string
  status: string
  amount: number
  balance: number
  installments: number
  paidInstallments: number
  nextPayment: number
  nextPaymentDate: string
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
}

interface Props {
  visible: boolean
  loanData?: LoanData | null
}

interface Emits {
  'update:visible': [value: boolean]
  'viewDisbursementDetails': [data: LoanData]
  'viewRepaymentDetails': [data: LoanData]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  loanData: null
})

const emit = defineEmits<Emits>()

const visible = ref(props.visible)

watch(() => props.visible, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:visible', newVal)
})

const handleClose = () => {
  visible.value = false
}

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

// 查看放款详情
const viewDisbursementDetails = () => {
  if (props.loanData) {
    emit('viewDisbursementDetails', props.loanData)
  }
}

// 查看还款详情
const viewRepaymentDetails = () => {
  if (props.loanData) {
    emit('viewRepaymentDetails', props.loanData)
  }
}
</script>

<style scoped>
.loan-detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #165dff;
}

.reject-reason {
  color: #f53f3f;
}

.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.loan-amount {
  color: #165dff;
}

.remaining-principal {
  color: #165dff;
}

.remaining-interest {
  color: #ff7d00;
}

.remaining-penalty {
  color: #f53f3f;
}

.remaining-total {
  color: #722ed1;
  font-weight: 700;
}

.next-payment {
  color: #ff7d00;
}

.loan-rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #722ed1;
}

.installments,
.paid-installments,
.current-period {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.overdue-days {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #f53f3f;
}

.overdue-days.zero {
  color: #00b42a;
}

.max-overdue-days {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  color: #ff7d00;
}

.settlement-date {
  color: #00b42a;
  font-weight: 600;
}

.penalty-icon {
  width: 14px;
  height: 14px;
  color: #f53f3f;
  cursor: help;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>