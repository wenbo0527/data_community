<template>
  <div class="statistics-overview">
    <div class="section-header">
      <div class="section-title">
        <IconDashboard />
        <span>统计概览</span>
      </div>
      <div class="section-actions">
        <a-button 
          type="text" 
          size="mini"
          @click="refreshData"
          :loading="loading"
        >
          <IconRefresh />
        </a-button>
        <span class="update-time">{{ lastUpdatedText }}</span>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-cards">
      <a-row :gutter="12">
        <a-col :span="12">
          <div class="stat-card primary">
            <div class="stat-icon">
              <IconEye />
            </div>
            <div class="stat-content">
              <div class="stat-label">总访问量</div>
              <div class="stat-value">{{ formatNumber(stats.totalVisits) }}</div>
              <div class="stat-trend" :class="getTrendClass(stats.visitsTrend)">
                <IconArrowRise v-if="stats.visitsTrend > 0" />
                <IconArrowFall v-else-if="stats.visitsTrend < 0" />
                <IconMinus v-else />
                <span>{{ Math.abs(stats.visitsTrend) }}%</span>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="12">
          <div class="stat-card success">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-content">
              <div class="stat-label">总转化数</div>
              <div class="stat-value">{{ formatNumber(stats.totalConversions) }}</div>
              <div class="stat-trend" :class="getTrendClass(stats.conversionsTrend)">
                <IconArrowRise v-if="stats.conversionsTrend > 0" />
                <IconArrowFall v-else-if="stats.conversionsTrend < 0" />
                <IconMinus v-else />
                <span>{{ Math.abs(stats.conversionsTrend) }}%</span>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="12">
          <div class="stat-card warning">
            <div class="stat-icon">
              <IconUser />
            </div>
            <div class="stat-content">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ formatNumber(stats.activeUsers) }}</div>
              <div class="stat-trend" :class="getTrendClass(stats.usersTrend)">
                <IconArrowRise v-if="stats.usersTrend > 0" />
                <IconArrowFall v-else-if="stats.usersTrend < 0" />
                <IconMinus v-else />
                <span>{{ Math.abs(stats.usersTrend) }}%</span>
              </div>
            </div>
          </div>
        </a-col>
        
        <a-col :span="12">
          <div class="stat-card info">
            <div class="stat-icon">
              <IconClockCircle />
            </div>
            <div class="stat-content">
              <div class="stat-label">平均停留</div>
              <div class="stat-value">{{ formatDuration(stats.avgStayTime) }}</div>
              <div class="stat-trend" :class="getTrendClass(stats.stayTimeTrend)">
                <IconArrowRise v-if="stats.stayTimeTrend > 0" />
                <IconArrowFall v-else-if="stats.stayTimeTrend < 0" />
                <IconMinus v-else />
                <span>{{ Math.abs(stats.stayTimeTrend) }}%</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 转化率趋势图 -->
    <div class="trend-chart-section">
      <div class="chart-header">
        <div class="chart-title">
          <IconBarChart />
          <span>转化率趋势</span>
        </div>
        <div class="chart-actions">
          <a-button 
            type="text" 
            size="mini"
            @click="toggleChartFullscreen"
          >
            <IconExpand />
          </a-button>
        </div>
      </div>
      
      <div class="chart-container">
        <div ref="trendChartRef" class="trend-chart"></div>
      </div>
    </div>

    <!-- 热门节点排行 -->
    <div class="top-nodes-section">
      <div class="section-subheader">
        <div class="section-title">
          <IconFire />
          <span>热门节点</span>
        </div>
        <a-link @click="viewAllNodes">查看全部</a-link>
      </div>
      
      <div class="top-nodes-list">
        <div 
          v-for="(node, index) in stats.topNodes" 
          :key="node.nodeId"
          class="node-item"
          @click="selectNode(node.nodeId)"
        >
          <div class="node-rank">{{ index + 1 }}</div>
          <div class="node-info">
            <div class="node-name">{{ node.nodeLabel }}</div>
            <div class="node-type">{{ getNodeTypeLabel(node.nodeType) }}</div>
          </div>
          <div class="node-stats">
            <div class="node-visits">{{ formatNumber(node.enterCount) }}</div>
            <div class="node-conversion">{{ node.conversionRate }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { 
  IconDashboard, 
  IconRefresh, 
  IconEye, 
  IconCheckCircle, 
  IconUser, 
  IconClockCircle,
  IconArrowRise,
  IconArrowFall,
  IconMinus,
  IconBarChart,
  IconExpand,
  IconFire
} from '@arco-design/web-vue/es/icon'

interface Props {
  canvasId: string
  filters: any
  loading: boolean
}

interface NodeStats {
  nodeId: string
  nodeType: string
  nodeLabel: string
  enterCount: number
  conversionRate: number
}

interface StatsData {
  totalVisits: number
  totalConversions: number
  activeUsers: number
  avgStayTime: number
  visitsTrend: number
  conversionsTrend: number
  usersTrend: number
  stayTimeTrend: number
  topNodes: NodeStats[]
  trendData: any[]
  lastUpdated: string
}

const props = defineProps<Props>()
const emit = defineEmits(['node-select', 'refresh'])

// 统计数据
const stats = reactive<StatsData>({
  totalVisits: 12580,
  totalConversions: 3420,
  activeUsers: 8920,
  avgStayTime: 180,
  visitsTrend: 12.5,
  conversionsTrend: 8.3,
  usersTrend: -2.1,
  stayTimeTrend: 5.7,
  topNodes: [
    { nodeId: 'node1', nodeType: 'start', nodeLabel: '开始节点', enterCount: 8500, conversionRate: 68.5 },
    { nodeId: 'node2', nodeType: 'condition', nodeLabel: '条件判断', enterCount: 5800, conversionRate: 45.2 },
    { nodeId: 'node3', nodeType: 'action', nodeLabel: '发送短信', enterCount: 4200, conversionRate: 32.8 },
    { nodeId: 'node4', nodeType: 'end', nodeLabel: '结束节点', enterCount: 3420, conversionRate: 100.0 }
  ],
  trendData: [],
  lastUpdated: new Date().toISOString()
})

// 图表实例
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

// 计算属性
const lastUpdatedText = computed(() => {
  const date = new Date(stats.lastUpdated)
  return `更新于 ${date.toLocaleTimeString('zh-CN')}`
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千'
  }
  return num.toString()
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}时${minutes}分`
  }
}

// 获取趋势样式类
const getTrendClass = (trend: number): string => {
  if (trend > 0) return 'positive'
  if (trend < 0) return 'negative'
  return 'neutral'
}

// 获取节点类型标签
const getNodeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    start: '开始',
    end: '结束',
    condition: '条件',
    action: '动作',
    delay: '延时',
    tag: '标签',
    sms: '短信',
    email: '邮件',
    push: '推送'
  }
  return labels[type] || type
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0]
        return `${point.name}<br/>转化率: ${point.value}%`
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
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#8c8c8c', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: '#8c8c8c', 
        fontSize: 10,
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      name: '转化率',
      type: 'line',
      data: [28.5, 32.1, 35.8, 42.3, 38.7, 33.2, 29.8],
      smooth: true,
      lineStyle: {
        color: '#1890ff',
        width: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 4,
      itemStyle: {
        color: '#1890ff',
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  }
  
  trendChart.setOption(option)
}

// 切换图表全屏
const toggleChartFullscreen = () => {
  // TODO: 实现图表全屏功能
  console.log('Toggle chart fullscreen')
}

// 选择节点
const selectNode = (nodeId: string) => {
  emit('node-select', nodeId)
}

// 刷新数据
const refreshData = () => {
  emit('refresh')
  // TODO: 实现数据刷新逻辑
}

// 查看全部节点
const viewAllNodes = () => {
  // TODO: 导航到节点列表页面
  console.log('View all nodes')
}

// 监听筛选条件变化
watch(() => props.filters, () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('Filters changed:', props.filters)
}, { deep: true })

// 监听加载状态
watch(() => props.loading, (newLoading) => {
  if (!newLoading) {
    // 数据加载完成后更新图表
    if (trendChart) {
      trendChart.resize()
    }
  }
})

onMounted(() => {
  initTrendChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (trendChart) {
      trendChart.resize()
    }
  })
})

onUnmounted(() => {
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  
  window.removeEventListener('resize', () => {
    if (trendChart) {
      trendChart.resize()
    }
  })
})
</script>

<style scoped lang="scss">
.statistics-overview {
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

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-time {
  font-size: 12px;
  color: #8c8c8c;
}

.stats-cards {
  .stat-card {
    padding: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.primary {
      background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
      color: #fff;
    }
    
    &.success {
      background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
      color: #fff;
    }
    
    &.warning {
      background: linear-gradient(135deg, #fa8c16 0%, #ffd666 100%);
      color: #fff;
    }
    
    &.info {
      background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
      color: #fff;
    }
  }
  
  .stat-icon {
    font-size: 24px;
    opacity: 0.9;
  }
  
  .stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    opacity: 0.8;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    
    &.positive {
      color: #52c41a;
    }
    
    &.negative {
      color: #ff4d4f;
    }
    
    &.neutral {
      color: #d9d9d9;
    }
  }
}

.trend-chart-section {
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

.chart-container {
  height: 160px;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

.top-nodes-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.section-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.top-nodes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f6ffed;
    border-color: #b7eb8f;
    transform: translateX(2px);
  }
}

.node-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.node-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
}

.node-type {
  font-size: 11px;
  color: #8c8c8c;
}

.node-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.node-visits {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

.node-conversion {
  font-size: 11px;
  color: #52c41a;
  font-weight: 500;
}
</style>