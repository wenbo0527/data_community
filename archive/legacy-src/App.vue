<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'
import { useRegistryStore } from '@/store'

const route = useRoute()

// 初始化微应用注册中心
onMounted(async () => {
  const registryStore = useRegistryStore()
  await registryStore.loadAll()
  console.log('[Registry] 初始化完成，已加载应用:', registryStore.appCount)
})

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
  <MainLayout v-if="layoutType === 'main'">
    <router-view />
  </MainLayout>
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
