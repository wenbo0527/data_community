<template>
  <div>
    <div class="loan-list">
      <a-empty v-if="!loans || loans.length === 0" description="暂无用信记录" />
      <a-table v-else :data="loans" :loading="loading" :pagination="false" size="small" :bordered="true">
        <template #columns>
          <a-table-column title="用信编号" data-index="loanNo" :width="120">
            <template #cell="{ record }">
              <span class="copyable" @click="copyText(record.loanNo)">{{ record.loanNo }}</span>
            </template>
          </a-table-column>
          <a-table-column title="用信日期" data-index="loanDate" :width="120">
            <template #cell="{ record }">
              <span>{{ record.loanDate }}</span>
            </template>
          </a-table-column>
          <a-table-column title="银行卡号" data-index="bankCard" :width="150">
            <template #cell="{ record }">
              <span class="copyable" @click="copyText(record.bankCard)">{{ record.bankCard }}</span>
            </template>
          </a-table-column>
          <a-table-column title="渠道" data-index="channel" :width="100">
            <template #cell="{ record }">
              <a-tag>{{ record.channel }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="产品名称" data-index="productName" :width="150">
            <template #cell="{ record }">
              <span>{{ record.productName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="结果" data-index="result" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.result === '成功' ? 'green' : 'red'">{{ record.result }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="拒绝原因" data-index="rejectReason" :width="150">
            <template #cell="{ record }">
              <span v-if="record.rejectReason">{{ record.rejectReason }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </a-table-column>
          <a-table-column title="合同编号" data-index="contractNo" :width="150">
            <template #cell="{ record }">
              <span class="copyable" @click="copyText(record.contractNo)" v-if="record.contractNo">{{ record.contractNo }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="金额" data-index="amount" :width="120">
            <template #cell="{ record }">
              <span class="font-medium text-blue-600">{{ formatAmount(record.amount) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="余额" data-index="balance" :width="120">
            <template #cell="{ record }">
              <span class="font-medium text-green-600">{{ formatAmount(record.balance) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分期数" data-index="installments" :width="100">
            <template #cell="{ record }">
              <span>{{ record.installments }}</span>
            </template>
          </a-table-column>
          <a-table-column title="逾期天数" data-index="overdueDays" :width="100">
            <template #cell="{ record }">
              <span :class="{ 'text-red-500 font-medium': record.overdueDays > 0 }">
                {{ record.overdueDays || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="历史最大逾期天数" data-index="maxOverdueDays" :width="140">
            <template #cell="{ record }">
              <span :class="{ 'text-red-500 font-medium': record.maxOverdueDays > 0 }">
                {{ record.maxOverdueDays || 0 }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="结清日期" data-index="settlementDate" :width="120">
            <template #cell="{ record }">
              <span v-if="record.settlementDate" class="text-green-600">
                {{ record.settlementDate }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </a-table-column>
          <a-table-column title="当前期次" data-index="currentPeriod" :width="100">
            <template #cell="{ record }">
              <span>{{ record.currentPeriod || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="剩余本金" data-index="remainingPrincipal" :width="120">
            <template #cell="{ record }">
              <span class="font-medium text-blue-600">{{ formatAmount(record.remainingPrincipal) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="剩余利息" data-index="remainingInterest" :width="120">
            <template #cell="{ record }">
              <span class="font-medium text-orange-600">{{ formatAmount(record.remainingInterest) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="剩余罚息" data-index="remainingPenalty" :width="120">
            <template #cell="{ record }">
              <div class="flex items-center">
                <span class="font-medium text-red-600">{{ formatAmount(record.remainingPenalty) }}</span>
                <a-tooltip content="本金罚息+利息罚息" v-if="Number(record.remainingPenalty || 0) > 0">
                  <icon-exclamation-circle class="ml-1 text-red-500 cursor-help" :size="14" />
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="剩余应还总额" data-index="remainingTotal" :width="140">
            <template #cell="{ record }">
              <span class="font-medium text-purple-600">{{ formatAmount(record.remainingTotal) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="借款利率" data-index="interestRate" :width="100">
            <template #cell="{ record }">
              <span class="font-medium text-green-600">{{ record.interestRate }}%</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button size="mini" type="primary" @click="viewLoanDetail(record)">
                  <template #icon><icon-eye /></template>
                  详情
                </a-button>
                <a-button size="mini" type="text" @click="viewDisbursementInfo(record)">
                  <template #icon><icon-eye /></template>
                  放款信息
                </a-button>
                <a-button size="mini" type="text" @click="viewRepaymentInfo(record)">
                  <template #icon><icon-list /></template>
                  还款信息
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
        
        <template #empty>
          <a-empty description="暂无用信记录" />
        </template>
      </a-table>
    </div>
    
    <!-- 还款记录弹窗 -->
    <a-modal 
      v-model:visible="repaymentVisible" 
      :title="`还款记录 - ${currentLoan.contractNumber || currentLoan.loanId}`" 
      width="80%"
      :footer="false"
    >
      <div class="repayment-records">
        <div class="repayment-header">
          <div class="loan-info">
            <a-descriptions :column="3" size="small">
              <a-descriptions-item label="用信编号">{{ currentLoan.loanId }}</a-descriptions-item>
              <a-descriptions-item label="合同编号">{{ currentLoan.contractNumber }}</a-descriptions-item>
              <a-descriptions-item label="用信金额">{{ currentLoan.amount }}</a-descriptions-item>
              <a-descriptions-item label="当前余额">{{ currentLoan.balance }}</a-descriptions-item>
              <a-descriptions-item label="分期数">{{ currentLoan.installments }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ currentLoan.status }}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="repayment-actions">
            <a-button size="small" @click="copyRepaymentData('selected')" :disabled="selectedRepaymentRows.length === 0">
              <template #icon><icon-copy /></template>
              复制选中
            </a-button>
            <a-button size="small" @click="copyRepaymentData('all')">
              <template #icon><icon-copy /></template>
              复制全部
            </a-button>
          </div>
        </div>
        
        <a-table 
          :data="repaymentRecords" 
          :loading="loadingRepayment"
          :row-selection="repaymentRowSelection"
          :pagination="repaymentPagination"
          size="small"
          @selection-change="handleRepaymentSelectionChange"
        >
          <template #columns>
            <a-table-column title="期数" data-index="period" :width="80">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.period)">{{ record.period }}</span>
              </template>
            </a-table-column>
            <a-table-column title="应还日期" data-index="dueDate" :width="120">
              <template #cell="{ record }">
                <span :class="{
                  'text-red-500': new Date(record.dueDate) < new Date() && record.status !== '已还款',
                  'text-orange-500': new Date(record.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && record.status !== '已还款'
                }">
                  {{ record.dueDate }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="应还金额" data-index="dueAmount" :width="120">
              <template #cell="{ record }">
                <span class="font-medium text-blue-600">
                  {{ formatAmount(record.dueAmount) }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="实还日期" data-index="actualDate" :width="120">
              <template #cell="{ record }">
                <span v-if="record.actualDate" class="text-green-600">
                  {{ record.actualDate }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </template>
            </a-table-column>
            <a-table-column title="实还金额" data-index="actualAmount" :width="120">
              <template #cell="{ record }">
                <span class="copyable amount" @click="copyText(record.actualAmount || '')" v-if="record.actualAmount">
                  {{ record.actualAmount }}
                </span>
                <span v-else class="text-placeholder">-</span>
              </template>
            </a-table-column>
            <a-table-column title="还款状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getRepaymentStatusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="逾期天数" data-index="overdueDays" :width="100">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.overdueDays || 0)" 
                      :class="{ 'overdue-text': record.overdueDays > 0 }">
                  {{ record.overdueDays || 0 }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="还款方式" data-index="paymentMethod" :width="120">
              <template #cell="{ record }">
                <a-tag :color="getPaymentMethodColor(record.paymentMethod)">
                  {{ record.paymentMethod }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="备注" data-index="notes" :width="150">
              <template #cell="{ record }">
                <span class="copyable" @click="copyText(record.notes || '')" v-if="record.notes">
                  {{ record.notes }}
                </span>
                <span v-else class="text-placeholder">-</span>
              </template>
            </a-table-column>
          </template>
          
          <template #empty>
            <a-empty description="暂无还款记录" />
          </template>
        </a-table>
      </div>
    </a-modal>
    
    <!-- 放款信息抽屉 -->
    <DisbursementDrawer 
      :visible="disbursementVisible"
      :loan-record="currentLoan"
      @close="disbursementVisible = false"
    />
    
    <!-- 还款信息抽屉 -->
    <!-- <RepaymentDrawer
      :visible="repaymentDrawerVisible"
      :loan-record="selectedLoanRecord"
      @close="repaymentDrawerVisible = false"
    /> -->
    
    <!-- 完整用信详情抽屉 -->
    <CompleteLoanDetailDrawer
      v-model:visible="loanDetailVisible"
      :loan-data="currentLoanDetail"
      @viewRepaymentPlan="handleViewRepaymentPlan"
      @viewRepaymentHistory="handleViewRepaymentHistory"
      @exportLoanDetail="handleExportLoanDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconEye, IconList, IconCopy, IconExclamationCircle } from '@arco-design/web-vue/es/icon'
import DisbursementDrawer from './DisbursementDrawer.vue'
// import RepaymentDrawer from './RepaymentDrawer.vue'
import CompleteLoanDetailDrawer from './CompleteLoanDetailDrawer.vue'
import { copyToClipboard } from '../../../../utils/copy'
import { formatAmount } from '../../../../utils/formatUtils'

const props = defineProps({
  loans: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['debug-info'])

// 发送调试信息到父组件
const sendDebugInfo = (type, message, data = null) => {
  emit('debug-info', {
    component: 'LoanList',
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// 组件初始化调试
sendDebugInfo('init', 'LoanList 组件初始化', {
  hasLoans: !!props.loans,
  loansType: typeof props.loans,
  isArray: Array.isArray(props.loans),
  length: props.loans ? props.loans.length : 0
})

// 监听 props 变化
watch(() => props.loans, (newLoans, oldLoans) => {
  sendDebugInfo('props-change', 'props.loans 数据变化', {
    oldLength: oldLoans ? oldLoans.length : 0,
    newLength: newLoans ? newLoans.length : 0,
    newType: typeof newLoans,
    isArray: Array.isArray(newLoans),
    renderCondition: !newLoans || newLoans.length === 0 ? '显示空状态' : '显示表格'
  })
}, { immediate: true, deep: true })

// 组件挂载时的调试
onMounted(() => {
  sendDebugInfo('mounted', 'LoanList 组件已挂载', {
    hasLoans: !!props.loans,
    length: props.loans ? props.loans.length : 0,
    renderCondition: !props.loans || props.loans.length === 0 ? '显示空状态' : '显示表格'
  })
})

// 响应式数据
const repaymentVisible = ref(false)
const loadingRepayment = ref(false)
const currentLoan = ref(null)
const repaymentRecords = ref([])
const selectedRepaymentRows = ref([])

// 抽屉组件状态
const disbursementVisible = ref(false)
const repaymentDrawerVisible = ref(false)
const loanDetailVisible = ref(false)
const currentLoanDetail = ref(null)

// 还款记录分页配置
const repaymentPagination = {
  pageSize: 12,
  showTotal: true,
  showPageSize: true
}

// 还款记录表格行选择配置
const repaymentRowSelection = {
  type: 'checkbox',
  showCheckedAll: true
}

// 主表格列配置已移至模板中

// 查看放款信息
const viewDisbursementInfo = (record) => {
  currentLoan.value = record
  disbursementVisible.value = true
  sendDebugInfo('disbursement-info', '打开放款信息抽屉', {
    loanId: record.loanNo,
    loanAmount: record.amount
  })
}

// 查看还款信息
const viewRepaymentInfo = (record) => {
  currentLoan.value = record
  repaymentDrawerVisible.value = true
  sendDebugInfo('repayment-info', '打开还款信息抽屉', {
    loanId: record.loanNo,
    balance: record.balance
  })
}

// 查看还款记录
const viewRepaymentRecords = async (record) => {
  currentLoan.value = record
  repaymentVisible.value = true
  loadingRepayment.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟还款记录数据
    const installments = parseInt(record.installments) || 12
    const mockRepaymentData = []
    
    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + i - installments)
      
      const isPaid = i <= installments - 3 // 假设最后3期未还
      const isOverdue = !isPaid && dueDate < new Date()
      
      mockRepaymentData.push({
        period: i,
        dueDate: dueDate.toISOString().split('T')[0],
        dueAmount: (parseFloat(record.amount || '0') / installments).toFixed(2),
        actualDate: isPaid ? dueDate.toISOString().split('T')[0] : null,
        actualAmount: isPaid ? (parseFloat(record.amount || '0') / installments).toFixed(2) : null,
        status: isPaid ? '已还款' : (isOverdue ? '逾期' : '未到期'),
        overdueDays: isOverdue ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        paymentMethod: isPaid ? ['银行转账', '自动扣款', '现金'][Math.floor(Math.random() * 3)] : null,
        notes: isOverdue ? '逾期未还' : (isPaid ? '正常还款' : '')
      })
    }
    
    repaymentRecords.value = mockRepaymentData
  } catch (error) {
    Message.error('获取还款记录失败')
  } finally {
    loadingRepayment.value = false
  }
}

// 处理还款记录行选择变化
const handleRepaymentSelectionChange = (selectedRowKeys) => {
  selectedRepaymentRows.value = selectedRowKeys
}

// 获取还款状态颜色
const getRepaymentStatusColor = (status) => {
  const colorMap = {
    '已还款': 'green',
    '逾期': 'red',
    '部分还款': 'orange',
    '未还款': 'blue'
  }
  return colorMap[status] || 'default'
}

// 获取贷款状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'blue',
    '冻结': 'orange',
    '关闭': 'gray'
  }
  return colorMap[status] || 'default'
}

// 获取支付方式颜色
const getPaymentMethodColor = (method) => {
  const colorMap = {
    '银行转账': 'blue',
    '自动扣款': 'green',
    '现金': 'orange',
    '支付宝': 'cyan',
    '微信': 'lime'
  }
  return colorMap[method] || 'default'
}

// 复制还款记录数据
const copyRepaymentData = async (type) => {
  try {
    let dataToCopy = []
    
    if (type === 'selected') {
      dataToCopy = repaymentRecords.value.filter((_, index) => selectedRepaymentRows.value.includes(index))
    } else {
      dataToCopy = repaymentRecords.value
    }
    
    if (dataToCopy.length === 0) {
      Message.warning('没有数据可复制')
      return
    }
    
    // 转换为CSV格式
    const headers = ['期数', '应还日期', '应还金额', '实还日期', '实还金额', '还款状态', '逾期天数', '还款方式', '备注']
    const csvContent = [headers.join(',')]
    
    dataToCopy.forEach(item => {
      const row = [
        item.period,
        item.dueDate,
        item.dueAmount,
        item.actualDate || '',
        item.actualAmount || '',
        item.status,
        item.overdueDays || 0,
        item.paymentMethod || '',
        item.notes || ''
      ]
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    Message.success(`已复制 ${dataToCopy.length} 条还款记录`)
  } catch (error) {
    Message.error('复制失败')
  }
}

// 查看用信详情
const viewLoanDetail = (record) => {
  // 转换数据格式以匹配CompleteLoanDetailDrawer的接口
  currentLoanDetail.value = {
    // 基本信息
    dataDate: new Date().toISOString().split('T')[0], // 当前日期作为数据日期
    productName: record.productName || '未知产品',
    loanNo: record.loanNo,
    loanDate: record.loanDate,
    bankCard: record.bankCard,
    loanResult: record.result || '成功',
    rejectReason: record.rejectReason,

    // 借据信息
    contractNo: record.contractNo || record.loanNo,
    disbursementTime: record.loanDate + ' 09:00:00', // 模拟放款时间
    contractStatus: record.status || '正常',
    interfaceAmount: record.amount || 0,
    installments: record.installments || 12,
    loanRate: (record.interestRate || 0) / 100,

    // 逾期信息
    overdueDays: record.overdueDays || 0,
    maxOverdueDays: record.maxOverdueDays || 0,
    overdueDate: record.overdueDays > 0 ? new Date(Date.now() - record.overdueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    settlementDate: record.settlementDate,

    // 还款信息
    currentPeriod: record.currentPeriod || 1,
    repaymentDate: record.nextPaymentDate || new Date().toISOString().split('T')[0],
    actualRepaymentPrincipal: record.actualRepaymentPrincipal || 0,
    actualRepaymentInterest: record.actualRepaymentInterest || 0,
    actualRepaymentPenalty: record.actualRepaymentPenalty || 0,
    actualRepaymentFee: record.actualRepaymentFee || 0,

    // 剩余信息
    remainingPrincipal: record.remainingPrincipal || 0,
    remainingInterest: record.remainingInterest || 0,
    remainingPenalty: record.remainingPenalty || 0,
    remainingTotal: record.remainingTotal || 0,

    // 风险标识
    isWriteOff: record.isWriteOff || false,
    isClaimed: record.isClaimed || false
  }
  
  loanDetailVisible.value = true
  sendDebugInfo('loan-detail', '打开完整用信详情', {
    loanId: record.loanNo,
    productName: record.productName
  })
}

// 查看还款计划
const handleViewRepaymentPlan = (loanData) => {
  console.log('查看还款计划:', loanData.loanNo)
  Message.info('还款计划功能开发中...')
}

// 查看还款历史
const handleViewRepaymentHistory = (loanData) => {
  console.log('查看还款历史:', loanData.loanNo)
  // 可以复用现有的还款记录功能
  const record = {
    loanNo: loanData.loanNo,
    contractNumber: loanData.contractNo,
    amount: loanData.interfaceAmount,
    balance: loanData.remainingTotal,
    installments: loanData.installments,
    status: loanData.contractStatus
  }
  viewRepaymentRecords(record)
}

// 导出用信详情
const handleExportLoanDetail = (loanData) => {
  console.log('导出用信详情:', loanData.loanNo)
  
  // 构建导出数据
  const exportData = [
    ['字段名称', '字段值'],
    ['数据日期', loanData.dataDate],
    ['产品名称', loanData.productName],
    ['借据号', loanData.contractNo],
    ['放款时间', loanData.disbursementTime],
    ['借据状态', loanData.contractStatus],
    ['接口金额', loanData.interfaceAmount],
    ['期数', loanData.installments],
    ['逾期天数', loanData.overdueDays],
    ['历史最大逾期天数', loanData.maxOverdueDays],
    ['结清日期', loanData.settlementDate || '-'],
    ['逾期日期', loanData.overdueDate || '-'],
    ['当前期次', loanData.currentPeriod],
    ['还款日', loanData.repaymentDate],
    ['实际还款本金', loanData.actualRepaymentPrincipal],
    ['实际还款利息', loanData.actualRepaymentInterest],
    ['实际还款罚息', loanData.actualRepaymentPenalty],
    ['实际还款费用', loanData.actualRepaymentFee],
    ['剩余本金', loanData.remainingPrincipal],
    ['剩余利息', loanData.remainingInterest],
    ['剩余罚息', loanData.remainingPenalty],
    ['剩余应还总额', loanData.remainingTotal],
    ['借款利率', (loanData.loanRate * 100).toFixed(4) + '%'],
    ['是否核销', loanData.isWriteOff ? '是' : '否'],
    ['是否理赔', loanData.isClaimed ? '是' : '否'],
    ['用信单号', loanData.loanNo],
    ['用信日期', loanData.loanDate],
    ['银行卡号', loanData.bankCard],
    ['用信结果', loanData.loanResult],
    ['拒绝原因', loanData.rejectReason || '-']
  ]
  
  const csvContent = exportData.map(row => row.join(',')).join('\n')
  
  try {
    copyToClipboard(csvContent)
    Message.success('用信详情已复制到剪贴板，可粘贴到Excel中')
  } catch (error) {
    Message.error('导出失败')
  }
}

// 复制文本
const copyText = async (text) => {
  try {
    await copyToClipboard(String(text))
    Message.success('已复制到剪贴板')
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.loan-list {
  margin-bottom: 16px;
}

.repayment-records {
  padding: 16px 0;
}

.repayment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.loan-info {
  flex: 1;
}

.repayment-actions {
  display: flex;
  gap: 8px;
}

.copyable {
  cursor: pointer;
  transition: color 0.2s;
}

.copyable:hover {
  color: #1890ff;
}

.amount {
  font-weight: 500;
  color: #52c41a;
}

.overdue-text {
  color: #ff4d4f;
  font-weight: 500;
}

.text-placeholder {
  color: #bfbfbf;
}
</style>