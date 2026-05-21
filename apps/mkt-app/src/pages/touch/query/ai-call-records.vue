<template>
  <a-card title="AI外呼记录">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listAiCallRecords } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '用户', dataIndex: 'user' },
  { title: '供应商', dataIndex: 'vendor' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listAiCallRecords()
}
load()
</script>
