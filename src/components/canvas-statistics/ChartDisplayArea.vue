<template>
  <div class="chart-display-area">
    <div class="section-header">
      <div class="section-title">
        <icon-bar-chart />
        <span>数据可视化</span>
      </div>
      <div class="section-actions">
        <a-space>
          <a-select
            v-model="chartType"
            size="mini"
            style="width: 100px"
            @change="updateChart"
          >
            <a-option value="bar">柱状图</a-option>
            <a-option value="line">折线图</a-option>
            <a-option value="pie">饼图</a-option>
            <a-option value="scatter">散点图</a-option>
            <a-option value="funnel">漏斗图</a-option>
            <a-option value="sankey">桑基图</a-option>
          </a-select>
          <a-button 
            type="text" 
            size="mini"
            @click="toggleFullscreen"
          >
            <icon-fullscreen />
          </a-button>
          <a-button 
            type="text" 
            size="mini"
            @click="refreshChart"
            :loading="loading"
          >
            <icon-refresh />
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="charts-container">
      <!-- 节点访问量图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-title">
            <icon-bar-chart />
            <span>节点访问量排行</span>
          </div>
          <div class="chart-actions">
            <a-button 
              type="text" 
              size="mini"
              @click="drillDown('nodeVisits')"
            >
              钻取
            </a-button>
          </div>
        </div>
        <div class="chart-wrapper">
          <div ref="nodeVisitsChart" class="chart"></div>
        </div>
      </div>

      <!-- 转化率趋势图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-title">
            <icon-bar-chart />
            <span>转化率趋势</span>
          </div>
          <div class="chart-actions">
            <a-button 
              type="text" 
              size="mini"
              @click="drillDown('conversionTrend')"
            >
              钻取
            </a-button>
          </div>
        </div>
        <div class="chart-wrapper">
          <div ref="conversionTrendChart" class="chart"></div>
        </div>
      </div>

      <!-- 用户路径流向图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-title">
            <icon-share-alt />
            <span>用户路径流向</span>
          </div>
          <div class="chart-actions">
            <a-button 
              type="text" 
              size="mini"
              @click="drillDown('pathFlow')"
            >
              钻取
            </a-button>
          </div>
        </div>
        <div class="chart-wrapper">
          <div ref="pathFlowChart" class="chart"></div>
        </div>
      </div>

      <!-- 节点类型分布图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-title">
            <icon-bar-chart />
            <span>节点类型分布</span>
          </div>
          <div class="chart-actions">
            <a-button 
              type="text" 
              size="mini"
              @click="drillDown('nodeTypeDistribution')"
            >
              钻取
            </a-button>
          </div>
        </div>
        <div class="chart-wrapper">
          <div ref="nodeTypeDistributionChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 图表联动控制 -->
    <div class="chart-linkage">
      <a-space>
        <a-switch v-model="enableLinkage" size="small">
          <template #checked>图表联动</template>
          <template #unchecked>图表联动</template>
        </a-switch>
        <span class="linkage-hint">选择节点时同步更新所有图表</span>
      </a-space>
    </div>

    <!-- 全屏模式 -->
    <div v-if="isFullscreen" class="fullscreen-modal" @click.self="toggleFullscreen">
      <div class="fullscreen-content">
        <div class="fullscreen-header">
          <div class="fullscreen-title">
            <component :is="getChartIcon(fullscreenChart)" />
            <span>{{ getChartTitle(fullscreenChart) }}</span>
          </div>
          <div class="fullscreen-actions">
            <a-space>
              <a-select
                v-model="fullscreenChart"
                size="mini"
                style="width: 120px"
                @change="updateFullscreenChart"
              >
                <a-option value="nodeVisits">节点访问量</a-option>
                <a-option value="conversionTrend">转化率趋势</a-option>
                <a-option value="pathFlow">路径流向</a-option>
                <a-option value="nodeTypeDistribution">节点类型分布</a-option>
              </a-select>
              <a-button 
                type="text" 
                size="mini"
                @click="toggleFullscreen"
              >
                <icon-close />
              </a-button>
            </a-space>
          </div>
        </div>
        <div class="fullscreen-chart">
          <div ref="fullscreenChartRef" class="chart-fullscreen"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { 
  IconBarChart, 
  IconFullscreen, 
  IconRefresh, 
  IconClose
} from '@arco-design/web-vue/es/icon'

interface Props {
  canvasId: string
  filters: any
  selectedNodes: string[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['chart-interaction', 'drill-down'])

// 图表状态
const chartType = ref<'bar' | 'line' | 'pie' | 'scatter' | 'funnel' | 'sankey'>('bar')
const enableLinkage = ref(true)
const isFullscreen = ref(false)
const fullscreenChart = ref('nodeVisits')

// 图表实例
const nodeVisitsChart = ref<HTMLElement>()
const conversionTrendChart = ref<HTMLElement>()
const pathFlowChart = ref<HTMLElement>()
const nodeTypeDistributionChart = ref<HTMLElement>()
const fullscreenChartRef = ref<HTMLElement>()

let nodeVisitsInstance: echarts.ECharts | null = null
let conversionTrendInstance: echarts.ECharts | null = null
let pathFlowInstance: echarts.ECharts | null = null
let nodeTypeDistributionInstance: echarts.ECharts | null = null
let fullscreenInstance: echarts.ECharts | null = null

// 图表数据
const chartData = reactive({
  nodeVisits: [
    { name: '开始节点', value: 8500, type: 'start' },
    { name: '条件判断', value: 6800, type: 'condition' },
    { name: '发送短信', value: 4200, type: 'action' },
    { name: '等待延时', value: 2600, type: 'delay' },
    { name: '添加标签', value: 3420, type: 'tag' },
    { name: '结束节点', value: 3420, type: 'end' }
  ],
  conversionTrend: [
    { time: '00:00', rate: 28.5 },
    { time: '04:00', rate: 32.1 },
    { time: '08:00', rate: 35.8 },
    { time: '12:00', rate: 42.3 },
    { time: '16:00', rate: 38.7 },
    { time: '20:00', rate: 33.2 },
    { time: '24:00', rate: 29.8 }
  ],
  pathFlow: [
    { source: '开始节点', target: '条件判断', value: 6800 },
    { source: '条件判断', target: '发送短信', value: 4200 },
    { source: '条件判断', target: '等待延时', value: 2600 },
    { source: '发送短信', target: '添加标签', value: 3420 },
    { source: '等待延时', target: '添加标签', value: 2580 },
    { source: '添加标签', target: '结束节点', value: 3420 }
  ],
  nodeTypeDistribution: [
    { name: '开始节点', value: 1, type: 'start' },
    { name: '条件节点', value: 3, type: 'condition' },
    { name: '动作节点', value: 2, type: 'action' },
    { name: '延时节点', value: 1, type: 'delay' },
    { name: '标签节点', value: 2, type: 'tag' },
    { name: '结束节点', value: 1, type: 'end' }
  ]
})

// 获取图表图标
const getChartIcon = (chartType: string) => {
  const icons: Record<string, any> = {
    nodeVisits: IconBarChart,
    conversionTrend: IconBarChart,
    pathFlow: IconBarChart,
    nodeTypeDistribution: IconBarChart
  }
  return icons[chartType] || IconBarChart
}

// 获取图表标题
const getChartTitle = (chartType: string) => {
  const titles: Record<string, string> = {
    nodeVisits: '节点访问量排行',
    conversionTrend: '转化率趋势',
    pathFlow: '用户路径流向',
    nodeTypeDistribution: '节点类型分布'
  }
  return titles[chartType] || '图表'
}

// 初始化节点访问量图表
const initNodeVisitsChart = () => {
  if (!nodeVisitsChart.value) return
  
  nodeVisitsInstance = echarts.init(nodeVisitsChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.nodeVisits.map((item: any) => item.name),
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        color: '#8c8c8c'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#8c8c8c'
      }
    },
    series: [{
      name: '访问量',
      type: 'bar',
      data: chartData.nodeVisits.map((item: any) => item.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#69c0ff' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#096dd9'
        }
      }
    }]
  }
  
  nodeVisitsInstance.setOption(option)
  
  // 添加点击事件
  nodeVisitsInstance.on('click', (params: any) => {
    if (enableLinkage.value) {
      handleChartInteraction('nodeVisits', params)
    }
  })
}

// 初始化转化率趋势图表
const initConversionTrendChart = () => {
  if (!conversionTrendChart.value) return
  
  conversionTrendInstance = echarts.init(conversionTrendChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>转化率: ${params[0].value}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.conversionTrend.map((item: any) => item.time),
      axisLabel: {
        fontSize: 10,
        color: '#8c8c8c'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#8c8c8c',
        formatter: '{value}%'
      }
    },
    series: [{
      name: '转化率',
      type: 'line',
      data: chartData.conversionTrend.map((item: any) => item.rate),
      smooth: true,
      lineStyle: {
        color: '#52c41a',
        width: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
          { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 4,
      itemStyle: {
        color: '#52c41a'
      }
    }]
  }
  
  conversionTrendInstance.setOption(option)
}

// 初始化路径流向图表
const initPathFlowChart = () => {
  if (!pathFlowChart.value) return
  
  pathFlowInstance = echarts.init(pathFlowChart.value)
  
  const nodes = Array.from(new Set([
    ...chartData.pathFlow.map((item: any) => item.source),
    ...chartData.pathFlow.map((item: any) => item.target)
  ])).map(name => ({ name }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency'
      },
      data: nodes,
      links: chartData.pathFlow.map((item: any) => ({
        source: item.source,
        target: item.target,
        value: item.value
      })),
      lineStyle: {
        color: 'gradient',
        curveness: 0.5
      }
    }]
  }
  
  pathFlowInstance.setOption(option)
}

// 初始化节点类型分布图表
const initNodeTypeDistributionChart = () => {
  if (!nodeTypeDistributionChart.value) return
  
  nodeTypeDistributionInstance = echarts.init(nodeTypeDistributionChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 10
      }
    },
    series: [{
      name: '节点类型',
      type: 'pie',
      radius: '50%',
      data: chartData.nodeTypeDistribution.map((item: any) => ({
        name: item.name,
        value: item.value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        fontSize: 10
      }
    }]
  }
  
  nodeTypeDistributionInstance.setOption(option)
}

// 处理图表交互
const handleChartInteraction = (chartType: string, params: any) => {
  console.log('Chart interaction:', chartType, params)
  emit('chart-interaction', { chartType, params })
  
  // 如果启用联动，更新其他图表
  if (enableLinkage.value) {
    updateLinkedCharts(chartType, params)
  }
}

// 更新联动图表
const updateLinkedCharts = (sourceChart: string, params: any) => {
  // 根据选中的数据更新其他图表
  console.log('Updating linked charts:', sourceChart, params)
}

// 钻取数据
const drillDown = (chartType: string) => {
  console.log('Drill down:', chartType)
  emit('drill-down', { chartType })
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    // 延迟初始化全屏图表
    setTimeout(() => {
      updateFullscreenChart()
    }, 100)
  }
}

// 更新全屏图表
const updateFullscreenChart = () => {
  if (!fullscreenChartRef.value) return
  
  // 清理现有实例
  if (fullscreenInstance) {
    fullscreenInstance.dispose()
    fullscreenInstance = null
  }
  
  fullscreenInstance = echarts.init(fullscreenChartRef.value)
  
  // 根据选择的图表类型更新全屏图表
  switch (fullscreenChart.value) {
    case 'nodeVisits':
      const nodeOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.nodeVisits.map((item: any) => item.name),
          axisLabel: {
            rotate: 30,
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '访问量',
          type: 'bar',
          data: chartData.nodeVisits.map((item: any) => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' }
            ])
          }
        }]
      }
      fullscreenInstance.setOption(nodeOption)
      break
      
    case 'conversionTrend':
      const trendOption = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.conversionTrend.map((item: any) => item.time)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [{
          name: '转化率',
          type: 'line',
          data: chartData.conversionTrend.map((item: any) => item.rate),
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
            ])
          }
        }]
      }
      fullscreenInstance.setOption(trendOption)
      break
      
    default:
      // 其他图表类型的配置
      break
  }
}

// 更新图表
const updateChart = () => {
  // 根据图表类型更新显示
  console.log('Update chart type:', chartType.value)
}

// 刷新图表
const refreshChart = () => {
  // 重新加载数据并更新图表
  console.log('Refresh charts')
  
  // 更新所有图表
  if (nodeVisitsInstance) nodeVisitsInstance.resize()
  if (conversionTrendInstance) conversionTrendInstance.resize()
  if (pathFlowInstance) pathFlowInstance.resize()
  if (nodeTypeDistributionInstance) nodeTypeDistributionInstance.resize()
}

// 监听选择节点变化
watch(() => props.selectedNodes, (newNodes: any[]) => {
  if (enableLinkage.value && newNodes.length > 0) {
    // 高亮选中的节点数据
    highlightSelectedNodes(newNodes)
  }
}, { deep: true })

// 高亮选中的节点
const highlightSelectedNodes = (nodeIds: string[]) => {
  // 在图表中高亮显示选中的节点
  console.log('Highlight selected nodes:', nodeIds)
}

// 监听筛选条件变化
watch(() => props.filters, () => {
  // 根据筛选条件更新图表数据
  updateChartData()
}, { deep: true })

// 更新图表数据
const updateChartData = () => {
  // 根据筛选条件重新加载图表数据
  console.log('Update chart data with filters:', props.filters)
}

onMounted(() => {
  // 初始化所有图表
  initNodeVisitsChart()
  initConversionTrendChart()
  initPathFlowChart()
  initNodeTypeDistributionChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (nodeVisitsInstance) nodeVisitsInstance.resize()
    if (conversionTrendInstance) conversionTrendInstance.resize()
    if (pathFlowInstance) pathFlowInstance.resize()
    if (nodeTypeDistributionInstance) nodeTypeDistributionInstance.resize()
    if (fullscreenInstance) fullscreenInstance.resize()
  })
})

onUnmounted(() => {
  // 清理图表实例
  if (nodeVisitsInstance) nodeVisitsInstance.dispose()
  if (conversionTrendInstance) conversionTrendInstance.dispose()
  if (pathFlowInstance) pathFlowInstance.dispose()
  if (nodeTypeDistributionInstance) nodeTypeDistributionInstance.dispose()
  if (fullscreenInstance) fullscreenInstance.dispose()
  
  window.removeEventListener('resize', () => {
    if (nodeVisitsInstance) nodeVisitsInstance.resize()
    if (conversionTrendInstance) conversionTrendInstance.resize()
    if (pathFlowInstance) pathFlowInstance.resize()
    if (nodeTypeDistributionInstance) nodeTypeDistributionInstance.resize()
    if (fullscreenInstance) fullscreenInstance.resize()
  })
})
</script>

<style scoped lang="scss">
.chart-display-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.chart-wrapper {
  height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-linkage {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  
  .linkage-hint {
    font-size: 12px;
    color: #8c8c8c;
    margin-left: 8px;
  }
}

.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.fullscreen-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  height: 90%;
  max-width: 1200px;
  max-height: 800px;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.fullscreen-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.fullscreen-chart {
  flex: 1;
  min-height: 0;
}

.chart-fullscreen {
  width: 100%;
  height: 100%;
}

// 响应式布局
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

:deep(.arco-select-view) {
  .arco-select-view-suffix {
    padding-right: 4px;
  }
}
</style>