<template>
  <a-drawer
    v-model:visible="visible"
    title="放款明细"
    width="700px"
    :footer="false"
    @cancel="handleClose"
    unmount-on-close
  >
    <template #title>
      <div class="drawer-title">
        <Banknote class="title-icon" />
        放款明细
      </div>
    </template>

    <div class="disbursement-detail-drawer">
      <div class="drawer-header">
        <div class="loan-info">
          <h4>借据号：{{ loanData?.contractNo }}</h4>
          <span class="loan-amount">借款金额：{{ formatAmount(loanData?.amount) }}</span>
        </div>
        <a-button type="primary" @click="copyDisbursementData">
          <Copy class="action-icon" />
          一键复制
        </a-button>
      </div>

      <div class="cards-container">
        <div v-if="!disbursementDetail" class="empty-state">
          <FileX class="empty-icon" />
          <p>暂无放款明细数据</p>
        </div>
        
        <div v-else class="disbursement-card">
          <div class="card-header">
            <div class="status-info">
              <span class="card-title">放款信息</span>
              <a-tag :color="getDisbursementStatusColor(disbursementDetail?.status)" size="small">
                {{ disbursementDetail?.status }}
              </a-tag>
            </div>
            <div class="disbursement-date">
              放款日期：{{ formatDate(disbursementDetail?.disbursementDate) }}
            </div>
          </div>
          
          <div class="card-content">
            <div class="info-section">
              <h5>放款信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">放款金额</span>
                  <span class="value amount-highlight">{{ formatAmount(disbursementDetail?.amount) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">放款渠道</span>
                  <span class="value">{{ disbursementDetail?.channel }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h5>收款信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">收款银行</span>
                  <span class="value">{{ disbursementDetail?.bankName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">收款账号</span>
                  <span class="value bank-account">{{ maskBankCard(disbursementDetail?.bankAccount) }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="disbursementDetail?.remark" class="info-section">
              <h5>备注信息</h5>
              <div class="remark-content">
                {{ disbursementDetail?.remark }}
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
import { Copy, Banknote, FileX } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

interface DisbursementDetail {
  disbursementDate: string
  disbursementAmount: number
  channel: string
  status: string
  receivingBank: string
  receivingAccount: string
  transactionNo: string
  processTime: string
  remark: string
}

interface LoanData {
  contractNo: string
  amount: number
  disbursementDetail?: DisbursementDetail
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

const disbursementDetail = computed(() => {
  return props.loanData?.disbursementDetail
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

// 格式化日期时间
const formatDateTime = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 格式化银行卡号（脱敏）
const formatBankCard = (cardNo: string | undefined | null): string => {
  if (!cardNo) return '-'
  if (cardNo.length <= 8) return cardNo
  return cardNo.slice(0, 4) + '****' + cardNo.slice(-4)
}

// 获取放款状态颜色
const getDisbursementStatusColor = (status: string | undefined): string => {
  const colorMap: Record<string, string> = {
    '放款成功': 'green',
    '放款中': 'blue',
    '放款失败': 'red',
    '待放款': 'orange'
  }
  return colorMap[status || ''] || 'gray'
}

const copyDisbursementData = async () => {
  if (!disbursementDetail.value) {
    Message.warning('暂无数据可复制')
    return
  }

  const headers = ['放款日期', '放款金额', '放款渠道', '收款银行', '收款账号', '放款状态', '备注']
  const data = [
    formatDate(disbursementDetail.value.disbursementDate) || '-',
    formatAmount(disbursementDetail.value.amount) || '-',
    disbursementDetail.value.channel || '-',
    disbursementDetail.value.bankName || '-',
    disbursementDetail.value.bankAccount || '-',
    disbursementDetail.value.status || '-',
    disbursementDetail.value.remark || '-'
  ]

  const copyText = headers.join('\t') + '\n' + data.join('\t')

  try {
    await navigator.clipboard.writeText(copyText)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
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

.disbursement-detail-drawer {
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

.disbursement-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.disbursement-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.disbursement-date {
  color: #86909c;
  font-size: 14px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4e5969;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

.info-item .label {
  font-size: 14px;
  color: #86909c;
  font-weight: 500;
}

.info-item .value {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.info-item .value.amount-highlight {
  color: #165dff;
  font-weight: 600;
  font-size: 16px;
}

.info-item .value.bank-account {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #4e5969;
}

.remark-content {
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.5;
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .disbursement-card {
    padding: 16px;
  }
  
  .info-item {
    padding: 10px 12px;
  }
}
</style>