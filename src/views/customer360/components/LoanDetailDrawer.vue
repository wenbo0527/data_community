<template>
  <a-drawer
    v-model:visible="visible"
    title="借据详情"
    width="800px"
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="loanData" class="loan-detail-content">
      <!-- 基础信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <FileText class="section-icon" />
          基础信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">产品名称：</span>
            <span class="value">{{ loanData.productName }}</span>
          </div>
          <div class="info-item">
            <span class="label">数据日期：</span>
            <span class="value">{{ formatDate(loanData.loanDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">借据号：</span>
            <span class="value code">{{ loanData.contractNo }}</span>
            <a-button type="text" size="mini" @click="copyText(loanData.contractNo)">
              <Copy class="copy-icon" />
            </a-button>
          </div>
          <div class="info-item">
            <span class="label">放款时间：</span>
            <span class="value">{{ formatDate(loanData.loanDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">借据状态：</span>
            <a-tag :color="getContractStatusColor(loanData.status)" size="small">
              {{ loanData.status }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">借款金额：</span>
            <span class="value amount">{{ formatAmount(loanData.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">期数：</span>
            <span class="value">{{ loanData.installments }}期</span>
          </div>
          <div class="info-item">
            <span class="label">借款利率：</span>
            <span class="value rate">{{ (loanData.loanRate * 100).toFixed(2) }}%</span>
          </div>
          <div class="info-item">
            <span class="label">当前期次：</span>
            <span class="value">{{ loanData.currentPeriod }}</span>
          </div>
          <div class="info-item">
            <span class="label">还款日：</span>
            <span class="value">{{ formatDate(loanData.nextPaymentDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <AlertCircle class="section-icon" />
          状态信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">结清日期：</span>
            <span class="value">{{ loanData.settlementDate ? formatDate(loanData.settlementDate) : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">逾期日期：</span>
            <span class="value">{{ loanData.overdueDate ? formatDate(loanData.overdueDate) : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">是否核销：</span>
            <a-tag :color="loanData.isWriteOff ? 'red' : 'green'" size="small">
              {{ loanData.isWriteOff ? '是' : '否' }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">是否理赔：</span>
            <a-tag :color="loanData.isClaimed ? 'orange' : 'green'" size="small">
              {{ loanData.isClaimed ? '是' : '否' }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">历史最大逾期天数：</span>
            <span class="value">{{ loanData.maxOverdueDays || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 还款信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <CreditCard class="section-icon" />
          还款信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">实际还款本金：</span>
            <span class="value amount">{{ formatAmount(loanData.actualPaidPrincipal || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际还款利息：</span>
            <span class="value amount">{{ formatAmount(loanData.actualPaidInterest || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际还款罚息：</span>
            <span class="value amount penalty">{{ formatAmount(loanData.actualPaidPenalty || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际还款费用：</span>
            <span class="value amount total">{{ formatAmount((loanData.actualPaidPrincipal || 0) + (loanData.actualPaidInterest || 0) + (loanData.actualPaidPenalty || 0)) }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余本金：</span>
            <span class="value amount">{{ formatAmount(loanData.remainingPrincipal) }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余利息：</span>
            <span class="value amount">{{ formatAmount(loanData.remainingInterest) }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余罚息：</span>
            <span class="value amount penalty">{{ formatAmount(loanData.remainingPenalty) }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余应还总额：</span>
            <span class="value amount total">{{ formatAmount(loanData.remainingTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- 用信信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <DollarSign class="section-icon" />
          用信信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">用信单号：</span>
            <span class="value code">{{ loanData.loanNo }}</span>
            <a-button type="text" size="mini" @click="copyText(loanData.loanNo)">
              <Copy class="copy-icon" />
            </a-button>
          </div>
          <div class="info-item">
            <span class="label">用信日期：</span>
            <span class="value">{{ formatDate(loanData.loanDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">用信结果：</span>
            <a-tag :color="getLoanStatusColor(loanData.result)" size="small">
              {{ loanData.result }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">拒绝原因：</span>
            <span class="value reject-reason">{{ loanData.rejectReason || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <User class="section-icon" />
          账户信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">银行卡号：</span>
            <span class="value code">{{ maskBankCard(loanData.bankCard) }}</span>
            <a-button type="text" size="mini" @click="copyText(loanData.bankCard)">
              <Copy class="copy-icon" />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 其他操作 -->
      <div class="detail-section">
        <h3 class="section-title">
          <Settings class="section-icon" />
          其他操作
        </h3>
        <div class="action-buttons">
          <a-button type="outline" @click="viewDisbursementDetails">
            <FileText class="action-icon" />
            放款明细
          </a-button>
          <a-button type="outline" @click="viewRepaymentDetails">
            <Eye class="action-icon" />
            还款明细
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Copy, AlertCircle, CreditCard, DollarSign, User, Settings, Eye } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

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
  overdueDays: number
  maxOverdueDays: number
  settlementDate?: string
  currentPeriod: number
  remainingPrincipal: number
  remainingInterest: number
  remainingPenalty: number
  remainingTotal: number
  loanRate: number
  // 新增字段
  overdueDate?: string
  isWriteOff?: boolean
  isClaimed?: boolean
  actualPaidPrincipal?: number
  actualPaidInterest?: number
  actualPaidPenalty?: number
}

interface Props {
  visible: boolean
  loanData: LoanRecord | null
}

interface Emits {
  'update:visible': [visible: boolean]
  viewDisbursementDetails: [record: LoanRecord]
  viewRepaymentDetails: [record: LoanRecord]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// 关闭抽屉
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

// 银行卡号脱敏
const maskBankCard = (bankCard: string): string => {
  if (!bankCard || bankCard.length < 8) return bankCard
  return `****${bankCard.slice(-4)}`
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

// 查看放款明细
const viewDisbursementDetails = () => {
  if (props.loanData) {
    emit('viewDisbursementDetails', props.loanData)
  }
}

// 查看还款明细
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
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.section-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  min-width: 120px;
  font-weight: 500;
  color: #86909c;
  margin-right: 8px;
}

.value {
  flex: 1;
  color: #1d2129;
}

.value.code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #165dff;
}

.value.amount.penalty {
  color: #f53f3f;
}

.value.amount.total {
  color: #722ed1;
  font-weight: 700;
}

.value.rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  color: #722ed1;
}

.value.reject-reason {
  color: #f53f3f;
}

.copy-icon {
  width: 12px;
  height: 12px;
  color: #86909c;
  cursor: pointer;
  margin-left: 8px;
}

.copy-icon:hover {
  color: #165dff;
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

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>