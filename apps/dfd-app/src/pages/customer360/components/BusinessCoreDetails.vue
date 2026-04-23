<template>
  <div class="business-core-details">
    <div class="details-header">
      <h4>业务核心明细</h4>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><IconRefresh /></template>
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
          <div class="header-left">
            <IconIdcard class="section-icon" />
            <span class="section-title">授信列表</span>
            <a-badge :count="creditsList.length" class="section-badge" />
          </div>
          <div class="header-right">
            <a-tag color="green" size="small">
              <template #icon><span class="live-dot"></span></template>
              实时
            </a-tag>
          </div>
        </div>
        
        <div class="table-container">
          <a-table 
            :columns="creditColumns"
            :data="creditsList"
            :pagination="creditPagination"
            :loading="loading"
            size="small"
            @page-change="handleCreditPageChange"
          >
            <template #extra>
              <a-button size="small" @click="copyCreditData">
                <template #icon><IconCopy /></template>
                复制
              </a-button>
            </template>
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
        <LoanRecordTable 
          :data="loansList"
          :loading="loading"
          @view-loan-detail="viewLoanDetail"
          @view-disbursement-details="handleViewDisbursementDetails"
          @view-repayment-details="handleViewRepaymentDetails"
        />
      </div>
      
      <!-- 调额记录 -->
      <div class="detail-section">
        <div class="section-header">
          <IconSwap class="section-icon" />
          <span class="section-title">调额记录</span>
          <a-badge :count="adjustmentsList.length" class="section-badge" />
        </div>
        
        <div class="table-container">
          <a-table 
            :columns="adjustmentColumns"
            :data="adjustmentsList"
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
          <a-table 
            :columns="paymentColumns"
            :data="paymentsList"
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
    <!-- <DisbursementDrawer
      v-model:visible="disbursementVisible"
      :loanRecord="currentLoanData"
    /> -->

    <!-- 还款记录抽屉 -->
    <!-- <RepaymentDrawer
      v-model:visible="repaymentVisible"
      :loanRecord="currentLoanData"
    /> -->

    <!-- 还款明细抽屉 -->
    <!-- <RepaymentDetailDrawer
      v-model:visible="repaymentDetailVisible"
      :loan-data="currentLoanData"
    /> -->

    <!-- 放款明细抽屉 -->
    <!-- <DisbursementDetailDrawer
      v-model:visible="disbursementDetailVisible"
      :loan-data="currentLoanData"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, h } from 'vue'
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
import LoanRecordTable from '@/views/customer360/components/LoanRecordTable.vue'
// import DisbursementDrawer from './DisbursementDrawer.vue'
// import RepaymentDrawer from './RepaymentDrawer.vue'
// import RepaymentDetailDrawer from './RepaymentDetailDrawer.vue'
// import DisbursementDetailDrawer from './DisbursementDetailDrawer.vue'

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

// 调试props数据传递
console.log('🔍 [Props调试] userInfo:', props.userInfo)
console.log('🔍 [Props调试] productKey:', props.productKey)
console.log('🔍 [Props调试] quotaAdjustHistory:', props.userInfo?.quotaAdjustHistory)

// 分页状态（保留分页功能）

// 分页状态
const creditPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})



const adjustmentPagination = ref({ current: 1, pageSize: 5, total: 0 })
const paymentPagination = ref({ current: 1, pageSize: 5, total: 0 })

// 抽屉状态管理
const creditDetailVisible = ref(false)
const loanDetailVisible = ref(false)
const disbursementVisible = ref(false)
const repaymentVisible = ref(false)

// 弹窗状态管理
const repaymentDetailVisible = ref(false)
const disbursementDetailVisible = ref(false)

// 当前选中的数据
const currentCreditData = ref(null)
const currentLoanData = ref(null)

// 表格列定义
const creditColumns = [
  { 
    title: '授信单号', 
    dataIndex: 'productName', 
    width: 120,
    filterable: {
      filter: (value: string, record: any) => record.productName?.toLowerCase().includes(value.toLowerCase()),
      slotName: 'productName-filter',
      icon: () => h('icon-search')
    }
  },
  { 
    title: '授信状态', 
    dataIndex: 'status', 
    slotName: 'status', 
    width: 80,
    filterable: {
      filters: [
        { text: '正常', value: '正常' },
        { text: '冻结', value: '冻结' },
        { text: '已结清', value: '已结清' }
      ],
      filter: (value: string[], record: any) => value.includes(record.status),
      multiple: true
    }
  },
  { title: '授信额度', dataIndex: 'currentAmount', slotName: 'currentAmount', width: 100 },
  { title: '已用额度', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 100 },
  { title: '可用额度', dataIndex: 'availableAmount', slotName: 'availableAmount', width: 100 },
  { title: '授信日期', dataIndex: 'openDate', width: 120 },
  { title: '操作', slotName: 'actions', width: 80 }
]



const adjustmentColumns = [
  { 
    title: '调整类型', 
    dataIndex: 'type', 
    slotName: 'type', 
    width: 80,
    filterable: {
      filters: [
        { text: '提额', value: '提额' },
        { text: '降额', value: '降额' }
      ],
      filter: (value: string[], record: any) => value.includes(record.type),
      multiple: true
    }
  },
  { title: '产品名称', dataIndex: 'productName', width: 120 },
  { title: '原额度', dataIndex: 'previousAmount', slotName: 'previousAmount', width: 100 },
  { title: '新额度', dataIndex: 'newAmount', slotName: 'newAmount', width: 100 },
  { title: '调整金额', dataIndex: 'adjustmentAmount', slotName: 'adjustmentAmount', width: 100 },
  { title: '调整时间', dataIndex: 'adjustmentDate', width: 120 },
  { title: '操作', slotName: 'actions', width: 80 }
]

const paymentColumns = [
  { 
    title: '支付编号', 
    dataIndex: 'paymentId', 
    width: 120,
    filterable: {
      filter: (value: string, record: any) => record.paymentId?.toLowerCase().includes(value.toLowerCase()),
      slotName: 'paymentId-filter',
      icon: () => h('icon-search')
    }
  },
  { 
    title: '状态', 
    dataIndex: 'status', 
    slotName: 'status', 
    width: 80,
    filterable: {
      filters: [
        { text: '成功', value: '成功' },
        { text: '失败', value: '失败' },
        { text: '处理中', value: '处理中' }
      ],
      filter: (value: string[], record: any) => value.includes(record.status),
      multiple: true
    }
  },
  { title: '支付金额', dataIndex: 'amount', slotName: 'amount', width: 100 },
  { 
    title: '支付方式', 
    dataIndex: 'paymentMethod', 
    width: 100,
    filterable: {
      filters: [
        { text: '银行卡', value: '银行卡' },
        { text: '支付宝', value: '支付宝' },
        { text: '微信', value: '微信' }
      ],
      filter: (value: string[], record: any) => value.includes(record.paymentMethod),
      multiple: true
    }
  },
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
  const data = props.userInfo?.quotaAdjustHistory
  console.log('🔍 [调额记录调试] 原始数据:', data)
  console.log('🔍 [调额记录调试] 数据类型:', typeof data, '是否为数组:', Array.isArray(data))
  
  if (!Array.isArray(data)) {
    console.log('❌ [调额记录调试] 数据不是数组，返回空数组')
    return []
  }
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) {
    console.log('🔍 [调额记录调试] 无productKey过滤，返回所有数据，数量:', data.length)
    return data
  }
  
  // 根据productKey过滤数据
  const filtered = data.filter((item: any) => item.productKey === props.productKey)
  console.log('🔍 [调额记录调试] productKey过滤:', props.productKey, '过滤后数量:', filtered.length)
  console.log('🔍 [调额记录调试] 过滤后数据:', filtered)
  return filtered
})

// 筛选后的调额记录列表
const filteredAdjustmentsList = computed(() => {
  return adjustmentsList.value
})
const paymentsList = computed(() => {
  const data = props.userInfo?.paymentProcessRecords
  if (!Array.isArray(data)) return []
  
  // 如果没有productKey，返回所有数据
  if (!props.productKey) return data
  
  // 根据productKey过滤数据
  return data.filter((item: any) => item.productKey === props.productKey)
})

// 更新分页总数
watch(creditsList, (newVal) => {
  creditPagination.total = newVal.length
}, { immediate: true })



watch(adjustmentsList, (newVal) => {
  adjustmentPagination.value.total = newVal.length
}, { immediate: true })

watch(paymentsList, (newVal) => {
  paymentPagination.value.total = newVal.length
}, { immediate: true })

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
  const headers = ['授信编号', '产品名称', '授信金额', '已用金额', '可用金额', '授信状态', '授信日期', '到期日期']
  const rows = creditsList.value.map(item => [
    item.creditNo,
    item.productName,
    formatAmount(item.creditAmount),
    formatAmount(item.usedAmount),
    formatAmount(item.availableAmount),
    item.status,
    item.creditDate,
    item.expireDate
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.join('\t'))
    .join('\n')
  
  navigator.clipboard.writeText(csvContent).then(() => {
    Message.success('授信数据已复制到剪贴板')
  })
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

// 分页处理方法（保留分页功能）

// 分页处理方法
const handleCreditPageChange = (page: number) => {
  creditPagination.current = page
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

// 处理LoanRecordTable组件的放款明细事件
const handleViewDisbursementDetails = (record: any) => {
  currentLoanData.value = record
  disbursementDetailVisible.value = true
}

// 处理LoanRecordTable组件的还款明细事件
const handleViewRepaymentDetails = (record: any) => {
  currentLoanData.value = record
  repaymentDetailVisible.value = true
}

// 刷新数据
const handleRefresh = () => {
  emit('refresh')
}

// 导出数据
const handleExport = () => {
  Message.info('导出功能已触发')
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
  color: var(--subapp-text-primary);
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
  color: var(--subapp-text-tertiary);
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #fff;
  border: 1px solid var(--subapp-border);
  border-radius: 6px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--subapp-bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--subapp-success);
  margin-right: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.section-icon {
  font-size: 18px;
  color: var(--subapp-primary);
  margin-right: 8px;
}

.section-title {
  font-weight: 500;
  color: var(--subapp-text-primary);
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
  color: var(--subapp-text-primary);
}

.amount-text.available {
  color: var(--subapp-success);
}

.amount-text.increase {
  color: var(--subapp-success);
}

.amount-text.decrease {
  color: var(--subapp-danger);
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
  background-color: var(--subapp-primary);
}
</style>