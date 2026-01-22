<template>
  <a-card title="短信发送记录">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listSmsRecords } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '状态', dataIndex: 'status' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listSmsRecords()
}
load()
</script>
