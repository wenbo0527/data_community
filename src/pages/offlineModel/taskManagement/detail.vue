<template>
  <div class="task-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/offline-model/task-management">任务管理</a-breadcrumb-item>
        <a-breadcrumb-item>任务详情</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">任务详情 #{{ id }}</h1>
    </div>
    <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
      <a-tab-pane key="config" title="基础信息">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="任务名称">{{ detail?.name }}</a-descriptions-item>
          <a-descriptions-item label="类型"><a-tag>{{ getTypeLabel(detail?.type) }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="状态"><a-tag :color="getStatusColor(detail?.status)">{{ getStatusLabel(detail?.status) }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="进度">{{ detail?.progress }}%</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDate(detail?.createTime) }}</a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>
      <a-tab-pane key="subtasks" title="拆分子任务">
        <a-table :data="detail?.subtasks || []" :columns="subCols" row-key="id" size="small" :pagination="false">
          <template #statusCell="{ record }">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
          </template>
          <template #actionCell="{ record }">
            <a-button type="primary" size="small" :disabled="record.status!=='failed'" @click="handleRetry(record)">重试</a-button>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
    <div class="actions-bar">
      <a-space>
        <a-button @click="handleBack">返回</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { taskAPI } from '@/api/offlineModel'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const activeTab = ref('config')
const detail = ref({})

const subCols = [
  { title: '子任务ID', dataIndex: 'id', width: 100 },
  { title: '分片', dataIndex: 'shard', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 120 },
  { title: '进度', dataIndex: 'progress', width: 100 },
  { title: '错误信息', dataIndex: 'lastError' },
  { title: '操作', dataIndex: 'action', slotName: 'actionCell', width: 120 }
]

const loadDetail = async () => {
  const res = await taskAPI.getTaskDetail(id)
  if (res.success && res.data) {
    detail.value = res.data
  } else {
    Message.error(res.message || '加载失败')
  }
}

const handleRetry = async (record) => {
  const res = await taskAPI.retrySubtask(id, record.id)
  if (res.success) {
    Message.success('已触发重试')
    await loadDetail()
  } else {
    Message.error(res.message || '重试失败')
  }
}

const handleBack = () => router.back()

onMounted(loadDetail)

// 工具方法复用
const getTypeLabel = (type) => ({ training: '模型训练', evaluation: '模型评估', prediction: '模型预测', backtrack: '模型回溯' }[type] || type)
const getStatusColor = (status) => ({ pending: 'gray', running: 'blue', completed: 'green', failed: 'red', paused: 'orange' }[status] || 'gray')
const getStatusLabel = (status) => ({ pending: '待执行', running: '运行中', completed: '已完成', failed: '失败', paused: '暂停' }[status] || status)
const formatDate = (date) => (date ? new Date(date).toLocaleString('zh-CN') : '-')
</script>

<style scoped>
.task-detail-page { padding: 16px; background: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.actions-bar { margin-top: 16px; }
</style>

