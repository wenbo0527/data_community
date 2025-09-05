<template>
  <div class="batch-registration">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>批量注册指标</h2>
      <div class="header-actions">
        <a-button type="outline" @click="downloadTemplate">
          <template #icon><icon-download /></template>
          下载模板
        </a-button>
      </div>
    </div>

    <!-- 指标类型选择 -->
    <div class="metric-type-tabs">
      <a-tabs v-model:active-key="currentMetricType" @change="handleMetricTypeChange">
        <a-tab-pane :key="MetricType.BUSINESS_CORE" title="业务核心指标" />
        <a-tab-pane :key="MetricType.REGULATORY" title="监管指标" />
      </a-tabs>
    </div>

    <!-- 上传区域 -->
    <a-card class="upload-card">
      <template #title>
        <span class="card-title">文件上传</span>
      </template>
      
      <a-upload
        ref="uploadRef"
        :file-list="fileList"
        :show-file-list="true"
        :auto-upload="false"
        :accept="'.xlsx,.xls'"
        :limit="1"
        @change="handleFileChange"
        @remove="handleFileRemove"
      >
        <template #upload-button>
          <div class="upload-area">
            <div class="upload-icon">
              <icon-upload />
            </div>
            <div class="upload-text">
              <div class="upload-title">点击上传或拖拽文件到此区域</div>
              <div class="upload-subtitle">支持 .xlsx、.xls 格式，文件大小不超过 10MB</div>
            </div>
          </div>
        </template>
      </a-upload>

      <div class="upload-actions" v-if="fileList.length > 0">
        <a-button type="primary" @click="parseFile" :loading="parsing">
          解析文件
        </a-button>
        <a-button @click="clearFiles">清空文件</a-button>
      </div>
    </a-card>

    <!-- 数据预览 -->
    <a-card class="preview-card" v-if="previewData.length > 0">
      <template #title>
        <span class="card-title">数据预览</span>
        <span class="data-count">（共 {{ previewData.length }} 条数据）</span>
      </template>
      
      <div class="validation-summary" v-if="validationResults.length > 0">
        <a-alert
          :type="hasValidationErrors ? 'error' : 'warning'"
          :title="hasValidationErrors ? '数据校验失败' : '数据校验警告'"
          :description="validationSummary"
          show-icon
          closable
        />
      </div>

      <a-table
        :columns="previewColumns"
        :data="previewData"
        :pagination="{
          current: previewPagination.current,
          pageSize: previewPagination.pageSize,
          total: previewData.length,
          showTotal: true,
          showPageSize: true
        }"
        @page-change="onPreviewPageChange"
        @page-size-change="onPreviewPageSizeChange"
        row-key="index"
      >
        <template #status="{ record }">
          <a-tag
            :color="record.validationStatus === 'success' ? 'green' : record.validationStatus === 'error' ? 'red' : 'orange'"
          >
            {{ record.validationStatus === 'success' ? '通过' : record.validationStatus === 'error' ? '失败' : '警告' }}
          </a-tag>
        </template>
        <template #errors="{ record }">
          <div v-if="record.errors && record.errors.length > 0">
            <a-tag color="red" v-for="error in record.errors" :key="error" size="small">
              {{ error }}
            </a-tag>
          </div>
        </template>
      </a-table>

      <div class="batch-actions">
        <a-button
          type="primary"
          @click="submitBatch"
          :loading="submitting"
          :disabled="hasValidationErrors"
        >
          批量提交（{{ validDataCount }} 条）
        </a-button>
        <a-button @click="exportErrors" v-if="hasValidationErrors">
          导出错误数据
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconDownload, IconUpload } from '@arco-design/web-vue/es/icon'
import type { FileItem } from '@arco-design/web-vue'
import type { MetricType, RegulatoryCategory } from '@/types/metrics'
import { MetricType as MetricTypeEnum, RegulatoryCategory as RegulatoryCategoryEnum } from '@/types/metrics'

// 当前指标类型
const currentMetricType = ref<MetricType>(MetricTypeEnum.BUSINESS_CORE)
const MetricType = MetricTypeEnum
const RegulatoryCategory = RegulatoryCategoryEnum

// 文件上传相关
const uploadRef = ref()
const fileList = ref<FileItem[]>([])
const parsing = ref(false)
const submitting = ref(false)

// 数据预览相关
const previewData = ref<any[]>([])
const validationResults = ref<any[]>([])
const previewPagination = reactive({
  current: 1,
  pageSize: 10
})

// 预览表格列配置
const previewColumns = computed(() => {
  const baseColumns = [
    { title: '序号', dataIndex: 'index', width: 80 },
    { title: '指标名称', dataIndex: 'name', width: 200 },
    { title: '指标编码', dataIndex: 'code', width: 150 },
    { title: '指标分类', dataIndex: 'category', width: 120 },
    { title: '统计周期', dataIndex: 'statisticalPeriod', width: 120 },
    { title: '校验状态', slotName: 'status', width: 100 },
    { title: '错误信息', slotName: 'errors', width: 200 }
  ]

  if (currentMetricType.value === MetricTypeEnum.BUSINESS_CORE) {
    baseColumns.splice(4, 0, { title: '业务域', dataIndex: 'businessDomain', width: 120 })
    baseColumns.splice(6, 0, { title: '负责人', dataIndex: 'owner', width: 120 })
  } else {
    baseColumns.splice(4, 0, { title: '监管报表大类', dataIndex: 'regulatoryCategory', width: 150 })
    baseColumns.splice(6, 0, { title: '业务负责人', dataIndex: 'businessOwner', width: 120 })
    baseColumns.splice(7, 0, { title: '技术负责人', dataIndex: 'technicalOwner', width: 120 })
    baseColumns.splice(8, 0, { title: '报表名称', dataIndex: 'reportName', width: 150 })
  }

  return baseColumns
})

// 计算属性
const hasValidationErrors = computed(() => {
  return validationResults.value.some(result => result.status === 'error')
})

const validDataCount = computed(() => {
  return validationResults.value.filter(result => result.status === 'success').length
})

const validationSummary = computed(() => {
  const errorCount = validationResults.value.filter(r => r.status === 'error').length
  const warningCount = validationResults.value.filter(r => r.status === 'warning').length
  const successCount = validationResults.value.filter(r => r.status === 'success').length
  
  return `成功: ${successCount} 条，警告: ${warningCount} 条，错误: ${errorCount} 条`
})

// 指标类型切换
const handleMetricTypeChange = (type: MetricType) => {
  currentMetricType.value = type
  // 切换类型时清空已上传的数据
  clearFiles()
}

// 下载模板
const downloadTemplate = () => {
  try {
    // 调用Excel工具函数生成并下载模板
    import('@/utils/excelUtils').then(({ generateExcelTemplate }) => {
      generateExcelTemplate(currentMetricType.value)
      Message.success('模板下载成功')
    })
  } catch (error) {
    console.error('下载模板失败:', error)
    Message.error('模板下载失败')
  }
}

// 文件变化处理
const handleFileChange = (fileList: FileItem[]) => {
  // 限制只能上传一个文件
  if (fileList.length > 1) {
    fileList.splice(0, fileList.length - 1)
  }
}

// 文件移除处理
const handleFileRemove = (fileItem: FileItem) => {
  const index = fileList.value.findIndex(item => item.uid === fileItem.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
  // 清空预览数据
  previewData.value = []
  validationResults.value = []
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  previewData.value = []
  validationResults.value = []
}

// 解析文件
const parseFile = async () => {
  if (fileList.value.length === 0) {
    Message.warning('请先上传文件')
    return
  }

  parsing.value = true
  try {
    const file = fileList.value[0].file
    if (!file) {
      throw new Error('文件不存在')
    }
    
    // 使用Excel工具函数解析文件
    const { parseExcelFile } = await import('@/utils/excelUtils')
    const parsedData = await parseExcelFile(file, currentMetricType.value)
    
    previewData.value = parsedData
    
    // 数据校验
    validationResults.value = parsedData.map((item, index) => {
      const errors = validateItem(item)
      return {
        index,
        status: errors.length === 0 ? 'success' : 'error',
        errors
      }
    })
    
    // 更新预览数据的校验状态
    previewData.value.forEach((item, index) => {
      const result = validationResults.value[index]
      item.validationStatus = result.status
      item.errors = result.errors
    })
    
    Message.success(`文件解析完成，共解析 ${parsedData.length} 条数据`)
  } catch (error) {
    console.error('文件解析失败:', error)
    Message.error('文件解析失败：' + (error as Error).message)
  } finally {
    parsing.value = false
  }
}



// 数据校验
const validateItem = (item: any) => {
  const errors = []
  
  if (!item.name) errors.push('指标名称不能为空')
  if (!item.code) errors.push('指标编码不能为空')
  if (!item.category) errors.push('指标分类不能为空')
  
  if (currentMetricType.value === MetricTypeEnum.BUSINESS_CORE) {
    if (!item.businessDomain) errors.push('业务域不能为空')
    if (!item.owner) errors.push('负责人不能为空')
  } else {
    if (!item.regulatoryCategory) errors.push('监管报表大类不能为空')
    if (!item.businessOwner) errors.push('业务负责人不能为空')
    if (!item.technicalOwner) errors.push('技术负责人不能为空')
    if (!item.reportName) errors.push('报表名称不能为空')
  }
  
  return errors
}

// 预览分页处理
const onPreviewPageChange = (current: number) => {
  previewPagination.current = current
}

const onPreviewPageSizeChange = (pageSize: number) => {
  previewPagination.pageSize = pageSize
  previewPagination.current = 1
}

// 批量提交
const submitBatch = async () => {
  if (hasValidationErrors.value) {
    Message.error('存在校验错误，请修正后重新提交')
    return
  }
  
  submitting.value = true
  try {
    // 模拟批量提交
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    Message.success(`批量注册成功，共注册 ${validDataCount.value} 个指标`)
    
    // 清空数据
    clearFiles()
  } catch (error) {
    Message.error('批量提交失败')
  } finally {
    submitting.value = false
  }
}

// 导出错误数据
const exportErrors = async () => {
  const errorData = previewData.value.filter(item => item.validationStatus === 'error')
  if (errorData.length === 0) {
    Message.warning('没有错误数据需要导出')
    return
  }
  
  try {
    // 使用Excel工具函数导出错误数据
    const { exportErrorData } = await import('@/utils/excelUtils')
    exportErrorData(errorData, currentMetricType.value)
    Message.success('错误数据导出成功')
  } catch (error) {
    console.error('导出错误数据失败:', error)
    Message.error('导出错误数据失败')
  }
}
</script>

<style scoped>
.batch-registration {
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

.metric-type-tabs {
  margin-bottom: 20px;
}

.metric-type-tabs :deep(.arco-tabs-nav) {
  margin-bottom: 0;
}

.metric-type-tabs :deep(.arco-tabs-tab) {
  font-weight: 500;
}

.upload-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  color: #1d2129;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #e5e6eb;
  border-radius: 6px;
  background: #f7f8fa;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f2f5ff;
}

.upload-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  color: #86909c;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.preview-card {
  margin-bottom: 20px;
}

.data-count {
  font-size: 14px;
  color: #86909c;
  font-weight: normal;
}

.validation-summary {
  margin-bottom: 16px;
}

.batch-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>