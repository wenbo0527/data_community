<template>
  <a-breadcrumb :style="{ marginLeft: '24px', color: '#666' }" separator="/">
    <a-breadcrumb-item>
      <router-link to="/">首页</router-link>
    </a-breadcrumb-item>
    <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
      <router-link v-if="item.path && !item.isLast" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { getMenuItemByPath, MENU_CONFIG } from '../../config/menuConfig'

const props = defineProps({
  currentPath: {
    type: String,
    required: true
  }
})

// 生成面包屑导航
const breadcrumbItems = computed(() => {
  const menuInfo = getMenuItemByPath(props.currentPath)
  if (!menuInfo) return []

  const items = []
  
  // 添加模块名称
  const moduleConfig = MENU_CONFIG[menuInfo.module]
  if (moduleConfig) {
    items.push({
      title: moduleConfig.title,
      path: moduleConfig.defaultPath,
      isLast: false
    })
  }

  // 添加当前页面
  if (menuInfo.title && menuInfo.title !== moduleConfig?.title) {
    items.push({
      title: menuInfo.title,
      path: null,
      isLast: true
    })
  }

  return items
})
</script>

<style scoped>
:deep(.arco-breadcrumb-item-link) {
  color: #666;
  text-decoration: none;
}

:deep(.arco-breadcrumb-item-link:hover) {
  color: rgb(var(--primary-6));
}
</style>