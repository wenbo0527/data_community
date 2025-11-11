<template>
  <div class="external-data-evaluation">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>外部数据评估管理</h1>
          <p class="page-description">对外部数据产品进行全面评估，包括引入评估、监控评估、质量评估和价值评估</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-dropdown @select="handleQuickAction">
              <a-button type="primary">
                <template #icon><IconPlus /></template>
                快速操作
              </a-button>
              <template #content>
                <a-doption value="create-evaluation">新建评估</a-doption>
                <a-doption value="batch-evaluation">批量评估</a-doption>
                <a-doption value="template-management">模板管理</a-doption>
                <a-doption value="evaluation-history">评估历史</a-doption>
              </template>
            </a-dropdown>
            <a-button type="outline" @click="handleExport">
              <template #icon><IconDownload /></template>
              导出评估
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
      <a-alert :title="'数据加载失败'" :description="error" type="error" closable @close="error = null" />
    </div>
    
    <!-- 数据一致性警告 -->
    <div v-if="consistencyWarnings.length > 0" class="consistency-warning">
      <a-alert title="数据一致性警告" type="warning" closable @close="consistencyWarnings = []">
        <div v-for="(item, index) in consistencyWarnings" :key="index" class="consistency-item">
          {{ item.message }}
        </div>
      </a-alert>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-skeleton :animation="true" :loading="loading" :rows="6" />
      <span class="loading-text">正在加载评估数据...</span>
    </div>
    
    <!-- 评估统计 -->
    <a-row :gutter="16" class="stats-cards" v-if="!loading">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconPlayCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.introduction }}</div>
              <div class="stat-label">引入评估</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconDashboard />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.monitoring }}</div>
              <div class="stat-label">监控评估</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconStar />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.quality }}</div>
              <div class="stat-label">质量评估</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconCheckCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.value }}</div>
              <div class="stat-label">价值评估</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 评估任务列表 -->
    <a-card title="评估任务" class="evaluation-tabs">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="running" title="运行中">
          <a-table
            :columns="taskColumns"
            :data="runningTasks"
            :loading="loading"
            :pagination="false"
            row-key="id"
          >
            <template #action="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewTaskDetail(record)">
                  查看详情
                </a-button>
                <a-button type="text" size="small" status="warning" @click="stopTask(record)">
                  停止
                </a-button>
              </a-space>
            </template>
            
            <!-- 空列表提示 -->
            <template #empty>
              <div class="empty-container">
                <IconLoading class="empty-icon" />
                <div class="empty-text">暂无运行中的评估任务</div>
                <div class="empty-description">您可以创建新的评估任务</div>
                <a-button type="primary" @click="showEvaluationModal = true">
                  <template #icon><IconPlus /></template>
                  创建评估任务
                </a-button>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="completed" title="已完成">
          <a-table
            :columns="taskColumns"
            :data="completedTasks"
            :loading="loading"
            :pagination="false"
            row-key="id"
          >
            <template #action="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewTaskDetail(record)">
                  查看报告
                </a-button>
                <a-button type="text" size="small" @click="downloadReport(record)">
                  下载报告
                </a-button>
              </a-space>
            </template>
            
            <!-- 空列表提示 -->
            <template #empty>
              <div class="empty-container">
                <IconCheckCircle class="empty-icon" />
                <div class="empty-text">暂无已完成的评估任务</div>
                <div class="empty-description">完成的评估任务将显示在这里</div>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新建评估弹窗 -->
    <a-modal
      v-model:visible="showEvaluationModal"
      title="新建评估"
      width="800px"
      @ok="handleEvaluationSubmit"
      @cancel="handleEvaluationCancel"
    >
      <a-form :model="evaluationForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="evaluationType" label="评估类型" required>
              <a-select v-model="evaluationForm.evaluationType" placeholder="请选择评估类型">
                <a-option value="introduction">引入阶段评估</a-option>
                <a-option value="monitoring">监控阶段评估</a-option>
                <a-option value="quality">质量评估</a-option>
                <a-option value="value">价值评估</a-option>
                <a-option value="risk">风险评估</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="dataProduct" label="数据产品" required>
              <a-select v-model="evaluationForm.dataProduct" placeholder="请选择数据产品">
                <a-option value="身份信息核验服务">身份信息核验服务</a-option>
                <a-option value="信用评分查询">信用评分查询</a-option>
                <a-option value="用户画像标签">用户画像标签</a-option>
                <a-option value="风险名单核验">风险名单核验</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="evaluationCriteria" label="评估指标" required>
          <a-table
            :columns="criteriaColumns"
            :data="criteriaData"
            :pagination="false"
            size="small"
          >
            <template #weight="{ record }">
              <a-input-number
                v-model="record.weight"
                :min="0"
                :max="100"
                :precision="1"
                style="width: 80px"
              />
            </template>
            <template #score="{ record }">
              <a-rate v-model="record.score" allow-half />
            </template>
            <template #remark="{ record }">
              <a-input v-model="record.remark" placeholder="备注说明" />
            </template>
          </a-table>
        </a-form-item>
        
        <a-form-item field="evaluationResult" label="评估结论" required>
          <a-radio-group v-model="evaluationForm.evaluationResult">
            <a-radio value="excellent">优秀</a-radio>
            <a-radio value="good">良好</a-radio>
            <a-radio value="average">一般</a-radio>
            <a-radio value="poor">较差</a-radio>
            <a-radio value="rejected">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item field="suggestions" label="改进建议">
          <a-textarea
            v-model="evaluationForm.suggestions"
            placeholder="请输入改进建议"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconDownload,
  IconRefresh,
  IconPlayCircle,
  IconDashboard,
  IconStar,
  IconCheckCircle,
  IconLoading
} from '@arco-design/web-vue/es/icon'

// 引入统一Mock数据
import { getMockData, getStatistics } from '@/mock/index.js'
import { useExternalDataStore } from '@/stores/external-data.js'
import { ROUTE_PATHS } from '@/router/constants.ts'

// 引入评估子组件
import IntroductionEvaluation from './components/IntroductionEvaluation.vue'
import MonitoringEvaluation from './components/MonitoringEvaluation.vue'
import QualityEvaluation from './components/QualityEvaluation.vue'
import ValueEvaluation from './components/ValueEvaluation.vue'
import RiskEvaluation from './components/RiskEvaluation.vue'

// 统计数据
const stats = reactive({
  introduction: 0,
  monitoring: 0,
  quality: 0,
  value: 0,
  risk: 0
})

// 使用统一状态管理
const externalDataStore = useExternalDataStore()
const loading = ref(false)
const error = ref(null)
const consistencyWarnings = ref([])

// 当前标签页
const activeTab = ref('introduction')

// 弹窗状态
const showEvaluationModal = ref(false)

// 评估表单
const evaluationForm = reactive({
  evaluationType: '',
  dataProduct: '',
  evaluationResult: '',
  suggestions: ''
})

// 评估指标表格配置
const criteriaColumns = [
  {
    title: '评估维度',
    dataIndex: 'dimension',
    width: 120
  },
  {
    title: '权重(%)',
    dataIndex: 'weight',
    slotName: 'weight',
    width: 100
  },
  {
    title: '评分',
    dataIndex: 'score',
    slotName: 'score',
    width: 120
  },
  {
    title: '备注',
    dataIndex: 'remark',
    slotName: 'remark'
  }
]

// 评估指标数据
const criteriaData = ref([
  {
    dimension: '数据质量',
    weight: 30,
    score: 4.5,
    remark: '数据准确性较高'
  },
  {
    dimension: '数据完整性',
    weight: 25,
    score: 4.0,
    remark: '覆盖率良好'
  },
  {
    dimension: '数据时效性',
    weight: 20,
    score: 3.5,
    remark: '更新频率适中'
  },
  {
    dimension: '数据成本',
    weight: 15,
    score: 3.0,
    remark: '成本可控'
  },
  {
    dimension: '数据风险',
    weight: 10,
    score: 4.0,
    remark: '风险较低'
  }
])

// 评估任务列表列配置与数据，避免表格渲染期读取 undefined
const taskColumns = [
  { title: '任务名称', dataIndex: 'name' },
  { title: '评估类型', dataIndex: 'type' },
  { title: '状态', dataIndex: 'status' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', slotName: 'action', width: 160 }
]

const runningTasks = ref([])
const completedTasks = ref([])

const viewTaskDetail = (record) => {
  Message.info(`查看任务详情：${record?.name || '未知任务'}`)
}

const stopTask = (record) => {
  Message.warning(`已发送停止指令：${record?.name || '未知任务'}`)
}

const downloadReport = (record) => {
  Message.success(`开始下载报告：${record?.name || '未知任务'}`)
}

// 加载任务数据，优先使用 store，其次使用 Mock，最后兜底为空数组
const loadTasks = async () => {
  try {
    const storeTasks = externalDataStore?.evaluationTasks
    let tasks = []
    if (Array.isArray(storeTasks)) {
      tasks = storeTasks
    } else {
      const mockTasks = getMockData('externalDataEvaluationTasks')
      if (Array.isArray(mockTasks)) {
        tasks = mockTasks
      }
    }

    // 兜底示例数据，避免为空导致渲染错误
    if (!Array.isArray(tasks) || tasks.length === 0) {
      tasks = [
        { id: 't-001', name: '引入评估任务A', type: 'introduction', status: 'running', createTime: new Date().toISOString() },
        { id: 't-002', name: '质量评估任务B', type: 'quality', status: 'running', createTime: new Date().toISOString() },
        { id: 't-003', name: '监控评估任务C', type: 'monitoring', status: 'completed', createTime: new Date().toISOString() },
        { id: 't-004', name: '价值评估任务D', type: 'value', status: 'completed', createTime: new Date().toISOString() }
      ]
    }

    runningTasks.value = tasks.filter(t => t?.status === 'running')
    completedTasks.value = tasks.filter(t => t?.status === 'completed')
  } catch (err) {
    console.error('加载评估任务失败:', err)
    runningTasks.value = []
    completedTasks.value = []
  }
}

// 提交评估
const handleEvaluationSubmit = async () => {
  if (!evaluationForm.evaluationType || !evaluationForm.dataProduct || !evaluationForm.evaluationResult) {
    Message.error('请填写完整的评估信息')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // 使用状态管理创建评估
    const evaluationData = {
      type: evaluationForm.evaluationType,
      dataProduct: evaluationForm.dataProduct,
      result: evaluationForm.evaluationResult,
      suggestions: evaluationForm.suggestions,
      createTime: new Date().toISOString()
    }
    
    await externalDataStore.createEvaluation(evaluationData)
    
    Message.success('评估创建成功')
    showEvaluationModal.value = false
    
    // 更新统计
    stats[evaluationForm.evaluationType]++
    
    // 重置表单
    Object.assign(evaluationForm, {
      evaluationType: '',
      dataProduct: '',
      evaluationResult: '',
      suggestions: ''
    })
  } catch (err) {
    console.error('创建评估失败:', err)
    error.value = err.message
    Message.error('创建评估失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleEvaluationCancel = () => {
  showEvaluationModal.value = false
}

// 导出评估
const handleExport = () => {
  Message.success('评估数据导出成功')
}

  // 刷新数据
  const handleRefresh = () => {
    Message.info('正在刷新评估数据...')
    loadEvaluations()
    loadTasks()
    // 检查数据一致性
    const consistencyCheck = externalDataStore && typeof externalDataStore.checkDataConsistency === 'function'
      ? externalDataStore.checkDataConsistency() || []
      : []
    consistencyWarnings.value = Array.isArray(consistencyCheck) ? consistencyCheck : []
    Message.success('评估数据刷新完成')
  }

// 加载评估数据
const loadEvaluations = async () => {
  try {
    await externalDataStore.fetchStatistics('externalDataEvaluation')
    const evalStats = externalDataStore.statistics.externalDataEvaluation
    if (evalStats) {
      stats.introduction = evalStats.introduction || 5
      stats.monitoring = evalStats.monitoring || 12
      stats.quality = evalStats.quality || 8
      stats.value = evalStats.value || 3
      stats.risk = evalStats.risk || 6
    }
  } catch (err) {
    console.error('加载评估数据失败:', err)
    Message.error('加载评估数据失败: ' + err.message)
  }
}

// 快速操作处理
const handleQuickAction = (value) => {
  switch (value) {
    case 'create-evaluation':
      showEvaluationModal.value = true
      break
    case 'batch-evaluation':
      Message.info('批量评估功能开发中...')
      break
    case 'template-management':
      Message.info('模板管理功能开发中...')
      break
    case 'evaluation-history':
      Message.info('评估历史功能开发中...')
      break
    default:
      break
  }
}

// 初始化加载统计数据
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // 优先使用统一状态管理中的数据
    if (externalDataStore.statistics.externalDataEvaluation) {
      const evalStats = externalDataStore.statistics.externalDataEvaluation
      stats.introduction = evalStats.introduction || 5
      stats.monitoring = evalStats.monitoring || 12
      stats.quality = evalStats.quality || 8
      stats.value = evalStats.value || 3
      stats.risk = evalStats.risk || 6
    } else {
      // 尝试从API获取统计数据
      await externalDataStore.fetchStatistics('externalDataEvaluation')
      const evalStats = externalDataStore.statistics.externalDataEvaluation
      if (evalStats) {
        stats.introduction = evalStats.introduction || 5
        stats.monitoring = evalStats.monitoring || 12
        stats.quality = evalStats.quality || 8
        stats.value = evalStats.value || 3
        stats.risk = evalStats.risk || 6
      } else {
        // 使用模拟数据作为备选
        const mockStats = getStatistics('externalDataEvaluation')
        if (mockStats) {
          stats.introduction = mockStats.introduction || 5
          stats.monitoring = mockStats.monitoring || 12
          stats.quality = mockStats.quality || 8
          stats.value = mockStats.value || 3
          stats.risk = mockStats.risk || 6
        }
      }
    }
    
    // 检查数据一致性
    const consistencyCheck = externalDataStore && typeof externalDataStore.checkDataConsistency === 'function'
      ? externalDataStore.checkDataConsistency() || []
      : []
    consistencyWarnings.value = Array.isArray(consistencyCheck) ? consistencyCheck : []
    if (Array.isArray(consistencyCheck) && consistencyCheck.length > 0) {
      console.warn('评估管理模块数据一致性检查发现问题:', consistencyCheck)
      Message.warning('检测到数据不一致，建议刷新数据')
    }

    // 加载任务列表
    await loadTasks()
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
.external-data-evaluation {
  padding: 32px;
  background: transparent;
  min-height: 100vh;
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
      
      .header-info {
        h2 {
          margin: 0 0 8px 0;
          font-size: 20px;
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
    
    .header-content:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }
}

.stats-cards {
  margin-bottom: 24px;
  
  .stat-card {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
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
  
  .stat-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.evaluation-tabs {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  :deep(.arco-tabs-content) {
    padding-top: 16px;
  }
}

.evaluation-tabs:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .external-data-evaluation {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
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