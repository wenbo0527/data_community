<template>
  <div class="external-data-evaluation-detail">
    <a-page-header :title="detail?.title || '评估详情'" @back="goBack" />
    <a-card :bordered="true" style="margin-top: 8px">
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="编号">{{ id }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ statusLabel(detail?.status) }}</a-descriptions-item>
        <a-descriptions-item label="评分">{{ detail?.score ?? '—' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card title="内容" :bordered="true" style="margin-top: 12px">
      <pre class="content-block">{{ pretty(detail?.content) }}</pre>
    </a-card>
    <a-card title="字段摘要" :bordered="true" style="margin-top: 12px">
      <a-table :data="fieldRows" :pagination="false" row-key="name">
        <template #columns>
          <a-table-column title="字段" data-index="name" :width="220" />
          <a-table-column title="值" data-index="value" />
        </template>
        <template #empty><a-empty description="无字段数据" /></template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const store = useExternalDataStore()
const id = computed(() => String(route.params.id || ''))
const detail = computed(() => store.evaluationDetail)

const load = async () => {
  if (!id.value) { Message.error('无效的评估ID'); return }
  await store.fetchEvaluationDetail(id.value)
}
onMounted(load)

const statusLabel = (s?: string) => s === 'draft' ? '草稿' : s === 'in_progress' ? '进行中' : s === 'completed' ? '已完成' : s === 'archived' ? '已归档' : '—'
const fieldRows = computed(() => {
  const fields = (detail.value?.fields || {}) as Record<string, unknown>
  return Object.keys(fields).map(k => ({ name: k, value: String((fields as any)[k] ?? '') }))
})
const pretty = (obj: any) => {
  try { return JSON.stringify(obj ?? {}, null, 2) } catch { return String(obj ?? '') }
}
const goBack = () => { router.back() }
</script>

<style scoped>
.content-block {
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
