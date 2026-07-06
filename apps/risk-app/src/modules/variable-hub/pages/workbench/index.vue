<template>
  <div class="variable-hub-page">
    <DmtPageHeader title="变量一体化管理" subtitle="以变量台账为中心，把关系探索、评估与治理动作收口在同一资产域中。">
      <template #extra>
        <a-button type="primary" @click="router.push('/variable-management')">进入变量台账</a-button>
      </template>
    </DmtPageHeader>

    <DmtStatGroup :items="statItems" />

    <a-row :gutter="12" class="entry-row">
      <a-col v-for="item in entries" :key="item.key" :span="8">
        <a-card class="entry-card" :bordered="false" hoverable @click="router.push(item.path)">
          <a-space>
            <span class="entry-icon" :style="{ background: item.bg, color: item.color }">{{ item.iconText }}</span>
            <div>
              <div class="entry-title">{{ item.title }}</div>
              <div class="entry-desc">{{ item.desc }}</div>
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="14">
        <a-card title="当前治理焦点" :bordered="false" class="panel-card">
          <a-empty v-if="!focusItems.length" description="暂无需要关注的变量" />
          <a-list v-else :bordered="false">
            <a-list-item v-for="item in focusItems" :key="item.variableId">
              <a-list-item-meta :title="getVariableName(item.variableId)" :description="item.latestFocus">
                <template #avatar>
                  <a-avatar shape="circle" :style="{ background: riskBg(item.riskLevel), color: '#fff' }">
                    {{ riskAvatar(item.riskLevel) }}
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-tag :color="riskStatus(item.riskLevel).color">{{ riskStatus(item.riskLevel).label }}</a-tag>
                <a-tag>{{ item.pendingActionCount }} 个动作</a-tag>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
      <a-col :span="10">
        <a-card title="模块定位" :bordered="false" class="panel-card">
          <a-space direction="vertical" :size="12" fill>
            <div v-for="item in positioning" :key="item.title" class="positioning-item">
              <div class="positioning-title">{{ item.title }}</div>
              <div class="positioning-desc">{{ item.desc }}</div>
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVariableStore } from '@/modules/variable-hub/store/variable'
import { buildVariableWorkbenchSummary } from '@/modules/variable-hub/mock/variable-management/variable-map-workbench'
import { riskStatus } from '@/modules/variable-hub/constants/statusMap'
import DmtPageHeader from '@/modules/variable-hub/components/PageHeader.vue'
import DmtStatGroup from '@/modules/variable-hub/components/StatGroup.vue'

const router = useRouter()
const variableStore = useVariableStore()

const riskBg = (level) => ({ high: '#f53f3f', medium: '#ff7d00', low: '#00b42a' }[level] || '#86909c')
const riskAvatar = (level) => ({ high: '高', medium: '中', low: '低' }[level] || '—')

const entries = [
  { key: 'ledger', title: '变量台账', desc: '权威台账，状态/分类/详情档案', path: '/variable-management', iconText: '账', color: '#165dff', bg: '#f0f7ff' },
  { key: 'eval', title: '评估任务中心', desc: '批量评估/外数/内部报告回写', path: '/evaluation/tasks', iconText: '评', color: '#0fc6c2', bg: '#e6fffb' }
]

const positioning = [
  { title: '变量台账', desc: '沉淀变量主数据、分类、状态、审批与评估结果。血缘关系可在变量详情页查看。' },
  { title: '评估任务中心', desc: '外数/内部评估能力收口，报告自动回写变量档案。' },
  { title: '探索过程', desc: '把问题、风险、结论回流为正式动作和证据链。' }
]

const variableList = computed(() => variableStore.variableList || [])

const summary = computed(() => {
  const summaries = Object.values(
    buildVariableWorkbenchSummary(variableList.value.map((item) => String(item.id)))
  )
  return {
    total: variableList.value.length,
    high: summaries.filter((s) => s.riskLevel === 'high').length,
    pending: summaries.reduce((a, b) => a + b.pendingActionCount, 0),
    resolved: summaries.reduce((a, b) => a + b.resolvedInsightCount, 0)
  }
})

const statItems = computed(() => [
  { title: '变量总数', value: summary.value.total, subtitle: '已纳入台账', link: '/variable-management', iconText: '#', iconBg: '#f0f7ff', iconColor: '#165dff' },
  { title: '高风险变量', value: summary.value.high, subtitle: '待治理', link: '/variable-management', iconText: '!', iconBg: '#fff1f0', iconColor: '#f53f3f' },
  { title: '待处理动作', value: summary.value.pending, subtitle: '未闭环治理项', link: '/evaluation/tasks', iconText: '…', iconBg: '#fff7e8', iconColor: '#ff7d00' },
  { title: '已形成结论', value: summary.value.resolved, subtitle: '想法已闭环', iconText: '✓', iconBg: '#e8ffea', iconColor: '#00b42a' }
])

const focusItems = computed(() => {
  return Object.values(
    buildVariableWorkbenchSummary(variableList.value.map((item) => String(item.id)))
  )
    .filter((item) => item.riskLevel === 'high' || item.pendingActionCount > 0)
    .sort((a, b) => b.pendingActionCount - a.pendingActionCount)
    .slice(0, 5)
})

const getVariableName = (id) => variableList.value.find((item) => String(item.id) === String(id))?.name || id

onMounted(async () => {
  if (!variableStore.variableList?.length) {
    await variableStore.fetchVariableList({ pageSize: 100 })
  }
})
</script>

<style scoped>
.entry-row {
  margin-bottom: 16px;
}
.entry-card {
  cursor: pointer;
  border: 1px solid var(--color-border-2);
  transition: all 0.2s;
}
.entry-card:hover {
  box-shadow: 0 4px 12px rgba(15, 35, 95, 0.1);
  border-color: #165dff;
}
.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}
.entry-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}
.entry-desc {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 2px;
}
.positioning-item {
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border-2);
}
.positioning-item:last-child {
  border-bottom: none;
}
.positioning-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-1);
}
.positioning-desc {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 2px;
}
</style>
