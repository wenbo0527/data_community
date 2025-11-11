<template>
  <div class="budget-overview">
    <!-- 预算列表 -->
    <a-card class="budget-table-card" :bordered="false" style="margin-bottom: 16px;">
      <template #title>
        <div class="table-header">
          <span>预算列表</span>
          <a-space>
            <a-button type="outline" size="small" @click="refreshBudgets">
              <template #icon><IconRefresh /></template>
              刷新
            </a-button>
            <a-button type="outline" size="small" @click="exportBudgets">
              <template #icon><IconDownload /></template>
              导出
            </a-button>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="budgetColumns"
        :data="budgetsFromStore"
        :pagination="budgetPagination"
        :loading="budgetsLoading"
        @page-change="handleBudgetPageChange"
      >
        <template #totalAmount="{ record }">
          <span>¥{{ formatAmount(record.totalAmount) }}</span>
        </template>
        <template #usedAmount="{ record }">
          <span>¥{{ formatAmount(record.usedAmount) }}</span>
        </template>
        <template #remainingAmount="{ record }">
          <span>¥{{ formatAmount(record.remainingAmount) }}</span>
        </template>
        <template #executionProgress="{ record }">
          <a-progress :percent="record.executionProgress" :status="record.executionProgress > 90 ? 'warning' : 'normal'" size="small" />
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
            {{ record.status === 'active' ? '生效' : '草稿' }}
          </a-tag>
        </template>
      </a-table>
    </a-card>

    <!-- 搜索和筛选 -->
    <a-row :gutter="16" class="search-section">
      <a-col :span="8">
        <a-select v-model="searchForm.businessType" placeholder="业务类型" allow-clear>
          <a-option value="">全部</a-option>
          <a-option value="融资担保">融资担保</a-option>
          <a-option value="助贷">助贷</a-option>
          <a-option value="直贷">直贷</a-option>
        </a-select>
      </a-col>
      <a-col :span="8">
        <a-select v-model="searchForm.platformProduct" placeholder="平台产品" allow-clear>
          <a-option value="">全部</a-option>
          <a-option value="美团">美团</a-option>
          <a-option value="字节">字节</a-option>
          <a-option value="京东">京东</a-option>
        </a-select>
      </a-col>
      <a-col :span="8">
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-col>
    </a-row>

    <!-- 预算健康度预警表格 -->
    <a-card class="budget-table-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <span>预算健康度预警</span>
          <a-space>
            <a-button type="outline" size="small" @click="refreshData">
              <template #icon><IconRefresh /></template>
              刷新
            </a-button>
            <a-button type="outline" size="small" @click="exportData">
              <template #icon><IconDownload /></template>
              导出
            </a-button>
          </a-space>
        </div>
      </template>
      
      <a-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #actualLoanAmount="{ record }">
          <span>¥{{ formatAmount(record.actualLoanAmount) }}</span>
        </template>
        
        <template #actualCost="{ record }">
          <span>¥{{ formatAmount(record.actualCost) }}</span>
        </template>
        
        <template #annualDataCost="{ record }">
          <span>¥{{ formatAmount(record.annualDataCost) }}</span>
        </template>
        
        <template #deviationRate="{ record }">
          <span :style="{ color: getDeviationColor(record.deviationRate) }">
            {{ record.deviationRate }}%
          </span>
        </template>
        
        <template #warning="{ record }">
          <a-tag :color="getWarningColor(record.warning)">
            {{ record.warning }}
          </a-tag>
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
              status="danger" 
              @click="handleWarning(record)"
            >
              预警
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 预算趋势图表 -->
    <a-row :gutter="16" class="chart-section">
      <a-col :span="12">
        <a-card title="预算执行趋势" class="chart-card">
          <div class="chart-container">
            <canvas ref="trendChart" width="400" height="200"></canvas>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="成本结构分析" class="chart-card">
          <div class="chart-container">
            <canvas ref="costChart" width="400" height="200"></canvas>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="预算详情"
      width="800px"
      @ok="showDetailModal = false"
      @cancel="showDetailModal = false"
    >
      <a-descriptions :data="detailData" :column="2" bordered />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconRefresh, IconDownload } from '@arco-design/web-vue/es/icon'
import { useExternalDataStore } from '@/stores/external-data.js'

// 引入仓库预算数据
const externalDataStore = useExternalDataStore()
const budgetsFromStore = externalDataStore.budgets
const budgetsLoading = ref(false)
const budgetPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: false
})

const budgetColumns = [
  { title: '预算名称', dataIndex: 'budgetName', width: 180 },
  { title: '年度', dataIndex: 'budgetYear', width: 80 },
  { title: '业务类型', dataIndex: 'businessType', width: 120 },
  { title: '平台产品', dataIndex: 'platformProduct', width: 120 },
  { title: '对应时间', dataIndex: 'correspondingTime', width: 120 },
  { title: '预算粒度', dataIndex: 'budgetGranularity', width: 100 },
  { title: '目标贷余(万元)', dataIndex: 'targetLoanBalance', width: 140, align: 'right' },
  { title: '预估放款(万元)', dataIndex: 'estimatedLoanAmount', width: 140, align: 'right' },
  { title: '年化数据成本(万元)', dataIndex: 'annualDataCost', width: 160, align: 'right' },
  { title: '无风险收益(%)', dataIndex: 'riskFreeReturn', width: 140, align: 'right' },
  { title: '总预算(万元)', dataIndex: 'totalAmount', slotName: 'totalAmount', width: 140, align: 'right' },
  { title: '已使用(万元)', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 140, align: 'right' },
  { title: '剩余(万元)', dataIndex: 'remainingAmount', slotName: 'remainingAmount', width: 140, align: 'right' },
  { title: '执行进度', dataIndex: 'executionProgress', slotName: 'executionProgress', width: 140 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100, align: 'center' },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 160 }
]

const refreshBudgets = async () => {
  try {
    budgetsLoading.value = true
    await externalDataStore.fetchBudgets()
    // 更新分页统计
    budgetPagination.total = budgetsFromStore.value?.length || 0
    Message.success('预算列表已刷新')
  } catch (err) {
    console.error('刷新预算失败:', err)
    Message.error('刷新预算失败: ' + (err.message || '未知错误'))
  } finally {
    budgetsLoading.value = false
  }
}

const exportBudgets = () => {
  Message.success('预算列表导出成功')
}

const handleBudgetPageChange = (page) => {
  budgetPagination.current = page
}

// 搜索表单
const searchForm = reactive({
  businessType: '',
  platformProduct: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 50,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: false
})

// 表格列定义
const columns = [
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
    title: '对应时间',
    dataIndex: 'correspondingTime',
    width: 120
  },
  {
    title: '目标贷余(万元)',
    dataIndex: 'targetLoanBalance',
    width: 120,
    align: 'right'
  },
  {
    title: '实际放款(万元)',
    dataIndex: 'actualLoanAmount',
    slotName: 'actualLoanAmount',
    width: 120,
    align: 'right'
  },
  {
    title: '实际费用(万元)',
    dataIndex: 'actualCost',
    slotName: 'actualCost',
    width: 120,
    align: 'right'
  },
  {
    title: '年化数据成本(万元)',
    dataIndex: 'annualDataCost',
    slotName: 'annualDataCost',
    width: 140,
    align: 'right'
  },
  {
    title: '无风险收益(%)',
    dataIndex: 'riskFreeReturn',
    width: 120,
    align: 'right'
  },
  {
    title: '偏离率(%)',
    dataIndex: 'deviationRate',
    slotName: 'deviationRate',
    width: 100,
    align: 'right'
  },
  {
    title: '预警状态',
    dataIndex: 'warning',
    slotName: 'warning',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 详情弹窗
const showDetailModal = ref(false)
const detailData = ref([])

// 图表引用
const trendChart = ref(null)
const costChart = ref(null)

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 获取偏离率颜色
const getDeviationColor = (rate) => {
  if (rate > 10) return '#f53f3f'
  if (rate > 5) return '#ff7d00'
  if (rate > -5) return '#14c9c9'
  return '#00b42a'
}

// 获取预警颜色
const getWarningColor = (warning) => {
  const colorMap = {
    '正常': 'green',
    '轻度预警': 'orange',
    '中度预警': 'red',
    '严重预警': 'red'
  }
  return colorMap[warning] || 'gray'
}

// 模拟数据
const generateMockData = () => {
  const businessTypes = ['信贷业务', '风控业务', '营销业务', '运营业务']
  const platformProducts = ['产品A', '产品B', '产品C', '产品D']
  const warnings = ['正常', '轻度预警', '中度预警', '严重预警']
  
  const data = []
  for (let i = 0; i < 50; i++) {
    const targetLoanBalance = Math.floor(Math.random() * 50000) + 10000
    const actualLoanAmount = targetLoanBalance * (0.8 + Math.random() * 0.4)
    const actualCost = actualLoanAmount * (0.02 + Math.random() * 0.03)
    const annualDataCost = actualCost * 12
    const riskFreeReturn = 3 + Math.random() * 2
    const deviationRate = ((actualLoanAmount - targetLoanBalance) / targetLoanBalance * 100).toFixed(2)
    
    data.push({
      id: i + 1,
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      platformProduct: platformProducts[Math.floor(Math.random() * platformProducts.length)],
      targetLoanBalance,
      actualLoanAmount: Math.floor(actualLoanAmount),
      actualCost: Math.floor(actualCost),
      annualDataCost: Math.floor(annualDataCost),
      riskFreeReturn: riskFreeReturn.toFixed(2),
      deviationRate,
      warning: warnings[Math.floor(Math.random() * warnings.length)]
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
    if (searchForm.businessType) {
      data = data.filter(item => item.businessType.includes(searchForm.businessType))
    }
    if (searchForm.platformProduct) {
      data = data.filter(item => item.platformProduct === searchForm.platformProduct)
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
  searchForm.businessType = ''
  searchForm.platformProduct = ''
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  handleSearch()
}

// 查看详情
const viewDetail = (record) => {
  detailData.value = [
    { label: '业务类型', value: record.businessType },
    { label: '平台产品', value: record.platformProduct },
    { label: '目标贷余', value: `${record.targetLoanBalance}万元` },
    { label: '实际放款', value: `${formatAmount(record.actualLoanAmount)}万元` },
    { label: '实际费用', value: `${formatAmount(record.actualCost)}万元` },
    { label: '年化数据成本', value: `${formatAmount(record.annualDataCost)}万元` },
    { label: '无风险收益', value: `${record.riskFreeReturn}%` },
    { label: '偏离率', value: `${record.deviationRate}%` },
    { label: '预警状态', value: record.warning }
  ]
  showDetailModal.value = true
}

// 查看趋势
const viewTrend = (record) => {
  Message.info('查看趋势图表')
}

// 处理预警
const handleWarning = (record) => {
  Message.info(`处理${record.businessType}的预警`)
}

// 刷新数据
const refreshData = () => {
  handleSearch()
  Message.success('数据已刷新')
}

// 导出数据
const exportData = () => {
  Message.success('预算数据导出成功')
}

// 绘制图表
const drawCharts = () => {
  // 这里可以集成图表库如Chart.js或ECharts
  // 为演示目的，这里只是创建简单的canvas图表
  if (trendChart.value && costChart.value) {
    const trendCtx = trendChart.value.getContext('2d')
    const costCtx = costChart.value.getContext('2d')
    
    // 简单的趋势线图
    trendCtx.fillStyle = '#14c9c9'
    trendCtx.fillRect(10, 50, 380, 100)
    
    // 简单的饼图
    costCtx.fillStyle = '#ff7d00'
    costCtx.beginPath()
    costCtx.arc(200, 100, 80, 0, Math.PI * 2)
    costCtx.fill()
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 初始化分页统计
  budgetPagination.total = budgetsFromStore.value?.length || 0
  handleSearch()
  drawCharts()
})
</script>

<style scoped lang="less">
.budget-overview {
  .search-section {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }
  
  .budget-table-card {
    margin-bottom: 24px;
    border-radius: 8px;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .chart-section {
    margin-bottom: 24px;
    
    .chart-card {
      border-radius: 8px;
      
      .chart-container {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-fill-2);
        border-radius: 4px;
      }
    }
  }
}
</style>