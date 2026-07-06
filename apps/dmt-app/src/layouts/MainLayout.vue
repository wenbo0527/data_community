<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数据管理</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="variable">变量一体化管理</a-menu-item>
        <a-menu-item key="business">业务数据目录</a-menu-item>
        <a-menu-item key="asset">数据资产管理</a-menu-item>
        <a-menu-item key="standard">数据标准治理</a-menu-item>
        <a-menu-item key="classify">数据分级分类</a-menu-item>
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

const activeTopMenu = ref('variable')
const activeSideMenu = ref('')
const openKeys = ref(['variable'])

// ========== 变量一体化管理 ==========
const variableMenus = [
  { key: '/variable-hub', title: '一体化总览' },
  { key: '/variable-management', title: '变量台账' },
  { key: '/explore/map', title: '变量全景' },
  { key: '/evaluation/tasks', title: '评估任务中心' },
  {
    key: 'explore',
    title: '探索过程',
    children: [
      { key: '/explore/topics', title: '探索课题' }
    ]
  },
  {
    key: 'config',
    title: '模块配置',
    children: [
      { key: '/explore/taxonomy', title: '探索分类管理' }
    ]
  }
]

// ========== 业务数据目录 ==========
const businessMenus = [
  { key: '/business-concept', title: '业务概念' }
]

// ========== 数据资产管理 ==========
const assetMenus = [
  { key: '/metadata', title: '元数据管理' },
  { key: '/asset-management/basic-management/metadata-collection', title: '元数据采集' },
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
  { key: '/service/backtrack', title: '全量变量回溯' },
  { key: '/service/fund-usage-query', title: '客户资金用途查询' },
  { key: '/service/detail-data-query', title: '明细查询服务管理' },
  { key: '/service/api-management', title: 'API管理' },
  { key: '/data-models', title: '数据服务模型管理' },
  { key: '/accompany', title: '陪跑计划' }
]

// ========== 数据分级分类（PRD v1.0-rc.2）==========
const classifyMenus = [
  { key: '/metadata/classify/matrix', title: '分级分类列表' },
  { key: '/metadata/classify/sources', title: '数据信息' }
]

const menuMap: Record<string, any[]> = {
  variable: variableMenus,
  business: businessMenus,
  asset: assetMenus,
  standard: standardMenus,
  classify: classifyMenus,
  service: serviceMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || variableMenus
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
    } else if (path.startsWith(item.key + '/') || path === item.key) {
      activeSideMenu.value = item.key
      openKeys.value = []
      return
    }
  }
  activeSideMenu.value = ''
  openKeys.value = []
}

function handleTopMenuClick(key: string) {
  activeTopMenu.value = key
  const menus = menuMap[key] || []
  if (menus.length > 0) {
    router.push(menus[0].key)
  }
}

function handleSideMenuClick(key: string) {
  if (!key.startsWith('/')) return
  router.push(key)
}

watch(() => route.path, (path) => {
  // Auto-detect top menu based on path
  if (
    path === '/' ||
    path.includes('variable-hub') ||
    path.includes('variable-management') ||
    path.includes('explore') ||
    path.includes('evaluation')
  ) {
    activeTopMenu.value = 'variable'
  } else if (path.includes('business-concept')) {
    activeTopMenu.value = 'business'
  } else if (
    path.includes('asset-management') ||
    path.includes('classify/')
  ) {
    activeTopMenu.value = path.includes('classify') ? 'classify' : 'asset'
  } else if (path.includes('data-standard')) {
    activeTopMenu.value = 'standard'
  } else if (path.includes('service') || path.includes('data-models') || path.includes('accompany')) {
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
