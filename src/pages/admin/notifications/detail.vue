<template>
  <div class="notification-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-breadcrumb>
          <a-breadcrumb-item @click="$router.push('/admin/notifications')">
            通知管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>通知详情</a-breadcrumb-item>
        </a-breadcrumb>
        <h1 class="page-title">通知详情</h1>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="goBackAction">返回</a-button>
          <a-button @click="handleEdit" v-if="notificationData.id">编辑</a-button>
          <a-dropdown v-if="notificationData.id">
            <a-button>
              更多操作
              <icon-down />
            </a-button>
            <template #content>
              <a-doption @click="handleToggleTop">
                {{ notificationData.isTop ? '取消置顶' : '设为置顶' }}
              </a-doption>
              <a-doption
                v-if="notificationData.status === 'draft'"
                @click="handlePublish"
              >
                发布
              </a-doption>
              <a-doption
                v-if="notificationData.status === 'published'"
                @click="handleArchive"
              >
                归档
              </a-doption>
              <a-doption @click="handleCopy">
                复制
              </a-doption>
              <a-doption class="danger" @click="handleDelete">
                删除
              </a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 详情内容 -->
    <div v-else-if="notificationData.id" class="detail-container">
      <a-row :gutter="16">
        <!-- 主要内容区 -->
        <a-col :span="18">
          <a-card class="detail-card">
            <NotificationDetailContent :notification="notificationData" />
          </a-card>
        </a-col>

        <!-- 侧边栏信息 -->
        <a-col :span="6">
          <!-- 基本信息 -->
          <a-card title="基本信息" class="info-card">
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">创建人：</span>
                <span class="info-value">{{ notificationData.createdBy || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ formatDateTime(notificationData.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ formatDateTime(notificationData.updatedAt) }}</span>
              </div>
              <div class="info-item" v-if="notificationData.publishTime">
                <span class="info-label">发布时间：</span>
                <span class="info-value">{{ formatDateTime(notificationData.publishTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">浏览次数：</span>
                <span class="info-value">{{ notificationData.viewCount || 0 }}</span>
              </div>
            </div>
          </a-card>

          <!-- 操作历史 -->
          <a-card title="操作历史" class="info-card">
            <a-timeline>
              <a-timeline-item
                v-for="log in operationLogs"
                :key="log.id"
                :dot-color="getLogColor(log.action)"
              >
                <div class="log-content">
                  <div class="log-action">{{ getLogActionText(log.action) }}</div>
                  <div class="log-operator">{{ log.operator }}</div>
                  <div class="log-time">{{ formatDateTime(log.operatedAt) }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>

          <!-- 相关通知 -->
          <a-card title="相关通知" class="info-card">
            <div class="related-list">
              <div
                v-for="item in relatedNotifications"
                :key="item.id"
                class="related-item"
                @click="$router.push(`/admin/notifications/detail/${item.id}`)"
              >
                <div class="related-title">{{ item.title }}</div>
                <div class="related-meta">
                  <a-tag :color="item.category?.color || 'blue'" size="mini">
                    {{ item.category?.name || '未分类' }}
                  </a-tag>
                  <span class="related-time">{{ formatDate(item.publishTime) }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <a-result status="404" title="通知不存在" subtitle="您访问的通知可能已被删除或不存在">
        <template #extra>
          <a-button type="primary" @click="$router.push('/admin/notifications')">
            返回列表
          </a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { goBack } from '@/router/utils'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconDown,
  IconEye,
  IconFile,
  IconDownload
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI, OperationLogAPI } from '../../../api/notification'
import NotificationDetailContent from '../../../components/community/NotificationDetailContent.vue'

const route = useRoute()
const router = useRouter()
const goBackAction = () => goBack(router, '/admin/notifications')

// 响应式数据
const loading = ref(true)
const notificationData = ref({})
const operationLogs = ref([])
const relatedNotifications = ref([])

// 方法定义
const fetchNotificationData = async () => {
  loading.value = true
  try {
    const response = await NotificationAPI.getNotification(route.params.id)
    if (response.success) {
      notificationData.value = response.data
      await fetchOperationLogs()
      await fetchRelatedNotifications()
    } else {
      Message.error(response.message || '获取通知详情失败')
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    Message.error('获取通知详情失败')
  } finally {
    loading.value = false
  }
}

const fetchOperationLogs = async () => {
  try {
    const response = await OperationLogAPI.getOperationLogs(route.params.id)
    if (response.success) {
      operationLogs.value = response.data.list || response.data
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
  }
}

const fetchRelatedNotifications = async () => {
  try {
    const response = await NotificationAPI.getNotifications({
      category: notificationData.value.categoryId,
      pageSize: 5
    })
    if (response.success) {
      relatedNotifications.value = response.data.list
        .filter(item => item.id !== parseInt(route.params.id))
        .slice(0, 3)
    }
  } catch (error) {
    console.error('获取相关通知失败:', error)
  }
}

const handleEdit = () => {
  router.push(`/admin/notifications/edit/${route.params.id}`)
}

const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除通知"${notificationData.value.title}"吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        const response = await NotificationAPI.deleteNotification(route.params.id)
        if (response.success) {
          Message.success('删除成功')
          router.push('/admin/notifications')
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除通知失败:', error)
        Message.error('删除失败')
      }
    }
  })
}

const handleToggleTop = async () => {
  try {
    const response = await NotificationAPI.updateNotification(route.params.id, {
      isTop: !notificationData.value.isTop
    })
    if (response.success) {
      Message.success(notificationData.value.isTop ? '取消置顶成功' : '设为置顶成功')
      notificationData.value.isTop = !notificationData.value.isTop
    } else {
      Message.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('切换置顶状态失败:', error)
    Message.error('操作失败')
  }
}

const handlePublish = async () => {
  try {
    const response = await NotificationAPI.updateNotification(route.params.id, {
      status: 'published'
    })
    if (response.success) {
      Message.success('发布成功')
      notificationData.value.status = 'published'
      notificationData.value.publishTime = new Date().toISOString()
    } else {
      Message.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布通知失败:', error)
    Message.error('发布失败')
  }
}

const handleArchive = async () => {
  try {
    const response = await NotificationAPI.updateNotification(route.params.id, {
      status: 'archived'
    })
    if (response.success) {
      Message.success('归档成功')
      notificationData.value.status = 'archived'
    } else {
      Message.error(response.message || '归档失败')
    }
  } catch (error) {
    console.error('归档通知失败:', error)
    Message.error('归档失败')
  }
}

const handleCopy = () => {
  router.push({
    path: '/admin/notifications/create',
    query: { copyFrom: route.params.id }
  })
}

const downloadAttachment = (attachment) => {
  // 模拟下载
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  link.click()
  Message.success(`开始下载 ${attachment.name}`)
}

// 工具方法
const formatContent = (content) => {
  if (!content) return ''
  
  // 简单的Markdown转HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDate = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(1)} ${units[index]}`
}

const getStatusColor = (status) => {
  const colorMap = {
    draft: 'gray',
    published: 'green',
    archived: 'orange'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

const getLogColor = (action) => {
  const colorMap = {
    create: 'blue',
    update: 'orange',
    publish: 'green',
    archive: 'gray',
    delete: 'red'
  }
  return colorMap[action] || 'blue'
}

const getLogActionText = (action) => {
  const textMap = {
    create: '创建通知',
    update: '更新通知',
    publish: '发布通知',
    archive: '归档通知',
    delete: '删除通知'
  }
  return textMap[action] || '未知操作'
}

// 生命周期
onMounted(() => {
  fetchNotificationData()
})
</script>

<style scoped>
.notification-detail-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 8px 0 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.header-right {
  flex-shrink: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.detail-container {
  max-width: 1200px;
}

.detail-card,
.info-card {
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.title-section {
  flex: 1;
}

.notification-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-info {
  margin-top: 8px;
}

.action-section {
  flex-shrink: 0;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #86909c;
  font-size: 14px;
}

.summary-section,
.content-section,
.tags-section,
.attachments-section {
  margin-bottom: 32px;
}

.summary-section h3,
.content-section h3,
.tags-section h3,
.attachments-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.summary-text {
  font-size: 16px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
  border-left: 4px solid #165dff;
}

.content-text {
  font-size: 15px;
  color: #1d2129;
  line-height: 1.7;
  word-break: break-word;
}

.content-text :deep(strong) {
  font-weight: 600;
}

.content-text :deep(em) {
  font-style: italic;
}

.content-text :deep(code) {
  background-color: #f2f3f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.attachment-item:hover {
  background-color: #e5e6eb;
}

.attachment-icon {
  font-size: 20px;
  color: #86909c;
  margin-right: 12px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.attachment-size {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.attachment-action {
  font-size: 16px;
  color: #165dff;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-label {
  min-width: 80px;
  color: #86909c;
  font-size: 14px;
}

.info-value {
  color: #1d2129;
  font-size: 14px;
  word-break: break-all;
}

.log-content {
  font-size: 14px;
}

.log-action {
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 4px;
}

.log-operator {
  color: #4e5969;
  font-size: 13px;
  margin-bottom: 2px;
}

.log-time {
  color: #86909c;
  font-size: 12px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.related-item:hover {
  background-color: #e5e6eb;
}

.related-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.related-time {
  font-size: 12px;
  color: #86909c;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.danger {
  color: #f53f3f !important;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  cursor: pointer;
}

:deep(.arco-breadcrumb-item-link:hover) {
  color: #0e42d2;
}

:deep(.arco-timeline-item-content) {
  padding-bottom: 16px;
}
</style>
