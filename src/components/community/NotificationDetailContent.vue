<template>
  <div class="notification-detail-wrapper" :class="{ 'is-home': isHomeVariant }">
    <div v-if="isHomeVariant" class="detail-paper">
      <div class="home-header">
        <h2 class="home-title">{{ notification.title }}</h2>
        <div class="home-meta">
          <a-tag size="small" color="gray" bordered class="meta-tag">
            {{ getNoticeTypeLabel(notification.type) }}
          </a-tag>
          <span class="meta-item">
            <icon-user style="margin-right: 4px;" />
            {{ senderName }}
          </span>
          <span class="meta-item">
            <icon-clock-circle style="margin-right: 4px;" />
            {{ formatDateOnly(notification.publishTime || notification.createdAt) }}
          </span>
        </div>
      </div>

      <div class="home-divider"></div>

      <div class="home-body">
        <div class="home-greeting">尊敬的用户：</div>
        <div v-if="notification.summary" class="home-summary">{{ notification.summary }}</div>
        <div class="detail-content notification-article" v-html="notification.content"></div>

        <div class="home-footer">
          <div class="home-sender">{{ senderName }}</div>
          <div class="home-date">{{ formatDateOnly(notification.publishTime || notification.createdAt) }}</div>
        </div>
      </div>

      <div v-if="hasAttachments" class="home-attachments">
        <div class="home-attachments-title">相关附件</div>
        <div class="home-attachments-list">
          <div
            v-for="attachment in attachments"
            :key="attachment.id || attachment.fileName || attachment.name"
            class="home-attachment-item"
          >
            <div class="home-attachment-icon">
              <icon-file />
            </div>
            <div class="home-attachment-info">
              <div class="home-attachment-name">{{ attachment.fileName || attachment.name }}</div>
              <div class="home-attachment-size">{{ getAttachmentSizeText(attachment) }}</div>
            </div>
            <a-button type="text" size="small" class="home-download-btn" @click="handleDownload(attachment)">
              <template #icon><icon-download /></template>
              下载
            </a-button>
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <!-- 头部信息 -->
      <div class="detail-header">
        <h2 class="detail-title">{{ notification.title }}</h2>
        <div class="detail-meta">
          <a-tag size="small" color="arcoblue" bordered class="meta-tag">
            {{ getCategoryLabel(notification.categoryId) }}
          </a-tag>
          <a-tag size="small" :color="getNoticeTypeColor(notification.type)" bordered class="meta-tag">
            {{ getNoticeTypeLabel(notification.type) }}
          </a-tag>
          <span class="meta-item">
            <icon-user style="margin-right: 4px;" />
            {{ notification.author }}
          </span>
          <span class="meta-item">
            <icon-clock-circle style="margin-right: 4px;" />
            {{ formatTime(notification.publishTime || notification.createdAt) }}
          </span>
        </div>
      </div>

      <div v-if="notification.summary" class="detail-summary">
        {{ notification.summary }}
      </div>

      <!-- 通知对象 -->
      <div v-if="shouldShowTarget && notification.target && notification.target.length > 0" class="detail-assets">
        <div class="assets-title"><icon-user-group /> 通知对象</div>
        <div class="assets-list">
          <a-tag v-for="target in notification.target" :key="target" color="purple" bordered>
            {{ getTargetLabel(target) }}
          </a-tag>
        </div>
      </div>

      <!-- 目标关系表 (仅数据资产变更类型显示) -->
      <div v-if="notification.serviceType === 'data_asset_change' && notification.targetTable" class="detail-assets">
        <div class="assets-title"><icon-storage /> 目标关系表</div>
        <div class="assets-content" style="font-size: 14px; color: #1d2129; padding: 4px 0;">
          {{ notification.targetTable }}
        </div>
      </div>

      <!-- 变更数据资产 (仅数据服务类型显示) -->
      <div v-if="notification.dataAssets && notification.dataAssets.length > 0" class="detail-assets">
        <div class="assets-title"><icon-common /> 变更数据资产</div>
        <div class="assets-list">
          <a-tag v-for="asset in notification.dataAssets" :key="asset" color="arcoblue" bordered>
            {{ getAssetLabel(asset) }}
          </a-tag>
        </div>
      </div>

      <a-divider style="margin: 24px 0; border-color: #f2f3f5;" />

      <!-- 正文内容 -->
      <div class="detail-content notification-article" v-html="notification.content">
      </div>
      
      <!-- 标签 -->
      <div v-if="notification.tags && notification.tags.length > 0" class="detail-tags">
        <a-space>
          <icon-tags style="color: #86909c;" />
          <a-tag v-for="tag in notification.tags" :key="tag" size="small" style="color: #86909c;">
            {{ tag }}
          </a-tag>
        </a-space>
      </div>

      <!-- 附件部分 -->
      <div v-if="hasAttachments" class="detail-attachments">
        <div class="attachment-title">相关附件</div>
        <div class="attachment-list">
          <div v-for="attachment in attachments" 
               :key="attachment.id || attachment.fileName || attachment.name" 
               class="attachment-item">
            <div class="attachment-icon">
              <icon-file />
            </div>
            <div class="attachment-info">
              <div class="attachment-name">{{ attachment.fileName || attachment.name }}</div>
              <div class="attachment-size">{{ getAttachmentSizeText(attachment) }}</div>
            </div>
            <a-button type="text" size="small" class="download-btn" @click="handleDownload(attachment)">
              <template #icon><icon-download /></template>
              下载
            </a-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IconUser,
  IconClockCircle,
  IconUserGroup,
  IconStorage,
  IconCommon,
  IconTags,
  IconFile,
  IconDownload
} from '@arco-design/web-vue/es/icon'
import { DATA_ASSET_OPTIONS } from '@/types/community'
import { getNoticeTypeLabel, getNoticeTypeColor, getCategoryLabel } from '@/constants/notification'

const props = defineProps<{
  notification: any
  variant?: 'default' | 'home'
  showAttachmentEmpty?: boolean
  showTarget?: boolean
}>()

const isHomeVariant = computed(() => props.variant === 'home')
const shouldShowTarget = computed(() => props.showTarget ?? !isHomeVariant.value)

const attachments = computed(() => {
  const value = props.notification?.attachments || props.notification?.documents || []
  return Array.isArray(value) ? value : []
})

const hasAttachments = computed(() => attachments.value.length > 0)

const senderName = computed(() => {
  return props.notification?.sender || props.notification?.author || '系统通知'
})

const getTargetLabel = (target: string) => {
  const labels: Record<string, string> = {
    all: '全体用户',
    analysts: '数据分析师',
    developers: '开发人员',
    managers: '产品经理'
  }
  return labels[target] || target
}

const getAssetLabel = (asset: string) => {
  const option = DATA_ASSET_OPTIONS.find(opt => opt.value === asset)
  return option ? option.label : asset
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const formatDateOnly = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getAttachmentSizeText = (attachment: any) => {
  const raw = attachment?.fileSize ?? attachment?.size
  if (typeof raw === 'number') return formatFileSize(raw)
  if (typeof raw === 'string') return raw
  return ''
}

const handleDownload = (attachment: any) => {
  const url = attachment?.fileUrl || attachment?.url || attachment?.filePath || attachment?.path
  if (url && typeof url === 'string') {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.notification-detail-wrapper {
  padding: 12px 0;
}

.notification-detail-wrapper.is-home {
  padding: 28px 24px;
  background: #f7f8fa;
}

.detail-paper {
  background: #fff;
  border-radius: 2px;
  border-top: 4px solid #165dff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 44px 56px 40px;
}

.notification-detail-wrapper.is-home .detail-paper {
  max-width: 680px;
  margin: 0 auto;
}

.home-header {
  text-align: center;
  margin-bottom: 18px;
}

.home-title {
  font-size: 26px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 14px;
  line-height: 1.35;
}

.home-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  color: #86909c;
  font-size: 13px;
}

.home-divider {
  height: 1px;
  background: #e5e6eb;
  margin: 18px 0 22px;
}

.home-body {
  font-size: 14px;
  color: #1d2129;
}

.home-greeting {
  font-weight: 600;
  margin-bottom: 12px;
}

.home-summary {
  margin: 0 0 10px;
  color: #4e5969;
}

.home-footer {
  margin-top: 18px;
  text-align: right;
  color: #4e5969;
}

.home-sender {
  font-weight: 600;
  margin-bottom: 6px;
}

.home-date {
  font-size: 13px;
  color: #86909c;
}

.home-attachments {
  margin-top: 22px;
}

.home-attachments-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.home-attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-attachment-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
}

.home-attachment-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #165dff;
  margin-right: 12px;
  font-size: 18px;
  background: rgba(22, 93, 255, 0.08);
  border-radius: 6px;
}

.home-attachment-info {
  flex: 1;
  min-width: 0;
}

.home-attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-attachment-size {
  margin-top: 2px;
  font-size: 12px;
  color: #86909c;
}

.home-download-btn {
  color: #165dff;
}

.detail-header {
  margin-bottom: 20px;
}

.notification-detail-wrapper.is-home .detail-header {
  margin-bottom: 28px;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.notification-detail-wrapper.is-home .detail-meta {
  gap: 14px;
}

.meta-tag {
  border-radius: 2px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #86909c;
}

.detail-summary {
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  border-left: 4px solid #165dff;
}

.detail-assets {
  margin-bottom: 20px;
}

.assets-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.assets-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-content {
  font-size: 15px;
  line-height: 1.8;
  color: #1d2129;
  margin-bottom: 32px;
}

.notification-detail-wrapper.is-home .detail-content {
  font-size: 14px;
  color: #1d2129;
}

.notification-detail-wrapper.is-home .notification-article :deep(p) {
  line-height: 1.9;
  margin: 0 0 14px;
}

.notification-detail-wrapper.is-home .notification-article :deep(a) {
  color: #165dff;
  text-decoration: none;
}

.notification-detail-wrapper.is-home .notification-article :deep(a:hover) {
  text-decoration: underline;
}

.notification-detail-wrapper.is-home .notification-article :deep(ul),
.notification-detail-wrapper.is-home .notification-article :deep(ol) {
  padding-left: 18px;
  margin: 10px 0 16px;
}

.notification-detail-wrapper.is-home .notification-article :deep(li) {
  margin: 6px 0;
}

.notification-article :deep(p) {
  margin-bottom: 16px;
}

.notification-article :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.detail-tags {
  margin-bottom: 32px;
}

.detail-attachments {
  background-color: #f7f8fa;
  padding: 20px;
  border-radius: 8px;
}

.notification-detail-wrapper.is-home .detail-attachments {
  background: transparent;
  padding: 0;
  border-radius: 0;
  margin-top: 18px;
}

.attachment-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
}

.notification-detail-wrapper.is-home .attachment-title {
  font-size: 14px;
  margin-bottom: 12px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-empty {
  border: 1px dashed #c9cdd4;
  border-radius: 6px;
  padding: 12px 14px;
  color: #86909c;
  font-size: 13px;
  background: #fff;
}

.attachment-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s;
}

.attachment-item:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}

.attachment-icon {
  font-size: 24px;
  color: #165dff;
  margin-right: 16px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 2px;
}

.attachment-size {
  font-size: 12px;
  color: #86909c;
}

.download-btn {
  color: #165dff;
}

@media (max-width: 768px) {
  .detail-paper {
    padding: 28px 20px 24px;
  }
}
</style>
