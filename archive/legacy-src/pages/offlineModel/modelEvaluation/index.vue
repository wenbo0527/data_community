<template>
  <div class="model-evaluation-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>模型评估</h2>
        <span class="page-subtitle">评估和分析模型性能</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button type="primary" @click="handleCreateEvaluation">
            <template #icon>
              <icon-plus />
            </template>
            新建评估
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 评估概览 -->
    <div class="overview-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="模型性能概览" class="overview-card">
            <div class="metric-item">
              <span class="metric-label">平均准确率</span>
              <span class="metric-value">85.6%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">平均召回率</span>
              <span class="metric-value">78.3%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">平均F1分数</span>
              <span class="metric-value">81.7%</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="模型稳定性" class="overview-card">
            <div class="metric-item">
              <span class="metric-label">稳定性评分</span>
              <span class="metric-value">92.1</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">漂移检测</span>
              <span class="metric-value">正常</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">异常告警</span>
              <span class="metric-value">3个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="业务指标" class="overview-card">
            <div class="metric-item">
              <span class="metric-label">业务准确率</span>
              <span class="metric-value">89.2%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">覆盖率</span>
              <span class="metric-value">95.7%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">响应时间</span>
              <span class="metric-value">120ms</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="模型名称">
            <a-input
              v-model="filterForm.modelName"
              placeholder="请输入模型名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item label="评估类型">
            <a-select
              v-model="filterForm.evaluationType"
              placeholder="请选择评估类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="performance">性能评估</a-option>
              <a-option value="stability">稳定性评估</a-option>
              <a-option value="fairness">公平性评估</a-option>
              <a-option value="business">业务评估</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="评估时间">
            <a-range-picker
              v-model="filterForm.dateRange"
              style="width: 240px"
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 评估结果表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <span>评估记录</span>
          </div>
        </template>
        
        <a-table
          :data="evaluationList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #modelName="{ record }">
            <a-link @click="handleViewModel(record)">{{ record.modelName }}</a-link>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          
          <template #score="{ record }">
            <span :style="{ color: getScoreColor(record.score) }">
              {{ record.score }}
            </span>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #evaluationTime="{ record }">
            {{ formatDate(record.evaluationTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看详情
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineModelStore } from '@/stores/offlineModel'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const store = useOfflineModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  modelName: '',
  evaluationType: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '模型名称',
    dataIndex: 'modelName',
    slotName: 'modelName',
    width: 200
  },
  {
    title: '评估类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '评估得分',
    dataIndex: 'score',
    slotName: 'score',
    width: 100
  },
  {
    title: '评估指标',
    dataIndex: 'metrics',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '评估时间',
    dataIndex: 'evaluationTime',
    slotName: 'evaluationTime',
    width: 180
  },
  {
    title: '评估人',
    dataIndex: 'evaluator',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性
const evaluationList = computed(() => store.getEvaluations)

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取数据
    // await store.fetchEvaluations({
    //   ...filterForm,
    //   page: pagination.current,
    //   pageSize: pagination.pageSize
    // })
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        modelName: '信用评分模型',
        type: 'performance',
        score: 85.6,
        metrics: '准确率: 85.6%, 召回率: 78.3%, F1: 81.7%',
        status: 'completed',
        evaluationTime: '2024-01-15 10:30:00',
        evaluator: '张三'
      },
      {
        id: 2,
        modelName: '风险预测模型',
        type: 'stability',
        score: 92.1,
        metrics: '稳定性评分: 92.1, 漂移检测: 正常',
        status: 'completed',
        evaluationTime: '2024-01-16 14:20:00',
        evaluator: '李四'
      }
    ]
    
    store.setEvaluations(mockData)
    pagination.total = mockData.length
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.modelName = ''
  filterForm.evaluationType = ''
  filterForm.dateRange = []
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleCreateEvaluation = () => {
  router.push('/offline-model/model-evaluation/create')
}

 

const handleViewModel = (record) => {
  router.push(`/offline-model/model-register/detail/${record.modelId}`)
}

const handleViewDetail = (record) => {
  router.push(`/offline-model/model-evaluation/detail/${record.id}`)
}

 

const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    performance: 'blue',
    stability: 'green',
    fairness: 'orange',
    business: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    performance: '性能评估',
    stability: '稳定性评估',
    fairness: '公平性评估',
    business: '业务评估'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    running: 'blue',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '已完成',
    running: '进行中',
    failed: '失败'
  }
  return labels[status] || status
}

const getScoreColor = (score) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#faad14'
  return '#ff4d4f'
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleString('zh-CN') : '-'
}
</script>

<style scoped lang="less">
.model-evaluation-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      
      .page-subtitle {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .overview-section {
    margin-bottom: 24px;
    
    .overview-card {
      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .metric-label {
          color: #666;
          font-size: 14px;
        }
        
        .metric-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
    }
  }
  
  .filter-section {
    margin-bottom: 24px;
  }
  
  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
