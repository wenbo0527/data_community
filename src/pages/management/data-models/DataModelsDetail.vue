<template>
  <div class="data-models-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回
        </a-button>
        <div class="title-section">
          <h2 class="page-title">{{ modelData.name }}</h2>
          <a-tag
            :color="getStatusColor(modelData.status)"
            class="status-tag"
          >
            {{ getStatusText(modelData.status) }}
          </a-tag>
        </div>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleCopy">
            <template #icon>
              <icon-copy />
            </template>
            复制
          </a-button>
          <a-button @click="handleEdit">
            <template #icon>
              <icon-edit />
            </template>
            编辑
          </a-button>
          <a-button type="primary" @click="handleExecute" :loading="executing">
            <template #icon>
              <icon-play-arrow />
            </template>
            执行
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="detail-content">
      <a-row :gutter="24">
        <!-- 左侧：模型信息 -->
        <a-col :span="16">
          <!-- 基本信息 -->
          <a-card title="基本信息" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="模型名称">
                {{ modelData.name }}
              </a-descriptions-item>
              <a-descriptions-item label="使用场景">
                <a-tag :color="getUseCaseColor(modelData.useCase)">
                  {{ getUseCaseText(modelData.useCase) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="语言类型">
                <a-tag :color="modelData.language === 'sql' ? 'orange' : 'purple'">
                  {{ modelData.language?.toUpperCase() }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="管理人">
                {{ modelData.manager }}
              </a-descriptions-item>
              <a-descriptions-item label="版本">
                v{{ modelData.version }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                {{ modelData.updatedAt }}
              </a-descriptions-item>
              <a-descriptions-item label="模型描述" :span="2">
                {{ modelData.description || '暂无描述' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 代码内容 -->
          <a-card title="代码内容" class="code-card">
            <div class="code-header">
              <a-space>
                <a-tag :color="modelData.language === 'sql' ? 'orange' : 'purple'">
                  {{ modelData.language?.toUpperCase() }}
                </a-tag>
                <span class="code-lines">{{ getCodeLines() }} 行</span>
              </a-space>
              <a-space>
                <a-button size="small" @click="handleCopyCode">
                  <template #icon>
                    <icon-copy />
                  </template>
                  复制代码
                </a-button>
                <a-button size="small" @click="handleDownloadCode">
                  <template #icon>
                    <icon-download />
                  </template>
                  下载
                </a-button>
              </a-space>
            </div>
            
            <!-- 代码展示区域 -->
            <div class="code-display">
              <pre class="code-content"><code>{{ modelData.code }}</code></pre>
            </div>
          </a-card>

          <!-- 参数配置 -->
          <a-card title="参数配置" class="params-card" v-if="modelData.parameters?.length">
            <a-table
              :columns="paramColumns"
              :data="modelData.parameters"
              :pagination="false"
              size="small"
            >
              <template #type="{ record }">
                <a-tag size="small">{{ getParamTypeText(record.type) }}</a-tag>
              </template>
            </a-table>
          </a-card>
          <a-card title="参数配置" class="params-card" v-else>
            <a-empty description="暂无参数配置" />
          </a-card>
        </a-col>

        <!-- 右侧：执行历史和统计 -->
        <a-col :span="8">
          <!-- 执行统计 -->
          <a-card title="执行统计" class="stats-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ executionStats.total }}</div>
                <div class="stat-label">总执行次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value success">{{ executionStats.success }}</div>
                <div class="stat-label">成功次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value error">{{ executionStats.failed }}</div>
                <div class="stat-label">失败次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ executionStats.avgDuration }}ms</div>
                <div class="stat-label">平均耗时</div>
              </div>
            </div>
          </a-card>

          <!-- 最近执行 -->
          <a-card title="最近执行" class="history-card">
            <div class="execution-list">
              <div
                v-for="execution in recentExecutions"
                :key="execution.id"
                class="execution-item"
              >
                <div class="execution-header">
                  <a-tag
                    :color="getExecutionStatusColor(execution.status)"
                    size="small"
                  >
                    {{ getExecutionStatusText(execution.status) }}
                  </a-tag>
                  <span class="execution-time">{{ execution.createdAt }}</span>
                </div>
                <div class="execution-info">
                  <div class="execution-duration">
                    耗时: {{ execution.duration }}ms
                  </div>
                  <div class="execution-user">
                    执行人: {{ execution.executor }}
                  </div>
                </div>
                <div class="execution-actions">
                  <a-button
                    size="mini"
                    type="text"
                    @click="viewExecutionDetail(execution)"
                  >
                    查看详情
                  </a-button>
                </div>
              </div>
              
              <div v-if="recentExecutions.length === 0" class="empty-executions">
                <icon-info-circle />
                <span>暂无执行记录</span>
              </div>
            </div>
            
            <div class="history-footer">
              <a-button type="text" @click="viewAllExecutions">
                查看全部执行记录
                <template #icon>
                  <icon-arrow-right />
                </template>
              </a-button>
            </div>
          </a-card>

          <!-- 执行配置 -->
          <a-card title="执行配置" class="config-card">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="超时时间">
                {{ modelData.timeout || 300 }}秒
              </a-descriptions-item>
              <a-descriptions-item label="最大内存">
                {{ modelData.maxMemory || 1024 }}MB
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ modelData.createdAt }}
              </a-descriptions-item>
              <a-descriptions-item label="创建人">
                {{ modelData.creator }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 执行结果弹窗 -->
    <a-modal
      v-model:visible="executionModalVisible"
      title="执行结果"
      width="80%"
      :footer="false"
    >
      <div class="execution-result">
        <div class="result-header">
          <a-tag
            :color="getExecutionStatusColor(currentExecution.status)"
          >
            {{ getExecutionStatusText(currentExecution.status) }}
          </a-tag>
          <span class="result-time">执行时间: {{ currentExecution.duration }}ms</span>
        </div>
        
        <a-tabs default-active-key="result">
          <a-tab-pane key="result" title="执行结果">
            <div class="result-content">
              <pre>{{ currentExecution.result }}</pre>
            </div>
          </a-tab-pane>
          <a-tab-pane key="log" title="执行日志">
            <div class="log-content">
              <pre>{{ currentExecution.log }}</pre>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  getDataModelDetail, 
  executeDataModel, 
  getExecutionHistory,
  copyDataModel,
  deleteDataModel 
} from '@/api/dataModels'
import {
  IconArrowLeft,
  IconCopy,
  IconEdit,
  IconPlayArrow,
  IconDownload,
  IconInfoCircle,
  IconArrowRight
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

// 响应式数据
const executing = ref(false)
const executionModalVisible = ref(false)

// 模型数据
const modelData = reactive({
  id: '',
  name: '',
  description: '',
  useCase: '',
  language: '',
  manager: '',
  code: '',
  status: '',
  version: '',
  updatedAt: '',
  createdAt: '',
  creator: '',
  timeout: 300,
  maxMemory: 1024,
  parameters: []
})

// 执行统计
const executionStats = reactive({
  total: 0,
  success: 0,
  failed: 0,
  avgDuration: 0
})

// 最近执行记录
const recentExecutions = ref([])

// 当前执行结果
const currentExecution = reactive({
  status: '',
  duration: 0,
  result: '',
  log: ''
})

// 参数表格列配置
const paramColumns = [
  {
    title: '参数名',
    dataIndex: 'name',
    width: 120
  },
  {
    title: '类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 80
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue'
  }
]

// 计算属性
const getCodeLines = () => {
  return modelData.code ? modelData.code.split('\n').length : 0
}

// 工具函数
const getStatusColor = (status) => {
  const colors = {
    draft: 'gray',
    published: 'green',
    archived: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return texts[status] || '未知'
}

const getUseCaseColor = (useCase) => {
  return useCase === 'download' ? 'blue' : 'cyan'
}

const getUseCaseText = (useCase) => {
  const texts = {
    download: '明细数据下载',
    report: '分析报告模板'
  }
  return texts[useCase] || '未知'
}

const getParamTypeText = (type) => {
  const texts = {
    string: '字符串',
    number: '数字',
    date: '日期',
    boolean: '布尔值'
  }
  return texts[type] || type
}

const getExecutionStatusColor = (status) => {
  const colors = {
    success: 'green',
    failed: 'red',
    running: 'blue'
  }
  return colors[status] || 'gray'
}

const getExecutionStatusText = (status) => {
  const texts = {
    success: '成功',
    failed: '失败',
    running: '运行中'
  }
  return texts[status] || '未知'
}

// 事件处理函数
import { goBack } from '@/router/utils'
const handleBack = () => {
  goBack(router, '/management/data-models')
}

const handleCopy = async () => {
  try {
    const response = await copyDataModel(route.params.id)
    
    if (response.code === 200) {
      Message.success('模型复制成功')
      router.push('/management/data-models')
    } else {
      Message.error(response.message || '复制失败')
    }
  } catch (error) {
    console.error('复制模型失败:', error)
    Message.error('复制失败')
  }
}

const handleEdit = () => {
  router.push(`/management/data-models/edit/${route.params.id}`)
}

const handleExecute = async () => {
  executing.value = true
  try {
    const response = await executeDataModel(route.params.id, {})
    
    if (response.code === 200) {
      const result = {
        status: 'success',
        duration: response.data.duration,
        result: response.data.result || 'Query executed successfully.',
        log: response.data.log || '执行完成'
      }
      
      Object.assign(currentExecution, result)
      executionModalVisible.value = true
      
      // 重新加载执行历史
      await loadExecutionHistory()
      
      Message.success('模型执行完成')
    } else {
      const result = {
        status: 'failed',
        duration: 0,
        result: '',
        log: response.message || '执行失败'
      }
      
      Object.assign(currentExecution, result)
      executionModalVisible.value = true
      
      Message.error(response.message || '模型执行失败')
    }
  } catch (error) {
    console.error('模型执行失败:', error)
    
    const result = {
      status: 'failed',
      duration: 0,
      result: '',
      log: '执行失败：' + error.message
    }
    
    Object.assign(currentExecution, result)
    executionModalVisible.value = true
    
    Message.error('执行失败，请重试')
  } finally {
    executing.value = false
  }
}

const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(modelData.code)
    Message.success('代码已复制到剪贴板')
  } catch (error) {
    Message.error('复制失败')
  }
}

const handleDownloadCode = () => {
  const blob = new Blob([modelData.code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${modelData.name}.${modelData.language}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  Message.success('代码下载成功')
}

const viewExecutionDetail = (execution) => {
  Object.assign(currentExecution, {
    ...execution,
    result: '模拟执行结果数据...',
    log: '模拟执行日志...'
  })
  executionModalVisible.value = true
}

const viewAllExecutions = () => {
  Message.info('查看全部执行记录功能开发中')
}

// 加载模型数据
const loadModelData = async () => {
  try {
    const response = await getDataModelDetail(route.params.id)
    
    if (response.code === 200) {
      Object.assign(modelData, response.data)
      
      // 加载执行统计和历史记录
      await loadExecutionHistory()
    } else {
      Message.error(response.message || '加载模型数据失败')
      goBack(router, '/management/data-models')
    }
  } catch (error) {
    console.error('加载模型数据失败:', error)
    Message.error('加载模型数据失败')
    goBack(router, '/management/data-models')
  }
}

// 加载执行历史
const loadExecutionHistory = async () => {
  try {
    const response = await getExecutionHistory(route.params.id, {
      page: 1,
      pageSize: 10
    })
    
    if (response.code === 200) {
      recentExecutions.value = response.data.list || []
      Object.assign(executionStats, response.data.stats || {})
    } else {
      console.error('加载执行历史失败:', response.message)
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadModelData()
})
</script>

<style scoped>
.data-models-detail {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.status-tag {
  font-size: 12px;
}

.detail-content {
  max-width: 1400px;
}

.info-card,
.code-card,
.params-card,
.stats-card,
.history-card,
.config-card {
  margin-bottom: 24px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.code-lines {
  color: #86909c;
  font-size: 14px;
}

.code-display {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.code-content {
  margin: 0;
  padding: 16px;
  background-color: #f7f8fa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.stat-value.success {
  color: #00b42a;
}

.stat-value.error {
  color: #f53f3f;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.execution-list {
  /* 移除内部滚动，使用页面级滚动 */
}

.execution-item {
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #fff;
}

.execution-item:last-child {
  margin-bottom: 0;
}

.execution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.execution-time {
  font-size: 12px;
  color: #86909c;
}

.execution-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.execution-actions {
  text-align: right;
}

.empty-executions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86909c;
  font-size: 14px;
}

.empty-executions .arco-icon {
  margin-right: 8px;
  font-size: 16px;
}

.history-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.execution-result {
  padding: 16px 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.result-time {
  font-size: 14px;
  color: #86909c;
}

.result-content,
.log-content {
  background-color: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  /* 移除内部滚动，使用页面级滚动 */
}

.result-content pre,
.log-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .detail-content .arco-col:first-child {
    span: 24;
    margin-bottom: 24px;
  }
  
  .detail-content .arco-col:last-child {
    span: 24;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left {
    margin-bottom: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .execution-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
