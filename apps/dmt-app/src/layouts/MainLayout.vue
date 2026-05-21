<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数据管理</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="business">业务数据目录</a-menu-item>
        <a-menu-item key="asset">数据资产管理</a-menu-item>
        <a-menu-item key="standard">数据标准治理</a-menu-item>
        <a-menu-item key="service">数据服务管理</a-menu-item>
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

console.log('[DMT-MainLayout] route:', route.path)

const activeTopMenu = ref('business')
const activeSideMenu = ref('')
const openKeys = ref(['business'])

// ========== 业务数据目录 ==========
const businessMenus = [
  { key: '/business-domain', title: '业务域管理' },
  { key: '/business-entity', title: '业务实体管理' },
  { key: '/business-graph', title: '业务图谱' }
]

// ========== 数据资产管理 ==========
const assetMenus = [
  { key: '/asset-management/basic-management/metadata-collection', title: '元数据采集' },
  { key: '/metadata/modeling', title: '元数据建模' },
  { key: '/asset-management/listing-management/table-management', title: '数据资源上下架' },
  { key: '/asset-management/listing-management/metric-management', title: '数据要素上下架' },
  { key: '/asset-management/basic-management/tag-management', title: '标签管理' }
]

// ========== 数据标准治理 ==========
const standardMenus = [
  { key: '/data-standard', title: '数据标准管理' },
  { key: '/data-standard/domains', title: '技术数据域管理' },
  { key: '/data-standard/codes', title: '标准代码管理' },
  { key: '/data-standard/words', title: '标准单词管理' },
  { key: '/data-standard/audit', title: '标准稽核管理' }
]

// ========== 数据服务管理 ==========
const serviceMenus = [
  { key: '/service', title: '服务首页' },
  { key: '/service/detail-data-query', title: '明细查询服务管理' },
  { key: '/service/api-management', title: 'API管理' },
  { key: '/data-models', title: '数据服务模型管理' },
  { key: '/service/monitor', title: '服务监控' },
  { key: '/service/stats', title: '调用统计' }
]

const menuMap: Record<string, any[]> = {
  business: businessMenus,
  asset: assetMenus,
  standard: standardMenus,
  service: serviceMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || businessMenus
})

function updateMenuState(path: string) {
  for (const menu of currentSideMenus.value) {
    if ((menu as any).key === path || path.startsWith((menu as any).key)) {
      activeSideMenu.value = (menu as any).key
      return
    }
  }
  activeSideMenu.value = ''
}

function handleTopMenuClick(key: string) {
  activeTopMenu.value = key
  const menus = menuMap[key] || []
  if (menus.length > 0) {
    router.push(menus[0].key)
  }
}

function handleSideMenuClick(key: string) {
  router.push(key)
}

watch(() => route.path, (path) => {
  // Auto-detect top menu based on path
  if (path.includes('business-domain') || path.includes('business-entity') || path.includes('business-graph')) {
    activeTopMenu.value = 'business'
  } else if (path.includes('asset-management') || path.includes('metadata')) {
    activeTopMenu.value = 'asset'
  } else if (path.includes('data-standard')) {
    activeTopMenu.value = 'standard'
  } else if (path.includes('service') || path.includes('data-models')) {
    activeTopMenu.value = 'service'
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