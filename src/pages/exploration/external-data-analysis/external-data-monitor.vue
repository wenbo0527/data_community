<template>
  <div class="external-data-monitor">
    <!-- 筛选区域 -->
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
          <a-select
            v-model="filterForm.year"
            placeholder="请选择年份"
            style="width: 160px"
            allow-clear
          >
            <a-option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="filtering" @click="handleFilter">查询</a-button>
          <a-button style="margin-left: 8px" :disabled="filtering" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <BudgetBurndownTabs :chart-data="burndownData" @chart-type-change="handleChartTypeChange" />

    <!-- 预算健康度预警 -->
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
              <span :class="{ 'warning-text': record.actualLoan > record.estimatedLoan * 1.1 }">
                {{ formatAmount(record.actualLoan) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="实际费用" align="center" :width="200">
            <template #cell="{ record }">
              <div class="comparison-cell">
                <a-tooltip :content="`预算: ${formatAmount(record.estimatedCost)}
实际: ${formatAmount(record.actualCost)}
偏离率: ${formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost)}`">
                  <div class="cost-info">
                    <span class="cost-value" :class="{ 'warning-text': record.actualCost > record.estimatedCost * 1.1 }">
                      {{ formatAmount(record.actualCost) }}
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
                <a-tooltip :content="`预算: ${formatPercent(record.estimatedRiskFreeReturn)}
实际: ${formatPercent(record.actualRiskFreeReturn)}
偏离率: ${formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn)}`">
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
    
    <!-- 调试信息区域 -->
    <a-card class="debug-card" title="调试信息" v-if="showDebugInfo">
      <a-space direction="vertical">
        <a-button type="outline" @click="toggleDebugInfo">
          {{ showDebugInfo ? '隐藏调试信息' : '显示调试信息' }}
        </a-button>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="数据加载状态">
            {{ loadingStatus }}
          </a-descriptions-item>
          <a-descriptions-item label="接口返回数据">
            <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="筛选条件">
            <pre>{{ JSON.stringify(filterForm, null, 2) }}</pre>
          </a-descriptions-item>
        </a-descriptions>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as echarts from 'echarts'
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'
import { useExternalDataStore } from '@/store/modules/external-data'
import type { WarningItem, BurndownPoint } from '@/store/modules/external-data'
import PlatformProductModal from '@/components/modals/PlatformProductModal.vue'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'

const store = useExternalDataStore()

// 筛选表单
interface FilterForm {
  businessType: string
  platform: string
  targetLoan: number | undefined
  year: string | undefined
  granularity: string
  healthStatus: string[]
  dateRange: Date[]
}

const filterForm = reactive<FilterForm>({
  businessType: '助贷业务',
  platform: '字节',
  targetLoan: undefined,
  year: new Date().getFullYear().toString(),
  granularity: 'month',
  healthStatus: [],
  dateRange: []
})

const filtering = ref(false)

// 平台产品弹窗
const platformModalVisible = ref(false)
const currentPlatform = ref<WarningItem>()

import { useRouter } from 'vue-router'

const router = useRouter()

// 调试信息相关状态
const showDebugInfo = ref(false)
const loadingStatus = ref('')
const apiResponse = ref<any>(null)

const handlePlatformClick = (record: WarningItem) => {
  currentPlatform.value = record
  platformModalVisible.value = true
}

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value
}

const yearOptions = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - i).toString())


// 图表引用
const burndownChartRef = ref()
let burndownChart: echarts.ECharts | null = null

// 预警数据
const warningData = ref<WarningItem[]>([])

// 燃尽图数据
const burndownData = ref<BurndownPoint[]>([])
// 当前图表类型
const currentChartType = ref<string>('burndown')

// 数据格式化函数
const formatAmount = (value: number) => {
  return value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-'
}

const formatPercent = (value: number) => {
  return value ? `${(value * 100).toFixed(2)}%` : '-'
}

const exportData = () => {
  // 导出数据逻辑
  console.log('导出数据功能')
}

// 图表更新逻辑已移至BudgetBurndownTabs组件内部
const updateBurndownChart = (data: any[], type: string) => {
  // 此函数已废弃，图表渲染由BudgetBurndownTabs组件自行处理
  console.log('updateBurndownChart已废弃，图表由BudgetBurndownTabs组件处理')
  return
}

// 初始化burn-down图表
const initBurndownChart = async (chartType: string = 'burndown') => {
  if (burndownChartRef.value) {
    try {
      burndownChart = await safeInitECharts(burndownChartRef.value)
    if (store.burndownData?.length) {
      updateBurndownChart(store.burndownData, chartType)
    }
    } catch (error) {
      console.error('燃尽图表初始化失败:', error)
    }
  }
}

// 处理筛选
const handleFilter = async () => {
  filtering.value = true
  const params = {
    businessType: filterForm.businessType || undefined,
    platform: filterForm.platform || undefined,
    targetLoan: filterForm.targetLoan,
    granularity: filterForm.granularity,
    startMonth: filterForm.dateRange[0] ? 
      (filterForm.granularity === 'quarter' ? 
        `${new Date(filterForm.dateRange[0]).getFullYear()}-Q${Math.floor(new Date(filterForm.dateRange[0]).getMonth() / 3) + 1}` : 
        new Date(filterForm.dateRange[0]).toISOString().slice(0, 7)) : 
      null,
    endMonth: filterForm.dateRange[1] ? 
      (filterForm.granularity === 'quarter' ? 
        `${new Date(filterForm.dateRange[1]).getFullYear()}-Q${Math.floor(new Date(filterForm.dateRange[1]).getMonth() / 3) + 1}` : 
        filterForm.dateRange[1].toISOString().slice(0, 7)) : 
      null
  }
  await Promise.all([
    store.fetchBurndownData(params),
    store.fetchWarningData(params)
  ])
  updateBurndownChart(store.burndownData, currentChartType.value)
  warningData.value = store.warningData
  filtering.value = false
  Message.success('已更新监控')
}

// 处理图表类型变化
const handleChartTypeChange = (chartType: string) => {
  currentChartType.value = chartType
  if (store.burndownData?.length) {
    updateBurndownChart(store.burndownData, chartType)
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.businessType = ''
  filterForm.platform = ''
  filterForm.targetLoan = undefined
  filterForm.dateRange = []
  handleFilter()
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  burndownChart?.resize()
}, { passive: true })

// 配置图表事件为被动模式并初始化数据
onMounted(async () => {
  try {
    loadingStatus.value = '数据加载中...'
    console.log('开始获取数据...')
    
    // 先获取数据
    await Promise.all([
      store.fetchBurndownData(),
      store.fetchWarningData(),
      store.fetchTargetLoanOptions()
    ])
    
    console.log('数据获取完成:', {
      burndownData: store.burndownData,
      warningData: store.warningData,
      targetLoanOptions: store.targetLoanOptions
    })
    
    // 设置API响应数据用于调试
    apiResponse.value = {
      burndownData: store.burndownData,
      warningData: store.warningData,
      targetLoanOptions: store.targetLoanOptions
    }
    
    // 更新本地数据
    burndownData.value = store.burndownData
    warningData.value = store.warningData
    
    // 确保DOM已经挂载
    await nextTick()
    
    // 初始化图表
    if (burndownChartRef.value) {
      // 添加被动事件监听
      const chartDom = burndownChartRef.value
      chartDom.addEventListener('wheel', () => {}, { passive: true })
      chartDom.addEventListener('mousewheel', () => {}, { passive: true })
      
      // 初始化图表
      initBurndownChart()
      loadingStatus.value = '数据加载完成'
    }
  } catch (error: any) {
    console.error('初始化数据失败:', error)
    loadingStatus.value = `数据加载失败: ${error.message || '未知错误'}`
    apiResponse.value = error.response?.data || error
  } finally {
    showDebugInfo.value = true
  }
})
</script>

<style scoped>
.external-data-monitor {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.chart-card,
.warning-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.warning-table {
  :deep(.arco-table-cell) {
    text-align: center;
    vertical-align: middle;
  }

  .comparison-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .cost-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
}

.comparison-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.warning-text {
  color: #f53f3f;
  font-weight: 500;
}

.success-text {
  color: #00b42a;
  font-weight: 500;
}

.cost-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e5e6eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #00b42a;
  transition: width 0.3s ease;
}

.warning-fill {
  background-color: #f53f3f;
}

.cost-value {
  min-width: 60px;
  text-align: right;
}

.trend-icon {
  margin-left: 4px;
  font-size: 14px;
}

.cost-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deviation-value {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-3);
}

.cost-progress {
  min-width: 200px;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-form-item-label-col) {
  font-weight: 500;
}

:deep(.arco-table-th) {
  background-color: #f2f3f5;
  font-weight: 500;
}
</style>
