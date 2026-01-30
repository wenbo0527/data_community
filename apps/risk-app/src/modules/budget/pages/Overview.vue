<template>
  <div class="budget-overview">
    <div class="page-header">
      <h2>预算总览</h2>
      <p class="desc">承载预算功能导航与关键指标查看</p>
    </div>
    <a-card class="nav-card" :bordered="true" title="功能导航">
      <a-space>
        <a-button type="primary" @click="$router.push('/budget/monitor')">预算监控</a-button>
        <a-button type="primary" @click="$router.push('/budget/contracts')">合同管理</a-button>
        <a-button type="primary" @click="$router.push('/budget/settlement')">结算管理</a-button>
      </a-space>
    </a-card>
    <a-grid :cols="3" :col-gap="12" :row-gap="12" class="stats">
      <a-grid-item><a-card hoverable><a-statistic title="当年预算总额" :value="totalBudget"><template #suffix>元</template></a-statistic></a-card></a-grid-item>
      <a-grid-item><a-card hoverable><a-statistic title="当前累积消耗" :value="usedBudget"><template #suffix>元</template></a-statistic></a-card></a-grid-item>
      <a-grid-item><a-card hoverable><a-statistic title="预算健康度" :value="healthScore" /></a-card></a-grid-item>
    </a-grid>
    <a-card title="预算监控">
      <template #extra><a-button type="text" @click="$router.push('/budget/monitor')">前往预算监控</a-button></template>
      <BudgetBurndownTabs :chart-data="burndownChartData" @granularity-change="onGranularityChange" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue'
import { getBurndown } from '@/modules/external-data/api/monitor'

const totalBudget = ref(1_000_000)
const usedBudget = ref(420_000)
const healthScore = ref(86)
const chartData = ref<any[]>([])
const burndownChartData = computed(() => chartData.value)

const load = async () => {
  chartData.value = await getBurndown({ range: 'month' })
  Message.success('已加载预算燃尽数据')
}
const onGranularityChange = async (key: 'month' | 'quarter') => {
  chartData.value = await getBurndown({ range: key })
}
onMounted(load)
</script>

<style scoped>
.budget-overview { padding: 8px; }
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.nav-card { margin-bottom: 12px; }
.stats { margin-bottom: 12px; }
</style>
