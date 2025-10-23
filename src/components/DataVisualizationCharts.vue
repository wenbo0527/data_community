<template>
  <div class="data-visualization-charts">
    <!-- 任务类型分布饼图 -->
    <div class="chart-container">
      <h3 class="chart-title">任务类型分布</h3>
      <div ref="taskTypeChart" class="chart"></div>
    </div>
    
    <!-- 任务状态分布柱状图 -->
    <div class="chart-container">
      <h3 class="chart-title">任务状态分布</h3>
      <div ref="taskStatusChart" class="chart"></div>
    </div>
    
    <!-- 任务创建趋势折线图 -->
    <div class="chart-container">
      <h3 class="chart-title">任务创建趋势</h3>
      <div ref="taskTrendChart" class="chart"></div>
    </div>
    
    <!-- 节点类型使用统计 -->
    <div class="chart-container">
      <h3 class="chart-title">节点类型使用统计</h3>
      <div ref="nodeTypeChart" class="chart"></div>
    </div>
    
    <!-- 执行时间分布热力图 -->
    <div class="chart-container">
      <h3 class="chart-title">执行时间分布</h3>
      <div ref="executionTimeChart" class="chart"></div>
    </div>
    
    <!-- 创建人活跃度雷达图 -->
    <div class="chart-container">
      <h3 class="chart-title">创建人活跃度</h3>
      <div ref="creatorActivityChart" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  chartType: {
    type: String,
    default: 'all' // all, taskType, taskStatus, trend, nodeType, executionTime, creatorActivity
  },
  theme: {
    type: String,
    default: 'light' // light, dark
  }
})

// 图表引用
const taskTypeChart = ref(null)
const taskStatusChart = ref(null)
const taskTrendChart = ref(null)
const nodeTypeChart = ref(null)
const executionTimeChart = ref(null)
const creatorActivityChart = ref(null)

// 图表实例
let taskTypeChartInstance = null
let taskStatusChartInstance = null
let taskTrendChartInstance = null
let nodeTypeChartInstance = null
let executionTimeChartInstance = null
let creatorActivityChartInstance = null

// 颜色主题
const colorThemes = {
  light: {
    primary: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    background: '#ffffff',
    text: '#333333',
    grid: '#f0f0f0'
  },
  dark: {
    primary: ['#177ddc', '#49aa19', '#d89614', '#d32029', '#642ab5', '#0fb5b5'],
    background: '#1f1f1f',
    text: '#ffffff',
    grid: '#404040'
  }
}

// 获取当前主题颜色
const getCurrentTheme = () => colorThemes[props.theme] || colorThemes.light

// 初始化所有图表
const initCharts = async () => {
  await nextTick()
  
  if (props.chartType === 'all' || props.chartType === 'taskType') {
    initTaskTypeChart()
  }
  if (props.chartType === 'all' || props.chartType === 'taskStatus') {
    initTaskStatusChart()
  }
  if (props.chartType === 'all' || props.chartType === 'trend') {
    initTaskTrendChart()
  }
  if (props.chartType === 'all' || props.chartType === 'nodeType') {
    initNodeTypeChart()
  }
  if (props.chartType === 'all' || props.chartType === 'executionTime') {
    initExecutionTimeChart()
  }
  if (props.chartType === 'all' || props.chartType === 'creatorActivity') {
    initCreatorActivityChart()
  }
}

// 任务类型分布饼图
const initTaskTypeChart = () => {
  if (!taskTypeChart.value) return
  
  taskTypeChartInstance = echarts.init(taskTypeChart.value)
  
  const typeData = getTaskTypeData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: theme.text
      }
    },
    series: [
      {
        name: '任务类型',
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: typeData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: theme.background,
          borderWidth: 2
        }
      }
    ],
    color: theme.primary
  }
  
  taskTypeChartInstance.setOption(option)
}

// 任务状态分布柱状图
const initTaskStatusChart = () => {
  if (!taskStatusChart.value) return
  
  taskStatusChartInstance = echarts.init(taskStatusChart.value)
  
  const statusData = getTaskStatusData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statusData.categories,
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      },
      splitLine: {
        lineStyle: {
          color: theme.grid
        }
      }
    },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        data: statusData.values,
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ],
    color: theme.primary
  }
  
  taskStatusChartInstance.setOption(option)
}

// 任务创建趋势折线图
const initTaskTrendChart = () => {
  if (!taskTrendChart.value) return
  
  taskTrendChartInstance = echarts.init(taskTrendChart.value)
  
  const trendData = getTaskTrendData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['任务创建数量'],
      textStyle: {
        color: theme.text
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.dates,
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      },
      splitLine: {
        lineStyle: {
          color: theme.grid
        }
      }
    },
    series: [
      {
        name: '任务创建数量',
        type: 'line',
        stack: 'Total',
        data: trendData.values,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ],
    color: theme.primary
  }
  
  taskTrendChartInstance.setOption(option)
}

// 节点类型使用统计
const initNodeTypeChart = () => {
  if (!nodeTypeChart.value) return
  
  nodeTypeChartInstance = echarts.init(nodeTypeChart.value)
  
  const nodeData = getNodeTypeData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      },
      splitLine: {
        lineStyle: {
          color: theme.grid
        }
      }
    },
    yAxis: {
      type: 'category',
      data: nodeData.categories,
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: nodeData.values,
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        }
      }
    ],
    color: theme.primary
  }
  
  nodeTypeChartInstance.setOption(option)
}

// 执行时间分布热力图
const initExecutionTimeChart = () => {
  if (!executionTimeChart.value) return
  
  executionTimeChartInstance = echarts.init(executionTimeChart.value)
  
  const timeData = getExecutionTimeData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: timeData.hours,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    yAxis: {
      type: 'category',
      data: timeData.days,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: theme.text
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    visualMap: {
      min: 0,
      max: timeData.maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      textStyle: {
        color: theme.text
      }
    },
    series: [
      {
        name: '执行次数',
        type: 'heatmap',
        data: timeData.data,
        label: {
          show: true,
          color: theme.text
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  executionTimeChartInstance.setOption(option)
}

// 创建人活跃度雷达图
const initCreatorActivityChart = () => {
  if (!creatorActivityChart.value) return
  
  creatorActivityChartInstance = echarts.init(creatorActivityChart.value)
  
  const activityData = getCreatorActivityData()
  const theme = getCurrentTheme()
  
  const option = {
    backgroundColor: theme.background,
    tooltip: {},
    legend: {
      data: activityData.creators,
      textStyle: {
        color: theme.text
      }
    },
    radar: {
      indicator: activityData.indicators,
      axisLine: {
        lineStyle: {
          color: theme.grid
        }
      },
      splitLine: {
        lineStyle: {
          color: theme.grid
        }
      },
      axisLabel: {
        color: theme.text
      }
    },
    series: [
      {
        name: '创建人活跃度',
        type: 'radar',
        data: activityData.data
      }
    ],
    color: theme.primary
  }
  
  creatorActivityChartInstance.setOption(option)
}

// 数据处理函数
const getTaskTypeData = () => {
  const typeCount = {}
  props.data.forEach(task => {
    typeCount[task.taskType] = (typeCount[task.taskType] || 0) + 1
  })
  
  return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
}

const getTaskStatusData = () => {
  const statusCount = {}
  const statusLabels = {
    'draft': '草稿',
    'running': '运行中',
    'completed': '已完成',
    'disabled': '已禁用'
  }
  
  props.data.forEach(task => {
    const label = statusLabels[task.status] || task.status
    statusCount[label] = (statusCount[label] || 0) + 1
  })
  
  return {
    categories: Object.keys(statusCount),
    values: Object.values(statusCount)
  }
}

const getTaskTrendData = () => {
  const dateCount = {}
  
  props.data.forEach(task => {
    const date = new Date(task.createTime).toISOString().split('T')[0]
    dateCount[date] = (dateCount[date] || 0) + 1
  })
  
  const sortedDates = Object.keys(dateCount).sort()
  
  return {
    dates: sortedDates,
    values: sortedDates.map(date => dateCount[date])
  }
}

const getNodeTypeData = () => {
  const nodeCount = {}
  const nodeLabels = {
    'start': '开始节点',
    'end': '结束节点',
    'crowd-split': '人群分流',
    'event-split': '事件分流',
    'sms': '短信发送',
    'push': '推送通知',
    'email': '邮件发送',
    'manual-call': '人工外呼',
    'wait': '等待节点',
    'condition': '条件判断'
  }
  
  props.data.forEach(task => {
    if (task.canvasData?.nodes) {
      task.canvasData.nodes.forEach(node => {
        const label = nodeLabels[node.type] || node.type
        nodeCount[label] = (nodeCount[label] || 0) + 1
      })
    }
  })
  
  return {
    categories: Object.keys(nodeCount),
    values: Object.values(nodeCount)
  }
}

const getExecutionTimeData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  let maxValue = 0
  
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const value = Math.floor(Math.random() * 10)
      data.push([h, d, value])
      maxValue = Math.max(maxValue, value)
    }
  }
  
  return {
    hours,
    days,
    data,
    maxValue
  }
}

const getCreatorActivityData = () => {
  const creators = [...new Set(props.data.map(task => task.creator))].slice(0, 5)
  const indicators = [
    { name: '任务创建', max: 20 },
    { name: '任务完成', max: 15 },
    { name: '活跃天数', max: 30 },
    { name: '平均节点数', max: 10 },
    { name: '成功率', max: 100 }
  ]
  
  const data = creators.map(creator => {
    const creatorTasks = props.data.filter(task => task.creator === creator)
    const completedTasks = creatorTasks.filter(task => task.status === 'completed')
    const avgNodes = creatorTasks.reduce((sum, task) => {
      return sum + (task.canvasData?.nodes?.length || 0)
    }, 0) / creatorTasks.length || 0
    
    return {
      value: [
        creatorTasks.length,
        completedTasks.length,
        Math.floor(Math.random() * 30) + 1,
        Math.floor(avgNodes),
        Math.floor((completedTasks.length / creatorTasks.length) * 100) || 0
      ],
      name: creator
    }
  })
  
  return {
    creators,
    indicators,
    data
  }
}

// 响应式更新
watch(() => props.data, () => {
  updateCharts()
}, { deep: true })

watch(() => props.theme, () => {
  updateCharts()
})

// 更新所有图表
const updateCharts = () => {
  if (taskTypeChartInstance) {
    initTaskTypeChart()
  }
  if (taskStatusChartInstance) {
    initTaskStatusChart()
  }
  if (taskTrendChartInstance) {
    initTaskTrendChart()
  }
  if (nodeTypeChartInstance) {
    initNodeTypeChart()
  }
  if (executionTimeChartInstance) {
    initExecutionTimeChart()
  }
  if (creatorActivityChartInstance) {
    initCreatorActivityChart()
  }
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  taskTypeChartInstance?.resize()
  taskStatusChartInstance?.resize()
  taskTrendChartInstance?.resize()
  nodeTypeChartInstance?.resize()
  executionTimeChartInstance?.resize()
  creatorActivityChartInstance?.resize()
}

// 生命周期
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 清理
const cleanup = () => {
  taskTypeChartInstance?.dispose()
  taskStatusChartInstance?.dispose()
  taskTrendChartInstance?.dispose()
  nodeTypeChartInstance?.dispose()
  executionTimeChartInstance?.dispose()
  creatorActivityChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
}

// 组件卸载时清理
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  cleanup()
})

// 暴露方法
defineExpose({
  updateCharts,
  cleanup
})
</script>

<style scoped>
.data-visualization-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  padding: 20px;
}

.chart-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.chart {
  width: 100%;
  height: 300px;
  min-height: 300px;
}

/* 深色主题 */
.data-visualization-charts.dark .chart-container {
  background: #1f1f1f;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.data-visualization-charts.dark .chart-container:hover {
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.15);
}

.data-visualization-charts.dark .chart-title {
  color: #ffffff;
  border-bottom-color: #404040;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-visualization-charts {
    grid-template-columns: 1fr;
    padding: 10px;
    gap: 15px;
  }
  
  .chart-container {
    padding: 15px;
  }
  
  .chart {
    height: 250px;
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 200px;
    min-height: 200px;
  }
  
  .chart-title {
    font-size: 14px;
  }
}

/* 加载状态 */
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999999;
  font-size: 14px;
}

.chart-loading::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>