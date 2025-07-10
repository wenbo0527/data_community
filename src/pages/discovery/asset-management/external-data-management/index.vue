<template>
  <div class="external-data-management">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>外部数据管理</h2>
          <p class="page-description">管理外部数据源和采购项目，统一数据接入和采购流程</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button type="primary" @click="showCreateModal = true">
              <template #icon>
                <icon-plus />
              </template>
              新增外部数据
            </a-button>
            <a-button type="outline" @click="handleCreatePurchaseProject">
              <template #icon>
                <icon-plus />
              </template>
              新增采购项目
            </a-button>
          </a-space>
        </div>
      </div>
    </div>



    <!-- 标签页切换 -->
    <a-tabs v-model:active-key="activeTab" type="card" @change="handleTabChange">
      <a-tab-pane key="external-data" title="外部数据">
        <!-- 外部数据搜索和筛选 -->
        <a-card class="search-card">
          <div class="search-section">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-input-search
                  v-model="searchForm.name"
                  placeholder="搜索数据名称、描述"
                  @search="handleSearch"
                  allow-clear
                />
              </a-col>
              <a-col :span="4">
                <a-select
                  v-model="searchForm.status"
                  placeholder="状态"
                  allow-clear
                  @change="handleSearch"
                >
                  <a-option value="active">启用</a-option>
                  <a-option value="inactive">停用</a-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-select
                  v-model="searchForm.supplier"
                  placeholder="供应商"
                  allow-clear
                  @change="handleSearch"
                >
                  <a-option value="supplier1">供应商A</a-option>
                  <a-option value="supplier2">供应商B</a-option>
                  <a-option value="supplier3">供应商C</a-option>
                  <a-option value="supplier4">供应商D</a-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-button type="primary" @click="handleSearch">
                  <template #icon>
                    <icon-search />
                  </template>
                  搜索
                </a-button>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- 外部数据表格 -->
        <a-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #name="{ record }">
            <a-button type="text" @click="viewExternalDataDetail(record)">
              {{ record.name }}
            </a-button>
          </template>
          
          <template #status="{ record }">
            <a-tag
              :color="getStatusColor(record.status)"
            >
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editExternalData(record)">
                编辑
              </a-button>
              <a-button type="text" size="small" @click="copyExternalData(record)">
                复制
              </a-button>
              <a-button type="text" size="small" status="danger" @click="deleteExternalData(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-tab-pane>
      
      <a-tab-pane key="purchase-projects" title="采购项目">
        <!-- 采购项目搜索和筛选 -->
        <a-card class="search-card">
          <div class="search-section">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-input-search
                  v-model="projectSearchKeyword"
                  placeholder="搜索项目名称"
                  @search="handleProjectSearch"
                  allow-clear
                />
              </a-col>
              <a-col :span="4">
                <a-select
                  v-model="selectedProjectStatus"
                  placeholder="项目状态"
                  allow-clear
                  @change="handleProjectSearch"
                >
                  <a-option value="pending">待审核</a-option>
                  <a-option value="approved">已审核</a-option>
                  <a-option value="in-progress">进行中</a-option>
                  <a-option value="completed">已完成</a-option>
                  <a-option value="cancelled">已取消</a-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-select
                  v-model="selectedProjectSupplier"
                  placeholder="关联供应商"
                  allow-clear
                  @change="handleProjectSearch"
                >
                  <a-option value="supplier1">供应商A</a-option>
                  <a-option value="supplier2">供应商B</a-option>
                  <a-option value="supplier3">供应商C</a-option>
                  <a-option value="supplier4">供应商D</a-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-button type="primary" @click="handleProjectSearch">
                  <template #icon>
                    <icon-search />
                  </template>
                  搜索
                </a-button>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- 采购项目表格 -->
        <a-table
          :columns="projectColumns"
          :data="projectTableData"
          :loading="projectLoading"
          :pagination="projectPagination"
          @page-change="handleProjectPageChange"
          @page-size-change="handleProjectPageSizeChange"
        >
          <template #projectName="{ record }">
            <a-button type="text" @click="viewProjectDetail(record)">
              {{ record.projectName }}
            </a-button>
          </template>
          
          <template #projectStatus="{ record }">
            <a-tag
              :color="getProjectStatusColor(record.status)"
            >
              {{ getProjectStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template #projectActions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editProject(record)">
                编辑
              </a-button>
              <a-button type="text" size="small" @click="viewProjectDetail(record)">
                查看
              </a-button>
              <a-button type="text" size="small" status="danger" @click="deleteProject(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 创建/编辑外数模态框 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingExternalData?.isViewMode ? '数源详情' : (editingExternalData ? '编辑数源' : '注册外部数据')"
      :width="modalWidth"
      @ok="handleSubmit"
      @cancel="resetForm"
      :ok-text="editingExternalData?.isViewMode ? '关闭' : '确定'"
      :cancel-text="editingExternalData?.isViewMode ? '' : '取消'"
      :hide-cancel="editingExternalData?.isViewMode"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="editingExternalData?.isViewMode ? {} : formRules"
        layout="vertical"
        :disabled="editingExternalData?.isViewMode"
      >
        <!-- 基本信息 -->
        <a-divider orientation="left">基本信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数源名称" field="name">
              <a-input 
                v-model="formData.name" 
                placeholder="请输入数源名称" 
                :disabled="editingExternalData && !editingExternalData.isViewMode"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数源种类" field="dataCategory">
              <a-select 
                v-model="formData.dataCategory" 
                placeholder="请选择数源种类"
                :disabled="editingExternalData && !editingExternalData.isViewMode"
              >
                <a-option value="征信数据">征信数据</a-option>
                <a-option value="风控数据">风控数据</a-option>
                <a-option value="运营商数据">运营商数据</a-option>
                <a-option value="政务数据">政务数据</a-option>
                <a-option value="金融数据">金融数据</a-option>
                <a-option value="其他">其他</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="接口类型" field="interfaceType">
              <a-select 
                v-model="formData.interfaceType" 
                placeholder="请选择接口类型"
                :disabled="editingExternalData && !editingExternalData.isViewMode"
              >
                <a-option value="REST API">REST API</a-option>
                <a-option value="SOAP">SOAP</a-option>
                <a-option value="FTP">FTP</a-option>
                <a-option value="SFTP">SFTP</a-option>
                <a-option value="数据库直连">数据库直连</a-option>
                <a-option value="文件传输">文件传输</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="接口标签" field="interfaceTag">
              <a-select 
                v-model="formData.interfaceTag" 
                placeholder="请选择接口标签"
              >
                <a-option value="主接口">主接口</a-option>
                <a-option value="备接口">备接口</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="供应商" field="provider">
              <a-input 
                v-model="formData.provider" 
                placeholder="请输入供应商名称" 
                :disabled="editingExternalData && !editingExternalData.isViewMode"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="负责人" field="owner">
              <a-input 
                v-model="formData.owner" 
                placeholder="请输入负责人" 
                :disabled="editingExternalData && !editingExternalData.isViewMode"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="落库表名" field="targetTable">
              <a-input v-model="formData.targetTable" placeholder="请输入落库表名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="单价（元/条）" field="unitPrice">
              <a-input-number 
                v-model="formData.unitPrice" 
                placeholder="请输入单价" 
                :precision="4"
                :min="0"
                :max="9999.9999"
                style="width: 100%"
              >
                <template #suffix>元/条</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="描述信息" field="description">
              <a-textarea v-model="formData.description" placeholder="请输入描述信息" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 数据管理 -->
        <a-divider orientation="left">数据管理</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据管理员" field="dataManager">
              <a-input v-model="formData.dataManager" placeholder="请输入数据管理员" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据更新频率" field="updateFrequency">
              <a-select v-model="formData.updateFrequency" placeholder="选择更新频率">
                <a-option value="实时">实时</a-option>
                <a-option value="日更新">日更新</a-option>
                <a-option value="离线T+1">离线T+1</a-option>
                <a-option value="每周">每周</a-option>
                <a-option value="每月">每月</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="数据管理说明">
              <a-textarea v-model="formData.dataManagementDescription" placeholder="请输入数据管理相关说明" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 文件管理 -->
        <a-divider orientation="left">文件管理</a-divider>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="相关文件">
              <!-- 已上传文件列表 -->
              <div v-if="formData.files && formData.files.length > 0" class="uploaded-files">
                <div v-for="(file, index) in formData.files" :key="index" class="file-item">
                  <div class="file-info">
                    <a-input 
                      v-model="file.displayName" 
                      placeholder="请输入文件名称"
                      :disabled="editingExternalData?.isViewMode"
                      class="file-name-input"
                    />
                    <span class="file-original-name">{{ file.originalName }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                  <div class="file-actions">
                    <a-button 
                      type="text" 
                      size="small" 
                      @click="downloadFile(file)"
                    >
                      下载
                    </a-button>
                    <a-button 
                      v-if="!editingExternalData?.isViewMode"
                      type="text" 
                      size="small" 
                      status="danger" 
                      @click="removeFile(index)"
                    >
                      删除
                    </a-button>
                  </div>
                </div>
              </div>
              
              <!-- 文件上传 -->
              <a-upload
                v-if="!editingExternalData?.isViewMode"
                :custom-request="handleFileUpload"
                :show-file-list="false"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                class="file-upload"
              >
                <template #upload-button>
                  <a-button type="outline">
                    <template #icon>
                      <icon-upload />
                    </template>
                    {{ editingExternalData ? '追加文件' : '上传文件' }}
                  </a-button>
                </template>
              </a-upload>
              
              <div class="upload-tips">
                <p>支持格式：PDF、Word、Excel、TXT、ZIP、RAR</p>
                <p>单个文件大小不超过 50MB</p>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconFile, IconUpload, IconSearch } from '@arco-design/web-vue/es/icon'

// 路由
const router = useRouter()

// 导航到采购登记页面
const navigateToRegister = () => {
  router.push('/discovery/asset-management/external-purchase-register')
}

// 处理新增采购项目
const handleCreatePurchaseProject = () => {
  navigateToRegister()
}

// 响应式数据
const activeTab = ref('external-data')
const loading = ref(false)

// 采购项目相关状态
const projectLoading = ref(false)
const projectSearchKeyword = ref('')
const selectedProjectStatus = ref('')
const selectedProjectSupplier = ref('')
const searchKeyword = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

// 搜索表单
const searchForm = ref({
  name: '',
  status: '',
  supplier: ''
})
const showCreateModal = ref(false)
// 文件接口定义
interface FileItem {
  id?: string
  displayName: string
  originalName: string
  size: number
  type: string
  url?: string
  uploadTime?: string
}

// 外部数据接口定义
interface ExternalDataItem {
  id?: number
  name: string
  dataCategory: string
  interfaceType: string
  interfaceTag: string
  targetTable: string
  provider: string
  unitPrice: number
  owner: string
  description: string
  dataManager: string
  updateFrequency: string
  dataManagementDescription: string
  files?: FileItem[]
  status?: string
  updateTime?: string
  isViewMode?: boolean
}

const editingExternalData = ref<ExternalDataItem | null>(null)
const formRef = ref()

// 模态框宽度计算
const modalWidth = computed(() => {
  return Math.min(1000, (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1200) * 0.9)
})

// 表格列配置
const columns = [
  {
    title: '数源名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 180
  },
  {
    title: '数源种类',
    dataIndex: 'dataCategory',
    width: 120
  },
  {
    title: '接口类型',
    dataIndex: 'interfaceType',
    width: 120
  },
  {
    title: '接口标签',
    dataIndex: 'interfaceTag',
    width: 100
  },
  {
    title: '落库表名',
    dataIndex: 'targetTable',
    width: 150
  },
  {
    title: '供应商',
    dataIndex: 'provider',
    width: 120
  },
  {
    title: '单价（元/条）',
    dataIndex: 'unitPrice',
    width: 120
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '最后更新',
    dataIndex: 'updateTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 220,
    fixed: 'right'
  }
]

// 采购项目表格列配置
const projectColumns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    slotName: 'projectName',
    width: 180
  },
  {
    title: '关联供应商',
    dataIndex: 'supplier',
    width: 120
  },
  {
    title: '采购用量',
    dataIndex: 'purchaseVolume',
    width: 120,
    render: ({ record }: any) => `${record.purchaseVolume}条`
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    width: 120,
    render: ({ record }: any) => `¥${record.totalAmount.toLocaleString()}`
  },
  {
    title: '采购日期',
    dataIndex: 'purchaseDate',
    width: 120
  },
  {
    title: '关联产品数',
    dataIndex: 'relatedProductCount',
    width: 120
  },
  {
    title: '项目状态',
    dataIndex: 'status',
    slotName: 'projectStatus',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'projectActions',
    width: 200,
    fixed: 'right'
  }
]

// 采购项目接口定义
interface PurchaseProjectItem {
  id?: number
  projectName: string
  purchaseVolume: number
  totalAmount: number
  purchaseDate: string
  description?: string
  relatedProductCount: number
  status: string
  createTime: string
}

// 模拟表格数据
const tableData = ref([
  {
    id: 1,
    name: '央行征信数据',
    dataCategory: '征信数据',
    interfaceType: 'REST API',
    interfaceTag: '主接口',
    targetTable: 'credit_data',
    provider: '人民银行征信中心',
    unitPrice: 2.5000,
    owner: '张三',
    description: '个人征信报告、企业征信信息等',
    dataManager: '李管理',
    updateFrequency: '实时',
    dataManagementDescription: '通过API实时获取征信数据，确保数据时效性',
    files: [
      {
        id: 'file1',
        displayName: '征信数据接口文档',
        originalName: 'credit_api_doc.pdf',
        size: 2048576,
        type: 'application/pdf',
        uploadTime: '2024-01-10 09:00:00'
      },
      {
        id: 'file2',
        displayName: '数据字典',
        originalName: 'data_dictionary.xlsx',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadTime: '2024-01-10 09:30:00'
      }
    ],
    status: 'active',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '风控评分模型',
    dataCategory: '风控数据',
    interfaceType: '数据库直连',
    interfaceTag: '主接口',
    targetTable: 'risk_score',
    provider: '同盾科技',
    unitPrice: 1.2000,
    owner: '李四',
    description: '客户风险评分、反欺诈模型结果',
    dataManager: '王管理',
    updateFrequency: '日更新',
    dataManagementDescription: '每日凌晨2点通过数据库直连更新风控评分',
    files: [
      {
        id: 'file3',
        displayName: '风控模型说明书',
        originalName: 'risk_model_manual.doc',
        size: 3145728,
        type: 'application/msword',
        uploadTime: '2024-01-12 14:00:00'
      }
    ],
    status: 'active',
    updateTime: '2024-01-14 16:45:00'
  },
  {
    id: 3,
    name: '运营商数据',
    dataCategory: '运营商数据',
    interfaceType: 'SFTP',
    interfaceTag: '备接口',
    targetTable: 'telecom_data',
    provider: '中国移动',
    unitPrice: 0.9200,
    owner: '王五',
    description: '用户通话记录、流量使用、位置信息等',
    dataManager: '赵管理',
    updateFrequency: '每周',
    dataManagementDescription: '每周一上午通过SFTP传输文件',
    files: [],
    status: 'draft',
    updateTime: '2024-01-10 14:20:00'
  }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3,
  showTotal: true,
  showPageSize: true
})

// 采购项目分页配置
const projectPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 5,
  showTotal: true,
  showPageSize: true
})

// 采购项目模拟数据
const projectTableData = ref([
  {
    id: 1,
    projectName: '2024年Q1征信数据采购项目',
    supplier: '供应商A',
    purchaseVolume: 100000,
    totalAmount: 250000,
    purchaseDate: '2024-01-15',
    description: '用于风控模型训练的征信数据采购',
    relatedProductCount: 3,
    status: 'approved',
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 2,
    projectName: '运营商数据补充采购',
    supplier: '供应商B',
    purchaseVolume: 50000,
    totalAmount: 46000,
    purchaseDate: '2024-01-20',
    description: '补充运营商通话记录和流量数据',
    relatedProductCount: 2,
    status: 'in-progress',
    createTime: '2024-01-18 14:20:00'
  },
  {
    id: 3,
    projectName: '政务数据试点采购',
    supplier: '供应商C',
    purchaseVolume: 20000,
    totalAmount: 80000,
    purchaseDate: '2024-02-01',
    description: '政务数据试点项目，用于业务拓展',
    relatedProductCount: 1,
    status: 'pending',
    createTime: '2024-01-25 11:15:00'
  },
  {
    id: 4,
    projectName: '金融数据年度采购',
    supplier: '供应商A',
    purchaseVolume: 200000,
    totalAmount: 480000,
    purchaseDate: '2024-02-15',
    description: '年度金融数据采购计划',
    relatedProductCount: 5,
    status: 'completed',
    createTime: '2024-01-05 16:45:00'
  },
  {
    id: 5,
    projectName: '风控数据紧急采购',
    purchaseVolume: 30000,
    totalAmount: 36000,
    purchaseDate: '2024-01-30',
    description: '紧急风控数据采购，用于模型优化',
    relatedProductCount: 2,
    status: 'cancelled',
    createTime: '2024-01-28 10:00:00'
  }
])

// 表单数据
const formData = reactive({
  name: '',
  dataCategory: '',
  interfaceType: '',
  interfaceTag: '',
  targetTable: '',
  provider: '',
  unitPrice: 0,
  owner: '',
  description: '',
  dataManager: '',
  updateFrequency: '',
  dataManagementDescription: '',
  files: [] as FileItem[]
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入数源名称' }
  ],
  dataCategory: [
    { required: true, message: '请选择数源种类' }
  ],
  interfaceType: [
    { required: true, message: '请选择接口类型' }
  ],
  interfaceTag: [
    { required: true, message: '请选择接口标签' }
  ],
  targetTable: [
    { required: true, message: '请输入落库表名' }
  ],
  provider: [
    { required: true, message: '请输入供应商名称' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价' },
    { type: 'number', min: 0, message: '单价不能小于0' }
  ],
  owner: [
    { required: true, message: '请输入负责人' }
  ],
  description: [
    { required: true, message: '请输入描述信息' }
  ]
}

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleTabChange = (key: string) => {
  activeTab.value = key
  console.log('切换标签页:', key)
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    draft: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '启用',
    inactive: '停用',
    draft: '草稿'
  }
  return textMap[status] || '未知'
}

// 采购项目相关方法
const handleProjectSearch = () => {
  projectLoading.value = true
  setTimeout(() => {
    projectLoading.value = false
  }, 500)
}

const handleProjectPageChange = (page: number) => {
  projectPagination.current = page
}

const handleProjectPageSizeChange = (pageSize: number) => {
  projectPagination.pageSize = pageSize
  projectPagination.current = 1
}

const getProjectStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    'in-progress': 'cyan',
    completed: 'green',
    cancelled: 'red'
  }
  return colorMap[status] || 'gray'
}

const getProjectStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已审核',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const viewProjectDetail = (record: any) => {
  console.log('查看项目详情:', record)
  Message.info('查看项目详情功能开发中')
}

const editProject = (record: any) => {
  console.log('编辑项目:', record)
  // 导航到采购登记页面，传递编辑数据
  router.push({
    path: '/discovery/asset-management/external-purchase-register',
    query: {
      mode: 'edit',
      id: record.id
    },
    state: {
      editData: record
    }
  })
}

const deleteProject = (record: any) => {
  console.log('删除项目:', record)
  Message.success('删除成功')
}

const viewExternalDataDetail = (record: any) => {
  editingExternalData.value = { ...record, isViewMode: true }
  Object.assign(formData, record)
  showCreateModal.value = true
}

const editExternalData = (record: any) => {
  editingExternalData.value = record
  Object.assign(formData, record)
  showCreateModal.value = true
}

const copyExternalData = (record: any) => {
  const copiedData = { ...record }
  copiedData.name = `${record.name}_副本`
  delete copiedData.id
  
  editingExternalData.value = null
  Object.assign(formData, copiedData)
  showCreateModal.value = true
  Message.success('已复制数源，请修改相关信息')
}

const deleteExternalData = (record: any) => {
  console.log('删除外数:', record)
  Message.success('删除成功')
}

const handleSubmit = async () => {
  // 如果是查看模式，直接关闭弹窗
  if (editingExternalData.value?.isViewMode) {
    showCreateModal.value = false
    resetForm()
    return
  }
  
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      console.log('提交表单:', formData)
      Message.success(editingExternalData.value ? '编辑成功' : '注册成功')
      showCreateModal.value = false
      resetForm()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  editingExternalData.value = null
  Object.assign(formData, {
    name: '',
    dataCategory: '',
    interfaceType: '',
    interfaceTag: '',
    targetTable: '',
    provider: '',
    unitPrice: 0,
    owner: '',
    description: '',
    dataManager: '',
    updateFrequency: '',
    dataManagementDescription: '',
    files: []
  })
  formRef.value?.resetFields()
}

// 文件处理相关方法
const handleFileUpload = (option: any) => {
  const { file } = option
  
  // 检查文件大小（50MB限制）
  if (file.size > 50 * 1024 * 1024) {
    Message.error('文件大小不能超过50MB')
    return
  }
  
  // 检查文件类型
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(fileExtension)) {
    Message.error('不支持的文件格式')
    return
  }
  
  // 模拟文件上传
  const newFile: FileItem = {
    id: Date.now().toString(),
    displayName: file.name.split('.')[0], // 默认使用文件名（不含扩展名）作为显示名称
    originalName: file.name,
    size: file.size,
    type: file.type,
    uploadTime: new Date().toLocaleString()
  }
  
  formData.files.push(newFile)
  Message.success('文件上传成功')
}

const removeFile = (index: number) => {
  formData.files.splice(index, 1)
  Message.success('文件删除成功')
}

const downloadFile = (file: FileItem) => {
  // 模拟文件下载
  Message.info(`正在下载文件: ${file.displayName}`)
  console.log('下载文件:', file)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.external-data-management {
  padding: 16px;
}

.page-header {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e6eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-info h2 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
  line-height: 1.5;
}

.header-actions {
  flex-shrink: 0;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-section {
  margin: 0;
}

.management-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.data-table {
  margin: 0;
}

.status-tag {
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
}

.action-button {
  padding: 4px 8px;
  font-size: 12px;
}

.modal-form .arco-form-item {
  margin-bottom: 16px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d2129;
  border-bottom: 1px solid #e5e6eb;
  padding-bottom: 8px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.upload-text {
  color: #666;
  font-size: 14px;
}

.upload-hint {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

/* 文件管理样式 */
.uploaded-files {
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  transition: all 0.2s;
}

.file-item:hover {
  background: #f2f3f5;
  border-color: #c9cdd4;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.file-name-input {
  width: 200px;
}

.file-original-name {
  color: #86909c;
  font-size: 12px;
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.file-size {
  color: #86909c;
  font-size: 12px;
  min-width: 60px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-upload {
  margin-bottom: 12px;
}

.upload-tips {
  color: #86909c;
  font-size: 12px;
  line-height: 1.5;
}

.upload-tips p {
  margin: 0;
  margin-bottom: 4px;
}

.upload-tips p:last-child {
  margin-bottom: 0;
}
</style>