<template>
  <div class="monitoring-evaluation">
    <!-- 搜索和筛选 -->
    <a-form :model="searchForm" layout="inline" class="search-form">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item field="dataProduct" label="数据产品">
            <a-select v-model="searchForm.dataProduct" placeholder="全部" allow-clear>
              <a-option value="身份信息核验服务">身份信息核验服务</a-option>
              <a-option value="信用评分查询">信用评分查询</a-option>
              <a-option value="用户画像标签">用户画像标签</a-option>
              <a-option value="风险名单核验">风险名单核验</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="period" label="监控周期">
            <a-select v-model="searchForm.period" placeholder="全部" allow-clear>
              <a-option value="daily">日度</a-option>
              <a-option value="weekly">周度</a-option>
              <a-option value="monthly">月度</a-option>
              <a-option value="quarterly">季度</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="status" label="监控状态">
            <a-select v-model="searchForm.status" placeholder="全部" allow-clear>
              <a-option value="normal">正常</a-option>
              <a-option value="warning">预警</a-option>
              <a-option value="abnormal">异常</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- 监控列表 -->
    <a-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <template #dataProduct="{ record }">
        <div class="product-info">
          <div class="product-name">{{ record.dataProduct }}</div>
          <div class="product-id">{{ record.interfaceId }}</div>
        </div>
      </template>
      
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      
      <template #metrics="{ record }">
        <div class="metrics-display">
          <div class="metric-item">
            <span class="metric-label">准确率:</span>
            <span class="metric-value">{{ record.accuracy }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">覆盖率:</span>
            <span class="metric-value">{{ record.coverage }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">响应时间:</span>
            <span class="metric-value">{{ record.responseTime }}ms</span>
          </div>
        </div>
      </template>
      
      <template #trend="{ record }">
        <div class="trend-display">
          <a-progress 
            :percent="record.trendScore" 
            :color="getTrendColor(record.trendScore)"
            size="small"
          />
          <span class="trend-text">{{ getTrendText(record.trendScore) }}</span>
        </div>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewDetail(record)">
            详情
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="viewReport(record)"
          >
            报告
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="handleAlert(record)"
            v-if="record.status === 'warning' || record.status === 'abnormal'"
          >
            处理
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

// 搜索表单
const searchForm = reactive({
  dataProduct: '',
  period: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true
})

// 表格列配置
const columns = [
  {
    title: '数据产品',
    dataIndex: 'dataProduct',
    slotName: 'dataProduct',
    width: 200
  },
  {
    title: '监控周期',
    dataIndex: 'period',
    width: 100
  },
  {
    title: '监控状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '关键指标',
    dataIndex: 'metrics',
    slotName: 'metrics',
    width: 200
  },
  {
    title: '趋势评分',
    dataIndex: 'trendScore',
    slotName: 'trend',
    width: 150
  },
  {
    title: '监控时间',
    dataIndex: 'monitorTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    fixed: 'right',
    width: 150
  }
]

// 模拟数据
const mockData = [
  {
    id: 1,
    dataProduct: '身份信息核验服务',
    interfaceId: 'EXT001',
    period: '日度',
    status: 'normal',
    accuracy: 98.5,
    coverage: 95.2,
    responseTime: 120,
    trendScore: 85,
    monitorTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataProduct: '信用评分查询',
    interfaceId: 'EXT002',
    period: '周度',
    status: 'warning',
    accuracy: 92.3,
    coverage: 88.7,
    responseTime: 180,
    trendScore: 65,
    monitorTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    dataProduct: '用户画像标签',
    interfaceId: 'EXT003',
    period: '月度',
    status: 'normal',
    accuracy: 96.8,
    coverage: 91.5,
    responseTime: 95,
    trendScore: 78,
    monitorTime: '2024-02-01 09:15:00'
  },
  {
    id: 4,
    dataProduct: '风险名单核验',
    interfaceId: 'EXT004',
    period: '日度',
    status: 'abnormal',
    accuracy: 87.2,
    coverage: 82.1,
    responseTime: 250,
    trendScore: 45,
    monitorTime: '2024-02-10 16:45:00'
  }
]

// 状态相关方法
const getStatusColor = (status) => {
  const colors = {
    normal: 'green',
    warning: 'orange',
    abnormal: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    normal: '正常',
    warning: '预警',
    abnormal: '异常'
  }
  return texts[status] || status
}

const getTrendColor = (score) => {
  if (score >= 80) return 'green'
  if (score >= 60) return 'orange'
  return 'red'
}

const getTrendText = (score) => {
  if (score >= 80) return '优秀'
  if (score >= 60) return '良好'
  return '需改进'
}

// 搜索和筛选
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = mockData
    
    if (searchForm.dataProduct) {
      filteredData = filteredData.filter(item => item.dataProduct === searchForm.dataProduct)
    }
    
    if (searchForm.period) {
      filteredData = filteredData.filter(item => item.period === getPeriodText(searchForm.period))
    }
    
    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }
    
    tableData.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 300)
}

const handleReset = () => {
  Object.assign(searchForm, {
    dataProduct: '',
    period: '',
    status: ''
  })
  handleSearch()
}

const getPeriodText = (period) => {
  const texts = {
    daily: '日度',
    weekly: '周度',
    monthly: '月度',
    quarterly: '季度'
  }
  return texts[period] || period
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 行操作
const viewDetail = (record) => {
  Message.info(`查看监控详情: ${record.dataProduct}`)
}

const viewReport = (record) => {
  Message.info(`查看监控报告: ${record.dataProduct}`)
}

const handleAlert = (record) => {
  Message.info(`处理预警: ${record.dataProduct}`)
}

// 初始化
handleSearch()
</script>

<style scoped lang="less">
.monitoring-evaluation {
  .search-form {
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--color-fill-2);
    border-radius: 6px;
  }

  .product-info {
    .product-name {
      font-weight: 500;
      color: var(--color-text-1);
      margin-bottom: 4px;
    }
    
    .product-id {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .metrics-display {
    .metric-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .metric-label {
        color: var(--color-text-3);
        font-size: 12px;
      }
      
      .metric-value {
        font-weight: 500;
        color: var(--color-text-1);
      }
    }
  }

  .trend-display {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .trend-text {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}
</style>