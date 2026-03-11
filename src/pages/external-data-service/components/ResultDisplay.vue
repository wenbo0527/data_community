<template>
  <div class="result-display">
    <a-card title="结果展示" hoverable>
      <template #extra>
        <a-space>
          <a-input-number v-model="taskId" placeholder="输入任务ID" :min="1" style="width: 140px" />
          <a-button type="outline" size="small" @click="loadDetail">查询</a-button>
        </a-space>
      </template>
      <a-tabs default-active-key="table">
        <a-tab-pane key="table" title="表格">
          <a-table :columns="columns" :data="rows" size="small" />
        </a-tab-pane>
        <a-tab-pane key="json" title="JSON">
          <a-typography-paragraph>
            <pre class="json">{{ json }}</pre>
          </a-typography-paragraph>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useExternalDataStore } from '../../../store/modules/external-data'

const store = useExternalDataStore()
const taskId = ref<number | undefined>(undefined)

const columns = [
  { title: '字段', dataIndex: 'field' },
  { title: '值', dataIndex: 'value' }
]
const rows = computed(() => {
  const d = store.taskDetail
  if (!d) return []
  // 以任务详情的config为示例展示
  const data = [
    { field: '任务ID', value: d.id },
    { field: '任务名称', value: d.taskName },
    { field: '状态', value: d.status },
    { field: '进度', value: d.progress + '%' },
    { field: '创建时间', value: d.createTime },
    { field: '预计完成', value: d.estimatedTime },
    { field: '产品名称', value: d.config?.productName },
    { field: '报告类型', value: d.config?.reportType },
    { field: '分析周期', value: d.config?.analysisPeriod }
  ]
  return data
})
const json = computed(() => JSON.stringify(store.taskDetail ?? {}, null, 2))

const loadDetail = async () => {
  if (!taskId.value) return
  await store.fetchTaskDetail(taskId.value)
}
</script>

<style scoped>
.json { white-space: pre-wrap; }
</style>