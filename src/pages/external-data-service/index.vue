<template>
  <div class="external-data-service">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>外部数据服务</h1>
          <p class="page-description">管理外部数据服务的申请、执行、结果展示和陪跑服务</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-dropdown @select="handleQuickAction">
              <a-button type="primary">
                <template #icon><IconPlus /></template>
                快速操作
              </a-button>
              <template #content>
                <a-doption value="create-application">新建申请</a-doption>
                <a-doption value="batch-apply">批量申请</a-doption>
                <a-doption value="service-monitoring">服务监控</a-doption>
                <a-doption value="performance-analysis">性能分析</a-doption>
              </template>
            </a-dropdown>
            <a-button type="outline" @click="handleBatchApply">
              <template #icon><IconUpload /></template>
              批量申请
            </a-button>
            <a-button type="outline" @click="handleExport">
              <template #icon><IconDownload /></template>
              导出数据
            </a-button>
            <a-button type="outline" @click="handleRefresh">
              <template #icon><IconRefresh /></template>
              刷新数据
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <a-alert 
        :type="error.type || 'error'" 
        :title="error.title || '错误'" 
        :description="error.message" 
        closable 
        @close="error = null"
        show-icon
      >
        <template #icon>
          <IconExclamationCircleFill />
        </template>
        <template #action v-if="error.action">
          <a-button type="primary" size="mini" @click="handleErrorAction(error.action)">
            {{ error.actionText || '重试' }}
          </a-button>
        </template>
      </a-alert>
    </div>
    
    <!-- 数据一致性警告 -->
    <div v-if="consistencyWarnings.length > 0" class="consistency-warning">
      <a-alert title="数据一致性警告" type="warning" closable @close="consistencyWarnings = []">
        <div v-for="(item, index) in consistencyWarnings" :key="index" class="consistency-item">
          {{ item.message }}
        </div>
      </a-alert>
    </div>
    
    <!-- 加载骨架 -->
    <div v-if="loading" class="loading-skeleton">
      <a-skeleton :animation="true">
        <a-space direction="vertical" :style="{width: '100%'}" size="large">
          <a-skeleton-line :rows="2" :widths="['40%', '60%']" />
          <a-skeleton-shape shape="circle" size="large" />
          <a-skeleton-line :rows="4" />
        </a-space>
      </a-skeleton>
    </div>
    
    <!-- 空态处理 -->
    <div v-if="!loading && !services.length" class="empty-state">
      <div class="empty-icon-wrapper">
        <IconCloud class="empty-icon" />
      </div>
      <div class="empty-title">暂无服务数据</div>
      <div class="empty-description">您可以通过以下方式创建服务申请</div>
      <div class="empty-actions">
        <a-space>
          <a-button type="primary" @click="showServiceModal = true">
            <template #icon><IconPlus /></template>
            新建申请
          </a-button>
          <a-button type="outline" @click="showBatchModal = true">
            <template #icon><IconUpload /></template>
            批量申请
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 服务统计 -->
    <a-row :gutter="16" class="service-stats" v-if="!loading && services.length">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconFile />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalApplications }}</div>
              <div class="stat-label">申请总数</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheck />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedTasks }}</div>
              <div class="stat-label">已完成任务</div>
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
              <div class="stat-value">{{ stats.pendingTasks }}</div>
              <div class="stat-label">进行中任务</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconExclamationCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failedTasks }}</div>
              <div class="stat-label">失败任务</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 外部数据服务标签页 -->
    <a-card class="service-tabs" v-if="!loading && services.length">
      <a-tabs v-model:active-key="activeTab" type="rounded">
        <a-tab-pane key="application" title="服务申请">
          <service-application />
        </a-tab-pane>
        <a-tab-pane key="task" title="任务查询">
          <task-query />
        </a-tab-pane>
        <a-tab-pane key="result" title="结果展示">
          <result-display />
        </a-tab-pane>
        <a-tab-pane key="accompany" title="陪跑服务">
          <accompany-service />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新建申请弹窗 -->
    <a-modal
      v-model:visible="showServiceModal"
      title="新建数据服务申请"
      width="800px"
      @ok="handleServiceSubmit"
      @cancel="handleServiceCancel"
    >
      <a-form :model="serviceForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="serviceType" label="服务类型" required>
              <a-select v-model="serviceForm.serviceType" placeholder="请选择服务类型">
                <a-option value="data-query">数据查询</a-option>
                <a-option value="batch-processing">批量处理</a-option>
                <a-option value="real-time-monitoring">实时监控</a-option>
                <a-option value="data-analysis">数据分析</a-option>
                <a-option value="api-service">API服务</a-option>
                <a-option value="report-generation">报表生成</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="dataProduct" label="数据产品" required>
              <a-select v-model="serviceForm.dataProduct" placeholder="请选择数据产品">
                <a-option value="product1">数据产品A</a-option>
                <a-option value="product2">数据产品B</a-option>
                <a-option value="product3">数据产品C</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="priority" label="优先级" required>
              <a-radio-group v-model="serviceForm.priority">
                <a-radio value="high">高</a-radio>
                <a-radio value="medium">中</a-radio>
                <a-radio value="low">低</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="expectedTime" label="期望完成时间" required>
              <a-date-picker 
                v-model="serviceForm.expectedTime" 
                style="width: 100%"
                placeholder="请选择期望完成时间"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="服务描述" required>
          <a-textarea
            v-model="serviceForm.description"
            placeholder="请详细描述您的数据服务需求"
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item field="parameters" label="输入参数">
          <a-textarea
            v-model="serviceForm.parameters"
            placeholder="请输入相关参数（如查询条件、过滤条件等）"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="outputFormat" label="输出格式" required>
          <a-radio-group v-model="serviceForm.outputFormat">
            <a-radio value="json">JSON</a-radio>
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="excel">Excel</a-radio>
            <a-radio value="pdf">PDF</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item field="remarks" label="备注说明">
          <a-textarea
            v-model="serviceForm.remarks"
            placeholder="请输入其他备注说明"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 服务监控弹窗 -->
    <a-modal
      v-model:visible="showMonitorModal"
      title="服务监控详情"
      width="900px"
      @ok="handleMonitorClose"
      @cancel="handleMonitorClose"
    >
      <a-tabs type="rounded">
        <a-tab-pane key="performance" title="性能监控">
          <div class="monitor-content">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-card title="响应时间" class="monitor-card">
                  <div class="monitor-stat">
                    <div class="stat-value">{{ monitorData.avgResponseTime }}ms</div>
                    <div class="stat-trend" :class="{ 'up': monitorData.responseTrend > 0, 'down': monitorData.responseTrend < 0 }">
                      <IconArrowRise v-if="monitorData.responseTrend > 0" />
                      <IconArrowFall v-else />
                      {{ Math.abs(monitorData.responseTrend) }}%
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="成功率" class="monitor-card">
                  <div class="monitor-stat">
                    <div class="stat-value">{{ monitorData.successRate }}%</div>
                    <div class="stat-trend" :class="{ 'up': monitorData.successTrend > 0, 'down': monitorData.successTrend < 0 }">
                      <IconArrowRise v-if="monitorData.successTrend > 0" />
                      <IconArrowFall v-else />
                      {{ Math.abs(monitorData.successTrend) }}%
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="调用量" class="monitor-card">
                  <div class="monitor-stat">
                    <div class="stat-value">{{ monitorData.callCount }}</div>
                    <div class="stat-trend" :class="{ 'up': monitorData.callTrend > 0, 'down': monitorData.callTrend < 0 }">
                      <IconArrowRise v-if="monitorData.callTrend > 0" />
                      <IconArrowFall v-else />
                      {{ Math.abs(monitorData.callTrend) }}%
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
            
            <a-card title="服务调用趋势" class="trend-card">
              <div class="trend-chart">
                <div v-for="(point, index) in monitorData.trendData" :key="index" class="chart-point">
                  <div class="point-value">{{ point.value }}</div>
                  <div class="point-time">{{ point.time }}</div>
                </div>
              </div>
            </a-card>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="alerts" title="告警信息">
          <div class="alerts-content">
            <a-table
              :columns="alertColumns"
              :data="monitorData.alerts"
              :pagination="{ pageSize: 5 }"
              size="small"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="logs" title="调用日志">
          <div class="logs-content">
            <a-table
              :columns="logColumns"
              :data="monitorData.logs"
              :pagination="{ pageSize: 5 }"
              size="small"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    
    <!-- 批量申请弹窗 -->
    <a-modal
      v-model:visible="showBatchModal"
      title="批量数据服务申请"
      width="600px"
      @ok="handleBatchSubmit"
      @cancel="handleBatchCancel"
    >
      <a-form :model="batchForm" layout="vertical">
        <a-form-item label="上传申请文件" required>
          <a-upload
            :file-list="batchFileList"
            :limit="1"
            @change="handleBatchFileChange"
            accept=".xlsx,.xls,.csv"
          >
            <template #upload-button>
              <a-button type="outline">
                <template #icon><icon-upload /></template>
                选择文件
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
        <a-form-item label="模板下载">
          <a-button type="text" @click="downloadBatchTemplate">
            <template #icon><icon-download /></template>
            下载批量申请模板
          </a-button>
        </a-form-item>
        <a-form-item field="batchDescription" label="批量申请说明">
          <a-textarea
            v-model="batchForm.description"
            placeholder="请描述批量申请的具体需求"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconUpload,
  IconDownload,
  IconFile,
  IconCheck,
  IconClockCircle,
  IconExclamationCircle,
  IconRefresh,
  IconCloud,
  IconArrowRise,
  IconArrowFall
} from '@arco-design/web-vue/es/icon'

// 引入服务子组件
import ServiceApplication from './components/ServiceApplication.vue'
import TaskQuery from './components/TaskQuery.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import AccompanyService from './components/AccompanyService.vue'

// 引入统一Mock数据
import { getMockData, getStatistics } from '@/mock/index.js'
import { useExternalDataStore } from '@/stores/external-data.js'
import { ROUTE_PATHS } from '@/router/constants.ts'

// 统计数据
const stats = reactive({
  totalApplications: 0,
  completedTasks: 0,
  pendingTasks: 0,
  failedTasks: 0
})

// 使用统一状态管理
const externalDataStore = useExternalDataStore()
const loading = ref(false)
const error = ref(null)
const consistencyWarnings = ref([])

// 错误处理函数
const handleErrorAction = (action) => {
  switch (action) {
    case 'refresh':
      handleRefresh()
      break
    case 'retry':
      loadServices()
      break
    case 'navigate':
      if (error.value?.route) {
        // 假设存在路由跳转函数，这里用注释占位
        // navigateTo(error.value.route)
      }
      break
    default:
      error.value = null
  }
}

// 当前标签页
const activeTab = ref('application')

// 弹窗状态
const showServiceModal = ref(false)
const showBatchModal = ref(false)
const showMonitorModal = ref(false)

// 安全的服务数据别名，避免模板直接读取未定义的 length
const services = computed(() => externalDataStore?.services?.value || [])

// 服务申请表单
const serviceForm = reactive({
  serviceType: '',
  dataProduct: '',
  priority: 'medium',
  expectedTime: '',
  description: '',
  parameters: '',
  outputFormat: 'json',
  remarks: ''
})

// 批量申请表单
const batchForm = reactive({
  description: ''
})
const batchFileList = ref([])

// 监控数据与表格列定义（提供默认值避免渲染期未定义）
const monitorData = reactive({
  avgResponseTime: 200,
  responseTrend: -5,
  successRate: 99.8,
  successTrend: 2,
  callCount: 1200,
  callTrend: -3,
  trendData: [
    { time: '10:00', value: 20 },
    { time: '10:10', value: 35 },
    { time: '10:20', value: 30 },
    { time: '10:30', value: 42 },
    { time: '10:40', value: 38 }
  ],
  alerts: [
    { time: '2024-01-15 10:32:00', level: 'high', type: 'timeout', message: '接口响应超时' },
    { time: '2024-01-15 10:40:00', level: 'medium', type: 'error', message: '数据解析失败' }
  ],
  logs: [
    { time: '2024-01-15 10:30:05', level: 'info', message: '开始调用API001', duration: 150, responseCode: 200 },
    { time: '2024-01-15 10:32:11', level: 'warn', message: '响应时间偏长', duration: 800, responseCode: 200 },
    { time: '2024-01-15 10:40:22', level: 'error', message: '调用失败，解析错误', duration: 120, responseCode: 500 }
  ]
})

const alertColumns = [
  { title: '时间', dataIndex: 'time' },
  { title: '级别', dataIndex: 'level' },
  { title: '类型', dataIndex: 'type' },
  { title: '描述', dataIndex: 'message' }
]

const logColumns = [
  { title: '时间', dataIndex: 'time' },
  { title: '级别', dataIndex: 'level' },
  { title: '消息', dataIndex: 'message' },
  { title: '耗时(ms)', dataIndex: 'duration' },
  { title: '响应码', dataIndex: 'responseCode' }
]

// 监控弹窗关闭处理，避免模板中调用未定义方法
const handleMonitorClose = () => {
  showMonitorModal.value = false
  Message.info('已关闭服务监控')
}

// 提交服务申请
const handleServiceSubmit = async () => {
  try {
    // 表单验证
    if (!serviceForm.serviceType || !serviceForm.dataProduct || !serviceForm.description) {
      Message.warning('请填写必填字段：服务类型、数据产品和服务描述')
      return
    }
    
    loading.value = true
    error.value = null
    
    // 使用状态管理创建服务申请
    const serviceData = {
      serviceType: serviceForm.serviceType,
      dataProduct: serviceForm.dataProduct,
      priority: serviceForm.priority,
      expectedTime: serviceForm.expectedTime,
      description: serviceForm.description,
      parameters: serviceForm.parameters,
      outputFormat: serviceForm.outputFormat,
      remarks: serviceForm.remarks,
      createTime: new Date().toISOString()
    }
    
    await externalDataStore.createServiceApplication(serviceData)
    
    // 显示成功提示
    Message.success({
      content: '服务申请提交成功！',
      duration: 3000,
      closable: true
    })
    
    showServiceModal.value = false
    
    // 更新统计
    stats.totalApplications++
    
    // 重置表单
    Object.assign(serviceForm, {
      serviceType: '',
      dataProduct: '',
      priority: 'medium',
      expectedTime: '',
      description: '',
      parameters: '',
      outputFormat: 'json',
      remarks: ''
    })
    
  } catch (err) {
    console.error('创建服务申请失败:', err)
    error.value = err.message
    Message.error({
      content: '服务申请提交失败：' + (err.message || '未知错误'),
      duration: 3000,
      closable: true
    })
  } finally {
    loading.value = false
  }
}

const handleServiceCancel = () => {
  showServiceModal.value = false
}

// 批量申请处理
const handleBatchFileChange = (fileList) => {
  batchFileList.value = fileList
}

const handleBatchSubmit = () => {
  if (batchFileList.value.length === 0) {
    Message.error('请先上传批量申请文件')
    return
  }
  Message.success('批量申请提交成功')
  showBatchModal.value = false
}

const handleBatchCancel = () => {
  showBatchModal.value = false
  batchFileList.value = []
}

const downloadBatchTemplate = () => {
  Message.success('批量申请模板下载成功')
}

const exportData = () => {
  Message.success('数据导出成功')
}

// 页面导出（与按钮保持一致的方法名）
const handleExport = () => {
  try {
    const list = Array.isArray(externalDataStore?.services?.value) ? externalDataStore.services.value : []
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'external-data-services.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    Message.success('服务数据导出成功')
  } catch (e) {
    console.warn('导出失败，退回提示:', e)
    Message.error('导出失败：' + (e?.message || '未知错误'))
  }
}

// 批量申请
const handleBatchApply = () => {
  showBatchModal.value = true
}

// 数据刷新（统一强制同步+统计与一致性检查）
// 保留单一定义，避免重复声明导致编译错误

// 加载统计数据
const loadStats = async () => {
  try {
    // 统一使用仓库统计接口
    await externalDataStore.fetchStatistics('externalDataService')
    const data = externalDataStore.statistics.value?.externalDataService || {}
    stats.totalApplications = data.totalApplications || 0
    stats.completedTasks = data.completedTasks || 0
    stats.pendingTasks = data.pendingTasks || 0
    stats.failedTasks = data.failedTasks || 0
  } catch (err) {
    console.error('加载统计数据失败:', err)
    // 使用模拟数据
    const mockStats = getStatistics('externalDataService')
    Object.assign(stats, mockStats)
  }
}

// 加载服务数据
const loadServices = async () => {
  try {
    loading.value = true
    error.value = null
    await externalDataStore.fetchServiceApplications()
    
    // 显示加载成功提示
    if ((services.value || []).length > 0) {
      Message.success({
        content: '服务数据加载成功！',
        duration: 1500,
        closable: true
      })
    }
  } catch (err) {
    console.error('加载服务数据失败:', err)
    error.value = {
      type: 'error',
      title: '服务数据加载失败',
      message: err.message || '无法加载服务数据，请检查网络连接或稍后重试',
      action: 'retry',
      actionText: '重新加载'
    }
    Message.error('加载服务数据失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 使用统一状态管理的强制同步功能
    await externalDataStore.forceSyncAllData()
    
    // 重新加载服务数据
    await loadServices()
    
    // 更新统计
    await loadStats()

    // 一致性检查
    const consistencyCheck = externalDataStore.checkDataConsistency()
    consistencyWarnings.value = consistencyCheck
    
    Message.success({
      content: '数据刷新成功！',
      duration: 2000,
      closable: true
    })
  } catch (err) {
    loading.value = false
    error.value = {
      type: 'error',
      title: '刷新失败',
      message: err.message || '数据刷新失败，请稍后重试',
      action: 'refresh',
      actionText: '重新刷新'
    }
    console.error('数据刷新失败:', err)
  } finally {
    loading.value = false
  }
}

// 快速操作处理
const handleQuickAction = (value) => {
  switch (value) {
    case 'create-application':
      showServiceModal.value = true
      break
    case 'batch-apply':
      handleBatchApply()
      break
    case 'service-monitoring':
      showMonitorModal.value = true
      break
    case 'performance-analysis':
      Message.info('性能分析功能开发中...')
      break
    default:
      break
  }
}

// 检查数据一致性
const checkDataConsistency = () => {
  try {
    const warnings = []
    
    // 检查服务数据一致性
    const list = Array.isArray(externalDataStore?.services?.value) ? externalDataStore.services.value : []
    if (list.length > 0) {
      const failedServices = list.filter(s => s && s.status === 'failed')
      const pendingServices = list.filter(s => s && s.status === 'pending')
      
      if (failedServices.length > list.length * 0.1) {
        warnings.push({
          message: `失败服务占比过高(${((failedServices.length / list.length) * 100).toFixed(1)}%)，建议检查`
        })
      }
      
      if (pendingServices.length > list.length * 0.3) {
        warnings.push({
          message: `待处理服务过多(${pendingServices.length}个)，可能影响响应时间`
        })
      }
    }
    
    // 检查统计数据一致性
    if (stats.totalApplications > 0) {
      const totalFromStats = stats.totalApplications
      const totalFromData = list.length
      
      if (Math.abs(totalFromStats - totalFromData) > 5) {
        warnings.push({
          message: '统计数据与实际数据存在较大差异，建议刷新'
        })
      }
    }
    
    consistencyWarnings.value = warnings
  } catch (err) {
    console.warn('数据一致性检查失败:', err)
  }
}

// 初始化加载统计数据
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // 优先使用统一状态管理中的数据
    if ((services.value || []).length > 0) {
      // 数据已存在，直接使用
    } else {
      // 加载服务数据
      await loadServices()
    }
    
    // 加载统计数据
    await loadStats()
    
    // 检查数据一致性
    checkDataConsistency()
    if (consistencyWarnings.value.length > 0) {
      console.warn('服务管理模块数据一致性检查发现问题:', consistencyWarnings.value)
      Message.warning('检测到数据不一致，建议刷新数据')
    }
  } catch (err) {
    console.error('初始化失败:', err)
    error.value = err.message || '系统错误，请稍后重试'
    Message.error({
      content: '初始化失败: ' + (err.message || '系统错误，请稍后重试'),
      duration: 5000,
      closable: true
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.external-data-service {
  padding: 24px;
  background-color: var(--color-bg-1);
  min-height: 100vh;
}

.loading-skeleton {
  padding: 48px 24px;
  text-align: center;
  
  :deep(.arco-skeleton) {
    max-width: 600px;
    margin: 0 auto;
  }
}

.empty-state {
  padding: 64px 24px;
  text-align: center;
  
  .empty-icon-wrapper {
    margin-bottom: 16px;
    
    .empty-icon {
      font-size: 64px;
      color: var(--color-neutral-6);
      opacity: 0.5;
    }
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
    color: var(--color-text-3);
    margin-bottom: 24px;
  }
  
  .empty-actions {
    .arco-btn {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.error-message {
  margin-bottom: 16px;
}

.consistency-warning {
  margin-bottom: 16px;
}

.consistency-item {
  margin: 4px 0;
  font-size: 14px;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-text {
  color: var(--color-text-3);
  font-size: 14px;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.85);
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .header-info {
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .page-description {
        margin: 0;
        color: var(--color-text-3);
        font-size: 14px;
      }
    }
  }
}

.service-stats {
  margin-bottom: 24px;
  
  .stat-card {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      padding: 24px;
      
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

.service-tabs {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  :deep(.arco-tabs-content) {
    padding-top: 16px;
  }
}

@media (max-width: 768px) {
  .external-data-service {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .service-stats {
    .arco-col {
      margin-bottom: 16px;
    }
  }
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 16px;
}
</style>