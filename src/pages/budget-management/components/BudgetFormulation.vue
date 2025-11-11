<template>
  <div class="budget-formulation">
    <!-- 搜索和筛选 -->
    <a-row :gutter="16" class="search-section">
      <a-col :span="8">
        <a-select v-model="searchForm.year" placeholder="预算年度" allow-clear>
          <a-option value="">全部年度</a-option>
          <a-option value="2024">2024年</a-option>
          <a-option value="2023">2023年</a-option>
          <a-option value="2022">2022年</a-option>
        </a-select>
      </a-col>
      <a-col :span="8">
        <a-select v-model="searchForm.status" placeholder="编制状态" allow-clear>
          <a-option value="">全部状态</a-option>
          <a-option value="draft">草稿</a-option>
          <a-option value="review">审核中</a-option>
          <a-option value="approved">已批准</a-option>
          <a-option value="rejected">已驳回</a-option>
        </a-select>
      </a-col>
      <a-col :span="8">
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-col>
    </a-row>

    <!-- 预算制定表格 -->
    <a-card class="budget-table-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <span>预算制定列表</span>
          <a-space>
            <a-button type="primary" size="small" @click="showFormulationModal = true">
              <template #icon><IconPlus /></template>
              新增预算
            </a-button>
            <a-button type="outline" size="小" @click="batchApprove">
              <template #icon><IconCheck /></template>
              批量审批
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
        
        <template #usedAmount="{ record }">
          <span>¥{{ formatAmount(record.usedAmount) }}</span>
        </template>
        
        <template #remainingAmount="{ record }">
          <span :style="{ color: getRemainingColor(record.remainingAmount) }">
            ¥{{ formatAmount(record.remainingAmount) }}
          </span>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template #progress="{ record }">
          <a-progress 
            :percent="record.progress" 
            :status="getProgressStatus(record.progress)"
            size="small"
          />
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="editBudget(record)">
              编辑
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="submitApproval(record)"
              :disabled="record.status !== 'draft'"
            >
              提交审批
            </a-button>
            <a-button type="text" size="small" @click="viewDetail(record)">
              详情
            </a-button>
            <a-popconfirm 
              content="确定要删除这条预算吗？"
              @ok="deleteBudget(record)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 预算制定弹窗 -->
    <a-modal
      v-model:visible="showFormulationModal"
      :title="editingBudget ? '编辑预算' : '新增预算'"
      width="800px"
      @ok="handleFormulationSubmit"
      @cancel="handleFormulationCancel"
    >
      <a-form :model="formulationForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="year" label="预算年度" required>
              <a-date-picker 
                v-model="formulationForm.year" 
                format="YYYY"
                style="width: 100%"
                placeholder="请选择预算年度"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="businessType" label="业务类型" required>
              <a-select v-model="formulationForm.businessType" placeholder="请选择业务类型">
                <a-option value="credit">信贷业务</a-option>
                <a-option value="risk">风控业务</a-option>
                <a-option value="marketing">营销业务</a-option>
                <a-option value="operation">运营业务</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="platformProduct" label="平台产品" required>
              <a-select v-model="formulationForm.platformProduct" placeholder="请选择平台产品">
                <a-option value="product1">产品A</a-option>
                <a-option value="product2">产品B</a-option>
                <a-option value="product3">产品C</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="budgetAmount" label="预算金额(万元)" required>
              <a-input-number
                v-model="formulationForm.budgetAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入预算金额"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="预算说明">
          <a-textarea
            v-model="formulationForm.description"
            placeholder="请输入预算说明"
            :rows="3"
          />
        </a-form-item>
        
        <a-divider orientation="left">预算明细</a-divider>
        
        <div class="budget-items">
          <div class="budget-item" v-for="(item, index) in formulationForm.items" :key="index">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-input v-model="item.name" placeholder="项目名称" />
              </a-col>
              <a-col :span="8">
                <a-input-number
                  v-model="item.amount"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                  placeholder="金额(万元)"
                />
              </a-col>
              <a-col :span="6">
                <a-select v-model="item.category" placeholder="类别">
                  <a-option value="data">数据采购</a-option>
                  <a-option value="service">服务费用</a-option>
                  <a-option value="operation">运营费用</a-option>
                  <a-option value="other">其他</a-option>
                </a-select>
              </a-col>
              <a-col :span="2">
                <a-button type="text" status="danger" @click="removeBudgetItem(index)">
                  <template #icon><IconMinus /></template>
                </a-button>
              </a-col>
            </a-row>
          </div>
          <a-button type="dashed" long @click="addBudgetItem">
            <template #icon><IconPlus /></template>
            添加预算项
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconCheck, IconMinus } from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  year: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 30,
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
    title: '预算年度',
    dataIndex: 'year',
    width: 100
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
    title: '预算金额(万元)',
    dataIndex: 'budgetAmount',
    slotName: 'budgetAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '已使用(万元)',
    dataIndex: 'usedAmount',
    slotName: 'usedAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '剩余(万元)',
    dataIndex: 'remainingAmount',
    slotName: 'remainingAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '执行进度',
    dataIndex: 'progress',
    slotName: 'progress',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 预算制定弹窗
const showFormulationModal = ref(false)
const editingBudget = ref(null)

// 预算制定表单
const formulationForm = reactive({
  year: '',
  businessType: '',
  platformProduct: '',
  budgetAmount: 0,
  description: '',
  items: [
    { name: '', amount: 0, category: '' }
  ]
})

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'draft': 'gray',
    'review': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'review': '审核中',
    'approved': '已批准',
    'rejected': '已驳回'
  }
  return textMap[status] || status
}

// 获取剩余金额颜色
const getRemainingColor = (amount) => {
  return amount < 0 ? '#f53f3f' : '#14c9c9'
}

// 获取进度状态
const getProgressStatus = (progress) => {
  if (progress >= 90) return 'danger'
  if (progress >= 70) return 'warning'
  return 'normal'
}

// 模拟数据
const generateMockData = () => {
  const statuses = ['draft', 'review', 'approved', 'rejected']
  const businessTypes = ['信贷业务', '风控业务', '营销业务', '运营业务']
  const platformProducts = ['产品A', '产品B', '产品C', '产品D']
  
  const data = []
  for (let i = 0; i < 30; i++) {
    const budgetAmount = Math.floor(Math.random() * 10000000) + 1000000
    const usedAmount = budgetAmount * (0.3 + Math.random() * 0.6)
    const remainingAmount = budgetAmount - usedAmount
    const progress = Math.floor((usedAmount / budgetAmount) * 100)
    
    data.push({
      id: i + 1,
      code: `BD${String(i + 1).padStart(4, '0')}`,
      year: '2024',
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      platformProduct: platformProducts[Math.floor(Math.random() * platformProducts.length)],
      budgetAmount,
      usedAmount: Math.floor(usedAmount),
      remainingAmount: Math.floor(remainingAmount),
      progress,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      creator: '张三',
      createTime: '2024-01-15 10:30:00'
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
    if (searchForm.year) {
      data = data.filter(item => item.year === searchForm.year)
    }
    if (searchForm.status) {
      data = data.filter(item => item.status === searchForm.status)
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
  searchForm.year = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  handleSearch()
}

// 编辑预算
const editBudget = (record) => {
  editingBudget.value = record
  Object.assign(formulationForm, {
    year: record.year,
    businessType: record.businessType,
    platformProduct: record.platformProduct,
    budgetAmount: record.budgetAmount,
    description: record.description || '',
    items: [
      { name: '数据采购', amount: record.budgetAmount * 0.6, category: 'data' },
      { name: '服务费用', amount: record.budgetAmount * 0.3, category: 'service' },
      { name: '其他费用', amount: record.budgetAmount * 0.1, category: 'other' }
    ]
  })
  showFormulationModal.value = true
}

// 提交审批
const submitApproval = (record) => {
  Message.info(`提交预算 ${record.code} 审批`)
}

// 查看详情
const viewDetail = (record) => {
  Message.info(`查看预算 ${record.code} 详情`)
}

// 删除预算
const deleteBudget = (record) => {
  Message.success(`预算 ${record.code} 已删除`)
  handleSearch()
}

// 批量审批
const batchApprove = () => {
  Message.info('批量审批功能')
}

// 添加预算项
const addBudgetItem = () => {
  formulationForm.items.push({ name: '', amount: 0, category: '' })
}

// 删除预算项
const removeBudgetItem = (index) => {
  if (formulationForm.items.length > 1) {
    formulationForm.items.splice(index, 1)
  }
}

// 提交预算制定
const handleFormulationSubmit = () => {
  if (!formulationForm.year || !formulationForm.businessType || !formulationForm.platformProduct || !formulationForm.budgetAmount) {
    Message.error('请填写完整的预算信息')
    return
  }
  
  Message.success(editingBudget.value ? '预算修改成功' : '预算创建成功')
  showFormulationModal.value = false
  editingBudget.value = null
  
  // 重置表单
  Object.assign(formulationForm, {
    year: '',
    businessType: '',
    platformProduct: '',
    budgetAmount: 0,
    description: '',
    items: [{ name: '', amount: 0, category: '' }]
  })
  
  handleSearch()
}

const handleFormulationCancel = () => {
  showFormulationModal.value = false
  editingBudget.value = null
  
  // 重置表单
  Object.assign(formulationForm, {
    year: '',
    businessType: '',
    platformProduct: '',
    budgetAmount: 0,
    description: '',
    items: [{ name: '', amount: 0, category: '' }]
  })
}

// 组件挂载时初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="less">
.budget-formulation {
  .search-section {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }
  
  .budget-table-card {
    border-radius: 8px;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .budget-items {
    .budget-item {
      margin-bottom: 12px;
    }
  }
}
</style>