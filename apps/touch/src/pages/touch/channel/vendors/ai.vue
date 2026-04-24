<template>
  <a-card title="AI供应商">
    <a-table
      :columns="columns"
      :data="list"
      :loading="loading"
      row-key="id"
    >
      <template #status="{ record }">
        <a-tag :color="record.status === '启用' ? 'green' : 'gray'">{{ record.status }}</a-tag>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import mockData from '@/mock/touch'

const loading = ref(false)
const list = ref<any[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.vendors.ai
    loading.value = false
  }, 300)
}

onMounted(() => {
  loadData()
})
</script>
