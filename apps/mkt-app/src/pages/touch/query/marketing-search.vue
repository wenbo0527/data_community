<template>
  <a-card title="营销记录查询">
    <a-space direction="vertical" style="width: 100%">
      <a-form :model="query" layout="inline">
        <a-form-item field="keyword" label="关键字">
          <a-input v-model="query.keyword" placeholder="输入关键字" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="load">查询</a-button>
          <a-button style="margin-left:8px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table :columns="columns" :data="list" row-key="id" />
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { searchMarketing } from '@/services/queryService'
const query = reactive({ keyword: '' })
const list = ref<any[]>([])
const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '标题', dataIndex: 'title' },
  { title: '渠道', dataIndex: 'channel' },
  { title: '时间', dataIndex: 'time' }
]
async function load() {
  const d = await searchMarketing(query)
  const k = query.keyword.trim()
  list.value = k ? d.filter((i: any) => i.title.includes(k)) : d
}
function reset() {
  query.keyword = ''
  load()
}
load()
</script>
