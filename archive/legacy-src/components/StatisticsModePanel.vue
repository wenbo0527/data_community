<template>
  <div class="statistics-mode-panel">
    <div class="panel-header">
      <h3 class="panel-title">统计模式</h3>
      <p class="panel-description">任务流程数据统计分析和可视化展示</p>
    </div>

    <div class="statistics-controls">
      <div class="control-section">
        <h4 class="section-title">统计维度</h4>
        <div class="control-row">
          <a-space wrap>
            <a-select v-model="statsParams.dimension" placeholder="统计维度" style="width: 150px;" @change="onDimensionChange">
              <a-option value="taskType">按任务类型</a-option>
              <a-option value="status">按任务状态</a-option>
              <a-option value="nodeType">按节点类型</a-option>
              <a-option value="creator">按创建人</a-option>
              <a-option value="time">按时间</a-option>
            </a-select>
            
            <a-select v-model="statsParams.timeRange" placeholder="时间范围" style="width: 150px;" @change="onTimeRangeChange">
              <a-option value="week">最近一周</a-option>
              <a-option value="month">最近一月</a-option>
              <a-option value="quarter">最近三月</a-option>
              <a-option value="year">最近一年</a-option>
            </a-select>
            
            <a-button type="primary" @click="refreshStatistics" :loading="statsLoading">
              <template #icon>
                <IconRefresh />
              </template>
              刷新统计
            </a-button>
            
            <a-button @click="exportStatistics">
              <template #icon>
                <IconDownload />
              </template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <div class="statistics-overview">
      <div class="overview-cards">
        <a-card class="stat-card" :bordered="false">
          <a-statistic 
            title="总任务数" 
            :value="overviewStats.totalTasks" 
            :value-style="{ color: '#1890ff' }"
          >
            <template #suffix>
              <IconFile />
            </template>
          </a-statistic>
        </a-card>
        
        <a-card class="stat-card" :bordered="false">
          <a-statistic 
            title="运行中任务" 
            :value="overviewStats.runningTasks" 
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>
              <IconPlayArrow />
            </template>
          </a-statistic>
        </a-card>
        
        <a-card class="stat-card" :bordered="false">
          <a-statistic 
            title="总节点数" 
            :value="overviewStats.totalNodes" 
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>
              <IconApps />
            </template>
          </a-statistic>
        </a-card>
        
        <a-card class="stat-card" :bordered="false">
          <a-statistic 
            title="总连接数" 
            :value="overviewStats.totalConnections" 
            :value-style="{ color: '#fa8c16' }"
          >
            <template #suffix>
              <IconLink />
            </template>
          </a-statistic>
        </a-card>
      </div>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-section">
      <DataVisualizationCharts 
        :data="originalTaskData"
        :chart-type="'all'"
        :theme="'light'"
      />
    </div>

    <div class="statistics-details">
      <a-card title="详细统计数据" :bordered="false">
        <a-tabs v-model:active-key="detailsTab" type="card">
          <a-tab-pane key="tasks" title="任务统计">
            <a-table 
              :columns="taskStatsColumns" 
              :data="taskStatsData" 
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #percentage="{ record }">
                <a-progress 
                  :percent="record.percentage" 
                  size="small" 
                  :show-text="true"
                  :color="getProgressColor(record.percentage)"
                />
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="nodes" title="节点统计">
            <a-table 
              :columns="nodeStatsColumns" 
              :data="nodeStatsData" 
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #nodeType="{ record }">
                <a-tag :color="getNodeTypeColor(record.nodeType)">
                  {{ getNodeTypeName(record.nodeType) }}
                </a-tag>
              </template>
              
              <template #usage="{ record }">
                <a-progress 
                  :percent="record.usage" 
                  size="small" 
                  :show-text="true"
                  :color="getProgressColor(record.usage)"
                />
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="performance" title="性能指标">
            <div class="performance-metrics">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-card size="small">
                    <a-statistic 
                      title="平均节点数/任务" 
                      :value="performanceMetrics.avgNodesPerTask" 
                      :precision="1"
                    />
                  </a-card>
                </a-col>
                <a-col :span="8">
                  <a-card size="small">
                    <a-statistic 
                      title="平均连接数/任务" 
                      :value="performanceMetrics.avgConnectionsPerTask" 
                      :precision="1"
                    />
                  </a-card>
                </a-col>
                <a-col :span="8">
                  <a-card size="small">
                    <a-statistic 
                      title="任务复杂度指数" 
                      :value="performanceMetrics.complexityIndex" 
                      :precision="2"
                    />
                  </a-card>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

// Props定义
const props = defineProps({
  canvasData: {
    type: Object,
    default: () => ({ nodes: [], connections: [] })
  },
  graph: {
    type: Object,
    default: null
  }
})
import { Message } from '@arco-design/web-vue'
import { 
  IconRefresh, 
  IconDownload, 
  IconFile, 
  IconPlayArrow, 
  IconApps, 
  IconLink 
} from '@arco-design/web-vue/es/icon'
import { TaskStorage } from '../utils/taskStorage.js'
import MockDataGenerator from '../utils/mockDataGenerator.js'
import ChartRenderer from '../utils/chartRenderer.js'
import DataVisualizationCharts from './DataVisualizationCharts.vue'

// 统计参数
const statsParams = reactive({
  dimension: 'taskType',
  timeRange: 'month'
})

// 统计状态
const statsLoading = ref(false)
const detailsTab = ref('tasks')

// 图表引用
const taskTypeChart = ref(null)
const taskStatusChart = ref(null)
const nodeTypeChart = ref(null)
const trendChart = ref(null)

// 概览统计数据
const overviewStats = reactive({
  totalTasks: 0,
  runningTasks: 0,
  totalNodes: 0,
  totalConnections: 0
})

// 任务统计数据
const taskStatsData = ref([])
const nodeStatsData = ref([])

// 性能指标
const performanceMetrics = reactive({
  avgNodesPerTask: 0,
  avgConnectionsPerTask: 0,
  complexityIndex: 0
})

// 任务统计表格列
const taskStatsColumns = [
  {
    title: '类型/状态',
    dataIndex: 'category',
    width: 150
  },
  {
    title: '数量',
    dataIndex: 'count',
    width: 100
  },
  {
    title: '占比',
    dataIndex: 'percentage',
    slotName: 'percentage',
    width: 200
  },
  {
    title: '说明',
    dataIndex: 'description',
    ellipsis: true
  }
]

// 节点统计表格列
const nodeStatsColumns = [
  {
    title: '节点类型',
    dataIndex: 'nodeType',
    slotName: 'nodeType',
    width: 120
  },
  {
    title: '使用次数',
    dataIndex: 'count',
    width: 100
  },
  {
    title: '使用率',
    dataIndex: 'usage',
    slotName: 'usage',
    width: 200
  },
  {
    title: '平均每任务',
    dataIndex: 'avgPerTask',
    width: 120,
    render: ({ record }) => record.avgPerTask.toFixed(1)
  }
]

// 刷新统计数据
const refreshStatistics = async () => {
  statsLoading.value = true
  
  try {
    // 获取所有任务数据
    const allTasks = await getAllTasksData()
    
    // 计算概览统计
    calculateOverviewStats(allTasks)
    
    // 计算详细统计
    calculateDetailedStats(allTasks)
    
    // 计算性能指标
    calculatePerformanceMetrics(allTasks)
    
    // 渲染图表
    await nextTick()
    renderCharts(allTasks)
    
    Message.success('统计数据已更新')
  } catch (error) {
    console.error('统计数据更新失败:', error)
    Message.error('统计数据更新失败')
  } finally {
    statsLoading.value = false
  }
}

// 获取所有任务数据
const getAllTasksData = async () => {
  // 如果有传入的画布数据，基于当前画布数据生成统计
  if (props.canvasData && props.canvasData.nodes && props.canvasData.nodes.length > 0) {
    return [{
      id: 'current-canvas',
      taskName: '当前画布',
      taskType: '当前任务',
      status: 'running',
      creator: '当前用户',
      createTime: new Date().toLocaleString('zh-CN'),
      canvasData: props.canvasData
    }]
  }
  
  // 从本地存储获取任务
  const storedTasks = TaskStorage.getAllTasks()
  
  // 生成Mock数据
  const mockTasks = MockDataGenerator.generateStatisticsMockData()
  
  // 转换格式
  const convertedStoredTasks = storedTasks.map(task => ({
    id: task.id,
    taskName: task.name || '未命名任务',
    taskType: task.type || '未分类',
    status: task.status || 'draft',
    creator: task.creator || '当前用户',
    createTime: task.createTime || new Date().toLocaleString('zh-CN'),
    canvasData: task.canvasData || { nodes: [], connections: [] }
  }))
  
  return [...convertedStoredTasks, ...mockTasks]
}

// 计算概览统计
const calculateOverviewStats = (tasks) => {
  overviewStats.totalTasks = tasks.length
  overviewStats.runningTasks = tasks.filter(task => task.status === 'running').length
  overviewStats.totalNodes = tasks.reduce((sum, task) => {
    return sum + (task.canvasData?.nodes?.length || 0)
  }, 0)
  overviewStats.totalConnections = tasks.reduce((sum, task) => {
    return sum + (task.canvasData?.connections?.length || 0)
  }, 0)
}

// 计算详细统计
const calculateDetailedStats = (tasks) => {
  // 任务类型统计
  const taskTypeStats = {}
  const taskStatusStats = {}
  const nodeTypeStats = {}
  
  tasks.forEach(task => {
    // 任务类型统计
    taskTypeStats[task.taskType] = (taskTypeStats[task.taskType] || 0) + 1
    
    // 任务状态统计
    taskStatusStats[task.status] = (taskStatusStats[task.status] || 0) + 1
    
    // 节点类型统计
    if (task.canvasData?.nodes) {
      task.canvasData.nodes.forEach(node => {
        nodeTypeStats[node.type] = (nodeTypeStats[node.type] || 0) + 1
      })
    }
  })
  
  // 转换为表格数据
  taskStatsData.value = [
    ...Object.entries(taskTypeStats).map(([type, count]) => ({
      category: type,
      count,
      percentage: Math.round((count / tasks.length) * 100),
      description: `${type}类型任务`
    })),
    ...Object.entries(taskStatusStats).map(([status, count]) => ({
      category: getStatusText(status),
      count,
      percentage: Math.round((count / tasks.length) * 100),
      description: `${getStatusText(status)}状态任务`
    }))
  ]
  
  const totalNodes = Object.values(nodeTypeStats).reduce((sum, count) => sum + count, 0)
  nodeStatsData.value = Object.entries(nodeTypeStats).map(([type, count]) => ({
    nodeType: type,
    count,
    usage: Math.round((count / totalNodes) * 100),
    avgPerTask: count / tasks.length
  }))
}

// 计算性能指标
const calculatePerformanceMetrics = (tasks) => {
  const validTasks = tasks.filter(task => task.canvasData?.nodes?.length > 0)
  
  if (validTasks.length === 0) {
    performanceMetrics.avgNodesPerTask = 0
    performanceMetrics.avgConnectionsPerTask = 0
    performanceMetrics.complexityIndex = 0
    return
  }
  
  const totalNodes = validTasks.reduce((sum, task) => sum + task.canvasData.nodes.length, 0)
  const totalConnections = validTasks.reduce((sum, task) => sum + (task.canvasData.connections?.length || 0), 0)
  
  performanceMetrics.avgNodesPerTask = totalNodes / validTasks.length
  performanceMetrics.avgConnectionsPerTask = totalConnections / validTasks.length
  
  // 复杂度指数 = (平均节点数 + 平均连接数) / 2
  performanceMetrics.complexityIndex = (performanceMetrics.avgNodesPerTask + performanceMetrics.avgConnectionsPerTask) / 2
}

// 渲染图表
const renderCharts = (tasks) => {
  if (!ChartRenderer) {
    console.warn('ChartRenderer not available, using mock charts')
    renderMockCharts(tasks)
    return
  }
  
  // 任务类型分布饼图
  const taskTypeData = getTaskTypeDistribution(tasks)
  ChartRenderer.renderPieChart(taskTypeChart.value, taskTypeData, {
    title: '任务类型分布',
    colors: ['#1890ff', '#52c41a', '#fa8c16', '#722ed1']
  })
  
  // 任务状态分布饼图
  const taskStatusData = getTaskStatusDistribution(tasks)
  ChartRenderer.renderPieChart(taskStatusChart.value, taskStatusData, {
    title: '任务状态分布',
    colors: ['#1890ff', '#52c41a', '#fa8c16', '#f5222d']
  })
  
  // 节点类型使用柱状图
  const nodeTypeData = getNodeTypeUsage(tasks)
  ChartRenderer.renderBarChart(nodeTypeChart.value, nodeTypeData, {
    title: '节点类型使用统计',
    xLabel: '节点类型',
    yLabel: '使用次数'
  })
  
  // 任务创建趋势线图
  const trendData = getTaskCreationTrend(tasks)
  ChartRenderer.renderLineChart(trendChart.value, trendData, {
    title: '任务创建趋势',
    xLabel: '时间',
    yLabel: '任务数量'
  })
}

// Mock图表渲染（当ChartRenderer不可用时）
const renderMockCharts = (tasks) => {
  // 简单的Canvas绘制示例
  const charts = [taskTypeChart, taskStatusChart, nodeTypeChart, trendChart]
  
  charts.forEach((chartRef, index) => {
    if (chartRef.value) {
      const ctx = chartRef.value.getContext('2d')
      const width = chartRef.value.width
      const height = chartRef.value.height
      
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      
      // 绘制占位图
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, width, height)
      
      ctx.fillStyle = '#666'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('图表数据加载中...', width / 2, height / 2)
      
      // 绘制一些示例数据
      ctx.fillStyle = '#1890ff'
      for (let i = 0; i < 5; i++) {
        const x = (width / 6) * (i + 1)
        const barHeight = Math.random() * (height / 2)
        ctx.fillRect(x - 10, height - barHeight - 50, 20, barHeight)
      }
    }
  })
}

// 获取任务类型分布数据
const getTaskTypeDistribution = (tasks) => {
  const distribution = {}
  tasks.forEach(task => {
    distribution[task.taskType] = (distribution[task.taskType] || 0) + 1
  })
  return Object.entries(distribution).map(([type, count]) => ({ label: type, value: count }))
}

// 获取任务状态分布数据
const getTaskStatusDistribution = (tasks) => {
  const distribution = {}
  tasks.forEach(task => {
    const statusText = getStatusText(task.status)
    distribution[statusText] = (distribution[statusText] || 0) + 1
  })
  return Object.entries(distribution).map(([status, count]) => ({ label: status, value: count }))
}

// 获取节点类型使用数据
const getNodeTypeUsage = (tasks) => {
  const usage = {}
  tasks.forEach(task => {
    if (task.canvasData?.nodes) {
      task.canvasData.nodes.forEach(node => {
        const typeName = getNodeTypeName(node.type)
        usage[typeName] = (usage[typeName] || 0) + 1
      })
    }
  })
  return Object.entries(usage).map(([type, count]) => ({ label: type, value: count }))
}

// 获取任务创建趋势数据
const getTaskCreationTrend = (tasks) => {
  // 简化的趋势数据，按天统计
  const trend = {}
  tasks.forEach(task => {
    const date = task.createTime?.split(' ')[0] || new Date().toISOString().split('T')[0]
    trend[date] = (trend[date] || 0) + 1
  })
  
  const sortedDates = Object.keys(trend).sort()
  return sortedDates.map(date => ({ label: date, value: trend[date] }))
}

// 维度变化处理
const onDimensionChange = (value) => {
  console.log('统计维度变化:', value)
  refreshStatistics()
}

// 时间范围变化处理
const onTimeRangeChange = (value) => {
  console.log('时间范围变化:', value)
  refreshStatistics()
}

// 导出统计数据
const exportStatistics = () => {
  console.log('导出统计数据')
  Message.info('数据导出功能开发中...')
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#52c41a'
  if (percentage >= 60) return '#1890ff'
  if (percentage >= 40) return '#fa8c16'
  return '#f5222d'
}

// 获取节点类型颜色
const getNodeTypeColor = (nodeType) => {
  const colorMap = {
    start: 'green',
    end: 'red',
    'crowd-split': 'blue',
    'event-split': 'purple',
    sms: 'orange',
    push: 'cyan',
    email: 'magenta',
    'manual-call': 'gold'
  }
  return colorMap[nodeType] || 'default'
}

// 获取节点类型名称
const getNodeTypeName = (nodeType) => {
  const nameMap = {
    start: '开始节点',
    end: '结束节点',
    'crowd-split': '人群分流',
    'event-split': '事件分流',
    sms: '短信发送',
    push: '推送',
    email: '邮件',
    'manual-call': '人工外呼'
  }
  return nameMap[nodeType] || nodeType
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    running: '运行中',
    completed: '已完成',
    disabled: '停用'
  }
  return textMap[status] || '未知'
}

// 初始化
onMounted(() => {
  refreshStatistics()
})
</script>

<style scoped>
.statistics-mode-panel {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.panel-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.statistics-controls {
  margin-bottom: 24px;
}

.control-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.control-row {
  margin-bottom: 12px;
}

.statistics-overview {
  margin-bottom: 24px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistics-charts {
  margin-bottom: 24px;
}

.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.statistics-details {
  margin-top: 24px;
}

.performance-metrics {
  padding: 16px;
}
</style>