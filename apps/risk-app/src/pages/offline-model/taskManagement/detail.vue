<template>
  <div class="task-detail-page">
    <a-breadcrumb>
      <a-breadcrumb-item to="/offline-model/task-management">任务管理</a-breadcrumb-item>
      <a-breadcrumb-item>任务详情</a-breadcrumb-item>
    </a-breadcrumb>
    <h1 class="page-title">任务详情 #{{ id }}</h1>
    <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
      <a-tab-pane key="config" title="配置信息">
        <a-descriptions :column="2" bordered title="基础信息" size="small">
          <a-descriptions-item label="任务ID">{{ detail.id }}</a-descriptions-item>
          <a-descriptions-item label="任务名称">{{ detail.name }}</a-descriptions-item>
          <a-descriptions-item label="任务类型">{{ getTypeLabel(detail.type) }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(detail.status)">{{ getStatusLabel(detail.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(detail.priority)">{{ getPriorityLabel(detail.priority) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDate(detail.createTime) }}</a-descriptions-item>
        </a-descriptions>
        <div class="section">
          <h3>任务参数</h3>
          <a-table :data="detail.config?.params || []" :columns="paramCols" row-key="key" size="small" :pagination="false" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="progress" title="执行进度">
        <a-steps :current="currentStep" status="process">
          <a-step v-for="s in detail.progress" :key="s.key" :title="s.name" :description="stepDesc(s)" />
        </a-steps>
        <a-card title="执行日志" style="margin-top: 16px">
          <a-timeline>
            <a-timeline-item v-for="log in detail.logs" :key="log.time" :timestamp="log.time">
              {{ log.message }}
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="result" title="执行结果">
        <a-descriptions :column="3" bordered title="统计" size="small">
          <a-descriptions-item label="总数">{{ detail.result?.total }}</a-descriptions-item>
          <a-descriptions-item label="成功">{{ detail.result?.success }}</a-descriptions-item>
          <a-descriptions-item label="失败">{{ detail.result?.failed }}</a-descriptions-item>
        </a-descriptions>
        <div class="section">
          <h3>样例输出</h3>
          <a-table :data="detail.result?.samples || []" :columns="sampleCols" row-key="idx" size="small" :pagination="false" />
        </div>
      </a-tab-pane>
    </a-tabs>
    <div class="actions-bar">
      <a-space>
        <a-button @click="handleBack">返回</a-button>
        <a-button v-if="detail.status === 'running'" status="danger" @click="handleStop">停止任务</a-button>
        <a-button v-if="detail.status === 'failed'" type="primary" @click="handleRetry">重试</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { taskAPI } from '@/api/offlineModel'
import { goBack } from '@/router/utils'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const activeTab = ref('config')
const detail = ref<any>({ id, status: 'pending', config: { params: [] }, progress: [], result: {}, logs: [] })

const paramCols = [
  { title: '参数名', dataIndex: 'key', width: 160 },
  { title: '参数值', dataIndex: 'value', width: 200 },
  { title: '说明', dataIndex: 'desc', width: 200 }
]
const sampleCols = [
  { title: '#', dataIndex: 'idx', width: 80 },
  { title: '输出', dataIndex: 'output' }
]

const currentStep = computed(() => {
  const idx = (detail.value.progress || []).findIndex(s => s.status === 'running')
  return idx >= 0 ? idx : (detail.value.progress || []).length - 1
})

const stepDesc = (s: any) => {
  return s.status === 'done' ? (s.time || '') : (s.status === 'running' ? '进行中' : '')
}

const loadDetail = async () => {
  try {
    const res = await taskAPI.getTaskDetail(id)
    if (res.success && res.data) {
      detail.value = res.data
    } else {
      Message.error(res.message || '加载失败')
    }
  } catch (error) {
    Message.error('加载详情失败')
  }
}

const handleBack = () => {
  goBack(router, '/offline-model/task-management')
}

const handleStop = async () => {
  try {
    const res = await taskAPI.stopTask(id)
    if (res.success) {
      Message.success('任务已停止')
      await loadDetail()
    } else {
      Message.error(res.message || '停止失败')
    }
  } catch (error) {
    Message.error('停止任务失败')
  }
}

const handleRetry = async () => {
  try {
    const res = await taskAPI.retryTask(id)
    if (res.success) {
      Message.success('任务已重试')
      await loadDetail()
    } else {
      Message.error(res.message || '重试失败')
    }
  } catch (error) {
    Message.error('重试任务失败')
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { training: '模型训练', evaluation: '模型评估', prediction: '模型预测', backtrack: '模型回溯' }
  return labels[type] || type
}
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { pending: '待执行', running: '运行中', completed: '已完成', failed: '失败', paused: '暂停' }
  return labels[status] || status
}
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { pending: 'gray', running: 'blue', completed: 'green', failed: 'red', paused: 'orange' }
  return colors[status] || 'gray'
}
const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return labels[priority] || priority
}
const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = { high: 'red', medium: 'orange', low: 'green' }
  return colors[priority] || 'gray'
}
const formatDate = (date: string) => date ? new Date(date).toLocaleString('zh-CN') : '-'

onMounted(loadDetail)
</script>

<style scoped>
.task-detail-page { padding: 16px; background: #fff; }
.page-title { margin: 8px 0 16px; font-size: 18px; font-weight: 600; }
.section { margin-top: 12px; }
.actions-bar { margin-top: 16px; }
</style>
