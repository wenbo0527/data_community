<template>
  <div class="coupon-statistics-container">
    <a-row :gutter="[16, 16]">
      <!-- 库存管理指标 -->
      <a-col :span="24">
        <a-card title="平台库存情况" :loading="loading">
          <a-row :gutter="[16, 16]">
            <a-col :span="6" v-for="(stat, index) in inventoryStats" :key="index">
              <a-card class="stat-card" :bordered="false">
                <a-statistic
                  :title="stat.title"
                  :value="stat.value"
                  :precision="stat.precision || 0"
                  :value-style="{ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }"
                >
                  <template #prefix>
                    <icon-arrow-rise v-if="stat.trend === 'up'" :style="{ color: '#00B42A', fontSize: '20px' }" />
                    <icon-arrow-fall v-else :style="{ color: '#F53F3F', fontSize: '20px' }" />
                  </template>
                  <template #suffix>
                    <span class="trend-text" :style="{ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '14px' }">
                      {{ stat.percentage }}%
                    </span>
                  </template>
                </a-statistic>
                

              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 过程监控指标 -->
      <a-col :span="24">
        <a-card title="过程指标监控" :loading="loading">
          <a-row :gutter="[16, 16]">
            <a-col :span="8" v-for="(stat, index) in processStats" :key="index">
              <a-card class="stat-card" :bordered="false">
                <a-statistic
                  :title="stat.title"
                  :value="stat.value"
                  :precision="stat.precision || 0"
                  :value-style="{ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }"
                >
                  <template #prefix>
                    <icon-arrow-rise v-if="stat.trend === 'up'" :style="{ color: '#00B42A', fontSize: '20px' }" />
                    <icon-arrow-fall v-else :style="{ color: '#F53F3F', fontSize: '20px' }" />
                  </template>
                  <template #suffix>
                    <span class="trend-text" :style="{ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '14px' }">
                      {{ stat.percentage }}%
                    </span>
                  </template>
                </a-statistic>
                

              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>


      <!-- 权益平台预警信息与失败原因分析 -->
      <a-col :span="24">
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-card title="权益平台预警信息" :loading="loading">
          <a-table :data="warningData" :pagination="false" :scroll="{ y: 240 }">
            <template #columns>
              <a-table-column title="预警类型" data-index="type" />
              <a-table-column title="预警内容" data-index="content" />
              <a-table-column title="预警时间" data-index="time" />
              <a-table-column title="状态" data-index="status">
                <template #cell="{ record }">
                  <a-tag :color="record.status === '已处理' ? 'green' : 'red'">
                    {{ record.status }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
          </a-col>
          
          <a-col :span="12">
            <a-card title="领取失败原因分析" :loading="loading">
          <div ref="failureChartRef" style="width: 100%; height: 300px;"></div>
        </a-card>
      </a-col>

    </a-row>
  </a-col>

  <!-- 券包使用排行 -->
  <a-col :span="24">
    <a-card title="数据统计明细" :loading="loading" class="data-table-card">
      <template #extra>
        <a-space>
          <a-input-search
            placeholder="搜索批次日期"
            style="width: 200px"
            allow-clear
            @search="handleSearch"
          />
          <a-button type="text">
            <template #icon><icon-download /></template>
            导出数据
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="statisticsData"
        :pagination="{
          pageSize: 10,
          showTotal: true,
          showJumper: true,
          showPageSize: true
        }"
        :bordered="false"
        stripe
      >
        <template #columns>
          <a-table-column title="批次日期" data-index="batchDate" align="center" />
          <a-table-column title="下发量" data-index="sendCount" align="right">
            <template #cell="{ record }">
              <span class="highlight-text">{{ record.sendCount.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="下发成功量" data-index="successCount" align="right">
            <template #cell="{ record }">
              <span class="highlight-text">{{ record.successCount.toLocaleString() }}</span>
            </template>
          </a-table-column>
          <a-table-column title="下发成功率" data-index="successRate" align="right">
            <template #cell="{ record }">
              <a-badge
                :color="record.successRate >= 80 ? '#00B42A' : record.successRate >= 60 ? '#FF7D00' : '#F53F3F'"
                :text="record.successRate.toFixed(1) + '%'"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </a-col>
</a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { IconArrowRise, IconArrowFall, IconDownload } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import * as echarts from 'echarts'
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'

// 数据加载状态
const loading = ref(false)

// 时间范围选择
const timeRange = ref('week')

// 统计数据
const statisticsData = ref([
  {
    batchDate: '2024-01-01',
    sendCount: 1000,
    successCount: 850,
    successRate: 85.0
  },
  {
    batchDate: '2024-01-02',
    sendCount: 1200,
    successCount: 980,
    successRate: 81.7
  },
  {
    batchDate: '2024-01-03',
    sendCount: 800,
    successCount: 700,
    successRate: 87.5
  },
  {
    batchDate: '2024-01-04',
    sendCount: 1500,
    successCount: 1200,
    successRate: 80.0
  }
])

// 库存管理指标
const inventoryStats = ref([
  {
    title: '库存量',
    value: 10000,
    trend: 'up',
    percentage: 10.2,
    description: '近3月内权益创建的券总库存'
  },
  {
    title: '未领取量',
    value: 3200,
    trend: 'down',
    percentage: 5.5,
    description: '状态为未领取券的总量'
  },
  {
    title: '已领取量',
    value: 4800,
    trend: 'up',
    percentage: 12.3,
    description: '当前状态为已领取券的总量'
  },
  {
    title: '已锁定量',
    value: 1200,
    trend: 'up',
    percentage: 8.1,
    description: '当前状态为已锁定券的总量'
  },
  {
    title: '已核销量',
    value: 800,
    trend: 'up',
    percentage: 6.7,
    description: '当前状态为已核销券的总量'
  },
  {
    title: '权益领取率',
    value: 68.0,
    precision: 1,
    trend: 'up',
    percentage: 3.2,
    description: '统计周期内：(已领取+已锁定+已核销)/库存量'
  },
  {
    title: '权益使用率',
    value: 41.7,
    precision: 1,
    trend: 'up',
    percentage: 2.8,
    description: '统计周期内：(已锁定 + 已核销)/已领取'
  }
])

// 过程监控指标
const processStats = ref([
  {
    title: '领取成功率',
    value: 85.5,
    precision: 1,
    trend: 'up',
    percentage: 4.2,
    description: '统计周期内：已领取量/策略请求下发量'
  },
  {
    title: '锁定成功率',
    value: 99.99,
    precision: 2,
    trend: 'up',
    percentage: 0.01,
    description: '统计周期内：已锁定量/核心请求锁定量'
  },
  {
    title: '核销成功率',
    value: 99.99,
    precision: 2,
    trend: 'up',
    percentage: 0.01,
    description: '统计周期内：已核销量/核心请求核销量'
  }
])

// 维度选择
const selectedDimension = ref('ma')

// 趋势图表
const trendChartRef = ref(null)
let trendChart = null

// 类型分布图表
const typeChartRef = ref(null)
let typeChart = null

// ==================== 预警数据 ====================
const warningData = ref([
  {
    type: '券包发放失败',
    content: '券包ID: CP20240101发放失败，请检查',
    time: '2024-01-15 10:30',
    status: '未处理'
  },
  {
    type: '券即将过期',
    content: '券ID: C20240101即将在3天后过期',
    time: '2024-01-14 15:20',
    status: '已处理'
  },
  {
    type: '券使用异常',
    content: '券ID: C20240102使用率低于5%，请关注',
    time: '2024-01-13 09:45',
    status: '未处理'
  }
])

// ==================== 失败原因统计数据 ====================
const failureReasonData = ref([
  { value: 35, name: '用户信息不匹配' },
  { value: 25, name: '券已过期' },
  { value: 20, name: '库存不足' },
  { value: 15, name: '系统错误' },
  { value: 5, name: '其他原因' }
])

// ==================== 领取失败原因分布 ====================
const failureDistributionData = ref([
  { value: 42, name: '用户信息不匹配' },
  { value: 28, name: '券已过期' },
  { value: 18, name: '库存不足' },
  { value: 8, name: '系统错误' },
  { value: 4, name: '其他原因' }
])

// 初始化失败原因饼图
const failureChartRef = ref(null)
let failureChart = null

const initFailureChart = async () => {
  if (!failureChartRef.value || !failureChartRef.value.clientWidth) {
    setTimeout(initFailureChart, 100)
    return
  }
  
  try {
    failureChart = await safeInitECharts(failureChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: failureDistributionData.value.map(item => item.name)
    },
    series: [
      {
        name: '领取失败原因',
        type: 'pie',
        radius: ['50%', '70%'],
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
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: failureDistributionData.value
      }
    ]
  }
  failureChart.setOption(option)
  } catch (error) {
    console.error('失败原因图表初始化失败:', error)
  }
}

// 获取统计数据
const handleSearch = (value) => {
  console.log('搜索值:', value)
  // 这里可以添加实际的搜索逻辑
  fetchStatisticsData()
}

const fetchStatisticsData = async () => {
  loading.value = true
  try {
    // TODO: 调用接口获取数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新图表数据
    initFailureChart()

  } catch (error) {
    Message.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 监听时间范围变化
watch(timeRange, () => {
  fetchStatisticsData()
})

// 监听窗口大小变化，重绘图表
const handleResize = () => {
  trendChart?.resize()
  typeChart?.resize()
}

onMounted(() => {
  fetchStatisticsData()
  window.addEventListener('resize', handleResize)
  initFailureChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  failureChart?.dispose()
})
</script>

<style scoped>
.coupon-statistics-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.trend-text {
  font-size: 13px;
  margin-left: 8px;
  font-weight: 500;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
  border-radius: 50%;
  background-color: var(--color-fill-2);
  transition: all 0.3s;
}

.rank-number.top-three {
  color: #fff;
  background-color: var(--color-primary);
  font-weight: 600;
}

.highlight-text {
  font-weight: 500;
  color: var(--color-text-1);
}

.data-table-card {
  .arco-table-th {
    background-color: var(--color-bg-2);
    font-weight: 600;
  }
  
  .arco-table-tr:hover {
    background-color: var(--color-fill-1);
  }
  
  .arco-progress {
    margin-bottom: 4px;
  }
}

.trend-card {
  .arco-card-header {
    border-bottom: none;
  }
}
</style>


