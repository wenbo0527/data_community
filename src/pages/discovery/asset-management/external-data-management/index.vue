<template>
  <div class="external-data-management">
    <div class="page-header">
      <h2>外部数据管理</h2>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <icon-plus />
        </template>
        注册外部数据
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索数源名称、供应商"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedType"
            placeholder="数源种类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="征信数据">征信数据</a-option>
            <a-option value="风控数据">风控数据</a-option>
            <a-option value="运营商数据">运营商数据</a-option>
            <a-option value="政务数据">政务数据</a-option>
            <a-option value="金融数据">金融数据</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedStatus"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <!-- 表格 -->
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

    <!-- 创建/编辑外数模态框 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingExternalData?.isViewMode ? '数源详情' : (editingExternalData ? '编辑数源' : '注册外部数据')"
      width="1000px"
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
      </a-form>
    </a-modal>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
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
  status?: string
  updateTime?: string
  isViewMode?: boolean
}

const editingExternalData = ref<ExternalDataItem | null>(null)
const formRef = ref()

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
  dataManagementDescription: ''
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
    dataManagementDescription: ''
  })
  formRef.value?.resetFields()
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.external-data-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}
</style>