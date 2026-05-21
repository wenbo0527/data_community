<template>
  <a-card title="字典管理">
    <template #extra>
      <a-space>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          新建字典
        </a-button>
      </a-space>
    </template>
    <a-form :model="query" layout="inline" style="margin-bottom: 16px">
      <a-form-item field="keyword" label="关键字">
        <a-input v-model="query.keyword" placeholder="输入关键字" allow-clear style="width: 200px" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="load">查询</a-button>
        <a-button style="margin-left: 8px" @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data="filteredList"
      :loading="loading"
      row-key="key"
      :pagination="{ pageSize: 10, showTotal: true, showPageSize: true }"
    >
      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button type="text" size="small" status="danger" @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import mockData from '@/mock/touch'

const loading = ref(false)
const query = reactive({ keyword: '' })
const list = ref<any[]>([])

const columns = [
  { title: '分类', dataIndex: 'category', width: 150 },
  { title: '键', dataIndex: 'key', width: 150 },
  { title: '值', dataIndex: 'value', width: 150 },
  { title: '描述', dataIndex: 'desc' },
  { title: '操作', dataIndex: 'operations', width: 150, slotName: 'operations' }
]

const filteredList = computed(() => {
  if (!query.keyword.trim()) return list.value
  const k = query.keyword.trim().toLowerCase()
  return list.value.filter((d: any) =>
    d.key.toLowerCase().includes(k) || d.value.toLowerCase().includes(k) || d.desc.toLowerCase().includes(k)
  )
})

const load = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.dictionaries
    loading.value = false
  }, 300)
}

const reset = () => {
  query.keyword = ''
  load()
}

const handleCreate = () => {
  Message.info('新建字典')
}

const handleEdit = (record: any) => {
  Message.info(`编辑字典: ${record.key}`)
}

const handleDelete = (record: any) => {
  Message.warning(`删除字典: ${record.key}`)
}

onMounted(() => {
  load()
})
</script>
