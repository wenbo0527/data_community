<template>
  <div class="notification-detail-container">
    <a-card class="detail-card">
      <template #title>
        <div class="detail-header">
          <a-breadcrumb>
            <a-breadcrumb-item @click="$router.push('/home')">首页</a-breadcrumb-item>
            <a-breadcrumb-item @click="$router.push('/notification/list')">通知管理</a-breadcrumb-item>
            <a-breadcrumb-item>通知详情</a-breadcrumb-item>
          </a-breadcrumb>
          <h2>通知详情</h2>
        </div>
      </template>

      <template #extra>
        <a-space>
          <a-button @click="$router.back()">
            返回
          </a-button>
          <a-button type="primary" @click="handleEdit" v-if="notification">
            编辑
          </a-button>
        </a-space>
      </template>

      <div class="detail-content" v-if="notification">
        <div class="notification-header">
          <h1 class="notification-title">{{ notification.title }}</h1>
          <div class="notification-meta">
            <a-space>
              <a-tag :color="getTypeColor(notification.type)">
                {{ getTypeLabel(notification.type) }}
              </a-tag>
              <a-tag :color="notification.status === 'published' ? 'green' : 'orange'">
                {{ notification.status === 'published' ? '已发布' : '草稿' }}
              </a-tag>
              <span class="meta-item">
                <IconUser />
                {{ notification.author }}
              </span>
              <span class="meta-item">
                <IconCalendar />
                {{ formatDate(notification.createdAt) }}
              </span>
            </a-space>
          </div>
        </div>

        <a-divider />

        <div class="notification-body">
          <div class="content-section" v-if="notification.content">
            <h3>通知内容</h3>
            <div class="content-text" v-html="notification.content"></div>
          </div>

          <div class="attachments-section" v-if="notification.attachments && notification.attachments.length > 0">
            <h3>附件</h3>
            <div class="attachments-list">
              <div 
                v-for="attachment in notification.attachments" 
                :key="attachment.id"
                class="attachment-item"
              >
                <IconPaperClip />
                <a :href="attachment.url" target="_blank">{{ attachment.name }}</a>
                <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
              </div>
            </div>
          </div>

          <div class="metadata-section">
            <h3>其他信息</h3>
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="通知ID">
                {{ notification.id }}
              </a-descriptions-item>
              <a-descriptions-item label="分类">
                {{ notification.categoryName || '未分类' }}
              </a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(notification.priority)">
                  {{ getPriorityLabel(notification.priority) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="是否置顶">
                {{ notification.isSticky ? '是' : '否' }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ formatDateTime(notification.createdAt) }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                {{ formatDateTime(notification.updatedAt) }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
      </div>

      <div class="loading-container" v-else-if="loading">
        <a-spin size="large" />
      </div>

      <div class="error-container" v-else>
        <a-result
          status="404"
          title="通知不存在"
          sub-title="您访问的通知可能已被删除或不存在"
        >
          <template #extra>
            <a-button type="primary" @click="$router.push('/notification/list')">
              返回通知列表
            </a-button>
          </template>
        </a-result>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconCalendar, IconPaperClip } from '@arco-design/web-vue/es/icon'
import { NotificationAPI } from '@/api/notification'
import type { Notification } from '@/types/notification'

const route = useRoute()
const router = useRouter()

const notification = ref<Notification | null>(null)
const loading = ref(true)

// 获取通知详情
const fetchNotificationDetail = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const response = await NotificationAPI.getNotification(id)
    notification.value = response.data
  } catch (error) {
    console.error('获取通知详情失败:', error)
    Message.error('获取通知详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑内容
const handleEdit = () => {
  if (notification.value) {
    router.push(`/notification/edit/${notification.value.id}`)
  }
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colors = {
    system: 'blue',
    announcement: 'green',
    maintenance: 'orange',
    urgent: 'red'
  }
  return colors[type] || 'gray'
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const labels = {
    system: '系统通知',
    announcement: '公告',
    maintenance: '维护通知',
    urgent: '紧急通知'
  }
  return labels[type] || type
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'gray'
}

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return labels[priority] || priority
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => {
  fetchNotificationDetail()
})
</script>

<style scoped>
.notification-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-header {
  margin-bottom: 16px;
}

.detail-header h2 {
  margin: 8px 0 0 0;
  font-size: 24px;
  font-weight: 600;
}

.notification-header {
  margin-bottom: 24px;
}

.notification-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1d2129;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #86909c;
  font-size: 14px;
}

.notification-body {
  margin-top: 24px;
}

.content-section {
  margin-bottom: 32px;
}

.content-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1d2129;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #4e5969;
  background: #f7f8fa;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #165dff;
}

.attachments-section {
  margin-bottom: 32px;
}

.attachments-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1d2129;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.attachment-item a {
  color: #165dff;
  text-decoration: none;
}

.attachment-item a:hover {
  text-decoration: underline;
}

.attachment-size {
  color: #86909c;
  font-size: 12px;
}

.metadata-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1d2129;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-container {
  padding: 40px 0;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 600;
  color: #1d2129;
}

:deep(.arco-descriptions-item-value) {
  color: #4e5969;
}
</style>