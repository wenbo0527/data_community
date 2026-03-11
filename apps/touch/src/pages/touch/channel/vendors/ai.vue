<template>
  <a-card title="AI供应商">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getVendors } from '@/services/channelService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status' }
]
async function load() {
  const d = await getVendors()
  list.value = d.ai
}
load()
</script>
