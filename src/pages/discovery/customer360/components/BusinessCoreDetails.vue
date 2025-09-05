<template>
  <div class="business-core-details">
    <div class="details-header">
      <h4>业务核心明细</h4>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载业务明细数据...</p>
    </div>
    
    <div v-else class="details-content">
      <!-- 授信列表 -->
      <div class="detail-section">
        <div class="section-header">
          <IconIdcard class="section-icon" />
          <span class="section-title">授信列表</span>
          <a-badge :count="creditsList.length" class="section-badge" />
        </div>
        
        <div class="table-container">
          <div class="table-toolbar">
            <a-input-search 
              v-model="creditSearchText"
              placeholder="搜索授信产品..."
              style="width: 200px;"
              @search="handleCreditSearch"
            />
            <a-button size="small" @click="copyCreditData">
              <template #icon><icon-copy /></template>
              复制
            </a-button>
          </div>
          
          <a-table 
            :columns="creditColumns"
            :data="filteredCreditsList"
            :pagination="creditPagination"
            :loading="loading"
            size="small"
            @page-change="handleCreditPageChange"
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
            </template>
          </a-table>
        </div>
      </div>
      
      <!-- 用信列表 -->
      <div class="detail-section">
        <div class="section-header">
          <IconWechatpay class="section-icon" />
          <span class="section-title">用信列表</span>
          <a-badge :count="loansList.length" class="section-badge" />
        </div>
        
        <div class="table-container">
          <div class="table-toolbar">
            <a-input-search 
              v-model="loanSearchText"
              placeholder="搜索用信记录..."
              style="width: 200px;"
              @search="handleLoanSearch"
            />
            <a-select 
              v-model="loanStatusFilter"
              placeholder="筛选状态"
              style="width: 120px;"
              allow-clear
              @change="handleLoanFilter"
            >
              <a-option value="正常">正常</a-option>
              <a-option value="逾期">逾期</a-option>
              <a-option value="已结清">已结清</a-option>
            </a-select>
          </div>
          
          <a-table 
            :columns="loanColumns"
            :data="filteredLoansList"
            :pagination="loanPagination"
            :loading="loading"
            size="small"
            @page-change="handleLoanPageChange"
          >
            <template #status="{ record }">
              <a-tag :color="getLoanStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            
            <template #loanAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.loanAmount) }}</span>
            </template>
            
            <template #remainingAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.remainingAmount) }}</span>
            </template>
            
            <template #actions="{ record }">
              <a-button size="mini" type="text" @click="viewLoanDetail(record)">
                查看详情
              </a-button>
              <a-button size="mini" type="text" @click="viewDisbursementDetails(record)">
                放款详情
              </a-button>
              <a-button size="mini" type="text" @click="viewRepaymentDetails(record)">
                还款详情
              </a-button>
            </template>
          </a-table>
        </div>
      </div>
      
      <!-- 调额记录 -->
      <div class="detail-section">
        <div class="section-header">
          <IconSwap class="section-icon" />
          <span class="section-title">调额记录</span>
          <a-badge :count="adjustmentsList.length" class="section-badge" />
        </div>
        
        <div class="table-container">
          <div class="table-toolbar">
            <a-range-picker 
              v-model="adjustmentDateRange"
              style="width: 240px;"
              @change="handleAdjustmentDateFilter"
            />
            <a-select 
              v-model="adjustmentTypeFilter"
              placeholder="筛选类型"
              style="width: 120px;"
              allow-clear
              @change="handleAdjustmentFilter"
            >
              <a-option value="提额">提额</a-option>
              <a-option value="降额">降额</a-option>
            </a-select>
          </div>
          
          <a-table 
            :columns="adjustmentColumns"
            :data="filteredAdjustmentsList"
            :pagination="adjustmentPagination"
            :loading="loading"
            size="small"
            @page-change="handleAdjustmentPageChange"
          >
            <template #type="{ record }">
              <a-tag :color="getAdjustmentTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
            
            <template #previousAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.previousAmount) }}</span>
            </template>
            
            <template #newAmount="{ record }">
              <span class="amount-text">{{ formatAmount(record.newAmount) }}</span>
            </template>
            
            <template #adjustmentAmount="{ record }">
              <span :class="['amount-text', record.type === '提额' ? 'increase' : 'decrease']">
                {{ record.type === '提额' ? '+' : '-' }}{{ formatAmount(Math.abs(record.newAmount - record.previousAmount)) }}
              </span>
            </template>
            
            <template #actions="{ record }">
              <a-button size="mini" type="text" @click="viewAdjustmentDetail(record)">
                查看详情
              </a-button>
            </template>
          </a-table>
        </div>
      </div>
      
      <!-- 支付流程 -->
      <div class="detail-section">
        <div class="section-header">
          <IconWechatpay class="section-icon" />
          <span class="section-title">支付流程</span>
          <a-badge :count="paymentsList.length" class="section-badge" />
        </div>
        
        <div class="table-container">
          <div class="table-toolbar">
            <a-input-search 
              v-model="paymentSearchText"
              placeholder="搜索支付记录..."
              style="width: 200px;"
              @search="handlePaymentSearch"
            />
            <a-select 
              v-model="paymentStatusFilter"
              placeholder="筛选状态"
              style="width: 120px;"
              allow-clear
              @change="handlePaymentFilter"
            >
              <a-option value="成功">成功</a-option>
              <a-option value="失败">失败</a-option>
              <a-option value="处理中">处理中</a-option>
            </a-select>
          </div>
          
          <a-table 
            :columns="paymentColumns"
            :data="filteredPaymentsList"
            :pagination="paymentPagination"
            :loading="loading"
            size="small"
            @page-change="handlePaymentPageChange"
          >
            <template #status="{ record }">
              <a-tag :color="getPaymentStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            
            <template #amount="{ record }">
              <span class="amount-text">{{ formatAmount(record.amount) }}</span>
            </template>
            
            <template #actions="{ record }">
              <a-button size="mini" type="text" @click="viewPaymentDetail(record)">
                查看详情
              </a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <!-- 授信详情抽屉 -->
    <CreditDetailDrawer
      v-model:visible="creditDetailVisible"
      :credit-data="currentCreditData"
    />

    <!-- 用信详情抽屉 -->
    <LoanDetailDrawer
      v-model:visible="loanDetailVisible"
      :loan-data="currentLoanData"
      @view-disbursement-details="viewDisbursementDetails"
      @view-repayment-details="viewRepaymentDetails"
    />

    <!-- 放款记录抽屉 -->
    <DisbursementDrawer
      v-model:visible="disbursementVisible"
      :loanRecord="currentLoanData"
    />

    <!-- 还款记录抽屉 -->
    <RepaymentDrawer
      v-model:visible="repaymentVisible"
      :loanRecord="currentLoanData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  IconIdcard, 
  IconUser, 
  IconSwap, 
  IconMore,
  IconRefresh,
  IconCopy,
  IconWechatpay
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import CreditDetailDrawer from './CreditDetailDrawer.vue'
import LoanDetailDrawer from './LoanDetailDrawer.vue'
import DisbursementDrawer from '@/views/customer360/components/DisbursementDrawer.vue'
import RepaymentDrawer from '@/views/customer360/components/RepaymentDrawer.vue'

interface Props {
  productKey: string
  productData?: any
  userInfo?: any
  loading?: boolean
}

interface Emits {
  (e: 'debug-info', info: any): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 搜索和筛选状态
const creditSearchText = ref('')
const loanSearchText = ref('')
const paymentSearchText = ref('')
const loanStatusFilter = ref('')
const adjustmentTypeFilter = ref('')
const adjustmentDateRange = ref([])
const paymentStatusFilter = ref('')

// 分页状态
const creditPagination = ref({ current: 1, pageSize: 5, total: 0 })
const loanPagination = ref({ current: 1, pageSize: 5, total: 0 })
const adjustmentPagination = ref({ current: 1, pageSize: 5, total: 0 })
const paymentPagination = ref({ current: 1, pageSize: 5, total: 0 })

// 抽屉状态管理
const creditDetailVisible = ref(false)
const loanDetailVisible = ref(false)
const disbursementVisible = ref(false)
const repaymentVisible = ref(false)

// 当前选中的数据
const currentCreditData = ref(null)
const currentLoanData = ref(null)

// 表格列定义
const creditColumns = [
  { title: '授信单号', dataIndex: 'productName', width: 120 },
  { title: '授信状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '授信额度', dataIndex: 'currentAmount', slotName: 'currentAmount', width: 100 },
  { title: '已用额度', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 100 },
  { title: '可用额度', dataIndex: 'availableAmount', slotName: 'availableAmount', width: 100 },
  { title: '授信日期', dataIndex: 'openDate', width: 120 },
  { title: '操作', slotName: 'actions', width: 80 }
]

const loanColumns = [
  { title: '借款编号', dataIndex: 'loanId', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '借款金额', dataIndex: 'loanAmount', slotName: 'loanAmount', width: 100 },
  { title: '剩余金额', dataIndex: 'remainingAmount', slotName: 'remainingAmount', width: 100 },
  { title: '借款时间', dataIndex: 'loanDate', width: 120 },
  { title: '到期时间', dataIndex: 'dueDate', width: 120 },
  { title: '操作', slotName: 'actions', width: 200 }
]

const adjustmentColumns = [
  { title: '授信单号', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '产品名称', dataIndex: 'productName', width: 120 },
  { title: '原额度', dataIndex: 'previousAmount', slotName: 'previousAmount', width: 100 },
  { title: '新额度', dataIndex: 'newAmount', slotName: 'newAmount', width: 100 },
  { title: '调整金额', dataIndex: 'adjustmentAmount', slotName: 'adjustmentAmount', width: 100 },
  { title: '调整时间', dataIndex: 'adjustmentDate', width: 120 },
  { title: '操作', slotName: 'actions', width: 80 }
]

const paymentColumns = [
  { title: '支付编号', dataIndex: 'paymentId', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '支付金额', dataIndex: 'amount', slotName: 'amount', width: 100 },
  { title: '支付方式', dataIndex: 'paymentMethod', width: 100 },
  { title: '支付时间', dataIndex: 'paymentTime', width: 120 },
  { title: '操作', slotName: 'actions', width: 80 }
]

// 计算属性 - 数据列表
const creditsList = computed(() => {
  const data = props.userInfo?.creditsList
  if (!Array.isArray(data)) return []
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) return data
  
  // 根据productKey过滤数据
  return data.filter((item: any) => item.productKey === props.productKey)
})
const loansList = computed(() => {
  const data = props.userInfo?.loanRecords
  if (!Array.isArray(data)) return []
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) return data
  
  // 根据productKey过滤数据
  return data.filter((item: any) => item.productKey === props.productKey)
})
const adjustmentsList = computed(() => {
  const data = props.userInfo?.quotaAdjustmentHistory
  if (!Array.isArray(data)) return []
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) return data
  
  // 根据productKey过滤数据
  return data.filter((item: any) => item.productKey === props.productKey)
})
const paymentsList = computed(() => {
  const data = props.userInfo?.paymentProcessRecords
  if (!Array.isArray(data)) return []
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) return data
  
  // 根据productKey过滤数据
  return data.filter((item: any) => item.productKey === props.productKey)
})

// 计算属性 - 筛选后的数据
const filteredCreditsList = computed(() => {
  let filtered = creditsList.value
  if (creditSearchText.value) {
    filtered = filtered.filter((item: any) => 
      item.productName?.toLowerCase().includes(creditSearchText.value.toLowerCase())
    )
  }
  creditPagination.value.total = filtered.length
  return filtered
})

const filteredLoansList = computed(() => {
  let filtered = loansList.value
  if (loanSearchText.value) {
    filtered = filtered.filter((item: any) => 
      item.loanId?.toLowerCase().includes(loanSearchText.value.toLowerCase())
    )
  }
  if (loanStatusFilter.value) {
    filtered = filtered.filter((item: any) => item.status === loanStatusFilter.value)
  }
  loanPagination.value.total = filtered.length
  return filtered
})

const filteredAdjustmentsList = computed(() => {
  let filtered = adjustmentsList.value
  if (adjustmentTypeFilter.value) {
    filtered = filtered.filter((item: any) => item.type === adjustmentTypeFilter.value)
  }
  adjustmentPagination.value.total = filtered.length
  return filtered
})

const filteredPaymentsList = computed(() => {
  let filtered = paymentsList.value
  if (paymentSearchText.value) {
    filtered = filtered.filter((item: any) => 
      item.paymentId?.toLowerCase().includes(paymentSearchText.value.toLowerCase())
    )
  }
  if (paymentStatusFilter.value) {
    filtered = filtered.filter((item: any) => item.status === paymentStatusFilter.value)
  }
  paymentPagination.value.total = filtered.length
  return filtered
})

// 方法
const refreshData = () => {
  emit('refresh')
  emit('debug-info', {
    action: 'refresh',
    component: 'BusinessCoreDetails',
    productKey: props.productKey
  })
}



const copyCreditData = () => {
  Message.success('授信数据已复制到剪贴板')
}

const formatAmount = (amount: number) => {
  if (amount === 0) return '¥0'
  if (!amount) return '--'
  return `¥${amount.toLocaleString()}`
}

// 状态颜色方法
const getCreditStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '冻结': 'orange',
    '关闭': 'red'
  }
  return colorMap[status] || 'default'
}

const getLoanStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '已结清': 'blue'
  }
  return colorMap[status] || 'default'
}

const getAdjustmentTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '提额': 'green',
    '降额': 'orange'
  }
  return colorMap[type] || 'default'
}

const getPaymentStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '成功': 'green',
    '失败': 'red',
    '处理中': 'orange'
  }
  return colorMap[status] || 'default'
}

// 搜索和筛选处理方法
const handleCreditSearch = () => {
  creditPagination.value.current = 1
}

const handleLoanSearch = () => {
  loanPagination.value.current = 1
}

const handlePaymentSearch = () => {
  paymentPagination.value.current = 1
}

const handleLoanFilter = () => {
  loanPagination.value.current = 1
}

const handleAdjustmentFilter = () => {
  adjustmentPagination.value.current = 1
}

const handleAdjustmentDateFilter = () => {
  adjustmentPagination.value.current = 1
}

const handlePaymentFilter = () => {
  paymentPagination.value.current = 1
}

// 分页处理方法
const handleCreditPageChange = (page: number) => {
  creditPagination.value.current = page
}

const handleLoanPageChange = (page: number) => {
  loanPagination.value.current = page
}

const handleAdjustmentPageChange = (page: number) => {
  adjustmentPagination.value.current = page
}

const handlePaymentPageChange = (page: number) => {
  paymentPagination.value.current = page
}

// 详情查看方法
const viewCreditDetail = (record: any) => {
  currentCreditData.value = record
  creditDetailVisible.value = true
}

const viewLoanDetail = (record: any) => {
  currentLoanData.value = record
  loanDetailVisible.value = true
}

const viewAdjustmentDetail = (record: any) => {
  Message.info(`查看调额详情: ${record.type}`)
}

const viewPaymentDetail = (record: any) => {
  Message.info(`查看支付详情: ${record.paymentId}`)
}

// 查看放款详情
const viewDisbursementDetails = (record: any) => {
  currentLoanData.value = record
  disbursementVisible.value = true
}

// 查看还款详情
const viewRepaymentDetails = (record: any) => {
  currentLoanData.value = record
  repaymentVisible.value = true
}
</script>

<style scoped>
.business-core-details {
  padding: 16px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.details-header h4 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
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
  color: #86909c;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f3f5;
}

.section-icon {
  margin-right: 8px;
  color: #165dff;
  font-size: 16px;
}

.section-title {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
  margin-right: 8px;
}

.section-badge {
  margin-left: auto;
}

.table-container {
  width: 100%;
}

.table-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.amount-text {
  font-weight: 500;
  color: #1d2129;
}

.amount-text.available {
  color: #00b42a;
}

.amount-text.increase {
  color: #00b42a;
}

.amount-text.decrease {
  color: #f53f3f;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
}

:deep(.arco-table-td) {
  padding: 8px 12px;
}

:deep(.arco-table-size-small .arco-table-td) {
  padding: 6px 8px;
}

:deep(.arco-badge-number) {
  background-color: #165dff;
}
</style>