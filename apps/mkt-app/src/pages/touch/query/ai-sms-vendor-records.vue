<template>
  <a-card title="AI厂商短信记录">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listAiVendorSmsRecords } from '@/services/queryService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '厂商', dataIndex: 'vendor' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  list.value = await listAiVendorSmsRecords()
}
load()
</script>
