<template>
  <div class="call-task-page">
    <div class="page-header">
      <a-button type="primary" @click="handleCreateTask">
        <template #icon><IconPlus /></template>
        新建外呼任务
      </a-button>
    </div>
    <a-table :columns="taskColumns" :data="taskData" :loading="loading" :pagination="pagination">
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
      </template>
      <template #actions="{ record }">
        <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
        <a-button type="text" size="small" status="warning" @click="handlePause(record)" v-if="record.status === 'running'">暂停</a-button>
        <a-button type="text" size="small" status="danger" @click="handleStop(record)" v-if="record.status === 'running'">终止</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const pagination = { pageSize: 10, total: 0 }

const taskColumns = [
  { title: '任务名称', dataIndex: 'name' },
  { title: '外呼人数', dataIndex: 'total', align: 'center', width: 100 },
  { title: '已完成', dataIndex: 'completed', align: 'center', width: 100 },
  { title: '成功率', dataIndex: 'rate', align: 'center', width: 80 },
  { title: '状态', slotName: 'status', align: 'center', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', slotName: 'actions', align: 'center', width: 180 }
]

const taskData = ref([
  { id: '1', name: 'VIP客户回访', total: 500, completed: 320, rate: '64%', status: 'running', statusText: '进行中', createTime: '2026-04-10 09:00' },
  { id: '2', name: '流失客户召回', total: 300, completed: 300, rate: '100%', status: 'completed', statusText: '已完成', createTime: '2026-04-08 14:00' },
  { id: '3', name: '新品推广', total: 1000, completed: 0, rate: '0%', status: 'pending', statusText: '待开始', createTime: '2026-04-12 10:00' }
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { running: 'green', pending: 'orange', completed: 'blue' }
  return colors[status] || 'gray'
}

const handleCreateTask = () => console.log('新建外呼任务')
const handleDetail = (record: any) => console.log('任务详情:', record)
const handlePause = (record: any) => console.log('暂停任务:', record)
const handleStop = (record: any) => console.log('终止任务:', record)
</script>

<style scoped>
.call-task-page {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
</style>