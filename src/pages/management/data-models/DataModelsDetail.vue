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
                <span class="model-name">{{ modelData.name }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="模型ID">
                <a-typography-text copyable>{{ modelData.id }}</a-typography-text>
              </a-descriptions-item>
              <a-descriptions-item label="使用场景">
                <a-tag :color="getUseCaseColor(modelData.useCase)">
                  <template #icon>
                    <icon-apps v-if="modelData.useCase === 'download'" />
                    <icon-file v-else />
                  </template>
                  {{ getUseCaseText(modelData.useCase) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="开发语言">
                <a-tag color="blue">
                  <template #icon>
                    <icon-code />
                  </template>
                  {{ modelData.language }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="负责人">
                <a-avatar :size="20" style="margin-right: 8px">
                  <icon-user />
                </a-avatar>
                {{ modelData.manager }}
              </a-descriptions-item>
              <a-descriptions-item label="当前版本">
                <a-tag color="green" @click="showVersionHistory">
                  <template #icon>
                    <icon-branch />
                  </template>
                  v{{ modelData.version }}
                </a-tag>
                <a-button type="text" size="mini" @click="showVersionHistory">
                  <template #icon>
                    <icon-history />
                  </template>
                  版本历史
                </a-button>
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                <icon-clock-circle style="margin-right: 4px; color: #86909c;" />
                {{ modelData.createdAt }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                <icon-clock-circle style="margin-right: 4px; color: #86909c;" />
                {{ modelData.updatedAt }}
              </a-descriptions-item>
              <a-descriptions-item label="代码行数">
                <a-statistic :value="getCodeLines()" suffix="行" />
              </a-descriptions-item>
              <a-descriptions-item label="参数数量">
                <a-statistic :value="modelData.parameters?.length || 0" suffix="个" />
              </a-descriptions-item>
              <a-descriptions-item label="模型描述" :span="2">
                <div class="description-content">
                  {{ modelData.description || '暂无描述' }}
                </div>
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
      :title="executionModalMode === 'test' ? '测试执行' : '执行详情'"
      width="85%"
      :footer="false"
    >
      <div class="execution-result">
        <!-- 测试参数输入区域 -->
        <div v-if="executionModalMode === 'test'" class="test-params-section">
          <a-card title="测试参数" size="small" class="params-input-card">
            <div v-if="modelData.parameters && modelData.parameters.length > 0" class="params-form">
              <a-row :gutter="16">
                <a-col 
                  v-for="param in modelData.parameters" 
                  :key="param.name"
                  :span="12"
                >
                  <a-form-item 
                    :label="param.name"
                    :required="param.required"
                  >
                    <a-input
                      v-if="param.type === 'string'"
                      v-model="testParams[param.name]"
                      :placeholder="param.defaultValue || `请输入${param.name}`"
                    />
                    <a-input-number
                      v-else-if="param.type === 'number'"
                      v-model="testParams[param.name]"
                      :placeholder="param.defaultValue || `请输入${param.name}`"
                      style="width: 100%"
                    />
                    <a-date-picker
                      v-else-if="param.type === 'date'"
                      v-model="testParams[param.name]"
                      :placeholder="param.defaultValue || `请选择${param.name}`"
                      style="width: 100%"
                    />
                    <a-switch
                      v-else-if="param.type === 'boolean'"
                      v-model="testParams[param.name]"
                    />
                    <a-input
                      v-else
                      v-model="testParams[param.name]"
                      :placeholder="param.defaultValue || `请输入${param.name}`"
                    />
                    <div class="param-description" v-if="param.description">
                      {{ param.description }}
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
              <div class="test-actions">
                <a-button 
                  type="primary" 
                  @click="executeWithParams"
                  :loading="executing"
                >
                  <template #icon>
                    <icon-play-arrow />
                  </template>
                  执行测试
                </a-button>
                <a-button @click="resetTestParams">
                  重置参数
                </a-button>
              </div>
            </div>
            <div v-else class="no-params">
              <a-empty description="该模型无需输入参数">
                <a-button 
                  type="primary" 
                  @click="executeWithParams"
                  :loading="executing"
                >
                  <template #icon>
                    <icon-play-arrow />
                  </template>
                  直接执行
                </a-button>
              </a-empty>
            </div>
          </a-card>
        </div>
        
        <!-- 执行结果区域 -->
        <div class="result-section">
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
            <a-tab-pane v-if="executionModalMode === 'test'" key="params" title="执行参数">
              <div class="params-content">
                <pre>{{ JSON.stringify(testParams, null, 2) }}</pre>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </a-modal>

    <!-- 版本历史弹窗 -->
    <a-modal
      v-model:visible="versionHistoryVisible"
      title="版本历史"
      width="70%"
      :footer="false"
    >
      <div class="version-history">
        <div class="version-actions">
          <a-button type="primary" @click="handleCreateNewVersion">
            <template #icon>
              <icon-plus />
            </template>
            创建新版本
          </a-button>
        </div>
        
        <a-table
          :columns="versionColumns"
          :data="versionHistory"
          :pagination="false"
          :loading="loadingVersions"
        >
          <template #version="{ record }">
            <a-tag :color="record.version === modelData.version ? 'green' : 'blue'">
              v{{ record.version }}
              <span v-if="record.version === modelData.version"> (当前)</span>
            </a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button 
                size="small" 
                type="text" 
                @click="viewVersionDetail(record)"
              >
                查看
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="rollbackVersion(record)"
                :disabled="record.version === modelData.version"
              >
                回滚
              </a-button>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  getDataModelDetail, 
  executeDataModel, 
  getExecutionHistory,
  copyDataModel,
  deleteDataModel,
  getVersionHistory,
  createNewVersion,
  rollbackToVersion
} from '@/api/dataModels'
import { 
  IconArrowLeft,
  IconCopy,
  IconEdit,
  IconPlayArrow,
  IconDownload,
  IconInfoCircle,
  IconArrowRight,
  IconHistory,
  IconPlus,
  IconApps,
  IconFile,
  IconCode,
  IconUser,
  IconBranch,
  IconClockCircle
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

// 响应式数据
const executing = ref(false)
const executionModalVisible = ref(false)
const executionModalMode = ref('test') // 'test' 或 'view'
const versionHistoryVisible = ref(false)
const loadingVersions = ref(false)

// 测试参数
const testParams = ref({})

// 版本历史数据
const versionHistory = ref([])

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

// 版本历史表格列配置
const versionColumns = [
  {
    title: '版本号',
    dataIndex: 'version',
    slotName: 'version',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 100
  },
  {
    title: '变更说明',
    dataIndex: 'description'
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 120
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
const handleBack = () => {
  router.back()
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
  router.push(`/management/data-models/${route.params.id}/edit`)
}

const handleExecute = async () => {
  // 初始化测试参数
  initTestParams()
  executionModalMode.value = 'test'
  executionModalVisible.value = true
  
  // 清空之前的执行结果
  Object.assign(currentExecution, {
    status: '',
    duration: 0,
    result: '',
    log: ''
  })
}

// 执行带参数的测试
const executeWithParams = async () => {
  executing.value = true
  try {
    const response = await executeDataModel(route.params.id, testParams.value)
    
    if (response.code === 200) {
      const result = {
        status: 'success',
        duration: response.data.duration,
        result: response.data.result || 'Query executed successfully.',
        log: response.data.log || '执行完成'
      }
      
      Object.assign(currentExecution, result)
      
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
      
      Message.error(response.message || '模型执行失败')
    }
  } catch (error) {
    // 🔧 修复：改进错误处理逻辑，避免Vue组件事件处理器错误
    console.error('模型执行失败:', error)
    
    const errorMessage = error && error.message ? error.message : '未知错误'
    
    const result = {
      status: 'failed',
      duration: 0,
      result: '',
      log: '执行失败：' + errorMessage
    }
    
    Object.assign(currentExecution, result)
    
    Message.error('执行失败，请重试')
  } finally {
    executing.value = false
  }
}

// 初始化测试参数
const initTestParams = () => {
  const params = {}
  if (modelData.parameters && modelData.parameters.length > 0) {
    modelData.parameters.forEach(param => {
      params[param.name] = param.defaultValue || ''
    })
  }
  testParams.value = params
}

// 重置测试参数
const resetTestParams = () => {
  initTestParams()
  Message.success('参数已重置')
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
  executionModalMode.value = 'view'
  executionModalVisible.value = true
}

const viewAllExecutions = () => {
  Message.info('查看全部执行记录功能开发中')
}

// 版本历史相关函数
const showVersionHistory = async () => {
  versionHistoryVisible.value = true
  await loadVersionHistory()
}

const loadVersionHistory = async () => {
  loadingVersions.value = true
  try {
    const response = await getVersionHistory(route.params.id)
    if (response.code === 200) {
      versionHistory.value = response.data || []
    } else {
      Message.error(response.message || '加载版本历史失败')
    }
  } catch (error) {
    console.error('加载版本历史失败:', error)
    Message.error('加载版本历史失败')
  } finally {
    loadingVersions.value = false
  }
}

const handleCreateNewVersion = async () => {
  Modal.confirm({
    title: '创建新版本',
    content: '确定要基于当前版本创建新版本吗？',
    onOk: async () => {
      try {
        const response = await createNewVersion(route.params.id, {
          description: '基于v' + modelData.version + '创建的新版本'
        })
        if (response.code === 200) {
          Message.success('新版本创建成功')
          await loadVersionHistory()
          await loadModelData() // 重新加载模型数据以获取最新版本号
        } else {
          Message.error(response.message || '创建新版本失败')
        }
      } catch (error) {
        console.error('创建新版本失败:', error)
        Message.error('创建新版本失败')
      }
    }
  })
}

const rollbackVersion = async (record) => {
  Modal.confirm({
    title: '版本回滚',
    content: `确定要回滚到版本 v${record.version} 吗？此操作将创建一个新版本。`,
    onOk: async () => {
      try {
        const response = await rollbackToVersion(route.params.id, record.version)
        if (response.code === 200) {
          Message.success('版本回滚成功')
          await loadVersionHistory()
          await loadModelData() // 重新加载模型数据
        } else {
          Message.error(response.message || '版本回滚失败')
        }
      } catch (error) {
        console.error('版本回滚失败:', error)
        Message.error('版本回滚失败')
      }
    }
  })
}

const viewVersionDetail = (record) => {
  Message.info(`查看版本 v${record.version} 详情功能开发中`)
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
      router.back()
    }
  } catch (error) {
    console.error('加载模型数据失败:', error)
    Message.error('加载模型数据失败')
    router.back()
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

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理可能的定时器
  if (window.executionTimer) {
    clearInterval(window.executionTimer)
    window.executionTimer = null
  }
  
  // 清理可能的事件监听器
  if (window.removeEventListeners) {
    window.removeEventListeners()
  }
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

.model-name {
  font-weight: 600;
  font-size: 16px;
  color: #1d2129;
}

.description-content {
  padding: 8px 12px;
  background-color: #f7f8fa;
  border-radius: 4px;
  border-left: 3px solid #165dff;
  font-style: italic;
  color: #4e5969;
  line-height: 1.5;
}

.arco-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.arco-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.arco-descriptions-item-label {
  font-weight: 500;
  color: #4e5969;
}

.arco-statistic-content {
  font-weight: 600;
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

/* 执行弹窗样式 */
.execution-result {
  max-height: 70vh;
  overflow-y: auto;
}

.test-params-section {
  margin-bottom: 20px;
}

.params-input-card {
  border: 1px solid #e5e6eb;
}

.params-form {
  padding: 16px 0;
}

.param-description {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  line-height: 1.4;
}

.test-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.no-params {
  padding: 20px;
  text-align: center;
}

.result-section {
  border-top: 1px solid #e5e6eb;
  padding-top: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.result-time {
  color: #86909c;
  font-size: 14px;
}

.result-content,
.log-content,
.params-content {
  background-color: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.result-content pre,
.log-content pre,
.params-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #1d2129;
  white-space: pre-wrap;
  word-wrap: break-word;
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