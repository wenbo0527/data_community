<template>
  <div class="external-data-monitor">
    <a-card class="filter-card">
      <a-form :model="filterForm" layout="inline">
        <a-form-item field="businessType" label="业务类型">
          <a-select v-model="filterForm.businessType" placeholder="请选择业务类型" style="width: 200px">
            <a-option value="助贷业务">助贷业务</a-option>
            <a-option value="融担类业务">融担类业务</a-option>
            <a-option value="直贷类业务">直贷类业务</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="platform" label="平台产品">
          <a-select v-model="filterForm.platform" placeholder="请选择平台产品" style="width: 200px">
            <a-option value="字节">字节</a-option>
            <a-option value="蚂蚁">蚂蚁</a-option>
            <a-option value="京东">京东</a-option>
            <a-option value="美团">美团</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="targetLoan" label="目标贷余">
          <a-select v-model="filterForm.targetLoan" placeholder="请选择目标贷余" style="width: 200px">
            <a-option v-for="option in store.targetLoanOptions" :key="option" :value="option">
              {{ formatAmount(option) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="year" label="年份">
          <a-select v-model="filterForm.year" placeholder="请选择年份" style="width: 160px" allow-clear>
            <a-option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="filtering" @click="handleFilter">查询</a-button>
          <a-button style="margin-left: 8px" :disabled="filtering" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <BudgetBurndownTabs :chart-data="burndownData" @chart-type-change="handleChartTypeChange" />

    <a-card class="warning-card" title="预算健康度预警">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <a-space>
          <a-select v-model="filterForm.healthStatus" placeholder="健康度状态" style="width: 120px" multiple>
            <a-option value="正常">正常</a-option>
            <a-option value="超支">超支</a-option>
            <a-option value="消耗过慢">消耗过慢</a-option>
          </a-select>
        </a-space>
        <a-button type="primary" @click="exportData">导出数据</a-button>
      </div>
      <a-table :data="warningData" :pagination="false" :bordered="{ wrapper: true, cell: true }">
        <template #columns>
          <a-table-column title="业务类型" data-index="businessType" :width="120" />
          <a-table-column title="平台产品" data-index="platform" :width="120">
            <template #cell="{ record }">
              <a-link @click="handlePlatformClick(record)">{{ record.platform }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="实际放款" align="center" :width="150">
            <template #cell="{ record }">
              <span :class="{ 'warning-text': record.actualLoan > record.estimatedLoan * 1.1 }">{{ formatAmount(record.actualLoan) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="实际费用" align="center" :width="200">
            <template #cell="{ record }">
              <div class="comparison-cell">
                <a-tooltip :content="`预算: ${formatAmount(record.estimatedCost)}\n实际: ${formatAmount(record.actualCost)}\n偏离率: ${formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost)}`">
                  <div class="cost-info">
                    <span class="cost-value" :class="{ 'warning-text': record.actualCost > record.estimatedCost * 1.1 }">{{ formatAmount(record.actualCost) }}</span>
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
                    <span class="cost-value" :class="{ 'warning-text': record.actualAnnualCost > record.estimatedAnnualCost * 1.1 }">{{ formatPercent(record.actualAnnualCost) }}</span>
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
                    <span class="cost-value" :class="{ 'warning-text': record.actualRiskFreeReturn < record.estimatedRiskFreeReturn * 0.9 }">{{ formatPercent(record.actualRiskFreeReturn) }}</span>
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
    <PlatformProductModal v-model:visible="platformModalVisible" :platform="currentPlatform?.platform || ''" :businessType="currentPlatform?.businessType || ''" :targetLoan="currentPlatform?.targetLoan || 0" :actualLoan="currentPlatform?.actualLoan || 0" :externalDataCost="currentPlatform?.externalDataCost || 0" :budgetStatus="currentPlatform?.budgetStatus || '超支'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import type { WarningItem, BurndownPoint } from '@/modules/external-data/stores/external-data'
import PlatformProductModal from '@/components/modals/PlatformProductModal.vue'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'

const store = useExternalDataStore()

interface FilterForm { businessType: string; platform: string; targetLoan: number | undefined; year: string | undefined; granularity: string; healthStatus: string[]; dateRange: Date[] }
const filterForm = reactive<FilterForm>({ businessType: '助贷业务', platform: '字节', targetLoan: undefined, year: new Date().getFullYear().toString(), granularity: 'month', healthStatus: [], dateRange: [] })
const filtering = ref(false)
const platformModalVisible = ref(false)
const currentPlatform = ref<WarningItem>()
const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())
const burndownData = ref<BurndownPoint[]>([])
const currentChartType = ref<string>('burndown')
const formatAmount = (value: number) => value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-'
const formatPercent = (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'
const exportData = () => {}
const handlePlatformClick = (record: WarningItem) => { currentPlatform.value = record; platformModalVisible.value = true }
const handleChartTypeChange = (chartType: string) => { currentChartType.value = chartType }
const handleFilter = async () => { filtering.value = true; const params = { businessType: filterForm.businessType || undefined, platform: filterForm.platform || undefined, targetLoan: filterForm.targetLoan, granularity: filterForm.granularity } as any; await Promise.all([store.fetchBurndown(params), store.fetchWarnings(params)]); burndownData.value = store.burndown; filtering.value = false; Message.success('已更新监控') }
const resetFilter = () => { filterForm.businessType = ''; filterForm.platform = ''; filterForm.targetLoan = undefined; filterForm.dateRange = []; handleFilter() }
onMounted(async () => { await Promise.all([store.fetchBurndown(), store.fetchWarnings(), store.fetchTargetLoanOptions()]); burndownData.value = store.burndown })
</script>

<style scoped>
.external-data-monitor { padding: 24px; background-color: #f5f7fa; min-height: 100vh; }
.filter-card { margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-radius: 8px; }
.warning-card { margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-radius: 8px; }
.comparison-cell { display: flex; justify-content: center; align-items: center; gap: 8px; }
.warning-text { color: #f53f3f; font-weight: 500; }
.trend-icon { margin-left: 4px; font-size: 14px; }
.cost-info { display: flex; align-items: center; gap: 8px; }
.deviation-value { display: flex; align-items: center; font-size: 12px; color: var(--color-text-3); }
.cost-value { min-width: 60px; text-align: right; }
</style>
