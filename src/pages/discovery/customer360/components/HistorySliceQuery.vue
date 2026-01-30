<template>
  <div class="history-slice-query">
    
    <!-- 历史记录列表 -->
    <div class="history-records-section">
      <div class="section-header">
        <h4>历史查询记录</h4>
        <div class="header-actions">
          <a-input
              v-model="searchKeyword"
              placeholder="搜索查询记录"
              style="width: 200px; margin-right: 8px"
              allow-clear
              @input="handleSearchInput"
              @clear="handleSearchClear"
            />
          <a-select
            v-model="historyFilterForm.modelName"
            placeholder="筛选数据模型"
            style="width: 150px; margin-right: 8px"
            allow-clear
            @change="handleFilterChange"
          >
            <a-option value="">全部模型</a-option>
            <a-option value="客户基础信息">客户基础信息</a-option>
            <a-option value="产品信息">产品信息</a-option>
            <a-option value="授信记录">授信记录</a-option>
            <a-option value="用信记录">用信记录</a-option>
            <a-option value="催收记录">催收记录</a-option>
            <a-option value="营销记录">营销记录</a-option>
          </a-select>
          <a-range-picker
            v-model="historyFilterForm.dateRange"
            style="width: 240px; margin-right: 8px"
            placeholder="筛选创建时间"
            @change="handleFilterChange"
            allow-clear
          />
          <a-button @click="clearFilters" size="small" style="margin-right: 8px">
            <template #icon><IconFilter /></template>
            清空筛选
          </a-button>
          <a-button @click="refreshHistoryRecords" size="small">
            <template #icon><IconRefresh /></template>
            刷新
          </a-button>
          <a-button type="primary" size="small" @click="createNewQuery">
            <template #icon><IconPlus /></template>
            新建查询
          </a-button>
        </div>
      </div>
      
      <!-- 历史记录表格 -->
      <a-table
        :data="filteredHistoryRecords"
        :loading="historyRecordsLoading"
        :pagination="historyPagination"
        row-key="id"
        @row-click="handleHistoryRecordClick"
        size="small"
      >
        <template #columns>
          <a-table-column title="模型名称" data-index="modelName" :width="150" />
          
          <a-table-column title="查询参数" data-index="conditions" :width="250">
            <template #cell="{ record }">
              {{ formatConditions(record.conditions) }}
            </template>
          </a-table-column>
          
          <a-table-column title="最近一次查询时间" data-index="createTime" :width="180">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          
          <a-table-column title="查询状态" data-index="status" :width="120" align="center">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)" size="small">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          
          <a-table-column title="结果数量" data-index="resultCount" :width="100" align="center">
            <template #cell="{ record }">
              <span v-if="record.status === '成功'">{{ record.resultCount || 0 }}</span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          
          <a-table-column title="操作" :width="200" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  type="text" 
                  size="small" 
                  @click.stop="viewHistoryDetail(record)"
                >
                  <template #icon><IconEye /></template>
                  查看
                </a-button>
                <a-button 
                  v-if="record.status === '失败' || record.status === '成功'"
                  type="text" 
                  size="small" 
                  status="warning"
                  @click.stop="retryQuery(record)"
                >
                  <template #icon><IconRefresh /></template>
                  重试
                </a-button>
                <a-popconfirm
                  v-if="record.status !== '执行中'"
                  content="确定要删除这个查询记录吗?"
                  @ok="deleteHistoryRecord(record.id)"
                >
                  <a-button 
                    type="text" 
                    size="small" 
                    status="danger"
                    @click.stop
                  >
                    <template #icon><IconDelete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
    


    
    <!-- 新建查询弹窗 -->
    <a-modal
      v-model:visible="showNewQueryModal"
      title="新建查询"
      width="800px"
      :footer="false"
      class="new-query-modal"
    >
      <div class="new-query-content">
        <a-form :model="queryForm" layout="vertical" size="medium">
          <a-form-item label="数据模型" required>
            <a-select
              v-model="queryForm.modelType"
              placeholder="请选择数据模型"
              @change="(value) => handleModelSelect(value)"
              :loading="modelsLoading"
            >
              <a-option
                v-for="model in availableModels"
                :key="model.value"
                :value="model.value"
              >
                {{ model.label }}
              </a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="查询名称" required>
            <a-input
              v-model="queryForm.name"
              placeholder="选择数据模型后将自动生成默认名称，您也可以自定义"
              :max-length="50"
              allow-clear
            >
              <template #suffix>
                <a-tooltip content="查询名称将自动生成为：数据模型名称_当前日期">
                  <IconInfoCircle style="color: #86909c" />
                </a-tooltip>
              </template>
            </a-input>
          </a-form-item>
          

          
          <!-- 动态参数配置 -->
          <div v-if="selectedModelParams.length > 0" class="params-section">
            <h5>参数配置</h5>
            <a-form-item
              v-for="param in selectedModelParams"
              :key="param.name"
              :label="param.label"
              :required="param.required"
            >
              <!-- 字符串类型 -->
              <a-input
                v-if="param.type === 'string'"
                v-model="queryForm.params[param.name]"
                :placeholder="param.placeholder || `请输入${param.label}`"
              />
              
              <!-- 数字类型 -->
              <a-input-number
                v-else-if="param.type === 'number'"
                v-model="queryForm.params[param.name]"
                :placeholder="param.placeholder || `请输入${param.label}`"
                style="width: 100%"
              />
              
              <!-- 日期类型 -->
              <a-date-picker
                v-else-if="param.type === 'date'"
                v-model="queryForm.params[param.name]"
                style="width: 100%"
                :placeholder="param.placeholder || `请选择${param.label}`"
              />
              
              <!-- 布尔类型 -->
              <a-switch
                v-else-if="param.type === 'boolean'"
                v-model="queryForm.params[param.name]"
              />
              
              <!-- 枚举类型 -->
              <a-select
                v-else-if="param.type === 'enum'"
                v-model="queryForm.params[param.name]"
                :placeholder="param.placeholder || `请选择${param.label}`"
              >
                <a-option
                  v-for="option in param.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </div>
        </a-form>
        
        <div class="modal-actions">
          <a-space>
            <a-button @click="closeNewQueryModal">取消</a-button>
            <a-button type="primary" @click="executeQuery" :loading="querying">
              执行查询
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
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
            <template #icon><IconCopy /></template>
            复制SQL
          </a-button>
        </div>
        <div class="sql-content">
          <pre><code>{{ generatedSQL }}</code></pre>
        </div>
      </div>
    </a-modal>
    
    <!-- 查询结果详情抽屉 -->
    <QueryResultDetail
      v-model:visible="showQueryResultDrawer"
      :selected-query-record="selectedQueryRecord"
      @close="selectedQueryRecord = null"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { getDataModelsList, executeDataModel } from '@/api/dataModels.js'
import { IconCopy, IconRefresh, IconDelete, IconEye, IconPlus, IconFilter, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import { copyToClipboard } from '@/utils/copy.js'
import QueryResultDetail from './QueryResultDetail.vue'

// 路由实例
const router = useRouter()

// Props定义
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({
      idCard: '110101199001011234' // 默认身份证号
    })
  }
})

// 响应式数据
const sqlPreviewVisible = ref(false)
const generatedSQL = ref('')

// 新建查询弹窗相关
const showNewQueryModal = ref(false)
const availableModels = ref([])
const selectedModelParams = ref([])
const modelsLoading = ref(false)
const querying = ref(false)
const queryForm = ref({
  name: '',
  modelType: '',
  params: {}
})

// 历史记录相关
const historyRecordsLoading = ref(false)
const searchKeyword = ref('')
const historyLoading = ref(false)
const historyQueryRecords = ref([])
const historyFilterForm = ref({
  modelName: '',
  dateRange: []
})

// 历史记录分页配置
const historyPagination = {
  pageSize: 10,
  showTotal: true,
  showPageSize: true
}

// 查询结果详情抽屉相关
const showQueryResultDrawer = ref(false)
const selectedQueryRecord = ref(null)



// 筛选后的历史查询记录
const filteredHistoryRecords = computed(() => {
  let filtered = historyQueryRecords.value
  
  // 搜索关键词筛选
  if (searchKeyword.value) {
    filtered = filtered.filter(record => 
      record.name?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      record.modelName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  // 数据模型筛选
  if (historyFilterForm.value.modelName) {
    filtered = filtered.filter(record => 
      record.modelName === historyFilterForm.value.modelName
    )
  }
  
  // 创建时间筛选
  if (historyFilterForm.value.dateRange && historyFilterForm.value.dateRange.length === 2) {
    const [startDate, endDate] = historyFilterForm.value.dateRange
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.createTime)
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  return filtered
})

// 历史记录表格列定义
const historyColumns = [
  {
    title: '模型名称',
    dataIndex: 'modelName',
    key: 'modelName',
    width: 150
  },
  {
    title: '查询参数',
    dataIndex: 'conditions',
    key: 'conditions',
    width: 250,
    render: ({ record }) => formatConditions(record.conditions)
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    render: ({ record }) => formatDateTime(record.createTime)
  },
  {
    title: '查询状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: ({ record }) => h('a-tag', { 
      color: getStatusColor(record.status) 
    }, record.status)
  },
  {
    title: '结果数量',
    dataIndex: 'resultCount',
    key: 'resultCount',
    width: 100,
    render: ({ record }) => record.resultCount || '-'
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]





// 处理筛选条件变化
const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

// 清空筛选条件
const clearFilters = () => {
  historyFilterForm.value = {
    modelName: '',
    dateRange: []
  }
  searchKeyword.value = ''
  Message.success('筛选条件已清空')
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 格式化查询条件
const formatConditions = (conditions) => {
  if (!conditions || Object.keys(conditions).length === 0) {
    return '无条件'
  }
  
  const conditionTexts = Object.entries(conditions)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
  
  return conditionTexts.length > 0 ? conditionTexts.join(', ') : '无条件'
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'green'
    case 'failed': return 'red'
    case 'pending': return 'blue'
    default: return 'gray'
  }
}

// 查看历史记录详情
const viewHistoryDetail = (record) => {
  // 打开查询结果详情抽屉
  selectedQueryRecord.value = record
  showQueryResultDrawer.value = true
  console.log('打开查询结果详情抽屉:', record)
}

// 重试查询
const retryQuery = async (record) => {
  try {
    // 更新状态为执行中
    record.status = 'pending'
    Message.info('正在重新执行查询...')
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 随机成功或失败
    const isSuccess = Math.random() > 0.3
    record.status = isSuccess ? 'completed' : 'failed'
    
    if (isSuccess) {
      record.resultCount = Math.floor(Math.random() * 100) + 1
      Message.success('查询重试成功')
    } else {
      record.resultCount = 0
      Message.error('查询重试失败')
    }
  } catch (error) {
    console.error('重试查询失败:', error)
    record.status = 'failed'
    Message.error('查询重试失败')
  }
}

// 检查是否存在相同的查询记录
const checkDuplicateQuery = (modelType, params) => {
  return historyQueryRecords.value.some(record => {
    // 检查模型类型是否相同
    if (record.modelId !== modelType) return false
    
    // 检查参数是否相同
    const recordParams = record.conditions || {}
    const currentParams = params || {}
    
    // 获取所有参数键
    const recordKeys = Object.keys(recordParams).filter(key => 
      recordParams[key] !== null && recordParams[key] !== undefined && recordParams[key] !== ''
    )
    const currentKeys = Object.keys(currentParams).filter(key => 
      currentParams[key] !== null && currentParams[key] !== undefined && currentParams[key] !== ''
    )
    
    // 如果参数数量不同，则不重复
    if (recordKeys.length !== currentKeys.length) return false
    
    // 检查每个参数值是否相同
    return recordKeys.every(key => {
      return currentKeys.includes(key) && recordParams[key] === currentParams[key]
    })
  })
}



// 删除历史记录
const deleteHistoryRecord = async (recordId) => {
  try {
    const index = historyQueryRecords.value.findIndex(record => record.id === recordId)
    if (index > -1) {
      historyQueryRecords.value.splice(index, 1)
      Message.success('历史记录已删除')
    }
  } catch (error) {
    console.error('删除历史记录失败:', error)
    Message.error('删除失败')
  }
}

// 搜索历史记录
const handleSearchInput = () => {
  // 搜索逻辑已在计算属性 filteredHistoryRecords 中处理
  console.log('搜索关键词:', searchKeyword.value)
}

// 清空搜索
const handleSearchClear = () => {
  searchKeyword.value = ''
  console.log('搜索已清空')
}

// 刷新历史记录
const refreshHistoryRecords = async () => {
  historyRecordsLoading.value = true
  try {
    await loadHistoryQueryRecords()
    Message.success('历史记录已刷新')
  } catch (error) {
    console.error('刷新历史记录失败:', error)
    Message.error('刷新失败')
  } finally {
    historyRecordsLoading.value = false
  }
}

// 新建查询
const createNewQuery = async () => {
  await loadDataModels()
  showNewQueryModal.value = true
  // 重置表单
  queryForm.value = {
    name: '',
    modelType: '',
    params: {}
  }
  selectedModelParams.value = []
}

// 监听selectedModelParams变化
watch(selectedModelParams, (newVal) => {
  console.log('参数配置更新:', newVal ? newVal.length : 0, '个参数')
}, { deep: true })

// 加载数据模型列表
const loadDataModels = async () => {
  modelsLoading.value = true
  try {
    // 模拟API调用
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { label: '客户基础信息', value: 'dm_001', description: '包含客户的基本信息如姓名、身份证、联系方式等' },
            { label: '产品持有信息', value: 'dm_002', description: '客户持有的各类金融产品信息' },
            { label: '授信记录', value: 'dm_003', description: '客户的授信历史和当前授信状态' },
            { label: '用信记录', value: 'dm_004', description: '客户的用信历史和还款记录' },
            { label: '催收记录', value: 'dm_005', description: '客户的逾期和催收相关记录' },
            { label: '营销记录', value: 'dm_006', description: '客户参与的营销活动和响应情况' }
          ]
        })
      }, 500)
    })
    
    if (response.success) {
      availableModels.value = response.data
      console.log('数据模型加载成功:', response.data.length, '个模型')
    }
  } catch (error) {
    console.error('加载数据模型失败:', error)
    // 使用默认数据
    availableModels.value = [
      { label: '客户基础信息', value: 'customer_basic', description: '包含客户的基本信息' },
      { label: '产品信息', value: 'product_info', description: '客户的产品持有信息' }
    ]
  } finally {
    modelsLoading.value = false
  }
}

// 格式化日期为 YYYY-MM-DD 格式
const formatDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 处理模型选择
const handleModelSelect = (modelType) => {
  console.log('选择数据模型:', modelType)
  
  // 根据选中的模型加载参数配置
  // 建立模型ID到参数配置的映射
  const modelParamsMap = {
    // API返回的模型ID映射
    'dm_001': [
      { name: 'customerId', label: '客户号', type: 'string', required: false, placeholder: '请输入客户号' },
      { name: 'name', label: '姓名', type: 'string', required: false, placeholder: '请输入姓名' },
      { name: 'phone', label: '手机号', type: 'string', required: false, placeholder: '请输入手机号' },
      { name: 'idCard', label: '身份证号', type: 'string', required: false, placeholder: '请输入身份证号' },
      { name: 'ageRange', label: '年龄范围', type: 'enum', required: false, options: [
        { label: '18-30岁', value: '18-30' },
        { label: '31-50岁', value: '31-50' },
        { label: '51-65岁', value: '51-65' },
        { label: '65岁以上', value: '65+' }
      ]},
      { name: 'gender', label: '性别', type: 'enum', required: false, options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]}
    ],
    'dm_002': [
      { name: 'productId', label: '产品编号', type: 'string', required: false, placeholder: '请输入产品编号' },
      { name: 'productType', label: '产品类型', type: 'enum', required: false, options: [
        { label: '储蓄卡', value: 'savings' },
        { label: '信用卡', value: 'credit' },
        { label: '理财产品', value: 'wealth' },
        { label: '贷款产品', value: 'loan' }
      ]},
      { name: 'minBalance', label: '最小余额', type: 'number', required: false, placeholder: '请输入最小余额' },
      { name: 'isActive', label: '是否激活', type: 'boolean', required: false }
    ],
    // 保留原有的键名映射以兼容默认数据
    customer_basic: [
      { name: 'customerId', label: '客户号', type: 'string', required: false, placeholder: '请输入客户号' },
      { name: 'name', label: '姓名', type: 'string', required: false, placeholder: '请输入姓名' },
      { name: 'phone', label: '手机号', type: 'string', required: false, placeholder: '请输入手机号' },
      { name: 'idCard', label: '身份证号', type: 'string', required: false, placeholder: '请输入身份证号' },
      { name: 'ageRange', label: '年龄范围', type: 'enum', required: false, options: [
        { label: '18-30岁', value: '18-30' },
        { label: '31-50岁', value: '31-50' },
        { label: '51-65岁', value: '51-65' },
        { label: '65岁以上', value: '65+' }
      ]},
      { name: 'gender', label: '性别', type: 'enum', required: false, options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]}
    ],
    customer_basic: [
      { name: 'customerId', label: '客户号', type: 'string', required: false, placeholder: '请输入客户号' },
      { name: 'name', label: '姓名', type: 'string', required: false, placeholder: '请输入姓名' },
      { name: 'phone', label: '手机号', type: 'string', required: false, placeholder: '请输入手机号' },
      { name: 'idCard', label: '身份证号', type: 'string', required: false, placeholder: '请输入身份证号' },
      { name: 'ageRange', label: '年龄范围', type: 'enum', required: false, options: [
        { label: '18-30岁', value: '18-30' },
        { label: '31-50岁', value: '31-50' },
        { label: '51-65岁', value: '51-65' },
        { label: '65岁以上', value: '65+' }
      ]},
      { name: 'gender', label: '性别', type: 'enum', required: false, options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]}
    ],
    product_info: [
      { name: 'productId', label: '产品编号', type: 'string', required: false, placeholder: '请输入产品编号' },
      { name: 'productType', label: '产品类型', type: 'enum', required: false, options: [
        { label: '储蓄卡', value: 'savings' },
        { label: '信用卡', value: 'credit' },
        { label: '理财产品', value: 'wealth' },
        { label: '贷款产品', value: 'loan' }
      ]},
      { name: 'minBalance', label: '最小余额', type: 'number', required: false, placeholder: '请输入最小余额' },
      { name: 'isActive', label: '是否激活', type: 'boolean', required: false }
    ],
    credit_record: [
      { name: 'creditId', label: '授信编号', type: 'string', required: false, placeholder: '请输入授信编号' },
      { name: 'channel', label: '渠道', type: 'enum', required: false, options: [
        { label: '线上', value: 'online' },
        { label: '线下', value: 'offline' },
        { label: '电话', value: 'phone' },
        { label: '移动端', value: 'mobile' }
      ]},
      { name: 'riskLevel', label: '风险等级', type: 'enum', required: false, options: [
        { label: '低风险', value: 'low' },
        { label: '中风险', value: 'medium' },
        { label: '高风险', value: 'high' }
      ]},
      { name: 'creditAmount', label: '授信金额', type: 'number', required: false, placeholder: '请输入授信金额' },
      { name: 'startDate', label: '开始日期', type: 'date', required: false }
    ],
    loan_record: [
      { name: 'loanId', label: '用信编号', type: 'string', required: false, placeholder: '请输入用信编号' },
      { name: 'loanAmount', label: '用信金额', type: 'number', required: false, placeholder: '请输入用信金额' },
      { name: 'loanStatus', label: '用信状态', type: 'enum', required: false, options: [
        { label: '正常', value: 'normal' },
        { label: '逾期', value: 'overdue' },
        { label: '结清', value: 'settled' }
      ]},
      { name: 'loanDate', label: '用信日期', type: 'date', required: false }
    ],
    collection_record: [
      { name: 'collectionId', label: '催收编号', type: 'string', required: false, placeholder: '请输入催收编号' },
      { name: 'collectionType', label: '催收方式', type: 'enum', required: false, options: [
        { label: '电话催收', value: 'phone' },
        { label: '短信催收', value: 'sms' },
        { label: '上门催收', value: 'visit' },
        { label: '法务催收', value: 'legal' }
      ]},
      { name: 'overdueAmount', label: '逾期金额', type: 'number', required: false, placeholder: '请输入逾期金额' },
      { name: 'overdueDays', label: '逾期天数', type: 'number', required: false, placeholder: '请输入逾期天数' }
    ],
    marketing_record: [
      { name: 'campaignId', label: '营销活动编号', type: 'string', required: false, placeholder: '请输入活动编号' },
      { name: 'marketingType', label: '营销类型', type: 'enum', required: false, options: [
        { label: '产品推广', value: 'product' },
        { label: '优惠活动', value: 'promotion' },
        { label: '客户回访', value: 'callback' },
        { label: '满意度调研', value: 'survey' }
      ]},
      { name: 'channel', label: '营销渠道', type: 'enum', required: false, options: [
        { label: '短信', value: 'sms' },
        { label: '电话', value: 'phone' },
        { label: '邮件', value: 'email' },
        { label: '推送', value: 'push' }
      ]},
      { name: 'responseStatus', label: '响应状态', type: 'enum', required: false, options: [
        { label: '已响应', value: 'responded' },
        { label: '未响应', value: 'no_response' },
        { label: '拒绝', value: 'rejected' }
      ]}
    ]
  }
  
  const params = modelParamsMap[modelType] || []
  console.log('加载参数配置:', params.length, '个参数')
  
  selectedModelParams.value = params
  
  // 重置参数值
  queryForm.value.params = {}
  
  // 自动生成查询名称：数据模型名称_当前日期
  const selectedModel = availableModels.value.find(model => model.value === modelType)
  if (selectedModel) {
    const currentDate = formatDate()
    queryForm.value.name = `${selectedModel.label}_${currentDate}`
  }
}

// 执行查询
const executeQuery = async () => {
  // 验证必填字段
  if (!queryForm.value.name) {
    Message.warning('请输入查询名称')
    return
  }
  
  if (!queryForm.value.modelType) {
    Message.warning('请选择数据模型')
    return
  }
  
  // 检查是否存在相同的查询记录
  if (checkDuplicateQuery(queryForm.value.modelType, queryForm.value.params)) {
    Modal.warning({
      title: '重复查询提醒',
      content: '已存在相同参数的查询记录，是否继续执行？',
      okText: '继续执行',
      cancelText: '取消',
      onOk: async () => {
        await performQuery()
      }
    })
    return
  }
  
  await performQuery()
}

// 执行查询的具体逻辑
const performQuery = async () => {
  // 验证必填参数
  for (const param of selectedModelParams.value) {
    if (param.required && !queryForm.value.params[param.name]) {
      Message.warning(`请填写${param.label}`)
      return
    }
  }
  
  querying.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 保存到历史记录
    await saveQueryToHistory()
    
    Message.success('查询执行成功')
    closeNewQueryModal()
    
    // 刷新历史记录
    await loadHistoryQueryRecords()
  } catch (error) {
    console.error('查询执行失败:', error)
    Message.error('查询执行失败')
  } finally {
    querying.value = false
  }
}

// 保存查询到历史记录
const saveQueryToHistory = async () => {
  const newRecord = {
    id: Date.now().toString(),
    name: queryForm.value.name,
    modelName: availableModels.value.find(m => m.value === queryForm.value.modelType)?.label || queryForm.value.modelType,
    modelId: queryForm.value.modelType,
    createTime: new Date().toISOString(),
    status: '成功',
    resultCount: Math.floor(Math.random() * 100) + 1,
    conditions: queryForm.value.params
  }
  
  historyQueryRecords.value.unshift(newRecord)
}

// 关闭新建查询弹窗
const closeNewQueryModal = () => {
  showNewQueryModal.value = false
  queryForm.value = {
    name: '',
    modelType: '',
    params: {}
  }
  selectedModelParams.value = []
}



// 加载历史查询记录
const loadHistoryQueryRecords = async () => {
  try {
    // 暂时初始化一些示例数据，包含不同状态的记录
    historyQueryRecords.value = [
      {
        id: '1',
        name: '客户基础信息查询_2024-01-15',
        modelName: '客户基础信息',
        modelId: 'customer_basic',
        createTime: '2024-01-15T10:30:00Z',
        status: 'completed',
        resultCount: 156,
        conditions: {
          customerId: '12345',
          name: '张三',
          ageRange: '31-50'
        },
        resultData: [
          {
            id: 'cust_001',
            customerId: '12345',
            name: '张三',
            phone: '13812345678',
            age: 35,
            gender: '男',
            city: '北京',
            address: '北京市朝阳区xxx街道',
            createTime: '2024-01-10T08:30:00Z'
          },
          {
            id: 'cust_002',
            customerId: '12346',
            name: '李四',
            phone: '13987654321',
            age: 28,
            gender: '女',
            city: '上海',
            address: '上海市浦东新区xxx路',
            createTime: '2024-01-11T09:15:00Z'
          },
          {
            id: 'cust_003',
            customerId: '12347',
            name: '王五',
            phone: '13611112222',
            age: 42,
            gender: '男',
            city: '广州',
            address: '广州市天河区xxx大道',
            createTime: '2024-01-12T10:20:00Z'
          }
        ]
      },
      {
        id: '2', 
        name: '产品信息查询_2024-01-14',
        modelName: '产品信息',
        modelId: 'product_info',
        createTime: '2024-01-14T15:20:00Z',
        status: 'failed',
        resultCount: 0,
        conditions: {
          productType: 'credit',
          minBalance: 1000
        },
        resultData: []
      },
      {
        id: '3',
        name: '客户信用评分查询',
        status: 'pending',
        modelName: '客户信用',
        modelId: 'customer_credit',
        conditions: {
          score: '>=800'
        },
        createTime: '2024-03-10T14:30:00Z',
        resultCount: 0,
        resultData: []
      }
    ]
    
  } catch (error) {
    console.error('加载历史记录失败:', error)
    historyQueryRecords.value = []
  }
}








// 组件挂载时加载历史记录和数据模型
onMounted(async () => {
  console.log('🌟🌟🌟🌟🌟 [HistorySliceQuery组件] 组件已成功挂载! 🌟🌟🌟🌟🌟')
  console.log('👤 传入的用户ID:', props.userId)
  console.log('📅 挂载时间:', new Date().toLocaleTimeString())
  console.log('🔍 About to call loadHistoryQueryRecords()');
  loadHistoryQueryRecords()
  console.log('🔍 About to call loadDataModels()');
  await loadDataModels()
  console.log('🔍 Component mounted initialization completed');
})

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

// 在 <script setup> 中，所有顶层声明的变量和函数都会自动暴露给模板
// 不需要使用 return 语句

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





.results-actions {
  display: flex;
  gap: 8px;
}

.records-header {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.records-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.records-title-row h5 {
  margin: 0;
  color: #1d2129;
  font-weight: 600;
}

.records-filters {
  display: flex;
  align-items: center;
}

.records-info {
  color: #4e5969;
  font-weight: 500;
  font-size: 14px;
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