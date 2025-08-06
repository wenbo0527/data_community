<template>
  <div class="indicator-detail" v-if="node">
    <a-row :gutter="24">
      <a-col :span="24">
        <!-- 基础信息 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">基础信息</span>
          </template>
          <a-descriptions :column="2" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="指标名称">
              <span class="highlight-text">{{ node.data?.label || node.label }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="指标层级">
              <a-tag :color="getLevelColor(node.data?.level || node.level)">
                L{{ node.data?.level || node.level }} - {{ getLevelName(node.data?.level || node.level) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="所属线路">
              <a-tag :color="getLineTagColor(node.data?.lineColor || node.lineColor)">
                {{ getLineName(node.data?.lineColor || node.lineColor) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="换乘站">
              <a-tag :color="(node.data?.isTransfer || node.isTransfer) ? 'gold' : 'gray'">
                {{ (node.data?.isTransfer || node.isTransfer) ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(node.data?.status || 'active')">
                {{ getStatusText(node.data?.status || 'active') }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              <span>{{ new Date().toLocaleString() }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 业务口径 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">业务口径</span>
          </template>
          <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="业务定义">
              <div class="description-content">{{ node.data.definition || '暂无业务定义' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="使用场景">
              <div class="description-content">{{ node.data.description || '用于监控业务核心指标，支持决策分析' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="当前值">
              <div class="metric-value-display">
                <span class="value">{{ node.data.value }}</span>
                <span class="unit">{{ node.data.unit || '' }}</span>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 核心KPI -->
        <a-card class="detail-card" v-if="(node.data?.kpis || node.kpis)?.length">
          <template #title>
            <span class="card-title">核心KPI</span>
          </template>
          <div class="kpi-grid">
            <div 
              v-for="(kpi, index) in (node.data?.kpis || node.kpis || [])" 
              :key="index"
              class="kpi-card"
            >
              <div class="kpi-name">{{ kpi }}</div>
              <div class="kpi-value">{{ getMockValue(kpi) }}</div>
              <div class="kpi-trend" :class="getTrendClass(index)">
                {{ getTrendText(index) }}
              </div>
            </div>
          </div>
        </a-card>

        <!-- 技术逻辑 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">技术逻辑</span>
          </template>
          <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="来源表">
              <div class="description-content">{{ node.data.dataSource || '暂无数据源信息' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="加工逻辑">
              <div class="description-content">{{ node.data.calculation || '暂无计算逻辑' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="关联字段说明">
              <div class="description-content">{{ node.data.fieldDescription || '暂无字段说明' }}</div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 报表位置 -->
        <a-card class="detail-card" v-if="node.data.reportUrl">
          <template #title>
            <span class="card-title">报表位置</span>
          </template>
          <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="报表信息">
              <div class="report-info">
                <a-link :href="node.data.reportUrl" target="_blank">
                  {{ node.data.reportName || '查看相关报表' }}
                </a-link>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 结果表信息 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">结果表信息</span>
          </template>
          <a-descriptions :column="1" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="存储位置">
              <div class="description-content">{{ node.data.storageLocation || 'dw.fact_metrics' }}</div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 查询代码 -->
        <a-card class="detail-card" v-if="node.data.sql">
          <template #title>
            <span class="card-title">查询代码</span>
          </template>
          <a-typography-paragraph code class="code-block query-code">
            {{ node.data.sql }}
          </a-typography-paragraph>
        </a-card>

        <!-- 趋势分析 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">趋势分析</span>
          </template>
          <div ref="chartContainer" style="height: 300px;"></div>
        </a-card>

        <!-- 操作按钮 -->
        <a-card class="detail-card">
          <template #title>
            <span class="card-title">操作</span>
          </template>
          <a-space>
            <a-button type="primary" @click="navigateToReport">
              <template #icon><icon-bar-chart /></template>
              查看报表
            </a-button>
            <a-button @click="copySQL">
              <template #icon><icon-code /></template>
              复制SQL
            </a-button>
            <a-button @click="addToFavorites">
              <template #icon><icon-heart /></template>
              收藏
            </a-button>
            <a-button @click="subscribe">
              <template #icon><icon-notification /></template>
              订阅
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconBarChart, IconCode, IconHeart, IconNotification } from '@arco-design/web-vue/es/icon'
import * as echarts from 'echarts'

interface Props {
  node: any
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 状态相关方法
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'green',
    'warning': 'orange', 
    'error': 'red',
    'inactive': 'gray'
  }
  return statusMap[status] || 'blue'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '正常',
    'warning': '预警',
    'error': '异常',
    'inactive': '停用'
  }
  return statusMap[status] || '未知'
}

// 地铁图相关方法
const getLevelColor = (level: number) => {
  const levelMap: Record<number, string> = {
    1: 'gold',
    2: 'blue', 
    3: 'green'
  }
  return levelMap[level] || 'gray'
}

const getLevelName = (level: number) => {
  const levelMap: Record<number, string> = {
    1: '战略层',
    2: '管理层',
    3: '执行层'
  }
  return levelMap[level] || '未知层级'
}

const getLineName = (color: string) => {
  const lineMap: Record<string, string> = {
    '#00B2A9': '规模线',
    '#2475FC': '质量线'
  }
  return lineMap[color] || '未知线路'
}

const getLineTagColor = (color: string) => {
  const colorMap: Record<string, string> = {
    '#00B2A9': 'cyan',
    '#2475FC': 'blue'
  }
  return colorMap[color] || 'gray'
}

// KPI相关方法
const getMockValue = (kpi: string) => {
  const mockValues: Record<string, string> = {
    '通过率': '85.6%',
    '平均审批时长': '2.3小时',
    '日放款额': '1,250万元',
    '放款成功率': '92.1%',
    '支用率': '78.4%',
    '循环率': '45.2%',
    '放款额': '1,250万元',
    '优质资产占比': '76.8%',
    'FPD30+': '3.2%',
    '30+逾期率': '2.8%',
    '余额': '8.5亿元',
    '不良率': '1.2%',
    '拨备覆盖率': '156.7%'
  }
  return mockValues[kpi] || '暂无数据'
}

const getTrendClass = (index: number) => {
  const trends = ['up', 'down', 'up', 'down']
  return trends[index % trends.length]
}

const getTrendText = (index: number) => {
  const trends = ['↑ 5.2%', '↓ 2.1%', '↑ 8.7%', '↓ 1.3%']
  return trends[index % trends.length]
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  
  const option = {
    title: {
      text: '近30天趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(30)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: generateTrendData(30),
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#165DFF'
      }
    }]
  }
  
  chartInstance.setOption(option)
}

// 生成模拟数据
const generateDateRange = (days: number) => {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
  }
  return dates
}

const generateTrendData = (days: number) => {
  const baseValue = parseFloat(props.node?.data.value) || 100
  return Array.from({ length: days }, () => 
    Math.round(baseValue * (0.8 + Math.random() * 0.4))
  )
}

// 操作方法
const navigateToReport = () => {
  if (props.node?.data.reportUrl) {
    window.open(props.node.data.reportUrl, '_blank')
  } else {
    Message.info('暂无相关报表')
  }
}

const copySQL = () => {
  if (props.node?.data.sql) {
    navigator.clipboard.writeText(props.node.data.sql)
    Message.success('SQL已复制到剪贴板')
  } else {
    Message.warning('暂无SQL代码')
  }
}

const addToFavorites = () => {
  Message.success('已添加到收藏')
}

const subscribe = () => {
  Message.success('订阅成功')
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped lang="less">
.indicator-detail {
  padding: 0;
  
  .detail-card {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-title {
      font-weight: 600;
      color: #1d2129;
      font-size: 16px;
    }
  }
  
  .highlight-text {
    color: #165dff;
    font-weight: 600;
  }
  
  .description-content {
    color: #4e5969;
    line-height: 1.6;
    word-break: break-all;
  }
  
  .metric-value-display {
    .value {
      font-size: 24px;
      font-weight: 600;
      color: #165dff;
      margin-right: 4px;
    }
    
    .unit {
      font-size: 14px;
      color: #86909c;
    }
  }
  
  .report-info {
    .arco-link {
      color: #165dff;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    
    .kpi-card {
      background: linear-gradient(135deg, #f7f8fa 0%, #ffffff 100%);
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .kpi-name {
        font-size: 14px;
        color: #4e5969;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .kpi-value {
        font-size: 20px;
        font-weight: 600;
        color: #165dff;
        margin-bottom: 4px;
      }
      
      .kpi-trend {
        font-size: 12px;
        font-weight: 500;
        
        &.up {
          color: #00b42a;
        }
        
        &.down {
          color: #f53f3f;
        }
      }
    }
  }
  
  .query-code {
    background-color: #f7f8fa;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
    padding: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #1d2129;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
  
  :deep(.arco-descriptions-item-label) {
    color: #4e5969;
    font-weight: 600;
  }
  
  :deep(.arco-descriptions-item-value) {
    color: #1d2129;
  }
  
  :deep(.arco-tag) {
    border-radius: 4px;
    font-size: 12px;
  }
  
  :deep(.arco-card-header) {
    border-bottom: 1px solid #f2f3f5;
    padding: 16px 20px;
  }
  
  :deep(.arco-card-body) {
    padding: 20px;
  }
  
  :deep(.arco-space-item) {
    .arco-btn {
      border-radius: 6px;
      font-weight: 500;
    }
  }
}
</style>