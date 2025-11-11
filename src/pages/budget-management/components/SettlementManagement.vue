<template>
  <div class="settlement-management">
    <!-- 搜索和筛选 -->
    <a-row :gutter="16" class="search-section">
      <a-col :span="6">
        <a-input v-model="searchForm.settlementNo" placeholder="结算单号" allow-clear>
          <template #prefix><IconSearch /></template>
        </a-input>
      </a-col>
      <a-col :span="6">
        <a-select v-model="searchForm.contractNo" placeholder="合同编号" allow-clear>
          <a-option value="">全部合同</a-option>
          <a-option value="CT0001">CT0001</a-option>
          <a-option value="CT0002">CT0002</a-option>
          <a-option value="CT0003">CT0003</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-select v-model="searchForm.status" placeholder="结算状态" allow-clear>
          <a-option value="">全部状态</a-option>
          <a-option value="pending">待结算</a-option>
          <a-option value="approved">已审核</a-option>
          <a-option value="paid">已支付</a-option>
          <a-option value="rejected">已驳回</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-col>
    </a-row>

    <!-- 结算统计 -->
    <a-row :gutter="16" class="settlement-stats">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconFile />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ settlementStats.totalCount }}</div>
              <div class="stat-label">结算单总数</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(settlementStats.paidAmount) }}</div>
              <div class="stat-label">已支付金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconClockCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(settlementStats.pendingAmount) }}</div>
              <div class="stat-label">待支付金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconExclamationCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(settlementStats.totalAmount) }}</div>
              <div class="stat-label">总结算金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 结算列表 -->
    <a-card class="settlement-table-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <span>结算列表</span>
          <a-space>
            <a-button type="primary" size="small" @click="showSettlementModal = true">
              <template #icon><IconPlus /></template>
              新建结算
            </a-button>
            <a-button type="outline" size="small" @click="batchApprove">
              <template #icon><IconCheck /></template>
              批量审核
            </a-button>
            <a-button type="outline" size="small" @click="exportSettlements">
              <template #icon><IconDownload /></template>
              导出结算
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
        <template #settlementAmount="{ record }">
          <span>¥{{ formatAmount(record.settlementAmount) }}</span>
        </template>
        
        <template #paidAmount="{ record }">
          <span>¥{{ formatAmount(record.paidAmount) }}</span>
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
        
        <template #settlementDate="{ record }">
          <span :style="{ color: isOverdue(record.settlementDate) ? '#f53f3f' : 'inherit' }">
            {{ record.settlementDate }}
          </span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewSettlement(record)">
              查看
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="approveSettlement(record)"
              v-if="record.status === 'pending'"
            >
              审核
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="paySettlement(record)"
              v-if="record.status === 'approved'"
            >
              支付
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="rejectSettlement(record)"
              v-if="record.status === 'pending'"
              status="danger"
            >
              驳回
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新建结算弹窗 -->
    <a-modal
      v-model:visible="showSettlementModal"
      :title="editingSettlement ? '编辑结算' : '新建结算'"
      width="800px"
      @ok="handleSettlementSubmit"
      @cancel="handleSettlementCancel"
    >
      <a-form :model="settlementForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="settlementNo" label="结算单号" required>
              <a-input v-model="settlementForm.settlementNo" placeholder="请输入结算单号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="contractNo" label="合同编号" required>
              <a-select v-model="settlementForm.contractNo" placeholder="请选择合同编号">
                <a-option value="CT0001">CT0001</a-option>
                <a-option value="CT0002">CT0002</a-option>
                <a-option value="CT0003">CT0003</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="settlementPeriod" label="结算周期" required>
              <a-date-picker.RangePicker 
                v-model="settlementForm.settlementPeriod" 
                style="width: 100%"
                placeholder="请选择结算周期"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="settlementAmount" label="结算金额(万元)" required>
              <a-input-number
                v-model="settlementForm.settlementAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入结算金额"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="settlementItems" label="结算明细">
          <div class="settlement-items">
            <div class="settlement-item" v-for="(item, index) in settlementForm.items" :key="index">
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
                  <a-input v-model="item.unit" placeholder="单位" />
                </a-col>
                <a-col :span="2">
                  <a-button type="text" status="danger" @click="removeSettlementItem(index)">
                    <template #icon><IconMinus /></template>
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" long @click="addSettlementItem">
              <template #icon><IconPlus /></template>
              添加结算项
            </a-button>
          </div>
        </a-form-item>
        
        <a-form-item field="remarks" label="备注说明">
          <a-textarea
            v-model="settlementForm.remarks"
            placeholder="请输入备注说明"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconFile, 
  IconCheckCircle, 
  IconClockCircle, 
  IconExclamationCircle,
  IconPlus,
  IconCheck,
  IconDownload,
  IconSearch,
  IconMinus 
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  settlementNo: '',
  contractNo: '',
  status: ''
})

// 结算统计
const settlementStats = reactive({
  totalCount: 28,
  paidAmount: 18500000,
  pendingAmount: 4200000,
  totalAmount: 22700000
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 28,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: false
})

// 表格列定义
const columns = [
  {
    title: '结算单号',
    dataIndex: 'settlementNo',
    width: 120
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    width: 120
  },
  {
    title: '供应商',
    dataIndex: 'supplierName',
    width: 120
  },
  {
    title: '结算周期',
    dataIndex: 'settlementPeriod',
    width: 150
  },
  {
    title: '结算金额(万元)',
    dataIndex: 'settlementAmount',
    slotName: 'settlementAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '已付金额(万元)',
    dataIndex: 'paidAmount',
    slotName: 'paidAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '剩余金额(万元)',
    dataIndex: 'remainingAmount',
    slotName: 'remainingAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '结算日期',
    dataIndex: 'settlementDate',
    slotName: 'settlementDate',
    width: 120
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

// 结算弹窗
const showSettlementModal = ref(false)
const editingSettlement = ref(null)

// 结算表单
const settlementForm = reactive({
  settlementNo: '',
  contractNo: '',
  settlementPeriod: [],
  settlementAmount: 0,
  items: [
    { name: '', amount: 0, unit: '' }
  ],
  remarks: ''
})

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'approved': 'blue',
    'paid': 'green',
    'rejected': 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '待结算',
    'approved': '已审核',
    'paid': '已支付',
    'rejected': '已驳回'
  }
  return textMap[status] || status
}

// 获取剩余金额颜色
const getRemainingColor = (amount) => {
  return amount < 0 ? '#f53f3f' : '#14c9c9'
}

// 判断是否超期
const isOverdue = (date) => {
  if (!date) return false
  const today = new Date()
  const settlementDate = new Date(date)
  return settlementDate < today
}

// 模拟数据
const generateMockData = () => {
  const statuses = ['pending', 'approved', 'paid', 'rejected']
  const suppliers = ['供应商A', '供应商B', '供应商C']
  
  const data = []
  for (let i = 0; i < 28; i++) {
    const settlementAmount = Math.floor(Math.random() * 5000000) + 1000000
    const paidAmount = settlementAmount * (0.3 + Math.random() * 0.7)
    const remainingAmount = settlementAmount - paidAmount
    
    data.push({
      id: i + 1,
      settlementNo: `ST${String(i + 1).padStart(4, '0')}`,
      contractNo: `CT${String(Math.floor(Math.random() * 3) + 1).padStart(4, '0')}`,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      settlementPeriod: '2024-01-01 至 2024-01-31',
      settlementAmount,
      paidAmount: Math.floor(paidAmount),
      remainingAmount: Math.floor(remainingAmount),
      settlementDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      creator: '王五',
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
    if (searchForm.settlementNo) {
      data = data.filter(item => item.settlementNo.includes(searchForm.settlementNo))
    }
    if (searchForm.contractNo) {
      data = data.filter(item => item.contractNo === searchForm.contractNo)
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
  searchForm.settlementNo = ''
  searchForm.contractNo = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  handleSearch()
}

// 查看结算
const viewSettlement = (record) => {
  Message.info(`查看结算: ${record.settlementNo}`)
}

// 审核结算
const approveSettlement = (record) => {
  Message.info(`审核结算: ${record.settlementNo}`)
}

// 支付结算
const paySettlement = (record) => {
  Message.info(`支付结算: ${record.settlementNo}`)
}

// 驳回结算
const rejectSettlement = (record) => {
  Message.info(`驳回结算: ${record.settlementNo}`)
}

// 批量审核
const batchApprove = () => {
  Message.info('批量审核功能')
}

// 导出结算
const exportSettlements = () => {
  Message.success('结算数据导出成功')
}

// 添加结算项
const addSettlementItem = () => {
  settlementForm.items.push({ name: '', amount: 0, unit: '' })
}

// 删除结算项
const removeSettlementItem = (index) => {
  if (settlementForm.items.length > 1) {
    settlementForm.items.splice(index, 1)
  }
}

// 提交结算
const handleSettlementSubmit = () => {
  if (!settlementForm.settlementNo || !settlementForm.contractNo || !settlementForm.settlementAmount) {
    Message.error('请填写完整的结算信息')
    return
  }
  
  Message.success(editingSettlement.value ? '结算修改成功' : '结算创建成功')
  showSettlementModal.value = false
  editingSettlement.value = null
  
  // 重置表单
  Object.assign(settlementForm, {
    settlementNo: '',
    contractNo: '',
    settlementPeriod: [],
    settlementAmount: 0,
    items: [{ name: '', amount: 0, unit: '' }],
    remarks: ''
  })
  
  handleSearch()
}

const handleSettlementCancel = () => {
  showSettlementModal.value = false
  editingSettlement.value = null
  
  // 重置表单
  Object.assign(settlementForm, {
    settlementNo: '',
    contractNo: '',
    settlementPeriod: [],
    settlementAmount: 0,
    items: [{ name: '', amount: 0, unit: '' }],
    remarks: ''
  })
}

// 组件挂载时初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="less">
.settlement-management {
  .search-section {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }
  
  .settlement-stats {
    margin-bottom: 24px;
    
    .stat-card {
      border-radius: 8px;
      
      .stat-content {
        display: flex;
        align-items: center;
        padding: 16px;
        
        .stat-icon {
          font-size: 32px;
          color: var(--color-primary-6);
          margin-right: 16px;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 14px;
            color: var(--color-text-3);
          }
        }
      }
    }
  }
  
  .settlement-table-card {
    border-radius: 8px;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .settlement-items {
    .settlement-item {
      margin-bottom: 12px;
    }
  }
}
</style>