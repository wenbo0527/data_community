<template>
  <div class="history-query-button">
    <!-- 历史查询按钮 -->
    <a-button 
      type="primary" 
      @click="openQueryDrawer"
      :loading="loading"
      class="query-button"
    >
      <template #icon><icon-history /></template>
      历史切片数据查询
    </a-button>

    <!-- 查询记录抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="历史切片数据查询"
      width="80%"
      :footer="false"
      placement="right"
      class="query-drawer"
    >
      <div class="drawer-content">
        <!-- 历史切片查询组件 -->
        <HistorySliceQuery :user-id="props.userInfo?.userId || props.userInfo?.customerId" />
      </div>
    </a-drawer>



    <!-- 查询结果弹窗 -->
    <a-modal
      v-model:visible="resultModalVisible"
      :title="`查询结果 - ${currentQueryRecord?.name}`"
      width="90%"
      :footer="false"
      class="result-modal"
    >
      <div class="result-content" v-if="currentQueryRecord">
        <!-- 结果统计 -->
        <div class="result-header">
          <div class="result-info">
            <a-statistic title="总记录数" :value="queryResultData.length" />
            <a-statistic title="查询时间" :value="formatTime(currentQueryRecord.createTime)" />
            <a-statistic title="数据模型" :value="getModelTypeName(currentQueryRecord.modelType)" />
          </div>

        </div>
        
        <!-- 结果表格 -->
        <a-table
          :data="queryResultData"
          :loading="resultLoading"
          :pagination="resultPagination"
          :scroll="{ x: 'max-content' }"
          size="small"
        >
          <template #columns>
            <a-table-column 
              v-for="column in resultColumns" 
              :key="column.dataIndex"
              :title="column.title"
              :data-index="column.dataIndex"
              :width="column.width"
            >
              <template #cell="{ record }">
                <span :title="record[column.dataIndex]">
                  {{ formatCellValue(record[column.dataIndex]) }}
                </span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconHistory
} from '@arco-design/web-vue/es/icon'
import { getDataModelsList } from '@/api/dataModels.ts'
import HistorySliceQuery from './HistorySliceQuery.vue'

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const loading = ref(false)
const drawerVisible = ref(false)
const resultModalVisible = ref(false)
const resultLoading = ref(false)

// 查询结果相关
const currentQueryRecord = ref(null)
const queryResultData = ref([])
const resultColumns = ref([])





// 分页配置
const resultPagination = {
  pageSize: 20,
  showTotal: true,
  showPageSize: true
}

// 数据模型配置
const modelConfigs = {
  customer_basic: {
    name: '客户基础信息',
    columns: [
      { title: '客户号', dataIndex: 'customerId', width: 120 },
      { title: '姓名', dataIndex: 'name', width: 100 },
      { title: '手机号', dataIndex: 'phone', width: 120 },
      { title: '身份证号', dataIndex: 'idCard', width: 180 },
      { title: '年龄', dataIndex: 'age', width: 80 },
      { title: '性别', dataIndex: 'gender', width: 80 },
      { title: '户籍', dataIndex: 'residence', width: 150 },
      { title: '更新时间', dataIndex: 'updateTime', width: 160 }
    ],
    fields: [
      { label: '客户号', value: 'customerId' },
      { label: '姓名', value: 'name' },
      { label: '手机号', value: 'phone' },
      { label: '年龄', value: 'age' },
      { label: '性别', value: 'gender' }
    ]
  },
  product_info: {
    name: '产品信息',
    columns: [
      { title: '产品编号', dataIndex: 'productId', width: 120 },
      { title: '产品名称', dataIndex: 'productName', width: 150 },
      { title: '产品类型', dataIndex: 'productType', width: 100 },
      { title: '余额', dataIndex: 'balance', width: 120 },
      { title: '状态', dataIndex: 'status', width: 100 },
      { title: '开户时间', dataIndex: 'openTime', width: 160 },
      { title: '更新时间', dataIndex: 'updateTime', width: 160 }
    ],
    fields: [
      { label: '产品编号', value: 'productId' },
      { label: '产品名称', value: 'productName' },
      { label: '产品类型', value: 'productType' },
      { label: '余额', value: 'balance' },
      { label: '状态', value: 'status' }
    ]
  },
  credit_record: {
    name: '授信记录',
    columns: [
      { title: '授信编号', dataIndex: 'creditId', width: 120 },
      { title: '授信日期', dataIndex: 'creditDate', width: 120 },
      { title: '渠道', dataIndex: 'channel', width: 100 },
      { title: '结果', dataIndex: 'result', width: 100 },
      { title: '初始额度', dataIndex: 'initialLimit', width: 120 },
      { title: '当前额度', dataIndex: 'currentLimit', width: 120 },
      { title: '风险等级', dataIndex: 'riskLevel', width: 100 }
    ],
    fields: [
      { label: '授信编号', value: 'creditId' },
      { label: '渠道', value: 'channel' },
      { label: '结果', value: 'result' },
      { label: '风险等级', value: 'riskLevel' }
    ]
  },
  loan_record: {
    name: '用信记录',
    columns: [
      { title: '用信编号', dataIndex: 'loanId', width: 120 },
      { title: '用信日期', dataIndex: 'loanDate', width: 120 },
      { title: '产品名称', dataIndex: 'productName', width: 150 },
      { title: '金额', dataIndex: 'amount', width: 120 },
      { title: '余额', dataIndex: 'balance', width: 120 },
      { title: '状态', dataIndex: 'status', width: 100 },
      { title: '分期数', dataIndex: 'installments', width: 100 }
    ],
    fields: [
      { label: '用信编号', value: 'loanId' },
      { label: '产品名称', value: 'productName' },
      { label: '金额', value: 'amount' },
      { label: '状态', value: 'status' }
    ]
  },
  collection_record: {
    name: '催收记录',
    columns: [
      { title: '催收编号', dataIndex: 'collectionId', width: 120 },
      { title: '催收时间', dataIndex: 'collectionTime', width: 160 },
      { title: '催收方式', dataIndex: 'collectionType', width: 100 },
      { title: '催收结果', dataIndex: 'result', width: 100 },
      { title: '催收人员', dataIndex: 'collector', width: 100 },
      { title: '逾期金额', dataIndex: 'overdueAmount', width: 120 },
      { title: '逾期天数', dataIndex: 'overdueDays', width: 100 }
    ],
    fields: [
      { label: '催收编号', value: 'collectionId' },
      { label: '催收方式', value: 'collectionType' },
      { label: '催收结果', value: 'result' },
      { label: '催收人员', value: 'collector' }
    ]
  },
  marketing_record: {
    name: '营销记录',
    columns: [
      { title: '记录编号', dataIndex: 'recordId', width: 120 },
      { title: '营销时间', dataIndex: 'marketingTime', width: 160 },
      { title: '营销类型', dataIndex: 'marketingType', width: 100 },
      { title: '营销内容', dataIndex: 'content', width: 200 },
      { title: '营销结果', dataIndex: 'result', width: 100 },
      { title: '执行人员', dataIndex: 'operator', width: 100 }
    ],
    fields: [
      { label: '记录编号', value: 'recordId' },
      { label: '营销类型', value: 'marketingType' },
      { label: '营销结果', value: 'result' },
      { label: '执行人员', value: 'operator' }
    ]
  }
}

// 计算属性（暂无）

// 方法
const openQueryDrawer = () => {
  drawerVisible.value = true
}









const viewQueryResult = async (record) => {
  currentQueryRecord.value = record
  resultModalVisible.value = true
  resultLoading.value = true
  
  try {
    // 模拟加载查询结果
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const config = modelConfigs[record.modelType]
    resultColumns.value = config.columns
    queryResultData.value = generateMockResultData(record.modelType, record.resultCount)
  } catch (error) {
    Message.error('加载查询结果失败')
  } finally {
    resultLoading.value = false
  }
}

const generateMockResultData = (modelType, count) => {
  const data = []
  const config = modelConfigs[modelType]
  
  for (let i = 0; i < count; i++) {
    const record = {}
    config.columns.forEach(column => {
      record[column.dataIndex] = generateMockValue(column.dataIndex, i)
    })
    data.push(record)
  }
  
  return data
}

const generateMockValue = (field, index) => {
  const mockValues = {
    customerId: `C${String(index + 1).padStart(6, '0')}`,
    name: `客户${index + 1}`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    idCard: `${Math.floor(Math.random() * 900000) + 100000}${Math.floor(Math.random() * 90) + 10}0101${Math.floor(Math.random() * 9000) + 1000}`,
    age: Math.floor(Math.random() * 50) + 20,
    gender: Math.random() > 0.5 ? '男' : '女',
    residence: ['北京市', '上海市', '广州市', '深圳市', '杭州市'][Math.floor(Math.random() * 5)],
    productId: `P${String(index + 1).padStart(6, '0')}`,
    productName: ['储蓄卡', '信用卡', '理财产品', '贷款产品'][Math.floor(Math.random() * 4)],
    productType: ['自营', '助贷'][Math.floor(Math.random() * 2)],
    balance: (Math.random() * 100000).toFixed(2),
    status: ['正常', '冻结', '注销'][Math.floor(Math.random() * 3)],
    creditId: `CR${String(index + 1).padStart(6, '0')}`,
    creditDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    channel: ['线上', '线下', '电话'][Math.floor(Math.random() * 3)],
    result: ['通过', '拒绝', '待审核'][Math.floor(Math.random() * 3)],
    initialLimit: (Math.random() * 50000).toFixed(2),
    currentLimit: (Math.random() * 50000).toFixed(2),
    riskLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)],
    loanId: `LN${String(index + 1).padStart(6, '0')}`,
    loanDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: (Math.random() * 100000).toFixed(2),
    installments: Math.floor(Math.random() * 36) + 1,
    collectionId: `CL${String(index + 1).padStart(6, '0')}`,
    collectionTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    collectionType: ['电话', '短信', '上门'][Math.floor(Math.random() * 3)],
    collector: `催收员${index + 1}`,
    overdueAmount: (Math.random() * 10000).toFixed(2),
    overdueDays: Math.floor(Math.random() * 90) + 1,
    recordId: `MR${String(index + 1).padStart(6, '0')}`,
    marketingTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    marketingType: ['短信', '电话', '邮件'][Math.floor(Math.random() * 3)],
    content: `营销内容${index + 1}`,
    operator: `营销员${index + 1}`,
    openTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date().toISOString()
  }
  
  return mockValues[field] || `值${index + 1}`
}









// 工具方法
const getModelTypeName = (modelType) => {
  const model = modelConfigs[modelType]
  return model?.name || modelType
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    running: 'blue',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    completed: '已完成',
    running: '执行中',
    failed: '失败'
  }
  return texts[status] || '未知'
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}



const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...'
  }
  return value
}



// 生命周期
onMounted(() => {
  // 组件初始化
})
</script>

<style scoped>
.history-query-button {
  width: 100%;
}

.query-button {
  width: 100%;
  height: 40px;
  font-size: 14px;
}

.query-drawer {
  :deep(.arco-drawer-body) {
    padding: 0;
  }
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}



.new-query-form {
  width: 100%;
}



.result-modal {
  :deep(.arco-modal-body) {
    padding: 16px;
  }
}

.result-content {
  width: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.result-info {
  display: flex;
  gap: 32px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-tbody .arco-table-tr) {
  cursor: pointer;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-statistic-title) {
  font-size: 12px;
  color: #86909c;
}

:deep(.arco-statistic-content) {
  font-size: 16px;
  font-weight: 600;
}
</style>