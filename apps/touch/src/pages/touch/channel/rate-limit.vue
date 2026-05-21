<template>
  <a-card title="全局频控">
    <a-table
      :columns="columns"
      :data="list"
      :loading="loading"
      row-key="id"
    >
      <template #status="{ record }">
        <a-tag :color="record.status === '使用中' ? 'green' : 'gray'">{{ record.status }}</a-tag>
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
  { title: '渠道', dataIndex: 'channel', width: 120 },
  { title: '场景', dataIndex: 'scene', width: 120 },
  { title: '航线', dataIndex: 'line', width: 150 },
  { title: '规则', dataIndex: 'rule' },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '备注', dataIndex: 'remark', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 180 }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.globalRateLimits
    loading.value = false
  }, 300)
}

onMounted(() => {
  loadData()
})
</script>
