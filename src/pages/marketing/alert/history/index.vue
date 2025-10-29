<template>
  <div class="alert-history-container">
    <a-card title="预警历史管理" :loading="loading">
      <template #extra>
        <a-space>
          <a-range-picker
            v-model="dateRange"
            style="width: 240px"
            @change="handleDateChange"
          />
          <a-select
            v-model="statusFilter"
            placeholder="处理状态"
            style="width: 120px"
            allow-clear
            @change="handleStatusFilter"
          >
            <a-option value="pending">待处理</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="resolved">已处理</a-option>
          </a-select>
          <a-select
            v-model="typeFilter"
            placeholder="预警类型"
            style="width: 120px"
            allow-clear
            @change="handleTypeFilter"
          >
            <a-option value="inventory">库存监控</a-option>
            <a-option value="expiry">过期监控</a-option>
            <a-option value="failure">发放失败</a-option>
          </a-select>
          <a-button type="primary" @click="handleExport">
            <template #icon><icon-download /></template>
            导出记录
          </a-button>
        </a-space>
      </template>

      <!-- 统计概览 -->
      <a-row :gutter="16" style="margin-bottom: 20px">
        <a-col :span="6">
          <a-card :bordered="false" class="stat-card">
            <a-statistic
              title="总预警次数"
              :value="statisticsData.total"
              :value-style="{ color: '#165DFF', fontSize: '24px', fontWeight: 600 }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="stat-card">
            <a-statistic
              title="待处理"
              :value="statisticsData.pending"
              :value-style="{ color: '#F53F3F', fontSize: '24px', fontWeight: 600 }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="stat-card">
            <a-statistic
              title="已处理"
              :value="statisticsData.resolved"
              :value-style="{ color: '#00B42A', fontSize: '24px', fontWeight: 600 }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false" class="stat-card">
            <a-statistic
              title="处理率"
              :value="statisticsData.resolveRate"
              suffix="%"
              :value-style="{ color: '#FF7D00', fontSize: '24px', fontWeight: 600 }"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- 预警历史列表 -->
      <a-table
        :data="filteredHistory"
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
          <a-table-column title="预警时间" data-index="triggered_at" align="center" :width="160" />
          <a-table-column title="预警类型" data-index="alert_type" align="center" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.alert_type)">
                {{ getTypeText(record.alert_type) }}
              </a-tag>
            </template>
          </a-table-column>

          <a-table-column title="预警内容" data-index="content" align="left" />
          <a-table-column title="触发规则" data-index="rule_name" align="left" :width="150" />
          <a-table-column title="处理状态" data-index="status" align="center" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="处理人" data-index="resolved_by" align="center" :width="100" />
          <a-table-column title="处理时间" data-index="resolved_at" align="center" :width="160" />
          <a-table-column title="操作" align="center" :width="120">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="handleViewDetail(record)"
                >
                  详情
                </a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="text"
                  size="small"
                  status="success"
                  @click="handleResolve(record)"
                >
                  处理
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 预警详情模态框 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="预警详情"
      width="600px"
      :footer="false"
    >
      <div v-if="selectedRecord">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div style="margin-top: 20px">
          <h4>预警内容</h4>
          <a-textarea
            :model-value="selectedRecord.content"
            :rows="3"
            readonly
          />
        </div>

        <div v-if="selectedRecord.metadata" style="margin-top: 20px">
          <h4>详细信息</h4>
          <pre style="background: #f7f8fa; padding: 12px; border-radius: 4px; font-size: 12px;">{{ JSON.stringify(selectedRecord.metadata, null, 2) }}</pre>
        </div>
      </div>
    </a-modal>

    <!-- 处理预警模态框 -->
    <a-modal
      v-model:visible="resolveModalVisible"
      title="处理预警"
      width="500px"
      @ok="handleResolveSubmit"
      @cancel="handleResolveCancel"
    >
      <a-form :model="resolveForm" layout="vertical">
        <a-form-item label="处理结果" required>
          <a-textarea
            v-model="resolveForm.result"
            placeholder="请输入处理结果和说明"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="处理人" required>
          <a-input
            v-model="resolveForm.resolver"
            placeholder="请输入处理人姓名"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 趋势分析图表 -->
    <a-card title="预警趋势分析" style="margin-top: 20px">
      <div ref="trendChartRef" style="width: 100%; height: 400px;"></div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { IconDownload } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import * as echarts from 'echarts'

// 数据加载状态
const loading = ref(false)

// 筛选条件
const dateRange = ref([])
const statusFilter = ref('')
const typeFilter = ref('')

// 模态框状态
const detailModalVisible = ref(false)
const resolveModalVisible = ref(false)
const selectedRecord = ref(null)

// 处理表单
const resolveForm = reactive({
  result: '',
  resolver: ''
})

// 图表实例
const trendChartRef = ref()
let trendChart = null

// 统计数据
const statisticsData = ref({
  total: 156,
  pending: 12,
  resolved: 144,
  resolveRate: 92.3
})

// Mock预警历史数据
const alertHistory = ref([
  {
    id: '1',
    rule_id: '1',
    rule_name: '券库存低库存预警',
    alert_type: 'inventory',
    content: '券模板"新用户注册券"库存不足，当前剩余98个，低于设定阈值100个',
    status: 'resolved',
    triggered_at: '2024-01-15 14:30:25',
    resolved_at: '2024-01-15 14:45:12',
    resolved_by: '张三',
    metadata: {
      template_id: 'TPL001',
      template_name: '新用户注册券',
      current_stock: 98,
      threshold: 100,
      threshold_type: 'absolute'
    }
  },
  {
    id: '2',
    rule_id: '2',
    rule_name: '券即将过期预警',
    alert_type: 'expiry',
    content: '券模板"春节活动券"将在7天后过期，请及时处理',
    status: 'pending',
    triggered_at: '2024-01-15 10:15:30',
    resolved_at: null,
    resolved_by: null,
    metadata: {
      template_id: 'TPL002',
      template_name: '春节活动券',
      expiry_date: '2024-01-22',
      advance_days: 7
    }
  },
  {
    id: '3',
    rule_id: '3',
    rule_name: '券包发放失败率预警',
    alert_type: 'failure',
    content: '券包发放失败率达到15%，超过设定阈值10%，请检查发放系统',
    status: 'processing',
    triggered_at: '2024-01-15 09:45:18',
    resolved_at: null,
    resolved_by: '李四',
    metadata: {
      package_id: 'PKG001',
      package_name: '新春大礼包',
      failure_rate: 15,
      threshold: 10,
      time_window: '15min',
      total_attempts: 1000,
      failed_attempts: 150
    }
  },
  {
    id: '4',
    rule_id: '1',
    rule_name: '券库存低库存预警',
    alert_type: 'inventory',
    content: '券模板"会员专享券"库存不足，当前剩余45个，低于设定阈值50个',
    status: 'resolved',
    triggered_at: '2024-01-14 16:20:45',
    resolved_at: '2024-01-14 17:30:22',
    resolved_by: '王五',
    metadata: {
      template_id: 'TPL003',
      template_name: '会员专享券',
      current_stock: 45,
      threshold: 50,
      threshold_type: 'absolute'
    }
  },
  {
    id: '5',
    rule_id: '2',
    rule_name: '券即将过期预警',
    alert_type: 'expiry',
    content: '券模板"元旦特惠券"将在7天后过期，请及时处理',
    status: 'resolved',
    triggered_at: '2024-01-14 08:30:15',
    resolved_at: '2024-01-14 09:15:33',
    resolved_by: '赵六',
    metadata: {
      template_id: 'TPL004',
      template_name: '元旦特惠券',
      expiry_date: '2024-01-21',
      advance_days: 7
    }
  }
])

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let filtered = alertHistory.value

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  // 类型筛选
  if (typeFilter.value) {
    filtered = filtered.filter(item => item.alert_type === typeFilter.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.triggered_at)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return filtered
})

// 详情数据
const detailData = computed(() => {
  if (!selectedRecord.value) return []
  
  return [
    { label: '预警ID', value: selectedRecord.value.id },
    { label: '触发规则', value: selectedRecord.value.rule_name },
    { label: '预警类型', value: getTypeText(selectedRecord.value.alert_type) },
    { label: '触发时间', value: selectedRecord.value.triggered_at },
    { label: '处理状态', value: getStatusText(selectedRecord.value.status) },
    { label: '处理人', value: selectedRecord.value.resolved_by || '-' },
    { label: '处理时间', value: selectedRecord.value.resolved_at || '-' }
  ]
})

// 获取类型颜色
const getTypeColor = (type) => {
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red'
  }
  return colors[type] || 'gray'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '发放失败'
  }
  return texts[type] || '未知类型'
}



// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'red',
    processing: 'orange',
    resolved: 'green'
  }
  return colors[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理'
  }
  return texts[status] || '未知状态'
}

// 日期变化处理
const handleDateChange = (value) => {
  dateRange.value = value
}

// 状态筛选处理
const handleStatusFilter = (value) => {
  statusFilter.value = value
}

// 类型筛选处理
const handleTypeFilter = (value) => {
  typeFilter.value = value
}

// 导出记录
const handleExport = () => {
  Message.success('导出功能演示：将导出当前筛选的预警记录')
}

// 查看详情
const handleViewDetail = (record) => {
  selectedRecord.value = record
  detailModalVisible.value = true
}

// 处理预警
const handleResolve = (record) => {
  selectedRecord.value = record
  resolveForm.result = ''
  resolveForm.resolver = ''
  resolveModalVisible.value = true
}

// 提交处理结果
const handleResolveSubmit = () => {
  if (!resolveForm.result || !resolveForm.resolver) {
    Message.error('请填写完整的处理信息')
    return
  }

  // 更新记录状态
  const record = selectedRecord.value
  record.status = 'resolved'
  record.resolved_at = new Date().toLocaleString()
  record.resolved_by = resolveForm.resolver

  // 更新统计数据
  statisticsData.value.pending -= 1
  statisticsData.value.resolved += 1
  statisticsData.value.resolveRate = ((statisticsData.value.resolved / statisticsData.value.total) * 100).toFixed(1)

  resolveModalVisible.value = false
  Message.success('预警处理完成')
}

// 取消处理
const handleResolveCancel = () => {
  resolveModalVisible.value = false
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '预警趋势统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
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
      data: ['库存预警', '过期预警', '失败预警'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['01-10', '01-11', '01-12', '01-13', '01-14', '01-15', '01-16']
    },
    yAxis: {
      type: 'value',
      name: '预警次数'
    },
    series: [
      {
        name: '库存预警',
        type: 'line',
        data: [5, 8, 12, 6, 9, 15, 11],
        smooth: true,
        itemStyle: {
          color: '#165DFF'
        }
      },
      {
        name: '过期预警',
        type: 'line',
        data: [3, 5, 7, 4, 6, 8, 5],
        smooth: true,
        itemStyle: {
          color: '#FF7D00'
        }
      },
      {
        name: '失败预警',
        type: 'line',
        data: [2, 4, 3, 8, 5, 6, 4],
        smooth: true,
        itemStyle: {
          color: '#F53F3F'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

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
  }
})
</script>

<style scoped>
.alert-history-container {
  padding: 20px;
}

.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>