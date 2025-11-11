<template>
  <div class="budget-trend-chart">
    <div class="chart-header">
      <h3 class="chart-title">预算趋势分析</h3>
      <div class="chart-controls">
        <!-- 模式选择：执行 / 累计 / 燃尽 -->
        <a-select v-model="mode" style="width: 160px; margin-right: 12px">
          <a-option value="execution">执行模式</a-option>
          <a-option value="cumulative">累计模式</a-option>
          <a-option value="burndown">燃尽模式</a-option>
        </a-select>
        <!-- 时间范围选择：年 / 季 / 月 -->
        <a-select v-model="range" style="width: 140px">
          <a-option value="year">近一年</a-option>
          <a-option value="quarter">近一季度</a-option>
          <a-option value="month">本月</a-option>
        </a-select>
      </div>
    </div>
    
    <div class="chart-content">
      <div ref="chartContainer" class="chart-container" :style="{ height: height + 'px' }"></div>
    </div>
    
    <div class="chart-legend" v-if="legendData.length">
      <div class="legend-item" v-for="item in legendData" :key="item.name">
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-text">{{ item.name }}</span>
        <span class="legend-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { budgetApiService } from '@/api/budget'

const props = defineProps({
  budgetId: { type: String, default: '' },
  height: { type: Number, default: 400 },
  timeRange: { type: String, default: 'year' } // year | quarter | month
})

const chartContainer = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const mode = ref<'execution' | 'cumulative' | 'burndown'>('execution')
const range = ref<'year' | 'quarter' | 'month'>(props.timeRange as any)
const data = ref<Array<{ label: string; budget: number; used: number; remaining: number }>>([])
// 兼容模板中的图例展示，默认不显示
const legendData = ref<Array<{ name: string; color: string; value: string }>>([])

onMounted(async () => {
  await loadData()
  initChart()
  render()
})

watch([mode, range], async () => {
  await loadData()
  render()
})

// 监听父级传入的 timeRange，保持与内部 range 同步
watch(
  () => props.timeRange,
  async (val) => {
    if (!val) return
    range.value = val as any
    await loadData()
    render()
  }
)

const loadData = async () => {
  try {
    // 使用mock服务获取趋势数据或生成数据
    const months = range.value === 'year' ? 12 : range.value === 'quarter' ? 3 : 1
    const budgets = await budgetApiService.getBudgets()
    const target = budgets.find(b => b.id === props.budgetId)
    const total = target?.totalAmount || 0
    const usedTotal = target?.usedAmount || 0
    const per = months > 0 ? total / months : total
    const usedPer = months > 0 ? usedTotal / months : usedTotal
    data.value = Array.from({ length: months }, (_, i) => ({
      label: months === 12 ? `${i + 1}月` : months === 3 ? `Q${i + 1}` : '本月',
      budget: Number(per.toFixed(2)),
      used: Number(usedPer.toFixed(2)),
      remaining: Math.max(Number(per.toFixed(2)) - Number(usedPer.toFixed(2)), 0)
    }))
  } catch (e) {
    console.error('加载趋势数据失败', e)
    data.value = []
  }
}

const initChart = () => {
  if (!chartContainer.value) return
  chart = echarts.init(chartContainer.value)
  window.addEventListener('resize', () => chart?.resize())
}

const toOption = (): echarts.EChartsOption => {
  const labels = data.value.map(d => d.label)
  const budget = data.value.map(d => d.budget)
  const used = data.value.map(d => d.used)
  const remaining = data.value.map(d => d.remaining)

  if (mode.value === 'cumulative') {
    const cumUsed = used.reduce((arr: number[], v, i) => {
      arr.push((arr[i - 1] || 0) + v)
      return arr
    }, [])
    const cumBudget = budget.reduce((arr: number[], v, i) => {
      arr.push((arr[i - 1] || 0) + v)
      return arr
    }, [])
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['累计预算', '累计消耗'] },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        { name: '累计预算', type: 'line', smooth: true, data: cumBudget },
        { name: '累计消耗', type: 'line', smooth: true, data: cumUsed }
      ]
    }
  }

  if (mode.value === 'burndown') {
    const targetTotal = budget.reduce((s, v) => s + v, 0)
    const ideal = budget.map((_, i) => Number((targetTotal - (targetTotal / budget.length) * i).toFixed(2)))
    const actual = used.reduce((arr: number[], v, i) => {
      const prev = arr[i - 1] ?? targetTotal
      arr.push(Math.max(prev - v, 0))
      return arr
    }, [])
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['理想燃尽', '实际燃尽'] },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        { name: '理想燃尽', type: 'line', smooth: true, data: ideal },
        { name: '实际燃尽', type: 'line', smooth: true, data: actual }
      ]
    }
  }

  // execution: 单期预算、消耗、剩余
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['预算', '消耗', '剩余'] },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value' },
    series: [
      { name: '预算', type: 'bar', data: budget },
      { name: '消耗', type: 'bar', data: used },
      { name: '剩余', type: 'bar', data: remaining }
    ]
  }
}

const render = () => {
  if (!chart) return
  chart.setOption(toOption())
}

defineExpose({ render })
</script>

<style scoped lang="less">
.budget-trend-chart {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .chart-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
    
    .chart-controls {
      display: flex;
      gap: 12px;
    }
  }
  
  .chart-content {
    margin-bottom: 24px;
    
    .chart-container {
      width: 100%;
      height: 400px;
    }
  }
  
  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 16px;
    background: #f7f8fa;
    border-radius: 6px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
      
      .legend-text {
        font-size: 14px;
        color: #4e5969;
      }
      
      .legend-value {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }
    }
  }
}
</style>