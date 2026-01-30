<template>
  <div class="task-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/risk/model-offline-analysis/task-management">任务管理</a-breadcrumb-item>
        <a-breadcrumb-item>任务详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">任务详情 #{{ id }}</h1>
        <div class="header-actions">
          <a-tag :color="getStatusColor(detail?.status)">{{ getStatusLabel(detail?.status) }}</a-tag>
        </div>
      </div>
    </div>

    <div class="page-content">
      <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
        <a-tab-pane key="config" title="基础信息">
          <a-card :bordered="false">
            <a-descriptions :column="2" bordered size="small" title="任务详情">
              <a-descriptions-item label="任务名称">{{ detail?.name }}</a-descriptions-item>
              <a-descriptions-item label="任务类型">
                <a-tag color="arcoblue">{{ getTypeLabel(detail?.type) }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="当前状态">
                <a-tag :color="getStatusColor(detail?.status)">{{ getStatusLabel(detail?.status) }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="总体进度">
                <a-progress :percent="detail?.progress / 100" :status="getProgressStatus(detail?.status)" />
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ formatDate(detail?.createTime) }}</a-descriptions-item>
              <a-descriptions-item label="更新时间">{{ formatDate(detail?.updateTime) }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="subtasks" title="拆分子任务">
          <a-card :bordered="false">
            <a-table :data="detail?.subtasks || []" :columns="subCols" row-key="id" size="small" :pagination="{ pageSize: 10 }">
              <template #statusCell="{ record }">
                <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
              </template>
              <template #progressCell="{ record }">
                <a-progress :percent="record.progress / 100" size="mini" />
              </template>
              <template #actionCell="{ record }">
                <a-button type="text" size="small" :disabled="record.status !== 'failed'" @click="handleRetry(record)">
                  <template #icon><icon-refresh /></template>
                  重试
                </a-button>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>
      </a-tabs>

      <div class="actions-bar">
        <a-space>
          <a-button @click="handleBack">返回列表</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { taskAPI } from '@/api/offlineModel'
import { goBack } from '@/router/utils'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const activeTab = ref('config')
const detail = ref({})

const subCols = [
  { title: '子任务ID', dataIndex: 'id', width: 100 },
  { title: '执行分片', dataIndex: 'shard', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 120 },
  { title: '进度', dataIndex: 'progress', slotName: 'progressCell', width: 120 },
  { title: '异常详情', dataIndex: 'lastError' },
  { title: '操作', slotName: 'actionCell', width: 100, fixed: 'right' }
]

const loadDetail = async () => {
  try {
    const res = await taskAPI.getTaskDetail(id)
    if (res.success && res.data) {
      detail.value = res.data
    } else {
      Message.error(res.message || '详情加载失败')
    }
  } catch (e) {
    Message.error('网络请求异常')
  }
}

const handleRetry = async (record) => {
  try {
    const res = await taskAPI.retrySubtask(id, record.id)
    if (res.success) {
      Message.success('重试任务已提交')
      await loadDetail()
    } else {
      Message.error(res.message || '重试提交失败')
    }
  } catch (e) {
    Message.error('操作失败')
  }
}

const handleBack = () => {
  goBack(router, '/risk/model-offline-analysis/task-management')
}

onMounted(loadDetail)

// 工具方法
const getTypeLabel = (type) => {
  const labels = {
    training: '模型训练',
    evaluation: '模型评估',
    prediction: '模型预测',
    backtrack: '模型回溯'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'gray',
    running: 'arcoblue',
    completed: 'green',
    failed: 'red',
    paused: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    failed: '执行失败',
    paused: '已暂停'
  }
  return labels[status] || status
}

const getProgressStatus = (status) => {
  if (status === 'failed') return 'danger'
  if (status === 'completed') return 'success'
  return 'normal'
}

const formatDate = (date) => (date ? new Date(date).toLocaleString('zh-CN') : '-')
</script>

<style scoped lang="less">
.task-detail-page {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 20px;
    border-radius: 4px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #1d2129;
      }
    }
  }

  .page-content {
    .actions-bar {
      margin-top: 24px;
      padding: 16px 24px;
      background: #fff;
      border-radius: 4px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.arco-tabs-nav-tab) {
  padding: 0 20px;
  background: #fff;
}
</style>
