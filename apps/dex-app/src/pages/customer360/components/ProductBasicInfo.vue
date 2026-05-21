<template>
  <div class="product-basic-info">
    <!-- 调试信息区域 -->
    <div class="debug-info" style="background: #f0f9ff; border: 2px solid var(--subapp-info); padding: 16px; margin-bottom: 16px; border-radius: 6px;">
      <h4 style="color: var(--subapp-info); margin: 0 0 12px 0;">🔧 ProductBasicInfo 调试信息</h4>
      <div style="font-size: 12px; line-height: 1.5;">
        <div><strong>productType:</strong> {{ productType }}</div>
        <div><strong>productData 类型:</strong> {{ typeof productData }}</div>
        <div><strong>productData 长度:</strong> {{ Array.isArray(productData) ? productData.length : 'N/A' }}</div>
        <div><strong>productData 内容:</strong> {{ productData ? JSON.stringify(productData).substring(0, 150) + '...' : 'null' }}</div>
        <div><strong>safeProductData 长度:</strong> {{ safeProductData.length }}</div>
        <div><strong>safeProductData 内容:</strong> {{ safeProductData.length > 0 ? JSON.stringify(safeProductData[0]).substring(0, 100) + '...' : '无数据' }}</div>
        <div><strong>userInfo:</strong> {{ userInfo ? '已传入' : '未传入' }}</div>
        <div><strong>tableColumns 长度:</strong> {{ tableColumns.length }}</div>
        <div><strong>表格是否显示:</strong> {{ safeProductData.length > 0 ? '是' : '否' }}</div>
      </div>
    </div>
    
    <!-- 产品概览 -->
    <div class="customer-metrics" v-if="productType === 'loan'">
      <div class="metrics-title">产品概览</div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">历史最大逾期天数</div>
          <div class="metric-value">{{ userInfo?.maxOverdueDays || 0 }}天</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">当前逾期天数</div>
          <div class="metric-value">{{ userInfo?.currentOverdueDays || 0 }}天</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">当前总在贷余额</div>
          <div class="metric-value">{{ formatAmount(currentTotalLoanBalance) }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">当前总授信金额</div>
          <div class="metric-value">{{ formatAmount(currentTotalCreditAmount) }}</div>
        </div>
      </div>
    </div>

    <!-- 产品列表 -->
    <div class="products-section">
      <div class="section-header">
        <h4>信贷产品列表</h4>
        <div class="copy-actions">
          <a-button size="small" @click="copyData('selected')" :disabled="selectedRows.length === 0">
            <template #icon><IconCopy /></template>
            复制选中
          </a-button>
          <a-button size="small" @click="copyData('all')">
            <template #icon><IconCopy /></template>
            复制全部
          </a-button>
        </div>
      </div>
      
      <a-table 
        :data="safeProductData" 
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="false"
        :columns="tableColumns"
        size="small"
        @selection-change="handleSelectionChange"
      >
        <template #productKey="{ record }">
          <div class="flex items-center gap-2">
            <span>{{ record.productKey }}</span>
            <IconCopy 
              class="cursor-pointer text-gray-400 hover:text-blue-500" 
              @click="copyText(record.productKey)"
            />
          </div>
        </template>
        
        <template #name="{ record }">
          <span class="copyable" @click="copyText(record.name)">{{ record.name }}</span>
        </template>
        
        <template #balance="{ record }">
          <span class="font-medium" :class="{
            'text-red-500': record.balance < 0,
            'text-green-600': record.balance > 0,
            'text-gray-500': record.balance === 0
          }">
            {{ formatAmount(record.balance) }}
          </span>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
        </template>
        
        <template #currency="{ record }">
          <span class="text-gray-600">
            {{ record.currency }}
          </span>
        </template>
        
        <template #lastTransaction="{ record }">
          <span class="text-gray-600">
            {{ record.lastTransaction }}
          </span>
        </template>
        
        <template #rate="{ record }">
          <span class="text-blue-600 font-medium">
            {{ formatPercent(record.rate) }}
          </span>
        </template>
        
        <template #remainingPeriod="{ record }">
          <span class="text-orange-600 font-medium">
            {{ record.remainingPeriod }}/{{ record.totalPeriod }}
          </span>
        </template>
        
        <template #nextPaymentDate="{ record }">
          <span class="text-blue-600 font-medium">
            {{ record.nextPaymentDate }}
          </span>
        </template>
        
        <template #empty>
          <a-empty description="暂无产品数据" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, triggerRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'
// Format functions
const formatAmount = (amount) => {
  if (!amount) {return '¥0.00'}
  return `¥${Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatPercent = (rate) => {
  if (!rate) {return '0.00%'}
  return `${(Number(rate) * 100).toFixed(2)}%`
}
import { copyToClipboard } from '../../../utils/copy'

// Props
const props = defineProps({
  productType: {
    type: String,
    required: true
  },
  productData: {
    type: Array,
    default: () => []
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['debug-info'])

// 发送调试信息到父组件
const sendDebugInfo = (type, message, data = null) => {
  emit('debug-info', {
    component: 'ProductBasicInfo',
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// 监听 props 变化
watch(() => props.productType, (newType, oldType) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [ProductBasicInfo] productType变化:', { oldType, newType })
  }
}, { immediate: true })

watch(() => props.productData, (newData, oldData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [ProductBasicInfo] productData变化:', {
      productType: props.productType,
      isArray: Array.isArray(newData),
      length: newData?.length || 0,
      hasData: !!(newData && newData.length > 0),
      dataChanged: JSON.stringify(newData) !== JSON.stringify(oldData)
    })
  }
}, { immediate: true, deep: true })

watch(() => props.userInfo, (newInfo, oldInfo) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 [ProductBasicInfo] userInfo变化:', {
      productType: props.productType,
      hasNewUserInfo: !!newInfo,
      hasOldUserInfo: !!oldInfo
    })
  }
}, { immediate: true, deep: true })

// 组件挂载时的调试
onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 [ProductBasicInfo] 组件挂载完成:', {
      productType: props.productType,
      hasProductData: !!props.productData,
      productDataLength: props.productData?.length || 0,
      hasUserInfo: !!props.userInfo
    })
  }
})

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 安全的表格数据
const safeProductData = computed(() => {
  const data = props.productData || []
  
  // 只在开发环境输出调试信息，避免递归更新
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ [ProductBasicInfo] safeProductData计算:', {
      productType: props.productType,
      isArray: Array.isArray(props.productData),
      length: data.length,
      hasData: data.length > 0
    })
  }
  
  return data
})

// 计算当前总在贷余额
const currentTotalLoanBalance = computed(() => {
  if (!props.productData || !Array.isArray(props.productData)) {return 0}
  return props.productData.reduce((total, product) => {
    return total + (product.balance || 0)
  }, 0)
})

// 计算当前总授信金额
const currentTotalCreditAmount = computed(() => {
  if (!props.productData || !Array.isArray(props.productData)) {return 0}
  return props.productData.reduce((total, product) => {
    return total + (product.creditLimit || product.totalAmount || 0)
  }, 0)
})

// 表格列配置
const tableColumns = computed(() => {
  const baseColumns = [
    {
      title: '产品编号',
      dataIndex: 'productKey',
      slotName: 'productKey',
      width: 120
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      slotName: 'name',
      width: 150
    },
    {
      title: '余额',
      dataIndex: 'balance',
      slotName: 'balance',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 100
    },
    {
      title: '币种',
      dataIndex: 'currency',
      slotName: 'currency',
      width: 80
    },
    {
      title: '利率',
      dataIndex: 'rate',
      slotName: 'rate',
      width: 100
    }
  ]
  
  // 根据产品类型添加特定列
  if (props.productType === 'loan') {
    baseColumns.push(
      {
        title: '剩余期数',
        dataIndex: 'remainingPeriod',
        slotName: 'remainingPeriod',
        width: 100
      },
      {
        title: '下次还款日',
        dataIndex: 'nextPaymentDate',
        slotName: 'nextPaymentDate',
        width: 120
      }
    )
  }
  
  return baseColumns
})

// 表格行选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true
}

// 处理行选择变化
const handleSelectionChange = (selectedRowKeys) => {
  selectedRows.value = selectedRowKeys
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '还款中': 'blue',
    '逾期': 'red',
    '已结清': 'gray',
    '冻结': 'orange'
  }
  return colorMap[status] || 'default'
}

// 复制单个文本
const copyText = async (text) => {
  try {
    await copyToClipboard(text)
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 复制数据
const copyData = async (type) => {
  try {
    let dataToCopy = []
    
    if (type === 'selected') {
      dataToCopy = props.productData.filter((_, index) => selectedRows.value.includes(index))
    } else {
      dataToCopy = props.productData
    }
    
    if (dataToCopy.length === 0) {
      Message.warning('没有数据可复制')
      return
    }
    
    // 转换为CSV格式
    const headers = ['产品编号', '产品名称', '余额', '状态', '币种', '利率']
    if (props.productType === 'loan') {
      headers.push('剩余期数', '下次还款日')
    }
    
    const csvContent = [headers.join(',')]
    dataToCopy.forEach(item => {
      const row = [
        item.productKey,
        item.name,
        formatAmount(item.balance),
        item.status,
        item.currency,
        formatPercent(item.rate)
      ]
      if (props.productType === 'loan') {
        row.push(`${item.remainingPeriod}/${item.totalPeriod}`, item.nextPaymentDate || '')
      }
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    Message.success(`已复制${dataToCopy.length}条记录`)
  } catch (error) {
    Message.error('复制失败')
  }
}
</script>

<style scoped>
.product-basic-info {
  width: 100%;
}

.customer-metrics {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.metrics-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--subapp-text-primary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.products-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.copy-actions {
  display: flex;
  gap: 8px;
}

.copyable {
  cursor: pointer;
  transition: color 0.2s;
}

.copyable:hover {
  color: var(--subapp-info);
}

.amount {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 500;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  padding: 12px 16px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}
</style>