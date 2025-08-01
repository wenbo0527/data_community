<template>
  <div class="table-detail-page">
    <a-descriptions :column="1" :data="tableDetailData" bordered class="table-descriptions" />
    <a-divider orientation="left">字段信息</a-divider>
    <a-table
      :data="props.table.fields"
      :pagination="false"
      :bordered="true"
      :stripe="true"
      :row-class="() => 'table-row-hover'"
    >
      <template #columns>
        <a-table-column title="字段名" dataIndex="name" />
        <a-table-column title="类型" dataIndex="type">
          <template #cell="{ record }">
            <a-tag>{{ record.type }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="描述" dataIndex="description" />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 本地TableItem接口定义
interface TableItem {
  id: string
  name: string
  description?: string
  database?: string
  schema?: string
  type?: string
  category?: string
  domain?: string
  updateFrequency?: string
  tags?: string[]
  owner?: string
  createTime?: string
  updateTime?: string
  fields?: any[]
}

const props = defineProps<{
  table: TableItem
}>()

const tableDetailData = computed(() => {
  if (!props.table) return []
  return [
    { label: '表名', value: props.table.name },
    { label: '表类型', value: props.table.type },
    { label: '所属目录', value: props.table.category },
    { label: '业务域', value: props.table.domain },
    { label: '更新频率', value: props.table.updateFrequency },
    { label: '负责人', value: props.table.owner },
    { label: '描述', value: props.table.description }
  ]
})
</script>

<style scoped>
.table-detail-page {
  padding: 16px;
}

.table-descriptions {
  margin-bottom: 16px;
}

.table-row-hover:hover {
  background-color: var(--color-fill-2);
}
</style>