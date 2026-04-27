<template>
  <a-spin :loading="loading" tip="数据加载中..." class="full-loading">
  <div class="budget-monitor">
    <div class="page-header">
      <h2>预算监控</h2>
      <p class="desc">聚焦预算燃尽与健康度预警，支持月/季度粒度</p>
    </div>
    <a-affix :offset-top="0">
      <a-card class="toolbar" :bordered="true" title="筛选与操作">
        <template #extra>
          <a-space>
            <a-button type="outline" @click="goExternalArchive">外数档案</a-button>
          </a-space>
        </template>
      <a-form :model="filterForm" layout="inline" @keydown.enter.prevent="handleFilter">
        <a-form-item label="业务类型">
          <a-select v-model="filterForm.businessType" placeholder="请选择业务类型" style="width: 160px" allow-clear>
            <a-option v-for="bt in businessTypeOptions" :key="bt" :value="bt">{{ bt }}</a-option>
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
        <a-form-item>
          <a-button type="primary" @click="handleFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
          <a-button style="margin-left: 8px" type="outline" @click="refresh">刷新数据</a-button>
        </a-form-item>
      </a-form>
      </a-card>
    </a-affix>
    <a-card title="预算监控图">
      <BudgetBurndownTabs
        :chart-data="burndownChartData"
        @chart-type-change="onChartModeChange"
        @granularity-change="onGranularityChange"
      />
    </a-card>
    <a-card class="warning-card" title="预算健康度预警" style="margin-top: 12px">
      <template #extra>
        <a-button type="outline" @click="exportWarningData">
          <template #icon><IconUpload /></template>
          导出预警数据
        </a-button>
      </template>
      <div class="table-operations" style="margin-bottom: 8px">
        <a-button :disabled="selectedKeys.length === 0" @click="handleBatchExport">批量导出</a-button>
      </div>
      <a-table :data="filteredWarningData" row-key="id" v-model:selectedKeys="selectedKeys" :row-selection="{ type: 'checkbox', showCheckedAll: true }" :scroll="{ y: 420 }" :pagination="{ showTotal: true, showPageSize: true, total: filteredWarningData.length, current: pagination.current, pageSize: pagination.pageSize }" @page-change="handlePageChange" @page-size-change="handlePageSizeChange" :bordered="{ wrapper: true, cell: true }">
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
    <PlatformProductModal 
      v-model:visible="platformModalVisible"
      :platform="currentPlatform?.platform || ''"
      :businessType="currentPlatform?.businessType || ''"
      :targetLoan="currentPlatform?.targetLoan || 0"
      :actualLoan="currentPlatform?.actualLoan || 0"
      :externalDataCost="currentPlatform?.externalDataCost || 0"
      :budgetStatus="currentPlatform?.budgetStatus || '超支'"
      :estimatedCost="currentPlatform?.estimatedCost || 0"
      :actualCost="currentPlatform?.actualCost || 0"
      :estimatedAnnualCost="currentPlatform?.estimatedAnnualCost || 0"
      :actualAnnualCost="currentPlatform?.actualAnnualCost || 0"
      :estimatedRiskFreeReturn="currentPlatform?.estimatedRiskFreeReturn || 0"
      :actualRiskFreeReturn="currentPlatform?.actualRiskFreeReturn || 0"
    />
  </div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { IconUpload, IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import PlatformProductModal from '@/components/modals/PlatformProductModal.vue'
import { useBudgetMonitorStore } from '@/modules/budget/stores/budget-monitor'
import { useBudgetStore } from '@/modules/budget/stores/budget'

const budgetStore = useBudgetStore()
const monitorStore = useBudgetMonitorStore()
const router = useRouter()

interface WarningItem {
  id: string | number
  businessType?: string
  platform?: string
  targetLoan?: number
  estimatedLoan?: number
  actualLoan?: number
  estimatedCost?: number
  actualCost?: number
  estimatedAnnualCost?: number
  actualAnnualCost?: number
  estimatedRiskFreeReturn?: number
  actualRiskFreeReturn?: number
  externalDataCost?: number
  budgetStatus?: string
}

interface FilterForm { businessType: string; platform: string; targetLoan?: number | undefined }
const filterForm = reactive<FilterForm>({ businessType: '', platform: '', targetLoan: undefined })
const STORAGE_KEY = 'risk_budget_monitor_filter_pref'
const initFilters = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) Object.assign(filterForm, JSON.parse(cached))
  } catch {}
}

const currentChartType = ref<'month' | 'quarter'>('month')
const chartMode = ref<'burndown' | 'cumulative'>('burndown')

const totalBudget = computed(() => (budgetStore.list || []).reduce((sum: number, i: any) => sum + Number(i.total || 0), 0))
const usedBudget = computed(() => (budgetStore.list || []).reduce((sum: number, i: any) => sum + Number(i.used || 0), 0))
const remainingBudget = computed(() => Math.max((Number(totalBudget.value) || 0) - (Number(usedBudget.value) || 0), 0))
const budgetUsageRate = computed(() => {
  const total = Number(totalBudget.value) || 0
  const used = Number(usedBudget.value) || 0
  if (!total || total <= 0) return 0
  return Number(((used / total) * 100).toFixed(2))
})

const warningData = ref<WarningItem[]>([])
const businessTypeOptions = computed<string[]>(() => { const set = new Set<string>(); warningData.value.forEach((i: any) => i.businessType && set.add(i.businessType)); return Array.from(set) })
const platformOptions = computed<string[]>(() => { const set = new Set<string>(); warningData.value.forEach((i: any) => i.platform && set.add(i.platform)); return Array.from(set) })
const targetLoanOptions = computed<number[]>(() => { const set = new Set<number>(); warningData.value.forEach((i: any) => typeof i.estimatedLoan === 'number' && set.add(i.estimatedLoan)); return Array.from(set).sort((a, b) => a - b) })
const filteredWarningData = computed(() => { let rows = warningData.value; if (filterForm.businessType) rows = rows.filter((r: any) => r.businessType === filterForm.businessType); if (filterForm.platform) rows = rows.filter((r: any) => r.platform === filterForm.platform); if (typeof filterForm.targetLoan === 'number') rows = rows.filter((r: any) => Number(r.estimatedLoan) === Number(filterForm.targetLoan)); return rows })

const warningStats = computed(() => {
  const rows = filteredWarningData.value
  let normal = 0, overCost = 0, slowConsume = 0
  rows.forEach((r: any) => {
    const over = Number(r.actualCost) > Number(r.estimatedCost) * 1.1
    const slow = Number(r.actualLoan) < Number(r.estimatedLoan) * 0.9
    if (!over && !slow) normal += 1
    if (over) overCost += 1
    if (slow) slowConsume += 1
  })
  return { normal, overCost, slowConsume, total: rows.length }
})

const burndownChartData = computed<any[]>(() => {
  const data: any = (monitorStore as any)?.burndown
  return Array.isArray(data) ? data : []
})
const onChartModeChange = (mode: string) => { chartMode.value = mode === 'cumulative' ? 'cumulative' : 'burndown' }
const onGranularityChange = async (key: 'month' | 'quarter') => {
  currentChartType.value = key
  await monitorStore.fetchBurndown({ range: key })
}

const platformModalVisible = ref(false)
const currentPlatform = ref<any>()
const handlePlatformClick = (record: any) => { currentPlatform.value = record; platformModalVisible.value = true }

const exportWarningData = () => { const blob = new Blob([JSON.stringify(filteredWarningData.value, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `budget-warnings-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url) }
const goExternalArchive = () => { router.push({ path: '/external-data/archive', query: { keyword: filterForm.platform || '' } }) }

const selectedKeys = ref<Array<string | number>>([])
const pagination = reactive({ current: 1, pageSize: 10 })
const handlePageChange = (page: number) => { pagination.current = page }
const handlePageSizeChange = (size: number) => { pagination.pageSize = size }
const handleBatchExport = () => {
  const rows = filteredWarningData.value.filter((r: any) => selectedKeys.value.includes(r.id))
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `budget-warnings-selected-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const loading = ref(false)
const refresh = async () => {
  try {
    loading.value = true
    await Promise.all([
      budgetStore.fetchBudgetList({ page: 1, pageSize: 10 }),
      monitorStore.fetchBurndown({ range: currentChartType.value }),
      monitorStore.fetchWarnings({})
    ])
    warningData.value = monitorStore.warnings
    const platformsFromWarnings = Array.from(new Set((warningData.value || []).map((w: any) => w.platform).filter(Boolean)))
    if (!filterForm.platform && platformsFromWarnings.length) {
      filterForm.platform = platformsFromWarnings[0] as string
    }
    const filtered = (warningData.value || []).filter((r: any) => (filterForm.platform ? r.platform === filterForm.platform : true) && (filterForm.businessType ? r.businessType === filterForm.businessType : true) && (typeof filterForm.targetLoan === 'number' ? Number(r.estimatedLoan) === Number(filterForm.targetLoan) : true))
    if (filtered.length === 0 && (warningData.value || []).length > 0) {
      filterForm.platform = ''
      filterForm.targetLoan = undefined
    }
    Message.success('数据已刷新')
  } catch (e) { Message.error('刷新失败') }
  finally { loading.value = false }
}
const handleFilter = async () => { await refresh() }
const resetFilter = async () => { filterForm.businessType = ''; filterForm.platform = ''; filterForm.targetLoan = undefined; await refresh() }
const formatNumber = (n: number) => { if (n === null || n === undefined) return '—'; return Number(n).toLocaleString() }
const formatPercent = (n: number) => { if (n === null || n === undefined) return '—'; return `${(n * 100).toFixed(2)}%` }
const getHealthStatus = (r: any) => { const overCost = Number(r.actualCost) > Number(r.estimatedCost) * 1.1; const slowConsume = Number(r.actualLoan) < Number(r.estimatedLoan) * 0.9; if (!overCost && !slowConsume) return '正常'; if (overCost) return '超支'; return '消耗过慢' }
const getHealthStatusColor = (r: any) => { const s = getHealthStatus(r); return s === '正常' ? 'green' : (s === '超支' ? 'red' : 'orange') }

onMounted(() => { initFilters(); refresh() })
watch(filterForm, (nv) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nv)) } catch {}
}, { deep: true })
</script>

<style scoped>
.full-loading { width: 100%; display: block; }
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
