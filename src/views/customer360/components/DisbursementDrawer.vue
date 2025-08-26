<template>
  <a-drawer
    v-model:visible="visible"
    title="放款信息详情"
    width="800px"
    :footer="false"
    unmount-on-close
  >
    <template #title>
      <div class="drawer-title">
        <Banknote class="title-icon" />
        放款信息详情
        <a-tag v-if="loanRecord" color="green" size="small" style="margin-left: 12px">
          {{ loanRecord.loanNo }}
        </a-tag>
      </div>
    </template>

    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <div v-else-if="loanRecord" class="disbursement-content">
      <!-- 借据基本信息 -->
      <div class="info-section">
        <h4 class="section-title">
          <FileText class="section-icon" />
          借据信息
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">借据号：</span>
            <span class="value loan-no">{{ loanRecord.loanNo }}</span>
            <a-button type="text" size="mini" @click="copyText(loanRecord.loanNo)">
              <Copy class="copy-icon" />
            </a-button>
          </div>
          <div class="info-item">
            <span class="label">产品名称：</span>
            <span class="value">{{ loanRecord.productName }}</span>
          </div>
          <div class="info-item">
            <span class="label">合同号：</span>
            <span class="value contract-no">{{ loanRecord.contractNo }}</span>
            <a-button type="text" size="mini" @click="copyText(loanRecord.contractNo)">
              <Copy class="copy-icon" />
            </a-button>
          </div>
          <div class="info-item">
            <span class="label">借款金额：</span>
            <span class="value amount highlight">{{ formatAmount(loanRecord.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余本金：</span>
            <span class="value amount">{{ formatAmount(loanRecord.balance) }}</span>
          </div>
          <div class="info-item">
            <span class="label">借据状态：</span>
            <a-tag :color="getStatusColor(loanRecord.status)" size="small">
              {{ loanRecord.status }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">用信日期：</span>
            <span class="value date">{{ formatDate(loanRecord.loanDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">银行卡号：</span>
            <span class="value bank-card">{{ maskBankCard(loanRecord.bankCard) }}</span>
          </div>
          <div class="info-item">
            <span class="label">渠道：</span>
            <span class="value">{{ loanRecord.channel }}</span>
          </div>
        </div>
      </div>

      <!-- 放款统计 -->
      <div class="stats-section">
        <h4 class="section-title">
          <BarChart3 class="section-icon" />
          放款统计
        </h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(getTotalDisbursed()) }}</div>
            <div class="stat-label">累计放款</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getDisbursementCount() }}笔</div>
            <div class="stat-label">放款笔数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(getAverageAmount()) }}</div>
            <div class="stat-label">平均金额</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getSuccessRate() }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </div>

      <!-- 放款记录 -->
      <div class="records-section">
        <h4 class="section-title">
          <History class="section-icon" />
          放款记录
          <span class="record-count">({{ disbursementDetails.length }}笔)</span>
        </h4>
        
        <div class="records-container">
          <div v-if="disbursementDetails.length === 0" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无放款记录</div>
          </div>
          
          <div v-else class="record-list">
            <div
              v-for="(record, index) in disbursementDetails"
              :key="index"
              class="record-card"
            >
              <div class="record-header">
                <div class="record-title">
                  <span class="batch">第{{ index + 1 }}笔</span>
                  <a-tag :color="getDisbursementStatusColor(record.status)" size="small">
                    {{ record.status }}
                  </a-tag>
                </div>
                <div class="record-amount">
                  {{ formatAmount(record.amount) }}
                </div>
              </div>
              
              <div class="record-details">
                <div class="detail-row">
                  <span class="detail-label">放款日期：</span>
                  <span class="detail-value date">{{ formatDateTime(record.disbursementDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">申请日期：</span>
                  <span class="detail-value date">{{ formatDateTime(record.applicationDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">放款方式：</span>
                  <span class="detail-value">{{ record.method }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">收款账户：</span>
                  <span class="detail-value bank-card">{{ maskBankCard(record.receivingAccount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">收款银行：</span>
                  <span class="detail-value">{{ record.receivingBank }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">处理时长：</span>
                  <span class="detail-value">{{ getProcessingTime(record.applicationDate, record.disbursementDate) }}</span>
                </div>
                <div v-if="record.fee > 0" class="detail-row">
                  <span class="detail-label">手续费：</span>
                  <span class="detail-value amount">{{ formatAmount(record.fee) }}</span>
                </div>
                <div v-if="record.failureReason" class="detail-row full-width">
                  <span class="detail-label">失败原因：</span>
                  <span class="detail-value failure-reason">{{ record.failureReason }}</span>
                </div>
                <div v-if="record.remark" class="detail-row full-width">
                  <span class="detail-label">备注：</span>
                  <span class="detail-value">{{ record.remark }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 放款流程 -->
      <div class="process-section">
        <h4 class="section-title">
          <GitBranch class="section-icon" />
          放款流程
        </h4>
        
        <div class="process-container">
          <div v-if="processSteps.length === 0" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无流程记录</div>
          </div>
          
          <div v-else class="process-timeline">
            <div
              v-for="(step, index) in processSteps"
              :key="index"
              class="timeline-item"
              :class="{ 'is-last': index === processSteps.length - 1 }"
            >
              <div class="timeline-dot" :class="getStepStatusClass(step.status)">
                <component :is="getStepIcon(step.status)" class="step-icon" />
              </div>
              <div class="timeline-content">
                <div class="step-title">{{ step.stepName }}</div>
                <div class="step-time">{{ formatDateTime(step.processTime) }}</div>
                <div v-if="step.operator" class="step-operator">操作人：{{ step.operator }}</div>
                <div v-if="step.remark" class="step-remark">{{ step.remark }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-container">
      <div class="empty-icon">
        <FileX />
      </div>
      <div class="empty-text">暂无数据</div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Banknote, 
  FileText, 
  Copy, 
  BarChart3, 
  History, 
  GitBranch, 
  FileX,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface DisbursementDetail {
  disbursementDate: string
  applicationDate: string
  amount: number
  method: string
  receivingAccount: string
  receivingBank: string
  status: string
  fee: number
  failureReason?: string
  remark?: string
}

interface ProcessStep {
  stepName: string
  processTime: string
  status: string
  operator?: string
  remark?: string
}

interface LoanRecord {
  loanNo: string
  productName: string
  contractNo: string
  amount: number
  balance: number
  status: string
  loanDate: string
  bankCard: string
  channel: string
  disbursementDetails: DisbursementDetail[]
  processSteps: ProcessStep[]
}

interface Props {
  visible: boolean
  loanRecord?: LoanRecord
  loading?: boolean
}

interface Emits {
  'update:visible': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const disbursementDetails = computed(() => props.loanRecord?.disbursementDetails || [])
const processSteps = computed(() => props.loanRecord?.processSteps || [])

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
  return date.toLocaleDateString('zh-CN')
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

// 掩码银行卡号
const maskBankCard = (cardNo: string): string => {
  if (!cardNo || cardNo.length < 8) return cardNo
  return cardNo.substring(0, 4) + '****' + cardNo.substring(cardNo.length - 4)
}

// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'blue',
    '呆账': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取放款状态颜色
const getDisbursementStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '失败': 'red',
    '处理中': 'blue',
    '待处理': 'orange'
  }
  return colorMap[status] || 'gray'
}

// 获取步骤状态类
const getStepStatusClass = (status: string): string => {
  const classMap: Record<string, string> = {
    '成功': 'success',
    '失败': 'error',
    '处理中': 'processing',
    '待处理': 'pending'
  }
  return classMap[status] || 'default'
}

// 获取步骤图标
const getStepIcon = (status: string) => {
  const iconMap: Record<string, any> = {
    '成功': CheckCircle,
    '失败': XCircle,
    '处理中': Clock,
    '待处理': AlertCircle
  }
  return iconMap[status] || Clock
}

// 计算处理时长
const getProcessingTime = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '-'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes}分钟`
  }
  return `${diffMinutes}分钟`
}

// 计算累计放款
const getTotalDisbursed = (): number => {
  return disbursementDetails.value
    .filter(record => record.status === '成功')
    .reduce((total, record) => total + record.amount, 0)
}

// 计算放款笔数
const getDisbursementCount = (): number => {
  return disbursementDetails.value.length
}

// 计算平均金额
const getAverageAmount = (): number => {
  const successfulRecords = disbursementDetails.value.filter(record => record.status === '成功')
  if (successfulRecords.length === 0) return 0
  return getTotalDisbursed() / successfulRecords.length
}

// 计算成功率
const getSuccessRate = (): string => {
  if (disbursementDetails.value.length === 0) return '0'
  const successCount = disbursementDetails.value.filter(record => record.status === '成功').length
  return ((successCount / disbursementDetails.value.length) * 100).toFixed(1)
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
</script>

<style scoped>
.drawer-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.title-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #165dff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.disbursement-content {
  padding: 0;
}

.info-section,
.stats-section,
.records-section,
.process-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.section-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  color: #165dff;
}

.record-count {
  margin-left: 8px;
  font-size: 12px;
  color: #86909c;
  font-weight: normal;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-size: 13px;
  color: #86909c;
  min-width: 80px;
}

.value {
  font-size: 13px;
  color: #1d2129;
  flex: 1;
}

.value.loan-no,
.value.contract-no {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.value.amount.highlight {
  color: #00b42a;
  font-size: 14px;
}

.value.date {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value.bank-card {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f7f8fa;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.records-container,
.process-container {
  max-height: 400px;
  overflow-y: auto;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e6eb;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch {
  font-weight: 600;
  color: #1d2129;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  color: #00b42a;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.record-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.detail-row.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #86909c;
}

.detail-value {
  font-size: 12px;
  color: #1d2129;
}

.detail-value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.detail-value.date {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.detail-value.bank-card {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.detail-value.failure-reason {
  color: #f53f3f;
  font-weight: 500;
}

.process-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item:not(.is-last)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  width: 2px;
  height: calc(100% + 8px);
  background: #e5e6eb;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-dot.success {
  background: #00b42a;
  color: white;
}

.timeline-dot.error {
  background: #f53f3f;
  color: white;
}

.timeline-dot.processing {
  background: #165dff;
  color: white;
}

.timeline-dot.pending {
  background: #ff7d00;
  color: white;
}

.timeline-dot.default {
  background: #86909c;
  color: white;
}

.step-icon {
  width: 16px;
  height: 16px;
}

.timeline-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.step-time {
  font-size: 12px;
  color: #86909c;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  margin-bottom: 4px;
}

.step-operator {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
}

.step-remark {
  font-size: 12px;
  color: #1d2129;
  background: #f7f8fa;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #165dff;
}

.empty-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86909c;
}

.empty-icon {
  margin-bottom: 12px;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  color: #c9cdd4;
}

.empty-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .record-details {
    grid-template-columns: 1fr;
  }
}
</style>