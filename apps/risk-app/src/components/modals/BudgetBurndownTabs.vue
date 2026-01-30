<template>
  <div class="chart-block">
    <div class="chart-header">
      <div class="title">{{ chartTitle }}</div>
      <a-space>
      <a-button size="small" @click="handleExportChart">导出数据</a-button>
        <a-radio-group v-model="chartType" @change="handleChartTypeChange" size="small">
          <a-radio value="burndown">燃尽图</a-radio>
          <a-radio value="cumulative">累积消耗图</a-radio>
        </a-radio-group>
        <a-radio-group v-model="activeTab" @change="handleTabChange" size="small">
          <a-radio value="month">月度</a-radio>
          <a-radio value="quarter">季度</a-radio>
        </a-radio-group>
      </a-space>
    </div>
    <div ref="burndownChartRef" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'

type BurndownItem = { 
  granularity?: string;
  month: string;
  budget: number;
  actual: number;
  initialBudget?: number;
  cumulativeBudget?: number;
  cumulativeActual?: number;
}

const props = defineProps({ 
  chartData: { type: Array as () => Array<BurndownItem>, default: () => [] }
})

const emit = defineEmits<{
  'chart-type-change': [chartType: string]
  'granularity-change': [granularity: 'month' | 'quarter']
}>()

const chartType = ref('burndown')
const activeTab = ref('month')
const burndownChartRef = ref()
let burndownChart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const chartTitle = computed(() => chartType.value === 'burndown' ? '预算燃尽图' : '预算累积消耗图')

const handleChartTypeChange = () => {
  emit('chart-type-change', chartType.value)
  updateChartWithCurrentData()
}

const handleTabChange = (tabKey: string) => {
  emit('granularity-change', tabKey as 'month' | 'quarter')
  updateChartWithCurrentData()
}

const updateChartWithCurrentData = () => {
  const filteredData = props.chartData.length > 0 && props.chartData[0].granularity 
    ? props.chartData.filter(item => item.granularity === activeTab.value)
    : props.chartData
  if (chartType.value === 'burndown') updateChart(filteredData, chartType.value)
  else {
    const cumulativeData = calculateCumulativeData(filteredData)
    updateChart(cumulativeData, chartType.value)
  }
}

const calculateCumulativeData = (data: BurndownItem[]) => {
  if (!data || data.length === 0) return []
  return data.map(item => {
    if (item.cumulativeBudget !== undefined && item.cumulativeActual !== undefined) {
      return { ...item, budget: item.cumulativeBudget, actual: item.cumulativeActual }
    }
    const initialBudget = item.initialBudget || data[0].budget
    return { ...item, budget: initialBudget - item.budget, actual: initialBudget - item.actual }
  })
}

const handleExportChart = () => {
  const srcData = Array.isArray(props.chartData) ? props.chartData : []
  const filteredData = srcData.length > 0 && srcData[0]?.granularity
    ? srcData.filter((item: any) => item.granularity === activeTab.value)
    : srcData
  const payload = { chartType: chartType.value, granularity: activeTab.value, data: filteredData }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `burndown-${chartType.value}-${activeTab.value}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const normalizeToPercent = (data: any, type: 'burndown' | 'cumulative') => {
  const arr = Array.isArray(data) ? data : []
  const first = arr?.[0] || {}
  const initialBudget = (first?.initialBudget !== undefined)
    ? Number(first.initialBudget)
    : Number(first?.budget || 0)
  const safeInitial = initialBudget > 0 ? initialBudget : ((arr || []).reduce((max, i) => Math.max(max, Number(i?.budget || 0)), 0) || 1)
  if (type === 'burndown') {
    const budgetPct = arr.map(item => {
      const ib = Number(item.initialBudget ?? safeInitial)
      const b = Number(item.budget || 0)
      return Number(((b / (ib || 1)) * 100).toFixed(2))
    })
    const actualPct = arr.map(item => {
      const ib = Number(item.initialBudget ?? safeInitial)
      const a = Number(item.actual || 0)
      return Number(((a / (ib || 1)) * 100).toFixed(2))
    })
    const warnPct = arr.map(() => 20)
    return { budgetPct, actualPct, warnPct }
  } else {
    const budgetPct = arr.map(item => {
      const ib = Number(item.initialBudget ?? safeInitial)
      const b = Number(item.budget || 0)
      return Number(((b / (ib || 1)) * 100).toFixed(2))
    })
    const actualPct = arr.map(item => {
      const ib = Number(item.initialBudget ?? safeInitial)
      const a = Number(item.actual || 0)
      return Number(((a / (ib || 1)) * 100).toFixed(2))
    })
    const warnPct = arr.map(() => 80)
    return { budgetPct, actualPct, warnPct }
  }
}

const updateChart = (data: any, type: string) => {
  const arr = Array.isArray(data) ? data : []
  if (!burndownChartRef.value || !burndownChart || !arr.length) return
  const chartDom = burndownChartRef.value
  const percentData = normalizeToPercent(arr, type as 'burndown' | 'cumulative')
  const option: any = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, formatter: (params: any) => {
      let result = params[0].name + '<br/>'
      params.forEach((param: any) => {
        const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value
        result += param.marker + param.seriesName + ': ' + value + ' %<br/>'
      })
      return result
    } },
    legend: { data: type === 'cumulative' ? ['累积预算消耗(%)', '累积实际消耗(%)', '预警线'] : ['预算剩余(%)', '实际剩余(%)', '预警线'], top: 10 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: arr?.map((i: any) => i.month || i.period) || [] }],
    yAxis: [{ type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } }],
    series: type === 'cumulative' 
      ? [
        { name: '累积预算消耗(%)', type: 'line', smooth: true, data: percentData.budgetPct, areaStyle: {} },
        { name: '累积实际消耗(%)', type: 'line', smooth: true, data: percentData.actualPct, areaStyle: {} },
        { name: '预警线', type: 'line', smooth: true, data: percentData.warnPct, lineStyle: { type: 'dashed' } }
      ]
      : [
        { name: '预算剩余(%)', type: 'line', smooth: true, data: percentData.budgetPct, areaStyle: {} },
        { name: '实际剩余(%)', type: 'line', smooth: true, data: percentData.actualPct, areaStyle: {} },
        { name: '预警线', type: 'line', smooth: true, data: percentData.warnPct, lineStyle: { type: 'dashed' } }
      ]
  }
  burndownChart.setOption(option, true)
}

onMounted(async () => {
  await nextTick()
  burndownChart = await safeInitECharts(burndownChartRef, {})
  updateChartWithCurrentData()
  resizeObserver = new ResizeObserver(() => { burndownChart?.resize() })
  if (burndownChartRef.value) resizeObserver.observe(burndownChartRef.value)
})

onUnmounted(() => {
  try { resizeObserver?.disconnect() } catch {}
  safeDisposeChart(burndownChart)
  burndownChart = null
})

watch(() => props.chartData, () => updateChartWithCurrentData(), { deep: true })
</script>

<style scoped>
.chart-block { width: 100%; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.title { font-weight: 600; }
.chart-container { width: 100%; height: 300px; }
</style>
