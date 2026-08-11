<!--
  通用 404 页面 · 文档 B2 E1
  特征ID不存在时显示 + 返回列表按钮
-->
<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h2 class="not-found-title">{{ title || '未找到该特征' }}</h2>
      <p class="not-found-desc">
        {{ message || `特征ID "${featureId}" 不存在或已被删除，请检查链接是否正确。` }}
      </p>
      <a-space>
        <a-button type="primary" @click="handleBack">
          <template #icon><icon-arrow-left /></template>
          返回列表
        </a-button>
        <a-button v-if="onRetry" @click="onRetry">
          <template #icon><icon-refresh /></template>
          重新加载
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  /** 主标题 */
  title?: string
  /** 详细说明 */
  message?: string
  /** 特征ID（用于错误提示） */
  featureId?: string
  /** 返回路径（默认 /variable-management） */
  backPath?: string
  /** 重新加载回调 */
  onRetry?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  featureId: '',
  backPath: '/variable-management'
})

const router = useRouter()

function handleBack() {
  router.push(props.backPath)
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}
.not-found-content {
  text-align: center;
  max-width: 480px;
}
.not-found-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.not-found-title {
  font-size: 22px;
  color: var(--color-text-1, #1d2129);
  margin: 0 0 12px 0;
}
.not-found-desc {
  font-size: 14px;
  color: var(--color-text-3, #86909c);
  margin: 0 0 24px 0;
  line-height: 1.6;
}
</style>
