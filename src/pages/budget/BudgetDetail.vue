<template>
  <div class="budget-detail">
    <a-card title="预算详情">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleEdit">
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-button @click="handleBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </a-space>
      </template>

      <a-descriptions :data="budgetData" :column="2" bordered />

  <a-divider />

  <!-- 季度/月度预算分解 -->
  <h3>季度/月度预算分解</h3>
  <a-table
    :data="periodBudgets"
    :columns="periodColumns"
    :pagination="false"
    style="margin-bottom: 20px"
  />

      <a-divider />

      <!-- 预算趋势 -->
      <h3>预算执行趋势</h3>
      <BudgetTrendChart :budget-id="budgetId" />

      <a-divider />

      <!-- 预算分配 -->
      <h3>预算分配</h3>
      <BudgetAllocation :budget-id="budgetId" />

      <a-divider />

      <!-- 预警信息 -->
      <h3>预警信息</h3>
      <BudgetAlertPanel :budget-id="budgetId" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '@/api/budget'
import BudgetTrendChart from '@/components/budget/BudgetTrendChart.vue'
import BudgetAllocation from '@/components/budget/BudgetAllocation.vue'
import BudgetAlertPanel from '@/components/budget/BudgetAlertPanel.vue'

const router = useRouter()
const route = useRoute()

const budgetId = computed(() => route.params.id)
const budget = ref({})
// 预算分解数据（替代科目）
const budgetItems = ref([])
const loading = ref(false)

const budgetData = computed(() => [
  { label: '预算名称', value: budget.value.budgetName || '-' },
  { label: '预算年度', value: budget.value.budgetYear || '-' },
  { label: '业务类型', value: budget.value.businessType || '-' },
  { label: '平台产品', value: budget.value.platformProduct || '-' },
  { label: '目标贷余(万元)', value: (budget.value.targetLoanBalance ?? 0).toLocaleString() },
  { label: '年化数据成本(万元)', value: (budget.value.annualDataCost ?? 0).toLocaleString() },
  { label: '无风险收益(%)', value: budget.value.riskFreeReturn ?? '-' },
  { label: '预估放款(万元)', value: (budget.value.estimatedLoanAmount ?? 0).toLocaleString() },
  { label: '预算总额(万元)', value: (budget.value.totalAmount ?? 0).toLocaleString() },
  { label: '已使用金额(万元)', value: (budget.value.usedAmount ?? 0).toLocaleString() },
  { label: '剩余金额(万元)', value: (budget.value.remainingAmount ?? 0).toLocaleString() },
  { label: '执行率', value: `${budget.value.executionRate ?? 0}%` },
  { label: '状态', value: budget.value.status || '-' },
  { label: '预算粒度', value: budget.value.budgetGranularity || '-' },
  { label: '对应时间', value: budget.value.correspondingTime || '-' },
  { label: '创建时间', value: budget.value.createdAt || '-' },
  { label: '更新时间', value: budget.value.updatedAt || '-' },
  { label: '预算描述', value: budget.value.description || '-' }
])

const periodColumns = [
  { title: '期间', dataIndex: 'period' },
  { title: '计划预算(万元)', dataIndex: 'planned', render: ({ record }) => `${Number(record.planned).toLocaleString()}` },
  { title: '已使用(万元)', dataIndex: 'used', render: ({ record }) => `${Number(record.used).toLocaleString()}` },
  { title: '剩余(万元)', dataIndex: 'remaining', render: ({ record }) => `${Number(record.remaining).toLocaleString()}` },
  { title: '执行率', dataIndex: 'rate', render: ({ record }) => `${record.rate}%` }
]

const periodBudgets = computed(() => {
  const b = budget.value || {}
  const total = Number(b.totalAmount || 0)
  const used = Number(b.usedAmount || 0)
  const remaining = Math.max(total - used, 0)
  const granularity = b.budgetGranularity || 'yearly'
  const year = Number(b.budgetYear || new Date().getFullYear())

const buildEntry = (label: string, plannedPart: number, usedPart: number) => {
    const planned = Number((total * plannedPart).toFixed(2))
    const usedAmt = Number((used * usedPart).toFixed(2))
    const remain = Math.max(planned - usedAmt, 0)
    const rate = planned > 0 ? Math.round((usedAmt / planned) * 100) : 0
    return { period: label, planned, used: usedAmt, remaining: remain, rate }
  }

  if (granularity === 'monthly') {
    // 均匀拆分到12个月
    const result = []
    for (let m = 1; m <= 12; m++) {
      result.push(buildEntry(`${year}-${String(m).padStart(2, '0')}`, 1 / 12, 1 / 12))
    }
    return result
  }

  if (granularity === 'quarterly') {
    // 均匀拆分到4个季度
    return [
      buildEntry(`${year} Q1`, 1 / 4, 1 / 4),
      buildEntry(`${year} Q2`, 1 / 4, 1 / 4),
      buildEntry(`${year} Q3`, 1 / 4, 1 / 4),
      buildEntry(`${year} Q4`, 1 / 4, 1 / 4)
    ]
  }

  // 年度：提供季度视图
  return [
    buildEntry(`${year} Q1`, 1 / 4, 1 / 4),
    buildEntry(`${year} Q2`, 1 / 4, 1 / 4),
    buildEntry(`${year} Q3`, 1 / 4, 1 / 4),
    buildEntry(`${year} Q4`, 1 / 4, 1 / 4)
  ]
})

const handleEdit = () => {
  router.push(`/budget/edit/${budgetId.value}`)
}

const handleBack = () => {
  router.push('/budget/overview')
}

onMounted(async () => {
  // 从路由参数获取预算ID
  if (budgetId.value) {
    loading.value = true
    try {
      const budgetDetail = await budgetApiService.getBudgetDetail(budgetId.value)
      if (budgetDetail) {
        budget.value = budgetDetail
        // 预算分解表不依赖科目
        budgetItems.value = []
      } else {
        Message.error('预算不存在')
        router.push('/budget/overview')
      }
    } catch (error) {
      console.error('加载预算详情失败:', error)
      Message.error('加载预算详情失败')
      router.push('/budget/overview')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.budget-detail {
  padding: 20px;
}

h3 {
  margin: 20px 0 10px 0;
  font-size: 16px;
  font-weight: 500;
}
</style>