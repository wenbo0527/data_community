<template>
  <div class="risk-evaluation">
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
          <a-form-item field="riskLevel" label="风险等级">
            <a-select v-model="searchForm.riskLevel" placeholder="全部" allow-clear>
              <a-option value="low">低风险</a-option>
              <a-option value="medium">中等风险</a-option>
              <a-option value="high">高风险</a-option>
              <a-option value="critical">极高风险</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="riskType" label="风险类型">
            <a-select v-model="searchForm.riskType" placeholder="全部" allow-clear>
              <a-option value="data">数据风险</a-option>
              <a-option value="compliance">合规风险</a-option>
              <a-option value="technical">技术风险</a-option>
              <a-option value="operational">操作风险</a-option>
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

    <!-- 风险评估列表 -->
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
      
      <template #riskLevel="{ record }">
        <a-tag :color="getRiskColor(record.riskLevel)">
          {{ getRiskText(record.riskLevel) }}
        </a-tag>
      </template>
      
      <template #riskType="{ record }">
        <a-tag :color="getTypeColor(record.riskType)">
          {{ getTypeText(record.riskType) }}
        </a-tag>
      </template>
      
      <template #riskScore="{ record }">
        <div class="score-display">
          <a-progress
            :percent="record.riskScore"
            :color="getScoreColor(record.riskScore)"
            size="small"
          />
          <span class="score-text">{{ record.riskScore }}分</span>
        </div>
      </template>
      
      <template #metrics="{ record }">
        <div class="metrics-display">
          <div class="metric-item">
            <span class="metric-label">影响度:</span>
            <span class="metric-value">{{ record.impact }}分</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">可能性:</span>
            <span class="metric-value">{{ record.probability }}分</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">可控性:</span>
            <span class="metric-value">{{ record.controllability }}分</span>
          </div>
        </div>
      </template>
      
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewDetail(record)">
            详情
          </a-button>
          <a-button type="text" size="small" @click="viewReport(record)">
            报告
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="handleRisk(record)"
            v-if="record.status === 'unhandled'"
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
  riskLevel: '',
  riskType: ''
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
    title: '风险等级',
    dataIndex: 'riskLevel',
    slotName: 'riskLevel',
    width: 100
  },
  {
    title: '风险类型',
    dataIndex: 'riskType',
    slotName: 'riskType',
    width: 120
  },
  {
    title: '风险评分',
    dataIndex: 'riskScore',
    slotName: 'riskScore',
    width: 150
  },
  {
    title: '评估指标',
    dataIndex: 'metrics',
    slotName: 'metrics',
    width: 180
  },
  {
    title: '处理状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '评估时间',
    dataIndex: 'evaluationTime',
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
    riskLevel: 'low',
    riskType: 'data',
    riskScore: 25,
    impact: 3,
    probability: 2,
    controllability: 8,
    status: 'handled',
    evaluationTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataProduct: '信用评分查询',
    interfaceId: 'EXT002',
    riskLevel: 'medium',
    riskType: 'compliance',
    riskScore: 55,
    impact: 6,
    probability: 5,
    controllability: 6,
    status: 'unhandled',
    evaluationTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    dataProduct: '用户画像标签',
    interfaceId: 'EXT003',
    riskLevel: 'high',
    riskType: 'technical',
    riskScore: 75,
    impact: 8,
    probability: 7,
    controllability: 4,
    status: 'unhandled',
    evaluationTime: '2024-02-01 09:15:00'
  },
  {
    id: 4,
    dataProduct: '风险名单核验',
    interfaceId: 'EXT004',
    riskLevel: 'critical',
    riskType: 'operational',
    riskScore: 88,
    impact: 9,
    probability: 8,
    controllability: 2,
    status: 'handled',
    evaluationTime: '2024-02-10 16:45:00'
  }
]

// 风险等级相关方法
const getRiskColor = (level) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'red'
  }
  return colors[level] || 'gray'
}

const getRiskText = (level) => {
  const texts = {
    low: '低风险',
    medium: '中等风险',
    high: '高风险',
    critical: '极高风险'
  }
  return texts[level] || level
}

const getTypeColor = (type) => {
  const colors = {
    data: 'blue',
    compliance: 'orange',
    technical: 'purple',
    operational: 'red'
  }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = {
    data: '数据风险',
    compliance: '合规风险',
    technical: '技术风险',
    operational: '操作风险'
  }
  return texts[type] || type
}

const getScoreColor = (score) => {
  if (score <= 30) return 'green'
  if (score <= 60) return 'orange'
  if (score <= 80) return 'red'
  return 'red'
}

const getStatusColor = (status) => {
  const colors = {
    handled: 'green',
    unhandled: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    handled: '已处理',
    unhandled: '待处理'
  }
  return texts[status] || status
}

// 搜索和筛选
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = mockData
    
    if (searchForm.dataProduct) {
      filteredData = filteredData.filter(item => item.dataProduct === searchForm.dataProduct)
    }
    
    if (searchForm.riskLevel) {
      filteredData = filteredData.filter(item => item.riskLevel === searchForm.riskLevel)
    }
    
    if (searchForm.riskType) {
      filteredData = filteredData.filter(item => item.riskType === searchForm.riskType)
    }
    
    tableData.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 300)
}

const handleReset = () => {
  Object.assign(searchForm, {
    dataProduct: '',
    riskLevel: '',
    riskType: ''
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 行操作
const viewDetail = (record) => {
  Message.info(`查看风险详情: ${record.dataProduct}`)
}

const viewReport = (record) => {
  Message.info(`查看风险报告: ${record.dataProduct}`)
}

const handleRisk = (record) => {
  Message.info(`处理风险: ${record.dataProduct}`)
  // 模拟处理风险
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tableData.value[index].status = 'handled'
  }
}

// 初始化
handleSearch()
</script>

<style scoped lang="less">
.risk-evaluation {
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

  .score-display {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .score-text {
      font-weight: 500;
      color: var(--color-text-1);
      font-size: 12px;
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
        font-size: 12px;
      }
    }
  }
}
</style>