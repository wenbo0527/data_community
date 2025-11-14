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

    

    <!-- 顶部概览卡片 -->
    <a-grid :cols="5" :col-gap="12" :row-gap="12" class="stats">
      <a-grid-item :span="1">
        <a-card hoverable>
          <a-statistic title="当年预算总额" :value="totalBudget" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item :span="1">
        <a-card hoverable>
          <a-statistic title="当前累积消耗" :value="usedBudget" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item :span="1">
        <a-card hoverable>
          <a-statistic title="当年实际核销" :value="totalWrittenOff" :precision="0">
            <template #suffix>元</template>
          </a-statistic>
        </a-card>
      </a-grid-item>
      <a-grid-item :span="1">
        <a-card hoverable>
          <a-statistic title="预算健康度" :value="healthScore" :precision="0" />
        </a-card>
      </a-grid-item>
      <a-grid-item :span="1" v-if="false">
        <a-card hoverable>
          <a-statistic title="占位" :value="0" />
        </a-card>
      </a-grid-item>
    </a-grid>

    <!-- 预算燃尽图 -->
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
                    <div class="list-sub">到期 {{ formatDate(item.endDate as any) }}</div>
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
              <a-statistic title="平均剩余比例" :value="avgRemainingRateDisplay" />
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

    <a-card v-if="false" title="预算数据列表" :loading="loading">
      <a-table
        :data="list"
        row-key="id"
        :pagination="{ total, pageSize, current, showTotal: true }"
        @page-change="onPageChange"
      >
        <a-table-column title="业务类型" data-index="businessType" :width="140"/>
        <a-table-column title="平台" data-index="platform" :width="140"/>
        <a-table-column title="目标放款" :width="140">
          <template #cell="{ record }">{{ formatNumber(record.targetLoan) }}</template>
        </a-table-column>
        <a-table-column title="预估放款" :width="140">
          <template #cell="{ record }">{{ formatNumber(record.estimatedLoan) }}</template>
        </a-table-column>
        <a-table-column title="预估成本" :width="120">
          <template #cell="{ record }">{{ formatNumber(record.estimatedCost) }}</template>
        </a-table-column>
        <a-table-column title="预估年化成本" :width="120">
          <template #cell="{ record }">{{ formatPercent(record.estimatedAnnualCost) }}</template>
        </a-table-column>
        <a-table-column title="预估无风险收益" :width="140">
          <template #cell="{ record }">{{ formatPercent(record.estimatedRiskFreeReturn) }}</template>
        </a-table-column>
        <a-table-column title="操作" :width="140">
          <template #cell="{ record }">
            <a-popconfirm content="确认删除该条目？" @ok="() => remove(record.id)">
              <a-button size="small" status="danger" type="text">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <!-- 预警信息展示 -->
    <!-- 预算健康度预警（引用 external-data 监控能力） -->
    <a-card v-if="false" class="warning-card" title="预算健康度预警" style="margin-top: 12px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <a-space>
          <a-select v-model="filterForm.healthStatus" placeholder="健康度状态" style="width: 160px" multiple>
            <a-option value="正常">正常</a-option>
            <a-option value="超支">超支</a-option>
            <a-option value="消耗过慢">消耗过慢</a-option>
          </a-select>
        </a-space>
        <a-space>
          <a-button type="text" @click="goTo('/risk/budget/monitor')">前往监控</a-button>
          <a-button type="primary" @click="exportWarningData">导出数据</a-button>
        </a-space>
      </div>
      <a-table :data="warningData.slice(0,5)" :pagination="false" :bordered="{ wrapper: true, cell: true }">
        <template #columns>
          <a-table-column title="业务类型" data-index="businessType" :width="120" />
          <a-table-column title="平台产品" data-index="platform" :width="120">
            <template #cell="{ record }">
              <a-link @click="handlePlatformClick(record)">{{ record.platform }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="实际放款" align="center" :width="150">
            <template #cell="{ record }">
              <span :class="{ 'warning-text': record.actualLoan > record.estimatedLoan * 1.1 }">
                {{ formatNumber(record.actualLoan) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="实际费用" align="center" :width="200">
            <template #cell="{ record }">
              <div class="comparison-cell">
                <a-tooltip :content="`预算: ${formatNumber(record.estimatedCost)}\n实际: ${formatNumber(record.actualCost)}\n偏离率: ${formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost)}`">
                  <div class="cost-info">
                    <span class="cost-value" :class="{ 'warning-text': record.actualCost > record.estimatedCost * 1.1 }">
                      {{ formatNumber(record.actualCost) }}
                    </span>
                    <span class="deviation-value" :class="{ 'warning-text': (record.actualCost - record.estimatedCost) > record.estimatedCost * 0.1 }">
                      ({{ formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost) }})
                      <icon-arrow-rise v-if="(record.actualCost - record.estimatedCost) > record.estimatedCost * 0.1" class="trend-icon warning-text" />
                    </span>
                  </div>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="年化数据成本" align="center" :width="200">
            <template #cell="{ record }">
              <div class="comparison-cell">
                <a-tooltip :content="`预算: ${formatPercent(record.estimatedAnnualCost)}\n实际: ${formatPercent(record.actualAnnualCost)}\n偏离率: ${formatPercent((record.actualAnnualCost - record.estimatedAnnualCost) / record.estimatedAnnualCost)}`">
                  <div class="cost-info">
                    <span class="cost-value" :class="{ 'warning-text': record.actualAnnualCost > record.estimatedAnnualCost * 1.1 }">
                      {{ formatPercent(record.actualAnnualCost) }}
                    </span>
                    <span class="deviation-value" :class="{ 'warning-text': (record.actualAnnualCost - record.estimatedAnnualCost) > record.estimatedAnnualCost * 0.1 }">
                      ({{ formatPercent((record.actualAnnualCost - record.estimatedAnnualCost) / record.estimatedAnnualCost) }})
                      <icon-arrow-rise v-if="(record.actualAnnualCost - record.estimatedAnnualCost) > record.estimatedAnnualCost * 0.1" class="trend-icon warning-text" />
                    </span>
                  </div>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="无风险收益" align="center" :width="180">
            <template #cell="{ record }">
              <div class="comparison-cell">
                <a-tooltip :content="`预算: ${formatPercent(record.estimatedRiskFreeReturn)}\n实际: ${formatPercent(record.actualRiskFreeReturn)}\n偏离率: ${formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn)}`">
                  <div class="cost-info">
                    <span class="cost-value" :class="{ 'warning-text': record.actualRiskFreeReturn < record.estimatedRiskFreeReturn * 0.9 }">
                      {{ formatPercent(record.actualRiskFreeReturn) }}
                    </span>
                    <span class="deviation-value" :class="{ 'warning-text': (record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) < record.estimatedRiskFreeReturn * -0.1 }">
                      ({{ formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn) }})
                      <icon-arrow-fall v-if="(record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) < record.estimatedRiskFreeReturn * -0.1" class="trend-icon warning-text" />
                    </span>
                  </div>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/store/modules/budget'
import type { BudgetData } from '@/store/modules/budget'
import { Message } from '@arco-design/web-vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import { useBudgetStatsAggregator, buildMonthlyBurndown, useBudgetCalculations } from '@/composables/useBudgetCalculations'
import { useExternalDataStore } from '@/store/modules/external-data'
import type { WarningItem, BurndownPoint } from '@/store/modules/external-data'
import { useContractStore } from '@/store/modules/contract'

const store = useBudgetStore()
const externalStore = useExternalDataStore()
const contractStore = useContractStore()
const pageSize = ref(10)
const current = ref(1)
const router = useRouter()
const goTo = (path: string) => { router.push(path) }

const loading = computed(() => store.loading)
const list = computed(() => store.list)
const total = computed(() => store.total)
const stats = computed(() => store.stats)

// 指标汇总（目标=预算总额；预估=已执行金额）
const aggregator = useBudgetStatsAggregator(store.list)
const totalBudget = computed(() => aggregator.totalBudget.value)
const usedBudget = computed(() => aggregator.usedBudget.value)
const executionRate = computed(() => aggregator.executionRate.value)
const totalWrittenOff = computed(() => contractStore.list.reduce((sum, i: any) => sum + (Number(i.writtenOffAmount) || 0), 0))

// 健康度评分与同比/环比
const { calculateHealthScore } = useBudgetCalculations()
const healthScore = computed(() => calculateHealthScore(usedBudget.value, totalBudget.value))
const healthScoreDisplay = computed(() => `${healthScore.value}`)

// 燃尽图数据（默认按月，从 externalData 或本地计算兜底）
const currentChartType = ref<'month' | 'quarter'>('month')
const chartMode = ref<'burndown' | 'cumulative'>('burndown')
const burndownChartData = computed<BurndownPoint[]>(() => {
  if (externalStore.burndown?.length) return externalStore.burndown
  return buildMonthlyBurndown(totalBudget.value, usedBudget.value)
})
const onChartModeChange = (mode: 'burndown' | 'cumulative') => {
  chartMode.value = mode
}
const onGranularityChange = async (key: 'month' | 'quarter') => {
  currentChartType.value = key
  await externalStore.fetchBurndown({ range: key })
}

const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

const load = async () => {
  await store.fetchBudgetList({ page: current.value, pageSize: pageSize.value })
  await externalStore.fetchBurndown({ range: currentChartType.value })
  await contractStore.fetchContractList({ page: 1, pageSize: 100 })
  await externalStore.fetchWarnings({})
}

const reload = () => {
  load().then(() => Message.success('刷新成功')).catch(() => Message.error('刷新失败'))
}

// 新增预算、上传与删除逻辑已移除，聚焦总览与监控

const onPageChange = (page: number) => {
  current.value = page
  load()
}

const formatNumber = (n: number) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString()
}
const formatPercent = (n: number) => {
  if (n === null || n === undefined) return '—'
  return `${(n * 100).toFixed(2)}%`
}

const formatDate = (d: Date) => {
  try { return new Date(d).toLocaleString() } catch { return '—' }
}

onMounted(load)

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
const warningsTop = computed(() => {
  const arr = (externalStore.warnings || []).slice()
  arr.sort((a: any, b: any) => costDeviation(b) - costDeviation(a))
  return arr.slice(0, 5)
})

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
const avgRemainingRateDisplay = computed(() => `${(avgRemainingRate.value * 100).toFixed(2)}%`)
const topPendingSettlementContracts = computed(() => pendingSettlementContracts.value.slice().sort((a: any, b: any) => remainingAmount(b) - remainingAmount(a)).slice(0, 5))
const openContract = (id: string) => router.push(`/risk/budget/contracts/${id}`)
</script>

<style scoped>
.budget-overview { padding: 8px; }
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.nav-card { margin-bottom: 12px; }
.stats { margin-bottom: 12px; }
.sub-note { margin-top: 4px; color: var(--color-text-2); font-size: 12px; }
.warning-text { color: #f53f3f; }
.comparison-cell { display: flex; justify-content: center; }
.trend-icon { margin-left: 4px; }
.list-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; }
.list-title { font-weight: 500; }
.list-sub { color: var(--color-text-2); font-size: 12px; }
.stat-inline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
</style>
