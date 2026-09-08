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
            <span class="label">借款金额：</span>
            <span class="value amount">{{ formatAmount(loanRecord.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">借款利率：</span>
            <span class="value rate">{{ loanRecord.loanRate }}%</span>
          </div>
          <div class="info-item">
            <span class="label">借据状态：</span>
            <a-tag :color="getStatusColor(loanRecord.status)" size="small">
              {{ loanRecord.status }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">总期数：</span>
            <span class="value">{{ loanRecord.installments }}期</span>
          </div>
          <div class="info-item">
            <span class="label">当前期次：</span>
            <span class="value">{{ loanRecord.currentPeriod }}期</span>
          </div>
          <div class="info-item">
            <span class="label">逾期天数：</span>
            <span class="value" :class="{ 'overdue': loanRecord.overdueDays > 0 }">
              {{ loanRecord.overdueDays }}天
            </span>
          </div>
          <div class="info-item">
            <span class="label">历史最大逾期：</span>
            <span class="value" :class="{ 'overdue': loanRecord.maxOverdueDays > 0 }">
              {{ loanRecord.maxOverdueDays }}天
            </span>
          </div>
          <div class="info-item" v-if="loanRecord.settlementDate">
            <span class="label">结清日期：</span>
            <span class="value date">{{ formatDate(loanRecord.settlementDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 剩余金额统计 -->
      <div class="stats-section">
        <h4 class="section-title">
          <BarChart3 class="section-icon" />
          剩余金额统计
        </h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(loanRecord.remainingPrincipal) }}</div>
            <div class="stat-label">剩余本金</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(loanRecord.remainingInterest) }}</div>
            <div class="stat-label">剩余利息</div>
          </div>
          <div class="stat-card penalty-card">
            <div class="stat-value penalty">{{ formatAmount(loanRecord.remainingPenalty) }}</div>
            <div class="stat-label">
              剩余罚息
              <a-tooltip content="本金罚息+利息罚息">
                <ExclamationCircle class="penalty-icon" />
              </a-tooltip>
            </div>
          </div>
          <div class="stat-card total-card">
            <div class="stat-value total">{{ formatAmount(loanRecord.remainingTotal) }}</div>
            <div class="stat-label">剩余应还总额</div>
          </div>
        </div>
      </div>

      <!-- 放款记录 -->
      <div class="records-section">
        <h4 class="section-title">
          <History class="section-icon" />
          放款记录
          <span class="record-count">({{ disbursementRecords.length }}笔)</span>
        </h4>
        
        <div class="records-container">
          <div v-if="disbursementRecords.length === 0" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无放款记录</div>
          </div>
          
          <div v-else class="record-list">
            <div
              v-for="(record, index) in disbursementRecords"
              :key="index"
              class="record-card"
            >
              <div class="record-header">
                <div class="record-title">
                  <span class="batch">第{{ record.batch }}笔</span>
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
                  <span class="detail-value">{{ formatDate(record.disbursementDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">到账银行：</span>
                  <span class="detail-value">{{ record.bankName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">银行卡号：</span>
                  <span class="detail-value bank-card">{{ record.bankCard }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">放款渠道：</span>
                  <span class="detail-value">{{ record.channel }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">交易流水：</span>
                  <span class="detail-value transaction-id">{{ record.transactionId }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">处理状态：</span>
                  <span class="detail-value">{{ record.processStatus }}</span>
                </div>
                <div v-if="record.remark" class="detail-row">
                  <span class="detail-label">备注：</span>
                  <span class="detail-value">{{ record.remark }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批信息 -->
      <div class="approval-section">
        <h4 class="section-title">
          <CheckCircle class="section-icon" />
          审批信息
        </h4>
        
        <div class="approval-container">
          <div v-if="!loanRecord.approvalInfo" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无审批信息</div>
          </div>
          
          <div v-else class="approval-info">
            <div class="approval-grid">
              <div class="approval-item">
                <span class="label">申请时间：</span>
                <span class="value">{{ formatDate(loanRecord.approvalInfo.applyTime) }}</span>
              </div>
              <div class="approval-item">
                <span class="label">审批时间：</span>
                <span class="value">{{ formatDate(loanRecord.approvalInfo.approvalTime) }}</span>
              </div>
              <div class="approval-item">
                <span class="label">审批人员：</span>
                <span class="value">{{ loanRecord.approvalInfo.approver }}</span>
              </div>
              <div class="approval-item">
                <span class="label">审批结果：</span>
                <a-tag :color="getApprovalStatusColor(loanRecord.approvalInfo.result)" size="small">
                  {{ loanRecord.approvalInfo.result }}
                </a-tag>
              </div>
              <div class="approval-item full-width" v-if="loanRecord.approvalInfo.remark">
                <span class="label">审批意见：</span>
                <span class="value">{{ loanRecord.approvalInfo.remark }}</span>
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
import { Banknote, FileText, Copy, BarChart3, History, CheckCircle, FileX } from 'lucide-vue-next'
import { IconExclamationCircle } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

interface DisbursementRecord {
  batch: number
  disbursementDate: string
  amount: number
  bankName: string
  bankCard: string
  channel: string
  transactionId: string
  status: string
  processStatus: string
  remark?: string
}

interface ApprovalInfo {
  applyTime: string
  approvalTime: string
  approver: string
  result: string
  remark?: string
}

interface LoanRecord {
  loanNo: string
  productName: string
  amount: number
  loanRate: number
  status: string
  installments: number
  currentPeriod: number
  overdueDays: number
  maxOverdueDays: number
  settlementDate?: string
  remainingPrincipal: number
  remainingInterest: number
  remainingPenalty: number
  remainingTotal: number
  disbursementRecords: DisbursementRecord[]
  approvalInfo?: ApprovalInfo
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

const disbursementRecords = computed(() => props.loanRecord?.disbursementRecords || [])

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
    '处理中': 'orange',
    '待处理': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 获取审批状态颜色
const getApprovalStatusColor = (result: string): string => {
  const colorMap: Record<string, string> = {
    '通过': 'green',
    '拒绝': 'red',
    '待审批': 'orange'
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
  color: #00b42a;
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
.approval-section {
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

.approval-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.approval-item.full-width {
  grid-column: 1 / -1;
}

.info-item,
.approval-item {
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
.value.bank-card,
.value.transaction-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.value.rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #165dff;
}

.value.date {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value.overdue {
  color: #f53f3f;
  font-weight: 600;
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

.penalty-card {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.total-card {
  background: #f0f9ff;
  border: 1px solid #bae7ff;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.stat-value.penalty {
  color: #f53f3f;
}

.stat-value.total {
  color: #165dff;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.penalty-icon {
  width: 12px;
  height: 12px;
  color: #f53f3f;
}

.records-container,
.approval-container {
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

.detail-label {
  font-size: 12px;
  color: #86909c;
}

.detail-value {
  font-size: 12px;
  color: #1d2129;
}

.detail-value.bank-card,
.detail-value.transaction-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.approval-info {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e6eb;
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
  .info-grid,
  .approval-grid {
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