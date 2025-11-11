<template>
  <div class="value-evaluation">
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
          <a-form-item field="valueLevel" label="价值等级">
            <a-select v-model="searchForm.valueLevel" placeholder="全部" allow-clear>
              <a-option value="high">高价值</a-option>
              <a-option value="medium">中等价值</a-option>
              <a-option value="low">低价值</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="evaluationPeriod" label="评估周期">
            <a-select v-model="searchForm.evaluationPeriod" placeholder="全部" allow-clear>
              <a-option value="monthly">月度</a-option>
              <a-option value="quarterly">季度</a-option>
              <a-option value="yearly">年度</a-option>
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

    <!-- 价值评估列表 -->
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
      
      <template #valueLevel="{ record }">
        <a-tag :color="getValueColor(record.valueLevel)">
          {{ getValueText(record.valueLevel) }}
        </a-tag>
      </template>
      
      <template #valueScore="{ record }">
        <div class="score-display">
          <a-progress
            :percent="record.valueScore"
            :color="getScoreColor(record.valueScore)"
            size="small"
          />
          <span class="score-text">{{ record.valueScore }}分</span>
        </div>
      </template>
      
      <template #metrics="{ record }">
        <div class="metrics-display">
          <div class="metric-item">
            <span class="metric-label">业务价值:</span>
            <span class="metric-value">{{ record.businessValue }}分</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">成本效益:</span>
            <span class="metric-value">{{ record.costBenefit }}分</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">市场价值:</span>
            <span class="metric-value">{{ record.marketValue }}分</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">ROI:</span>
            <span class="metric-value">{{ record.roi }}%</span>
          </div>
        </div>
      </template>
      
      <template #cost="{ record }">
        <div class="cost-display">
          <div class="cost-item">
            <span class="cost-label">采购成本:</span>
            <span class="cost-value">¥{{ record.purchaseCost }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">使用成本:</span>
            <span class="cost-value">¥{{ record.usageCost }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">维护成本:</span>
            <span class="cost-value">¥{{ record.maintenanceCost }}</span>
          </div>
        </div>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewDetail(record)">
            详情
          </a-button>
          <a-button type="text" size="small" @click="viewReport(record)">
            报告
          </a-button>
          <a-button type="text" size="small" @click="compareValue(record)">
            对比
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
  valueLevel: '',
  evaluationPeriod: ''
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
    title: '价值等级',
    dataIndex: 'valueLevel',
    slotName: 'valueLevel',
    width: 100
  },
  {
    title: '综合评分',
    dataIndex: 'valueScore',
    slotName: 'valueScore',
    width: 150
  },
  {
    title: '价值指标',
    dataIndex: 'metrics',
    slotName: 'metrics',
    width: 200
  },
  {
    title: '成本分析',
    dataIndex: 'cost',
    slotName: 'cost',
    width: 180
  },
  {
    title: '评估周期',
    dataIndex: 'evaluationPeriod',
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
    valueLevel: 'high',
    valueScore: 88,
    businessValue: 92,
    costBenefit: 85,
    marketValue: 87,
    roi: 320,
    purchaseCost: 50000,
    usageCost: 12000,
    maintenanceCost: 8000,
    evaluationPeriod: '季度',
    evaluationTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataProduct: '信用评分查询',
    interfaceId: 'EXT002',
    valueLevel: 'medium',
    valueScore: 72,
    businessValue: 78,
    costBenefit: 68,
    marketValue: 70,
    roi: 180,
    purchaseCost: 80000,
    usageCost: 25000,
    maintenanceCost: 15000,
    evaluationPeriod: '月度',
    evaluationTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    dataProduct: '用户画像标签',
    interfaceId: 'EXT003',
    valueLevel: 'high',
    valueScore: 85,
    businessValue: 88,
    costBenefit: 82,
    marketValue: 85,
    roi: 275,
    purchaseCost: 60000,
    usageCost: 18000,
    maintenanceCost: 10000,
    evaluationPeriod: '季度',
    evaluationTime: '2024-02-01 09:15:00'
  },
  {
    id: 4,
    dataProduct: '风险名单核验',
    interfaceId: 'EXT004',
    valueLevel: 'low',
    valueScore: 58,
    businessValue: 65,
    costBenefit: 52,
    marketValue: 55,
    roi: 120,
    purchaseCost: 30000,
    usageCost: 8000,
    maintenanceCost: 5000,
    evaluationPeriod: '月度',
    evaluationTime: '2024-02-10 16:45:00'
  }
]

// 价值等级相关方法
const getValueColor = (level) => {
  const colors = {
    high: 'green',
    medium: 'orange',
    low: 'red'
  }
  return colors[level] || 'gray'
}

const getValueText = (level) => {
  const texts = {
    high: '高价值',
    medium: '中等价值',
    low: '低价值'
  }
  return texts[level] || level
}

const getScoreColor = (score) => {
  if (score >= 80) return 'green'
  if (score >= 60) return 'orange'
  return 'red'
}

// 搜索和筛选
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = mockData
    
    if (searchForm.dataProduct) {
      filteredData = filteredData.filter(item => item.dataProduct === searchForm.dataProduct)
    }
    
    if (searchForm.valueLevel) {
      filteredData = filteredData.filter(item => item.valueLevel === searchForm.valueLevel)
    }
    
    if (searchForm.evaluationPeriod) {
      filteredData = filteredData.filter(item => item.evaluationPeriod === getPeriodText(searchForm.evaluationPeriod))
    }
    
    tableData.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 300)
}

const handleReset = () => {
  Object.assign(searchForm, {
    dataProduct: '',
    valueLevel: '',
    evaluationPeriod: ''
  })
  handleSearch()
}

const getPeriodText = (period) => {
  const texts = {
    monthly: '月度',
    quarterly: '季度',
    yearly: '年度'
  }
  return texts[period] || period
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 行操作
const viewDetail = (record) => {
  Message.info(`查看价值详情: ${record.dataProduct}`)
}

const viewReport = (record) => {
  Message.info(`查看价值报告: ${record.dataProduct}`)
}

const compareValue = (record) => {
  Message.info(`价值对比: ${record.dataProduct}`)
}

// 初始化
handleSearch()
</script>

<style scoped lang="less">
.value-evaluation {
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

  .cost-display {
    .cost-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .cost-label {
        color: var(--color-text-3);
        font-size: 12px;
      }
      
      .cost-value {
        font-weight: 500;
        color: var(--color-text-1);
        font-size: 12px;
      }
    }
  }
}
</style>