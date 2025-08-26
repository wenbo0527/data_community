<template>
  <a-drawer
    v-model:visible="visible"
    title="还款信息详情"
    width="800px"
    :footer="false"
    unmount-on-close
  >
    <template #title>
      <div class="drawer-title">
        <CreditCard class="title-icon" />
        还款信息详情
        <a-tag v-if="loanRecord" color="blue" size="small" style="margin-left: 12px">
          {{ loanRecord.loanNo }}
        </a-tag>
      </div>
    </template>

    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <div v-else-if="loanRecord" class="repayment-content">
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
            <span class="label">总期数：</span>
            <span class="value">{{ loanRecord.installments }}期</span>
          </div>
          <div class="info-item">
            <span class="label">已还期数：</span>
            <span class="value">{{ loanRecord.paidInstallments }}期</span>
          </div>
          <div class="info-item">
            <span class="label">下期应还：</span>
            <span class="value amount highlight">{{ formatAmount(loanRecord.nextPayment) }}</span>
          </div>
          <div class="info-item">
            <span class="label">下期还款日：</span>
            <span class="value date">{{ formatDate(loanRecord.nextPaymentDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 还款统计 -->
      <div class="stats-section">
        <h4 class="section-title">
          <BarChart3 class="section-icon" />
          还款统计
        </h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(getTotalRepaid()) }}</div>
            <div class="stat-label">累计还款</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(getTotalPrincipal()) }}</div>
            <div class="stat-label">累计还本</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatAmount(getTotalInterest()) }}</div>
            <div class="stat-label">累计还息</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getOverdueDays() }}天</div>
            <div class="stat-label">逾期天数</div>
          </div>
        </div>
      </div>

      <!-- 还款记录 -->
      <div class="records-section">
        <h4 class="section-title">
          <History class="section-icon" />
          还款记录
          <span class="record-count">({{ repaymentDetails.length }}笔)</span>
        </h4>
        
        <div class="records-container">
          <div v-if="repaymentDetails.length === 0" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无还款记录</div>
          </div>
          
          <div v-else class="record-list">
            <div
              v-for="(record, index) in repaymentDetails"
              :key="index"
              class="record-card"
            >
              <div class="record-header">
                <div class="record-title">
                  <span class="period">第{{ record.period }}期</span>
                  <a-tag :color="getRepaymentStatusColor(record.status)" size="small">
                    {{ record.status }}
                  </a-tag>
                </div>
                <div class="record-amount">
                  {{ formatAmount(record.amount) }}
                </div>
              </div>
              
              <div class="record-details">
                <div class="detail-row">
                  <span class="detail-label">还款日期：</span>
                  <span class="detail-value">{{ formatDate(record.repaymentDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">应还日期：</span>
                  <span class="detail-value">{{ formatDate(record.dueDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">本金：</span>
                  <span class="detail-value amount">{{ formatAmount(record.principal) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">利息：</span>
                  <span class="detail-value amount">{{ formatAmount(record.interest) }}</span>
                </div>
                <div v-if="record.penalty > 0" class="detail-row">
                  <span class="detail-label">罚息：</span>
                  <span class="detail-value amount penalty">{{ formatAmount(record.penalty) }}</span>
                </div>
                <div v-if="record.fee > 0" class="detail-row">
                  <span class="detail-label">费用：</span>
                  <span class="detail-value amount">{{ formatAmount(record.fee) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">还款方式：</span>
                  <span class="detail-value">{{ record.method }}</span>
                </div>
                <div v-if="record.overdueDays > 0" class="detail-row">
                  <span class="detail-label">逾期天数：</span>
                  <span class="detail-value overdue">{{ record.overdueDays }}天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 还款计划 -->
      <div class="plan-section">
        <h4 class="section-title">
          <Calendar class="section-icon" />
          还款计划
          <span class="record-count">({{ repaymentPlan.length }}期)</span>
        </h4>
        
        <div class="plan-container">
          <div v-if="repaymentPlan.length === 0" class="empty-state">
            <div class="empty-icon">
              <FileX />
            </div>
            <div class="empty-text">暂无还款计划</div>
          </div>
          
          <div v-else class="plan-table">
            <a-table
              :data="repaymentPlan"
              :pagination="false"
              :scroll="{ y: 300 }"
              size="small"
            >
              <template #columns>
                <a-table-column title="期数" data-index="period" width="60" align="center" />
                <a-table-column title="应还日期" data-index="dueDate" width="100">
                  <template #cell="{ record }">
                    {{ formatDate(record.dueDate) }}
                  </template>
                </a-table-column>
                <a-table-column title="应还金额" data-index="amount" width="100" align="right">
                  <template #cell="{ record }">
                    <span class="amount">{{ formatAmount(record.amount) }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="本金" data-index="principal" width="100" align="right">
                  <template #cell="{ record }">
                    <span class="amount">{{ formatAmount(record.principal) }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="利息" data-index="interest" width="100" align="right">
                  <template #cell="{ record }">
                    <span class="amount">{{ formatAmount(record.interest) }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="状态" data-index="status" width="80">
                  <template #cell="{ record }">
                    <a-tag :color="getPlanStatusColor(record.status)" size="small">
                      {{ record.status }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
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
import { CreditCard, FileText, Copy, BarChart3, History, Calendar, FileX } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface RepaymentDetail {
  period: number
  repaymentDate: string
  dueDate: string
  amount: number
  principal: number
  interest: number
  penalty: number
  fee: number
  method: string
  status: string
  overdueDays: number
}

interface RepaymentPlan {
  period: number
  dueDate: string
  amount: number
  principal: number
  interest: number
  status: string
}

interface LoanRecord {
  loanNo: string
  productName: string
  amount: number
  balance: number
  status: string
  installments: number
  paidInstallments: number
  nextPayment: number
  nextPaymentDate: string
  repaymentDetails: RepaymentDetail[]
  repaymentPlan: RepaymentPlan[]
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

const repaymentDetails = computed(() => props.loanRecord?.repaymentDetails || [])
const repaymentPlan = computed(() => props.loanRecord?.repaymentPlan || [])

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

// 获取还款状态颜色
const getRepaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '已还': 'green',
    '逾期': 'red',
    '部分还款': 'orange',
    '未还': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取计划状态颜色
const getPlanStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '已还': 'green',
    '待还': 'blue',
    '逾期': 'red',
    '未到期': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 计算累计还款
const getTotalRepaid = (): number => {
  return repaymentDetails.value.reduce((total, record) => total + record.amount, 0)
}

// 计算累计还本
const getTotalPrincipal = (): number => {
  return repaymentDetails.value.reduce((total, record) => total + record.principal, 0)
}

// 计算累计还息
const getTotalInterest = (): number => {
  return repaymentDetails.value.reduce((total, record) => total + record.interest, 0)
}

// 计算逾期天数
const getOverdueDays = (): number => {
  return Math.max(...repaymentDetails.value.map(record => record.overdueDays), 0)
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

.repayment-content {
  padding: 0;
}

.info-section,
.stats-section,
.records-section,
.plan-section {
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

.value.loan-no {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.value.amount.highlight {
  color: #f53f3f;
}

.value.amount.penalty {
  color: #f53f3f;
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
.plan-container {
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

.period {
  font-weight: 600;
  color: #1d2129;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  color: #165dff;
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

.detail-value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.plan-table {
  background: white;
  border-radius: 6px;
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

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
  font-size: 12px;
}

:deep(.arco-table-td) {
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
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