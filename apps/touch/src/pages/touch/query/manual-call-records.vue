<template>
  <a-card title="人工外呼记录">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listManualCallRecords } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '坐席', dataIndex: 'agent' },
  { title: '用户', dataIndex: 'user' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listManualCallRecords()
}
load()
</script>
