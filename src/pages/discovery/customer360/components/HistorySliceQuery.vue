<template>
  <div class="history-slice-query">
    <div class="section-header">
      <h4>历史切片数据查询</h4>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <!-- 查询条件 -->
    <div class="query-form">
      <a-form :model="queryForm" layout="inline" size="small">
        <a-form-item label="数据模型">
          <a-select 
            v-model="queryForm.modelType" 
            placeholder="选择数据模型"
            style="width: 200px"
            @change="handleModelChange"
          >
            <a-option value="customer_basic">客户基础信息</a-option>
            <a-option value="product_info">产品信息</a-option>
            <a-option value="credit_record">授信记录</a-option>
            <a-option value="loan_record">用信记录</a-option>
            <a-option value="collection_record">催收记录</a-option>
            <a-option value="marketing_record">营销记录</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="查询日期">
          <a-date-picker 
            v-model="queryForm.queryDate" 
            placeholder="选择查询日期"
            style="width: 200px"
            @change="handleDateChange"
          />
        </a-form-item>
        
        <a-form-item label="版本">
          <a-select 
            v-model="queryForm.version" 
            placeholder="选择版本"
            style="width: 150px"
            :disabled="!queryForm.modelType"
          >
            <a-option v-for="version in availableVersions" :key="version" :value="version">
              {{ version }}
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" @click="executeQuery" :loading="querying">
            <template #icon><icon-search /></template>
            查询
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    
    <!-- 查询结果 -->
    <div class="query-results" v-if="queryResults.length > 0">
      <div class="results-header">
        <div class="results-info">
          <span>查询结果：共 {{ queryResults.length }} 条记录</span>
          <a-tag color="blue" v-if="queryForm.modelType">{{ getModelTypeName(queryForm.modelType) }}</a-tag>
          <a-tag color="green" v-if="queryForm.queryDate">{{ queryForm.queryDate }}</a-tag>
          <a-tag color="orange" v-if="queryForm.version">{{ queryForm.version }}</a-tag>
        </div>
        <div class="results-actions">
          <a-button size="small" @click="copyResults('selected')" :disabled="selectedRows.length === 0">
            <template #icon><icon-copy /></template>
            复制选中
          </a-button>
          <a-button size="small" @click="copyResults('all')">
            <template #icon><icon-copy /></template>
            复制全部
          </a-button>
          <a-button size="small" @click="exportResults">
            <template #icon><icon-download /></template>
            导出
          </a-button>
        </div>
      </div>
      
      <a-table 
        :data="queryResults" 
        :loading="querying"
        :row-selection="rowSelection"
        :pagination="pagination"
        :scroll="{ x: 'max-content' }"
        size="small"
        @selection-change="handleSelectionChange"
      >
        <template #columns>
          <a-table-column 
            v-for="column in dynamicColumns" 
            :key="column.dataIndex"
            :title="column.title"
            :data-index="column.dataIndex"
            :width="column.width"
          >
            <template #cell="{ record }">
              <div class="cell-content">
                <span 
                  class="copyable" 
                  @click="copyText(record[column.dataIndex])"
                  :title="record[column.dataIndex]"
                >
                  {{ formatCellValue(record[column.dataIndex]) }}
                </span>
                <a-button 
                  type="text" 
                  size="mini" 
                  @click="copyText(record[column.dataIndex])"
                  class="copy-btn"
                >
                  <template #icon><icon-copy /></template>
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
        
        <template #empty>
          <a-empty description="暂无查询结果" />
        </template>
      </a-table>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else-if="!querying">
      <a-empty description="请选择查询条件并执行查询" />
    </div>
    
    <!-- SQL预览弹窗 -->
    <a-modal 
      v-model:visible="sqlPreviewVisible" 
      title="SQL查询预览" 
      width="800px"
      :footer="false"
    >
      <div class="sql-preview">
        <div class="sql-actions">
          <a-button size="small" @click="copyText(generatedSQL)">
            <template #icon><icon-copy /></template>
            复制SQL
          </a-button>
        </div>
        <div class="sql-content">
          <pre><code>{{ generatedSQL }}</code></pre>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy, IconRefresh, IconSearch, IconDownload } from '@arco-design/web-vue/es/icon'
import { copyToClipboard } from '../../../../utils/copy'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const querying = ref(false)
const selectedRows = ref([])
const sqlPreviewVisible = ref(false)
const generatedSQL = ref('')

// 查询表单
const queryForm = ref({
  modelType: '',
  queryDate: '',
  version: ''
})

// 查询结果
const queryResults = ref([])

// 可用版本列表
const availableVersions = ref(['v1.0', 'v1.1', 'v1.2', 'v2.0', 'v2.1'])

// 动态列配置
const dynamicColumns = ref([])

// 分页配置
const pagination = {
  pageSize: 20,
  showTotal: true,
  showPageSize: true
}

// 表格行选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true
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
    ]
  }
}

// 处理模型类型变化
const handleModelChange = (modelType) => {
  if (modelType && modelConfigs[modelType]) {
    dynamicColumns.value = modelConfigs[modelType].columns
  } else {
    dynamicColumns.value = []
  }
  queryResults.value = []
}

// 处理日期变化
const handleDateChange = (date) => {
  queryResults.value = []
}

// 处理行选择变化
const handleSelectionChange = (selectedRowKeys) => {
  selectedRows.value = selectedRowKeys
}

// 获取模型类型名称
const getModelTypeName = (modelType) => {
  return modelConfigs[modelType]?.name || modelType
}

// 格式化单元格值
const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return value
}

// 执行查询
const executeQuery = async () => {
  if (!queryForm.value.modelType) {
    Message.warning('请选择数据模型')
    return
  }
  
  if (!queryForm.value.queryDate) {
    Message.warning('请选择查询日期')
    return
  }
  
  querying.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成模拟数据
    const mockData = generateMockData(queryForm.value.modelType, 15)
    queryResults.value = mockData
    
    // 生成SQL
    generatedSQL.value = generateSQL()
    
    Message.success(`查询完成，共找到 ${mockData.length} 条记录`)
  } catch (error) {
    Message.error('查询失败，请重试')
  } finally {
    querying.value = false
  }
}

// 生成模拟数据
const generateMockData = (modelType, count) => {
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

// 生成模拟值
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

// 生成SQL
const generateSQL = () => {
  const tableName = `${queryForm.value.modelType}_${queryForm.value.queryDate.replace(/-/g, '')}`
  const columns = dynamicColumns.value.map(col => col.dataIndex).join(', ')
  
  return `SELECT ${columns}
FROM ${tableName}
WHERE customer_id = '${props.userInfo.customerId || 'C000001'}'
  AND date_partition = '${queryForm.value.queryDate}'
  AND version = '${queryForm.value.version}'
ORDER BY update_time DESC
LIMIT 1000;`
}

// 刷新数据
const refreshData = () => {
  if (queryForm.value.modelType && queryForm.value.queryDate) {
    executeQuery()
  } else {
    Message.info('请先设置查询条件')
  }
}

// 复制单个文本
const copyText = async (text) => {
  if (!text) {
    Message.warning('没有内容可复制')
    return
  }
  try {
    await copyToClipboard(String(text))
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 复制查询结果
const copyResults = async (type) => {
  try {
    let dataToCopy = []
    
    if (type === 'selected') {
      dataToCopy = queryResults.value.filter((_, index) => selectedRows.value.includes(index))
    } else {
      dataToCopy = queryResults.value
    }
    
    if (dataToCopy.length === 0) {
      Message.warning('没有数据可复制')
      return
    }
    
    // 转换为CSV格式
    const headers = dynamicColumns.value.map(col => col.title)
    const csvContent = [headers.join(',')]
    
    dataToCopy.forEach(item => {
      const row = dynamicColumns.value.map(col => item[col.dataIndex] || '')
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    Message.success(`已复制${dataToCopy.length}条记录`)
  } catch (error) {
    Message.error('复制失败')
  }
}

// 导出结果
const exportResults = () => {
  if (queryResults.value.length === 0) {
    Message.warning('没有数据可导出')
    return
  }
  
  // 这里可以实现真实的导出功能
  Message.info('导出功能开发中...')
}
</script>

<style scoped>
.history-slice-query {
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
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.query-form {
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.query-results {
  width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.copyable {
  flex: 1;
  cursor: pointer;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copyable:hover {
  color: #1890ff;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.cell-content:hover .copy-btn {
  opacity: 1;
}

.sql-preview {
  width: 100%;
}

.sql-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.sql-content {
  background-color: #f7f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
}

.sql-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  padding: 8px 12px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-form-item) {
  margin-bottom: 0;
}
</style>