<template>
  <div class="common-chart">
    <!-- 图表标题 -->
    <div v-if="title" class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions" v-if="showActions">
        <a-space>
          <a-button size="small" @click="handleRefresh">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
          <a-button size="small" @click="handleExport">
            <template #icon>
              <icon-download />
            </template>
          </a-button>
          <a-button size="small" @click="handleFullscreen">
            <template #icon>
              <icon-fullscreen />
            </template>
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 图表内容 -->
    <div class="chart-content" :style="{ height: chartHeight + 'px' }">
      <div v-if="loading" class="chart-loading">
        <a-spin :size="32" />
      </div>
      
      <div v-else-if="!chartData || chartData.length === 0" class="chart-empty">
        <icon-chart-line class="empty-icon" />
        <div class="empty-text">{{ emptyText }}</div>
      </div>
      
      <div v-else ref="chartRef" class="chart-container"></div>
    </div>

    <!-- 图表说明 -->
    <div v-if="description" class="chart-description">
      {{ description }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 图表类型
  type: {
    type: String,
    default: 'line', // line, bar, pie, scatter, radar, gauge
    validator: (value) => [
      'line', 'bar', 'pie', 'scatter', 'radar', 'gauge', 'heatmap', 'tree', 'treemap'
    ].includes(value)
  },
  
  // 图表标题
  title: {
    type: String,
    default: ''
  },
  
  // 图表数据
  data: {
    type: Array,
    default: () => []
  },
  
  // 图表配置
  options: {
    type: Object,
    default: () => ({})
  },
  
  // 图表高度
  height: {
    type: [Number, String],
    default: 300
  },
  
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  
  // 空数据文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  
  // 图表说明
  description: {
    type: String,
    default: ''
  },
  
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  
  // 主题
  theme: {
    type: String,
    default: 'default' // default, dark, vintage, macarons, infographic, shine, roma
  },
  
  // 颜色主题
  colorTheme: {
    type: Array,
    default: () => [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
      '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f', '#32c5e9', '#67e0e3'
    ]
  },
  
  // 是否响应式
  responsive: {
    type: Boolean,
    default: true
  },
  
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'refresh',
  'export',
  'fullscreen',
  'click',
  'dblclick',
  'mouseover',
  'mouseout'
])

// 响应式数据
const chartRef = ref()
const chartInstance = ref(null)
const chartData = ref([])

// 计算属性
const chartHeight = computed(() => {
  if (typeof props.height === 'number') {
    return props.height
  }
  if (typeof props.height === 'string' && props.height.endsWith('px')) {
    return parseInt(props.height)
  }
  return 300
})

// 监听
watch(() => props.data, (newVal) => {
  chartData.value = newVal
  updateChart()
}, { deep: true })

watch(() => props.options, (newVal) => {
  updateChart()
}, { deep: true })

watch(() => props.type, () => {
  updateChart()
})

// 生命周期
onMounted(() => {
  chartData.value = props.data
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})

// 方法
const initChart = () => {
  if (!chartRef.value) return
  
  // 初始化图表实例
  chartInstance.value = echarts.init(chartRef.value, props.theme)
  
  // 设置图表配置
  updateChart()
  
  // 绑定事件
  bindEvents()
  
  // 响应式处理
  if (props.responsive && props.autoResize) {
    window.addEventListener('resize', handleResize)
  }
}

const updateChart = () => {
  if (!chartInstance.value || !chartData.value || chartData.value.length === 0) {
    return
  }
  
  const option = getChartOption()
  chartInstance.value.setOption(option, true)
}

const getChartOption = () => {
  const baseOption = {
    color: props.colorTheme,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      top: 10,
      right: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  // 根据图表类型生成配置
  switch (props.type) {
    case 'line':
      return getLineOption(baseOption)
    case 'bar':
      return getBarOption(baseOption)
    case 'pie':
      return getPieOption(baseOption)
    case 'scatter':
      return getScatterOption(baseOption)
    case 'radar':
      return getRadarOption(baseOption)
    case 'gauge':
      return getGaugeOption(baseOption)
    default:
      return getLineOption(baseOption)
  }
}

const getLineOption = (baseOption) => {
  return {
    ...baseOption,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '数据',
      type: 'line',
      smooth: true,
      data: chartData.value.map(item => item.value),
      areaStyle: {
        opacity: 0.3
      }
    }]
  }
}

const getBarOption = (baseOption) => {
  return {
    ...baseOption,
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '数据',
      type: 'bar',
      data: chartData.value.map(item => item.value)
    }]
  }
}

const getPieOption = (baseOption) => {
  return {
    ...baseOption,
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '数据',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: chartData.value
    }]
  }
}

const getScatterOption = (baseOption) => {
  return {
    ...baseOption,
    xAxis: {},
    yAxis: {},
    series: [{
      name: '数据',
      type: 'scatter',
      data: chartData.value.map(item => [item.x, item.y])
    }]
  }
}

const getRadarOption = (baseOption) => {
  const indicators = chartData.value.map(item => ({
    name: item.name,
    max: Math.max(...chartData.value.map(d => d.value)) * 1.2
  }))
  
  return {
    ...baseOption,
    radar: {
      indicator: indicators
    },
    series: [{
      name: '数据',
      type: 'radar',
      data: [{
        value: chartData.value.map(item => item.value),
        name: '指标值'
      }]
    }]
  }
}

const getGaugeOption = (baseOption) => {
  return {
    ...baseOption,
    series: [{
      name: '数据',
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%'
      },
      data: chartData.value
    }]
  }
}

const bindEvents = () => {
  if (!chartInstance.value) return
  
  chartInstance.value.on('click', (params) => {
    emit('click', params)
  })
  
  chartInstance.value.on('dblclick', (params) => {
    emit('dblclick', params)
  })
  
  chartInstance.value.on('mouseover', (params) => {
    emit('mouseover', params)
  })
  
  chartInstance.value.on('mouseout', (params) => {
    emit('mouseout', params)
  })
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

const handleRefresh = () => {
  emit('refresh')
  updateChart()
}

const handleExport = () => {
  if (!chartInstance.value) return
  
  try {
    const url = chartInstance.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    const link = document.createElement('a')
    link.download = `chart_${Date.now()}.png`
    link.href = url
    link.click()
    
    emit('export', url)
  } catch (error) {
    console.error('导出图表失败:', error)
  }
}

const handleFullscreen = () => {
  if (!chartRef.value) return
  
  if (chartRef.value.requestFullscreen) {
    chartRef.value.requestFullscreen()
  } else if (chartRef.value.webkitRequestFullscreen) {
    chartRef.value.webkitRequestFullscreen()
  } else if (chartRef.value.msRequestFullscreen) {
    chartRef.value.msRequestFullscreen()
  }
  
  emit('fullscreen')
}

const refresh = () => {
  updateChart()
}

const resize = () => {
  handleResize()
}

const clear = () => {
  if (chartInstance.value) {
    chartInstance.value.clear()
  }
}

const dispose = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
}

// 暴露方法
defineExpose({
  refresh,
  resize,
  clear,
  dispose,
  getInstance: () => chartInstance.value
})
</script>

<style scoped lang="less">
.common-chart {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .chart-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    
    .chart-actions {
      display: flex;
      align-items: center;
    }
  }
  
  .chart-content {
    position: relative;
    
    .chart-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 10;
    }
    
    .chart-empty {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .empty-icon {
        font-size: 48px;
        color: #d9d9d9;
        margin-bottom: 16px;
      }
      
      .empty-text {
        color: #999;
        font-size: 14px;
      }
    }
    
    .chart-container {
      width: 100%;
      height: 100%;
    }
  }
  
  .chart-description {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    font-size: 12px;
    color: #666;
  }
}
</style>