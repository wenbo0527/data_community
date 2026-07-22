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
        <!-- 产品说明浮动按钮（页面顶部居右） -->
        <div class="prd-fab">
          <a-button
            type="primary"
            shape="circle"
            size="large"
            @click="openPrdDrawer"
            title="查看当前页面产品说明"
          >
            <template #icon><IconBook /></template>
          </a-button>
        </div>
      </a-layout-content>
    </a-layout>

    <!-- 产品说明抽屉（右侧滑出） -->
    <a-drawer
      :visible="prdDrawerVisible"
      placement="right"
      :width="720"
      :title="prdDrawerTitle"
      :mask="true"
      :mask-closable="true"
      :esc-to-close="true"
      :hide-cancel="true"
      :ok-text="'关闭'"
      @ok="prdDrawerVisible = false"
      @cancel="prdDrawerVisible = false"
      @close="prdDrawerVisible = false"
    >
      <!-- PRD 元信息栏（ID / 层级 / 责任人 / 状态 / 更新日期） -->
      <div class="prd-meta" v-if="prdInfo">
        <a-space :size="6" wrap>
          <a-tag color="arcoblue">{{ prdInfo.id }}</a-tag>
          <a-tag :color="levelTagColor[prdInfo.level] || 'gray'">{{ prdInfo.level }} · {{ levelLabel[prdInfo.level] }}</a-tag>
          <a-tag :color="statusTagColor[prdInfo.status]">{{ statusLabel[prdInfo.status] }}</a-tag>
          <a-tag>👤 {{ prdInfo.owner }}</a-tag>
          <a-tag>🕒 {{ prdInfo.updatedAt }}</a-tag>
          <a-tag class="prd-key-tag" v-if="prdInfoKey">{{ prdInfoKey }}</a-tag>
        </a-space>
      </div>
      <!-- 多内容并列（如该 key 对应多份 PRD） -->
      <a-alert
        v-if="sameKeySiblings.length > 1"
        type="info"
        :show-icon="false"
        class="prd-siblings"
        style="margin: 8px 0 0"
      >
        <template #title>此 key 关联了 {{ sameKeySiblings.length }} 份 PRD 文档</template>
        <a-space :size="6" wrap>
          <a-tag v-for="t in sameKeySiblings" :key="t.key" :color="t.key === prdInfoKey ? 'arcoblue' : 'gray'">
            {{ t.title }}
          </a-tag>
        </a-space>
      </a-alert>
      <div class="prd-drawer-body">
        <MarkdownLite :source="prdContent" />
      </div>
    </a-drawer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IconBook } from '@arco-design/web-vue/es/icon'
import MarkdownLite from '@/components/common/MarkdownLite.vue'
import {
  getPrdForRoute,
  getPrdTitle,
  getPrdKeyForRoute,
  listAllPrds
} from '@/prd-content'
import type { PrdInfo } from '@/prd-content'

const router = useRouter()
const route = useRoute()

console.log('[DMT-MainLayout] route:', route.path)

const activeTopMenu = ref('business')
const activeSideMenu = ref('')
const openKeys = ref<string[]>([])

// ========== 业务数据目录 ==========
const businessMenus = [
  { key: '/business-concept', title: '业务概念' }
]

// ========== 数据资产管理 ==========
const assetMenus = [
  { key: '/metadata', title: '元数据管理' },
  {
    key: 'metadata-collect-group',
    title: '元数据采集',
    children: [
      { key: '/asset-management/basic-management/metadata-collection/task-list', title: '任务列表' },
      { key: '/asset-management/basic-management/metadata-collection', title: '创建任务' },
      { key: '/asset-management/basic-management/data-source', title: '数据源管理' }
    ]
  },
  { key: '/asset-management/listing-management/asset-management', title: '数据资产上下架' },
  {
    key: 'data-source-group',
    title: '数据资源上下架',
    children: [
      { key: '/asset-management/listing-management/data-source/business-system', title: '业务系统' }
    ]
  },
  {
    key: 'element-management-group',
    title: '数据要素上下架',
    children: [
      { key: '/asset-management/listing-management/metric-management', title: '指标台账' }
    ]
  },
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
  business: businessMenus,
  asset: assetMenus,
  standard: standardMenus,
  classify: classifyMenus,
  service: serviceMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || []
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
  if (path === '/') {
    activeTopMenu.value = 'business'
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

// ========== 产品说明 Drawer ==========
const prdDrawerVisible = ref(false)
const prdContent = ref('')
const prdDrawerTitle = ref('产品说明')
const prdInfo = ref<PrdInfo | null>(null)
const prdInfoKey = ref('')
const sameKeySiblings = ref<Array<{ key: string; title: string; level: string }>>([])

// PRD 元信息渲染配置
const levelTagColor: Record<string, string> = {
  L0: 'red',
  L1: 'arcoblue',
  L2: 'cyan',
  L3: 'gray',
  SPEC: 'purple'
}
const levelLabel: Record<string, string> = {
  L0: '总章程',
  L1: '域主 PRD',
  L2: '子 PRD',
  L3: 'spec',
  SPEC: '接口契约'
}
const statusTagColor: Record<string, string> = {
  draft: 'orange',
  review: 'gold',
  released: 'green',
  deprecated: 'gray'
}
const statusLabel: Record<string, string> = {
  draft: '草稿',
  review: '评审中',
  released: '已发布',
  deprecated: '已弃用'
}

const openPrdDrawer = () => {
  refreshPrd(route.path)
  prdDrawerVisible.value = true
}

const refreshPrd = (path: string) => {
  const info = getPrdForRoute(path)
  prdInfo.value = info
  prdInfoKey.value = getPrdKeyForRoute(path)
  prdContent.value = info.content
  prdDrawerTitle.value = getPrdTitle(info.content)
  // 同 key 关联的兄弟页：列出所有与当前相同 key 的页面信息（实际是同 key 的多个 alias）
  sameKeySiblings.value = listAllPrds()
    .filter((x: any) => x.key === prdInfoKey.value || x.level === info.level)
    .map((x: any) => ({ key: x.key, title: x.title, level: x.level }))
}

// 路由切换时，如果抽屉已打开，则刷新内容
watch(() => route.path, (path) => {
  if (prdDrawerVisible.value) {
    refreshPrd(path)
  }
})
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

/* 产品说明浮动按钮（页面内容右上角） */
.prd-fab {
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 99;
  display: flex;
  justify-content: flex-end;
}
.prd-drawer-body {
  padding: 4px 8px 24px;
}

.prd-meta {
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fafbfc;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
}

.prd-key-tag {
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
  background: #f0f7ff;
  color: #165dff;
}

.prd-siblings {
  font-size: 12px;
}

.main-content {
  margin: 16px;
  overflow-y: auto;
  position: relative;
}

.content-wrapper {
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 56px - 32px);
  padding: 24px;
}
</style>
