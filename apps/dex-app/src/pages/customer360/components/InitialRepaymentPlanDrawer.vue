<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="720"
    :closable="true"
    :mask-closable="true"
    placement="right"
  >
    <template #title>
      <div class="drawer-title">
        <IconCalendar class="title-icon" />
        初始还款计划
        <a-tag v-if="loanRecord" color="arcoblue" size="small" style="margin-left: 8px">
          {{ loanRecord.loanNo || '-' }}
        </a-tag>
      </div>
    </template>

    <div v-if="!loanRecord" class="empty-tip">暂无借据信息</div>

    <template v-else>
      <!-- 借据概要 -->
      <div class="summary-section">
        <div class="summary-item">
          <span class="label">借据金额</span>
          <span class="value amount-blue">{{ formatAmount(loanRecord.amount) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">年利率</span>
          <span class="value amount-green">{{ loanRecord.interestRate || '-' }}%</span>
        </div>
        <div class="summary-item">
          <span class="label">分期数</span>
          <span class="value">{{ loanRecord.installments || 0 }} 期</span>
        </div>
        <div class="summary-item">
          <span class="label">用信日期</span>
          <span class="value">{{ loanRecord.loanDate || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">还款方式</span>
          <span class="value">等额本息</span>
        </div>
        <div class="summary-item">
          <span class="label">每期应还</span>
          <span class="value amount-purple font-semibold">{{ formatAmount(monthlyPayment) }}</span>
        </div>
      </div>

      <!-- 还款计划表 -->
      <div class="plan-section">
        <div class="section-title">
          <IconCalendar class="section-icon" />
          还款计划明细
        </div>
        <a-table
          :data="repaymentPlan"
          row-key="period"
          :pagination="{ pageSize: 12, showTotal: true, showPageSize: true, pageSizeOptions: [6, 12, 24, 36] }"
          size="small"
          :bordered="{ wrapper: true, cell: false }"
        >
          <template #columns>
            <a-table-column title="借据编号" data-index="loanNo" :width="170">
              <template #cell="{ record }">
                <span class="copyable" :title="record.loanNo">{{ record.loanNo }}</span>
              </template>
            </a-table-column>
            <a-table-column title="期数" data-index="period" :width="80" align="center">
              <template #cell="{ record }">
                <a-tag color="gray" size="small">第 {{ record.period }} 期</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="应还日期" data-index="dueDate" :width="120" />
            <a-table-column title="应还本金" data-index="principal" :width="130" align="right">
              <template #cell="{ record }">
                <span class="amount-blue">{{ formatAmount(record.principal) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="应还利息" data-index="interest" :width="130" align="right">
              <template #cell="{ record }">
                <span class="amount-orange">{{ formatAmount(record.interest) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="本息合计" :width="130" align="right">
              <template #cell="{ record }">
                <span class="amount-purple font-semibold">
                  {{ formatAmount(record.principal + record.interest) }}
                </span>
              </template>
            </a-table-column>
          </template>
          <template #empty>
            <a-empty description="暂无还款计划数据" />
          </template>
        </a-table>
      </div>

      <!-- 提示 -->
      <div class="tip-section">
        <IconExclamationCircle class="tip-icon" />
        <span class="tip-text">
          初始还款计划为放款时生成的固定计划，实际还款以每期账单为准。如有提前还款、罚息等情形，请查看「还款信息」。
        </span>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconCalendar, IconExclamationCircle } from '@arco-design/web-vue/es/icon'

interface LoanRecord {
  loanNo?: string
  loanDate?: string
  amount?: number
  installments?: number
  interestRate?: number
  status?: string
}

interface Props {
  visible: boolean
  loanRecord?: LoanRecord | null
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  loanRecord: null
})

const emit = defineEmits<Emits>()

// 内部 ref 中转 visible，避免 v-model 直接绑 prop 触发编译报错
const drawerVisible = ref(props.visible)
watch(() => props.visible, (val) => {
  drawerVisible.value = val
})
watch(drawerVisible, (val) => {
  if (val !== props.visible) emit('close')
})

// 等额本息月供
const monthlyPayment = computed(() => {
  const principal = Number(props.loanRecord?.amount) || 0
  const months = Number(props.loanRecord?.installments) || 0
  const annualRate = Number(props.loanRecord?.interestRate) || 0
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  // 标准等额本息公式：M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + monthlyRate, months)
  return (principal * monthlyRate * factor) / (factor - 1)
})

// 生成还款计划明细
const repaymentPlan = computed(() => {
  const loan = props.loanRecord
  if (!loan) return []

  const principal = Number(loan.amount) || 0
  const months = Number(loan.installments) || 0
  const annualRate = Number(loan.interestRate) || 0
  const monthlyRate = annualRate / 100 / 12
  const startDate = loan.loanDate ? new Date(loan.loanDate) : new Date()

  if (principal <= 0 || months <= 0) return []

  const plan: Array<{
    loanNo: string
    period: number
    dueDate: string
    principal: number
    interest: number
  }> = []

  let remainingPrincipal = principal
  const fixedPayment = monthlyPayment.value

  for (let i = 1; i <= months; i++) {
    // 本期利息 = 上期剩余本金 × 月利率
    const interest = remainingPrincipal * monthlyRate
    // 本期本金 = 固定月供 - 利息（最后一期做收尾处理）
    let periodPrincipal = fixedPayment - interest
    if (i === months) {
      periodPrincipal = remainingPrincipal
    }
    periodPrincipal = Math.max(0, periodPrincipal)

    // 应还日期：放款日 + i 个月
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    plan.push({
      loanNo: loan.loanNo || '-',
      period: i,
      dueDate: formatDate(dueDate),
      principal: roundToCent(periodPrincipal),
      interest: roundToCent(interest)
    })

    remainingPrincipal -= periodPrincipal
    if (remainingPrincipal < 0.01) remainingPrincipal = 0
  }

  return plan
})

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const roundToCent = (num: number) => Math.round(num * 100) / 100

const formatAmount = (amount?: number | null) => {
  if (amount === null || amount === undefined) return '-'
  if (amount === 0) return '¥0.00'
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<style scoped>
.drawer-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.title-icon {
  margin-right: 8px;
  color: var(--subapp-primary);
}

.empty-tip {
  text-align: center;
  padding: 80px 0;
  color: var(--subapp-text-tertiary);
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.summary-item .label {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
}

.summary-item .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.plan-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.section-icon {
  margin-right: 8px;
  color: var(--subapp-primary);
}

.tip-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff7e6;
  border-radius: 4px;
  border-left: 3px solid #ff7d00;
}

.tip-icon {
  color: #ff7d00;
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: #595959;
  line-height: 1.6;
}

.copyable {
  cursor: pointer;
  color: var(--subapp-text-primary);
}

.amount-blue { color: #1655d0; font-family: 'DIN Alternate', sans-serif; font-weight: 500; }
.amount-orange { color: #ff7d00; font-family: 'DIN Alternate', sans-serif; font-weight: 500; }
.amount-purple { color: #722ed1; font-family: 'DIN Alternate', sans-serif; font-weight: 500; }
.amount-green { color: #00b42a; }

@media (max-width: 768px) {
  .summary-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>