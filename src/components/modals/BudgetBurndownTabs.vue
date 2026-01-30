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

// 图表类型：燃尽图或累积消耗图
const chartType = ref('burndown')
// 时间粒度：月度、季度、年度
const activeTab = ref('month')
const burndownChartRef = ref()
let burndownChart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// 根据图表类型动态计算标题
const chartTitle = computed(() => {
  return chartType.value === 'burndown' ? '预算燃尽图' : '预算累积消耗图'
})

// 处理图表类型切换
const handleChartTypeChange = () => {
  emit('chart-type-change', chartType.value)
  updateChartWithCurrentData()
}

// 处理时间粒度切换
const handleTabChange = (tabKey: string) => {
  emit('granularity-change', tabKey as 'month' | 'quarter')
  updateChartWithCurrentData()
}

// 根据当前选择更新图表数据（以百分比展示）
const updateChartWithCurrentData = () => {
  const srcData = Array.isArray(props.chartData) ? props.chartData : []
  const filteredData = srcData.length > 0 && srcData[0]?.granularity 
    ? srcData.filter(item => item.granularity === activeTab.value)
    : srcData
  if (chartType.value === 'burndown') {
    updateChart(filteredData, chartType.value)
  } else {
    const cumulativeData = calculateCumulativeData(filteredData)
    updateChart(cumulativeData, chartType.value)
  }
}

// 计算累积消耗数据
const calculateCumulativeData = (data: BurndownItem[]) => {
  if (!data || data.length === 0) return []
  
  return data.map(item => {
    // 如果mock数据中已经包含累积消耗数据，直接使用
    if (item.cumulativeBudget !== undefined && item.cumulativeActual !== undefined) {
      return {
        ...item,
        budget: item.cumulativeBudget,
        actual: item.cumulativeActual
      }
    }
    
    // 兼容旧数据格式，手动计算累积消耗
    const initialBudget = item.initialBudget || data[0].budget
    return {
      ...item,
      budget: initialBudget - item.budget, // 累积消耗 = 初始预算 - 剩余预算
      actual: initialBudget - item.actual   // 累积实际消耗 = 初始预算 - 实际剩余
    }
  })
}

const handleExportChart = () => {
  const srcData = Array.isArray(props.chartData) ? props.chartData : []
  const filteredData = srcData.length > 0 && srcData[0]?.granularity
    ? srcData.filter(item => item.granularity === activeTab.value)
    : srcData
  const payload = {
    chartType: chartType.value,
    granularity: activeTab.value,
    data: filteredData
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `burndown-${chartType.value}-${activeTab.value}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 将数据归一化为百分比
const normalizeToPercent = (data: any[], type: 'burndown' | 'cumulative') => {
  const arr = Array.isArray(data) ? data : []
  const initialBudget = (arr?.[0]?.initialBudget !== undefined)
    ? Number(arr[0].initialBudget)
    : Number(arr?.[0]?.budget || 0)
  const safeInitial = initialBudget > 0 ? initialBudget : (arr.reduce((max, i) => Math.max(max, Number(i.budget || 0)), 0) || 1)
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

// 更新图表（以百分比展示）
const updateChart = (data: any[], type: string) => {
  const arr = Array.isArray(data) ? data : []
  console.log('updateChart被调用:', {
    hasChartRef: !!burndownChartRef.value,
    hasChartInstance: !!burndownChart,
    dataLength: arr?.length || 0,
    chartType: type,
    data: arr,
    sampleData: arr?.[0],
    xAxisData: arr?.map(item => item.month || item.period),
    budgetData: arr?.map(item => item.budget),
    actualData: arr?.map(item => item.actual),
    budgetDataConverted: arr?.map(item => (item.budget / 10000).toFixed(2)),
    actualDataConverted: arr?.map(item => (item.actual / 10000).toFixed(2))
  })

  if (!burndownChartRef.value || !burndownChart || !arr?.length) {
    console.log('updateChart跳过:', {
      hasChartRef: !!burndownChartRef.value,
      hasChartInstance: !!burndownChart,
      dataLength: arr?.length || 0
    })
    return
  }

  const chartDom = burndownChartRef.value
  const rect = chartDom.getBoundingClientRect()
  console.log('图表容器尺寸:', { width: rect.width, height: rect.height })

  const percentData = normalizeToPercent(arr, type as 'burndown' | 'cumulative')

  // 基础配置（百分比坐标轴）
  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>'
        params.forEach((param: any) => {
          const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value
          result += param.marker + param.seriesName + ': ' + value + ' %<br/>'
        })
        return result
      }
    },
    legend: {
      data: type === 'cumulative' ? ['累积预算消耗(%)', '累积实际消耗(%)', '预警线'] : ['预算剩余(%)', '实际剩余(%)', '预警线'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: arr.map(item => item.month || item.period)
    },
    yAxis: {
      type: 'value',
      name: '进度(%)',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  }

  // 根据图表类型设置不同的系列数据
  if (type === 'cumulative') {
    // 累积消耗图
    option.series = [
      {
        name: '累积预算消耗(%)',
        type: 'line',
        stack: 'Total',
        data: percentData.budgetPct,
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
      },
      {
        name: '累积实际消耗(%)',
        type: 'line',
        stack: 'Total',
        data: percentData.actualPct,
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
      },
      {
        name: '预警线',
        type: 'line',
        data: percentData.warnPct,
        itemStyle: { color: '#f53f3f' },
        lineStyle: { type: 'dashed' }
      }
    ]
  } else {
    // 燃尽图
    option.series = [
      {
         name: '预算剩余(%)',
         type: 'line',
         data: percentData.budgetPct,
         itemStyle: { color: '#1890ff' },
         areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
       },
       {
         name: '实际剩余(%)',
         type: 'line',
         data: percentData.actualPct,
         itemStyle: { color: '#52c41a' },
         areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
       },
       {
         name: '预警线',
         type: 'line',
         data: percentData.warnPct,
         itemStyle: { color: '#f53f3f' },
         lineStyle: { type: 'dashed' }
       }
    ]
  }

  console.log('设置ECharts配置:', option)
  console.log('详细配置信息:', {
    xAxisData: option.xAxis.data,
    seriesCount: option.series.length,
    series0Data: option.series[0]?.data,
    series1Data: option.series[1]?.data,
    chartInstance: !!burndownChart,
    containerElement: burndownChartRef.value
  })
  
  burndownChart.setOption(option, true) // 强制重绘
  burndownChart.resize() // 调整大小
  
  // 检查图表是否成功渲染
  setTimeout(() => {
    const canvas = burndownChartRef.value?.querySelector('canvas')
    console.log('图表渲染检查:', {
      hasCanvas: !!canvas,
      canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
      chartOption: burndownChart?.getOption(),
      isDisposed: burndownChart?.isDisposed()
    })
  }, 100)
  
  console.log('ECharts配置设置完成，已强制重绘和调整大小')
}

// 监听数据变化
watch(() => props.chartData, (newData: Array<BurndownItem>) => {
  console.log('props.chartData变化，新数据长度:', newData.length)
  if (burndownChart) {
    updateChartWithCurrentData();
  }
}, { immediate: true });

onMounted(() => {
  console.log('初始化ECharts实例，数据长度:', props.chartData.length)
  
  // 延迟初始化，确保DOM完全渲染
  nextTick(() => {
    initChart()
  })
})

// 初始化图表函数
const initChart = async () => {
  try {
    console.log('开始安全初始化燃尽图表...')
    
    burndownChart = await safeInitECharts(burndownChartRef.value, {
      theme: 'default',
      renderer: 'canvas'
    })
    
    console.log('燃尽图表初始化成功')
    
    // 监听容器尺寸，确保全宽覆盖
    if (burndownChartRef.value) {
      try {
        resizeObserver = new ResizeObserver(() => {
          burndownChart && burndownChart.resize()
        })
        resizeObserver.observe(burndownChartRef.value)
      } catch (e) {
        console.warn('ResizeObserver 初始化失败，使用窗口resize备选', e)
        window.addEventListener('resize', () => burndownChart && burndownChart.resize())
      }
    }

    // 初始化图表数据
    updateChartWithCurrentData()
  } catch (error) {
    console.error('燃尽图表初始化失败:', error)
  }
}
onUnmounted(() => {
  if (resizeObserver && resizeObserver.disconnect) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (burndownChart) {
    safeDisposeChart(burndownChart, '预算燃尽图')
    burndownChart = null
  }
})
</script>

<style scoped>
.chart-block { width: 100%; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-header .title { font-weight: 600; }
.chart-container { width: 100%; min-height: 420px; }
</style>
