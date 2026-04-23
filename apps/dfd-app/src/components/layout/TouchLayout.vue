<template>
  <div class="touch-layout">
    <!-- 触达系统通用头部可以放在这里 -->
    <div class="touch-header" v-if="$route.name !== 'TouchIndex'">
      <a-breadcrumb>
        <a-breadcrumb-item>触达系统</a-breadcrumb-item>
        <a-breadcrumb-item>{{ currentPageTitle }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    
    <!-- 子路由内容 -->
    <div class="touch-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title || route.name || ''
})
</script>

<style scoped>
.touch-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.touch-header {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.touch-content {
  flex: 1;
  overflow: auto;
}
</style>