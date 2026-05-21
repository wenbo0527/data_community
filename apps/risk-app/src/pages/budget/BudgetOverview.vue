<template>
  <div class="budget-overview">
    <div class="page-header">
      <h2>预算总览</h2>
      <p class="desc">承载预算功能导航与关键指标查看</p>
    </div>

    <a-card class="nav-card" :bordered="true" title="功能导航">
      <a-space>
        <a-button type="primary" @click="goTo('/risk/budget/list')">预算列表</a-button>
        <a-button type="primary" @click="goTo('/risk/budget/monitor')">预算监控</a-button>
        <a-button type="primary" @click="goTo('/risk/budget/contracts')">合同管理</a-button>
        <a-button type="primary" @click="goTo('/risk/budget/settlement')">结算管理</a-button>
      </a-space>
    </a-card>

    <a-grid :cols="4" :col-gap="12" :row-gap="12" class="stats">
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="当年预算总额" :value="totalBudget" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="当前累积消耗" :value="usedBudget" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="当年实际核销" :value="totalWrittenOff" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card hoverable>
          <a-statistic title="预算健康度" :value="healthScore" :precision="0" />
        </a-card>
      </a-grid-item>
    </a-grid>

    <a-card title="预算监控">
      <template #extra>
        <a-button type="text" @click="goTo('/risk/budget/monitor')">前往预算监控</a-button>
      </template>
      <BudgetBurndownTabs
        :chart-data="burndownChartData"
        @chart-type-change="onChartModeChange"
        @granularity-change="onGranularityChange"
      />
    </a-card>

    <a-divider />

    <a-grid :cols="2" :col-gap="12" :row-gap="12">
      <a-grid-item>
        <a-card title="预算消耗预警">
          <a-list :data="warningsTop" :bordered="false" :pagination="false">
            <template #item="{ item }">
              <div class="list-row" @click="goTo('/risk/budget/monitor')">
                <div class="list-main">
                  <div class="list-title">{{ item.businessType }} · {{ item.platform }}</div>
                  <div class="list-sub">偏离率 {{ formatPercent(costDeviation(item)) }}</div>
                </div>
                <a-tag :status="statusTag(item)">{{ statusLabel(item) }}</a-tag>
              </div>
            </template>
          </a-list>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-space direction="vertical" :size="12" style="width: 100%">
          <a-card title="合同概览">
            <div class="stat-inline">
              <a-statistic title="≤7天到期" :value="expiring7Count" />
              <a-statistic title="≤30天到期" :value="expiring30Count" />
              <a-statistic title="待核销金额" :value="pendingWriteOffAmount" />
            </div>
            <a-list :data="topExpiringContracts" :bordered="false" :pagination="false" style="margin-top: 12px">
              <template #item="{ item }">
                <div class="list-row" @click="openContract(item.id)">
                  <div class="list-main">
                    <div class="list-title">{{ item.supplier || '—' }} · {{ item.contractName || '合同' }}</div>
                    <div class="list-sub">到期 {{ formatDate(item.endDate) }}</div>
                  </div>
                  <a-tag :status="expireTagStatus(item.endDate)">到期</a-tag>
                </div>
              </template>
            </a-list>
            <div style="text-align: right; margin-top: 8px">
              <a-button type="text" @click="goTo('/risk/budget/contracts')">前往合同管理</a-button>
            </div>
          </a-card>
          <a-card title="结算概览">
            <div class="stat-inline">
              <a-statistic title="待结算合同数" :value="pendingSettlementCount" />
              <a-statistic title="待结算总额" :value="pendingSettlementAmount" />
              <a-statistic title="平均剩余比例" :value="Number((avgRemainingRate * 100).toFixed(2))" :precision="2">
                <template #suffix>%</template>
              </a-statistic>
            </div>
            <a-list :data="topPendingSettlementContracts" :bordered="false" :pagination="false" style="margin-top: 12px">
              <template #item="{ item }">
                <div class="list-row" @click="goTo('/risk/budget/settlement')">
                  <div class="list-main">
                    <div class="list-title">{{ item.supplier || '—' }} · {{ item.contractName || '合同' }}</div>
                    <div class="list-sub">剩余结算 {{ formatNumber(remainingAmount(item)) }} 元</div>
                  </div>
                  <a-tag status="warning">待结算</a-tag>
                </div>
              </template>
            </a-list>
            <div style="text-align: right; margin-top: 8px">
              <a-button type="text" @click="goTo('/risk/budget/settlement')">前往结算管理</a-button>
            </div>
          </a-card>
        </a-space>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/modules/budget/stores/budget'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useBudgetMonitorStore } from '@/modules/budget/stores/budget-monitor'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'

const budgetStore = useBudgetStore()
const contractStore = useContractStore()
const monitorStore = useBudgetMonitorStore()
const router = useRouter()
const goTo = (path: string) => { router.push(path) }

const totalBudget = computed(() => budgetStore.list.reduce((sum: number, i: any) => sum + Number(i.targetLoan || 0), 0))
const usedBudget = computed(() => budgetStore.list.reduce((sum: number, i: any) => sum + Number(i.estimatedCost || 0), 0))
const totalWrittenOff = computed(() => contractStore.list.reduce((sum, i: any) => sum + (Number(i.writtenOffAmount) || 0), 0))
const healthScore = computed(() => {
  const total = Number(totalBudget.value) || 0
  const used = Number(usedBudget.value) || 0
  if (!total) return 0
  return Math.max(0, Math.min(100, Math.round((1 - used / total) * 100)))
})

const burndownChartData = ref<any[]>([])
const onChartModeChange = (mode: 'burndown' | 'cumulative') => {}
const onGranularityChange = async (key: 'month' | 'quarter') => {}

const warningsTop = computed(() => (monitorStore.warnings || []).slice(0, 5))

const costDeviation = (w: any) => {
  const base = Number(w.estimatedCost) || 0
  const actual = Number(w.actualCost) || 0
  if (!base) return 0
  return (actual - base) / base
}
const statusLabel = (w: any) => {
  const over = Number(w.actualCost) > Number(w.estimatedCost) * 1.1
  const slow = Number(w.actualLoan) < Number(w.estimatedLoan) * 0.7
  if (over) return '超支'
  if (slow) return '消耗过慢'
  return '正常'
}
const statusTag = (w: any) => {
  const over = Number(w.actualCost) > Number(w.estimatedCost) * 1.1
  const slow = Number(w.actualLoan) < Number(w.estimatedLoan) * 0.7
  if (over) return 'danger'
  if (slow) return 'warning'
  return 'success'
}

const daysToExpire = (end?: string) => {
  try {
    const now = new Date()
    const target = new Date(end || '')
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  } catch { return NaN }
}
const expireTagStatus = (end?: string) => {
  const d = daysToExpire(end)
  if (isNaN(d)) return 'default'
  if (d < 0) return 'danger'
  if (d <= 7) return 'danger'
  if (d <= 30) return 'warning'
  return 'success'
}
const expiring7Count = computed(() => contractStore.list.filter((i: any) => { const d = daysToExpire(i.endDate); return !isNaN(d) && d >= 0 && d <= 7 }).length)
const expiring30Count = computed(() => contractStore.list.filter((i: any) => { const d = daysToExpire(i.endDate); return !isNaN(d) && d >= 0 && d <= 30 }).length)
const remainingAmount = (i: any) => Math.max(0, (Number(i.amount) || 0) - (Number(i.writtenOffAmount) || 0))
const pendingWriteOffAmount = computed(() => contractStore.list.reduce((sum: number, i: any) => sum + remainingAmount(i), 0))
const topExpiringContracts = computed(() => {
  const arr = contractStore.list.slice().filter((i: any) => { const d = daysToExpire(i.endDate); return !isNaN(d) && d >= 0 }).sort((a: any, b: any) => daysToExpire(a.endDate) - daysToExpire(b.endDate))
  return arr.slice(0, 5)
})
const pendingSettlementContracts = computed(() => contractStore.list.filter((i: any) => remainingAmount(i) > 0))
const pendingSettlementCount = computed(() => pendingSettlementContracts.value.length)
const pendingSettlementAmount = computed(() => pendingSettlementContracts.value.reduce((sum: number, i: any) => sum + remainingAmount(i), 0))
const avgRemainingRate = computed(() => {
  const arr = pendingSettlementContracts.value
  if (!arr.length) return 0
  const rates = arr.map((i: any) => { const amt = Number(i.amount) || 0; const rem = remainingAmount(i); return amt > 0 ? rem / amt : 0 })
  return rates.reduce((a: number, b: number) => a + b, 0) / rates.length
})
const topPendingSettlementContracts = computed(() => pendingSettlementContracts.value.slice().sort((a: any, b: any) => remainingAmount(b) - remainingAmount(a)).slice(0, 5))
const openContract = (id: string) => router.push(`/risk/budget/contracts/${id}`)

const formatNumber = (n: number) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString()
}
const formatPercent = (n: number) => {
  if (n === null || n === undefined) return '—'
  return `${(n * 100).toFixed(2)}%`
}
const formatDate = (d: any) => {
  try { return new Date(d).toLocaleDateString('zh-CN') } catch { return '—' }
}

const load = async () => {
  await budgetStore.fetchBudgetList({ page: 1, pageSize: 10 })
  await contractStore.fetchContractList({ page: 1, pageSize: 100 })
  await monitorStore.fetchWarnings({})
}

onMounted(load)
</script>

<style scoped>
.budget-overview { padding: 8px; }
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.nav-card { margin-bottom: 12px; }
.stats { margin-bottom: 12px; }
.list-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; }
.list-title { font-weight: 500; }
.list-sub { color: var(--color-text-2); font-size: 12px; }
.stat-inline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
</style>
