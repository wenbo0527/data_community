<template>
  <div class="sidebar-process-layout">
    <!-- 顶部导航栏 -->
    <div class="top-navigation">
      <div class="nav-left">
        <h1 class="page-title">业务流程中心</h1>
        <p class="page-subtitle">了解完整业务流程，查询相关数据和指标</p>
      </div>
      <div class="nav-right">
        <BusinessTypeSelector @change="handleBusinessTypeChange" />
        <a-input-search 
          v-model="searchKeyword" 
          placeholder="搜索步骤、数据表或指标..."
          style="width: 280px;"
          @search="handleSearch"
        />
      </div>
    </div>

    <div class="layout-container">
      <!-- 左侧步骤列表 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="header-content">
            <h3>流程步骤</h3>
            <a-badge :count="filteredSteps.length" :number-style="{ backgroundColor: '#165dff' }">
              <span class="total-steps">{{ filteredSteps.length }}/{{ processSteps.length }}</span>
            </a-badge>
          </div>
          <div class="filter-controls">
            <a-select 
              v-model="statusFilter" 
              placeholder="状态筛选" 
              style="width: 120px;"
              size="small"
              @change="handleFilterChange"
            >
              <a-option value="">全部状态</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="running">进行中</a-option>
              <a-option value="pending">待处理</a-option>
            </a-select>
          </div>
        </div>
        
        <div class="steps-list">
          <div 
            v-for="(step, index) in filteredSteps" 
            :key="step.id"
            :class="['step-item', { 
              'active': selectedStepId === step.id, 
              'completed': step.status === 'completed',
              'running': step.status === 'running'
            }]"
            @click="selectStep(step)"
          >
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-status-dot" :class="step.status"></div>
            </div>
            <div class="step-content">
              <div class="step-header">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-actions">
                  <a-tooltip content="查看详情">
                    <IconEye class="action-icon" />
                  </a-tooltip>
                </div>
              </div>
              <div class="step-summary">{{ step.summary }}</div>
              <div class="step-meta">
                <div class="meta-left">
                  <a-tag size="small" :color="getPriorityColor(step.priority)">
                    {{ getPriorityText(step.priority) }}
                  </a-tag>
                  <span class="duration">{{ step.estimatedTime }}</span>
                </div>
                <div class="meta-right">
                  <span class="data-count">{{ step.dataTables?.length || 0 }}表</span>
                  <span class="metric-count">{{ step.metrics?.length || 0 }}指标</span>
                </div>
              </div>
            </div>
            <div class="step-connector" v-if="index < filteredSteps.length - 1"></div>
          </div>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="main-content">
        <div v-if="selectedStep" class="step-detail">
          <!-- 步骤详情头部 -->
          <div class="detail-header">
            <div class="breadcrumb">
              <a-breadcrumb>
                <a-breadcrumb-item>业务流程</a-breadcrumb-item>
                <a-breadcrumb-item>{{ selectedBusinessType === 'self-operated' ? '自营' : selectedBusinessType === 'loan-supermarket' ? '贷超' : '助贷' }}</a-breadcrumb-item>
                <a-breadcrumb-item>{{ selectedStep.title }}</a-breadcrumb-item>
              </a-breadcrumb>
            </div>
            <div class="step-overview">
              <div class="step-info">
                <div class="title-section">
                  <h2>{{ selectedStep.title }}</h2>
                  <div class="status-indicator">
                    <a-badge :status="getStepStatus(selectedStep)" :text="getStatusText(selectedStep.status)" />
                  </div>
                </div>
                <p class="description">{{ selectedStep.description }}</p>
                <div class="step-meta-info">
                  <div class="meta-item">
                    <IconClockCircle />
                    <span>预估时间: {{ selectedStep.estimatedTime }}</span>
                  </div>
                  <div class="meta-item">
                    <IconStorage />
                    <span>数据表: {{ selectedStep.dataTables?.length || 0 }}个</span>
                  </div>
                  <div class="meta-item">
                    <IconBarChart />
                    <span>核心指标: {{ selectedStep.metrics?.length || 0 }}个</span>
                  </div>
                </div>
                <div class="step-tags">
                  <a-tag v-for="tag in selectedStep.tags" :key="tag" size="small" color="arcoblue">{{ tag }}</a-tag>
                </div>
              </div>
              <div class="quick-actions">
                <a-button type="primary" size="large" @click="viewAllData">
                  <template #icon><IconEye /></template>
                  查看所有数据
                </a-button>
                <a-button size="large" @click="exportData">
                  <template #icon><IconDownload /></template>
                  导出数据
                </a-button>
              </div>
            </div>
          </div>

          <!-- 数据表信息 -->
          <div class="data-section">
            <h3>
              <IconFile /> 相关数据表
              <a-badge :count="selectedStep.dataTables?.length || 0" />
            </h3>
            <div class="table-grid">
              <a-card 
                v-for="table in selectedStep.dataTables" 
                :key="table.name"
                class="table-card"
                hoverable
                @click="viewTableDetail(table)"
              >
                <template #title>
                  <IconStorage />
                  {{ table.name }}
                </template>
                <div class="table-info">
                  <p><strong>记录数:</strong> {{ table.recordCount?.toLocaleString() }}</p>
                  <p><strong>更新时间:</strong> {{ table.lastUpdated }}</p>
                  <p><strong>描述:</strong> {{ table.description }}</p>
                </div>
                <template #actions>
                  <a-button size="small" type="text">查看详情</a-button>
                  <a-button size="small" type="text">数据预览</a-button>
                </template>
              </a-card>
            </div>
          </div>

          <!-- 核心指标 -->
          <div class="metrics-section">
            <h3>
              <IconBarChart /> 核心指标
              <a-badge :count="selectedStep.metrics?.length || 0" />
            </h3>
            <div class="metrics-grid">
              <a-card 
                v-for="metric in selectedStep.metrics" 
                :key="metric.name"
                class="metric-card"
              >
                <a-statistic
                  :title="metric.name"
                  :value="metric.value"
                  :suffix="metric.unit"
                  :value-style="{ color: getMetricColor(metric.trend) }"
                >
                  <template #prefix>
                    <component :is="getMetricIcon(metric.trend)" />
                  </template>
                </a-statistic>
                <div class="metric-trend">
                  <span :class="['trend', metric.trend]">
                    {{ metric.changePercent }}
                  </span>
                  <span class="period">{{ metric.period }}</span>
                </div>
              </a-card>
            </div>
          </div>

          <!-- 执行日志 -->
          <div class="logs-section">
            <h3>
              <IconClockCircle /> 执行日志
            </h3>
            <a-timeline>
              <a-timeline-item 
                v-for="log in selectedStep.executionLogs" 
                :key="log.id"
                :color="getLogColor(log.level)"
              >
                <template #dot>
                  <component :is="getLogIcon(log.level)" />
                </template>
                <div class="log-content">
                  <div class="log-header">
                    <span class="log-time">{{ log.timestamp }}</span>
                    <a-tag :color="getLogColor(log.level)" size="small">{{ log.level }}</a-tag>
                  </div>
                  <p class="log-message">{{ log.message }}</p>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>

        <!-- 未选择步骤时的占位内容 -->
        <div v-else class="empty-state">
          <a-empty description="请从左侧选择一个步骤查看详细信息">
            <template #image>
              <IconFile style="font-size: 64px; color: #c9cdd4;" />
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  IconRight, IconPlayArrow, IconEdit, IconFile, IconStorage, 
  IconBarChart, IconClockCircle, IconUp, IconDown, IconMinus,
  IconCheckCircle, IconExclamationCircle, IconInfo, IconEye,
  IconDownload, IconSearch
} from '@arco-design/web-vue/es/icon'
import BusinessTypeSelector from './BusinessTypeSelector.vue'

// 响应式数据
const selectedBusinessType = ref('self-operated')
const selectedStepId = ref<string>('')
const processSteps = ref<any[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')

// 计算属性
const selectedStep = computed(() => {
  return processSteps.value.find(step => step.id === selectedStepId.value)
})

const filteredSteps = computed(() => {
  let steps = processSteps.value

  // 状态筛选
  if (statusFilter.value) {
    steps = steps.filter(step => step.status === statusFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    steps = steps.filter(step => 
      step.title.toLowerCase().includes(keyword) ||
      step.summary.toLowerCase().includes(keyword) ||
      step.tags.some((tag: string) => tag.toLowerCase().includes(keyword)) ||
      step.dataTables?.some((table: any) => table.name.toLowerCase().includes(keyword)) ||
      step.metrics?.some((metric: any) => metric.name.toLowerCase().includes(keyword))
    )
  }

  return steps
})

// 模拟数据
const mockProcessSteps = [
  {
    id: 'step-1',
    title: '数据源识别',
    summary: '识别和配置数据源',
    description: '通过系统扫描和手动配置，识别所有可用的数据源，包括数据库、API接口、文件系统等。',
    status: 'completed',
    priority: 'high',
    estimatedTime: '2小时',
    tags: ['数据接入', '配置'],
    dataTables: [
      { name: 'user_profiles', recordCount: 1250000, lastUpdated: '2024-01-15 14:30', description: '用户基础信息表' },
      { name: 'data_sources', recordCount: 45, lastUpdated: '2024-01-15 09:15', description: '数据源配置表' }
    ],
    metrics: [
      { name: '数据源数量', value: 45, unit: '个', trend: 'up', changePercent: '+12%', period: '本月' },
      { name: '连接成功率', value: 98.5, unit: '%', trend: 'up', changePercent: '+2.1%', period: '本周' }
    ],
    executionLogs: [
      { id: 1, timestamp: '2024-01-15 14:30:25', level: 'info', message: '数据源扫描完成，发现45个数据源' },
      { id: 2, timestamp: '2024-01-15 14:28:10', level: 'success', message: '成功连接到MySQL数据库' }
    ]
  },
  {
    id: 'step-2',
    title: '数据质量检测',
    summary: '检测数据完整性和准确性',
    description: '对接入的数据进行全面的质量检测，包括完整性、准确性、一致性等多个维度的评估。',
    status: 'running',
    priority: 'high',
    estimatedTime: '3小时',
    tags: ['数据质量', '检测'],
    dataTables: [
      { name: 'quality_reports', recordCount: 2340, lastUpdated: '2024-01-15 15:45', description: '数据质量报告表' },
      { name: 'error_logs', recordCount: 156, lastUpdated: '2024-01-15 15:40', description: '数据错误日志表' }
    ],
    metrics: [
      { name: '数据完整率', value: 94.2, unit: '%', trend: 'down', changePercent: '-1.3%', period: '本周' },
      { name: '检测覆盖率', value: 87.6, unit: '%', trend: 'up', changePercent: '+5.2%', period: '本月' }
    ],
    executionLogs: [
      { id: 1, timestamp: '2024-01-15 15:45:12', level: 'warning', message: '发现156条数据质量问题' },
      { id: 2, timestamp: '2024-01-15 15:30:05', level: 'info', message: '开始执行数据质量检测任务' }
    ]
  },
  // 继续添加更多步骤...
  {
    id: 'step-3',
    title: '数据清洗',
    summary: '清理和标准化数据',
    description: '根据质量检测结果，对数据进行清洗、去重、标准化处理，确保数据质量符合业务要求。',
    status: 'pending',
    priority: 'medium',
    estimatedTime: '4小时',
    tags: ['数据清洗', '标准化'],
    dataTables: [
      { name: 'cleaned_data', recordCount: 1180000, lastUpdated: '2024-01-15 12:20', description: '清洗后数据表' }
    ],
    metrics: [
      { name: '清洗成功率', value: 96.8, unit: '%', trend: 'stable', changePercent: '0%', period: '本周' }
    ],
    executionLogs: []
  }
]

// 方法
const handleBusinessTypeChange = (type: string) => {
  selectedBusinessType.value = type
  loadProcessSteps()
}

const loadProcessSteps = () => {
  // 根据业务类型加载不同的流程步骤
  processSteps.value = mockProcessSteps
  if (processSteps.value.length > 0) {
    selectedStepId.value = processSteps.value[0].id
  }
}

const selectStep = (step: any) => {
  selectedStepId.value = step.id
}

const getStepStatus = (step: any) => {
  switch (step.status) {
    case 'completed': return 'success'
    case 'running': return 'processing'
    case 'error': return 'danger'
    default: return 'default'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return '普通'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'orange'
    case 'low': return 'blue'
    default: return 'gray'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'running': return '进行中'
    case 'pending': return '待处理'
    case 'error': return '异常'
    default: return '未知'
  }
}

const handleSearch = (value: string) => {
  searchKeyword.value = value
}

const handleFilterChange = () => {
  // 筛选变化时的处理逻辑
}

const viewAllData = () => {
  console.log('查看所有数据:', selectedStep.value?.title)
}

const exportData = () => {
  console.log('导出数据:', selectedStep.value?.title)
}

const getMetricColor = (trend: string) => {
  switch (trend) {
    case 'up': return '#00b42a'
    case 'down': return '#f53f3f'
    default: return '#1d2129'
  }
}

const getMetricIcon = (trend: string) => {
  switch (trend) {
    case 'up': return IconUp
    case 'down': return IconDown
    default: return IconMinus
  }
}

const getLogColor = (level: string) => {
  switch (level) {
    case 'success': return 'green'
    case 'warning': return 'orange'
    case 'error': return 'red'
    default: return 'blue'
  }
}

const getLogIcon = (level: string) => {
  switch (level) {
    case 'success': return IconCheckCircle
    case 'warning': return IconExclamationCircle
    case 'error': return IconExclamationCircle
    default: return IconInfo
  }
}

const executeStep = () => {
  console.log('执行步骤:', selectedStep.value?.title)
}

const editStep = () => {
  console.log('编辑步骤:', selectedStep.value?.title)
}

const viewTableDetail = (table: any) => {
  console.log('查看表详情:', table.name)
}

// 生命周期
onMounted(() => {
  loadProcessSteps()
})
</script>

<style scoped>
.sidebar-process-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

/* 顶部导航栏 */
.top-navigation {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-left .page-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.nav-left .page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.layout-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧边栏样式 */
.sidebar {
  width: 380px;
  background: white;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.total-steps {
  font-size: 12px;
  color: #86909c;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.steps-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.step-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  margin-bottom: 2px;
}

.step-item:hover {
  background: linear-gradient(90deg, #f7f8fa 0%, #ffffff 100%);
  transform: translateX(2px);
}

.step-item.active {
  background: linear-gradient(90deg, #e8f3ff 0%, #f0f7ff 100%);
  border-left-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.step-item.completed {
  background: linear-gradient(90deg, #f0f9f0 0%, #ffffff 100%);
  border-left-color: #00b42a;
}

.step-item.running {
  background: linear-gradient(90deg, #fff7e6 0%, #ffffff 100%);
  border-left-color: #ff7d00;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f2f3f5;
  color: #4e5969;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step-item.active .step-number {
  background: #165dff;
  color: white;
}

.step-item.completed .step-number {
  background: #00b42a;
  color: white;
}

.step-item.running .step-number {
  background: #ff7d00;
  color: white;
}

.step-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c9cdd4;
}

.step-status-dot.completed {
  background: #00b42a;
}

.step-status-dot.running {
  background: #ff7d00;
  animation: pulse 2s infinite;
}

.step-status-dot.pending {
  background: #c9cdd4;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.step-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.step-item:hover .step-actions {
  opacity: 1;
}

.action-icon {
  font-size: 16px;
  color: #86909c;
  cursor: pointer;
  transition: color 0.3s;
}

.action-icon:hover {
  color: #165dff;
}

.step-summary {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 12px;
  line-height: 1.5;
}

.step-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duration {
  font-size: 12px;
  color: #86909c;
}

.data-count,
.metric-count {
  font-size: 11px;
  color: #86909c;
  background: #f2f3f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.step-connector {
  position: absolute;
  left: 39px;
  bottom: -2px;
  width: 2px;
  height: 2px;
  background: #e5e6eb;
}

/* 右侧主内容区样式 */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f7f8fa;
}

.step-detail {
  padding: 24px;
}

.detail-header {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.breadcrumb {
  padding: 16px 24px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.step-overview {
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.step-info {
  flex: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.title-section h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.status-indicator {
  padding: 4px 0;
}

.description {
  margin: 0 0 20px 0;
  color: #4e5969;
  line-height: 1.6;
  font-size: 15px;
}

.step-meta-info {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4e5969;
}

.meta-item svg {
  font-size: 16px;
  color: #86909c;
}

.step-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

/* 数据表和指标区域 */
.data-section,
.metrics-section,
.logs-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.data-section h3,
.metrics-section h3,
.logs-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-grid,
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.table-card,
.metric-card {
  border: 1px solid #e5e6eb;
}

.table-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #4e5969;
}

.metric-trend {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend {
  font-size: 12px;
  font-weight: 500;
}

.trend.up { color: #00b42a; }
.trend.down { color: #f53f3f; }
.trend.stable { color: #86909c; }

.period {
  font-size: 11px;
  color: #86909c;
}

/* 日志区域 */
.log-content {
  width: 100%;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-time {
  font-size: 12px;
  color: #86909c;
}

.log-message {
  margin: 0;
  font-size: 13px;
  color: #4e5969;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 300px;
  }
  
  .table-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 300px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .step-actions {
    width: 100%;
  }
}
</style>