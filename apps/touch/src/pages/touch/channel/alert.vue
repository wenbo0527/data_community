<template>
  <a-card title="预警管理">
    <a-table
      :columns="columns"
      :data="list"
      :loading="loading"
      row-key="id"
    >
      <template #level="{ record }">
        <a-tag :color="getLevelColor(record.level)">{{ record.level }}</a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
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
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '预警名称', dataIndex: 'name' },
  { title: '级别', dataIndex: 'level', slotName: 'level', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 }
]

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = { '高': 'red', '中': 'orange', '低': 'green' }
  return colors[level] || 'gray'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { '进行中': 'blue', '已处理': 'green', '已关闭': 'gray' }
  return colors[status] || 'gray'
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.alerts
    loading.value = false
  }, 300)
}

onMounted(() => {
  loadData()
})
</script>
