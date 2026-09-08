<template>
  <div class="data-map-container">
    <!-- 顶部 Banner 区域 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="title-row">
          <h1 class="banner-title">文件导入</h1>
        </div>
        <p class="banner-subtitle">支持Excel、CSV等多种格式数据文件的上传、解析与标准化处理，快速实现线下数据线上化。</p>
        
        <div class="search-area">
          <a-input-search 
            v-model="searchKeyword"
            class="main-search-input"
            placeholder="输入文件名称或描述进行搜索"
            search-button
            size="large"
            allow-clear
            @search="handleSearch"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>
          
          <div class="search-filters-inline">
            <a-select
              v-model="fileType"
              placeholder="文件类型"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="excel">Excel</a-option>
              <a-option value="csv">CSV</a-option>
              <a-option value="txt">TXT</a-option>
            </a-select>
            <a-select
              v-model="status"
              placeholder="导入状态"
              allow-clear
              size="large"
              style="width: 160px"
              @change="handleFilterChange"
              class="filter-select"
            >
              <a-option value="success">导入成功</a-option>
              <a-option value="processing">处理中</a-option>
              <a-option value="failed">导入失败</a-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-cube"></div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <div class="content-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">文件列表</h3>
            <span class="result-count">共找到 {{ pagination.total }} 个文件记录</span>
          </div>
        </div>

        <a-spin :loading="loading" style="width: 100%">
          <a-empty v-if="fileList.length === 0" description="未找到相关文件" />
          <a-row :gutter="[20, 20]" v-else>
            <a-col 
              v-for="file in fileList" 
              :key="file.id" 
              :xs="24" :sm="12" :md="8" :lg="8" :xl="6"
            >
              <a-card hoverable class="file-card">
                <div class="card-header">
                  <div class="header-info">
                    <span class="file-name" :title="file.name">{{ file.name }}</span>
                    <div class="tags-row">
                      <a-tag size="mini" :color="getFileColor(file.type)">{{ file.type.toUpperCase() }}</a-tag>
                      <a-tag size="mini" color="gray">{{ file.size }}</a-tag>
                    </div>
                  </div>
                  <div class="status-badge" :class="file.status">
                    {{ getStatusText(file.status) }}
                  </div>
                </div>
                
                <div class="card-body">
                  <p class="description" :title="file.description">{{ file.description || '暂无描述' }}</p>
                  
                  <div class="progress-bar" v-if="file.status === 'processing'">
                    <a-progress :percent="file.progress" size="small" :show-text="false" />
                    <span class="progress-text">解析中 {{ (file.progress * 100).toFixed(0) }}%</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-item"><icon-user /> {{ file.uploader }}</span>
                    <span class="meta-item"><icon-clock-circle /> {{ file.uploadTime }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <a-button type="text" size="mini" @click="downloadFile(file)">下载</a-button>
                  <a-button type="text" size="mini" @click="previewData(file)" :disabled="file.status !== 'success'">预览</a-button>
                </div>
              </a-card>
            </a-col>
          </a-row>
          
          <div class="pagination-wrapper" v-if="fileList.length > 0">
            <a-pagination
              :total="pagination.total"
              :current="pagination.current"
              :page-size="pagination.pageSize"
              show-total
              show-jumper
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-spin>
      </div>
    </div>

    <!-- 上传文件弹窗 -->
    <a-modal v-model:visible="uploadVisible" title="文件导入" width="700px" @ok="handleUploadSubmit" @cancel="handleUploadCancel" :ok-loading="uploading">
      <a-steps :current="currentStep" style="margin-bottom: 24px;">
        <a-step title="上传文件" description="选择本地数据文件" />
        <a-step title="目标设置" description="选择目标库表" />
        <a-step title="导入确认" description="确认导入信息" />
      </a-steps>

      <!-- 第一步：上传文件 -->
      <div v-if="currentStep === 1" class="step-content">
        <a-upload
          draggable
          :limit="1"
          action="/"
          :auto-upload="false"
          @change="onFileChange"
          ref="uploadRef"
        >
          <template #upload-button>
            <div class="upload-area">
              <div class="upload-icon">
                <icon-upload />
              </div>
              <div class="upload-text">点击或拖拽文件到此处上传</div>
              <div class="upload-tip">支持 Excel, CSV, TXT 等格式</div>
            </div>
          </template>
        </a-upload>
      </div>

      <!-- 第二步：目标设置 -->
      <div v-if="currentStep === 2" class="step-content">
        <a-form :model="importForm" layout="vertical">
          <a-form-item field="database" label="目标数据库" required>
            <a-select v-model="importForm.database" placeholder="请选择目标数据库">
              <a-option value="db_marketing">营销集市 (db_marketing)</a-option>
              <a-option value="db_risk">风控集市 (db_risk)</a-option>
              <a-option value="db_operation">运营集市 (db_operation)</a-option>
              <a-option value="db_ods">贴源层 (db_ods)</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item field="mode" label="导入模式" required>
            <a-radio-group v-model="importForm.mode">
              <a-radio value="new">新建表</a-radio>
              <a-radio value="append">追加数据</a-radio>
              <a-radio value="overwrite">覆盖数据</a-radio>
            </a-radio-group>
          </a-form-item>

          <template v-if="importForm.mode === 'new'">
            <a-form-item field="tableName" label="表名" required>
              <a-input v-model="importForm.tableName" placeholder="请输入新建表名（英文）" />
            </a-form-item>
            <a-form-item field="tableComment" label="表中文名" required>
              <a-input v-model="importForm.tableComment" placeholder="请输入表中文名" />
            </a-form-item>
          </template>

          <template v-else>
            <a-form-item field="targetTable" label="目标表" required>
              <a-select v-model="importForm.targetTable" placeholder="请选择目标表">
                <a-option value="table_user_behavior">用户行为表</a-option>
                <a-option value="table_sales_daily">日销售明细</a-option>
                <a-option value="table_product_info">商品信息表</a-option>
              </a-select>
            </a-form-item>
          </template>
        </a-form>
      </div>

      <!-- 第三步：导入确认 -->
      <div v-if="currentStep === 3" class="step-content">
        <a-result status="info" title="准备就绪">
          <template #subtitle>
            即将把文件 <strong>{{ importForm.file?.name }}</strong> 导入到数据库 <strong>{{ importForm.database }}</strong> 的 
            <strong v-if="importForm.mode === 'new'">{{ importForm.tableName }} ({{ importForm.tableComment }})</strong>
            <strong v-else>{{ importForm.targetTable }}</strong> 表中。
          </template>
          <template #extra>
            <div class="confirm-info">
              <p>导入模式：{{ getModeText(importForm.mode) }}</p>
              <p>文件大小：{{ formatSize(importForm.file?.size || 0) }}</p>
            </div>
          </template>
        </a-result>
      </div>

      <template #footer>
        <a-button @click="handleUploadCancel">取消</a-button>
        <a-button v-if="currentStep > 1" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 3" type="primary" @click="nextStep" :disabled="!canProceed">下一步</a-button>
        <a-button v-if="currentStep === 3" type="primary" @click="handleUploadSubmit" :loading="uploading">开始导入</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch, IconUpload, IconUser, IconClockCircle,
  IconFile, IconFilePdf, IconFileImage
} from '@arco-design/web-vue/es/icon'

const searchKeyword = ref('')
const fileType = ref('')
const status = ref('')
const loading = ref(false)

const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 12
})

// 模拟数据
const mockFiles = [
  {
    id: 1,
    name: '2023年度渠道销售数据.xlsx',
    type: 'excel',
    size: '2.5MB',
    status: 'success',
    progress: 1,
    description: '包含各分公司、代理商的全年销售业绩汇总表。',
    uploader: '张销售',
    uploadTime: '2023-11-15 10:30'
  },
  {
    id: 2,
    name: 'Q3客户投诉记录.csv',
    type: 'csv',
    size: '15MB',
    status: 'processing',
    progress: 0.65,
    description: '第三季度全渠道客户投诉工单导出数据。',
    uploader: '李客服',
    uploadTime: '2023-11-15 11:45'
  },
  {
    id: 3,
    name: '线下门店巡检报告.pdf',
    type: 'pdf',
    size: '8.2MB',
    status: 'success',
    progress: 1,
    description: '全国门店标准化巡检结果及整改建议。',
    uploader: '王运营',
    uploadTime: '2023-11-14 15:20'
  },
  {
    id: 4,
    name: '营销活动素材包.zip',
    type: 'zip',
    size: '120MB',
    status: 'failed',
    progress: 0,
    description: '双十一大促活动相关的图片、文案素材归档。',
    uploader: '赵设计',
    uploadTime: '2023-11-10 09:10'
  }
]

const fileList = ref<any[]>([])

// 上传相关状态
const uploadVisible = ref(false)
const uploading = ref(false)
const currentStep = ref(1)
const uploadRef = ref()

const importForm = reactive({
  file: null as File | null,
  database: '',
  mode: 'new',
  tableName: '',
  tableComment: '',
  targetTable: ''
})

const getFileIcon = (type: string) => {
  const map: Record<string, any> = {
    excel: IconFile,
    csv: IconFile,
    pdf: IconFilePdf,
    zip: IconFile,
    image: IconFileImage
  }
  return map[type] || IconFile
}

const getFileColor = (type: string) => {
  const map: Record<string, string> = {
    excel: 'green',
    csv: 'green',
    pdf: 'red',
    zip: 'gray',
    image: 'purple'
  }
  return map[type] || 'arcoblue'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    success: '已完成',
    processing: '解析中',
    failed: '失败'
  }
  return map[status] || status
}

const getModeText = (mode: string) => {
  const map: Record<string, string> = {
    new: '新建表',
    append: '追加数据',
    overwrite: '覆盖数据'
  }
  return map[mode] || mode
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    fileList.value = mockFiles.filter(file => {
      const keywordMatch = !searchKeyword.value || file.name.includes(searchKeyword.value)
      const typeMatch = !fileType.value || file.type === fileType.value
      const statusMatch = !status.value || file.status === status.value
      return keywordMatch && typeMatch && statusMatch
    })
    pagination.value.total = fileList.value.length
    loading.value = false
  }, 500)
}

const handleFilterChange = () => {
  handleSearch()
}

const onPageChange = (current: number) => {
  pagination.value.current = current
}

const onPageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
}

const handleUpload = () => {
  currentStep.value = 1
  importForm.file = null
  importForm.database = ''
  importForm.mode = 'new'
  importForm.tableName = ''
  importForm.tableComment = ''
  importForm.targetTable = ''
  uploadVisible.value = true
}

const onFileChange = (_: any, currentFile: any) => {
  importForm.file = currentFile.file
}

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return !!importForm.file
  }
  if (currentStep.value === 2) {
    if (!importForm.database || !importForm.mode) return false
    if (importForm.mode === 'new') {
      return !!importForm.tableName && !!importForm.tableComment
    } else {
      return !!importForm.targetTable
    }
  }
  return true
})

const nextStep = () => {
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const handleUploadCancel = () => {
  uploadVisible.value = false
}

const handleUploadSubmit = () => {
  uploading.value = true
  // 模拟上传处理过程
  setTimeout(() => {
    uploading.value = false
    uploadVisible.value = false
    
    // 模拟添加新文件到列表
    const newFile = {
      id: Date.now(),
      name: importForm.file?.name || '未知文件',
      type: importForm.file?.name.split('.').pop()?.toLowerCase() || 'file',
      size: formatSize(importForm.file?.size || 0),
      status: 'processing',
      progress: 0.1,
      description: `导入到库 ${importForm.database}，模式：${getModeText(importForm.mode)}`,
      uploader: '当前用户',
      uploadTime: new Date().toLocaleString()
    }
    
    mockFiles.unshift(newFile)
    handleSearch()
    Message.success('文件已提交处理，请稍后查看结果')
    
    // 模拟后续进度更新
    setTimeout(() => {
      newFile.progress = 0.5
      handleSearch()
    }, 2000)
    
    setTimeout(() => {
      newFile.progress = 1
      newFile.status = 'success'
      handleSearch()
      Message.success(`${newFile.name} 导入完成`)
    }, 5000)
    
  }, 1500)
}

const downloadFile = (file: any) => {
  Message.success(`开始下载 ${file.name}`)
}

const previewData = (file: any) => {
  Message.info(`预览 ${file.name} 数据`)
}

const deleteFile = (file: any) => {
  const index = mockFiles.findIndex(f => f.id === file.id)
  if (index > -1) {
    mockFiles.splice(index, 1)
    handleSearch()
    Message.success('文件已删除')
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
/* 复用 TableList.vue 的基础样式结构 */
.data-map-container {
  min-height: 100vh;
  background: #f7f8fa;
}

.banner-section {
  background: linear-gradient(180deg, #E6F0FF 0%, #F7F8FA 100%);
  padding: 40px 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.banner-content {
  width: 100%;
  max-width: 1800px;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 40% 0 40px;
  box-sizing: border-box;
}

.banner-title {
  font-size: 40px;
  font-weight: bold;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.banner-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 32px;
  max-width: 600px;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 900px;
  flex-wrap: wrap;
}

.main-search-input {
  flex: 1;
  min-width: 400px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #165DFF;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.1);
}

.main-search-input :deep(.arco-input-wrapper) {
  border-radius: 30px;
  padding-left: 20px;
  background: #fff;
}

.main-search-input :deep(.arco-input-search-btn) {
  border-radius: 0 30px 30px 0;
  background: transparent;
  color: #165DFF;
  border-left: 1px solid #f2f3f5;
}

.search-filters-inline {
  display: flex;
  gap: 12px;
}

.filter-select {
  background: #fff;
  border-radius: 4px;
}

/* Main Content */
.main-content {
  padding: 0 40px 40px;
  width: 100%;
  max-width: 1800px;
  margin: -40px auto 0;
  position: relative;
  z-index: 3;
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.result-count {
  font-size: 13px;
  color: #86909c;
  margin-left: 12px;
}

/* File Card */
.file-card {
  border-radius: 8px;
  transition: all 0.2s;
  background: #fff;
  border: 1px solid #e5e6eb;
  height: 100%;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165DFF;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.header-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: block;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-row {
  display: flex;
  gap: 6px;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f2f3f5;
  color: #4e5969;
}

.status-badge.success { background: #e8ffea; color: #00b42a; }
.status-badge.processing { background: #e8f3ff; color: #165dff; }
.status-badge.failed { background: #ffece8; color: #f53f3f; }

.description {
  color: #86909c;
  font-size: 13px;
  line-height: 1.5;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #165dff;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Upload Modal Styles */
.step-content {
  margin-top: 24px;
  min-height: 200px;
}

.upload-area {
  width: 100%;
  height: 200px;
  background-color: #f7f8fa;
  border: 1px dashed #e5e6eb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #165DFF;
  background-color: #f2f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #86909c;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #86909c;
}

.confirm-info {
  margin-top: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
}

.confirm-info p {
  margin: 4px 0;
  color: #4e5969;
  font-size: 13px;
}
</style>