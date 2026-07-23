<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数据探索</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="c360">客户360</a-menu-item>
        <a-menu-item key="metric">指标看板</a-menu-item>
        <a-menu-item key="analysis">分析工作台</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout class="body-layout">
      <a-layout-sider class="main-sider" :width="240" collapsible breakpoint="xl">
        <a-menu :selected-keys="[activeSideMenu]" :default-open-keys="openKeys" @menu-item-click="handleSideMenuClick" :auto-open="true">
          <template v-for="item in currentSideMenus" :key="item.key">
            <a-sub-menu v-if="Array.isArray((item as any).children)" :key="item.key">
              <template #title>{{ item.title }}</template>
              <a-menu-item v-for="child in (item as any).children" :key="child.key">{{ child.title }}</a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.key">{{ item.title }}</a-menu-item>
          </template>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

console.log('[DEX-MainLayout] route:', route.path)

const activeTopMenu = ref('c360')
const activeSideMenu = ref('')
const openKeys = ref(['c360'])

// ========== 客户360 ==========
const c360Menus = [
  { key: '/customer360', title: '客户搜索页' },
  { key: '/customer360/detail', title: '客户详情' }
]

// ========== 指标看板 ==========
const metricMenus = [
  { key: '/indicator-dashboard', title: '看板首页' },
  { key: '/indicator-dashboard/config', title: '指标配置' },
  { key: '/indicator-dashboard/realtime', title: '实时监控' }
]

// ========== 分析工作台 ==========
const analysisMenus = [
  { key: '/analytics-workbench', title: '工作台首页' },
  { key: '/analytics-workbench/query', title: '数据查询' },
  { key: '/analytics-workbench/visual', title: '可视化分析' },
  { key: '/analytics-workbench/export', title: '报表导出' }
]

// ========== 客群中心 ==========
const customerCenterMenus = [
  { key: '/exploration/customer-center', title: '客群首页' },
  {
    key: 'audience-group',
    title: '人群管理',
    children: [
      { key: '/exploration/customer-center/audience-system', title: '人群列表' },
      { key: '/exploration/customer-center/audience-system/audience-create', title: '创建人群' }
    ]
  },
  { key: '/exploration/customer-center/tag-system', title: '标签系统' },
  { key: '/exploration/customer-center/datasource', title: '数据源' }
]

// ========== 外部数据 ==========
const externalDataMenus = [
  { key: '/exploration/external-data-evaluation', title: '数据评估' },
  { key: '/exploration/external-data-evaluation/create', title: '创建评估' },
  { key: '/exploration/external-data-analysis', title: '数据分析' },
  { key: '/exploration/external-data-monitor', title: '数据监控' }
]

// ========== 工作流 ==========
const workflowMenus = [
  { key: '/exploration/workflows', title: '工作流列表' },
  { key: '/exploration/workflows/create', title: '创建工作流' },
  { key: '/exploration/workflows/editor', title: '工作流编辑器' }
]

const menuMap: Record<string, any[]> = {
  c360: c360Menus,
  metric: metricMenus,
  analysis: analysisMenus,
  customer: customerCenterMenus,
  external: externalDataMenus,
  workflow: workflowMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || c360Menus
})

function updateMenuState(path: string) {
  // Update active side menu based on current path
  for (const menu of currentSideMenus.value) {
    if ((menu as any).key === path || path.startsWith((menu as any).key)) {
      activeSideMenu.value = (menu as any).key
      return
    }
    if ((menu as any).children) {
      for (const child of (menu as any).children) {
        if (path.startsWith(child.key)) {
          activeSideMenu.value = child.key
          openKeys.value = [menu.key]
          return
        }
      }
    }
  }
  activeSideMenu.value = ''
}

function handleTopMenuClick(key: string) {
  activeTopMenu.value = key
  const menus = menuMap[key] || []
  if (menus.length > 0) {
    const firstMenu = menus[0]
    const targetKey = (firstMenu as any).children ? (firstMenu as any).children[0].key : (firstMenu as any).key
    router.push(targetKey)
  }
}

function handleSideMenuClick(key: string) {
  router.push(key)
}

watch(() => route.path, (path) => {
  // Auto-detect top menu based on path
  if (path.includes('indicator') || path.includes('metric')) {
    activeTopMenu.value = 'metric'
  } else if (path.includes('analytics') || path.includes('workbench')) {
    activeTopMenu.value = 'analysis'
  } else if (path.includes('exploration')) {
    activeTopMenu.value = 'c360'
  } else {
    activeTopMenu.value = 'c360'
  }
  updateMenuState(path)
}, { immediate: true })
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100vh;
  background: #f5f6f7;
}

.main-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5e6e8;
  padding: 0 24px;
  height: 56px;
  line-height: 56px;
}

.logo {
  width: 200px;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
}

.top-menu {
  border-bottom: none;
}

.body-layout {
  background: #f5f6f7;
}

.main-sider {
  background: #fff;
  margin: 16px 0 16px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.main-content {
  margin: 16px;
  overflow-y: auto;
}

.content-wrapper {
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 56px - 32px);
  padding: 24px;
}
</style>