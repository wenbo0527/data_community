<template>
  <a-card title="短信模板">
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
      @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
      </template>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import mockData from '@/mock/touch'

const router = useRouter()
const loading = ref(false)
const list = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

const columns = [
  { title: '模板ID', dataIndex: 'templateId', width: 180 },
  { title: '短信类型', dataIndex: 'smsType', width: 100 },
  { title: '主要场景', dataIndex: 'primaryScene', ellipsis: true },
  { title: '策略标签', dataIndex: 'strategyTag', ellipsis: true },
  { title: '标签', dataIndex: 'label', ellipsis: true },
  { title: '模板', dataIndex: 'template', width: 120 },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '操作', dataIndex: 'operations', width: 150, fixed: 'right', slotName: 'operations' }
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    '使用中': 'green',
    '待审批': 'orange',
    '审批通过': 'green',
    '审批拒绝': 'red',
    '草稿': 'gray',
    '停用': 'red'
  }
  return colors[status] || 'gray'
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockData.smsTemplates
    pagination.total = list.value.length
    loading.value = false
  }, 300)
}

const onPageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadData()
}

const handleCreate = () => {
  router.push('/touch/channel/sms-template/create')
}

const handleView = (record: any) => {
  Message.info(`查看模板: ${record.label}`)
}

const handleEdit = (record: any) => {
  router.push({ path: '/touch/channel/sms-template/create', query: { id: record.id } })
}

onMounted(() => {
  loadData()
})
</script>
