<template>
  <a-card title="字典管理">
    <a-space direction="vertical" size="large" style="width: 100%">
      <a-form :model="query" layout="inline">
        <a-form-item field="keyword" label="关键字">
          <a-input v-model="query.keyword" placeholder="输入关键字" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="load">查询</a-button>
          <a-button style="margin-left:8px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table :columns="columns" :data="list" row-key="key" :pagination="pagination" />
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getDictionaries } from '@/services/systemService'
const query = reactive({ keyword: '' })
const list = ref<any[]>([])
const pagination = reactive({ pageSize: 10 })
const columns = [
  { title: '分类', dataIndex: 'category' },
  { title: '键', dataIndex: 'key' },
  { title: '值', dataIndex: 'value' },
  { title: '描述', dataIndex: 'desc' }
]
async function load() {
  const data = await getDictionaries()
  const k = query.keyword.trim()
  list.value = k ? data.filter((d: any) => (d.key.includes(k) || d.value.includes(k))) : data
}
function reset() {
  query.keyword = ''
  load()
}
load()
</script>
