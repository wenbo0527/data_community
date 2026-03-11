<template>
  <a-card title="AI外呼模板">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listAiCallTemplates } from '@/services/channelService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '供应商', dataIndex: 'vendor' }
]
async function load() {
  list.value = await listAiCallTemplates()
}
load()
</script>
