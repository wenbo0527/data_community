<template>
  <div class="risk-model-offline-layout">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <p class="page-description">{{ pageDescription }}</p>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useModelOfflineStore } from '@/store/modules/model-offline'

const route = useRoute()
const store = useModelOfflineStore()

// 页面标题和描述
const pageTitle = computed(() => route.meta?.title || '模型离线分析')

const pageDescription = computed(() => '模型离线分析平台')

// 监听路由变化，更新活跃菜单
watch(() => route.name, (newName) => {
  store.setActiveMenu(newName)
}, { immediate: true })
</script>

<style scoped>
.risk-model-offline-layout {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
}

.page-description {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.page-content {
  background: #fff;
  border-radius: 6px;
  padding: 24px;
}
</style>
