<template>
  <div class="budget-monitor">
    <div class="page-header">
      <h2>预算监控</h2>
      <p class="desc">聚焦预算燃尽与健康度预警，支持月/季度粒度</p>
    </div>

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
        <a-form-item>
          <a-button type="primary" @click="handleFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

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
import { ref, computed, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import { useBudgetMonitorStore } from '@/modules/budget/stores/budget-monitor'
import { useBudgetStore } from '@/modules/budget/stores/budget'

const budgetStore = useBudgetStore()
const monitorStore = useBudgetMonitorStore()

const filterForm = reactive<{ businessType: string; platform: string }>({ businessType: '', platform: '' })

const platformOptions = ['蚂蚁', '字节', '京东', '苏贷']

const totalBudget = computed(() => budgetStore.list.reduce((sum: number, i: any) => sum + Number(i.targetLoan || 0), 0))
const usedBudget = computed(() => budgetStore.list.reduce((sum: number, i: any) => sum + Number(i.estimatedCost || 0), 0))
const remainingBudget = computed(() => Math.max((Number(totalBudget.value) || 0) - (Number(usedBudget.value) || 0), 0))
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

const burndownChartData = ref<any[]>([])

const onChartModeChange = (mode: 'burndown' | 'cumulative') => {}
const onGranularityChange = async (key: 'month' | 'quarter') => {}

const warningData = ref<any[]>([])
const filteredWarningData = computed(() => {
  let rows = warningData.value
  if (filterForm.businessType) rows = rows.filter((r: any) => r.businessType === filterForm.businessType)
  if (filterForm.platform) rows = rows.filter((r: any) => r.platform === filterForm.platform)
  return rows
})

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

const handlePlatformClick = (record: any) => {
  Message.info('平台详情开发中')
}

const exportWarningData = () => {
  const blob = new Blob([JSON.stringify(filteredWarningData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `budget-warnings-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const refresh = async () => {
  try {
    await budgetStore.fetchBudgetList({ page: 1, pageSize: 10 })
    warningData.value = []
    Message.success('数据已刷新')
  } catch (e) {
    Message.error('刷新失败')
  }
}

const handleFilter = async () => { await refresh() }
const resetFilter = async () => { filterForm.businessType = ''; filterForm.platform = ''; await refresh() }

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
.toolbar { margin-bottom: 12px; }
.warning-text { color: #f53f3f; }
.comparison-cell { display: flex; justify-content: center; }
.content-row { margin-top: 12px; }
.metrics-card { min-height: 100%; }
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-items: center; }
.usage-progress { display: flex; flex-direction: column; gap: 6px; }
.usage-label { color: var(--color-text-2); font-size: 12px; }
.stat-subgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.warning-card :deep(.arco-table-body) { max-height: 420px; }
</style>
