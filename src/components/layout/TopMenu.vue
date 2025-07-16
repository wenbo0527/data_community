<template>
  <a-menu 
    mode="horizontal" 
    :selected-keys="selectedKeys" 
    @menu-item-click="handleMenuClick"
    class="top-menu"
  >
    <a-menu-item 
      v-for="menuKey in topMenuOrder" 
      :key="menuKey"
      :class="{ 'menu-item-active': selectedKeys.includes(menuKey) }"
    >
      {{ menuConfig[menuKey].title }}
    </a-menu-item>
  </a-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MENU_CONFIG, TOP_MENU_ORDER, getMenuItemByPath, getModuleDefaultPath } from '../../config/menuConfig'
import { navigateTo } from '../../router/utils'

const router = useRouter()
const route = useRoute()

// 菜单配置
const menuConfig = MENU_CONFIG
const topMenuOrder = TOP_MENU_ORDER

// 选中的菜单项
const selectedKeys = ref([])

// 事件定义
const emit = defineEmits(['menu-change'])

// 根据当前路由更新选中状态
const updateSelectedFromRoute = () => {
  const menuInfo = getMenuItemByPath(route.path)
  if (menuInfo) {
    const newSelectedKeys = [menuInfo.module]
    if (JSON.stringify(selectedKeys.value) !== JSON.stringify(newSelectedKeys)) {
      selectedKeys.value = newSelectedKeys
      emit('menu-change', menuInfo.module)
    }
  } else {
    // 默认选中首页或第一个菜单
    const defaultKey = route.path === '/' ? 'home' : topMenuOrder[1] // discovery
    if (!selectedKeys.value.includes(defaultKey)) {
      selectedKeys.value = [defaultKey]
      emit('menu-change', defaultKey)
    }
  }
}

// 处理菜单点击
const handleMenuClick = (key) => {
  try {
    selectedKeys.value = [key]
    emit('menu-change', key)
    
    // 跳转到对应页面
    if (key === 'home') {
      navigateTo(router, menuConfig.home.path)
    } else {
      const defaultPath = getModuleDefaultPath(key)
      if (defaultPath) {
        navigateTo(router, defaultPath)
      }
    }
  } catch (error) {
    console.error('顶部菜单点击错误:', error)
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateSelectedFromRoute()
  },
  { immediate: true }
)

// 暴露方法供父组件调用
defineExpose({
  setActiveMenu: (menuKey) => {
    selectedKeys.value = [menuKey]
  }
})
</script>

<style scoped>
.top-menu {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e6eb;
}

.menu-item-active {
  color: rgb(var(--primary-6)) !important;
  font-weight: 600;
}

:deep(.arco-menu-horizontal .arco-menu-item) {
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
}

:deep(.arco-menu-horizontal .arco-menu-item:hover) {
  background-color: var(--color-fill-2);
}
</style>