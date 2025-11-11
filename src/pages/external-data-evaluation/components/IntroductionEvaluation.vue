<template>
  <div class="introduction-evaluation">
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
          <a-form-item field="status" label="评估状态">
            <a-select v-model="searchForm.status" placeholder="全部" allow-clear>
              <a-option value="pending">待评估</a-option>
              <a-option value="evaluating">评估中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="rejected">已拒绝</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="evaluator" label="评估人">
            <a-input v-model="searchForm.evaluator" placeholder="请输入评估人" />
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

    <!-- 评估列表 -->
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
      
      <template #score="{ record }">
        <div class="score-display">
          <a-rate :default-value="record.score" readonly allow-half />
          <span class="score-text">{{ record.score }}</span>
        </div>
      </template>
      
      <template #result="{ record }">
        <a-tag :color="getResultColor(record.result)">
          {{ getResultText(record.result) }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewDetail(record)">
            详情
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="startEvaluation(record)"
            v-if="record.status === 'pending'"
          >
            开始评估
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="continueEvaluation(record)"
            v-if="record.status === 'evaluating'"
          >
            继续评估
          </a-button>
          <a-popconfirm
            content="确定要删除该评估吗？"
            @ok="deleteEvaluation(record)"
          >
            <a-button type="text" size="small" status="danger">
              删除
            </a-button>
          </a-popconfirm>
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
  status: '',
  evaluator: ''
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
    title: '评估状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '评估人',
    dataIndex: 'evaluator',
    width: 120
  },
  {
    title: '综合评分',
    dataIndex: 'score',
    slotName: 'score',
    width: 150
  },
  {
    title: '评估结果',
    dataIndex: 'result',
    slotName: 'result',
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
    width: 200
  }
]

// 模拟数据
const mockData = [
  {
    id: 1,
    dataProduct: '身份信息核验服务',
    interfaceId: 'EXT001',
    status: 'pending',
    evaluator: '张评估师',
    score: 0,
    result: 'pending',
    evaluationTime: '-',
    description: '用于验证用户身份信息的真实性'
  },
  {
    id: 2,
    dataProduct: '信用评分查询',
    interfaceId: 'EXT002',
    status: 'evaluating',
    evaluator: '李评估师',
    score: 3.5,
    result: 'average',
    evaluationTime: '2024-01-20 14:20:00',
    description: '获取用户的信用评分信息'
  },
  {
    id: 3,
    dataProduct: '用户画像标签',
    interfaceId: 'EXT003',
    status: 'completed',
    evaluator: '王评估师',
    score: 4.2,
    result: 'good',
    evaluationTime: '2024-02-01 09:15:00',
    description: '提供用户画像标签数据'
  },
  {
    id: 4,
    dataProduct: '风险名单核验',
    interfaceId: 'EXT004',
    status: 'rejected',
    evaluator: '赵评估师',
    score: 2.1,
    result: 'poor',
    evaluationTime: '2024-02-10 16:45:00',
    description: '核验用户是否在风险名单中'
  }
]

// 状态相关方法
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    evaluating: 'blue',
    completed: 'green',
    rejected: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待评估',
    evaluating: '评估中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

const getResultColor = (result) => {
  const colors = {
    excellent: 'green',
    good: 'arcoblue',
    average: 'orange',
    poor: 'red',
    rejected: 'red',
    pending: 'gray'
  }
  return colors[result] || 'gray'
}

const getResultText = (result) => {
  const texts = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    poor: '较差',
    rejected: '拒绝',
    pending: '待评估'
  }
  return texts[result] || result
}

// 搜索和筛选
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = mockData
    
    if (searchForm.dataProduct) {
      filteredData = filteredData.filter(item => item.dataProduct === searchForm.dataProduct)
    }
    
    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }
    
    if (searchForm.evaluator) {
      const evaluator = searchForm.evaluator.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.evaluator.toLowerCase().includes(evaluator)
      )
    }
    
    tableData.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 300)
}

const handleReset = () => {
  Object.assign(searchForm, {
    dataProduct: '',
    status: '',
    evaluator: ''
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 行操作
const viewDetail = (record) => {
  Message.info(`查看评估详情: ${record.dataProduct}`)
}

const startEvaluation = (record) => {
  Message.success(`开始评估: ${record.dataProduct}`)
  // 模拟开始评估
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tableData.value[index].status = 'evaluating'
    tableData.value[index].evaluationTime = new Date().toLocaleString()
  }
}

const continueEvaluation = (record) => {
  Message.info(`继续评估: ${record.dataProduct}`)
}

const deleteEvaluation = (record) => {
  Message.success('评估已删除')
  handleSearch()
}

// 初始化
handleSearch()
</script>

<style scoped lang="less">
.introduction-evaluation {
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
    }
  }
}
</style>