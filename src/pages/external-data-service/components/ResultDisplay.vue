<template>
  <div class="result-display">
    <a-card title="结果展示" hoverable>
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
import { computed } from 'vue'

const columns = [
  { title: '字段', dataIndex: 'field' },
  { title: '值', dataIndex: 'value' }
]
const rows = [
  { field: 'user_id', value: 'U20231101' },
  { field: 'age', value: 28 },
  { field: 'city', value: '上海' }
]
const json = computed(() => JSON.stringify(rows, null, 2))
</script>

<style scoped>
.json { white-space: pre-wrap; }
</style>