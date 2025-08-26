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
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewLoanDetail(record)">查看详情</a-button>
                <a-button type="text" size="small" @click="viewRepaymentRecords(record)">还款记录</a-button>
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'
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
const currentLoan = ref({})
const repaymentRecords = ref([])
const selectedRepaymentRows = ref([])

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

// 查看用信详情
const viewLoanDetail = (record) => {
  Message.info('用信详情功能开发中...')
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
        dueAmount: (parseFloat(record.amount) / installments).toFixed(2),
        actualDate: isPaid ? dueDate.toISOString().split('T')[0] : null,
        actualAmount: isPaid ? (parseFloat(record.amount) / installments).toFixed(2) : null,
        status: isPaid ? '已还款' : (isOverdue ? '逾期' : '未到期'),
        overdueDays: isOverdue ? Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24)) : 0,
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