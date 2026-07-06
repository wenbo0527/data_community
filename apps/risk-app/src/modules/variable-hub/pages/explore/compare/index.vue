<template>
  <div class="explore-compare-page">
    <div class="page-header">
      <div>
        <h2>实验对比</h2>
        <p>并排对比同一课题下的多次实验参数与指标（Demo）。</p>
      </div>
      <a-space>
        <a-button type="text" @click="router.back()">返回</a-button>
        <a-button type="outline" @click="router.push('/explore/topics')">课题列表</a-button>
      </a-space>
    </div>

    <a-card :bordered="false" class="panel-card">
      <a-alert v-if="!topicId" type="warning">请从课题详情页进入对比（Demo 通过 topicId 传参）。</a-alert>
      <div v-else>
        <a-space direction="vertical" fill>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="课题ID">{{ topicId }}</a-descriptions-item>
            <a-descriptions-item label="实验数量">{{ experiments.length }}</a-descriptions-item>
          </a-descriptions>

          <a-table :columns="columns" :data="tableRows" :pagination="false" row-key="metric">
            <template #valueCell="{ record, column }">
              <span>{{ record.values[column.dataIndex] }}</span>
            </template>
          </a-table>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ExploreStore } from '@/modules/variable-hub/mock/explore/explore-store'

const route = useRoute()
const router = useRouter()

const topicId = String(route.query.topicId || '')
const experiments = computed(() => (topicId ? ExploreStore.listExperimentsByTopic(topicId) : []))

const dynamicColumns = computed(() => {
  return experiments.value.map((item) => ({
    title: item.name,
    dataIndex: item.id,
    slotName: 'valueCell'
  }))
})

const columns = computed(() => {
  return [
    { title: '对比项', dataIndex: 'metric', width: 160 },
    ...dynamicColumns.value
  ]
})

const formatMetric = (value?: number) => (typeof value === 'number' ? value.toFixed(2) : '—')
const formatPercent = (value?: number) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '—')

const tableRows = computed(() => {
  const rows: Array<{ metric: string; values: Record<string, string> }> = []
  const pushRow = (metric: string, picker: (exp: any) => string) => {
    const values = experiments.value.reduce<Record<string, string>>((acc, exp) => {
      acc[exp.id] = picker(exp)
      return acc
    }, {})
    rows.push({ metric, values })
  }

  pushRow('时间窗口', (exp) => exp.timeWindow)
  pushRow('样本范围', (exp) => exp.sampleScope)
  pushRow('加工逻辑', (exp) => exp.transformLogic)
  pushRow('阈值设定', (exp) => exp.thresholdConfig || '—')
  pushRow('IV', (exp) => formatMetric(exp.metrics.iv))
  pushRow('KS', (exp) => formatMetric(exp.metrics.ks))
  pushRow('PSI', (exp) => formatMetric(exp.metrics.psi))
  pushRow('覆盖率', (exp) => formatPercent(exp.metrics.coverage))
  pushRow('结论', (exp) => exp.conclusion)

  return rows
})
</script>

<style scoped>
.explore-compare-page {
  min-height: calc(100vh - 88px);
  background: #f7f8fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #4e5969;
}

.panel-card {
  box-shadow: 0 8px 20px rgba(15, 35, 95, 0.06);
}
</style>

