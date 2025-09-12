<template>
  <a-drawer
    v-model:visible="visible"
    title="还款明细"
    width="800px"
    :footer="false"
    @cancel="handleClose"
    unmount-on-close
  >
    <template #title>
      <div class="drawer-title">
        <CreditCard class="title-icon" />
        还款明细
      </div>
    </template>

    <div class="repayment-detail-drawer">
      <div class="drawer-header">
        <div class="loan-info">
          <h4>借据号：{{ loanData?.contractNo }}</h4>
          <span class="loan-amount">借款金额：{{ formatAmount(loanData?.amount) }}</span>
        </div>
        <a-button type="primary" @click="copyAllRepaymentData">
          <Copy class="action-icon" />
          一键复制
        </a-button>
      </div>

      <div class="cards-container">
        <div v-if="repaymentDetails.length === 0" class="empty-state">
          <FileX class="empty-icon" />
          <p>暂无还款明细数据</p>
        </div>
        
        <div v-else class="repayment-cards">
          <div 
            v-for="detail in repaymentDetails" 
            :key="detail.installmentNo" 
            class="repayment-card"
          >
            <div class="card-header">
              <div class="period-info">
                <span class="period-number">第{{ detail.installmentNo }}期</span>
                <a-tag :color="getRepaymentStatusColor(detail.repaymentStatus)" size="small">
                  {{ detail.repaymentStatus }}
                </a-tag>
              </div>
              <div class="header-info">
                <div class="due-date">应还日期：{{ formatDate(detail.dueDate) }}</div>
                <div class="overdue-days" v-if="detail.maxOverdueDays > 0">
                  最大逾期：{{ detail.maxOverdueDays }}天
                </div>
              </div>
            </div>
            
            <div class="card-content">
              <!-- 应还信息 -->
              <div class="amount-section due-section">
                <h5><span class="section-icon due-icon">💰</span>应还信息</h5>
                <div class="amount-grid">
                  <div class="amount-item">
                    <span class="label">应还本金</span>
                    <span class="amount due-amount">{{ formatAmount(detail.duePrincipal) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">应还利息</span>
                    <span class="amount due-amount">{{ formatAmount(detail.dueInterest) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">应还罚息</span>
                    <span class="amount due-amount penalty">{{ formatAmount(detail.duePenalty) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">应还复利</span>
                    <span class="amount due-amount penalty">{{ formatAmount(detail.dueCompoundInterest) }}</span>
                  </div>
                  <div class="amount-item total">
                    <span class="label">当期应还</span>
                    <span class="amount total-amount">{{ formatAmount(detail.dueAmount) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 实还信息 -->
              <div class="amount-section paid-section">
                <h5><span class="section-icon paid-icon">✅</span>实还信息</h5>
                <div class="amount-grid">
                  <div class="amount-item">
                    <span class="label">实还本金</span>
                    <span class="amount paid-amount">{{ formatAmount(detail.actualPaidPrincipal) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">实还利息</span>
                    <span class="amount paid-amount">{{ formatAmount(detail.actualPaidInterest) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">实还罚息</span>
                    <span class="amount paid-amount penalty">{{ formatAmount(detail.actualPaidPenalty) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 剩余信息 -->
              <div class="amount-section remaining-section">
                <h5><span class="section-icon remaining-icon">📊</span>剩余信息</h5>
                <div class="amount-grid">
                  <div class="amount-item">
                    <span class="label">剩余本金</span>
                    <span class="amount remaining-amount">{{ formatAmount(detail.remainingPrincipal) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="label">剩余罚息</span>
                    <span class="amount remaining-amount penalty">{{ formatAmount(detail.remainingPenalty) }}</span>
                  </div>
                  <div class="amount-item total">
                    <span class="label">剩余总额</span>
                    <span class="amount remaining-total">{{ formatAmount(detail.remainingTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, CreditCard, FileX } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface RepaymentDetail {
  installmentNo: number // 期次
  dueDate: string // 应还款日
  maxOverdueDays: number // 最大逾期天数
  repaymentStatus: string // 还款状态
  duePrincipal: number // 应还本金
  dueInterest: number // 应还利息
  duePenalty: number // 应还罚息
  dueCompoundInterest: number // 应还复利
  dueAmount: number // 当期应还金额
  actualPaidPrincipal: number // 实际还款本金
  actualPaidInterest: number // 实际还款利息
  actualPaidPenalty: number // 实际还款罚息
  remainingPrincipal: number // 剩余本金
  remainingPenalty: number // 剩余罚息
  remainingTotal: number // 剩余应还总额
}

interface LoanData {
  contractNo: string
  amount: number
  repaymentDetails?: RepaymentDetail[]
}

interface Props {
  visible: boolean
  loanData: LoanData | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const repaymentDetails = computed(() => {
  return props.loanData?.repaymentDetails || []
})

// 格式化金额
const formatAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// 格式化日期
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 获取还款状态颜色
const getRepaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '已还款': 'green',
    '未还款': 'orange',
    '逾期': 'red',
    '部分还款': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 一键复制还款明细数据
const copyAllRepaymentData = async () => {
  try {
    const headers = [
      '期次', '应还款日', '最大逾期天数', '还款状态', '应还本金', '应还利息', 
      '应还罚息', '应还复利', '当期应还金额', '实际还款本金', '实际还款利息', 
      '实际还款罚息', '剩余本金', '剩余罚息', '剩余应还总额'
    ]
    
    const rows = repaymentDetails.value.map(item => [
      item.installmentNo || '-',
      formatDate(item.dueDate),
      item.maxOverdueDays || 0,
      item.repaymentStatus || '-',
      formatAmount(item.duePrincipal),
      formatAmount(item.dueInterest),
      formatAmount(item.duePenalty),
      formatAmount(item.dueCompoundInterest),
      formatAmount(item.dueAmount),
      formatAmount(item.actualPaidPrincipal),
      formatAmount(item.actualPaidInterest),
      formatAmount(item.actualPaidPenalty),
      formatAmount(item.remainingPrincipal),
      formatAmount(item.remainingPenalty),
      formatAmount(item.remainingTotal)
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.join('\t'))
      .join('\n')
    
    await navigator.clipboard.writeText(csvContent)
    Message.success('还款明细数据已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Message.error('复制失败，请重试')
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 18px;
  height: 18px;
  color: #165dff;
}

.repayment-detail-drawer {
  padding: 0;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.loan-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.loan-amount {
  color: #86909c;
  font-size: 14px;
}

.action-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.cards-container {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86909c;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #c9cdd4;
}

.repayment-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.repayment-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.repayment-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f3f5;
}

.period-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-number {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.due-date {
  color: #86909c;
  font-size: 14px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.amount-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4e5969;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 4px;
}

.amount-item.total {
  background: #e8f4ff;
  border: 1px solid #bedaff;
}

.amount-item .label {
  font-size: 13px;
  color: #86909c;
}

.amount-item .amount {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.amount-item .amount.penalty {
  color: #f53f3f;
}

.amount-item .amount.total-amount {
  color: #165dff;
  font-weight: 600;
}

.amount-item .amount.paid-amount {
  color: #00b42a;
}

.amount-item .amount.paid-total-amount {
  color: #00b42a;
  font-weight: 600;
}

@media (max-width: 768px) {
  .drawer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .loan-info {
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .amount-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .repayment-card {
    padding: 16px;
  }
  
  .amount-item {
    padding: 6px 10px;
  }
}
</style>