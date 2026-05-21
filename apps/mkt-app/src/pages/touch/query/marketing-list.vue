<template>
  <a-card title="营销记录列表">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listMarketing } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '标题', dataIndex: 'title' },
  { title: '渠道', dataIndex: 'channel' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listMarketing()
}
load()
</script>
