<template>
  <a-drawer
    :visible="visible"
    :width="800"
    :footer="false"
    @cancel="handleCancel"
    unmountOnClose
  >
    <template #title>
      <div class="flex items-center">
        <icon-upload class="mr-2" />
        批量导入标签表
      </div>
    </template>

    <div class="batch-import-container">
      <!-- 步骤指示器 -->
      <a-steps :current="currentStep" class="mb-6">
        <a-step>上传文件</a-step>
        <a-step>数据预览</a-step>
        <a-step>确认导入</a-step>
      </a-steps>

      <!-- 步骤1: 文件上传 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="upload-section">
          <a-upload
            ref="uploadRef"
            :file-list="fileList"
            :limit="1"
            :accept="acceptFileTypes"
            :before-upload="beforeUpload"
            @change="handleFileChange"
            @progress="handleUploadProgress"
            class="upload-area"
          >
            <template #upload-button>
              <div class="upload-trigger">
                <div class="upload-icon">
                  <icon-plus class="text-2xl" />
                </div>
                <div class="upload-text">
                  <div class="text-lg font-medium">点击上传文件</div>
                  <div class="text-sm text-gray-500 mt-1">
                    支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
                  </div>
                </div>
              </div>
            </template>
          </a-upload>
        </div>

        <!-- 模板下载 -->
        <div class="template-section mt-6">
          <a-alert type="info" class="mb-4">
            <template #title>导入模板说明</template>
            <template #content>
              <div class="text-sm">
                <p>请按照模板格式准备数据，确保数据准确性：</p>
                <ul class="mt-2 list-disc pl-4">
                  <li>标签名称：必填，长度不超过50字符</li>
                  <li>标签编码：必填，唯一标识符</li>
                  <li>标签分类：必填，选择预定义分类</li>
                  <li>标签描述：可选，长度不超过200字符</li>
                  <li>标签值类型：必填，选择：string、number、date、boolean</li>
                  <li>状态：可选，填写：active、inactive，默认为active</li>
                </ul>
              </div>
            </template>
          </a-alert>
          <a-button type="outline" @click="downloadTemplate">
            <template #icon><icon-download /></template>
            下载导入模板
          </a-button>
        </div>
      </div>

      <!-- 步骤2: 数据预览 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="preview-header mb-4">
          <div class="flex justify-between items-center">
            <div class="text-lg font-medium">数据预览</div>
            <div class="text-sm text-gray-500">
              共 {{ previewData.length }} 条数据
            </div>
          </div>
        </div>

        <div class="preview-table">
          <a-table
            :data="previewData"
            :columns="previewColumns"
            :pagination="{ pageSize: 10 }"
            :scroll="{ y: 400 }"
            size="small"
          >
            <template #status="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template #validation="{ record }">
              <a-tooltip v-if="record.validationErrors?.length" :content="record.validationErrors.join(', ')">
                <icon-exclamation-circle-fill class="text-red-500" />
              </a-tooltip>
              <icon-check-circle-fill v-else class="text-green-500" />
            </template>
          </a-table>
        </div>

        <!-- 验证结果 -->
        <div v-if="validationSummary" class="validation-summary mt-4">
          <a-alert :type="validationSummary.type" :title="validationSummary.title">
            <template #content>
              <div class="text-sm">{{ validationSummary.message }}</div>
            </template>
          </a-alert>
        </div>
      </div>

      <!-- 步骤3: 确认导入 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="import-summary">
          <a-result
            :status="importResult.status"
            :title="importResult.title"
            :sub-title="importResult.subTitle"
          >
            <template #icon v-if="importResult.status === 'success'">
              <icon-check-circle-fill class="text-green-500 text-6xl" />
            </template>
            <template #extra>
              <div class="import-stats" v-if="importResult.stats">
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="stat-item text-center">
                    <div class="text-2xl font-bold text-green-600">{{ importResult.stats.success }}</div>
                    <div class="text-sm text-gray-500">成功导入</div>
                  </div>
                  <div class="stat-item text-center">
                    <div class="text-2xl font-bold text-orange-600">{{ importResult.stats.skipped }}</div>
                    <div class="text-sm text-gray-500">跳过重复</div>
                  </div>
                  <div class="stat-item text-center">
                    <div class="text-2xl font-bold text-red-600">{{ importResult.stats.failed }}</div>
                    <div class="text-sm text-gray-500">导入失败</div>
                  </div>
                </div>
                <div v-if="importResult.failedItems?.length" class="failed-items mt-4">
                  <div class="text-sm font-medium mb-2">失败项目：</div>
                  <div class="max-h-32 overflow-y-auto border rounded p-2">
                    <div v-for="item in importResult.failedItems" :key="item.name" class="text-xs text-red-600 py-1">
                      {{ item.name }}: {{ item.error }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </a-result>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="flex justify-between">
        <a-button v-if="currentStep > 0" @click="handlePrevious">
          上一步
        </a-button>
        <div class="flex-1"></div>
        <a-button @click="handleCancel" class="mr-3">
          取消
        </a-button>
        <a-button
          v-if="currentStep < 2"
          type="primary"
          :loading="loading"
          :disabled="!canNext"
          @click="handleNext"
        >
          {{ currentStep === 0 ? '下一步' : '确认导入' }}
        </a-button>
        <a-button
          v-else
          type="primary"
          @click="handleComplete"
        >
          完成
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as XLSX from 'xlsx'
import { useTagCenterStore } from '@/stores/tagCenter'
import type { TagTable } from '@/api/tag'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagCenterStore = useTagCenterStore()
const uploadRef = ref()

// 状态管理
const currentStep = ref(0)
const fileList = ref([])
const loading = ref(false)
const uploadProgress = ref(0)

// 预览数据
const previewData = ref<any[]>([])
const validationSummary = ref<any>(null)

// 导入结果
const importResult = reactive({
  status: 'info' as 'success' | 'error' | 'info',
  title: '',
  subTitle: '',
  stats: null as any,
  failedItems: [] as any[]
})

// 文件类型限制
const acceptFileTypes = '.xlsx,.xls,.csv'

// 预览表格列定义
const previewColumns = [
  {
    title: '标签名称',
    dataIndex: 'name',
    width: 150,
    ellipsis: true
  },
  {
    title: '标签编码',
    dataIndex: 'code',
    width: 120,
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    width: 100
  },
  {
    title: '值类型',
    dataIndex: 'valueType',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '验证',
    dataIndex: 'validation',
    slotName: 'validation',
    width: 60,
    align: 'center'
  }
]

// 计算属性
const canNext = computed(() => {
  switch (currentStep.value) {
    case 0:
      return fileList.value.length > 0
    case 1:
      return previewData.value.length > 0 && 
             previewData.value.every(item => !item.validationErrors?.length)
    default:
      return true
  }
})

// 状态颜色映射
const getStatusColor = (status: string) => {
  const colorMap = {
    active: 'green',
    inactive: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap = {
    active: '启用',
    inactive: '禁用'
  }
  return textMap[status] || status
}

// 文件上传前处理
const beforeUpload = (file: File) => {
  const isValidType = file.type === 'text/csv' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel'
  
  if (!isValidType) {
    Message.error('请上传 Excel 或 CSV 文件')
    return false
  }

  const isValidSize = file.size / 1024 / 1024 < 10
  if (!isValidSize) {
    Message.error('文件大小不能超过 10MB')
    return false
  }

  return true
}

// 文件变化处理
const handleFileChange = (files: any[]) => {
  fileList.value = files
  if (files.length > 0) {
    const file = files[0].file
    parseFile(file)
  }
}

// 文件上传进度
const handleUploadProgress = (file: any) => {
  uploadProgress.value = file.percent
}

// 解析文件
const parseFile = async (file: File) => {
  try {
    loading.value = true
    let data: any[] = []

    if (file.type === 'text/csv') {
      // 解析 CSV
      const text = await file.text()
      data = parseCSV(text)
    } else {
      // 解析 Excel
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      data = XLSX.utils.sheet_to_json(firstSheet)
    }

    // 转换数据格式
    previewData.value = data.map((item, index) => {
      const tagData = {
        name: item['标签名称'] || item.name || '',
        code: item['标签编码'] || item.code || '',
        category: item['标签分类'] || item.category || '',
        description: item['标签描述'] || item.description || '',
        valueType: item['标签值类型'] || item.valueType || 'string',
        status: (item['状态'] || item.status || 'active').toLowerCase(),
        validationErrors: [] as string[]
      }

      // 验证数据
      tagData.validationErrors = validateTagData(tagData)
      return tagData
    })

    updateValidationSummary()
    Message.success('文件解析成功')
  } catch (error) {
    Message.error('文件解析失败: ' + error.message)
    previewData.value = []
  } finally {
    loading.value = false
  }
}

// 解析 CSV
const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  })
}

// 验证标签数据
const validateTagData = (data: any): string[] => {
  const errors: string[] = []

  if (!data.name || data.name.length > 50) {
    errors.push('标签名称必填且长度不超过50字符')
  }

  if (!data.code || data.code.length > 30) {
    errors.push('标签编码必填且长度不超过30字符')
  }

  if (!data.category) {
    errors.push('标签分类必填')
  }

  if (!['string', 'number', 'date', 'boolean'].includes(data.valueType)) {
    errors.push('标签值类型必须是: string、number、date、boolean')
  }

  if (!['active', 'inactive'].includes(data.status)) {
    errors.push('状态必须是: active、inactive')
  }

  return errors
}

// 更新验证摘要
const updateValidationSummary = () => {
  const total = previewData.value.length
  const valid = previewData.value.filter(item => !item.validationErrors?.length).length
  const invalid = total - valid

  if (invalid === 0) {
    validationSummary.value = {
      type: 'success',
      title: '数据验证通过',
      message: `所有 ${total} 条数据均符合要求，可以导入`
    }
  } else {
    validationSummary.value = {
      type: 'warning',
      title: '数据验证警告',
      message: `${valid} 条数据符合要求，${invalid} 条数据存在问题需要修正`
    }
  }
}

// 下载模板
const downloadTemplate = () => {
  const template = [
    ['标签名称', '标签编码', '标签分类', '标签描述', '标签值类型', '状态'],
    ['用户年龄', 'user_age', '用户属性', '用户的年龄信息', 'number', 'active'],
    ['用户性别', 'user_gender', '用户属性', '用户的性别信息', 'string', 'active']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(template)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '标签导入模板')
  
  XLSX.writeFile(workbook, '标签导入模板.xlsx')
}

// 上一步
const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const handleNext = async () => {
  if (currentStep.value === 0) {
    currentStep.value = 1
  } else if (currentStep.value === 1) {
    await handleImport()
  }
}

// 执行导入
const handleImport = async () => {
  try {
    loading.value = true
    const validData = previewData.value.filter(item => !item.validationErrors?.length)
    
    const result = await tagCenterStore.batchImportTags(validData)
    
    importResult.status = 'success'
    importResult.title = '导入成功'
    importResult.subTitle = `成功导入 ${result.success} 条标签数据`
    importResult.stats = {
      success: result.success,
      skipped: result.skipped,
      failed: result.failed
    }
    importResult.failedItems = result.failedItems || []
    
    currentStep.value = 2
    Message.success('标签数据导入成功')
  } catch (error) {
    importResult.status = 'error'
    importResult.title = '导入失败'
    importResult.subTitle = error.message || '导入过程中发生错误'
    currentStep.value = 2
    Message.error('导入失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 完成
const handleComplete = () => {
  handleCancel()
  emit('success')
}

// 取消
const handleCancel = () => {
  currentStep.value = 0
  fileList.value = []
  previewData.value = []
  validationSummary.value = null
  importResult.status = 'info'
  importResult.title = ''
  importResult.subTitle = ''
  importResult.stats = null
  importResult.failedItems = []
  emit('update:visible', false)
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    handleCancel()
  }
})
</script>

<style scoped lang="less">
.batch-import-container {
  padding: 0 20px;
}

.upload-section {
  .upload-area {
    width: 100%;
  }
  
  .upload-trigger {
    width: 100%;
    height: 200px;
    border: 2px dashed var(--color-border-2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: var(--color-primary-6);
      background-color: var(--color-primary-1);
    }
  }
  
  .upload-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--color-fill-2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
}

.preview-table {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  overflow: hidden;
}

.validation-summary {
  padding: 12px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
}

.import-stats {
  .stat-item {
    padding: 16px;
    background-color: var(--color-fill-2);
    border-radius: 8px;
  }
}

.failed-items {
  border-color: var(--color-danger-light-3);
}
</style>