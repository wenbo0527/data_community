<template>
  <a-card class="comment-panel" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-message class="title-icon" />
        <span>协作注释</span>
        <a-tag size="small">{{ comments.length }} 条</a-tag>
      </div>
    </template>
    <template #extra>
      <a-link @click="showAddComment = true">
        <template #icon><icon-plus /></template>
        添加注释
      </a-link>
    </template>

    <div v-if="comments.length === 0" class="empty">
      <a-empty description="还没有注释,做第一个吧" />
    </div>

    <div v-else class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <a-avatar :size="32" class="comment-avatar">
          {{ comment.userName.charAt(0) }}
        </a-avatar>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-user">{{ comment.userName }}</span>
            <a-tag v-if="comment.commentType === 'issue'" color="red" size="small">
              {{ comment.resolved ? '已解决' : '待解决' }}
            </a-tag>
            <a-tag v-else-if="comment.commentType === 'rating'" color="orange" size="small">
              评分 {{ comment.rating }}/5
            </a-tag>
            <a-tag v-else-if="comment.commentType === 'suggestion'" color="arcoblue" size="small">
              建议
            </a-tag>
            <span class="comment-time">{{ comment.createTime }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <a-button type="text" size="mini" @click="onLike(comment.id)">
              <template #icon><icon-heart /></template>
              {{ comment.likeCount }}
            </a-button>
            <a-button type="text" size="mini" @click="onReply(comment.id)">
              <template #icon><icon-message /></template>
              回复
            </a-button>
            <a-button
              v-if="comment.commentType === 'issue' && !comment.resolved"
              type="text"
              size="mini"
              status="success"
              @click="onResolve(comment.id)"
            >
              <template #icon><icon-check /></template>
              标记解决
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加注释对话框 -->
    <a-modal
      v-model:visible="showAddComment"
      title="添加注释"
      :width="560"
      @ok="handleAdd"
      @cancel="showAddComment = false"
    >
      <a-form :model="newComment" layout="vertical">
        <a-form-item label="类型">
          <a-radio-group v-model="newComment.commentType">
            <a-radio value="comment">评论</a-radio>
            <a-radio value="rating">评分</a-radio>
            <a-radio value="suggestion">建议</a-radio>
            <a-radio value="issue">问题</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="newComment.commentType === 'rating'" label="评分">
          <a-rate v-model="newComment.rating" />
        </a-form-item>
        <a-form-item v-else label="内容" required>
          <a-textarea
            v-model="newComment.content"
            :placeholder="placeholder"
            :max-length="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  IconMessage,
  IconPlus,
  IconHeart,
  IconCheck
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { CommentStore, type ResourceType, type CommentType } from '@/mock/shared/comment-store'

const props = defineProps<{
  resourceType: ResourceType
  resourceId: string
  userId: string
  userName: string
}>()

const comments = computed(() => CommentStore.byResource(props.resourceType, props.resourceId))

const showAddComment = ref(false)

const newComment = reactive({
  commentType: 'comment' as CommentType,
  rating: 5,
  content: ''
})

const placeholder = computed(() => ({
  comment: '对这个资源有什么看法?',
  suggestion: '您有什么改进建议?',
  issue: '发现了什么问题?'
}[newComment.commentType] || ''))

const onLike = (commentId: string) => {
  CommentStore.like(commentId)
  Message.success('点赞成功')
}

const onReply = (commentId: string) => {
  Message.info(`回复功能开发中...`)
}

const onResolve = (commentId: string) => {
  CommentStore.resolve(commentId)
  Message.success('已标记解决')
}

const handleAdd = () => {
  if (newComment.commentType !== 'rating' && !newComment.content.trim()) {
    Message.warning('请填写内容')
    return
  }
  CommentStore.add({
    resourceType: props.resourceType,
    resourceId: props.resourceId,
    commentType: newComment.commentType,
    content: newComment.commentType === 'rating' ? `评分 ${newComment.rating} 星` : newComment.content,
    rating: newComment.commentType === 'rating' ? newComment.rating : undefined,
    userId: props.userId,
    userName: props.userName,
    replyCount: 0,
    resolved: false
  })
  Message.success('注释已添加')
  newComment.content = ''
  newComment.commentType = 'comment'
  newComment.rating = 5
  showAddComment.value = false
}
</script>

<style lang="scss" scoped>
.comment-panel {
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      color: #165dff;
      font-size: 18px;
    }
  }

  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }

    .comment-avatar {
      flex-shrink: 0;
      background: #165dff;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }

    .comment-body {
      flex: 1;
      min-width: 0;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .comment-user {
        font-size: 13px;
        font-weight: 500;
        color: #1d2129;
      }

      .comment-time {
        font-size: 11px;
        color: #c9cdd4;
      }
    }

    .comment-content {
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      margin-bottom: 6px;
    }

    .comment-actions {
      display: flex;
      gap: 4px;
    }
  }
}
</style>