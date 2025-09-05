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
        <!-- 操作栏 -->
        <div class="action-bar">
          <div class="action-left">
            <a-input-search
              v-model="searchKeyword"
              placeholder="搜索查询记录..."
              style="width: 300px"
              @search="handleSearch"
            />
          </div>
          <div class="action-right">
            <a-button type="primary" @click="openNewQueryModal">
              <template #icon><icon-plus /></template>
              新建查询
            </a-button>
            <a-button @click="refreshQueryRecords">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
          </div>
        </div>

        <!-- 查询记录列表 -->
        <div class="query-records">
          <a-table
            :data="filteredQueryRecords"
            :loading="recordsLoading"
            :pagination="pagination"
            row-key="id"
            @row-click="handleRecordClick"
          >
            <template #columns>
              <a-table-column title="查询名称" data-index="name" :width="200">
                <template #cell="{ record }">
                  <div class="record-name">
                    <span>{{ record.name }}</span>
                    <a-tag 
                      :color="getStatusColor(record.status)" 
                      size="small"
                    >
                      {{ getStatusText(record.status) }}
                    </a-tag>
                  </div>
                </template>
              </a-table-column>
              
              <a-table-column title="数据模型" data-index="modelType" :width="150">
                <template #cell="{ record }">
                  {{ getModelTypeName(record.modelType) }}
                </template>
              </a-table-column>
              
              <a-table-column title="查询条件" data-index="conditions" :width="300">
                <template #cell="{ record }">
                  <div class="conditions-preview">
                    <a-tag v-if="record.queryDate" size="small">{{ record.queryDate }}</a-tag>
                    <a-tag v-if="record.version" size="small">{{ record.version }}</a-tag>
                    <span v-if="record.customConditions" class="custom-conditions">
                      {{ formatConditions(record.customConditions) }}
                    </span>
                  </div>
                </template>
              </a-table-column>
              
              <a-table-column title="结果数量" data-index="resultCount" :width="100" align="center">
                <template #cell="{ record }">
                  <span v-if="record.status === 'completed'">{{ record.resultCount || 0 }}</span>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              
              <a-table-column title="创建时间" data-index="createTime" :width="160">
                <template #cell="{ record }">
                  {{ formatTime(record.createTime) }}
                </template>
              </a-table-column>
              
              <a-table-column title="操作" :width="150" fixed="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-button 
                      type="text" 
                      size="small" 
                      @click.stop="viewQueryResult(record)"
                      :disabled="record.status !== 'completed'"
                    >
                      查看结果
                    </a-button>
                    <a-button 
                      type="text" 
                      size="small" 
                      @click.stop="duplicateQuery(record)"
                    >
                      复制查询
                    </a-button>
                    <a-popconfirm
                      content="确定要删除这个查询记录吗？"
                      @ok="deleteQueryRecord(record.id)"
                    >
                      <a-button 
                        type="text" 
                        size="small" 
                        status="danger"
                        @click.stop
                      >
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
            
            <template #empty>
              <a-empty description="暂无查询记录">
                <template #image>
                  <icon-file />
                </template>
                <a-button type="primary" @click="openNewQueryModal">
                  创建第一个查询
                </a-button>
              </a-empty>
            </template>
          </a-table>
        </div>
      </div>
    </a-drawer>

    <!-- 新建查询弹窗 -->
    <a-modal
      v-model:visible="newQueryModalVisible"
      title="新建历史切片数据查询"
      width="600px"
      @ok="createNewQuery"
      @cancel="resetNewQueryForm"
      :confirm-loading="creating"
    >
      <div class="new-query-form">
        <a-form :model="newQueryForm" layout="vertical" ref="newQueryFormRef">
          <a-form-item 
            label="查询名称" 
            field="name" 
            :rules="[{ required: true, message: '请输入查询名称' }]"
          >
            <a-input 
              v-model="newQueryForm.name" 
              placeholder="请输入查询名称"
              :max-length="50"
            />
          </a-form-item>
          
          <a-form-item 
            label="数据模型" 
            field="modelType" 
            :rules="[{ required: true, message: '请选择数据模型' }]"
          >
            <a-select 
              v-model="newQueryForm.modelType" 
              placeholder="选择数据模型"
              @change="handleNewQueryModelChange"
            >
              <a-option value="customer_basic">客户基础信息</a-option>
              <a-option value="product_info">产品信息</a-option>
              <a-option value="credit_record">授信记录</a-option>
              <a-option value="loan_record">用信记录</a-option>
              <a-option value="collection_record">催收记录</a-option>
              <a-option value="marketing_record">营销记录</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item 
            label="查询日期" 
            field="queryDate" 
            :rules="[{ required: true, message: '请选择查询日期' }]"
          >
            <a-date-picker 
              v-model="newQueryForm.queryDate" 
              placeholder="选择查询日期"
              style="width: 100%"
            />
          </a-form-item>
          
          <!-- 自定义查询条件 -->
          <a-form-item label="自定义条件（可选）">
            <div class="custom-conditions">
              <div 
                v-for="(condition, index) in newQueryForm.customConditions" 
                :key="index"
                class="condition-row"
              >
                <a-select 
                  v-model="condition.field" 
                  placeholder="选择字段"
                  style="width: 150px"
                >
                  <a-option 
                    v-for="field in availableFields" 
                    :key="field.value" 
                    :value="field.value"
                  >
                    {{ field.label }}
                  </a-option>
                </a-select>
                
                <a-select 
                  v-model="condition.operator" 
                  placeholder="操作符"
                  style="width: 100px"
                >
                  <a-option value="=">等于</a-option>
                  <a-option value="!=">不等于</a-option>
                  <a-option value=">">&gt;</a-option>
                  <a-option value="<">&lt;</a-option>
                  <a-option value="like">包含</a-option>
                </a-select>
                
                <a-input 
                  v-model="condition.value" 
                  placeholder="值"
                  style="flex: 1"
                />
                
                <a-button 
                  type="text" 
                  status="danger" 
                  @click="removeCondition(index)"
                >
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
              
              <a-button 
                type="dashed" 
                @click="addCondition"
                style="width: 100%; margin-top: 8px"
              >
                <template #icon><icon-plus /></template>
                添加条件
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

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
          <div class="result-actions">
            <a-button @click="copyQueryResult">
              <template #icon><icon-copy /></template>
              复制
            </a-button>
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
  IconHistory, 
  IconPlus, 
  IconRefresh, 
  IconFile, 
  IconDelete, 
  IconCopy 
} from '@arco-design/web-vue/es/icon'
import { copyToClipboard } from '../../../../utils/copy'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const loading = ref(false)
const drawerVisible = ref(false)
const newQueryModalVisible = ref(false)
const resultModalVisible = ref(false)
const recordsLoading = ref(false)
const resultLoading = ref(false)
const creating = ref(false)
const searchKeyword = ref('')

// 查询记录相关
const queryRecords = ref([])
const currentQueryRecord = ref(null)
const queryResultData = ref([])
const resultColumns = ref([])

// 新建查询表单
const newQueryForm = ref({
  name: '',
  modelType: '',
  queryDate: '',
  customConditions: []
})

const newQueryFormRef = ref(null)

// 可用字段
const availableFields = ref([])

// 分页配置
const pagination = {
  pageSize: 10,
  showTotal: true,
  showPageSize: true
}

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

// 计算属性
const filteredQueryRecords = computed(() => {
  if (!searchKeyword.value) {
    return queryRecords.value
  }
  return queryRecords.value.filter(record => 
    record.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    getModelTypeName(record.modelType).toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const openQueryDrawer = () => {
  drawerVisible.value = true
  loadQueryRecords()
}

const openNewQueryModal = () => {
  newQueryModalVisible.value = true
  resetNewQueryForm()
}

const resetNewQueryForm = () => {
  newQueryForm.value = {
    name: '',
    modelType: '',
    queryDate: '',
    customConditions: []
  }
  availableFields.value = []
}

const handleNewQueryModelChange = (modelType) => {
  if (modelType && modelConfigs[modelType]) {
    availableFields.value = modelConfigs[modelType].fields
  } else {
    availableFields.value = []
  }
}

const addCondition = () => {
  newQueryForm.value.customConditions.push({
    field: '',
    operator: '=',
    value: ''
  })
}

const removeCondition = (index) => {
  newQueryForm.value.customConditions.splice(index, 1)
}

const createNewQuery = async () => {
  try {
    const valid = await newQueryFormRef.value.validate()
    if (!valid) return
    
    creating.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newQuery = {
      id: Date.now().toString(),
      name: newQueryForm.value.name,
      modelType: newQueryForm.value.modelType,
      queryDate: newQueryForm.value.queryDate,
      customConditions: newQueryForm.value.customConditions.filter(c => c.field && c.value),
      status: 'running',
      createTime: new Date().toISOString(),
      resultCount: 0
    }
    
    queryRecords.value.unshift(newQuery)
    
    // 模拟查询执行
    setTimeout(() => {
      const record = queryRecords.value.find(r => r.id === newQuery.id)
      if (record) {
        record.status = 'completed'
        record.resultCount = Math.floor(Math.random() * 100) + 1
      }
    }, 3000)
    
    Message.success('查询任务创建成功')
    newQueryModalVisible.value = false
    resetNewQueryForm()
  } catch (error) {
    Message.error('创建查询失败')
  } finally {
    creating.value = false
  }
}

const loadQueryRecords = async () => {
  recordsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成模拟数据
    if (queryRecords.value.length === 0) {
      queryRecords.value = generateMockQueryRecords()
    }
  } catch (error) {
    Message.error('加载查询记录失败')
  } finally {
    recordsLoading.value = false
  }
}

const generateMockQueryRecords = () => {
  const records = []
  const modelTypes = Object.keys(modelConfigs)
  const statuses = ['completed', 'running', 'failed']
  
  for (let i = 0; i < 8; i++) {
    const modelType = modelTypes[Math.floor(Math.random() * modelTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    records.push({
      id: (i + 1).toString(),
      name: `查询任务${i + 1}`,
      modelType,
      queryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      customConditions: [],
      status,
      createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      resultCount: status === 'completed' ? Math.floor(Math.random() * 100) + 1 : 0
    })
  }
  
  return records.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const refreshQueryRecords = () => {
  loadQueryRecords()
}

const handleRecordClick = (record) => {
  if (record.status === 'completed') {
    viewQueryResult(record)
  }
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

const duplicateQuery = (record) => {
  newQueryForm.value = {
    name: `${record.name} - 副本`,
    modelType: record.modelType,
    queryDate: record.queryDate,
    customConditions: [...record.customConditions]
  }
  handleNewQueryModelChange(record.modelType)
  newQueryModalVisible.value = true
}

const deleteQueryRecord = async (id) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = queryRecords.value.findIndex(r => r.id === id)
    if (index > -1) {
      queryRecords.value.splice(index, 1)
      Message.success('删除成功')
    }
  } catch (error) {
    Message.error('删除失败')
  }
}

const copyQueryResult = async () => {
  try {
    const headers = resultColumns.value.map(col => col.title)
    const csvContent = [headers.join(',')]
    
    queryResultData.value.forEach(item => {
      const row = resultColumns.value.map(col => item[col.dataIndex] || '')
      csvContent.push(row.join(','))
    })
    
    await copyToClipboard(csvContent.join('\n'))
    Message.success('复制成功')
  } catch (error) {
    Message.error('复制失败')
  }
}

// 工具方法
const getModelTypeName = (modelType) => {
  return modelConfigs[modelType]?.name || modelType
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

const formatConditions = (conditions) => {
  if (!conditions || conditions.length === 0) return '无'
  return conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(', ')
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

// 监听器
watch(() => newQueryForm.value.modelType, (newModelType) => {
  handleNewQueryModelChange(newModelType)
  // 当模型类型变更时，清空版本选择
  if (newQueryForm.value.version) {
    newQueryForm.value.version = ''
  }
})

// 生命周期
onMounted(() => {
  // 组件挂载时可以预加载一些数据
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
  background-color: #f7f8fa;
}

.action-left {
  display: flex;
  align-items: center;
}

.action-right {
  display: flex;
  gap: 8px;
}

.query-records {
  flex: 1;
  padding: 16px 24px;
  overflow: auto;
}

.record-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.conditions-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.custom-conditions {
  font-size: 12px;
  color: #86909c;
  margin-left: 4px;
}

.new-query-form {
  width: 100%;
}

.custom-conditions {
  width: 100%;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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