<template>
  <div class="process-flow-overview">
    <!-- 流程概览头部 -->
    <div class="flow-header">
      <div class="header-content">
        <h3 class="flow-title">{{ flowData.title }}</h3>
        <div class="flow-meta">
          <a-tag color="blue">{{ flowData.businessType }}</a-tag>
          <a-tag color="green">{{ flowData.productType }}</a-tag>
          <span class="step-count">共 {{ flowData.steps.length }} 个步骤</span>
        </div>
      </div>
      <div class="header-actions">
        <a-button type="outline" @click="toggleViewMode">
          <template #icon>
            <icon-eye v-if="viewMode === 'overview'" />
            <icon-list v-else />
          </template>
          {{ viewMode === 'overview' ? '详细视图' : '概览视图' }}
        </a-button>
        <a-button type="primary" @click="editFlow">
          <template #icon><icon-edit /></template>
          编辑流程
        </a-button>
      </div>
    </div>

    <!-- 流程全貌展示 -->
    <div class="flow-container" :class="{ 'detailed-view': viewMode === 'detail' }">
      <!-- 概览模式：紧凑的流程图 -->
      <div v-if="viewMode === 'overview'" class="overview-mode">
        <div class="process-timeline">
          <div 
            v-for="(step, index) in flowData.steps" 
            :key="step.id"
            class="timeline-item"
            :class="{ 
              'active': activeStepId === step.id,
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
            @click="selectStep(step)"
          >
            <!-- 步骤节点 -->
            <div class="step-node">
              <div class="node-content">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-icon">
                  <icon-check v-if="step.status === 'completed'" />
                  <icon-play-arrow v-else-if="step.status === 'current'" />
                  <icon-clock-circle v-else />
                </div>
              </div>
              <div class="node-status" :class="step.status"></div>
            </div>
            
            <!-- 步骤信息 -->
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
              <div class="step-metrics">
                <span class="metric-item">
                  <icon-database />
                  {{ step.tableCount || 0 }} 张表
                </span>
                <span class="metric-item">
                  <icon-bar-chart />
                  {{ step.indicatorCount || 0 }} 个指标
                </span>
              </div>
            </div>
            
            <!-- 连接线 -->
            <div v-if="index < flowData.steps.length - 1" class="connection-line">
              <div class="line-arrow">
                <icon-arrow-right />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细模式：卡片式布局 -->
      <div v-else class="detail-mode">
        <div class="steps-grid">
          <div 
            v-for="(step, index) in flowData.steps" 
            :key="step.id"
            class="step-card"
            :class="{ 
              'active': activeStepId === step.id,
              'completed': step.status === 'completed',
              'current': step.status === 'current'
            }"
            @click="selectStep(step)"
          >
            <div class="card-header">
              <div class="step-badge">
                <span class="badge-number">{{ index + 1 }}</span>
                <icon-check v-if="step.status === 'completed'" class="badge-icon" />
                <icon-play-arrow v-else-if="step.status === 'current'" class="badge-icon" />
              </div>
              <div class="step-status-tag">
                <a-tag :color="getStatusColor(step.status)">
                  {{ getStatusText(step.status) }}
                </a-tag>
              </div>
            </div>
            
            <div class="card-content">
              <h4 class="step-title">{{ step.title }}</h4>
              <p class="step-description">{{ step.description }}</p>
              
              <div class="step-stats">
                <div class="stat-item">
                  <icon-database class="stat-icon" />
                  <span class="stat-label">数据表</span>
                  <span class="stat-value">{{ step.tableCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <icon-bar-chart class="stat-icon" />
                  <span class="stat-label">指标</span>
                  <span class="stat-value">{{ step.indicatorCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <icon-clock-circle class="stat-icon" />
                  <span class="stat-label">耗时</span>
                  <span class="stat-value">{{ step.duration || '-' }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <a-button size="small" type="text" @click.stop="viewStepDetail(step)">
                查看详情
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中步骤的详细信息 -->
    <div v-if="selectedStep" class="step-detail-panel">
      <div class="panel-header">
        <div class="panel-title">
          <h4>{{ selectedStep.title }} - 详细信息</h4>
          <a-button type="text" @click="closeDetailPanel">
            <template #icon><icon-close /></template>
          </a-button>
        </div>
      </div>
      
      <div class="panel-content">
        <a-tabs v-model:active-key="activeTab" type="rounded">
          <!-- 数据表标签页 -->
          <a-tab-pane key="tables" title="数据表">
            <div class="tables-section">
              <div class="section-header">
                <h5>关联数据表 ({{ selectedStep.tables?.length || 0 }})</h5>
                <a-button size="small" type="primary" @click="addTable">
                  <template #icon><icon-plus /></template>
                  添加表
                </a-button>
              </div>
              
              <div class="tables-grid">
                <div 
                  v-for="table in selectedStep.tables" 
                  :key="table.id"
                  class="table-card"
                  @click="viewTableDetail(table)"
                >
                  <div class="table-header">
                    <icon-database class="table-icon" />
                    <span class="table-name">{{ table.name }}</span>
                    <a-tag size="small" :color="getTableTypeColor(table.type)">
                      {{ table.type }}
                    </a-tag>
                  </div>
                  <div class="table-info">
                    <p class="table-desc">{{ table.description }}</p>
                    <div class="table-stats">
                      <span class="stat">{{ table.recordCount || 0 }} 条记录</span>
                      <span class="stat">{{ table.fieldCount || 0 }} 个字段</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
          
          <!-- 核心指标标签页 -->
          <a-tab-pane key="indicators" title="核心指标">
            <div class="indicators-section">
              <div class="section-header">
                <h5>核心指标 ({{ selectedStep.indicators?.length || 0 }})</h5>
                <a-button size="small" type="primary" @click="addIndicator">
                  <template #icon><icon-plus /></template>
                  添加指标
                </a-button>
              </div>
              
              <div class="indicators-grid">
                <div 
                  v-for="indicator in selectedStep.indicators" 
                  :key="indicator.id"
                  class="indicator-card"
                >
                  <div class="indicator-header">
                    <div class="indicator-title">
                      <icon-bar-chart class="indicator-icon" />
                      <span class="indicator-name">{{ indicator.name }}</span>
                    </div>
                    <div class="indicator-value" :class="indicator.trend">
                      <span class="value">{{ indicator.value }}</span>
                      <span class="unit">{{ indicator.unit }}</span>
                      <icon-arrow-up v-if="indicator.trend === 'up'" class="trend-icon" />
                      <icon-arrow-down v-else-if="indicator.trend === 'down'" class="trend-icon" />
                    </div>
                  </div>
                  
                  <div class="indicator-content">
                    <p class="indicator-desc">{{ indicator.description }}</p>
                    <div class="indicator-meta">
                      <span class="meta-item">
                        <icon-clock-circle />
                        {{ indicator.updateTime }}
                      </span>
                      <span class="meta-item">
                        <icon-user />
                        {{ indicator.owner }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="indicator-chart">
                    <!-- 这里可以集成图表组件 -->
                    <div class="mini-chart">
                      <div class="chart-placeholder">
                        <icon-line-chart />
                        <span>趋势图表</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
          
          <!-- 流程配置标签页 -->
          <a-tab-pane key="config" title="流程配置">
            <div class="config-section">
              <a-form :model="stepConfig" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="步骤名称" field="title">
                      <a-input v-model="stepConfig.title" placeholder="请输入步骤名称" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="步骤状态" field="status">
                      <a-select v-model="stepConfig.status" placeholder="请选择状态">
                        <a-option value="pending">待开始</a-option>
                        <a-option value="current">进行中</a-option>
                        <a-option value="completed">已完成</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item label="步骤描述" field="description">
                  <a-textarea 
                    v-model="stepConfig.description" 
                    placeholder="请输入步骤描述"
                    :rows="3"
                  />
                </a-form-item>
                
                <a-form-item label="预计耗时" field="duration">
                  <a-input v-model="stepConfig.duration" placeholder="如：2小时、1天" />
                </a-form-item>
                
                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="saveStepConfig">保存配置</a-button>
                    <a-button @click="resetStepConfig">重置</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconEye,
  IconList,
  IconEdit,
  IconCheck,
  IconPlayArrow,
  IconClockCircle,
  IconFile,
  IconBarChart,
  IconArrowRight,
  IconArrowUp,
  IconArrowDown,
  IconClose,
  IconPlus,
  IconUser,
  IconBarChart as IconLineChart
} from '@arco-design/web-vue/es/icon'

// 接口定义
interface Step {
  id: string
  title: string
  description: string
  status: 'pending' | 'current' | 'completed'
  tableCount?: number
  indicatorCount?: number
  duration?: string
  tables?: Table[]
  indicators?: Indicator[]
}

interface Table {
  id: string
  name: string
  description: string
  type: string
  recordCount?: number
  fieldCount?: number
}

interface Indicator {
  id: string
  name: string
  description: string
  value: string
  unit: string
  trend?: 'up' | 'down' | 'stable'
  updateTime: string
  owner: string
}

interface FlowData {
  title: string
  businessType: string
  productType: string
  steps: Step[]
}

// Props
interface Props {
  flowData?: FlowData
}

const props = withDefaults(defineProps<Props>(), {
  flowData: () => ({
    title: '个人贷业务流程',
    businessType: '自营',
    productType: '个人贷',
    steps: [
      {
        id: '1',
        title: '客户申请',
        description: '客户提交贷款申请资料',
        status: 'completed',
        tableCount: 3,
        indicatorCount: 5,
        duration: '30分钟',
        tables: [
          {
            id: 't1',
            name: 'customer_application',
            description: '客户申请信息表',
            type: '业务表',
            recordCount: 1250,
            fieldCount: 25
          }
        ],
        indicators: [
          {
            id: 'i1',
            name: '申请转化率',
            description: '客户申请到提交的转化率',
            value: '85.6',
            unit: '%',
            trend: 'up',
            updateTime: '2024-01-15 14:30',
            owner: '张三'
          }
        ]
      },
      {
        id: '2',
        title: '资料审核',
        description: '审核客户提交的申请资料',
        status: 'current',
        tableCount: 2,
        indicatorCount: 3,
        duration: '2小时'
      },
      {
        id: '3',
        title: '风险评估',
        description: '对客户进行风险评估和信用评分',
        status: 'pending',
        tableCount: 4,
        indicatorCount: 8,
        duration: '1小时'
      },
      {
        id: '4',
        title: '额度审批',
        description: '根据评估结果确定贷款额度',
        status: 'pending',
        tableCount: 2,
        indicatorCount: 4,
        duration: '30分钟'
      },
      {
        id: '5',
        title: '合同签署',
        description: '与客户签署贷款合同',
        status: 'pending',
        tableCount: 3,
        indicatorCount: 2,
        duration: '45分钟'
      },
      {
        id: '6',
        title: '放款处理',
        description: '执行放款操作',
        status: 'pending',
        tableCount: 2,
        indicatorCount: 6,
        duration: '15分钟'
      },
      {
        id: '7',
        title: '贷后管理',
        description: '贷款发放后的管理和监控',
        status: 'pending',
        tableCount: 5,
        indicatorCount: 12,
        duration: '持续'
      },
      {
        id: '8',
        title: '还款管理',
        description: '客户还款计划和执行管理',
        status: 'pending',
        tableCount: 3,
        indicatorCount: 8,
        duration: '持续'
      },
      {
        id: '9',
        title: '逾期处理',
        description: '处理逾期还款情况',
        status: 'pending',
        tableCount: 4,
        indicatorCount: 6,
        duration: '按需'
      },
      {
        id: '10',
        title: '结清处理',
        description: '贷款结清和账户关闭',
        status: 'pending',
        tableCount: 2,
        indicatorCount: 3,
        duration: '30分钟'
      },
      {
        id: '11',
        title: '数据归档',
        description: '将完成的贷款数据进行归档',
        status: 'pending',
        tableCount: 1,
        indicatorCount: 2,
        duration: '1小时'
      },
      {
        id: '12',
        title: '报告生成',
        description: '生成业务报告和分析',
        status: 'pending',
        tableCount: 3,
        indicatorCount: 10,
        duration: '2小时'
      }
    ]
  })
})

// 响应式数据
const viewMode = ref<'overview' | 'detail'>('overview')
const activeStepId = ref<string>('')
const selectedStep = ref<Step | null>(null)
const activeTab = ref('tables')

const stepConfig = reactive({
  title: '',
  description: '',
  status: 'pending',
  duration: ''
})

// 计算属性
const currentStep = computed(() => {
  return props.flowData.steps.find(step => step.status === 'current')
})

// 方法
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'overview' ? 'detail' : 'overview'
}

const selectStep = (step: Step) => {
  activeStepId.value = step.id
  selectedStep.value = step
  
  // 更新配置表单
  stepConfig.title = step.title
  stepConfig.description = step.description
  stepConfig.status = step.status
  stepConfig.duration = step.duration || ''
}

const closeDetailPanel = () => {
  selectedStep.value = null
  activeStepId.value = ''
}

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'green',
    current: 'blue',
    pending: 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status: string) => {
  const texts = {
    completed: '已完成',
    current: '进行中',
    pending: '待开始'
  }
  return texts[status] || '未知'
}

const getTableTypeColor = (type: string) => {
  const colors = {
    '业务表': 'blue',
    '维度表': 'green',
    '事实表': 'orange',
    '临时表': 'gray'
  }
  return colors[type] || 'blue'
}

const viewStepDetail = (step: Step) => {
  selectStep(step)
}

const viewTableDetail = (table: Table) => {
  Message.info(`查看表详情: ${table.name}`)
}

const addTable = () => {
  Message.info('添加数据表功能')
}

const addIndicator = () => {
  Message.info('添加指标功能')
}

const editFlow = () => {
  Message.info('编辑流程功能')
}

const saveStepConfig = () => {
  if (selectedStep.value) {
    selectedStep.value.title = stepConfig.title
    selectedStep.value.description = stepConfig.description
    selectedStep.value.status = stepConfig.status
    selectedStep.value.duration = stepConfig.duration
    Message.success('步骤配置已保存')
  }
}

const resetStepConfig = () => {
  if (selectedStep.value) {
    stepConfig.title = selectedStep.value.title
    stepConfig.description = selectedStep.value.description
    stepConfig.status = selectedStep.value.status
    stepConfig.duration = selectedStep.value.duration || ''
  }
}

// 监听选中步骤变化
watch(selectedStep, (newStep) => {
  if (newStep) {
    activeTab.value = 'tables'
  }
})
</script>

<style scoped>
.process-flow-overview {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

/* 头部样式 */
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content .flow-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.flow-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-count {
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 流程容器 */
.flow-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 概览模式样式 */
.overview-mode {
  padding: 24px;
}

.process-timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  max-width: 240px;
  padding: 16px;
  border: 2px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.timeline-item:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.timeline-item.active {
  border-color: #165dff;
  background: #f2f7ff;
}

.timeline-item.completed {
  border-color: #00b42a;
  background: #f6ffed;
}

.timeline-item.current {
  border-color: #ff7d00;
  background: #fff7e6;
}

.step-node {
  position: relative;
  margin-bottom: 12px;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e5e6eb;
  position: relative;
}

.timeline-item.completed .node-content {
  border-color: #00b42a;
  background: #00b42a;
  color: white;
}

.timeline-item.current .node-content {
  border-color: #ff7d00;
  background: #ff7d00;
  color: white;
}

.timeline-item.active .node-content {
  border-color: #165dff;
}

.step-number {
  font-size: 14px;
  font-weight: 600;
}

.step-icon {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.step-info {
  text-align: center;
  width: 100%;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  line-height: 1.4;
}

.step-desc {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
  line-height: 1.4;
}

.step-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: #4e5969;
}

.connection-line {
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);
  width: 32px;
  height: 2px;
  background: #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-arrow {
  color: #86909c;
  font-size: 12px;
}

/* 详细模式样式 */
.detail-mode {
  padding: 24px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.step-card {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.step-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.step-card.active {
  border-color: #165dff;
  background: #f2f7ff;
}

.step-card.completed {
  border-color: #00b42a;
}

.step-card.current {
  border-color: #ff7d00;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.step-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #165dff;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.step-card.completed .badge-number {
  background: #00b42a;
}

.step-card.current .badge-number {
  background: #ff7d00;
}

.badge-icon {
  font-size: 14px;
  color: #165dff;
}

.card-content .step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.step-description {
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 16px;
  line-height: 1.5;
}

.step-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 16px;
  color: #165dff;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.card-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

/* 详情面板样式 */
.step-detail-panel {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f2f3f5;
  background: #fafbfc;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.panel-content {
  padding: 24px;
}

/* 表格和指标样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.tables-grid,
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.table-card,
.indicator-card {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.table-card:hover,
.indicator-card:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.table-header,
.indicator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.table-icon,
.indicator-icon {
  font-size: 16px;
  color: #165dff;
  margin-right: 8px;
}

.table-name,
.indicator-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.indicator-value {
  display: flex;
  align-items: center;
  gap: 4px;
}

.indicator-value .value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.indicator-value .unit {
  font-size: 12px;
  color: #86909c;
}

.trend-icon {
  font-size: 12px;
}

.indicator-value.up .trend-icon {
  color: #00b42a;
}

.indicator-value.down .trend-icon {
  color: #f53f3f;
}

.table-info,
.indicator-content {
  margin-bottom: 12px;
}

.table-desc,
.indicator-desc {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 8px;
  line-height: 1.4;
}

.table-stats,
.indicator-meta {
  display: flex;
  gap: 12px;
}

.table-stats .stat,
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.indicator-chart {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

.mini-chart {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-radius: 4px;
  color: #86909c;
  font-size: 12px;
  gap: 8px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 配置表单样式 */
.config-section {
  max-width: 600px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .process-timeline {
    justify-content: center;
  }
  
  .timeline-item {
    min-width: 180px;
    max-width: 200px;
  }
  
  .steps-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .process-flow-overview {
    padding: 16px;
  }
  
  .flow-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .process-timeline {
    flex-direction: column;
    align-items: center;
  }
  
  .timeline-item {
    min-width: 100%;
    max-width: 100%;
  }
  
  .connection-line {
    display: none;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .tables-grid,
  .indicators-grid {
    grid-template-columns: 1fr;
  }
}
</style>