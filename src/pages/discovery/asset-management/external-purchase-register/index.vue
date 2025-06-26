<template>
  <div class="external-purchase-register">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>{{ isEditMode ? '编辑外数采购项目' : '外数采购项目注册' }}</h2>
          <p class="page-description">{{ isEditMode ? '编辑外部数据采购项目信息，支持补充上传材料和更新项目内容' : '注册外部数据采购项目，上传采购文件并关联数据产品' }}</p>
        </div>
        <div class="header-actions">
          <a-button @click="$router.go(-1)">
            返回
          </a-button>
        </div>
      </div>
    </div>

    <!-- 步骤条 -->
    <a-steps :current="currentStep" class="register-steps">
      <a-step title="上传采购文件" description="上传外数项目采购文件" />
      <a-step title="填写项目信息" description="填写项目名称、采购用量和总金额" />
      <a-step title="关联数据产品" description="选择关联的外部数据产品" />
      <a-step title="完成" description="完成项目注册" />
    </a-steps>

    <!-- 步骤内容 -->
    <a-card class="step-content">
      <!-- 步骤1: 上传采购文件 -->
      <div v-if="currentStep === 0" class="step-container">
        <h3>{{ isEditMode ? '补充上传采购文件' : '上传外数项目采购文件' }}</h3>
        <p class="step-description">{{ isEditMode ? '可以补充上传新的采购文件，支持PDF、Word、Excel格式' : '请上传外数项目采购文件，支持PDF、Word、Excel格式' }}</p>
        
        <a-upload-dragger
          :show-file-list="true"
          :file-list="fileList"
          :custom-request="handleFileUpload"
          @change="handleFileChange"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          accept=".pdf,.docx,.xlsx,.xls"
          drag
          class="upload-area"
          :class="{ 'upload-area--dragover': isDragover }"
          style="height: 180px; margin: 16px 0"
        >
          <div class="upload-content">
            <icon-upload class="upload-icon" style="font-size: 32px; margin-bottom: 16px" />
            <p class="upload-text" style="font-size: 16px; margin-bottom: 8px">拖拽文件到此处或<span class="upload-highlight"> 点击上传</span></p>
            <p class="upload-hint" style="color: var(--color-text-3)">支持PDF、Word、Excel格式文件，文件大小不超过10MB</p>
            <a-progress v-if="uploadProgress > 0" :percent="uploadProgress" :show-text="false" />
          </div>
        </a-upload-dragger>

        <div class="step-actions">
          <a-button type="primary" :disabled="fileList.length === 0" @click="nextStep">下一步</a-button>
          <a-button style="margin-left: 8px" @click="skipFileUpload">跳过上传</a-button>
        </div>
      </div>

      <!-- 步骤2: 填写项目信息 -->
      <div v-if="currentStep === 1" class="step-container">
        <h3>填写项目信息</h3>
        <p class="step-description">请填写外数采购项目的基本信息</p>
        
        <a-form :model="formData" layout="vertical">
          <a-form-item label="项目名称" field="projectName" required>
            <a-input 
              v-model="formData.projectName" 
              placeholder="请输入项目名称" 
              :disabled="isEditMode"
              :readonly="isEditMode"
            />
            <div v-if="isEditMode" class="form-tip">编辑模式下项目名称不可修改</div>
          </a-form-item>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="采购用量" field="purchaseVolume" required>
                <a-input-number 
                  v-model="formData.purchaseVolume" 
                  placeholder="请输入采购用量" 
                  :min="1"
                  style="width: 100%"
                >
                  <template #suffix>条</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="总金额" field="totalAmount" required>
                <a-input-number 
                  v-model="formData.totalAmount" 
                  placeholder="请输入总金额" 
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                >
                  <template #suffix>元</template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="采购日期" field="purchaseDate" required>
            <a-date-picker v-model="formData.purchaseDate" style="width: 100%" />
          </a-form-item>
          
          <a-form-item label="采购说明" field="description">
            <a-textarea v-model="formData.description" placeholder="请输入采购说明" :rows="3" />
          </a-form-item>
        </a-form>

        <div class="step-actions">
          <a-button style="margin-right: 8px" @click="prevStep">上一步</a-button>
          <a-button 
            type="primary" 
            :disabled="!formData.projectName || !formData.purchaseVolume || !formData.totalAmount || !formData.purchaseDate" 
            @click="nextStep"
          >
            下一步
          </a-button>
        </div>
      </div>

      <!-- 步骤3: 关联数据产品 -->
      <div v-if="currentStep === 2" class="step-container">
        <h3>关联数据产品</h3>
        <p class="step-description">请选择关联的外部数据产品，可以批量勾选</p>
        
        <!-- 筛选条件 -->
        <a-card class="filter-card">
          <div class="filter-section">
            <a-form :model="filterForm" layout="inline">
            <a-form-item field="name" label="名称">
              <a-input v-model="filterForm.name" placeholder="请输入数据名称" allow-clear />
            </a-form-item>
            <a-form-item field="dataType" label="数源种类">
              <a-select v-model="filterForm.dataType" placeholder="请选择数源种类" allow-clear>
                <a-option value="API">API</a-option>
                <a-option value="文件">文件</a-option>
                <a-option value="数据库">数据库</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="supplier" label="供应商">
              <a-select v-model="filterForm.supplier" placeholder="请选择供应商" allow-clear>
                <a-option value="数据供应商A">数据供应商A</a-option>
                <a-option value="数据供应商B">数据供应商B</a-option>
                <a-option value="数据供应商C">数据供应商C</a-option>
                <a-option value="第三方数据公司">第三方数据公司</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="isNew" label="数据产品类型">
              <a-radio-group v-model="filterForm.isNew">
                <a-radio value="">全部</a-radio>
                <a-radio value="true">新数据产品</a-radio>
                <a-radio value="false">已有数据产品</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleFilter">筛选</a-button>
                <a-button @click="resetFilter">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
          </div>
        </a-card>
        
        <!-- 数据产品表格 -->
        <a-table
          :columns="columns"
          :data="filteredTableData"
          :pagination="pagination"
          :row-selection="{
            type: 'checkbox',
            showCheckedAll: true,
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange
          }"
          @page-change="handlePageChange"
        >
          <template #name="{ record }">
            <a-tooltip :content="record.dataName">
              <span>{{ record.dataName }}</span>
            </a-tooltip>
          </template>
          <template #productType="{ record }">
            <a-tag :color="record.isNew ? 'green' : 'blue'">
              {{ record.isNew ? '新数据产品' : '已有数据产品' }}
            </a-tag>
          </template>
        </a-table>
        
        <div class="selected-summary" v-if="selectedRowKeys.length > 0">
          <p>已选择 {{ selectedRowKeys.length }} 个数据产品，其中新数据产品 {{ selectedNewProducts }} 个</p>
        </div>

        <div class="step-actions">
          <a-button style="margin-right: 8px" @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="nextStep">下一步</a-button>
        </div>
      </div>

      <!-- 步骤4: 完成 -->
      <div v-if="currentStep === 3" class="step-container">
        <div class="success-content">
          <icon-check-circle style="font-size: 64px; color: #00b42a; margin-bottom: 16px" />
          <h3>{{ isEditMode ? '采购项目更新成功' : '采购项目注册成功' }}</h3>
          <p>{{ isEditMode ? '您已成功更新外数采购项目信息，可以在外数管理页面查看详情' : '您已成功注册外数采购项目，可以在外数管理页面查看详情' }}</p>
          
          <div class="project-summary">
            <h4>项目信息</h4>
            <a-descriptions :data="summaryData" layout="vertical" bordered />
            
            <h4 style="margin-top: 24px">关联数据产品</h4>
            <a-table
              :columns="summaryColumns"
              :data="selectedProducts"
              :pagination="false"
            />
          </div>
          
          <div class="step-actions">
            <a-button style="margin-right: 8px" @click="prevStep">上一步</a-button>
            <a-button type="primary" @click="finishRegistration">完成</a-button>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconCheckCircle } from '@arco-design/web-vue/es/icon'
import { useFileUpload } from '@/utils/fileUploadUtils'

const router = useRouter()
const route = useRoute()

// 编辑模式相关
const isEditMode = ref(false)
const editingProjectId = ref('')

// 文件上传相关
const { 
  isDragover, 
  uploadProgress, 
  currentFile, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop, 
  formatFileSize,
  handleFileChange,
  handleUpload
} = useFileUpload()

const fileList = ref([])
const fileCount = ref(0)

// 步骤控制
const currentStep = ref(0)
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 跳过文件上传
const skipFileUpload = () => {
  Message.info('已跳过文件上传，可在后续步骤中补充')
  nextStep()
}

// 表单数据
const formData = reactive({
  projectName: '',
  purchaseVolume: undefined,
  totalAmount: undefined,
  purchaseDate: null,
  description: ''
})

// 筛选条件
const filterForm = reactive({
  name: '',
  dataType: '',
  supplier: '',
  isNew: ''
})

// 表格列配置
const columns = [
  {
    title: '数据名称',
    dataIndex: 'dataName',
    slotName: 'name',
    width: 180
  },
  {
    title: '数源种类',
    dataIndex: 'dataType',
    width: 120
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 150
  },
  {
    title: '单价(元/次)',
    dataIndex: 'price',
    width: 120
  },
  {
    title: '接口标签',
    dataIndex: 'interfaceTag',
    width: 120
  },
  {
    title: '产品类型',
    dataIndex: 'isNew',
    slotName: 'productType',
    width: 120
  }
]

// 摘要表格列配置
const summaryColumns = [
  {
    title: '数据名称',
    dataIndex: 'dataName',
    width: 180
  },
  {
    title: '数源种类',
    dataIndex: 'dataType',
    width: 120
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 150
  },
  {
    title: '单价(元/次)',
    dataIndex: 'price',
    width: 120
  }
]

// 表格数据
const tableData = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 选中的行
const selectedRowKeys = ref([])
const selectedProducts = ref([])

// 筛选后的表格数据
const filteredTableData = computed(() => {
  let result = [...tableData.value]
  
  if (filterForm.name) {
    result = result.filter(item => 
      item.dataName.toLowerCase().includes(filterForm.name.toLowerCase())
    )
  }
  
  if (filterForm.dataType) {
    result = result.filter(item => item.dataType === filterForm.dataType)
  }
  
  if (filterForm.supplier) {
    result = result.filter(item => item.supplier === filterForm.supplier)
  }
  
  if (filterForm.isNew === 'true') {
    result = result.filter(item => item.isNew === true)
  } else if (filterForm.isNew === 'false') {
    result = result.filter(item => item.isNew === false)
  }
  
  pagination.total = result.length
  return result
})

// 计算选中的新数据产品数量
const selectedNewProducts = computed(() => {
  return selectedProducts.value.filter(item => item.isNew).length
})

// 项目摘要信息
const summaryData = computed(() => [
  {
    label: '项目名称',
    value: formData.projectName
  },
  {
    label: '采购用量',
    value: formData.purchaseVolume ? `${formData.purchaseVolume} 条` : ''
  },
  {
    label: '总金额',
    value: formData.totalAmount ? `${formData.totalAmount} 元` : ''
  },
  {
    label: '采购日期',
    value: formData.purchaseDate ? new Date(formData.purchaseDate).toLocaleDateString() : ''
  },
  {
    label: '关联产品数',
    value: selectedRowKeys.value.length
  }
])



// 处理文件上传
const handleFileUpload = async (option) => {
  const { fileItem } = option
  uploadProgress.value = 0
  
  // 模拟上传进度
  const interval = setInterval(() => {
    if (uploadProgress.value < 99) {
      uploadProgress.value += 10
    } else {
      clearInterval(interval)
      uploadProgress.value = 100
      Message.success('文件上传成功')
    }
  }, 300)
  
  return {
    abort: () => {
      clearInterval(interval)
      uploadProgress.value = 0
    }
  }
}

// 处理筛选
const handleFilter = () => {
  pagination.current = 1
}

// 重置筛选
const resetFilter = () => {
  filterForm.name = ''
  filterForm.dataType = ''
  filterForm.supplier = ''
  filterForm.isNew = ''
  pagination.current = 1
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.current = page
}

// 处理选择变化
const handleSelectionChange = (rowKeys, rows) => {
  selectedRowKeys.value = rowKeys
  selectedProducts.value = rows
}

// 完成注册
const finishRegistration = () => {
  const message = isEditMode.value ? '外数采购项目更新成功' : '外数采购项目注册成功'
  Message.success(message)
  router.push('/discovery/asset-management/external-data-management')
}

// 加载编辑数据
const loadEditData = () => {
  // 检查是否为编辑模式
  if (route.query.mode === 'edit' && route.query.id) {
    isEditMode.value = true
    editingProjectId.value = route.query.id
    
    // 从路由状态或历史记录中获取编辑数据
    const editData = history.state?.editData
    if (editData) {
      // 填充表单数据
      formData.projectName = editData.projectName
      formData.purchaseVolume = editData.purchaseVolume
      formData.totalAmount = editData.totalAmount
      formData.purchaseDate = editData.purchaseDate
      formData.description = editData.description
      
      // 如果有已关联的产品，设置选中状态
      if (editData.relatedProducts) {
        selectedRowKeys.value = editData.relatedProducts.map(p => p.id)
        selectedProducts.value = [...editData.relatedProducts]
      }
      
      // 如果有已上传的文件，设置文件列表
      if (editData.uploadedFiles) {
        fileList.value = editData.uploadedFiles.map(file => ({
          uid: file.id,
          name: file.name,
          status: 'done',
          url: file.url
        }))
      }
    }
  }
}

// 加载模拟数据
onMounted(() => {
  // 检查编辑模式并加载数据
  loadEditData()
  
  // 模拟获取外部数据产品列表
  tableData.value = Array.from({ length: 50 }).map((_, index) => ({
    id: `data-${index + 1}`,
    dataName: `外部数据产品 ${index + 1}`,
    dataType: ['API', '文件', '数据库'][Math.floor(Math.random() * 3)],
    supplier: ['数据供应商A', '数据供应商B', '数据供应商C', '第三方数据公司'][Math.floor(Math.random() * 4)],
    price: Math.floor(Math.random() * 1000) / 100,
    interfaceTag: ['金融', '电商', '运营商', '社交', '交通'][Math.floor(Math.random() * 5)],
    isNew: Math.random() > 0.5 // 随机设置是否为新数据产品
  }))
  
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.external-purchase-register {
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

.register-steps {
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.step-content {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.step-container {
  padding: 16px 0;
}

.step-description {
  color: var(--color-text-3);
  margin-bottom: 24px;
}

.step-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.upload-area {
  border: 2px dashed var(--color-border-2);
  border-radius: 4px;
  transition: all 0.3s;
}

.upload-area--dragover {
  border-color: var(--color-primary-light-3);
  background-color: var(--color-primary-light-1);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.upload-highlight {
  color: var(--color-primary);
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-section {
  margin: 0;
}

.completion-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
}

.project-summary {
  width: 100%;
  margin-top: 32px;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
  font-style: italic;
}
</style>