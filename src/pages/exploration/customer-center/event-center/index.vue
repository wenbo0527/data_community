<template>
  <div class="event-center-home">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">事件中心概览</h1>
        <p class="page-subtitle">实时监控事件状态，洞察业务数据趋势</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleQuickCreate">
          <template #icon><icon-plus /></template>
          快速创建
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon><icon-refresh /></template>
          刷新数据
        </a-button>
        <a-range-picker 
          v-model="dateRange" 
          style="width: 240px"
          @change="handleDateRangeChange"
        />
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <a-row :gutter="24">
        <a-col :span="6">
          <div class="stat-card primary">
            <div class="card-icon">
              <icon-calendar />
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.totalEvents }}</div>
              <div class="card-label">事件总数</div>
              <div class="card-trend">
                <span class="trend-up">+{{ stats.eventGrowth }}%</span>
                <span class="trend-label">较上周</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card success">
            <div class="card-icon">
              <icon-check-circle />
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.onlineEvents }}</div>
              <div class="card-label">在线事件</div>
              <div class="card-trend">
                <span class="trend-up">+{{ stats.onlineGrowth }}%</span>
                <span class="trend-label">较上周</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card warning">
            <div class="card-icon">
              <icon-thunderbolt />
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.virtualEvents }}</div>
              <div class="card-label">虚拟事件</div>
              <div class="card-trend">
                <span class="trend-up">+{{ stats.virtualGrowth }}%</span>
                <span class="trend-label">较上周</span>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card info">
            <div class="card-icon">
              <icon-bar-chart />
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.avgResponseTime }}ms</div>
              <div class="card-label">平均响应时间</div>
              <div class="card-trend">
                <span class="trend-down">-{{ stats.responseImprovement }}%</span>
                <span class="trend-label">较上周</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <a-row :gutter="24">
        <!-- 事件趋势图 -->
        <a-col :span="16">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">事件趋势分析</h3>
              <div class="chart-controls">
                <a-radio-group v-model="trendType" type="button" size="small">
                  <a-radio value="hour">小时</a-radio>
                  <a-radio value="day">日</a-radio>
                  <a-radio value="week">周</a-radio>
                </a-radio-group>
                <a-button type="text" size="small" @click="handleExportTrend">
                  <template #icon><icon-download /></template>
                </a-button>
              </div>
            </div>
            <div class="chart-content">
              <div ref="trendChartRef" class="chart-container"></div>
            </div>
          </div>
        </a-col>
        
        <!-- 事件类型分布 -->
        <a-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">事件类型分布</h3>
              <a-button type="text" size="small" @click="handleExportType">
                <template #icon><icon-download /></template>
              </a-button>
            </div>
            <div class="chart-content">
              <div ref="typeChartRef" class="chart-container small"></div>
            </div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-top: 24px;">
        <!-- 最近事件列表 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">最近事件</h3>
              <a-link @click="handleViewAllEvents">查看全部</a-link>
            </div>
            <div class="recent-events">
              <div 
                v-for="event in recentEvents" 
                :key="event.id"
                class="event-item"
                @click="handleEventClick(event)"
              >
                <div class="event-left">
                  <a-tag :color="getEventTypeColor(event.eventType)" size="small">
                    {{ event.eventType }}
                  </a-tag>
                  <span class="event-name">{{ event.eventName }}</span>
                </div>
                <div class="event-right">
                  <span class="event-time">{{ formatTime(event.createTime) }}</span>
                  <a-button type="text" size="mini" @click.stop="handleTestEvent(event)">
                    <template #icon><icon-play-circle /></template>
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        
        <!-- 性能指标 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">性能指标</h3>
              <a-button type="text" size="small" @click="handleRefreshMetrics">
                <template #icon><icon-refresh /></template>
              </a-button>
            </div>
            <div class="chart-content">
              <div ref="metricsChartRef" class="chart-container small"></div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 快捷操作区域 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="quick-card" @click="handleQuickCreate">
            <div class="quick-icon">
              <icon-plus />
            </div>
            <div class="quick-content">
              <div class="quick-title">创建事件</div>
              <div class="quick-desc">快速创建新的事件</div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="quick-card" @click="handleImportEvents">
            <div class="quick-icon">
              <icon-upload />
            </div>
            <div class="quick-content">
              <div class="quick-title">批量导入</div>
              <div class="quick-desc">批量导入事件数据</div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="quick-card" @click="handleExportReport">
            <div class="quick-icon">
              <icon-download />
            </div>
            <div class="quick-content">
              <div class="quick-title">导出报表</div>
              <div class="quick-desc">导出事件分析报表</div>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="quick-card" @click="handleSystemSettings">
            <div class="quick-icon">
              <icon-settings />
            </div>
            <div class="quick-content">
              <div class="quick-title">系统设置</div>
              <div class="quick-desc">配置系统参数</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Message } from '@arco-design/web-vue'
import { mockEventAPI } from '@/mock/event'
import {
  IconPlus,
  IconRefresh,
  IconDownload,
  IconCalendar,
  IconCheckCircle,
  IconThunderbolt,
  IconBarChart,
  IconUpload,
  IconSettings,
  IconPlayCircle
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 响应式数据
const dateRange = ref([])
const trendType = ref('day')
const stats = reactive({
  totalEvents: 156,
  onlineEvents: 89,
  virtualEvents: 23,
  avgResponseTime: 234,
  eventGrowth: 12.5,
  onlineGrowth: 8.3,
  virtualGrowth: 15.7,
  responseImprovement: 5.2
})
const recentEvents = ref([])

// 图表引用
const trendChartRef = ref(null)
const typeChartRef = ref(null)
const metricsChartRef = ref(null)

// 图表实例
let trendChart = null
let typeChart = null
let metricsChart = null

// 定时器
let refreshTimer = null

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '事件趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['事件总数', '在线事件', '虚拟事件'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateTimeLabels(trendType.value),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '事件数量'
    },
    series: [
      {
        name: '事件总数',
        type: 'line',
        data: generateTrendData('total'),
        smooth: true,
        lineStyle: {
          color: '#165DFF',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.1)' }
          ])
        }
      },
      {
        name: '在线事件',
        type: 'line',
        data: generateTrendData('online'),
        smooth: true,
        lineStyle: {
          color: '#00B42A',
          width: 3
        }
      },
      {
        name: '虚拟事件',
        type: 'line',
        data: generateTrendData('virtual'),
        smooth: true,
        lineStyle: {
          color: '#FF7D00',
          width: 3
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化类型分布图
const initTypeChart = () => {
  if (!typeChartRef.value) return
  
  typeChart = echarts.init(typeChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '系统事件' },
          { value: 28, name: '业务事件' },
          { value: 22, name: '用户事件' },
          { value: 10, name: '营销事件' },
          { value: 5, name: '风控事件' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  typeChart.setOption(option)
}

// 初始化性能指标图
const initMetricsChart = () => {
  if (!metricsChartRef.value) return
  
  metricsChart = echarts.init(metricsChartRef.value)
  
  const option = {
    radar: {
      indicator: [
        { name: '响应时间', max: 500 },
        { name: '吞吐量', max: 100 },
        { name: '错误率', max: 10 },
        { name: '可用性', max: 100 },
        { name: '并发量', max: 1000 }
      ]
    },
    series: [
      {
        name: '性能指标',
        type: 'radar',
        data: [
          {
            value: [234, 85, 0.5, 99.9, 650],
            name: '当前性能'
          },
          {
            value: [200, 90, 0.3, 99.95, 700],
            name: '目标性能'
          }
        ]
      }
    ]
  }
  
  metricsChart.setOption(option)
}

// 生成时间标签
const generateTimeLabels = (type) => {
  const labels = []
  const now = new Date()
  
  if (type === 'hour') {
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      labels.push(time.getHours() + ':00')
    }
  } else if (type === 'day') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push((date.getMonth() + 1) + '/' + date.getDate())
    }
  } else if (type === 'week') {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      labels.push('第' + Math.ceil(date.getDate() / 7) + '周')
    }
  }
  
  return labels
}

// 生成趋势数据
const generateTrendData = (type) => {
  const baseValue = type === 'total' ? 150 : type === 'online' ? 90 : 25
  const data = []
  
  for (let i = 0; i < 24; i++) {
    data.push(baseValue + Math.floor(Math.random() * 20) - 10)
  }
  
  return data
}

// 获取事件类型颜色
const getEventTypeColor = (type) => {
  const colorMap = {
    '系统事件': 'blue',
    '业务事件': 'green',
    '用户事件': 'orange',
    '营销事件': 'purple',
    '风控事件': 'red'
  }
  return colorMap[type] || 'gray'
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  } else if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 事件处理函数
const handleQuickCreate = () => {
  router.push('/exploration/customer-center/event-center/event-management')
}

const handleRefresh = () => {
  loadRecentEvents()
  Message.success('数据已刷新')
}

const handleDateRangeChange = () => {
  // 日期范围变化处理
  Message.info('日期范围已更新')
}

const handleExportTrend = () => {
  Message.info('趋势图导出功能开发中...')
}

const handleExportType = () => {
  Message.info('类型分布图导出功能开发中...')
}

const handleViewAllEvents = () => {
  router.push('/exploration/customer-center/event-center/event-management')
}

const handleTestEvent = (event) => {
  router.push({
    path: '/exploration/customer-center/event-center/sample-stats',
    query: { eventId: event.id, eventName: event.eventName }
  })
}

const handleEventClick = (event) => {
  // 事件点击处理
  console.log('事件点击:', event)
}

const handleRefreshMetrics = () => {
  if (metricsChart) {
    metricsChart.resize()
  }
  Message.success('性能指标已刷新')
}

const handleImportEvents = () => {
  Message.info('批量导入功能开发中...')
}

const handleExportReport = () => {
  Message.info('报表导出功能开发中...')
}

const handleSystemSettings = () => {
  Message.info('系统设置功能开发中...')
}

// 加载最近事件
const loadRecentEvents = async () => {
  try {
    const events = await mockEventAPI.getEvents()
    recentEvents.value = events.slice(0, 8)
  } catch (error) {
    console.error('加载最近事件失败:', error)
  }
}

// 图表自适应
const handleResize = () => {
  nextTick(() => {
    if (trendChart) trendChart.resize()
    if (typeChart) typeChart.resize()
    if (metricsChart) metricsChart.resize()
  })
}

// 生命周期
onMounted(async () => {
  await loadRecentEvents()
  
  nextTick(() => {
    initTrendChart()
    initTypeChart()
    initMetricsChart()
  })
  
  // 定时刷新
  refreshTimer = setInterval(() => {
    loadRecentEvents()
  }, 30000)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  if (trendChart) {
    trendChart.dispose()
  }
  if (typeChart) {
    typeChart.dispose()
  }
  if (metricsChart) {
    metricsChart.dispose()
  }
  
  window.removeEventListener('resize', handleResize)
})
</script>

<script>
export default {
  name: 'EventCenterHome'
}
</script>

<style scoped>
.event-center-home {
  padding: 24px;
  background: #F2F3F5;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #4E5969;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 统计卡片 */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-card.primary {
  border-left: 4px solid #165DFF;
}

.stat-card.success {
  border-left: 4px solid #00B42A;
}

.stat-card.warning {
  border-left: 4px solid #FF7D00;
}

.stat-card.info {
  border-left: 4px solid #14C9C9;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.primary .card-icon {
  background: rgba(22, 93, 255, 0.1);
  color: #165DFF;
}

.stat-card.success .card-icon {
  background: rgba(0, 180, 42, 0.1);
  color: #00B42A;
}

.stat-card.warning .card-icon {
  background: rgba(255, 125, 0, 0.1);
  color: #FF7D00;
}

.stat-card.info .card-icon {
  background: rgba(20, 201, 201, 0.1);
  color: #14C9C9;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 8px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-up {
  color: #00B42A;
  font-size: 12px;
  font-weight: 600;
}

.trend-down {
  color: #F53F3F;
  font-size: 12px;
  font-weight: 600;
}

.trend-label {
  color: #8A8E99;
  font-size: 12px;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chart-content {
  position: relative;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.chart-container.small {
  height: 250px;
}

/* 最近事件列表 */
.recent-events {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F2F3F5;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.event-item:hover {
  background-color: #F8F9FA;
  margin: 0 -20px;
  padding: 12px 20px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.event-name {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.event-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-time {
  font-size: 12px;
  color: #8A8E99;
}

/* 快捷操作 */
.quick-actions {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 20px 0;
}

.quick-card {
  background: linear-gradient(135deg, #F8F9FA 0%, #F2F3F5 100%);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #E5E6EB;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #165DFF;
}

.quick-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #165DFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-content {
  flex: 1;
}

.quick-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 4px;
}

.quick-desc {
  font-size: 12px;
  color: #4E5969;
}

/* 专业桌面端优化 */
@media screen and (min-width: 1920px) {
  .event-center-home {
    padding: 32px;
  }
  
  .page-header {
    padding: 32px;
  }
  
  .chart-card {
    padding: 24px;
  }
  
  .quick-actions {
    padding: 32px;
  }
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .stats-cards .arco-col {
    margin-bottom: 16px;
  }
  
  .charts-section .arco-col {
    margin-bottom: 16px;
  }
  
  .quick-actions .arco-col {
    margin-bottom: 16px;
  }
}
</style>