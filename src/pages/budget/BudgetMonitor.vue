<template>
  <div class="budget-monitor">
    <div class="page-header">
      <h2>预算监控</h2>
      <p class="desc">聚焦预算燃尽与健康度预警，支持月/季度粒度</p>
    </div>

    <!-- 顶部关键指标 -->
    <a-card class="metrics-card" title="关键指标" :bordered="true" style="margin-bottom: 12px">
      <div class="stat-grid">
        <a-statistic title="总预算" :value="totalBudget || 0" :precision="0" />
        <a-statistic title="已消耗" :value="usedBudget || 0" :precision="0" />
        <a-statistic title="剩余预算" :value="remainingBudget" :precision="0" />
        <div class="usage-progress">
          <div class="usage-label">预算使用率</div>
          <a-progress :percent="budgetUsageRate" size="small" />
        </div>
      </div>
      <a-divider />
      <div class="stat-subgrid">
        <a-statistic title="正常" :value="warningStats.normal" :precision="0" />
        <a-statistic title="超支" :value="warningStats.overCost" :precision="0" />
        <a-statistic title="消耗过慢" :value="warningStats.slowConsume" :precision="0" />
      </div>
    </a-card>

    <!-- 操作栏：筛选与操作 -->
    <a-affix :offset-top="0">
      <a-card class="toolbar" :bordered="true" title="筛选与操作">
      <a-form :model="filterForm" layout="inline">
        <a-form-item label="业务类型">
          <a-select v-model="filterForm.businessType" placeholder="请选择业务类型" style="width: 160px" allow-clear>
            <a-option value="助贷业务">助贷业务</a-option>
            <a-option value="融担类业务">融担类业务</a-option>
            <a-option value="直贷类业务">直贷类业务</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="平台产品">
          <a-select v-model="filterForm.platform" placeholder="请选择平台产品" style="width: 180px" allow-clear>
            <a-option v-for="p in platformOptions" :key="p" :value="p">{{ p }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标贷余">
          <a-select v-model="filterForm.targetLoan" placeholder="选择目标贷余" style="width: 160px" allow-clear>
            <a-option v-for="t in targetLoanOptions" :key="t" :value="t">{{ formatNumber(t) }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="年份">
          <a-select v-model="filterForm.year" placeholder="请选择年份" style="width: 140px" allow-clear>
            <a-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
          <a-button style="margin-left: 8px" type="outline" @click="refresh">刷新数据</a-button>
        </a-form-item>
      </a-form>
      </a-card>
    </a-affix>

    <!-- 内容区：预算监控图 -->
    <a-card title="预算监控图">
      <BudgetBurndownTabs
        :chart-data="burndownChartData"
        @chart-type-change="onChartModeChange"
        @granularity-change="onGranularityChange"
      />
    </a-card>

    <!-- 预算健康度预警（复用总览页展示逻辑） -->
    <a-card class="warning-card" title="预算健康度预警" style="margin-top: 12px">
      <template #extra>
        <a-button type="outline" @click="exportWarningData">
          <template #icon><IconUpload /></template>
          导出预警数据
        </a-button>
      </template>
      <a-table :data="filteredWarningData" row-key="id" :scroll="{ y: 420 }" :pagination="false" :bordered="{ wrapper: true, cell: true }">
        <template #columns>
          <a-table-column title="业务类型" data-index="businessType" :width="120" />
          <a-table-column title="平台产品" data-index="platform" :width="120">
            <template #cell="{ record }">
              <a-link @click="handlePlatformClick(record)">{{ record.platform }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="健康度" align="center" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getHealthStatusColor(record)">{{ getHealthStatus(record) }}</a-tag>
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
                      <IconArrowRise v-if="(record.actualCost - record.estimatedCost) > record.estimatedCost * 0.1" class="trend-icon warning-text" />
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
                      <IconArrowRise v-if="(record.actualAnnualCost - record.estimatedAnnualCost) > record.estimatedAnnualCost * 0.1" class="trend-icon warning-text" />
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
                      <IconArrowFall v-if="(record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) < record.estimatedRiskFreeReturn * -0.1" class="trend-icon warning-text" />
                    </span>
                  </div>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 平台产品弹窗 -->
    <PlatformProductModal 
      v-model:visible="platformModalVisible"
      :platform="currentPlatform?.platform || ''"
      :businessType="currentPlatform?.businessType || ''"
      :targetLoan="currentPlatform?.targetLoan || 0"
      :actualLoan="currentPlatform?.actualLoan || 0"
      :externalDataCost="currentPlatform?.externalDataCost || 0"
      :budgetStatus="currentPlatform?.budgetStatus || '超支'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'
import BudgetBurndownTabs from '../../components/modals/BudgetBurndownTabs.vue'
import PlatformProductModal from '../../components/modals/PlatformProductModal.vue'
import { useExternalDataStore } from '../../store/modules/external-data'
import type { WarningItem, BurndownPoint } from '../../store/modules/external-data'
import { useBudgetStore } from '../../store/modules/budget'
import { useBudgetStatsAggregator, buildMonthlyBurndown } from '../../composables/useBudgetCalculations'

// Store 实例
const budgetStore = useBudgetStore()
const externalStore = useExternalDataStore()

// 过滤表单（新增业务类型/平台/目标贷余/年份）
interface FilterForm {
  businessType: string
  platform: string
  targetLoan?: number | undefined
  year?: string | undefined
}
const filterForm = reactive<FilterForm>({ businessType: '', platform: '', targetLoan: undefined, year: undefined })

// 粒度与图表模式
const currentChartType = ref<'month' | 'quarter'>('month')
const chartMode = ref<'burndown' | 'cumulative'>('burndown')

// 预算燃尽图数据（优先使用外数监控，兜底用本地汇总构造）
const aggregator = useBudgetStatsAggregator(budgetStore.list)
const totalBudget = computed(() => aggregator.totalBudget.value)
const usedBudget = computed(() => aggregator.usedBudget.value)
const remainingBudget = computed(() => Math.max((Number(totalBudget.value) || 0) - (Number(usedBudget.value) || 0), 0))
// 关键指标：预算使用率（百分比）与预警统计
const budgetUsageRate = computed(() => {
  const total = Number(totalBudget.value) || 0
  const used = Number(usedBudget.value) || 0
  if (!total || total <= 0) return 0
  return Number(((used / total) * 100).toFixed(2))
})
const warningStats = computed(() => {
  const rows = filteredWarningData.value
  let normal = 0, overCost = 0, slowConsume = 0
  rows.forEach((r: any) => {
    const over = r.actualCost > r.estimatedCost * 1.1
    const slow = r.actualLoan < r.estimatedLoan * 0.9
    if (!over && !slow) normal += 1
    if (over) overCost += 1
    if (slow) slowConsume += 1
  })
  return { normal, overCost, slowConsume, total: rows.length }
})
const burndownChartData = computed<BurndownPoint[]>(() => {
  if (externalStore.burndown?.length) return externalStore.burndown
  return buildMonthlyBurndown(totalBudget.value, usedBudget.value)
})
const onChartModeChange = (mode: 'burndown' | 'cumulative') => { chartMode.value = mode }
const onGranularityChange = async (key: 'month' | 'quarter') => {
  currentChartType.value = key
  await externalStore.fetchBurndown({
    range: key,
    businessType: filterForm.businessType || undefined,
    platform: filterForm.platform || undefined,
    targetLoan: typeof filterForm.targetLoan === 'number' ? filterForm.targetLoan : undefined,
    year: filterForm.year || undefined,
  } as any)
}

// 预警数据
const warningData = ref<WarningItem[]>([])
const platformOptions = computed<string[]>(() => {
  const set = new Set<string>()
  budgetStore.list.forEach((i: any) => set.add(i.platform))
  warningData.value.forEach((i: any) => i.platform && set.add(i.platform))
  return Array.from(set)
})
const targetLoanOptions = computed<number[]>(() => {
  const set = new Set<number>()
  budgetStore.list.forEach((i: any) => typeof i.targetLoan === 'number' && set.add(i.targetLoan))
  warningData.value.forEach((i: any) => typeof i.targetLoan === 'number' && set.add(i.targetLoan))
  return Array.from(set).sort((a, b) => a - b)
})
const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())
const filteredWarningData = computed(() => {
  let rows = warningData.value
  // 业务类型/平台/目标贷余本地筛选
  if (filterForm.businessType) rows = rows.filter((r: any) => r.businessType === filterForm.businessType)
  if (filterForm.platform) rows = rows.filter((r: any) => r.platform === filterForm.platform)
  if (typeof filterForm.targetLoan === 'number') rows = rows.filter((r: any) => Number(r.targetLoan) === Number(filterForm.targetLoan))
  if (filterForm.year) rows = rows.filter((r: any) => (r.year ? String(r.year) === String(filterForm.year) : true))
  return rows
})

// 健康度颜色与标签
const getHealthStatus = (r: any) => {
  const overCost = r.actualCost > r.estimatedCost * 1.1
  const slowConsume = r.actualLoan < r.estimatedLoan * 0.9
  if (!overCost && !slowConsume) return '正常'
  if (overCost) return '超支'
  return '消耗过慢'
}
const getHealthStatusColor = (r: any) => {
  const s = getHealthStatus(r)
  return s === '正常' ? 'green' : (s === '超支' ? 'red' : 'orange')
}

// 平台弹窗
const platformModalVisible = ref(false)
const currentPlatform = ref<any>()
const handlePlatformClick = (record: any) => {
  currentPlatform.value = record
  platformModalVisible.value = true
}

// 导出预警数据
const exportWarningData = () => {
  const blob = new Blob([JSON.stringify(filteredWarningData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `budget-warnings-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 刷新数据
const refresh = async () => {
  try {
    await Promise.all([
      budgetStore.fetchBudgetList({ page: 1, pageSize: 10 }),
      externalStore.fetchBurndown({
        range: currentChartType.value,
        businessType: filterForm.businessType || undefined,
        platform: filterForm.platform || undefined,
        targetLoan: typeof filterForm.targetLoan === 'number' ? filterForm.targetLoan : undefined,
        year: filterForm.year || undefined,
      } as any),
      externalStore.fetchWarnings({
        businessType: filterForm.businessType || undefined,
        platform: filterForm.platform || undefined,
        targetLoan: typeof filterForm.targetLoan === 'number' ? filterForm.targetLoan : undefined,
        year: filterForm.year || undefined,
      } as any)
    ])
    warningData.value = externalStore.warnings
    Message.success('数据已刷新')
  } catch (e) {
    Message.error('刷新失败')
  }
}

// 查询与重置
const handleFilter = async () => {
  await refresh()
}
const resetFilter = async () => {
  filterForm.businessType = ''
  filterForm.platform = ''
  filterForm.targetLoan = undefined
  filterForm.year = undefined
  await refresh()
}

// 数值与百分比格式化
const formatNumber = (n: number) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString()
}
const formatPercent = (n: number) => {
  if (n === null || n === undefined) return '—'
  return `${(n * 100).toFixed(2)}%`
}

onMounted(refresh)
</script>

<style scoped>
.budget-monitor { padding: 16px; }
.page-header { margin-bottom: 16px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; background: #fff; }
.warning-text { color: #f53f3f; }
.comparison-cell { display: flex; justify-content: center; }
.trend-icon { margin-left: 4px; }
.content-row { margin-top: 12px; }
.metrics-card { min-height: 100%; }
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-items: center; }
.usage-progress { display: flex; flex-direction: column; gap: 6px; }
.usage-label { color: var(--color-text-2); font-size: 12px; }
.stat-subgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.warning-card :deep(.arco-table-body) { max-height: 420px; }
</style>