<template>
  <div class="external-data-lifecycle">
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
    
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>外部数据生命周期管理</h1>
          <p class="page-description">统一管理外部数据的档案、评估、预算和服务全生命周期</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-dropdown @select="handleQuickAction">
              <a-button type="primary">
                <template #icon><icon-plus /></template>
                快速操作
                <IconDown />
              </a-button>
              <template #content>
                <a-doption value="add-product">新增数据产品</a-doption>
                <a-doption value="batch-import">批量导入</a-doption>
                <a-doption value="quick-evaluation">快速评估</a-doption>
                <a-doption value="budget-application">预算申请</a-doption>
              </template>
            </a-dropdown>
            <a-button type="primary" @click="showServiceApply">
              <template #icon><icon-thunderbolt /></template>
              申请数据服务
            </a-button>
            <a-button type="outline" @click="showBudgetOverview">
            <template #icon><icon-safe /></template>
              预算概览
            </a-button>
            <a-button type="outline" @click="showEvaluationReport">
            <template #icon><icon-bar-chart /></template>
              评估报告
            </a-button>
            <a-button type="outline" @click="showDataRefresh">
              <template #icon><icon-refresh /></template>
              数据刷新
            </a-button>
          </a-space>
        </div>
        <div class="header-stats">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="数据产品总数" :value="stats.totalProducts" show-group-separator>
                <template #prefix>
                  <icon-storage />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="在线产品数" :value="stats.onlineProducts" show-group-separator>
                <template #prefix>
                  <icon-check-circle />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="本月预算使用率" :value="stats.budgetUsage" :precision="1" suffix="%">
                <template #prefix>
                  <icon-check-circle />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="活跃服务数" :value="stats.activeServices" show-group-separator>
                <template #prefix>
                  <icon-thunderbolt />
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <a-card class="main-content" :loading="loading">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <a-spin />
        <span class="loading-text">正在加载数据...</span>
      </div>
      <!-- 模块导航：允许在总数为 0 时也展示模块（显示 0 与空态） -->
      <a-row :gutter="[24, 24]" v-if="!loading">
        <!-- 外数档案模块 -->
        <a-col :span="12">
          <a-card class="module-card" hoverable @click="navigateTo('archive')">
            <template #title>
              <div class="module-header">
                <icon-folder class="module-icon" />
                <span>外数档案</span>
                <a-tag color="blue" size="small">功能中枢</a-tag>
              </div>
            </template>
            <div class="module-content">
              <p class="module-description">外部数据的生命周期档案管理，包含数据产品管理、接口详情、状态跟踪等功能</p>
              <div class="module-stats">
                <div class="stat-item">
                  <span class="stat-label">数据产品</span>
                  <span class="stat-value">{{ stats.archive.products }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">接口数量</span>
                  <span class="stat-value">{{ stats.archive.interfaces }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">供应商</span>
                  <span class="stat-value">{{ stats.archive.suppliers }}</span>
                </div>
              </div>
              <div class="module-actions">
                <a-button type="primary" size="small" @click.stop="navigateTo('archive')">
                  <template #icon><icon-right /></template>
                  进入管理
                </a-button>
                <a-button type="outline" size="small" @click.stop="showQuickAdd('archive')">
                  <template #icon><icon-plus /></template>
                  快速新增
                </a-button>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 外数评估模块 -->
        <a-col :span="12">
          <a-card class="module-card" hoverable @click="navigateTo('evaluation')">
            <template #title>
              <div class="module-header">
                <icon-check-circle class="module-icon" />
                <span>外数评估</span>
                <a-tag color="green" size="small">全生命周期</a-tag>
              </div>
            </template>
            <div class="module-content">
              <p class="module-description">外部数据的全生命周期评估，包含引入评估、监控评估、质量评估、价值评估和风险评估</p>
              <div class="module-stats">
                <div class="stat-item">
                  <span class="stat-label">待评估</span>
                  <span class="stat-value warning">{{ stats.evaluation.pending }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">评估中</span>
                  <span class="stat-value processing">{{ stats.evaluation.inProgress }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已完成</span>
                  <span class="stat-value success">{{ stats.evaluation.completed }}</span>
                </div>
              </div>
              <div class="module-actions">
                <a-button type="primary" size="small" @click.stop="navigateTo('evaluation')">
                  <template #icon><icon-right /></template>
                  进入评估
                </a-button>
                <a-button type="outline" size="small" @click.stop="showQuickEvaluation">
                  <template #icon><icon-play-circle /></template>
                  快速评估
                </a-button>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 预算管理模块 -->
        <a-col :span="12">
          <a-card class="module-card" hoverable @click="navigateTo('budget')">
            <template #title>
              <div class="module-header">
                <icon-check-circle class="module-icon" />
                <span>预算管理</span>
                <a-tag color="orange" size="small">成本控制</a-tag>
              </div>
            </template>
            <div class="module-content">
              <p class="module-description">外部数据的预算制定、执行监控、成本预警和结算管理，实现精细化成本控制</p>
              <div class="module-stats">
                <div class="stat-item">
                  <span class="stat-label">年度预算</span>
                  <span class="stat-value">{{ formatMoney(stats.budget.annualBudget) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已使用</span>
                  <span class="stat-value" :class="{ 'warning': stats.budget.usageRate > 80 }">
                    {{ formatMoney(stats.budget.usedBudget) }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">使用率</span>
                  <span class="stat-value" :class="{ 'warning': stats.budget.usageRate > 80 }">
                    {{ stats.budget.usageRate }}%
                  </span>
                </div>
              </div>
              <div class="module-actions">
                <a-button type="primary" size="small" @click.stop="navigateTo('budget')">
                  <template #icon><icon-right /></template>
                  预算管理
                </a-button>
                <a-button type="outline" size="small" @click.stop="showBudgetAlert">
                  <template #icon><icon-exclamation-circle /></template>
                  预警中心
                </a-button>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 外部数据服务模块 -->
        <a-col :span="12">
          <a-card class="module-card" hoverable @click="navigateTo('service')">
            <template #title>
              <div class="module-header">
                <icon-thunderbolt class="module-icon" />
                <span>数据服务</span>
                <a-tag color="purple" size="small">服务执行</a-tag>
              </div>
            </template>
            <div class="module-content">
              <p class="module-description">外部数据的服务申请、任务执行、结果查询和陪跑服务，提供一站式数据服务</p>
              <div class="module-stats">
                <div class="stat-item">
                  <span class="stat-label">服务总数</span>
                  <span class="stat-value">{{ stats.service.totalServices }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">运行中</span>
                  <span class="stat-value processing">{{ stats.service.running }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">成功率</span>
                  <span class="stat-value success">{{ stats.service.successRate }}%</span>
                </div>
              </div>
              <div class="module-actions">
                <a-button type="primary" size="small" @click.stop="navigateTo('service')">
                  <template #icon><icon-right /></template>
                  服务中心
                </a-button>
                <a-button type="outline" size="small" @click.stop="showServiceApply">
                  <template #icon><icon-plus /></template>
                  申请服务
                </a-button>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 快速操作区域 -->
      <div class="quick-actions">
        <h3>快速操作</h3>
        <a-row justify="center" :gutter="16">
          <a-col>
            <a-button type="primary" @click="showQuickAdd('data')">
              <template #icon><icon-plus /></template>
              新增数据产品
            </a-button>
          </a-col>
          <a-col>
            <a-button type="primary" @click="showServiceApply">
              <template #icon><icon-thunderbolt /></template>
              申请数据服务
            </a-button>
          </a-col>
          <a-col>
            <a-button type="outline" @click="showBudgetOverview">
              <template #icon><icon-check-circle /></template>
              预算概览
            </a-button>
          </a-col>
          <a-col>
            <a-button type="outline" @click="showEvaluationReport">
              <template #icon><icon-check-circle /></template>
              评估报告
            </a-button>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <!-- 快速新增弹窗 -->
    <a-modal v-model:visible="quickAddModal.visible" :title="quickAddModal.title" width="600px">
      <a-form :model="quickAddForm" layout="vertical">
        <a-form-item field="name" label="数据产品名称" required>
          <a-input v-model="quickAddForm.name" placeholder="请输入数据产品名称" />
        </a-form-item>
        <a-form-item field="type" label="数据类型" required>
          <a-select v-model="quickAddForm.type" placeholder="请选择数据类型">
            <a-option value="核验类">核验类</a-option>
            <a-option value="评分类">评分类</a-option>
            <a-option value="标签类">标签类</a-option>
            <a-option value="名单类">名单类</a-option>
            <a-option value="价格评估类">价格评估类</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="supplier" label="供应商" required>
          <a-input v-model="quickAddForm.supplier" placeholder="请输入供应商" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="quickAddForm.description" placeholder="请输入描述信息" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="quickAddModal.visible = false">取消</a-button>
          <a-button type="primary" @click="handleQuickAddSubmit">确定</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { getStatistics } from '@/mock/index.js'
import { useExternalDataStore } from '@/stores/external-data.js'
import { ROUTE_PATHS } from '@/router/constants.ts'
import axios from 'axios'
import Mock from 'mockjs'
import {
  IconStorage,
  IconCheckCircle,
  IconThunderbolt,
  IconFolder,
  IconRight,
  IconPlus,
  IconPlayCircle,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 统计数据
const stats = ref({
  totalProducts: 156,
  onlineProducts: 128,
  budgetUsage: 68.5,
  activeServices: 23,
  archive: {
    products: 156,
    interfaces: 312,
    suppliers: 28
  },
  evaluation: {
    pending: 12,
    inProgress: 8,
    completed: 136
  },
  budget: {
    annualBudget: 5000000,
    usedBudget: 3425000,
    usageRate: 68.5
  },
  service: {
    totalServices: 89,
    running: 15,
    successRate: 96.8
  }
})

// 使用统一状态管理
const externalDataStore = useExternalDataStore()
const loading = ref(false)
const error = ref(null)

// 错误处理函数
const handleErrorAction = (action) => {
  switch (action) {
    case 'refresh':
      refreshData()
      break
    case 'retry':
      loadExternalDataStats()
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

// 快速新增弹窗
const quickAddModal = ref({
  visible: false,
  title: '快速新增数据产品',
  type: 'archive'
})

const quickAddForm = reactive({
  name: '',
  type: '',
  supplier: '',
  description: ''
})

// 导航方法
const navigateTo = (module) => {
  const routes = {
    archive: ROUTE_PATHS.EXTERNAL_DATA.ARCHIVE,
    evaluation: ROUTE_PATHS.EXTERNAL_DATA.EVALUATION,
    budget: ROUTE_PATHS.EXTERNAL_DATA.BUDGET_MANAGEMENT,
    service: ROUTE_PATHS.EXTERNAL_DATA.SERVICE
  }
  
  if (routes[module]) {
    router.push(routes[module])
  }
}

// 快速操作方法
const showQuickAdd = (type) => {
  quickAddModal.value.type = type
  quickAddModal.value.title = type === 'archive' ? '快速新增数据产品' : '快速新增'
  quickAddModal.value.visible = true
}

const showQuickEvaluation = () => {
  router.push(ROUTE_PATHS.EXTERNAL_DATA.EVALUATION)
}

const showBudgetAlert = () => {
  router.push(`${ROUTE_PATHS.EXTERNAL_DATA.BUDGET_MANAGEMENT}?tab=alert`)
}

const showServiceApply = () => {
  router.push(ROUTE_PATHS.EXTERNAL_DATA.SERVICE)
}

const showBudgetOverview = () => {
  router.push(ROUTE_PATHS.EXTERNAL_DATA.BUDGET_MANAGEMENT)
}

const showEvaluationReport = () => {
  router.push(ROUTE_PATHS.EXTERNAL_DATA.EVALUATION);
};

const refreshData = async () => {
  try {
    loading.value = true
    error.value = null
    await loadExternalDataStats()
    loading.value = false
    
    // 显示刷新成功提示
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
    console.error('Failed to refresh data:', err)
  }
}

const showDataRefresh = () => {
  (async () => {
    try {
      loading.value = true
      Message.info('正在刷新数据...')
      await externalDataStore.forceSyncAllData()
      await loadStats()
    Message.success('数据刷新完成')
    // 刷新后重新检查数据一致性
    await checkDataConsistency()
  } catch (e) {
      console.error('数据刷新失败:', e)
      Message.error('数据刷新失败: ' + (e?.message || '未知错误'))
    } finally {
      loading.value = false
    }
  })()
};

// 检查数据一致性
const checkDataConsistency = async () => {
  try {
    const warnings = []
    
    // 检查档案数据一致性（安全别名）
    const products = Array.isArray(externalDataStore?.products?.value)
      ? externalDataStore.products.value
      : []
    if (products.length > 0) {
      const offlineProducts = products.filter(p => p.status === 'offline')
      const onlineProducts = products.filter(p => p.status === 'active')
      
      if (offlineProducts.length > onlineProducts.length * 2) {
        warnings.push({
          message: `离线产品数量(${offlineProducts.length})过多，可能影响服务稳定性`
        })
      }
    }
    
    // 检查预算数据一致性（安全别名）
    const budgets = Array.isArray(externalDataStore?.budgets?.value)
      ? externalDataStore.budgets.value
      : []
    if (budgets.length > 0) {
      const overBudgetItems = budgets.filter(b => (b.usedAmount / b.totalAmount) > 0.9)
      
      if (overBudgetItems.length > 0) {
        warnings.push({
          message: `${overBudgetItems.length}个预算项目使用率超过90%，需要关注`
        })
      }
    }
    
    // 检查服务数据一致性（安全别名）
    const services = Array.isArray(externalDataStore?.services?.value)
      ? externalDataStore.services.value
      : []
    if (services.length > 0) {
      const failedServices = services.filter(s => s.status === 'failed')
      
      if (failedServices.length > services.length * 0.1) {
        warnings.push({
          message: `失败服务占比过高(${((failedServices.length / services.length) * 100).toFixed(1)}%)，建议检查`
        })
      }
    }
    
    consistencyWarnings.value = warnings
  } catch (err) {
    console.warn('数据一致性检查失败:', err)
  }
}

// 快速操作处理
const handleQuickAction = (value) => {
  switch (value) {
    case 'add-product':
      showQuickAdd('data');
      break;
    case 'batch-import':
      Message.info('批量导入功能开发中...');
      break;
    case 'quick-evaluation':
  router.push(ROUTE_PATHS.EXTERNAL_DATA.EVALUATION);
      break;
  case 'budget-application':
    router.push(ROUTE_PATHS.EXTERNAL_DATA.BUDGET_MANAGEMENT);
      break;
    default:
      break;
  }
};

const handleQuickAddSubmit = () => {
  // 表单验证
  if (!quickAddForm.name || !quickAddForm.type) {
    error.value = {
      type: 'warning',
      title: '表单验证失败',
      message: '请填写必填字段：数据产品名称和数据类型',
      action: null
    }
    return
  }

  // 模拟提交成功
  Message.success({
    content: '数据产品创建成功！',
    duration: 3000,
    closable: true
  })
  quickAddModal.value.visible = false
  
  // 重置表单
  Object.assign(quickAddForm, {
    name: '',
    type: '',
    supplier: '',
    description: ''
  })
  
  // 刷新数据
  loadStats()
}

// 格式化方法
const formatMoney = (amount) => {
  return `¥${(amount / 10000).toFixed(1)}万`
}

// 加载外部数据
const loadExternalDataStats = async () => {
  try {
    loading.value = true
    error.value = null
    // 统一使用仓库的全量统计拉取方法，原方法不存在
    await externalDataStore.fetchAllStatistics()
    loading.value = false
  } catch (err) {
    loading.value = false
    error.value = {
      type: 'error',
      title: '数据加载失败',
      message: err.message || '无法加载外部数据统计信息，请检查网络连接或稍后重试',
      action: 'retry',
      actionText: '重新加载'
    }
    console.error('Failed to load external data stats:', err)
  }
}

// 模拟数据加载
const loadStats = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 优先使用统一状态管理（安全判空）
    const productsSafe = Array.isArray(externalDataStore?.products?.value)
      ? externalDataStore.products.value
      : []
    const budgetsSafe = Array.isArray(externalDataStore?.budgets?.value)
      ? externalDataStore.budgets.value
      : []
    const servicesSafe = Array.isArray(externalDataStore?.services?.value)
      ? externalDataStore.services.value
      : []

    if (productsSafe.length === 0) {
      await externalDataStore.fetchProducts()
    }
    // 补充预算与服务数据
    if (budgetsSafe.length === 0) {
      await externalDataStore.fetchBudgets()
    }
    if (servicesSafe.length === 0) {
      await externalDataStore.fetchServiceApplications()
    }

    const products = Array.isArray(externalDataStore?.products?.value)
      ? externalDataStore.products.value
      : []
    const budgets = Array.isArray(externalDataStore?.budgets?.value)
      ? externalDataStore.budgets.value
      : []
    const services = Array.isArray(externalDataStore?.services?.value)
      ? externalDataStore.services.value
      : []

    if (products.length > 0) {

      // 统计数据计算
      stats.value.totalProducts = products.length
      stats.value.onlineProducts = products.filter(p => p.status === 'active').length
      const totalBudgetAmount = budgets.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      const usedBudgetAmount = budgets.reduce((sum, b) => sum + (b.usedAmount || 0), 0)
      stats.value.budgetUsage = totalBudgetAmount > 0 ? Number(((usedBudgetAmount / totalBudgetAmount) * 100).toFixed(1)) : 0
      stats.value.activeServices = services.filter(s => s.status === 'running').length || 23

      stats.value.archive.products = products.length
      stats.value.archive.interfaces = products.length * 2
      stats.value.archive.suppliers = Math.ceil(products.length / 5)
      stats.value.evaluation.pending = products.filter(p => p.status === 'maintenance').length
      stats.value.evaluation.inProgress = Math.min(8, products.length)
      stats.value.evaluation.completed = Math.max(0, products.length - stats.value.evaluation.pending - stats.value.evaluation.inProgress)
      stats.value.service.totalServices = services.length || 89
      stats.value.service.running = (services.filter(s => s.status === 'running').length) || 15
      stats.value.service.successRate = services.length
        ? Number((services.filter(s => s.status === 'success').length / services.length * 100).toFixed(1))
        : 96.8
    } else {
      // 尝试从API获取数据
      const [statsResponse, productsResponse] = await Promise.all([
        axios.get('/api/external-data/lifecycle/stats'),
        axios.get('/api/external-data/products?page=1&pageSize=10')
      ])
      
      // 安全提取响应数据，支持后端结构差异与异常 HTML 返回
      const statsRoot = (statsResponse && typeof statsResponse.data === 'object') ? statsResponse.data : {}
      const productsRoot = (productsResponse && typeof productsResponse.data === 'object') ? productsResponse.data : {}
      const statsData = (statsRoot && typeof statsRoot.data === 'object') ? statsRoot.data : statsRoot
      const productsData = (productsRoot && typeof productsRoot.data === 'object') ? productsRoot.data : productsRoot
      const productsList = Array.isArray(productsData?.list) ? productsData.list : []
      const productsTotal = Number(productsData?.total || productsList.length || 0)
      
      // 更新统计数据
      stats.value = {
        totalProducts: productsTotal,
        onlineProducts: Number(statsData?.onlineProducts || 0),
        budgetUsage: Number(statsData?.monthlyBudgetUsage || 0),
        activeServices: Number(statsData?.activeServices || 0),
        archive: {
          products: productsTotal,
          interfaces: productsTotal * 2,
          suppliers: Math.ceil(productsTotal / 5)
        },
        evaluation: {
          pending: Mock?.Random?.integer(5, 15) ?? 10,
          inProgress: Mock?.Random?.integer(3, 10) ?? 6,
          completed: Math.max(0, productsTotal - (Mock?.Random?.integer(8, 25) ?? 12))
        },
        budget: {
          annualBudget: Number(statsData?.totalBudget || 0),
          usedBudget: Number(statsData?.usedBudget || 0),
          usageRate: (Number(statsData?.totalBudget || 0) > 0)
            ? ((Number(statsData?.usedBudget || 0) / Number(statsData?.totalBudget || 0) * 100).toFixed(1))
            : 0
        },
        service: {
          totalServices: Mock?.Random?.integer(60, 100) ?? 80,
          running: Number(statsData?.activeServices || 0),
          successRate: Mock?.Random?.float(94, 99, 1, 1) ?? 96.8
        }
      }
      
      // 同步到状态管理
      externalDataStore.products.value = productsList
    }
  } catch (err) {
    console.error('加载统计数据失败:', err)
    error.value = err.message
    Message.error('加载统计数据失败')
    
    // 使用模拟数据作为备选
    const mockStats = getStatistics('externalDataArchive') || {}
    const total = Number(mockStats?.totalProducts || mockStats?.total || 156)
    const active = Number(mockStats?.activeProducts || mockStats?.onlineProducts || 128)
    if (mockStats) {
      stats.value.totalProducts = total
      stats.value.onlineProducts = active
      stats.value.budgetUsage = 68.5
      stats.value.activeServices = 23
      stats.value.archive.products = total
      stats.value.archive.interfaces = total * 2
      stats.value.archive.suppliers = Math.ceil(total / 5)
      stats.value.evaluation.pending = Number(mockStats?.maintenanceProducts || 18)
      stats.value.evaluation.inProgress = 8
      stats.value.evaluation.completed = Math.max(0, total - 12)
      stats.value.service.totalServices = 89
      stats.value.service.running = 15
      stats.value.service.successRate = 96.8
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
  checkDataConsistency()
})
</script>

<style scoped lang="less">
.external-data-lifecycle {
  padding: 24px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
}

.error-message {
  margin-bottom: 16px;
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
    background: linear-gradient(135deg, #165dff 0%, #0e42d2 100%);
    border-radius: 12px;
    padding: 32px;
    color: white;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }
    
    .header-info,
    .header-actions,
    .header-stats {
      position: relative;
      z-index: 1;
    }
    
    .header-info {
      margin-bottom: 24px;
      
      h1 {
        font-size: 32px;
        margin-bottom: 8px;
        font-weight: 600;
      }
    }
    
    .header-actions {
      margin-bottom: 24px;
      text-align: right;
      
      .arco-btn {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
    
    .page-description {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }
  
  .header-stats {
    :deep(.arco-statistic) {
      .arco-statistic-title {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
      }
      
      .arco-statistic-content {
        color: white;
        font-size: 24px;
        font-weight: 600;
      }
      
      .arco-statistic-prefix {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.main-content {
  border-radius: 12px;
  overflow: hidden;
  
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
  
  .module-card {
    height: 280px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-neutral-3);
      padding: 16px 20px;
      
      .module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .module-icon {
          font-size: 20px;
          color: var(--color-primary-6);
          transition: transform 0.3s ease;
        }
        
        span {
          font-size: 16px;
          font-weight: 600;
        }
        
        &:hover .module-icon {
          transform: scale(1.1);
        }
      }
    }
    
    .module-content {
      padding: 16px 0;
      
      .module-description {
        color: var(--color-text-2);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
        min-height: 44px;
      }
      
      .module-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 12px;
        background-color: var(--color-fill-1);
        border-radius: 6px;
        
        .stat-item {
          text-align: center;
          
          .stat-label {
            display: block;
            font-size: 12px;
            color: var(--color-text-3);
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text-1);
            
            &.warning {
              color: var(--color-warning-6);
            }
            
            &.processing {
              color: var(--color-primary-6);
            }
            
            &.success {
              color: var(--color-success-6);
            }
          }
        }
      }
      
      .module-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        
        .arco-btn {
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
  
  .quick-actions {
    margin-top: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #f2f3f5 0%, #e8eafb 100%);
    border-radius: 12px;
    text-align: center;
    border: 1px solid var(--color-neutral-3);
    
    h3 {
      margin-bottom: 16px;
      color: var(--color-text-1);
      font-size: 18px;
      font-weight: 600;
    }
    
    .arco-btn {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

@media (max-width: 768px) {
  .external-data-lifecycle {
    padding: 16px;
  }
  
  .page-header .header-content {
    padding: 24px 16px;
    
    .header-info h1 {
      font-size: 24px;
    }
  }
  
  .module-card {
    height: auto !important;
    
    .module-stats {
      flex-direction: column;
      gap: 8px;
    }
    
    .module-actions {
      flex-direction: column;
    }
  }
}
</style>