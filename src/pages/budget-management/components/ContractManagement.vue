<template>
  <div class="project-management">
    <!-- 搜索和筛选 -->
    <a-row :gutter="16" class="search-section">
      <a-col :span="6">
        <a-input v-model="searchForm.projectNo" placeholder="项目编号" allow-clear>
          <template #prefix><IconSearch /></template>
        </a-input>
      </a-col>
      <a-col :span="6">
        <a-select v-model="searchForm.owner" placeholder="负责人" allow-clear>
          <a-option value="">全部负责人</a-option>
          <a-option value="owner1">张三</a-option>
          <a-option value="owner2">李四</a-option>
          <a-option value="owner3">王五</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-select v-model="searchForm.status" placeholder="项目状态" allow-clear>
          <a-option value="">全部状态</a-option>
          <a-option value="pending">待审批</a-option>
          <a-option value="in_progress">进行中</a-option>
          <a-option value="completed">已完成</a-option>
          <a-option value="cancelled">已取消</a-option>
        </a-select>
      </a-col>
      <a-col :span="6">
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-col>
    </a-row>

    <!-- 项目统计 -->
    <a-row :gutter="16" class="project-stats">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconFile />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ projectStats.totalCount }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ projectStats.ongoingCount }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconClockCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ projectStats.completedCount }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(projectStats.totalAmount) }}</div>
              <div class="stat-label">项目总金额</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 采购项目列表 -->
      <a-card class="project-table-card" :bordered="false">
        <template #title>
          <div class="table-header">
            <span>采购项目列表</span>
            <a-space>
            <a-button type="primary" size="small" @click="openProjectWizard">
              <template #icon><IconPlus /></template>
              新建采购项目
            </a-button>
            <a-button type="outline" size="small" @click="batchApprove">
              <template #icon><IconEdit /></template>
              批量审批
            </a-button>
            <a-button type="outline" size="small" @click="exportProjects">
              <template #icon><IconDownload /></template>
              导出项目
            </a-button>
          </a-space>
        </div>
      </template>
      
      <a-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #projectName="{ record }">
          <a-link @click="openProjectDetail(record)">{{ record.projectName }}</a-link>
        </template>
        <template #totalAmount="{ record }">
          <span>¥{{ formatAmount(record.totalAmount) }}</span>
        </template>
        <template #purchaseVolume="{ record }">
          <span>{{ record.purchaseVolume }} 条</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewProject(record)">查看</a-button>
            <a-button type="text" size="small" @click="editProject(record)">编辑</a-button>
            <a-button type="text" size="small" @click="approveProject(record)" v-if="record.status === 'pending'">审批</a-button>
            <a-button type="text" size="small" status="danger" @click="cancelProject(record)" v-if="record.status === 'in_progress'">取消</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新建采购项目流程向导 -->
    <a-modal
      v-model:visible="showProjectWizard"
      title="新增采购项目"
      :width="900"
      :footer="false"
      @cancel="resetProjectWizard"
    >
      <a-steps :current="wizardStep" style="margin-bottom: 16px">
        <a-step title="上传采购文件" />
        <a-step title="填写项目信息" />
        <a-step title="关联数据产品" />
        <a-step title="完成" />
      </a-steps>

      <div v-if="wizardStep === 1" class="wizard-step">
        <a-upload :custom-request="handleFileUpload" :show-file-list="false" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar">
          <template #upload-button>
            <a-button type="outline">
              <template #icon><IconUpload /></template>
              上传采购文件
            </a-button>
          </template>
        </a-upload>
        <div class="uploaded-files" v-if="uploadedFiles.length">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.displayName || file.originalName }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <a-button type="text" size="small" @click="downloadFile(file)">下载</a-button>
              <a-button type="text" size="small" status="danger" @click="removeUploadedFile(index)">删除</a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="wizardStep === 2" class="wizard-step">
        <a-form :model="projectForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="projectNo" label="项目编号" required>
                <a-input v-model="projectForm.projectNo" placeholder="请输入项目编号" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="projectName" label="项目名称" required>
                <a-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="purchaseVolume" label="采购用量" required>
                <a-input-number v-model="projectForm.purchaseVolume" :min="1" style="width: 100%">
                  <template #suffix>条</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="totalAmount" label="总金额(万元)" required>
                <a-input-number v-model="projectForm.totalAmount" :min="0" :precision="2" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="purchaseDate" label="采购日期" required>
                <a-date-picker v-model="projectForm.purchaseDate" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="owner" label="项目负责人" required>
                <a-select v-model="projectForm.owner" placeholder="请选择负责人">
                  <a-option value="owner1">张三</a-option>
                  <a-option value="owner2">李四</a-option>
                  <a-option value="owner3">王五</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="description" label="采购说明">
                <a-textarea v-model="projectForm.description" placeholder="请输入采购说明" :rows="3" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div v-else-if="wizardStep === 3" class="wizard-step">
        <div class="product-actions" style="margin-bottom: 8px">
          <span>已选择 {{ selectedProductIds.length }} 个数据产品</span>
        </div>
        <a-table :columns="productColumns" :data="mockProducts" :pagination="false" row-key="id">
          <template #actions="{ record }">
            <a-button type="text" size="small" @click="toggleSelectProduct(record.id)">
              {{ selectedProductIds.includes(record.id) ? '移除' : '选择' }}
            </a-button>
          </template>
        </a-table>
      </div>

      <div v-else class="wizard-step">
        <h3 style="margin-bottom: 12px">采购项目注册完成</h3>
        <a-descriptions layout="horizontal" :column="3" :data="summaryData" />
        <h4 style="margin: 16px 0 8px">关联数据产品</h4>
        <a-table :columns="summaryColumns" :data="selectedProducts" :pagination="false" />
      </div>

      <div class="wizard-footer" style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px">
        <a-button v-if="wizardStep > 1" @click="prevStep">上一步</a-button>
        <a-button v-if="wizardStep < 4" type="primary" @click="nextStep">下一步</a-button>
        <a-button v-else type="primary" @click="finishRegistration">完成</a-button>
      </div>
    </a-modal>

    <!-- 采购项目详情 -->
    <a-modal v-model:visible="showProjectDetail" title="采购项目详情" :width="900" @cancel="closeProjectDetail" :footer="false">
      <a-descriptions layout="vertical" bordered :data="detailDescriptions" />
      <a-divider />
      <h4>采购文件</h4>
      <div v-if="detailFiles.length === 0" style="color: var(--color-text-3)">暂无文件</div>
      <div v-else class="uploaded-files">
        <div v-for="(file, index) in detailFiles" :key="index" class="file-item">
          <div class="file-info">
            <span class="file-name">{{ file.displayName || file.originalName }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <a-button type="text" size="small" @click="downloadFile(file)">下载</a-button>
          </div>
        </div>
      </div>
      <a-divider />
      <h4>关联数据产品</h4>
      <a-table :columns="summaryColumns" :data="detailProducts" :pagination="false" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconFile, 
  IconCheckCircle, 
  IconClockCircle,
  IconPlus,
  IconEdit,
  IconDownload,
  IconSearch,
  IconUpload
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  projectNo: '',
  owner: '',
  status: ''
})

// 项目统计
const projectStats = reactive({
  totalCount: 45,
  ongoingCount: 18,
  completedCount: 22,
  totalAmount: 285000000
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 45,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: false
})

// 表格列定义
const columns = [
  {
    title: '项目编号',
    dataIndex: 'projectNo',
    width: 120
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    slotName: 'projectName',
    width: 200
  },
  {
    title: '负责人',
    dataIndex: 'ownerName',
    width: 100
  },
  {
    title: '关联数据产品数',
    dataIndex: 'associatedProductsCount',
    width: 140,
    align: 'right'
  },
  {
    title: '采购用量',
    dataIndex: 'purchaseVolume',
    slotName: 'purchaseVolume',
    width: 120,
    align: 'right'
  },
  {
    title: '总金额(万元)',
    dataIndex: 'totalAmount',
    slotName: 'totalAmount',
    width: 130,
    align: 'right'
  },
  {
    title: '采购日期',
    dataIndex: 'purchaseDate',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 项目向导与详情
const showProjectWizard = ref(false)
const wizardStep = ref(1)
const editingProject = ref(null)
const showProjectDetail = ref(false)
const detailRecord = ref(null)

// 项目表单
const projectForm = reactive({
  projectNo: '',
  projectName: '',
  purchaseVolume: 0,
  totalAmount: 0,
  purchaseDate: '',
  owner: '',
  description: ''
})

// 文件与产品选择
const uploadedFiles = ref([])
const selectedProductIds = ref([])
const mockProducts = ref(
  Array.from({ length: 8 }).map((_, i) => ({
    id: `DP${String(i + 1).padStart(3, '0')}`,
    name: `数据产品-${i + 1}`,
    category: ['征信数据', '风控数据', '运营商数据'][i % 3],
    unitPrice: Number((Math.random() * 3 + 0.2).toFixed(4)),
    provider: ['供应商A', '供应商B', '供应商C'][i % 3]
  }))
)
const productColumns = [
  { title: '产品ID', dataIndex: 'id', width: 100 },
  { title: '产品名称', dataIndex: 'name', width: 160 },
  { title: '类别', dataIndex: 'category', width: 120 },
  { title: '单价(元/条)', dataIndex: 'unitPrice', align: 'right', width: 120 },
  { title: '供应商', dataIndex: 'provider', width: 120 },
  { title: '操作', slotName: 'actions', width: 100 }
]
const selectedProducts = computed(() => mockProducts.value.filter(p => selectedProductIds.value.includes(p.id)))
const summaryColumns = [
  { title: '产品ID', dataIndex: 'id', width: 100 },
  { title: '产品名称', dataIndex: 'name', width: 160 },
  { title: '类别', dataIndex: 'category', width: 120 },
  { title: '单价(元/条)', dataIndex: 'unitPrice', align: 'right', width: 120 },
  { title: '供应商', dataIndex: 'provider', width: 120 }
]
const summaryData = computed(() => ([
  { label: '项目编号', value: projectForm.projectNo },
  { label: '项目名称', value: projectForm.projectName },
  { label: '采购用量', value: `${projectForm.purchaseVolume} 条` },
  { label: '总金额(万元)', value: (projectForm.totalAmount / 10000).toFixed(2) },
  { label: '采购日期', value: projectForm.purchaseDate },
  { label: '负责人', value: projectForm.owner },
  { label: '采购说明', value: projectForm.description || '-' }
]))

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'in_progress': 'blue',
    'completed': 'green',
    'cancelled': 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '待审批',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

// 模拟数据
const generateMockData = () => {
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
  const owners = [
    { id: 'owner1', name: '张三' },
    { id: 'owner2', name: '李四' },
    { id: 'owner3', name: '王五' }
  ]
  
  const data = []
  for (let i = 0; i < 45; i++) {
    const purchaseVolume = Math.floor(Math.random() * 50000) + 1000
    const totalAmount = Math.floor(Math.random() * 50000000) + 10000000
    const purchaseDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const associatedProductsCount = Math.floor(Math.random() * 5) + 1
    
    data.push({
      id: i + 1,
      projectNo: `PJ${String(i + 1).padStart(4, '0')}`,
      projectName: `外数采购项目${i + 1}`,
      owner: owners[Math.floor(Math.random() * owners.length)].id,
      ownerName: owners[Math.floor(Math.random() * owners.length)].name,
      purchaseVolume,
      totalAmount,
      purchaseDate,
      associatedProductsCount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      creator: '李四',
      createTime: '2024-01-15 10:30:00'
    })
  }
  return data
}

// 搜索处理
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let data = generateMockData()
    
    // 应用筛选条件
    if (searchForm.projectNo) {
      data = data.filter(item => item.projectNo.includes(searchForm.projectNo))
    }
    if (searchForm.owner) {
      data = data.filter(item => item.owner === searchForm.owner)
    }
    if (searchForm.status) {
      data = data.filter(item => item.status === searchForm.status)
    }
    
    tableData.value = data.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    )
    pagination.total = data.length
    loading.value = false
  }, 500)
}

// 重置处理
const handleReset = () => {
  searchForm.projectNo = ''
  searchForm.owner = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  handleSearch()
}

// 详情数据
const detailFiles = ref([])
const detailProducts = ref([])
const detailDescriptions = computed(() => ([
  { label: '项目编号', value: detailRecord.value?.projectNo },
  { label: '项目名称', value: detailRecord.value?.projectName },
  { label: '采购用量', value: `${detailRecord.value?.purchaseVolume} 条` },
  { label: '总金额(万元)', value: formatAmount(detailRecord.value?.totalAmount || 0) },
  { label: '采购日期', value: detailRecord.value?.purchaseDate },
  { label: '负责人', value: detailRecord.value?.ownerName },
  { label: '创建人', value: detailRecord.value?.creator },
  { label: '创建时间', value: detailRecord.value?.createTime },
  { label: '状态', value: getStatusText(detailRecord.value?.status) }
]))

// 编辑项目
const editProject = (record) => {
  editingProject.value = record
  Object.assign(projectForm, {
    projectNo: record.projectNo,
    projectName: record.projectName,
    purchaseVolume: record.purchaseVolume,
    totalAmount: record.totalAmount,
    purchaseDate: record.purchaseDate,
    owner: record.owner,
    description: ''
  })
  openProjectWizard()
}

// 审批项目
const approveProject = (record) => {
  Message.info(`审批项目: ${record.projectNo}`)
}

// 取消项目
const cancelProject = (record) => {
  Message.info(`取消项目: ${record.projectNo}`)
}

// 批量审批
const batchApprove = () => {
  Message.info('批量审批功能')
}

// 导出项目
const exportProjects = () => {
  Message.success('项目数据导出成功')
}

// 提交项目
// 新建项目向导控制
const openProjectWizard = () => {
  showProjectWizard.value = true
  wizardStep.value = 1
}
const resetProjectWizard = () => {
  showProjectWizard.value = false
  wizardStep.value = 1
  uploadedFiles.value = []
  selectedProductIds.value = []
  Object.assign(projectForm, {
    projectNo: '', projectName: '', purchaseVolume: 0, totalAmount: 0, purchaseDate: '', owner: '', description: ''
  })
}
const nextStep = () => {
  if (wizardStep.value === 1 && uploadedFiles.value.length === 0) {
    Message.warning('请先上传至少一个采购文件')
    return
  }
  if (wizardStep.value === 2) {
    if (!projectForm.projectNo || !projectForm.projectName || !projectForm.purchaseVolume || !projectForm.totalAmount || !projectForm.purchaseDate || !projectForm.owner) {
      Message.error('请填写完整的项目信息')
      return
    }
  }
  if (wizardStep.value === 3 && selectedProductIds.value.length === 0) {
    Message.warning('请至少选择一个数据产品')
    return
  }
  wizardStep.value = Math.min(4, wizardStep.value + 1)
}
const prevStep = () => {
  wizardStep.value = Math.max(1, wizardStep.value - 1)
}
const finishRegistration = () => {
  Message.success(editingProject.value ? '项目更新成功' : '采购项目注册成功')
  resetProjectWizard()
  editingProject.value = null
  handleSearch()
}

// 详情打开与关闭
const openProjectDetail = (record) => {
  detailRecord.value = record
  // 生成详情文件与产品示例数据
  detailFiles.value = uploadedFiles.value.length ? uploadedFiles.value : [
    { originalName: '采购明细.pdf', displayName: '采购明细', size: 2.4 * 1024 * 1024 },
    { originalName: '合同草案.docx', displayName: '合同草案', size: 1.1 * 1024 * 1024 }
  ]
  detailProducts.value = selectedProducts.value.length ? selectedProducts.value : mockProducts.value.slice(0, Math.min(3, mockProducts.value.length))
  showProjectDetail.value = true
}
const closeProjectDetail = () => {
  showProjectDetail.value = false
}

// 文件上传与管理
const handleFileUpload = ({ file, onSuccess }) => {
  const mockItem = {
    originalName: file.name,
    displayName: file.name.replace(/\.[^.]+$/, ''),
    size: file.size || Math.floor(Math.random() * 3 * 1024 * 1024) + 500 * 1024
  }
  uploadedFiles.value.push(mockItem)
  onSuccess && onSuccess()
}
const removeUploadedFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}
const downloadFile = (file) => {
  Message.info(`下载文件: ${file.displayName || file.originalName}`)
}
const formatFileSize = (size) => {
  if (!size) return '0B'
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

// 产品选择
const toggleSelectProduct = (id) => {
  const idx = selectedProductIds.value.indexOf(id)
  if (idx >= 0) selectedProductIds.value.splice(idx, 1)
  else selectedProductIds.value.push(id)
}

// 组件挂载时初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="less">
.project-management {
  .search-section {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }
  
  .project-stats {
    margin-bottom: 24px;
    
    .stat-card {
      border-radius: 8px;
      
      .stat-content {
        display: flex;
        align-items: center;
        padding: 16px;
        
        .stat-icon {
          font-size: 32px;
          color: var(--color-primary-6);
          margin-right: 16px;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 14px;
            color: var(--color-text-3);
          }
        }
      }
    }
  }
  
  .project-table-card {
    border-radius: 8px;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>