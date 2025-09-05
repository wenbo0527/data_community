<template>
  <a-layout class="layout-container">
    <!-- 顶部菜单栏 -->
    <a-layout-header class="top-menu-header">
      <TopMenu @menu-change="handleTopMenuChange" ref="topMenuRef" />
    </a-layout-header>

    <a-layout>
      <!-- 侧边菜单栏 -->
      <a-layout-sider 
        :collapsed="collapsed" 
        :breakpoint="breakpoint" 
        :width="220" 
        :collapsible="true"
        @collapse="handleCollapse" 
        class="layout-sider" 
        v-show="showSideMenu"
      >
        <SideMenu 
          :active-module="activeModule"
          :collapsed="collapsed"
          :is-detail-page="isDetailPage"
          ref="sideMenuRef"
        />
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout>
        <a-layout-header class="layout-header">
          <a-space>
            <a-button type="text" @click="toggleCollapse">
              <template #icon>
                <icon-menu-fold v-if="!collapsed" />
                <icon-menu-unfold v-else />
              </template>
            </a-button>
            <BreadcrumbNav :current-path="route.path" />
          </a-space>
        </a-layout-header>
        
        <a-layout-content class="layout-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopMenu from './TopMenu.vue'
import SideMenu from './SideMenu.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import { getMenuItemByPath } from '../../config/menuConfig'
import {
  IconMenuFold,
  IconMenuUnfold
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

// 组件引用
const topMenuRef = ref(null)
const sideMenuRef = ref(null)

// 布局状态
const collapsed = ref(false)
const breakpoint = 'xl'
const activeModule = ref('discovery')

// 计算是否为详情页
const isDetailPage = computed(() => {
  return route.path.includes('/detail') || route.path.includes('/customer360/')
})

// 计算是否显示侧边菜单
const showSideMenu = computed(() => {
  // 首页不显示侧边菜单
  return activeModule.value !== 'home'
})

// 处理顶部菜单变化
const handleTopMenuChange = (moduleKey) => {
  console.log('顶部菜单变化:', moduleKey)
  activeModule.value = moduleKey
  
  // 清空侧边菜单搜索
  if (sideMenuRef.value) {
    sideMenuRef.value.clearSearch()
  }
}

// 处理侧边栏折叠
const handleCollapse = (val) => {
  collapsed.value = val
}

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 根据路由更新活动模块
const updateActiveModuleFromRoute = () => {
  const menuInfo = getMenuItemByPath(route.path)
  if (menuInfo && menuInfo.module !== activeModule.value) {
    activeModule.value = menuInfo.module
    
    // 只在需要时更新顶部菜单选中状态，避免重复调用
    if (topMenuRef.value && !topMenuRef.value.selectedKeys?.includes(menuInfo.module)) {
      topMenuRef.value.setActiveMenu(menuInfo.module)
    }
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateActiveModuleFromRoute()
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(() => {
  console.log('MainLayout 组件挂载完成')
  updateActiveModuleFromRoute()
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-menu-header {
  padding: 0 24px;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 48px;
  line-height: 48px;
}

.layout-sider {
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
}

.layout-header {
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-2);
  height: 48px;
  line-height: 48px;
}

.layout-content {
  background: #f5f5f5;
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

:deep(.arco-layout-sider-trigger) {
  background: #fff;
  border-top: 1px solid var(--color-border-2);
}
</style>