<template>
  <div class="product-info">
    <div class="product-header">
      <h4>产品信息</h4>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载产品信息数据...</p>
    </div>
    
    <div v-else-if="!userInfo" class="empty-state">
      <a-empty description="暂无客户数据" />
    </div>
    
    <div v-else class="product-content">
      <!-- 产品级客户信息总览 -->
      <div class="info-card">
        <div class="card-header">
          <IconUser class="card-icon" />
          <span class="card-title">产品级客户信息总览</span>
        </div>
        <div class="card-content">
          <div class="overview-grid">
            <div class="overview-item">
              <div class="item-label">账户状态</div>
              <div class="item-value">
                <a-tag :color="getAccountStatusColor(userInfo.status)">{{ getAccountStatusText(userInfo.status) }}</a-tag>
              </div>
            </div>
            <div class="overview-item">
              <div class="item-label">客户等级</div>
              <div class="item-value">{{ userInfo.customerLevel || '普通' }}</div>
            </div>
            <div class="overview-item">
              <div class="item-label">历史最大逾期天数</div>
              <div class="item-value highlight">{{ userInfo.maxOverdueDays || 0 }}天</div>
            </div>
            <div class="overview-item">
              <div class="item-label">当前逾期天数</div>
              <div class="item-value highlight">{{ userInfo.currentOverdueDays || 0 }}天</div>
            </div>
            <div class="overview-item">
              <div class="item-label">当前总在贷余额</div>
              <div class="item-value amount">{{ formatAmount(userInfo.currentTotalLoanBalance || 0) }}</div>
            </div>
            <div class="overview-item">
              <div class="item-label">当前总授信金额</div>
              <div class="item-value amount">{{ formatAmount(userInfo.currentTotalCreditAmount || 0) }}</div>
            </div>
            <div class="overview-item">
              <div class="item-label">风险等级</div>
              <div class="item-value">
                <a-tag :color="getRiskLevelColor(userInfo.userProfile?.risk?.riskType)">{{ userInfo.userProfile?.risk?.riskType || '未知' }}</a-tag>
              </div>
            </div>
            <div class="overview-item">
              <div class="item-label">还款能力</div>
              <div class="item-value">{{ userInfo.userProfile?.risk?.repaymentCapacity || '未知' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 授信明细列表 -->
      <div class="info-card">
        <div class="card-header">
          <icon-credit-card class="card-icon" />
          <span class="card-title">授信明细列表</span>
          <a-badge :count="creditDetailsList.length" class="card-badge" />
        </div>
        <div class="card-content">
          <div class="table-toolbar">
            <a-input-search 
              v-model="searchText"
              placeholder="搜索授信产品..."
              style="width: 200px;"
              @search="handleSearch"
            />
            <a-select 
              v-model="statusFilter"
              placeholder="筛选状态"
              style="width: 120px;"
              allow-clear
              @change="handleStatusFilter"
            >
              <a-option value="正常">正常</a-option>
              <a-option value="逾期">逾期</a-option>
              <a-option value="已结清">已结清</a-option>
              <a-option value="冻结">冻结</a-option>
            </a-select>
          </div>
          
          <a-table 
            :columns="creditColumns"
            :data="filteredCreditList"
            :pagination="pagination"
            :loading="loading"
            size="small"
            @page-change="handlePageChange"
          >
            <template #status="{ record }">
              <a-tag :color="getCreditStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            
            <template #currentAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.currentAmount) }}</span>
            </template>
            
            <template #usedAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.usedAmount) }}</span>
            </template>
            
            <template #availableAmount="{ record }">
              <span class="amount-text available">{{ formatAmount(record.currentAmount - record.usedAmount) }}</span>
            </template>
            
            <template #actions="{ record }">
              <a-button size="mini" type="text" @click="viewCreditDetail(record)">
                查看详情
              </a-button>
              <a-button size="mini" type="text" @click="viewLoanDetail(record)">
                借据详情
              </a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    
    <!-- 借据详情抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="借据详情"
      width="60%"
      @cancel="closeDrawer"
    >
      <div v-if="selectedCredit" class="drawer-content">
        <div class="detail-section">
          <h5>基本信息</h5>
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="产品名称">{{ selectedCredit.productName }}</a-descriptions-item>
            <a-descriptions-item label="产品编号">{{ selectedCredit.productKey }}</a-descriptions-item>
            <a-descriptions-item label="授信金额">{{ formatAmount(selectedCredit.currentAmount) }}</a-descriptions-item>
            <a-descriptions-item label="已用金额">{{ formatAmount(selectedCredit.usedAmount) }}</a-descriptions-item>
            <a-descriptions-item label="可用金额">{{ formatAmount(selectedCredit.currentAmount - selectedCredit.usedAmount) }}</a-descriptions-item>
            <a-descriptions-item label="状态">{{ selectedCredit.status }}</a-descriptions-item>
            <a-descriptions-item label="开户日期">{{ selectedCredit.openDate }}</a-descriptions-item>
            <a-descriptions-item label="到期日期">{{ selectedCredit.expireDate }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="detail-section">
          <h5>用信记录</h5>
          <a-table 
            :columns="loanColumns"
            :data="selectedCreditLoans"
            :pagination="false"
            size="small"
          >
            <template #loanAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.loanAmount) }}</span>
            </template>
            
            <template #remainingAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.remainingAmount) }}</span>
            </template>
            
            <template #status="{ record }">
              <a-tag :color="getLoanStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { IconRefresh, IconUser, IconIdcard } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => null
  },
  productData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

// 响应式数据
const searchText = ref('')
const statusFilter = ref('')
const drawerVisible = ref(false)
const selectedCredit = ref(null)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 授信明细表格列配置
const creditColumns = [
  {
    title: '产品名称',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '产品编号',
    dataIndex: 'productKey',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '授信金额',
    dataIndex: 'currentAmount',
    slotName: 'currentAmount',
    width: 120
  },
  {
    title: '已用金额',
    dataIndex: 'usedAmount',
    slotName: 'usedAmount',
    width: 120
  },
  {
    title: '可用金额',
    slotName: 'availableAmount',
    width: 120
  },
  {
    title: '开户日期',
    dataIndex: 'openDate',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 借据记录表格列配置
const loanColumns = [
  {
    title: '借据编号',
    dataIndex: 'loanId',
    width: 120
  },
  {
    title: '放款金额',
    dataIndex: 'loanAmount',
    slotName: 'loanAmount',
    width: 120
  },
  {
    title: '剩余金额',
    dataIndex: 'remainingAmount',
    slotName: 'remainingAmount',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '放款日期',
    dataIndex: 'loanDate',
    width: 100
  },
  {
    title: '到期日期',
    dataIndex: 'dueDate',
    width: 100
  }
]

// 计算属性
const creditDetailsList = computed(() => {
  if (!props.userInfo?.products) return []
  
  return props.userInfo.products.map(product => ({
    productKey: product.productKey,
    productName: product.name,
    status: product.status,
    currentAmount: product.balance || 0,
    usedAmount: product.usedAmount || 0,
    openDate: product.openDate || '2023-01-01',
    expireDate: product.expireDate || '2024-12-31'
  }))
})

const filteredCreditList = computed(() => {
  let list = creditDetailsList.value
  
  // 搜索过滤
  if (searchText.value) {
    list = list.filter(item => 
      item.productName.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.productKey.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    list = list.filter(item => item.status === statusFilter.value)
  }
  
  // 更新分页总数
  pagination.value.total = list.length
  
  return list
})

const selectedCreditLoans = computed(() => {
  if (!selectedCredit.value) return []
  
  // 模拟借据数据
  return [
    {
      loanId: 'L001',
      loanAmount: 50000,
      remainingAmount: 30000,
      status: '正常',
      loanDate: '2023-06-01',
      dueDate: '2024-06-01'
    },
    {
      loanId: 'L002',
      loanAmount: 30000,
      remainingAmount: 0,
      status: '已结清',
      loanDate: '2023-08-15',
      dueDate: '2024-08-15'
    }
  ]
})

// 方法
const refreshData = () => {
  emit('refresh')
}

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
}

const getAccountStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '逾期': 'red',
    '冻结': 'orange',
    '已结清': 'blue'
  }
  return colorMap[status] || 'gray'
}

const getAccountStatusText = (status) => {
  return status || '未知'
}

const getRiskLevelColor = (riskType) => {
  const colorMap = {
    '低风险': 'green',
    '中风险': 'orange',
    '高风险': 'red'
  }
  return colorMap[riskType] || 'gray'
}

const getCreditStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '逾期': 'red',
    '已结清': 'blue',
    '冻结': 'orange'
  }
  return colorMap[status] || 'gray'
}

const getLoanStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '逾期': 'red',
    '已结清': 'blue'
  }
  return colorMap[status] || 'gray'
}

const handleSearch = () => {
  pagination.value.current = 1
}

const handleStatusFilter = () => {
  pagination.value.current = 1
}

const handlePageChange = (page) => {
  pagination.value.current = page
}

const viewCreditDetail = (record) => {
  selectedCredit.value = record
  drawerVisible.value = true
}

const viewLoanDetail = (record) => {
  selectedCredit.value = record
  drawerVisible.value = true
}

const closeDrawer = () => {
  drawerVisible.value = false
  selectedCredit.value = null
}

// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
  console.debug('[ProductInfo] userInfo数据变化:', {
    timestamp: Date.now(),
    hasError: newVal?.error,
    hasData: !!newVal,
    maxOverdueDays: newVal?.maxOverdueDays,
    currentOverdueDays: newVal?.currentOverdueDays,
    overdueAmount: newVal?.overdueAmount,
    repaymentRate: newVal?.repaymentRate
  });
}, { immediate: true, deep: true });

watch(() => props.productData, (newVal) => {
  console.debug('[ProductInfo] productData数据变化:', {
    timestamp: Date.now(),
    count: newVal?.length,
    isEmpty: !newVal || newVal.length === 0,
    firstItem: newVal && newVal.length > 0 ? {
      productKey: newVal[0].productKey,
      name: newVal[0].name,
      hasBalance: 'balance' in newVal[0],
      balanceValue: newVal[0].balance
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[ProductInfo] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasUserInfo: !!props.userInfo,
    userInfoError: props.userInfo?.error,
    productDataCount: props.productData?.length
  });
});
</script>

<style scoped>
.product-info {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100%;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-state p {
  margin-top: 16px;
  color: #86909c;
  font-size: 14px;
}

.empty-state {
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.product-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  position: relative;
}

.card-icon {
  font-size: 16px;
  color: #165dff;
  margin-right: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.card-badge {
  margin-left: auto;
}

.card-content {
  padding: 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.overview-item {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border-left: 3px solid #165dff;
}

.item-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
  font-weight: 500;
}

.item-value {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.item-value.highlight {
  color: #f53f3f;
}

.item-value.amount {
  color: #00b42a;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.amount-text {
  font-weight: 600;
  color: #1d2129;
}

.amount-text.available {
  color: #00b42a;
}

.drawer-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e6eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-info {
    padding: 12px;
  }
  
  .product-header {
    padding: 12px 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Arco Design 表格样式优化 */
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 600;
  color: #4e5969;
}

:deep(.arco-descriptions-item-value) {
  color: #1d2129;
}
</style>