<template>
  <div class="placeholder-container">
    <div class="placeholder-content">
      <icon-tool class="placeholder-icon" />
      <h2 class="placeholder-title">{{ title || '功能建设中' }}</h2>
      <p class="placeholder-desc">{{ description || '该模块正在紧张开发中，敬请期待...' }}</p>
      <a-button type="primary" @click="handleBack">返回上一页</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IconTool } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  title: String,
  description: String
})

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.placeholder-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.placeholder-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-icon {
  font-size: 64px;
  color: #c9cdd4;
  margin-bottom: 8px;
}

.placeholder-title {
  font-size: 24px;
  color: #1d2129;
  margin: 0;
  font-weight: 500;
}

.placeholder-desc {
  font-size: 14px;
  color: #86909c;
  margin: 0 0 16px 0;
  max-width: 400px;
}
</style>