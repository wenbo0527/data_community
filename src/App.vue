<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'

const route = useRoute()

// 简化布局逻辑，避免递归更新
const layoutType = computed(() => {
  // 检查路由元数据中的布局设置
  if (route.meta?.layout) {
    return route.meta.layout
  }
  
  // 默认不使用 MainLayout 的页面
  const blankLayoutPaths = ['/login', '/', '/home']
  if (blankLayoutPaths.includes(route.path)) {
    return 'blank'
  }
  
  // 测试页面使用独立布局
  if (route.path.startsWith('/test/')) {
    return 'blank'
  }
  
  // 其他页面使用 MainLayout
  return 'main'
})
</script>

<template>
  <main-layout v-if="layoutType === 'main'">
    <router-view />
  </main-layout>
  <router-view v-else />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
