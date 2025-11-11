<template>
  <div class="budget-overview-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <a-row justify="space-between" align="center">
        <a-col>
          <h1 class="page-title">预算总览</h1>
        </a-col>
        <a-col>
          <a-space>
            <a-button type="primary" @click="handleCreateBudget">
              <template #icon>
                <icon-plus />
              </template>
              新建预算
            </a-button>
            <a-button @click="handleExportData">
              <template #icon>
                <icon-download />
              </template>
              导出数据
            </a-button>
            <a-button @click="handleRefresh">
              <template #icon>
                <icon-refresh />
              </template>
              刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索筛选组件 -->
    <BudgetSearchFilter
      v-model="searchParams"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 统计卡片区域 -->
    <div class="statistics-section">
      <a-row :gutter="16">
        <a-col :span="12">
          <BudgetStatisticsCards
            :loading="statsLoading"
            :statistics="budgetStatistics"
          />
        </a-col>
        <a-col :span="12">
          <PurchaseProjectStatisticsCards
            :loading="statsLoading"
            :statistics="projectStatistics"
          />
        </a-col>
      </a-row>
    </div>

    <!-- 已按需求移除预算-项目关联关系图 -->

    <!-- 核销操作面板（已移除） -->

    <!-- 预算列表和采购项目列表 -->
    <div class="tables-section">
      <a-tabs v-model:active-key="activeTab" type="card">
        <a-tab-pane key="budget" title="预算列表">
          <BudgetList
            ref="budgetListRef"
            :search-params="searchParams"
            :loading="budgetLoading"
            @loading-change="handleBudgetLoadingChange"
          />
        </a-tab-pane>
        <a-tab-pane key="project" title="采购项目列表">
          <PurchaseProjectList
            ref="projectListRef"
            :search-params="searchParams"
            :loading="projectLoading"
            @loading-change="handleProjectLoadingChange"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconDownload, 
  IconRefresh 
} from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import BudgetSearchFilter from './components/BudgetSearchFilter.vue'
import BudgetStatisticsCards from './components/BudgetStatisticsCards.vue'
import PurchaseProjectStatisticsCards from './components/PurchaseProjectStatisticsCards.vue'
import BudgetList from './components/BudgetList.vue'
import PurchaseProjectList from './components/PurchaseProjectList.vue'
import { budgetApiService } from '@/api/budget'

// 路由
const router = useRouter()

// 响应式数据
const searchParams = ref({})
const statsLoading = ref(false)
const budgetLoading = ref(false)
const projectLoading = ref(false)
const activeTab = ref('budget')

// 统计数据
const budgetStatistics = reactive({
  totalBudget: 0,
  usedAmount: 0,
  remainingAmount: 0,
  executionRate: 0
})

const projectStatistics = reactive({
  totalProjects: 0,
  executingProjects: 0,
  completedProjects: 0,
  totalAmount: 0,
  executingAmount: 0,
  completedAmount: 0
})


// 组件引用
const budgetListRef = ref()
const projectListRef = ref()

// 生命周期
onMounted(async () => {
  await loadAllData()
})

// 方法
const loadAllData = async () => {
  try {
    // 并行加载所有数据
    await Promise.all([
      loadStatistics(),
      loadBudgetList(),
      loadProjectList()
    ])
  } catch (error) {
    Message.error('加载数据失败')
    console.error('加载数据失败:', error)
  }
}

const loadStatistics = async () => {
  try {
    statsLoading.value = true
    
    // 获取预算统计
    const budgetStats = await budgetApiService.getBudgetStatistics()
    Object.assign(budgetStatistics, budgetStats)
    
    // 获取项目统计
    const projectStats = await budgetApiService.getProjectStatistics()
    Object.assign(projectStatistics, projectStats)
    
  } catch (error) {
    Message.error('加载统计数据失败')
    console.error('加载统计数据失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 关系图相关逻辑已移除

const loadBudgetList = async () => {
  try {
    budgetLoading.value = true
    if (budgetListRef.value) {
      await budgetListRef.value.loadData()
    }
  } catch (error) {
    Message.error('加载预算列表失败')
    console.error('加载预算列表失败:', error)
  } finally {
    budgetLoading.value = false
  }
}

const loadProjectList = async () => {
  try {
    projectLoading.value = true
    if (projectListRef.value) {
      await projectListRef.value.loadData()
    }
  } catch (error) {
    Message.error('加载项目列表失败')
    console.error('加载项目列表失败:', error)
  } finally {
    projectLoading.value = false
  }
}

// 事件处理
const handleSearch = (params: any) => {
  searchParams.value = { ...params }
  // 重新加载数据
  loadBudgetList()
  loadProjectList()
}

const handleReset = () => {
  searchParams.value = {}
  loadBudgetList()
  loadProjectList()
}

const handleCreateBudget = () => {
  router.push('/budget/create')
}

const handleExportData = async () => {
  try {
    await budgetApiService.exportBudgetData(searchParams.value)
    Message.success('数据导出成功')
  } catch (error) {
    Message.error('数据导出失败')
    console.error('数据导出失败:', error)
  }
}

const handleRefresh = async () => {
  Message.info('正在刷新数据...')
  await loadAllData()
  Message.success('数据刷新成功')
}

// 已移除核销面板相关逻辑

const handleBudgetLoadingChange = (loading: boolean) => {
  budgetLoading.value = loading
}

const handleProjectLoadingChange = (loading: boolean) => {
  projectLoading.value = loading
}
</script>

<style scoped lang="less">
.budget-overview-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  
  .page-header {
    margin-bottom: 24px;
    padding: 20px 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1d2129;
    }
  }
  
  .statistics-section {
    margin-bottom: 24px;
  }
  
  .tables-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    :deep(.arco-tabs-content) {
      padding: 0;
    }
    
    :deep(.arco-tabs-tab) {
      padding: 12px 24px;
    }
  }
}
</style>