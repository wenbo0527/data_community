<template>
  <div class="budget-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>预算管理</h2>
          <p class="page-description">外部数据的预算制定、执行监控和成本分析，实现预算全生命周期管理</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-dropdown @select="handleQuickAction">
              <a-button type="primary">
                <template #icon><IconPlus /></template>
                快速操作
                <IconDown />
              </a-button>
              <template #content>
                <a-doption value="create-budget">新建预算</a-doption>
                <a-doption value="budget-adjustment">预算调整</a-doption>
                <a-doption value="batch-approval">批量审批</a-doption>
                <a-doption value="budget-analysis">预算分析</a-doption>
              </template>
            </a-dropdown>
            <a-button type="outline" @click="handleRefresh">
              <template #icon><IconRefresh /></template>
              刷新
            </a-button>
            <a-button type="outline" @click="showUploadModal = true">
              <template #icon><IconUpload /></template>
              上传预算
            </a-button>
            <a-button type="outline" @click="exportBudget">
              <template #icon><IconDownload /></template>
              导出预算
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
    <div v-if="!loading && !budgets.length" class="empty-state">
      <div class="empty-icon-wrapper">
        <IconSafe class="empty-icon" />
      </div>
      <div class="empty-title">暂无预算数据</div>
      <div class="empty-description">您可以通过以下方式创建预算计划</div>
      <div class="empty-actions">
        <a-space>
          <a-button type="primary" @click="showBudgetModal = true">
            <template #icon><IconPlus /></template>
            创建预算
          </a-button>
          <a-button type="outline" @click="showUploadModal = true">
            <template #icon><IconUpload /></template>
            上传预算
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 预算总览统计 -->
    <a-row :gutter="16" class="stats-cards" v-if="!loading && budgets.length">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconPlusCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(stats.totalBudget) }}</div>
              <div class="stat-label">总预算</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconMinusCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(stats.usedBudget) }}</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <IconPlusCircle />
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(stats.remainingBudget) }}</div>
              <div class="stat-label">剩余预算</div>
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
              <div class="stat-value">{{ stats.warningCount }}</div>
              <div class="stat-label">预警数量</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 预算管理标签页 -->
    <a-card class="budget-tabs" v-if="!loading && budgets.length">
      <a-tabs v-model:active-key="activeTab" type="rounded">
        <a-tab-pane key="overview" title="预算总览">
          <budget-overview />
        </a-tab-pane>
        <a-tab-pane key="formulation" title="预算制定">
          <budget-formulation />
        </a-tab-pane>
        <a-tab-pane key="monitoring" title="预算监控">
          <budget-monitoring />
        </a-tab-pane>
        <a-tab-pane key="contract" title="合同管理">
          <contract-management />
        </a-tab-pane>
        <a-tab-pane key="settlement" title="结算管理">
          <settlement-management />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新建预算弹窗 -->
    <a-modal
      v-model:visible="showBudgetModal"
      title="新建预算"
      width="800px"
      @ok="handleBudgetSubmit"
      @cancel="handleBudgetCancel"
    >
      <template #footer>
        <a-button @click="handleBudgetCancel">取消</a-button>
        <a-button type="outline" @click="handleBudgetSave">保存草稿</a-button>
        <a-button type="primary" @click="handleBudgetSubmit">提交审批</a-button>
      </template>
      <a-form :model="budgetForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="businessType" label="业务类型" required>
              <a-select v-model="budgetForm.businessType" placeholder="请选择业务类型">
                <a-option value="融资担保">融资担保</a-option>
                <a-option value="助贷">助贷</a-option>
                <a-option value="直贷">直贷</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="platformProduct" label="平台产品" required>
              <a-select v-model="budgetForm.platformProduct" placeholder="请选择平台产品">
                <a-option value="美团">美团</a-option>
                <a-option value="字节">字节</a-option>
                <a-option value="京东">京东</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="budgetYear" label="预算年度" required>
              <a-date-picker 
                v-model="budgetForm.budgetYear" 
                format="YYYY"
                style="width: 100%"
                placeholder="请选择预算年度"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="budgetAmount" label="预算金额(万元)" required>
              <a-input-number
                v-model="budgetForm.budgetAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入预算金额"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="targetLoanBalance" label="目标贷余(万元)" required>
          <a-input-number
            v-model="budgetForm.targetLoanBalance"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入目标贷余"
          />
        </a-form-item>
        
        <a-form-item field="estimatedLoanAmount" label="预估放款(万元)" required>
          <a-input-number
            v-model="budgetForm.estimatedLoanAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入预估放款金额"
          />
        </a-form-item>
        
        <a-form-item field="estimatedCost" label="预估费用(万元)" required>
          <a-input-number
            v-model="budgetForm.estimatedCost"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入预估费用"
          />
        </a-form-item>
        
        <a-form-item field="annualDataCostRate" label="年化数据成本率(%)" required>
          <a-input-number
            v-model="budgetForm.annualDataCostRate"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
            placeholder="请输入年化数据成本率"
          />
        </a-form-item>

        <a-form-item field="annualDataCost" label="年化数据成本(万元)" required>
          <a-input-number
            v-model="budgetForm.annualDataCost"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入年化数据成本"
          />
        </a-form-item>
        
        <a-form-item field="riskFreeReturn" label="无风险收益(%)" required>
          <a-input-number
            v-model="budgetForm.riskFreeReturn"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
            placeholder="请输入无风险收益率"
          />
        </a-form-item>
        
        <a-form-item field="budgetGranularity" label="预算粒度" required>
          <a-radio-group v-model="budgetForm.budgetGranularity">
            <a-radio value="monthly">月度</a-radio>
            <a-radio value="quarterly">季度</a-radio>
            <a-radio value="yearly">年度</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item field="correspondingTime" label="对应时间" required>
          <a-date-picker 
            v-model="budgetForm.correspondingTime"
            format="YYYY-MM-DD"
            style="width: 100%"
            placeholder="请选择对应时间"
          />
        </a-form-item>
        
        <a-form-item field="remarks" label="备注说明">
          <a-textarea
            v-model="budgetForm.remarks"
            placeholder="请输入备注说明"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预算调整弹窗 -->
    <a-modal
      v-model:visible="showAdjustmentModal"
      title="预算调整"
      width="700px"
      @ok="handleAdjustmentSubmit"
      @cancel="handleAdjustmentCancel"
    >
      <a-form :model="adjustmentForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="budgetItem" label="预算项目" required>
              <a-select v-model="adjustmentForm.budgetItem" placeholder="请选择预算项目">
                <a-option value="credit">信贷业务预算</a-option>
                <a-option value="risk">风控业务预算</a-option>
                <a-option value="marketing">营销业务预算</a-option>
                <a-option value="operation">运营业务预算</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="adjustmentType" label="调整类型" required>
              <a-select v-model="adjustmentForm.adjustmentType" placeholder="请选择调整类型">
                <a-option value="increase">增加预算</a-option>
                <a-option value="decrease">减少预算</a-option>
                <a-option value="transfer">预算转移</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="originalAmount" label="原预算金额(万元)" required>
              <a-input-number
                v-model="adjustmentForm.originalAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="原预算金额"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="adjustmentAmount" label="调整金额(万元)" required>
              <a-input-number
                v-model="adjustmentForm.adjustmentAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入调整金额"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="reason" label="调整原因" required>
          <a-textarea
            v-model="adjustmentForm.reason"
            placeholder="请输入调整原因"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item field="attachment" label="附件上传">
          <a-upload
            :file-list="adjustmentForm.attachment"
            :limit="5"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            @change="handleAdjustmentFileChange"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 上传预算弹窗 -->
    <a-modal
      v-model:visible="showUploadModal"
      title="上传预算"
      width="600px"
      @ok="handleUploadSubmit"
      @cancel="handleUploadCancel"
    >
      <a-form :model="uploadForm" layout="vertical">
        <a-form-item label="上传文件" required>
          <a-upload
            :file-list="uploadFileList"
            :limit="1"
            @change="handleUploadFileChange"
            accept=".xlsx,.xls,.csv"
          >
            <template #upload-button>
              <a-button type="outline">
                <template #icon><IconUpload /></template>
                选择文件
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
        <a-form-item label="模板下载">
          <a-button type="text" @click="downloadTemplate">
            <template #icon><IconDownload /></template>
            下载预算模板
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconUpload,
  IconDownload,
  IconRefresh,
  IconMinusCircle,
  IconPlusCircle,
  IconExclamationCircle,
  IconDown,
  IconExclamationCircleFill,
  IconSafe
} from '@arco-design/web-vue/es/icon'

// 引入统一Mock数据
import { getMockData, getStatistics } from '@/mock/index.js'
import { useExternalDataStore } from '@/stores/external-data.js'
import { ROUTE_PATHS } from '@/router/constants.ts'

// 引入预算子组件
import BudgetOverview from './components/BudgetOverview.vue'
import BudgetFormulation from './components/BudgetFormulation.vue'
import BudgetMonitoring from './components/BudgetMonitoring.vue'
import ContractManagement from './components/ContractManagement.vue'
import SettlementManagement from './components/SettlementManagement.vue'

// 统计数据
const stats = reactive({
  totalBudget: 0,
  usedBudget: 0,
  remainingBudget: 0,
  warningCount: 0
})

// 使用统一状态管理
const externalDataStore = useExternalDataStore()
const loading = ref(false)
const error = ref(null)

// 预算列表（从仓库映射为数组，避免模板与脚本读取 undefined）
const budgets = computed(() => externalDataStore.budgets?.value || [])

// 错误处理函数
const handleErrorAction = (action) => {
  switch (action) {
    case 'refresh':
      refreshData()
      break
    case 'retry':
      loadBudgets()
      break
    case 'navigate':
      if (error.value?.route) {
        navigateTo(error.value.route)
      }
      break
    default:
      error.value = null
  }
}
const consistencyWarnings = ref([])

// 当前标签页
const activeTab = ref('overview')

// 弹窗状态
const showBudgetModal = ref(false)
const showUploadModal = ref(false)
const showAdjustmentModal = ref(false)

// 预算调整表单，保证各字段有默认值，避免渲染期读取 undefined
const adjustmentForm = reactive({
  budgetItem: '',
  adjustmentType: '',
  originalAmount: 0,
  adjustmentAmount: 0,
  reason: '',
  attachment: []
})

// 重置预算调整表单，确保每次打开弹窗都有完整默认值
const resetAdjustmentForm = () => {
  Object.assign(adjustmentForm, {
    budgetItem: '',
    adjustmentType: '',
    originalAmount: 0,
    adjustmentAmount: 0,
    reason: '',
    attachment: []
  })
}

// 预算表单
const budgetForm = reactive({
  businessType: '',
  platformProduct: '',
  budgetYear: '',
  budgetAmount: 0,
  targetLoanBalance: 0,
  estimatedLoanAmount: 0,
  estimatedCost: 0,
  annualDataCostRate: 0,
  annualDataCost: 0,
  riskFreeReturn: 0,
  budgetGranularity: 'monthly',
  correspondingTime: '',
  remarks: ''
})

// 上传表单
const uploadForm = reactive({})
const uploadFileList = ref([])

// 格式化金额
const formatAmount = (amount) => {
  return (amount / 10000).toFixed(2)
}

// 提交预算
const handleBudgetSubmit = async () => {
  // 表单验证
  if (!budgetForm.businessType || !budgetForm.platformProduct || !budgetForm.budgetYear || !budgetForm.budgetAmount) {
    Message.warning('请填写必填字段：业务类型、平台产品、预算年度和预算金额')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // 使用状态管理创建预算
    const budgetData = {
      businessType: budgetForm.businessType,
      platformProduct: budgetForm.platformProduct,
      budgetYear: budgetForm.budgetYear,
      budgetAmount: budgetForm.budgetAmount,
      targetLoanBalance: budgetForm.targetLoanBalance,
      estimatedLoanAmount: budgetForm.estimatedLoanAmount,
      estimatedCost: budgetForm.estimatedCost,
      annualDataCostRate: budgetForm.annualDataCostRate,
      annualDataCost: budgetForm.annualDataCost,
      riskFreeReturn: budgetForm.riskFreeReturn,
      budgetGranularity: budgetForm.budgetGranularity,
      correspondingTime: budgetForm.correspondingTime,
      remarks: budgetForm.remarks,
      createTime: new Date().toISOString()
    }
    
    await externalDataStore.createBudget(budgetData)
    
    Message.success({
      content: '预算创建成功！',
      duration: 3000,
      closable: true
    })
    showBudgetModal.value = false
    
    // 更新统计
    stats.totalBudget += budgetForm.budgetAmount * 10000 // 转换为元
    
    // 重置表单
    Object.assign(budgetForm, {
      businessType: '',
      platformProduct: '',
      budgetYear: '',
      budgetAmount: 0,
      targetLoanBalance: 0,
      estimatedLoanAmount: 0,
      estimatedCost: 0,
      annualDataCostRate: 0,
      annualDataCost: 0,
      riskFreeReturn: 0,
      budgetGranularity: 'monthly',
      correspondingTime: '',
      remarks: ''
    })
  } catch (err) {
    console.error('创建预算失败:', err)
    error.value = err.message
    Message.error({
      content: '预算创建失败：' + (err.message || '未知错误'),
      duration: 3000,
      closable: true
    })
  } finally {
    loading.value = false
  }
}

const handleBudgetCancel = () => {
  showBudgetModal.value = false
}

// 保存预算草稿，解决模板中未定义方法引用
const handleBudgetSave = async () => {
  try {
    // 基础校验，至少填写业务类型和预算年度
    if (!budgetForm.businessType || !budgetForm.budgetYear) {
      Message.warning('请至少填写业务类型与预算年度以保存草稿')
      return
    }
    loading.value = true
    error.value = null
    // 将当前表单作为草稿写入统一状态管理（可扩展为单独草稿存储）
    await externalDataStore.createBudget({
      ...budgetForm,
      isDraft: true,
      createTime: new Date().toISOString()
    })
    Message.success('草稿已保存')
    showBudgetModal.value = false
  } catch (err) {
    console.error('保存草稿失败:', err)
    Message.error('保存草稿失败：' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 上传处理
const handleUploadFileChange = (fileList) => {
  uploadFileList.value = fileList
}

const handleUploadSubmit = () => {
  if (uploadFileList.value.length === 0) {
    Message.error('请先上传文件')
    return
  }
  Message.success('预算数据上传成功')
  showUploadModal.value = false
}

const handleUploadCancel = () => {
  showUploadModal.value = false
  uploadFileList.value = []
}

const downloadTemplate = () => {
  Message.success('预算模板下载成功')
}

const exportBudget = () => {
  Message.success('预算数据导出成功')
}

// 预算调整：附件选择
const handleAdjustmentFileChange = (fileList) => {
  adjustmentForm.attachment = fileList || []
}

// 预算调整：提交
const handleAdjustmentSubmit = async () => {
  // 基础校验，避免读取 undefined 字段
  if (!adjustmentForm.budgetItem) {
    Message.warning('请选择预算项目')
    return
  }
  if (!adjustmentForm.adjustmentType) {
    Message.warning('请选择调整类型')
    return
  }
  if (!adjustmentForm.adjustmentAmount || adjustmentForm.adjustmentAmount <= 0) {
    Message.warning('请输入有效的调整金额')
    return
  }

  try {
    loading.value = true
    error.value = null
    // 这里可接入实际的调整提交接口；当前先提示成功并关闭弹窗
    Message.success('预算调整提交成功')
    showAdjustmentModal.value = false
    // 提交后可刷新预算数据
    await loadBudgets()
  } catch (err) {
    console.error('预算调整提交失败:', err)
    error.value = err.message
    Message.error('预算调整提交失败: ' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 预算调整：取消
const handleAdjustmentCancel = () => {
  showAdjustmentModal.value = false
  resetAdjustmentForm()
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  error.value = null
  Message.info('正在刷新预算数据...')
  try {
    await externalDataStore.forceSyncAllData()
    await loadBudgets()
    // 统一使用仓库统计接口
    await externalDataStore.fetchStatistics('budgetManagement')
    const budgetStats = externalDataStore.statistics.budgetManagement || {}
    stats.totalBudget = budgetStats.totalBudget || stats.totalBudget
    stats.usedBudget = budgetStats.usedBudget || stats.usedBudget
    stats.remainingBudget = budgetStats.remainingBudget || stats.remainingBudget
    stats.warningCount = budgetStats.warningCount || stats.warningCount
    // 一致性检查
    const consistencyCheck = externalDataStore.checkDataConsistency()
    consistencyWarnings.value = consistencyCheck
    Message.success('预算数据刷新完成')
  } catch (err) {
    console.error('预算数据刷新失败:', err)
    error.value = err.message
    Message.error('预算数据刷新失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

// 检查数据一致性
const checkDataConsistency = () => {
  try {
    const warnings = []
    
    // 检查预算数据一致性
    if (budgets.value && budgets.value.length > 0) {
      const overBudgetItems = budgets.value.filter(b => (b.usedAmount / b.totalAmount) > 0.9)
      const negativeBudgets = budgets.value.filter(b => b.remainingAmount < 0)
      
      if (overBudgetItems.length > 0) {
        warnings.push({
          message: `${overBudgetItems.length}个预算项目使用率超过90%，需要关注`
        })
      }
      
      if (negativeBudgets.length > 0) {
        warnings.push({
          message: `${negativeBudgets.length}个预算项目出现负余额`
        })
      }
    }
    
    // 检查统计数据一致性
    if (stats.totalBudget > 0 && stats.usedBudget > stats.totalBudget) {
      warnings.push({
        message: '已使用预算超过总预算，数据异常'
      })
    }
    
    consistencyWarnings.value = warnings
  } catch (err) {
    console.warn('数据一致性检查失败:', err)
  }
}

// 快速操作处理
// 加载预算数据
const loadBudgets = async () => {
  try {
    loading.value = true
    error.value = null
    await externalDataStore.fetchBudgets()
    loading.value = false
    
    // 显示加载成功提示
    if (budgets.value && budgets.value.length > 0) {
      Message.success({
        content: '预算数据加载成功！',
        duration: 1500,
        closable: true
      })
    }
  } catch (err) {
    loading.value = false
    error.value = {
      type: 'error',
      title: '预算数据加载失败',
      message: err.message || '无法加载预算数据，请检查网络连接或稍后重试',
      action: 'retry',
      actionText: '重新加载'
    }
    console.error('加载预算数据失败:', err)
    Message.error('加载预算数据失败: ' + err.message)
  }
}

const handleQuickAction = (value) => {
  switch (value) {
    case 'create-budget':
      showBudgetModal.value = true
      break
    case 'budget-adjustment':
      resetAdjustmentForm()
      showAdjustmentModal.value = true
      break
    case 'batch-approval':
      Message.info('批量审批功能开发中...')
      break
    case 'budget-analysis':
      Message.info('预算分析功能开发中...')
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
    // 初始化加载预算列表，确保页面显示非空态内容
    await loadBudgets()

    // 优先使用状态管理中的统计数据
    if (externalDataStore.statistics.budgetManagement) {
      const budgetStats = externalDataStore.statistics.budgetManagement
      stats.totalBudget = budgetStats.totalBudget || 28500000
      stats.usedBudget = budgetStats.usedBudget || 18200000
      stats.remainingBudget = budgetStats.remainingBudget || 10300000
      stats.warningCount = budgetStats.warningCount || 3
    } else {
      // 尝试从API获取统计数据
      await externalDataStore.fetchStatistics('budgetManagement')
      const budgetStats = externalDataStore.statistics.budgetManagement
      if (budgetStats) {
        stats.totalBudget = budgetStats.totalBudget || 28500000
        stats.usedBudget = budgetStats.usedBudget || 18200000
        stats.remainingBudget = budgetStats.remainingBudget || 10300000
        stats.warningCount = budgetStats.warningCount || 3
      } else {
        // 使用模拟数据作为备选
        const mockStats = getStatistics('budgetManagement')
        if (mockStats) {
          stats.totalBudget = mockStats.totalBudget || 28500000
          stats.usedBudget = mockStats.usedBudget || 18200000
          stats.remainingBudget = mockStats.remainingBudget || 10300000
          stats.warningCount = mockStats.warningCount || 3
        }
      }
    }
    
    // 检查数据一致性
    checkDataConsistency()
    if (consistencyWarnings.value.length > 0) {
      console.warn('预算管理模块数据一致性检查发现问题:', consistencyWarnings.value)
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
.budget-management {
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
    
    .header-info {
      h2 {
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

.stats-cards {
  margin-bottom: 24px;
  
  .stat-card {
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.85);
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
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-1);
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--color-text-3);
        }
      }
    }
  }
}

.budget-tabs {
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  :deep(.arco-tabs-content) {
    padding-top: 16px;
  }
}

@media (max-width: 768px) {
  .budget-management {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-cards {
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