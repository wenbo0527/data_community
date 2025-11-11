<template>
  <a-drawer
    v-model:visible="visible"
    title="用信详情"
    width="1000px"
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="loanData" class="loan-detail-content">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconFile class="section-icon" />
          基本信息
        </h3>
        <div class="info-grid">
          <div class="info-item highlight-item">
            <label>数据日期</label>
            <div class="info-value data-date">{{ formatDate(loanData.dataDate) }}</div>
          </div>
          <div class="info-item">
            <label>产品名称</label>
            <div class="info-value product-name">{{ loanData.productName }}</div>
          </div>
          <div class="info-item">
            <label>用信单号</label>
            <div class="info-value loan-no">
              {{ loanData.loanNo }}
              <IconCopy class="copy-icon" @click="copyText(loanData.loanNo)" />
            </div>
          </div>
          <div class="info-item">
            <label>用信日期</label>
            <div class="info-value">{{ formatDate(loanData.loanDate) }}</div>
          </div>
          <div class="info-item">
            <label>银行卡号</label>
            <div class="info-value bank-card">
              {{ maskBankCard(loanData.bankCard) }}
              <IconCopy class="copy-icon" @click="copyText(loanData.bankCard)" />
            </div>
          </div>
          <div class="info-item">
            <label>用信结果</label>
            <div class="info-value">
              <a-tag :color="getLoanResultColor(loanData.loanResult)">{{ loanData.loanResult }}</a-tag>
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
          <IconIdcard class="section-icon" />
          借据信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>借据号</label>
            <div class="info-value contract-no">
              {{ loanData.contractNo }}
              <IconCopy class="copy-icon" @click="copyText(loanData.contractNo)" />
            </div>
          </div>
          <div class="info-item">
            <label>放款时间</label>
            <div class="info-value">{{ formatDateTime(loanData.disbursementTime) }}</div>
          </div>
          <div class="info-item">
            <label>借据状态</label>
            <div class="info-value">
              <a-tag :color="getContractStatusColor(loanData.contractStatus)">{{ loanData.contractStatus }}</a-tag>
            </div>
          </div>
          <div class="info-item">
            <label>接口金额</label>
            <div class="info-value amount interface-amount">{{ formatAmount(loanData.interfaceAmount) }}</div>
          </div>
          <div class="info-item">
            <label>期数</label>
            <div class="info-value installments">{{ loanData.installments }}期</div>
          </div>
          <div class="info-item">
            <label>借款利率</label>
            <div class="info-value loan-rate">{{ (loanData.loanRate * 100).toFixed(4) }}%</div>
          </div>
        </div>
      </div>

      <!-- 逾期信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconExclamationCircle class="section-icon" />
          逾期信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>逾期天数</label>
            <div class="info-value overdue-days" :class="{ 'zero': loanData.overdueDays === 0 }">
              {{ loanData.overdueDays }}天
            </div>
          </div>
          <div class="info-item highlight-item">
            <label>历史最大逾期天数</label>
            <div class="info-value max-overdue-days">
              {{ loanData.maxOverdueDays }}天
              <IconInfoCircle v-if="loanData.maxOverdueDays > 0" class="info-icon" />
            </div>
          </div>
          <div class="info-item" v-if="loanData.overdueDate">
            <label>逾期日期</label>
            <div class="info-value overdue-date">{{ formatDate(loanData.overdueDate) }}</div>
          </div>
          <div class="info-item" v-if="loanData.settlementDate">
            <label>结清日期</label>
            <div class="info-value settlement-date">{{ formatDate(loanData.settlementDate) }}</div>
          </div>
        </div>
      </div>

      <!-- 还款信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconSafe class="section-icon" />
          还款信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>当前期次</label>
            <div class="info-value current-period">第{{ loanData.currentPeriod }}期</div>
          </div>
          <div class="info-item">
            <label>还款日</label>
            <div class="info-value repayment-date">{{ formatDate(loanData.repaymentDate) }}</div>
          </div>
          <div class="info-item">
            <label>实际还款本金</label>
            <div class="info-value amount actual-principal">{{ formatAmount(loanData.actualRepaymentPrincipal) }}</div>
          </div>
          <div class="info-item">
            <label>实际还款利息</label>
            <div class="info-value amount actual-interest">{{ formatAmount(loanData.actualRepaymentInterest) }}</div>
          </div>
          <div class="info-item">
            <label>实际还款罚息</label>
            <div class="info-value amount actual-penalty">{{ formatAmount(loanData.actualRepaymentPenalty) }}</div>
          </div>
          <div class="info-item highlight-item">
            <label>实际还款费用</label>
            <div class="info-value amount actual-fee">{{ formatAmount(loanData.actualRepaymentFee) }}</div>
          </div>
        </div>
      </div>

      <!-- 剩余信息 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconBarChart class="section-icon" />
          剩余信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>剩余本金</label>
            <div class="info-value amount remaining-principal">{{ formatAmount(loanData.remainingPrincipal) }}</div>
          </div>
          <div class="info-item highlight-item">
            <label>剩余利息</label>
            <div class="info-value amount remaining-interest">{{ formatAmount(loanData.remainingInterest) }}</div>
          </div>
          <div class="info-item highlight-item">
            <label>剩余罚息</label>
            <div class="info-value amount remaining-penalty">
              {{ formatAmount(loanData.remainingPenalty) }}
              <IconInfoCircle v-if="loanData.remainingPenalty > 0" class="penalty-icon" />
            </div>
          </div>
          <div class="info-item">
            <label>剩余应还总额</label>
            <div class="info-value amount remaining-total">{{ formatAmount(loanData.remainingTotal) }}</div>
          </div>
        </div>
      </div>

      <!-- 风险标识 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconSafe class="section-icon" />
          风险标识
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>是否核销</label>
            <div class="info-value">
              <a-tag :color="loanData.isWriteOff ? 'red' : 'green'">
                {{ loanData.isWriteOff ? '是' : '否' }}
              </a-tag>
            </div>
          </div>
          <div class="info-item">
            <label>是否理赔</label>
            <div class="info-value">
              <a-tag :color="loanData.isClaimed ? 'orange' : 'green'">
                {{ loanData.isClaimed ? '是' : '否' }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-section">
        <h3 class="section-title">
          <IconSettings class="section-icon" />
          相关操作
        </h3>
        <div class="action-buttons">
          <a-button type="primary" @click="viewRepaymentPlan">
            <IconCalendar class="action-icon" />
            查看还款计划
          </a-button>
          <a-button type="primary" @click="viewRepaymentHistory">
            <IconClockCircle class="action-icon" />
            查看还款历史
          </a-button>
          <a-button @click="exportLoanDetail">
            <IconDownload class="action-icon" />
            导出详情
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
import { 
  IconFile, IconIdcard, IconExclamationCircle, IconSafe, 
  IconBarChart, IconSettings, IconCopy, IconInfoCircle,
  IconCalendar, IconClockCircle, IconDownload
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

interface LoanDetailData {
  // 基本信息
  dataDate: string                    // 数据日期
  productName: string                 // 产品名称
  loanNo: string                     // 用信单号
  loanDate: string                   // 用信日期
  bankCard: string                   // 银行卡号
  loanResult: string                 // 用信结果
  rejectReason?: string              // 拒绝原因

  // 借据信息
  contractNo: string                 // 借据号
  disbursementTime: string           // 放款时间
  contractStatus: string             // 借据状态
  interfaceAmount: number            // 接口金额
  installments: number               // 期数
  loanRate: number                   // 借款利率

  // 逾期信息
  overdueDays: number                // 逾期天数
  maxOverdueDays: number             // 历史最大逾期天数
  overdueDate?: string               // 逾期日期
  settlementDate?: string            // 结清日期

  // 还款信息
  currentPeriod: number              // 当前期次
  repaymentDate: string              // 还款日
  actualRepaymentPrincipal: number   // 实际还款本金
  actualRepaymentInterest: number    // 实际还款利息
  actualRepaymentPenalty: number     // 实际还款罚息
  actualRepaymentFee: number         // 实际还款费用

  // 剩余信息
  remainingPrincipal: number         // 剩余本金
  remainingInterest: number          // 剩余利息
  remainingPenalty: number           // 剩余罚息
  remainingTotal: number             // 剩余应还总额

  // 风险标识
  isWriteOff: boolean                // 是否核销
  isClaimed: boolean                 // 是否理赔
}

interface Props {
  visible: boolean
  loanData?: LoanDetailData | null
}

interface Emits {
  'update:visible': [value: boolean]
  'viewRepaymentPlan': [data: LoanDetailData]
  'viewRepaymentHistory': [data: LoanDetailData]
  'exportLoanDetail': [data: LoanDetailData]
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
  if (amount === null || amount === undefined) return '¥0.00'
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

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 银行卡号脱敏
const maskBankCard = (cardNo: string): string => {
  if (!cardNo) return '-'
  if (cardNo.length <= 8) return cardNo
  return cardNo.substring(0, 4) + '****' + cardNo.substring(cardNo.length - 4)
}

// 获取用信结果颜色
const getLoanResultColor = (result: string): string => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '通过': 'green',
    '失败': 'red',
    '拒绝': 'red',
    '待审核': 'orange',
    '审核中': 'blue'
  }
  return colorMap[result] || 'gray'
}

// 获取借据状态颜色
const getContractStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'blue',
    '呆账': 'red',
    '核销': 'purple'
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

// 查看还款计划
const viewRepaymentPlan = () => {
  if (props.loanData) {
    emit('viewRepaymentPlan', props.loanData)
  }
}

// 查看还款历史
const viewRepaymentHistory = () => {
  if (props.loanData) {
    emit('viewRepaymentHistory', props.loanData)
  }
}

// 导出借据详情
const exportLoanDetail = () => {
  if (props.loanData) {
    emit('exportLoanDetail', props.loanData)
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
  margin: 0 0 20px 0;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  border-left: 3px solid #e5e6eb;
  transition: all 0.3s;
}

.info-item:hover {
  border-left-color: #165dff;
  background: #f0f7ff;
}

.highlight-item {
  border-left-color: #ff7d00 !important;
  background: #fff7e6 !important;
  box-shadow: 0 2px 8px rgba(255, 125, 0, 0.1);
}

.highlight-item:hover {
  border-left-color: #ff7d00 !important;
  background: #ffe7ba !important;
  box-shadow: 0 4px 12px rgba(255, 125, 0, 0.15);
}

.highlight-item label {
  color: #d25f00 !important;
  font-weight: 700 !important;
}

.info-item label {
  font-size: 12px;
  color: #86909c;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;
}

/* 特殊字段样式 */
.product-name {
  color: #165dff;
  font-weight: 600;
}

.loan-no,
.bank-card,
.contract-no {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #4e5969;
}

.copy-icon {
  width: 14px;
  height: 14px;
  color: #86909c;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #165dff;
}

.reject-reason {
  color: #f53f3f;
  font-weight: 600;
}

.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.interface-amount {
  color: #165dff;
}

.actual-principal {
  color: #00b42a;
}

.actual-interest {
  color: #ff7d00;
}

.actual-penalty {
  color: #f53f3f;
}

.actual-fee {
  color: #722ed1;
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
  font-size: 16px;
}

.loan-rate {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #722ed1;
}

.installments,
.current-period {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #165dff;
}

.overdue-days {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 700;
  color: #f53f3f;
  font-size: 16px;
}

.overdue-days.zero {
  color: #00b42a;
}

.max-overdue-days {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #ff7d00;
}

.overdue-date {
  color: #f53f3f;
  font-weight: 600;
}

.settlement-date {
  color: #00b42a;
  font-weight: 600;
}

.repayment-date {
  color: #165dff;
  font-weight: 600;
}

.penalty-icon {
  width: 16px;
  height: 16px;
  color: #f53f3f;
}

.info-icon {
  width: 14px;
  height: 14px;
  color: #ff7d00;
}

.data-date {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #165dff;
  font-size: 15px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.action-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .info-value {
    font-size: 13px;
  }
}
</style>