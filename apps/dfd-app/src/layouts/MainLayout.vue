<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数据发现</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="asset">数据资产</a-menu-item>
        <a-menu-item key="dataMap">数据地图</a-menu-item>
        <a-menu-item key="resource">数据资源</a-menu-item>
        <a-menu-item key="ops">运营工具</a-menu-item>
        <a-menu-item key="search">统一搜索</a-menu-item>
        <a-menu-item key="other">其他</a-menu-item>
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

console.log('[DFD-MainLayout] route:', route.path)

const activeTopMenu = ref('asset')
const activeSideMenu = ref('')
const openKeys = ref(['asset'])

// ========== 数据资产（默认）==========
const assetMenus = [
  { key: '/asset-catalog', title: '资产目录' },
  { key: '/asset-overview', title: '资产总览' },
  { key: '/asset-management', title: '资产管理' },
  { key: '/favorites', title: '资产收藏' }
]

// ========== 数据地图 ==========
const dataMapMenus = [
  { key: '/data-map', title: '数据地图' },
  { key: '/metrics-map', title: '指标地图' },
  { key: '/variable-map', title: '变量地图' },
  { key: '/feature-map', title: '特征地图' },
  {
    key: 'dict-group',
    title: '数据字典',
    children: [
      { key: '/indicator-dict', title: '指标字典' },
      { key: '/variable-dict', title: '变量字典' },
      { key: '/feature-dict', title: '特征字典' }
    ]
  }
]

// ========== 数据资源 ==========
const resourceMenus = [
  { key: '/data-resources', title: '数据资源总览' },
  { key: '/data-resources/system-data', title: '系统数据' },
  { key: '/data-resources/external-data', title: '外部数据' },
  { key: '/data-resources/file-import', title: '文件导入' },
  { key: '/data-resources/log-data', title: '日志数据' },
  { key: '/data-resources/real-time-data', title: '实时数据' },
  { key: '/external', title: '外部数据详情' }
]

// ========== 运营工具 ==========
const opsMenus = [
  { key: '/lineage', title: '全链路血缘' },
  { key: '/impact-analysis', title: '变更影响分析' },
  { key: '/customer360', title: '客户360' },
  { key: '/credit', title: '征信' },
  { key: '/batch-registration', title: '批量注册指标' },
  { key: '/regulatory-config', title: '监管报表配置' }
]

// ========== 统一搜索 ==========
const searchMenus = [
  { key: '/search', title: '统一搜索' },
  { key: '/indicator-dashboard', title: '指标看板' },
  { key: '/unified-metrics', title: '统一指标' }
]

// ========== 其他 ==========
const otherMenus = [
  { key: '/api-market', title: 'API市场' }
]

const menuMap: Record<string, any[]> = {
  asset: assetMenus,
  dataMap: dataMapMenus,
  resource: resourceMenus,
  ops: opsMenus,
  search: searchMenus,
  other: otherMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || assetMenus
})

function updateMenuState(path: string) {
  // 精确匹配
  for (const menu of currentSideMenus.value) {
    const item = menu as any
    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (child.key === path) {
          activeSideMenu.value = child.key
          openKeys.value = [item.key]
          return
        }
      }
    } else if (item.key === path) {
      activeSideMenu.value = item.key
      openKeys.value = []
      return
    }
  }
  // 模糊匹配（startsWith）：用完整 key 不带斜杠
  for (const menu of currentSideMenus.value) {
    const item = menu as any
    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (path.startsWith(child.key)) {
          activeSideMenu.value = child.key
          openKeys.value = [item.key]
          return
        }
      }
    } else if (path.startsWith(item.key)) {
      activeSideMenu.value = item.key
      openKeys.value = []
      return
    }
  }
}

function handleTopMenuClick(key: string) {
  activeTopMenu.value = key
  // 切到 top menu 后默认激活第一个 side menu 项
  const first = currentSideMenus.value[0] as any
  if (first) {
    if (Array.isArray(first.children) && first.children.length > 0) {
      activeSideMenu.value = first.children[0].key
      openKeys.value = [first.key]
      router.push(first.children[0].key).catch(() => {})
    } else {
      activeSideMenu.value = first.key
      openKeys.value = []
      router.push(first.key).catch(() => {})
    }
  }
}

function handleSideMenuClick(key: string) {
  activeSideMenu.value = key
  router.push(key).catch(() => {})
}

watch(
  () => route.path,
  (newPath) => {
    updateMenuState(newPath)
  },
  { immediate: true }
)
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
}

.main-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5e6e8;
  padding: 0 24px;
  height: 56px;
  flex-shrink: 0;
}

.logo {
  width: 200px;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.top-menu {
  flex: 1;
  border-bottom: none !important;
}

.body-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-sider {
  background: #fff;
  border-right: 1px solid #e5e6eb;
  overflow-y: auto;
  height: calc(100vh - 56px);
  box-sizing: border-box !important;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f0f2f5;
  box-sizing: border-box !important;
}

.content-wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  overflow: hidden;
}
</style>