<template>
  <div class="budget-center">
    <div class="page-header">
      <h2>预算管理中心</h2>
      <p class="page-description">统一管理预算创建、编辑、核销与关系分析</p>
    </div>

    <a-tabs type="card" v-model:active-key="activeTab">
      <a-tab-pane key="overview" title="预算总览">
        <a-card><BudgetOverview /></a-card>
      </a-tab-pane>
      <a-tab-pane key="list" title="预算列表">
        <a-card>
          <div class="toolbar">
            <a-space>
              <a-button type="primary" @click="goCreate">
                <template #icon><IconPlus /></template>
                新建预算
              </a-button>
              <a-button type="outline" @click="reloadList">
                <template #icon><IconRefresh /></template>
                刷新列表
              </a-button>
            </a-space>
          </div>
          <BudgetList :reload-token="reloadToken" />
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="verification" title="预算核销">
        <a-card><BudgetVerificationPanel /></a-card>
      </a-tab-pane>
      <a-tab-pane key="relations" title="预算关系图">
        <a-card><BudgetProjectRelationGraph /></a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BudgetOverview from './BudgetOverview.vue'
import BudgetList from './BudgetList.vue'
import BudgetVerificationPanel from './components/BudgetVerificationPanel.vue'
import BudgetProjectRelationGraph from './components/BudgetProjectRelationGraph.vue'

const router = useRouter()
const activeTab = ref('overview')
const reloadToken = ref(0)

const goCreate = () => {
  router.push('/budget/create')
}

const reloadList = () => {
  reloadToken.value++
}
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.page-description { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>