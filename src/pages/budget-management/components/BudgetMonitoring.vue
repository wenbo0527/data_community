<template>
  <div class="budget-monitoring">
    <!-- 搜索和筛选 -->
    <a-row :gutter="16" class="search-section">
      <a-col :span="6">
        <a-select v-model="searchForm.period" placeholder="监控周期" allow-clear>
          <a-option value="">全部周期</a-option>
          <a-option value="monthly">月度</a-option>
          <a-option value="quarterly">季度</a-option>
          <a-option value="yearly">年度</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-select v-model="searchForm.warningLevel" placeholder="预警级别" allow-clear>
          <a-option value="">全部级别</a-option>
          <a-option value="normal">正常</a-option>
          <a-option value="warning">轻度预警</a-option>
          <a-option value="serious">严重预警</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
      </a-col>
      <a-col :span="6">
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-col>
    </a-row>

    <!-- 监控指标卡片 -->
    <a-row :gutter="16" class="monitoring-cards">
      <a-col :span="6">
        <a-card class="monitor-card">
          <div class="monitor-content">
            <div class="monitor-icon">
              <IconExclamationCircle />
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ monitoringStats.warningCount }}</div>
              <div class="monitor-label">预警数量</div>
              <div class="monitor-trend">
                <span :class="monitoringStats.warningTrend > 0 ? 'trend-up' : 'trend-down'">
                  {{ monitoringStats.warningTrend > 0 ? '↑' : '↓' }} {{ Math.abs(monitoringStats.warningTrend) }}%
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="monitor-card">
          <div class="monitor-content">
            <div class="monitor-icon">
              <IconClockCircle />
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ monitoringStats.overdueCount }}</div>
              <div class="monitor-label">超期项目</div>
              <div class="monitor-trend">
                <span :class="monitoringStats.overdueTrend > 0 ? 'trend-up' : 'trend-down'">
                  {{ monitoringStats.overdueTrend > 0 ? '↑' : '↓' }} {{ Math.abs(monitoringStats.overdueTrend) }}%
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="monitor-card">
          <div class="monitor-content">
            <div class="monitor-icon">
              <IconExclamationCircle />
            </div>
            <div class="monitor-info">
              <div class="monitor-value">¥{{ formatAmount(monitoringStats.totalOverrun) }}</div>
              <div class="monitor-label">总超支金额</div>
              <div class="monitor-trend">
                <span :class="monitoringStats.overrunTrend > 0 ? 'trend-up' : 'trend-down'">
                  {{ monitoringStats.overrunTrend > 0 ? '↑' : '↓' }} {{ Math.abs(monitoringStats.overrunTrend) }}%
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="monitor-card">
          <div class="monitor-content">
            <div class="monitor-icon">
              <IconCheckCircle />
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ monitoringStats.completionRate }}%</div>
              <div class="monitor-label">完成率</div>
              <div class="monitor-trend">
                <span :class="monitoringStats.completionTrend > 0 ? 'trend-up' : 'trend-down'">
                  {{ monitoringStats.completionTrend > 0 ? '↑' : '↓' }} {{ Math.abs(monitoringStats.completionTrend) }}%
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 监控列表 -->
    <a-card class="monitor-table-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <span>预算监控列表</span>
          <a-space>
            <a-button type="outline" size="small" @click="showTrendModal = true">
              <template #icon><IconBarChart /></template>
              趋势分析
            </a-button>
            <a-button type="outline" size="small" @click="exportMonitoringData">
              <template #icon><IconDownload /></template>
              导出数据
            </a-button>
          </a-space>
        </div>
      </template>
      
      <a-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #budgetAmount="{ record }">
          <span>¥{{ formatAmount(record.budgetAmount) }}</span>
        </template>
        
        <template #actualAmount="{ record }">
          <span>¥{{ formatAmount(record.actualAmount) }}</span>
        </template>
        
        <template #overrunAmount="{ record }">
          <span :style="{ color: record.overrunAmount > 0 ? '#f53f3f' : '#14c9c9' }">
            ¥{{ formatAmount(record.overrunAmount) }}
          </span>
        </template>
        
        <template #overrunRate="{ record }">
          <span :style="{ color: getOverrunColor(record.overrunRate) }">
            {{ record.overrunRate }}%
          </span>
        </template>
        
        <template #warningLevel="{ record }">
          <a-tag :color="getWarningColor(record.warningLevel)">
            {{ getWarningText(record.warningLevel) }}
          </a-tag>
        </template>
        
        <template #status="{ record }">
          <a-badge :status="getStatusType(record.status)" :text="getStatusText(record.status)" />
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-button type="text" size="small" @click="viewTrend(record)">
              趋势
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              status="warning" 
              @click="handleWarning(record)"
              v-if="record.warningLevel !== 'normal'"
            >
              处理预警
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 趋势分析弹窗 -->
    <a-modal
      v-model:visible="showTrendModal"
      title="预算趋势分析"
      width="1000px"
      @ok="showTrendModal = false"
      @cancel="showTrendModal = false"
    >
      <a-row :gutter="16">
        <a-col :span="16">
          <div class="trend-chart">
            <canvas ref="monitoringChart" width="600" height="300"></canvas>
          </div>
        </a-col>
        <a-col :span="8">
          <a-card title="监控指标" size="small">
            <a-space direction="vertical" style="width: 100%">
              <div class="metric-item">
                <span>平均超支率</span>
                <span class="metric-value">12.5%</span>
              </div>
              <div class="metric-item">
                <span>预警准确率</span>
                <span class="metric-value">89.2%</span>
              </div>
              <div class="metric-item">
                <span>处理及时率</span>
                <span class="metric-value">95.8%</span>
              </div>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconExclamationCircle, 
  IconClockCircle, 
  IconCheckCircle,
  IconDownload 
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  period: '',
  warningLevel: '',
  dateRange: []
})

// 监控统计
const monitoringStats = reactive({
  warningCount: 15,
  warningTrend: -12.5,
  overdueCount: 8,
  overdueTrend: 5.2,
  totalOverrun: 2850000,
  overrunTrend: 8.7,
  completionRate: 78.5,
  completionTrend: 2.3
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 40,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: false
})

// 表格列定义
const columns = [
  {
    title: '预算编号',
    dataIndex: 'code',
    width: 120
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    width: 100
  },
  {
    title: '平台产品',
    dataIndex: 'platformProduct',
    width: 120
  },
  {
    title: '监控周期',
    dataIndex: 'monitoringPeriod',
    width: 100
  },
  {
    title: '预算金额(万元)',
    dataIndex: 'budgetAmount',
    slotName: 'budgetAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '实际金额(万元)',
    dataIndex: 'actualAmount',
    slotName: 'actualAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '超支金额(万元)',
    dataIndex: 'overrunAmount',
    slotName: 'overrunAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '超支率(%)',
    dataIndex: 'overrunRate',
    slotName: 'overrunRate',
    width: 100,
    align: 'right'
  },
  {
    title: '预警级别',
    dataIndex: 'warningLevel',
    slotName: 'warningLevel',
    width: 100,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '监控时间',
    dataIndex: 'monitoringTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 弹窗状态
const showTrendModal = ref(false)

// 图表引用
const monitoringChart = ref(null)

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 获取超支率颜色
const getOverrunColor = (rate) => {
  if (rate > 20) return '#f53f3f'
  if (rate > 10) return '#ff7d00'
  if (rate > 0) return '#ffc107'
  return '#14c9c9'
}

// 获取预警颜色
const getWarningColor = (level) => {
  const colorMap = {
    'normal': 'green',
    'warning': 'orange',
    'serious': 'red'
  }
  return colorMap[level] || 'gray'
}

// 获取预警文本
const getWarningText = (level) => {
  const textMap = {
    'normal': '正常',
    'warning': '轻度预警',
    'serious': '严重预警'
  }
  return textMap[level] || level
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'normal': 'success',
    'warning': 'warning',
    'overrun': 'danger'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'normal': '正常',
    'warning': '预警中',
    'overrun': '超支'
  }
  return textMap[status] || status
}

// 模拟数据
const generateMockData = () => {
  const warningLevels = ['normal', 'warning', 'serious']
  const statuses = ['normal', 'warning', 'overrun']
  const businessTypes = ['信贷业务', '风控业务', '营销业务', '运营业务']
  const platformProducts = ['产品A', '产品B', '产品C', '产品D']
  const periods = ['月度', '季度', '年度']
  
  const data = []
  for (let i = 0; i < 40; i++) {
    const budgetAmount = Math.floor(Math.random() * 10000000) + 1000000
    const actualAmount = budgetAmount * (0.8 + Math.random() * 0.5)
    const overrunAmount = actualAmount - budgetAmount
    const overrunRate = ((overrunAmount / budgetAmount) * 100).toFixed(2)
    
    data.push({
      id: i + 1,
      code: `BM${String(i + 1).padStart(4, '0')}`,
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      platformProduct: platformProducts[Math.floor(Math.random() * platformProducts.length)],
      monitoringPeriod: periods[Math.floor(Math.random() * periods.length)],
      budgetAmount,
      actualAmount: Math.floor(actualAmount),
      overrunAmount: Math.floor(overrunAmount),
      overrunRate,
      warningLevel: warningLevels[Math.floor(Math.random() * warningLevels.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      monitoringTime: '2024-01-15 14:30:00'
    })
  }
  return data
}

// 搜索处理
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let data = generateMockData()
    
    // 应用筛选条件
    if (searchForm.period) {
      data = data.filter(item => {
        const periodMap = { 'monthly': '月度', 'quarterly': '季度', 'yearly': '年度' }
        return item.monitoringPeriod === periodMap[searchForm.period]
      })
    }
    if (searchForm.warningLevel) {
      data = data.filter(item => item.warningLevel === searchForm.warningLevel)
    }
    
    tableData.value = data.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    )
    pagination.total = data.length
    loading.value = false
  }, 500)
}

// 重置处理
const handleReset = () => {
  searchForm.period = ''
  searchForm.warningLevel = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  handleSearch()
}

// 查看详情
const viewDetail = (record) => {
  Message.info(`查看监控详情: ${record.code}`)
}

// 查看趋势
const viewTrend = (record) => {
  Message.info(`查看趋势: ${record.code}`)
}

// 处理预警
const handleWarning = (record) => {
  Message.info(`处理预警: ${record.code}`)
}

// 导出监控数据
const exportMonitoringData = () => {
  Message.success('监控数据导出成功')
}

// 绘制图表
const drawCharts = () => {
  if (monitoringChart.value) {
    const ctx = monitoringChart.value.getContext('2d')
    
    // 简单的趋势图
    ctx.fillStyle = '#14c9c9'
    ctx.fillRect(10, 50, 580, 200)
    
    // 添加一些数据点
    ctx.fillStyle = '#ff7d00'
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.arc(50 + i * 50, 100 + Math.random() * 100, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// 组件挂载时初始化
onMounted(() => {
  handleSearch()
  drawCharts()
})
</script>

<style scoped lang="less">
.budget-monitoring {
  .search-section {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }
  
  .monitoring-cards {
    margin-bottom: 24px;
    
    .monitor-card {
      border-radius: 8px;
      
      .monitor-content {
        display: flex;
        align-items: center;
        padding: 16px;
        
        .monitor-icon {
          font-size: 32px;
          color: var(--color-primary-6);
          margin-right: 16px;
        }
        
        .monitor-info {
          flex: 1;
          
          .monitor-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }
          
          .monitor-label {
            font-size: 14px;
            color: var(--color-text-3);
            margin-bottom: 4px;
          }
          
          .monitor-trend {
            font-size: 12px;
            
            .trend-up {
              color: #f53f3f;
            }
            
            .trend-down {
              color: #00b42a;
            }
          }
        }
      }
    }
  }
  
  .monitor-table-card {
    border-radius: 8px;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .trend-chart {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-fill-2);
    border-radius: 4px;
  }
  
  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border-2);
    
    &:last-child {
      border-bottom: none;
    }
    
    .metric-value {
      font-weight: 600;
      color: var(--color-primary-6);
    }
  }
}
</style>