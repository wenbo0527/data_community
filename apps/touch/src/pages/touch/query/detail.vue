<template>
  <a-card title="触达查询明细">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listTouchDetails } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '渠道', dataIndex: 'channel' },
  { title: '状态', dataIndex: 'status' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listTouchDetails()
}
load()
</script>
