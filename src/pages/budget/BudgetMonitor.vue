<template>
  <div class="budget-monitor">
    <a-card title="预算监控">
      <template #extra>
        <a-space>
          <a-select v-model="timeRange" placeholder="时间范围" style="width: 120px" @change="handleTimeRangeChange">
            <a-option value="month">本月</a-option>
            <a-option value="quarter">本季度</a-option>
            <a-option value="year">本年度</a-option>
            <a-option value="custom">自定义</a-option>
          </a-select>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button @click="handleBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </a-space>
      </template>

      <!-- 预算概览卡片 -->
      <a-row :gutter="16" style="margin-bottom: 20px">
        <a-col :span="6">
          <a-statistic
            title="总预算"
            :value="monitorData.totalBudget"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已使用"
            :value="monitorData.usedBudget"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="剩余"
            :value="monitorData.remainingBudget"
            :precision="2"
            :value-from="0"
            animation
          >
            <template #prefix>¥</template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="执行率"
            :value="monitorData.executionRate"
            :precision="1"
            :value-from="0"
            animation
          >
            <template #suffix>%</template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 预算执行趋势图 -->
      <a-card title="预算执行趋势" style="margin-bottom: 20px">
        <BudgetTrendChart :budget-id="budgetId" :time-range="timeRangeForChart" />
      </a-card>

      <!-- 预算分配与执行清单（替代部门与科目视图） -->
      <a-card title="预算分配清单">
        <a-table
          :data="allocationData"
          :columns="allocationColumns"
          :pagination="paginationConfig"
          :loading="loading"
          row-key="id"
        >
          <template #allocatedAmount="{ record }">
            ¥{{ record.allocatedAmount.toLocaleString() }}
          </template>
          <template #usedAmount="{ record }">
            ¥{{ record.usedAmount.toLocaleString() }}
          </template>
          <template #remainingAmount="{ record }">
            ¥{{ record.remainingAmount.toLocaleString() }}
          </template>
          <template #usageRate="{ record }">
            <a-progress
              :percent="record.usageRate"
              :color="getExecutionRateColor(record.usageRate)"
            />
          </template>
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '@/api/budget'
import BudgetTrendChart from '@/components/budget/BudgetTrendChart.vue'

const router = useRouter()
const route = useRoute()

const budgetId = route.params.id
const timeRange = ref('month')
const timeRangeForChart = computed(() => {
  // 映射到趋势组件支持的范围：year | quarter | month
  if (timeRange.value === 'month') return 'month'
  if (timeRange.value === 'quarter') return 'quarter'
  return 'year'
})
const loading = ref(false)
const departmentChartRef = ref()
let departmentChart = null

const monitorData = reactive({
  totalBudget: 0,
  usedBudget: 0,
  remainingBudget: 0,
  executionRate: 0
})

const allocationData = ref([])
const allocationColumns = [
  { title: '分配项', dataIndex: 'name', width: 160 },
  { title: '分配金额', dataIndex: 'allocatedAmount', slotName: 'allocatedAmount', width: 120 },
  { title: '已使用', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 120 },
  { title: '剩余', dataIndex: 'remainingAmount', slotName: 'remainingAmount', width: 120 },
  { title: '使用率', dataIndex: 'usageRate', slotName: 'usageRate', width: 150 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 }
]

const paginationConfig = {
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
}

const getExecutionRateColor = (rate) => {
  if (rate >= 90) return '#f53f3f'
  if (rate >= 70) return '#ff7d00'
  return '#14c9c9'
}

const getStatusColor = (status) => {
  const colors = {
    'normal': 'green',
    'warning': 'orange',
    'danger': 'red'
  }
  return colors[status] || 'blue'
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'warning': '预警',
    'danger': '危险'
  }
  return texts[status] || '未知'
}

const initDepartmentChart = (data) => {
  // 保留图表区域，展示分配-使用-剩余聚合柱状图（不再按部门）
  if (departmentChart) {
    departmentChart.dispose()
  }
  departmentChart = echarts.init(departmentChartRef.value)
  window.addEventListener('resize', () => departmentChart?.resize())

  const labels = data.map(d => d.type)
  const values = data.map(d => d.value)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value' },
    series: [{ name: '金额', type: 'bar', data: values }]
  }
  departmentChart.setOption(option)
}

const handleTimeRangeChange = () => {
  loadMonitorData()
}

const handleRefresh = () => {
  loadMonitorData()
}

const handleBack = () => {
  router.push('/budget/overview')
}

const loadMonitorData = async () => {
  loading.value = true
  try {
    // 加载监控数据
    const monitorResult = await budgetApiService.getBudgetMonitor(budgetId, timeRange.value)
    Object.assign(monitorData, monitorResult)

    // 生成分配清单（模拟）
    allocationData.value = Array.from({ length: 6 }).map((_, i) => {
      const alloc = Math.floor((monitorData.totalBudget / 6) * (0.8 + Math.random() * 0.4))
      const used = Math.floor(alloc * (0.3 + Math.random() * 0.6))
      const remain = alloc - used
      const rate = Math.round((used / Math.max(alloc, 1)) * 100)
      return {
        id: `alloc-${i + 1}`,
        name: `分配项${i + 1}`,
        allocatedAmount: alloc,
        usedAmount: used,
        remainingAmount: remain,
        usageRate: rate,
        status: rate >= 90 ? 'danger' : rate >= 70 ? 'warning' : 'normal'
      }
    })

    // 初始化聚合图（展示总预算、已使用、剩余）
    const chartData = [
      { type: '预算', value: monitorData.totalBudget },
      { type: '已使用', value: monitorData.usedBudget },
      { type: '剩余', value: monitorData.remainingBudget }
    ]
    initDepartmentChart(chartData)
  } catch (error) {
    console.error('加载监控数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 从路由参数获取预算ID
  const budgetId = route.params.id || ''
  if (budgetId) {
    loadMonitorData()
  } else {
    Message.error('缺少预算ID参数')
  }
})

watch(timeRange, () => {
  if (budgetId) {
    loadMonitorData()
  }
})

onUnmounted(() => {
  if (departmentChart) {
    departmentChart.dispose()
  }
  window.removeEventListener('resize', () => {
    departmentChart?.resize()
  })
})
</script>

<style scoped>
.budget-monitor {
  padding: 20px;
}
</style>