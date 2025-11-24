<template>
  <div class="data-export-panel">
    <div class="section-header">
      <div class="section-title">
        <icon-download />
        <span>数据导出</span>
      </div>
      <div class="section-actions">
        <a-space>
          <a-button 
            type="text" 
            size="mini"
            @click="showExportHistory"
          >
            <icon-history />
          </a-button>
          <a-button 
            type="text" 
            size="mini"
            @click="showExportSettings"
          >
            <icon-settings />
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 导出配置 -->
    <div class="export-config">
      <a-space direction="vertical" :size="12" fill>
        <!-- 导出格式 -->
        <div class="config-item">
          <div class="config-label">
            <icon-file />
            <span>导出格式</span>
          </div>
          <a-radio-group v-model="exportConfig.format" type="button" size="small">
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="excel">Excel</a-radio>
            <a-radio value="json">JSON</a-radio>
          </a-radio-group>
        </div>

        <!-- 数据类型 -->
        <div class="config-item">
          <div class="config-label">
            <icon-database />
            <span>数据类型</span>
          </div>
          <a-checkbox-group v-model="exportConfig.dataTypes" direction="vertical">
            <a-checkbox value="overview">统计概览</a-checkbox>
            <a-checkbox value="nodes">节点统计</a-checkbox>
            <a-checkbox value="users">用户分析</a-checkbox>
            <a-checkbox value="charts">图表数据</a-checkbox>
          </a-checkbox-group>
        </div>

        <!-- 时间范围 -->
        <div class="config-item">
          <div class="config-label">
            <icon-calendar />
            <span>时间范围</span>
          </div>
          <a-radio-group v-model="exportConfig.timeRange" type="button" size="small">
            <a-radio value="current">当前筛选</a-radio>
            <a-radio value="all">全部时间</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
          
          <div v-if="exportConfig.timeRange === 'custom'" class="custom-date-range">
            <a-range-picker
              v-model="exportConfig.customDateRange"
              size="small"
              style="width: 100%"
            />
          </div>
        </div>

        <!-- 字段选择 -->
        <div class="config-item">
          <div class="config-label">
            <icon-list />
            <span>导出字段</span>
          </div>
          <div class="field-selector">
            <div class="field-groups">
              <div class="field-group">
                <div class="group-header">
                  <a-checkbox 
                    v-model="fieldGroups.overview.all"
                    @change="toggleFieldGroup('overview')"
                  >
                    统计概览字段
                  </a-checkbox>
                </div>
                <div class="group-fields">
                  <a-checkbox-group v-model="fieldGroups.overview.selected">
                    <a-checkbox value="totalVisits">总访问量</a-checkbox>
                    <a-checkbox value="totalConversions">总转化数</a-checkbox>
                    <a-checkbox value="activeUsers">活跃用户</a-checkbox>
                    <a-checkbox value="avgStayTime">平均停留</a-checkbox>
                    <a-checkbox value="conversionRate">转化率</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div class="field-group">
                <div class="group-header">
                  <a-checkbox 
                    v-model="fieldGroups.nodes.all"
                    @change="toggleFieldGroup('nodes')"
                  >
                    节点统计字段
                  </a-checkbox>
                </div>
                <div class="group-fields">
                  <a-checkbox-group v-model="fieldGroups.nodes.selected">
                    <a-checkbox value="nodeId">节点ID</a-checkbox>
                    <a-checkbox value="nodeLabel">节点名称</a-checkbox>
                    <a-checkbox value="nodeType">节点类型</a-checkbox>
                    <a-checkbox value="enterCount">进入人数</a-checkbox>
                    <a-checkbox value="exitCount">离开人数</a-checkbox>
                    <a-checkbox value="conversionRate">转化率</a-checkbox>
                    <a-checkbox value="avgStayTime">平均停留</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
              
              <div class="field-group">
                <div class="group-header">
                  <a-checkbox 
                    v-model="fieldGroups.users.all"
                    @change="toggleFieldGroup('users')"
                  >
                    用户分析字段
                  </a-checkbox>
                </div>
                <div class="group-fields">
                  <a-checkbox-group v-model="fieldGroups.users.selected">
                    <a-checkbox value="userId">用户ID</a-checkbox>
                    <a-checkbox value="deviceType">设备类型</a-checkbox>
                    <a-checkbox value="location">地理位置</a-checkbox>
                    <a-checkbox value="totalVisits">访问次数</a-checkbox>
                    <a-checkbox value="totalStayTime">总停留时间</a-checkbox>
                  </a-checkbox-group>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 导出选项 -->
        <div class="config-item">
          <div class="config-label">
            <icon-settings />
            <span>导出选项</span>
          </div>
          <a-space direction="vertical" :size="8" fill>
            <a-checkbox v-model="exportConfig.includeCharts">包含图表</a-checkbox>
            <a-checkbox v-model="exportConfig.includeMetadata">包含元数据</a-checkbox>
            <a-checkbox v-model="exportConfig.compressFile">压缩文件</a-checkbox>
          </a-space>
        </div>
      </a-space>
    </div>

    <!-- 导出操作 -->
    <div class="export-actions">
      <a-space>
        <a-button 
          type="primary" 
          size="default"
          @click="startExport"
          :loading="exporting"
          :disabled="!canExport"
        >
          <icon-download />
          开始导出
        </a-button>
        <a-button 
          size="default"
          @click="handlePreviewData"
          :disabled="exporting"
        >
          <icon-eye />
          预览数据
        </a-button>
        <a-button 
          type="text" 
          size="default"
          @click="saveAsTemplate"
        >
          <icon-save />
          保存模板
        </a-button>
      </a-space>
    </div>

    <!-- 导出进度 -->
    <div v-if="exporting" class="export-progress">
      <div class="progress-header">
        <span>导出进度</span>
        <span>{{ exportProgress }}%</span>
      </div>
      <a-progress 
        :percent="exportProgress" 
        :status="exportStatus"
        :show-text="false"
      />
      <div class="progress-info">
        <span>{{ exportMessage }}</span>
        <span>{{ formatFileSize(exportedSize) }} / {{ formatFileSize(totalSize) }}</span>
      </div>
      <div class="progress-actions">
        <a-space>
          <a-button 
            v-if="exportStatus === 'normal'"
            size="small"
            @click="cancelExport"
          >
            取消
          </a-button>
          <a-button 
            v-if="exportStatus === 'success'"
            type="primary"
            size="small"
            @click="downloadFile"
          >
            下载文件
          </a-button>
          <a-button 
            v-if="exportStatus === 'error'"
            size="small"
            @click="retryExport"
          >
            重试
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 导出历史 -->
    <div v-if="showHistory" class="export-history">
      <div class="history-header">
        <div class="history-title">
          <icon-history />
          <span>导出历史</span>
        </div>
        <a-link @click="clearHistory">清空历史</a-link>
      </div>
      <div class="history-list">
        <div 
          v-for="item in exportHistory" 
          :key="item.id"
          class="history-item"
        >
          <div class="history-info">
            <div class="history-filename">{{ item.filename }}</div>
            <div class="history-details">
              <span>{{ item.format.toUpperCase() }}</span>
              <span>{{ formatFileSize(item.size) }}</span>
              <span>{{ formatTime(item.timestamp) }}</span>
            </div>
          </div>
          <div class="history-actions">
            <a-button 
              type="text" 
              size="mini"
              @click="downloadHistoryFile(item)"
            >
              <icon-download />
            </a-button>
            <a-button 
              type="text" 
              size="mini"
              @click="deleteHistoryItem(item.id)"
            >
              <icon-delete />
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据预览 -->
    <div v-if="showPreview" class="data-preview">
      <div class="preview-header">
        <div class="preview-title">
          <icon-eye />
          <span>数据预览</span>
        </div>
        <a-button 
          type="text" 
          size="mini"
          @click="closePreview"
        >
          <icon-close />
        </a-button>
      </div>
      <div class="preview-content">
        <a-table 
          :data="previewData" 
          :columns="previewColumns"
          :pagination="false"
          size="small"
          :scroll="{ y: 300 }"
        />
      </div>
      <div class="preview-footer">
        <span>显示前 {{ previewData.length }} 条数据</span>
        <a-button 
          type="primary" 
          size="small"
          @click="closePreview"
        >
          关闭预览
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { 
  IconDownload, 
  IconEye, 
  IconSave, 
  IconHistory, 
  IconSettings,
  IconFile,
  IconCalendar,
  IconList,
  IconClose,
  IconDelete
} from '@arco-design/web-vue/es/icon'

interface Props {
  canvasId: string
  filters: any
  exportData: any
}

interface ExportConfig {
  format: 'csv' | 'excel' | 'json'
  dataTypes: string[]
  timeRange: 'current' | 'all' | 'custom'
  customDateRange: string[]
  includeCharts: boolean
  includeMetadata: boolean
  compressFile: boolean
}

interface ExportHistoryItem {
  id: string
  filename: string
  format: string
  size: number
  timestamp: Date
  status: 'success' | 'failed'
}

const props = defineProps<Props>()
const emit = defineEmits(['export-start', 'export-complete', 'export-error'])

// 导出配置
const exportConfig = reactive<ExportConfig>({
  format: 'excel',
  dataTypes: ['overview', 'nodes'],
  timeRange: 'current',
  customDateRange: [],
  includeCharts: false,
  includeMetadata: true,
  compressFile: false
})

// 字段分组
const fieldGroups = reactive({
  overview: {
    all: false,
    selected: ['totalVisits', 'totalConversions', 'activeUsers']
  },
  nodes: {
    all: false,
    selected: ['nodeId', 'nodeLabel', 'enterCount', 'conversionRate']
  },
  users: {
    all: false,
    selected: ['userId', 'totalVisits', 'totalStayTime']
  }
})

// 状态管理
const exporting = ref(false)
const exportProgress = ref(0)
const exportStatus = ref<'normal' | 'success' | 'error'>('normal')
const exportMessage = ref('')
const exportedSize = ref(0)
const totalSize = ref(0)
const showHistory = ref(false)
const showPreview = ref(false)
const previewDataList = ref<any[]>([])
const previewColumns = ref<any[]>([])

// 导出历史
const exportHistory = ref<ExportHistoryItem[]>([
  {
    id: '1',
    filename: 'canvas_statistics_20240115.xlsx',
    format: 'excel',
    size: 245760,
    timestamp: new Date(Date.now() - 3600000),
    status: 'success'
  },
  {
    id: '2',
    filename: 'user_analysis_20240115.csv',
    format: 'csv',
    size: 102400,
    timestamp: new Date(Date.now() - 7200000),
    status: 'success'
  }
])

// 计算属性
const canExport = computed(() => {
  return exportConfig.dataTypes.length > 0 && !exporting.value
})

// 切换字段组
const toggleFieldGroup = (group: string) => {
  const groupConfig = fieldGroups[group as keyof typeof fieldGroups]
  if (groupConfig) {
    const allFields = getAllFields(group)
    
    if (groupConfig.all) {
      groupConfig.selected = [...allFields]
    } else {
      groupConfig.selected = []
    }
  }
}

// 获取所有字段
const getAllFields = (group: string): string[] => {
  const fields: Record<string, string[]> = {
    overview: ['totalVisits', 'totalConversions', 'activeUsers', 'avgStayTime', 'conversionRate'],
    nodes: ['nodeId', 'nodeLabel', 'nodeType', 'enterCount', 'exitCount', 'conversionRate', 'avgStayTime'],
    users: ['userId', 'deviceType', 'location', 'totalVisits', 'totalStayTime']
  }
  return fields[group] || []
}

// 开始导出
const startExport = async () => {
  if (!canExport.value) return
  
  exporting.value = true
  exportProgress.value = 0
  exportStatus.value = 'normal'
  exportMessage.value = '准备导出数据...'
  
  emit('export-start', exportConfig)
  
  try {
    // 模拟导出过程
    const steps = [
      { progress: 10, message: '正在收集统计数据...', delay: 500 },
      { progress: 25, message: '正在处理节点数据...', delay: 800 },
      { progress: 40, message: '正在生成用户分析...', delay: 600 },
      { progress: 60, message: '正在创建图表数据...', delay: 1000 },
      { progress: 80, message: '正在格式化数据...', delay: 400 },
      { progress: 95, message: '正在生成文件...', delay: 700 },
      { progress: 100, message: '导出完成！', delay: 300 }
    ]
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      exportProgress.value = step.progress
      exportMessage.value = step.message
      exportedSize.value = Math.floor(totalSize.value * step.progress / 100)
    }
    
    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `canvas_statistics_${props.canvasId}_${timestamp}.${exportConfig.format}`
    
    // 添加到历史记录
    addToHistory(filename, exportConfig.format, totalSize.value)
    
    exportStatus.value = 'success'
    exportMessage.value = '数据导出成功！'
    
    emit('export-complete', { filename, config: exportConfig })
    
  } catch (error) {
    exportStatus.value = 'error'
    exportMessage.value = '导出失败: ' + (error as Error).message
    
    emit('export-error', error)
  }
}

// 取消导出
const cancelExport = () => {
  exporting.value = false
  exportProgress.value = 0
  exportMessage.value = '导出已取消'
}

// 重试导出
const retryExport = () => {
  startExport()
}

// 下载文件
const downloadFile = () => {
  // 模拟文件下载
  const blob = new Blob(['模拟导出数据'], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `canvas_statistics_${Date.now()}.${exportConfig.format}`
  a.click()
  URL.revokeObjectURL(url)
}

// 预览数据
const handlePreviewData = () => {
  showPreview.value = true
  
  // 生成预览数据
  previewDataList.value = [
    {
      nodeId: 'node1',
      nodeLabel: '开始节点',
      nodeType: 'start',
      enterCount: 8500,
      exitCount: 8500,
      conversionRate: 100.0,
      avgStayTime: 2
    },
    {
      nodeId: 'node2',
      nodeLabel: '条件判断',
      nodeType: 'condition',
      enterCount: 6800,
      exitCount: 6800,
      conversionRate: 80.0,
      avgStayTime: 5
    }
  ]
  
  previewColumns.value = [
    { title: '节点ID', dataIndex: 'nodeId', width: 80 },
    { title: '节点名称', dataIndex: 'nodeLabel', width: 120 },
    { title: '节点类型', dataIndex: 'nodeType', width: 80 },
    { title: '进入人数', dataIndex: 'enterCount', width: 80 },
    { title: '离开人数', dataIndex: 'exitCount', width: 80 },
    { title: '转化率', dataIndex: 'conversionRate', width: 80 },
    { title: '平均停留', dataIndex: 'avgStayTime', width: 100 }
  ]
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
}

// 保存为模板
const saveAsTemplate = () => {
  const template = {
    name: `模板_${Date.now()}`,
    config: exportConfig,
    fieldGroups: fieldGroups,
    createdAt: new Date().toISOString()
  }
  
  // 保存模板逻辑
  console.log('保存模板:', template)
}

// 显示导出历史
const showExportHistory = () => {
  showHistory.value = !showHistory.value
}

// 显示导出设置
const showExportSettings = () => {
  // 显示设置面板
  console.log('显示导出设置')
}

// 下载历史文件
const downloadHistoryFile = (item: any) => {
  // 模拟下载历史文件
  console.log('下载历史文件:', item.filename)
}

// 切换字段组 - 已存在同名函数，移除重复定义

// 删除历史项
const deleteHistoryItem = (id: string) => {
  const index = exportHistory.value.findIndex(item => item.id === id)
  if (index > -1) {
    exportHistory.value.splice(index, 1)
  }
}

// 清空历史
const clearHistory = () => {
  exportHistory.value = []
  showHistory.value = false
}

// 添加到历史记录
const addToHistory = (filename: string, format: string, size: number) => {
  const historyItem: ExportHistoryItem = {
    id: Date.now().toString(),
    filename,
    format,
    size,
    timestamp: new Date(),
    status: 'success'
  }
  
  exportHistory.value.unshift(historyItem)
  
  // 保持最多20条历史记录
  if (exportHistory.value.length > 20) {
    exportHistory.value.splice(20)
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 监听字段选择变化
watch(() => fieldGroups.overview.selected, (newVal: any[]) => {
  fieldGroups.overview.all = newVal.length === getAllFields('overview').length
})

watch(() => fieldGroups.nodes.selected, (newVal: any[]) => {
  fieldGroups.nodes.all = newVal.length === getAllFields('nodes').length
})

watch(() => fieldGroups.users.selected, (newVal: any[]) => {
  fieldGroups.users.all = newVal.length === getAllFields('users').length
})
</script>

<style scoped lang="scss">
.data-export-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.export-config {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.custom-date-range {
  margin-top: 8px;
}

.field-selector {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #f0f0f0;
}

.field-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-group {
  .group-header {
    margin-bottom: 8px;
  }
  
  .group-fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 20px;
  }
}

.export-actions {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.export-progress {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.progress-actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.export-history {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .history-filename {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
  }
  
  .history-details {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #8c8c8c;
  }
}

.history-actions {
  display: flex;
  gap: 4px;
}

.data-preview {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 600px;
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.preview-content {
  flex: 1;
  min-height: 0;
  margin-bottom: 16px;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  
  span {
    font-size: 12px;
    color: #8c8c8c;
  }
}

:deep(.arco-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.arco-radio-group-button) {
  .arco-radio-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

:deep(.arco-table) {
  .arco-table-cell {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>