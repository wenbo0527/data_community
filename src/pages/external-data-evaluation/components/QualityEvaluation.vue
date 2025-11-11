<template>
  <div class="quality-evaluation">
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
          <a-form-item field="qualityLevel" label="质量等级">
            <a-select v-model="searchForm.qualityLevel" placeholder="全部" allow-clear>
              <a-option value="excellent">优秀</a-option>
              <a-option value="good">良好</a-option>
              <a-option value="average">一般</a-option>
              <a-option value="poor">较差</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="evaluationDate" label="评估日期">
            <a-range-picker v-model="searchForm.evaluationDate" style="width: 100%" />
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

    <!-- 质量评估列表 -->
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
      
      <template #qualityLevel="{ record }">
        <a-tag :color="getQualityColor(record.qualityLevel)">
          {{ getQualityText(record.qualityLevel) }}
        </a-tag>
      </template>
      
      <template #qualityScore="{ record }">
        <div class="score-display">
          <a-progress
            :percent="record.qualityScore"
            :color="getScoreColor(record.qualityScore)"
            size="small"
          />
          <span class="score-text">{{ record.qualityScore }}分</span>
        </div>
      </template>
      
      <template #metrics="{ record }">
        <div class="metrics-display">
          <div class="metric-item">
            <span class="metric-label">准确性:</span>
            <span class="metric-value">{{ record.accuracy }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">完整性:</span>
            <span class="metric-value">{{ record.completeness }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">一致性:</span>
            <span class="metric-value">{{ record.consistency }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">及时性:</span>
            <span class="metric-value">{{ record.timeliness }}%</span>
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
          <a-button type="text" size="small" @click="compareQuality(record)">
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
  qualityLevel: '',
  evaluationDate: []
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
    title: '质量等级',
    dataIndex: 'qualityLevel',
    slotName: 'qualityLevel',
    width: 100
  },
  {
    title: '综合评分',
    dataIndex: 'qualityScore',
    slotName: 'qualityScore',
    width: 150
  },
  {
    title: '关键指标',
    dataIndex: 'metrics',
    slotName: 'metrics',
    width: 200
  },
  {
    title: '评估人',
    dataIndex: 'evaluator',
    width: 120
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
    qualityLevel: 'excellent',
    qualityScore: 92,
    accuracy: 98.5,
    completeness: 95.2,
    consistency: 97.8,
    timeliness: 99.1,
    evaluator: '张评估师',
    evaluationTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataProduct: '信用评分查询',
    interfaceId: 'EXT002',
    qualityLevel: 'good',
    qualityScore: 85,
    accuracy: 94.2,
    completeness: 88.7,
    consistency: 91.3,
    timeliness: 95.8,
    evaluator: '李评估师',
    evaluationTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    dataProduct: '用户画像标签',
    interfaceId: 'EXT003',
    qualityLevel: 'average',
    qualityScore: 78,
    accuracy: 89.5,
    completeness: 82.1,
    consistency: 85.7,
    timeliness: 88.9,
    evaluator: '王评估师',
    evaluationTime: '2024-02-01 09:15:00'
  },
  {
    id: 4,
    dataProduct: '风险名单核验',
    interfaceId: 'EXT004',
    qualityLevel: 'poor',
    qualityScore: 65,
    accuracy: 82.3,
    completeness: 75.8,
    consistency: 78.2,
    timeliness: 81.6,
    evaluator: '赵评估师',
    evaluationTime: '2024-02-10 16:45:00'
  }
]

// 质量等级相关方法
const getQualityColor = (level) => {
  const colors = {
    excellent: 'green',
    good: 'arcoblue',
    average: 'orange',
    poor: 'red'
  }
  return colors[level] || 'gray'
}

const getQualityText = (level) => {
  const texts = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    poor: '较差'
  }
  return texts[level] || level
}

const getScoreColor = (score) => {
  if (score >= 90) return 'green'
  if (score >= 80) return 'arcoblue'
  if (score >= 70) return 'orange'
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
    
    if (searchForm.qualityLevel) {
      filteredData = filteredData.filter(item => item.qualityLevel === searchForm.qualityLevel)
    }
    
    // 日期筛选逻辑可以在这里添加
    
    tableData.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 300)
}

const handleReset = () => {
  Object.assign(searchForm, {
    dataProduct: '',
    qualityLevel: '',
    evaluationDate: []
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 行操作
const viewDetail = (record) => {
  Message.info(`查看质量详情: ${record.dataProduct}`)
}

const viewReport = (record) => {
  Message.info(`查看质量报告: ${record.dataProduct}`)
}

const compareQuality = (record) => {
  Message.info(`质量对比: ${record.dataProduct}`)
}

// 初始化
handleSearch()
</script>

<style scoped lang="less">
.quality-evaluation {
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