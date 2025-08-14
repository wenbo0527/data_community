<template>
  <div class="detail-data-query-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">明细数据查询服务</h1>
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <icon-plus />
          </template>
          添加申请
        </a-button>
      </div>
      <div class="page-description">
        基于数据查询管理模型，选择明细数据下载模板，配置查询参数并获取结构化数据结果。
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <a-card class="filter-card">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input 
              v-model="searchForm.keyword"
              placeholder="搜索申请ID或模板名称"
              allow-clear
              @input="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="searchForm.status"
              placeholder="状态筛选"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="pending">待处理</a-option>
              <a-option value="processing">处理中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="failed">失败</a-option>
              <a-option value="cancelled">已取消</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-range-picker 
              v-model="searchForm.dateRange"
              placeholder="申请时间范围"
              style="width: 100%"
              @change="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="searchForm.templateName"
              placeholder="模板筛选"
              allow-clear
              @change="handleSearch"
            >
              <a-option 
                v-for="template in templates" 
                :key="template.id" 
                :value="template.name"
              >
                {{ template.name }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-button @click="resetSearch">重置</a-button>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 申请列表表格 -->
    <div class="applications-table-section">
      <a-table 
        :data="filteredApplications"
        :columns="tableColumns"
        :pagination="paginationConfig"
        :loading="tableLoading"
        row-key="id"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @sorter-change="handleSorterChange"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
        </template>
        
        <template #applyTime="{ record }">
          {{ formatDate(record.applyTime) }}
        </template>
        
        <template #resultCount="{ record }">
          <span v-if="record.resultCount">{{ record.resultCount }}条</span>
          <span v-else>-</span>
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button 
              v-if="record.status === 'completed'" 
              type="text" 
              size="small"
              @click="downloadResult(record.id)"
            >
              <template #icon>
                <icon-download />
              </template>
              下载
            </a-button>
            <a-button 
              v-if="record.status === 'pending' || record.status === 'processing'" 
              type="text" 
              size="small"
              status="danger"
              @click="cancelApplication(record.id)"
            >
              <template #icon>
                <icon-close />
              </template>
              取消
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="viewApplicationDetail(record.id)"
            >
              <template #icon>
                <icon-eye />
              </template>
              详情
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 添加申请弹窗 -->
    <a-modal 
      v-model:visible="showAddModal" 
      title="添加明细数据查询申请" 
      width="800px"
      :footer="false"
      @cancel="resetAddForm"
    >
      <div class="add-modal-content">
        <!-- 步骤指示器 -->
        <a-steps :current="currentStep" class="steps-indicator">
          <a-step title="选择模板" />
          <a-step title="配置参数" />
          <a-step title="确认提交" />
        </a-steps>

        <!-- 步骤1：选择模板 -->
        <div v-if="currentStep === 0" class="step-content">
          <div class="step-title">选择数据模板</div>
          <a-select 
            v-model="addForm.templateId" 
            placeholder="请选择明细数据下载模板"
            class="template-selector"
            :loading="templatesLoading"
            @change="onTemplateChange"
          >
            <a-option 
              v-for="template in templates" 
              :key="template.id" 
              :value="template.id"
            >
              <div class="template-option">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </a-option>
          </a-select>

          <!-- 模板信息展示 -->
          <div v-if="selectedTemplate" class="template-info">
            <a-card title="模板信息" class="info-card">
              <div class="template-details">
                <div class="detail-item">
                  <span class="label">模板名称：</span>
                  <span class="value">{{ selectedTemplate.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">使用场景：</span>
                  <span class="value">{{ selectedTemplate.useCase }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">查询语言：</span>
                  <span class="value">{{ selectedTemplate.language.toUpperCase() }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">描述：</span>
                  <span class="value">{{ selectedTemplate.description }}</span>
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <!-- 步骤2：配置参数 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-title">配置查询参数</div>
          
          <!-- 入参配置 -->
          <a-card title="查询条件" class="params-card">
            <a-form :model="addForm.queryParams" layout="vertical">
              <div class="params-grid">
                <a-form-item 
                  v-for="param in selectedTemplate?.inputParams || []" 
                  :key="param.id"
                  :label="param.name"
                  :required="param.required"
                  class="param-item"
                >
                  <template #label>
                    <div class="param-label">
                      <span>{{ param.name }}</span>
                      <span v-if="param.required" class="required-star">*</span>
                      <a-tooltip :content="param.description">
                        <icon-info-circle class="param-info" />
                      </a-tooltip>
                    </div>
                  </template>
                  
                  <!-- 根据参数类型渲染不同的输入控件 -->
                  <a-input 
                    v-if="param.type === 'string'"
                    v-model="addForm.queryParams[param.name]"
                    :placeholder="param.description"
                  />
                  <a-input-number 
                    v-else-if="param.type === 'number'"
                    v-model="addForm.queryParams[param.name]"
                    :placeholder="param.description"
                    style="width: 100%"
                  />
                  <a-date-picker 
                    v-else-if="param.type === 'date'"
                    v-model="addForm.queryParams[param.name]"
                    :placeholder="param.description"
                    style="width: 100%"
                  />
                  <a-switch 
                    v-else-if="param.type === 'boolean'"
                    v-model="addForm.queryParams[param.name]"
                  />
                  <a-textarea 
                    v-else
                    v-model="addForm.queryParams[param.name]"
                    :placeholder="param.description"
                    :auto-size="{ minRows: 2, maxRows: 4 }"
                  />
                </a-form-item>
              </div>
            </a-form>
          </a-card>

          <!-- 输出字段选择 -->
          <a-card title="输出字段" class="output-fields-card">
            <div class="fields-header">
              <a-checkbox 
                :model-value="isAllFieldsSelected"
                :indeterminate="isIndeterminate"
                @change="toggleAllFields"
              >
                全选
              </a-checkbox>
              <span class="selected-count">已选择 {{ addForm.outputFields.length }} / {{ selectedTemplate?.outputFields?.length || 0 }} 个字段</span>
            </div>
            <div class="fields-grid">
              <a-checkbox 
                v-for="field in selectedTemplate?.outputFields || []" 
                :key="field.name"
                :model-value="addForm.outputFields.includes(field.name)"
                @change="toggleField(field.name, $event)"
                class="field-checkbox"
              >
                <div class="field-info">
                  <div class="field-name">{{ field.name }}</div>
                  <div class="field-type">{{ field.type }}</div>
                  <div class="field-desc">{{ field.description }}</div>
                </div>
              </a-checkbox>
            </div>
          </a-card>

          <!-- 查询配置 -->
          <a-card title="查询配置" class="query-config-card">
            <a-form :model="addForm" layout="vertical">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="数据量限制">
                    <a-input-number 
                      v-model="addForm.dataLimit"
                      :min="1"
                      :max="1000000"
                      placeholder="最大数据条数"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="输出格式">
                    <a-select v-model="addForm.outputFormat" placeholder="选择输出格式">
                      <a-option value="csv">CSV</a-option>
                      <a-option value="excel">Excel</a-option>
                      <a-option value="json">JSON</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <!-- 步骤3：确认提交 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-title">确认申请信息</div>
          
          <a-card title="申请摘要" class="summary-card">
            <div class="summary-content">
              <div class="summary-item">
                <span class="label">选择模板：</span>
                <span class="value">{{ selectedTemplate?.name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">查询参数：</span>
                <div class="params-summary">
                  <div v-for="(value, key) in addForm.queryParams" :key="key" class="param-summary">
                    <span class="param-name">{{ key }}:</span>
                    <span class="param-value">{{ value }}</span>
                  </div>
                </div>
              </div>
              <div class="summary-item">
                <span class="label">输出字段：</span>
                <span class="value">{{ addForm.outputFields.join(', ') }}</span>
              </div>
              <div class="summary-item">
                <span class="label">数据限制：</span>
                <span class="value">{{ addForm.dataLimit }} 条</span>
              </div>
              <div class="summary-item">
                <span class="label">输出格式：</span>
                <span class="value">{{ addForm.outputFormat.toUpperCase() }}</span>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 弹窗底部按钮 -->
        <div class="modal-footer">
          <a-button v-if="currentStep > 0" @click="currentStep--">上一步</a-button>
          <a-button 
            v-if="currentStep < 2" 
            type="primary" 
            :disabled="!canNextStep"
            @click="currentStep++"
          >
            下一步
          </a-button>
          <a-button 
            v-if="currentStep === 2" 
            type="primary" 
            :loading="submitting"
            @click="submitApplication"
          >
            提交申请
          </a-button>
          <a-button @click="resetAddForm">取消</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 申请详情弹窗 -->
    <a-modal 
      v-model:visible="showDetailModal" 
      title="申请详情" 
      width="600px"
      :footer="false"
    >
      <div v-if="currentApplication" class="detail-modal-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请ID">{{ currentApplication.id }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentApplication.status)">{{ getStatusText(currentApplication.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="模板名称">{{ currentApplication.templateName }}</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ formatDate(currentApplication.applyTime) }}</a-descriptions-item>
          <a-descriptions-item label="查询条件" :span="2">
            <div class="query-params">
              <div v-for="(value, key) in currentApplication.queryParams" :key="key" class="param-item">
                <span class="param-name">{{ key }}:</span>
                <span class="param-value">{{ value }}</span>
              </div>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="输出字段" :span="2">
            <a-tag v-for="field in currentApplication.outputFields" :key="field" class="field-tag">{{ field }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item v-if="currentApplication.resultCount" label="结果数量">{{ currentApplication.resultCount }}条</a-descriptions-item>
          <a-descriptions-item v-if="currentApplication.fileSize" label="文件大小">{{ formatFileSize(currentApplication.fileSize) }}</a-descriptions-item>
        </a-descriptions>
        
        <div v-if="currentApplication.status === 'completed'" class="download-section">
          <a-button type="primary" @click="downloadResult(currentApplication.id)">
            <template #icon>
              <icon-download />
            </template>
            下载结果文件
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconDownload, 
  IconClose, 
  IconEye, 
  IconInfoCircle,
  IconSearch 
} from '@arco-design/web-vue/es/icon'
import dayjs from 'dayjs'

// 响应式数据
const showAddModal = ref(false)
const showDetailModal = ref(false)
const currentStep = ref(0)
const submitting = ref(false)
const templatesLoading = ref(false)
const tableLoading = ref(false)

// 搜索筛选表单
const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: [],
  templateName: ''
})

// 表格配置
const tableColumns = [
  {
    title: '申请ID',
    dataIndex: 'id',
    width: 120,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '模板名称',
    dataIndex: 'templateName',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
    filterable: {
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'completed' },
        { text: '失败', value: 'failed' },
        { text: '已取消', value: 'cancelled' }
      ]
    }
  },
  {
    title: '查询摘要',
    dataIndex: 'querySummary',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '申请时间',
    dataIndex: 'applyTime',
    slotName: 'applyTime',
    width: 180,
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '数据量',
    dataIndex: 'resultCount',
    slotName: 'resultCount',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 申请列表
const applications = ref([])
const currentApplication = ref(null)

// 模板数据
const templates = ref([])
const selectedTemplate = ref(null)

// 添加申请表单
const addForm = ref({
  templateId: '',
  queryParams: {},
  outputFields: [],
  dataLimit: 10000,
  outputFormat: 'csv'
})

// 计算属性
const canNextStep = computed(() => {
  if (currentStep.value === 0) {
    return addForm.value.templateId && selectedTemplate.value
  }
  if (currentStep.value === 1) {
    // 检查必填参数是否已填写
    const requiredParams = selectedTemplate.value?.inputParams?.filter(p => p.required) || []
    const hasAllRequired = requiredParams.every(param => {
      const value = addForm.value.queryParams[param.name]
      return value !== undefined && value !== null && value !== ''
    })
    return hasAllRequired && addForm.value.outputFields.length > 0
  }
  return true
})

// 筛选后的申请列表
const filteredApplications = computed(() => {
  let filtered = [...applications.value]
  
  // 关键词搜索
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    filtered = filtered.filter(app => 
      app.id.toLowerCase().includes(keyword) ||
      app.templateName.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (searchForm.status) {
    filtered = filtered.filter(app => app.status === searchForm.status)
  }
  
  // 模板名称筛选
  if (searchForm.templateName) {
    filtered = filtered.filter(app => app.templateName === searchForm.templateName)
  }
  
  // 时间范围筛选
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    filtered = filtered.filter(app => {
      const applyTime = dayjs(app.applyTime)
      return applyTime.isAfter(dayjs(startDate).subtract(1, 'day')) && 
             applyTime.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }
  
  // 更新分页总数
  paginationConfig.total = filtered.length
  
  // 分页处理
  const start = (paginationConfig.current - 1) * paginationConfig.pageSize
  const end = start + paginationConfig.pageSize
  
  return filtered.slice(start, end)
})

const isAllFieldsSelected = computed(() => {
  const totalFields = selectedTemplate.value?.outputFields?.length || 0
  return totalFields > 0 && addForm.value.outputFields.length === totalFields
})

const isIndeterminate = computed(() => {
  const selectedCount = addForm.value.outputFields.length
  const totalCount = selectedTemplate.value?.outputFields?.length || 0
  return selectedCount > 0 && selectedCount < totalCount
})

// 方法
const loadTemplates = async () => {
  templatesLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    templates.value = [
      {
        id: 'template_001',
        name: '用户交易明细查询',
        description: '查询用户的详细交易记录，包含交易金额、时间、状态等信息',
        language: 'sql',
        useCase: '明细数据下载',
        inputParams: [
          {
            id: 'p1',
            name: 'user_id',
            type: 'string',
            required: true,
            description: '用户ID，支持单个或多个用户ID查询'
          },
          {
            id: 'p2',
            name: 'start_date',
            type: 'date',
            required: true,
            description: '查询开始日期'
          },
          {
            id: 'p3',
            name: 'end_date',
            type: 'date',
            required: true,
            description: '查询结束日期'
          },
          {
            id: 'p4',
            name: 'min_amount',
            type: 'number',
            required: false,
            description: '最小交易金额过滤条件'
          }
        ],
        outputFields: [
          { name: 'transaction_id', type: 'string', description: '交易ID' },
          { name: 'user_id', type: 'string', description: '用户ID' },
          { name: 'amount', type: 'number', description: '交易金额' },
          { name: 'transaction_time', type: 'datetime', description: '交易时间' },
          { name: 'status', type: 'string', description: '交易状态' },
          { name: 'merchant_name', type: 'string', description: '商户名称' }
        ]
      },
      {
        id: 'template_002',
        name: '客户资金流水查询',
        description: '查询客户的资金流水记录，包含收入、支出、余额变化等',
        language: 'sql',
        useCase: '明细数据下载',
        inputParams: [
          {
            id: 'p1',
            name: 'customer_id',
            type: 'string',
            required: true,
            description: '客户ID'
          },
          {
            id: 'p2',
            name: 'account_type',
            type: 'string',
            required: false,
            description: '账户类型：储蓄账户、信用账户等'
          },
          {
            id: 'p3',
            name: 'date_range',
            type: 'string',
            required: true,
            description: '查询时间范围，格式：YYYY-MM-DD to YYYY-MM-DD'
          }
        ],
        outputFields: [
          { name: 'flow_id', type: 'string', description: '流水ID' },
          { name: 'customer_id', type: 'string', description: '客户ID' },
          { name: 'account_id', type: 'string', description: '账户ID' },
          { name: 'flow_type', type: 'string', description: '流水类型' },
          { name: 'amount', type: 'number', description: '金额' },
          { name: 'balance', type: 'number', description: '余额' },
          { name: 'flow_time', type: 'datetime', description: '流水时间' },
          { name: 'description', type: 'string', description: '流水描述' }
        ]
      }
    ]
  } catch (error) {
    Message.error('加载模板失败')
  } finally {
    templatesLoading.value = false
  }
}

// 搜索和筛选方法
const handleSearch = () => {
  paginationConfig.current = 1 // 重置到第一页
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  searchForm.templateName = ''
  paginationConfig.current = 1
}

// 分页处理
const handlePageChange = (page) => {
  paginationConfig.current = page
}

const handlePageSizeChange = (pageSize) => {
  paginationConfig.pageSize = pageSize
  paginationConfig.current = 1
}

// 排序处理
const handleSorterChange = (dataIndex, direction) => {
  // 这里可以添加排序逻辑
  console.log('排序:', dataIndex, direction)
}

const loadApplications = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    applications.value = [
      {
        id: 'app_001',
        templateId: 'template_001',
        templateName: '用户交易明细查询',
        status: 'completed',
        querySummary: '查询用户U123456在2024年1月的交易记录',
        applyTime: '2024-01-15 10:30:00',
        queryParams: {
          user_id: 'U123456',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          min_amount: 100
        },
        outputFields: ['transaction_id', 'user_id', 'amount', 'transaction_time', 'status'],
        resultCount: 1250,
        fileSize: 256000
      },
      {
        id: 'app_002',
        templateId: 'template_002',
        templateName: '客户资金流水查询',
        status: 'processing',
        querySummary: '查询客户C789的储蓄账户流水',
        applyTime: '2024-01-16 14:20:00',
        queryParams: {
          customer_id: 'C789',
          account_type: '储蓄账户',
          date_range: '2024-01-01 to 2024-01-15'
        },
        outputFields: ['flow_id', 'customer_id', 'amount', 'balance', 'flow_time']
      },
      {
        id: 'app_003',
        templateId: 'template_001',
        templateName: '用户交易明细查询',
        status: 'failed',
        querySummary: '查询用户U999999的交易记录',
        applyTime: '2024-01-16 16:45:00',
        queryParams: {
          user_id: 'U999999',
          start_date: '2024-01-01',
          end_date: '2024-01-16'
        },
        outputFields: ['transaction_id', 'user_id', 'amount']
      }
    ]
  } catch (error) {
    Message.error('加载申请列表失败')
  }
}

const onTemplateChange = (templateId) => {
  selectedTemplate.value = templates.value.find(t => t.id === templateId)
  // 重置表单数据
  addForm.value.queryParams = {}
  addForm.value.outputFields = []
  
  // 设置默认输出字段（选择前3个字段）
  if (selectedTemplate.value?.outputFields) {
    addForm.value.outputFields = selectedTemplate.value.outputFields.slice(0, 3).map(f => f.name)
  }
}

const toggleAllFields = (checked) => {
  if (checked) {
    addForm.value.outputFields = selectedTemplate.value?.outputFields?.map(f => f.name) || []
  } else {
    addForm.value.outputFields = []
  }
}

const toggleField = (fieldName, checked) => {
  if (checked) {
    if (!addForm.value.outputFields.includes(fieldName)) {
      addForm.value.outputFields.push(fieldName)
    }
  } else {
    const index = addForm.value.outputFields.indexOf(fieldName)
    if (index > -1) {
      addForm.value.outputFields.splice(index, 1)
    }
  }
}

const submitApplication = async () => {
  submitting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成新申请
    const newApplication = {
      id: `app_${Date.now()}`,
      templateId: addForm.value.templateId,
      templateName: selectedTemplate.value.name,
      status: 'pending',
      querySummary: generateQuerySummary(),
      applyTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      queryParams: { ...addForm.value.queryParams },
      outputFields: [...addForm.value.outputFields],
      dataLimit: addForm.value.dataLimit,
      outputFormat: addForm.value.outputFormat
    }
    
    applications.value.unshift(newApplication)
    Message.success('申请提交成功')
    resetAddForm()
  } catch (error) {
    Message.error('申请提交失败')
  } finally {
    submitting.value = false
  }
}

const generateQuerySummary = () => {
  const params = addForm.value.queryParams
  const keys = Object.keys(params)
  if (keys.length === 0) return '无查询条件'
  
  const summary = keys.slice(0, 2).map(key => `${key}=${params[key]}`).join(', ')
  return keys.length > 2 ? `${summary}...` : summary
}

const resetAddForm = () => {
  showAddModal.value = false
  currentStep.value = 0
  addForm.value = {
    templateId: '',
    queryParams: {},
    outputFields: [],
    dataLimit: 10000,
    outputFormat: 'csv'
  }
  selectedTemplate.value = null
}

const viewApplicationDetail = (applicationId) => {
  currentApplication.value = applications.value.find(app => app.id === applicationId)
  showDetailModal.value = true
}

const downloadResult = async (applicationId) => {
  try {
    Message.info('开始下载文件...')
    // 模拟下载
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('文件下载完成')
  } catch (error) {
    Message.error('文件下载失败')
  }
}

const cancelApplication = async (applicationId) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const application = applications.value.find(app => app.id === applicationId)
    if (application) {
      application.status = 'cancelled'
    }
    Message.success('申请已取消')
  } catch (error) {
    Message.error('取消申请失败')
  }
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时加载数据
onMounted(() => {
  loadTemplates()
  loadApplications()
  // 初始化分页总数
  paginationConfig.total = applications.value.length
})
</script>

<style scoped>
.detail-data-query-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.page-description {
  color: #86909c;
  font-size: 14px;
}

.search-filter-section {
  margin-bottom: 16px;
}

.filter-card {
  border-radius: 8px;
}

.applications-table-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.add-application-card {
  background: #fff;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-application-card:hover {
  border-color: #165dff;
  background-color: #f9fafb;
}

.add-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-icon {
  font-size: 32px;
  color: #86909c;
  margin-bottom: 12px;
}

.add-text {
  font-size: 16px;
  color: #1d2129;
  margin-bottom: 4px;
}

.add-description {
  font-size: 12px;
  color: #86909c;
}

.application-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e5e6eb;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.application-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.template-name {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  flex: 1;
  margin-right: 12px;
}

.card-content {
  flex: 1;
  margin-bottom: 16px;
}

.query-summary {
  color: #4e5969;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.apply-time,
.data-count {
  font-size: 12px;
  color: #86909c;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.add-modal-content {
  padding: 20px 0;
}

.steps-indicator {
  margin-bottom: 32px;
}

.step-content {
  margin-bottom: 24px;
}

.step-title {
  font-size: 18px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 16px;
}

.template-selector {
  width: 100%;
  margin-bottom: 16px;
}

.template-option {
  padding: 4px 0;
}

.template-name {
  font-weight: 500;
  color: #1d2129;
}

.template-desc {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.template-info {
  margin-top: 16px;
}

.info-card {
  background-color: #f9fafb;
}

.template-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #4e5969;
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: #1d2129;
}

.params-card,
.output-fields-card,
.query-config-card {
  margin-bottom: 16px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.param-item {
  margin-bottom: 0;
}

.param-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-star {
  color: #f53f3f;
}

.param-info {
  color: #86909c;
  cursor: help;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f3f5;
}

.selected-count {
  font-size: 12px;
  color: #86909c;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.field-checkbox {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s;
}

.field-checkbox:hover {
  border-color: #165dff;
  background-color: #f9fafb;
}

.field-info {
  margin-left: 8px;
}

.field-name {
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 2px;
}

.field-type {
  font-size: 12px;
  color: #165dff;
  margin-bottom: 4px;
}

.field-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.summary-card {
  background-color: #f9fafb;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: flex-start;
}

.summary-item .label {
  width: 100px;
}

.params-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-summary {
  display: flex;
  gap: 8px;
}

.param-name {
  font-weight: 500;
  color: #4e5969;
}

.param-value {
  color: #1d2129;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
}

.detail-modal-content {
  padding: 16px 0;
}

.query-params {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.query-params .param-item {
  display: flex;
  gap: 8px;
}

.query-params .param-name {
  font-weight: 500;
  color: #4e5969;
}

.query-params .param-value {
  color: #1d2129;
}

.field-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.download-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
  text-align: center;
}
</style>