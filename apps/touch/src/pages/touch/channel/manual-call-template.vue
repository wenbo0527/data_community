<template>
  <a-card title="人工外呼模板">
    <template #extra>
      <a-space>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          新建模板
        </a-button>
      </a-space>
    </template>
    <a-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @page-change="onPageChange"
    >
      <template #status="{ record }">
        <a-tag :color="record.status === '启用' ? 'green' : 'gray'">{{ record.status }}</a-tag>
      </template>
      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mockData from '@/mock/touch'

const router = useRouter()
const loading = ref(false)
const list = ref<any[]>([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true })

const columns = [
  { title: 'ID', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', dataIndex: 'operations', width: 120, slotName: 'operations' }
]

const onPageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.manualCallTemplates
    pagination.total = list.value.length
    loading.value = false
  }, 300)
}

const handleCreate = () => {
  Message.info('新建模板')
}

const handleEdit = (record: any) => {
  Message.info(`编辑模板: ${record.name}`)
}

import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

import { reactive } from 'vue'
onMounted(() => {
  loadData()
})
</script>
