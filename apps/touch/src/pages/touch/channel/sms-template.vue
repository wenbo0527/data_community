<template>
  <a-card title="短信模板">
    <a-table :columns="columns" :data="list" row-key="id" />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { listSmsTemplates } from '@/services/channelService'
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '标题', dataIndex: 'title' },
  { title: '场景', dataIndex: 'scene' }
]
async function load() {
  list.value = await listSmsTemplates()
}
load()
</script>
