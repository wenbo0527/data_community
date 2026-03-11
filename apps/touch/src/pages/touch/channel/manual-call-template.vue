<template>
  <a-card title="人工外呼模板">
    <a-space direction="vertical" style="width: 100%">
      <a-table :columns="columns" :data="list" row-key="id" />
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listManualCallTemplates } from '@/services/channelService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status' }
]
async function load() {
  list.value = await listManualCallTemplates()
}
load()
</script>
