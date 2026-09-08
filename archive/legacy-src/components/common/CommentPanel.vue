<template>
  <div class="comment-panel">
    <!-- 添加评论 -->
    <div class="comment-input">
      <a-textarea
        v-model="newContent"
        placeholder="请输入评论内容..."
        :max-length="500"
        show-word-limit
        :auto-size="{ minRows: 3, maxRows: 6 }"
      />
      <div class="comment-toolbar">
        <a-select v-model="newType" style="width: 120px" placeholder="类型">
          <a-option value="note">笔记</a-option>
          <a-option value="question">提问</a-option>
          <a-option value="suggestion">建议</a-option>
          <a-option value="issue">问题</a-option>
        </a-select>
        <a-button type="primary" :disabled="!newContent.trim()" @click="submitComment">
          发表评论
        </a-button>
      </div>
    </div>

    <a-divider />

    <!-- 评论列表 -->
    <div class="comment-list">
      <a-empty v-if="comments.length === 0" description="暂无评论" />
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <a-avatar :style="{ backgroundColor: avatarColor(comment.author) }">
            {{ comment.author.charAt(0) }}
          </a-avatar>
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <a-tag :color="typeColor(comment.type)" size="small">
              {{ typeLabel(comment.type) }}
            </a-tag>
            <span class="comment-time">{{ comment.timestamp }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { CommentStore, type AssetComment, type CommentType } from '@/mock/shared/comment-store'

const props = defineProps<{
  resourceType: string
  resourceId: string
  userId: string
  userName: string
}>()

const newContent = ref('')
const newType = ref<CommentType>('note')
const comments = ref<AssetComment[]>([])

function loadComments() {
  comments.value = CommentStore.byResource(props.resourceId)
}

function submitComment() {
  if (!newContent.value.trim()) return
  CommentStore.add({
    resourceId: props.resourceId,
    resourceType: props.resourceType as any,
    type: newType.value,
    author: props.userName,
    content: newContent.value.trim(),
    timestamp: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  })
  newContent.value = ''
  newType.value = 'note'
  Message.success('评论发表成功')
  loadComments()
}

const typeLabels: Record<string, string> = {
  note: '笔记',
  question: '提问',
  suggestion: '建议',
  issue: '问题'
}

function typeLabel(type: string) {
  return typeLabels[type] || type
}

const typeColors: Record<string, string> = {
  note: 'gray',
  question: 'blue',
  suggestion: 'green',
  issue: 'red'
}

function typeColor(type: string) {
  return typeColors[type] || 'gray'
}

const avatarColors = ['#165dff', '#0fc6c2', '#722ed1', '#f77234', '#37d1a6', '#ff6b6b']

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length
  return avatarColors[idx]
}

onMounted(loadComments)
</script>

<style scoped>
.comment-panel {
  max-width: 100%;
}

.comment-input {
  margin-bottom: 12px;
}

.comment-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  gap: 12px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
}

.comment-time {
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: auto;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-1);
  word-break: break-word;
}
</style>
