<template>
  <a-card title="预警管理">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getAlerts } from '@/services/channelService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '级别', dataIndex: 'level' },
  { title: '状态', dataIndex: 'status' }
]
async function load() {
  list.value = await getAlerts()
}
load()
</script>
