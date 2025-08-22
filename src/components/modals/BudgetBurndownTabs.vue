<template>
  <a-card :title="chartTitle">
    <!-- 图表类型切换 -->
    <template #extra>
      <a-radio-group v-model="chartType" @change="handleChartTypeChange" size="small">
        <a-radio value="burndown">燃尽图</a-radio>
        <a-radio value="cumulative">累积消耗图</a-radio>
      </a-radio-group>
    </template>
    
    <a-tabs v-model:value="activeTab" @change="handleTabChange">
      <a-tab-pane key="month" tab="月度" />
      <a-tab-pane key="quarter" tab="季度" />
      <a-tab-pane key="year" tab="年度" />
    </a-tabs>
    
    <!-- 单一图表容器 -->
    <div ref="burndownChartRef" class="chart-container" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
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
}>()

// 图表类型：燃尽图或累积消耗图
const chartType = ref('burndown')
// 时间粒度：月度、季度、年度
const activeTab = ref('month')
const burndownChartRef = ref()
let burndownChart: echarts.ECharts | null = null

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
  updateChartWithCurrentData()
}

// 根据当前选择更新图表数据
const updateChartWithCurrentData = () => {
  // 如果数据中没有granularity字段，直接使用所有数据
  const filteredData = props.chartData.length > 0 && props.chartData[0].granularity 
    ? props.chartData.filter(item => item.granularity === activeTab.value)
    : props.chartData
  
  console.log('过滤后的数据:', filteredData)
  
  // 根据图表类型处理数据
  if (chartType.value === 'burndown') {
    // 燃尽图：直接使用原始数据
    console.log('更新燃尽图:', filteredData, chartType.value)
    updateChart(filteredData, chartType.value)
  } else {
    // 累积消耗图：计算每月消耗量
    const cumulativeData = calculateCumulativeData(filteredData)
    console.log('更新累积图:', cumulativeData, chartType.value)
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

// 更新图表
const updateChart = (data: any[], type: string) => {
  console.log('updateChart被调用:', {
    hasChartRef: !!burndownChartRef.value,
    hasChartInstance: !!burndownChart,
    dataLength: data?.length || 0,
    chartType: type,
    data,
    sampleData: data?.[0],
    xAxisData: data?.map(item => item.month || item.period),
    budgetData: data?.map(item => item.budget),
    actualData: data?.map(item => item.actual),
    budgetDataConverted: data?.map(item => (item.budget / 10000).toFixed(2)),
    actualDataConverted: data?.map(item => (item.actual / 10000).toFixed(2))
  })

  if (!burndownChartRef.value || !burndownChart || !data?.length) {
    console.log('updateChart跳过:', {
      hasChartRef: !!burndownChartRef.value,
      hasChartInstance: !!burndownChart,
      dataLength: data?.length || 0
    })
    return
  }

  const chartDom = burndownChartRef.value
  const rect = chartDom.getBoundingClientRect()
  console.log('图表容器尺寸:', { width: rect.width, height: rect.height })

  // 基础配置
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
          result += param.marker + param.seriesName + ': ' + value + ' 万元<br/>'
        })
        return result
      }
    },
    legend: {
      data: type === 'cumulative' ? ['累积预算消耗', '累积实际消耗'] : ['预算剩余', '实际剩余'],
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
      data: data.map(item => item.month || item.period)
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      axisLabel: {
        formatter: '{value}'
      }
    }
  }

  // 根据图表类型设置不同的系列数据
  if (type === 'cumulative') {
    // 累积消耗图
    option.series = [
      {
        name: '累积预算消耗',
        type: 'line',
        stack: 'Total',
        data: data.map(item => parseFloat((item.budget / 10000).toFixed(2))),
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
      },
      {
        name: '累积实际消耗',
        type: 'line',
        stack: 'Total',
        data: data.map(item => parseFloat((item.actual / 10000).toFixed(2))),
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
      }
    ]
  } else {
    // 燃尽图
    option.series = [
      {
         name: '预算剩余',
         type: 'line',
         data: data.map(item => parseFloat((item.budget / 10000).toFixed(2))),
         itemStyle: { color: '#1890ff' },
         areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
       },
       {
         name: '实际剩余',
         type: 'line',
         data: data.map(item => parseFloat((item.actual / 10000).toFixed(2))),
         itemStyle: { color: '#52c41a' },
         areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
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
watch(() => props.chartData, (newData) => {
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
      renderer: 'canvas',
      width: 800,
      height: 400
    })
    
    console.log('燃尽图表初始化成功')
    
    // 初始化图表数据
    updateChartWithCurrentData()
  } catch (error) {
    console.error('燃尽图表初始化失败:', error)
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}</style>