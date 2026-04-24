<template>
  <a-card title="AI外呼模板">
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
      row-key="id"
    >
      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
          <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import mockData from '@/mock/touch'

const router = useRouter()
const loading = ref(false)
const list = ref<any[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name' },
  { title: '供应商', dataIndex: 'vendor', width: 120 },
  { title: '操作', dataIndex: 'operations', width: 150, slotName: 'operations' }
]

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.aiCallTemplates
    loading.value = false
  }, 300)
}

const handleCreate = () => {
  Message.info('新建AI外呼模板')
}

const handleView = (record: any) => {
  Message.info(`查看模板: ${record.name}`)
}

const handleEdit = (record: any) => {
  Message.info(`编辑模板: ${record.name}`)
}

onMounted(() => {
  loadData()
})
</script>
