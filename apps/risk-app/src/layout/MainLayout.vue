<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">Data Community</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="lifecycle">外数生命周期</a-menu-item>
        <a-menu-item key="analysis">离线模型分析</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout class="body-layout">
      <a-layout-sider class="main-sider" :width="220" collapsible breakpoint="xl">
        <a-menu :selected-keys="[activeSideMenu]" :default-open-keys="openKeys" @menu-item-click="handleSideMenuClick" :auto-open="true">
          <template v-for="item in currentSideMenus" :key="item.key">
            <a-sub-menu v-if="Array.isArray((item as any).children)" :key="item.key + '-group'">
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

const activeTopMenu = ref('lifecycle')
const activeSideMenu = ref('')
const openKeys = ref(['budget'])

const lifecycleMenus = [
  { key: '/external-data/lifecycle', title: '生命周期总览' },
  { key: '/external-data/archive', title: '外数档案管理' },
  { key: '/external-data/evaluation', title: '外数评估中心' },
  { key: '/external-data/service', title: '外数服务管理' },
  {
    key: 'budget',
    title: '预算管理',
    children: [
      { key: '/budget/overview', title: '预算总览' },
      { key: '/budget/list', title: '预算列表' },
      { key: '/budget/monitor', title: '预算监控' },
      { key: '/budget/contracts', title: '合同管理' },
      { key: '/budget/settlement', title: '结算管理' }
    ]
  }
]

const analysisMenus = [
  { key: '/model-offline-analysis/feature-center', title: '特征中心' },
  { key: '/model-offline-analysis/model-register', title: '模型注册' },
  { key: '/model-offline-analysis/model-backtrack', title: '模型回溯' },
  { key: '/model-offline-analysis/task-management', title: '任务管理' },
  { key: '/model-offline-analysis/model-evaluation', title: '模型评估' }
]

const currentSideMenus = computed(() => {
  return activeTopMenu.value === 'analysis' ? analysisMenus : lifecycleMenus
})

watch(() => route.path, (path) => {
  updateMenuState(path)
}, { immediate: true })

function updateMenuState(path: string) {
  if (path.startsWith('/model-offline-analysis')) activeTopMenu.value = 'analysis'
  else activeTopMenu.value = 'lifecycle'

  if (path.startsWith('/external-data/archive')) activeSideMenu.value = '/external-data/archive'
  else if (path.startsWith('/external-data/evaluation')) activeSideMenu.value = '/external-data/evaluation'
  else if (path.startsWith('/external-data/service')) activeSideMenu.value = '/external-data/service'
  else if (path.startsWith('/budget/overview')) activeSideMenu.value = '/budget/overview'
  else if (path.startsWith('/budget/list')) activeSideMenu.value = '/budget/list'
  else if (path.startsWith('/budget/monitor')) activeSideMenu.value = '/budget/monitor'
  else if (path.startsWith('/budget/contracts')) activeSideMenu.value = '/budget/contracts'
  else if (path.startsWith('/budget/settlement')) activeSideMenu.value = '/budget/settlement'
  else if (path.startsWith('/external-data/lifecycle')) activeSideMenu.value = '/external-data/lifecycle'
  else if (path.startsWith('/model-offline-analysis/feature-center')) activeSideMenu.value = '/model-offline-analysis/feature-center'
  else if (path.startsWith('/model-offline-analysis/model-register')) activeSideMenu.value = '/model-offline-analysis/model-register'
  else if (path.startsWith('/model-offline-analysis/model-backtrack')) activeSideMenu.value = '/model-offline-analysis/model-backtrack'
  else if (path.startsWith('/model-offline-analysis/task-management')) activeSideMenu.value = '/model-offline-analysis/task-management'
  else if (path.startsWith('/model-offline-analysis/model-evaluation')) activeSideMenu.value = '/model-offline-analysis/model-evaluation'
  else activeSideMenu.value = path
}

const handleTopMenuClick = (key: string) => {
  activeTopMenu.value = key
  if (key === 'lifecycle') {
    router.push('/external-data/lifecycle')
  } else if (key === 'analysis') {
    router.push('/model-offline-analysis/feature-center')
  }
}

const handleSideMenuClick = (key: string) => {
  if (key && key !== 'budget') {
    router.push(key)
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-header {
  height: 60px;
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}
.logo {
  margin-right: 40px;
  display: flex;
  align-items: center;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}
.top-menu {
  flex: 1;
}
.body-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
}
.main-sider {
  height: 100%;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-2);
}
.main-content {
  flex: 1;
  background: var(--color-fill-2);
  overflow: auto;
  padding: 16px;
  height: 100%;
}
.content-wrapper {
  background: var(--color-bg-2);
  min-height: 100%;
  padding: 20px;
  border-radius: 4px;
}
</style>
