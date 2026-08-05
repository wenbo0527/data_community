<template>
  <a-layout class="dca-layout">
    <!-- 顶部导航 -->
    <a-layout-header class="main-header">
      <!-- Logo + App 切换器 -->
      <div class="logo-area">
        <div class="logo">数据社区</div>
        <a-dropdown trigger="click">
          <a-button type="text" class="app-switcher">
            <template #icon><icon-swap /></template>
            切换 App
            <template #suffix><icon-down /></template>
          </a-button>
          <template #content>
            <a-doption @click="goToApp('workbench')">
              <strong>数据社区 (DCA)</strong>
              <div style="font-size: 12px; color: #86909c">数据发现 + 数据管理 + 数据探索</div>
            </a-doption>
            <a-doption @click="goToApp('mkt')">
              <strong>营销域 (MKT)</strong>
              <div style="font-size: 12px; color: #86909c">触达 + 客群 + 券 + 营销</div>
            </a-doption>
          </template>
        </a-dropdown>
      </div>

      <!-- 主菜单(三大模块 + 工作台) -->
      <a-menu
        mode="horizontal"
        :selected-keys="[activeTopMenu]"
        @menu-item-click="handleTopMenuClick"
        class="top-menu"
      >
        <a-menu-item key="workbench">工作台</a-menu-item>
        <a-menu-item key="discovery">数据发现</a-menu-item>
        <a-menu-item key="management">数据管理</a-menu-item>
        <a-menu-item key="exploration">数据探索</a-menu-item>
      </a-menu>

      <!-- 右侧:角色切换 + 用户菜单 -->
      <div class="header-right">
        <a-tooltip content="切换角色">
          <a-button type="text" @click="showRoleSwitcher = true">
            <template #icon><icon-user /></template>
            {{ currentRoleLabel }}
          </a-button>
        </a-tooltip>

        <a-tooltip content="通知">
          <a-button type="text" @click="goToNotifications">
            <template #icon><icon-notification /></template>
            <a-badge v-if="unreadCount > 0" :count="unreadCount" :max-count="9" />
          </a-button>
        </a-tooltip>

        <a-dropdown trigger="click">
          <a-button type="text">
            <a-avatar :size="28" :style="avatarStyle">{{ currentUser.name.charAt(0) }}</a-avatar>
            <span style="margin-left: 8px">{{ currentUser.name }}</span>
            <template #suffix><icon-down /></template>
          </a-button>
          <template #content>
            <a-doption @click="goToProfile">
              <template #icon><icon-user /></template>个人信息
            </a-doption>
            <a-doption @click="showRoleSwitcher = true">
              <template #icon><icon-swap /></template>切换角色
            </a-doption>
            <a-divider style="margin: 4px 0" />
            <a-doption>
              <template #icon><icon-export /></template>退出登录
            </a-doption>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout class="body-layout">
      <!-- 左侧菜单:随顶部模块切换 -->
      <a-layout-sider
        class="main-sider"
        :width="220"
        :collapsible="true"
        :trigger="null"
        breakpoint="xl"
      >
        <a-menu
          :selected-keys="[activeSideMenu]"
          :default-open-keys="defaultOpenKeys"
          @menu-item-click="handleSideMenuClick"
          :auto-open="true"
        >
          <template v-for="item in currentSideMenusByRole" :key="item.key">
            <a-sub-menu v-if="item.children" :key="item.key">
              <template #title>{{ item.title }}</template>
              <a-menu-item v-for="child in item.children" :key="child.key">{{ child.title }}</a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.key">{{ item.title }}</a-menu-item>
          </template>
        </a-menu>
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout-content class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>

    <!-- 角色切换弹窗 -->
    <a-modal
      v-model:visible="showRoleSwitcher"
      title="切换角色"
      :width="520"
      @ok="confirmRoleSwitch"
    >
      <p style="color: #86909c; margin-bottom: 16px">不同角色看到的菜单和权限不同,切换后立即生效。</p>
      <a-radio-group v-model="pendingRole" direction="vertical" style="width: 100%">
        <a-radio v-for="r in roles" :key="r.code" :value="r.code" style="display: block; padding: 8px 0;">
          <div style="display: flex; align-items: center; gap: 8px">
            <a-avatar :size="32" :style="{ background: r.color }">{{ r.label.charAt(0) }}</a-avatar>
            <div>
              <strong>{{ r.label }}</strong>
              <div style="font-size: 12px; color: #86909c">{{ r.description }}</div>
            </div>
          </div>
        </a-radio>
      </a-radio-group>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useRoleStore } from '../stores-dca/role'
import { ROLE_DEFINITIONS, type UserRole } from '@/types-dca/roles'

const router = useRouter()
const route = useRoute()
const roleStore = useRoleStore()

// ── 角色 ──────────────────────────────────────
const showRoleSwitcher = ref(false)
const pendingRole = ref<UserRole>(roleStore.currentRole)
// 角色列表:必须和 types-dca/roles.ts 的 ROLE_DEFINITIONS 一一对应,
//   否则 roleStore.switchRole(code) 会因为 code 不在 ROLE_DEFINITIONS 里报「无效角色」
// 这里直接复用 store 中计算的 currentRoleDef.label,不维护重复数据,避免漂移
const currentRoleLabel = computed(() => {
  return roleStore.currentRoleDef?.label || '角色未识别'
})

/**
 * 角色切换弹窗的候选项
 * 颜色 / 头像 / 部门 取自 ROLE_DEFINITIONS(code 必须与 UserRole 联合类型精确一致)
 *   —— 改用直接从 ROLE_DEFINITIONS 派生避免漂移
 */
const roles = ref(
  (Object.entries(ROLE_DEFINITIONS) as Array<[UserRole, typeof ROLE_DEFINITIONS[UserRole]]>)
    .map(([code, def]) => ({
      code,
      label: def.label,
      description: def.description || def.department,
      color: def.color
    }))
)

function confirmRoleSwitch() {
  // role store 暴露的切换接口叫 switchRole(不是 setRole)
  roleStore.switchRole(pendingRole.value)
  showRoleSwitcher.value = false
  Message.success(`已切换到: ${currentRoleLabel.value}`)
}

// ── 用户信息 ──────────────────────────────────
const currentUser = ref({ name: '王运营', email: 'wangyy@company.com' })
const unreadCount = ref(5)
const avatarStyle = { background: '#165dff' }

// ── 顶部主菜单(工作台 + 三大模块) ──────────────
const topMenuMap: Record<string, { key: string; path: string }> = {
  'discovery':   { key: 'discovery',   path: '/discovery' },
  'management':  { key: 'management',  path: '/management' },
  'exploration': { key: 'exploration', path: '/exploration' },
  'workbench':   { key: 'workbench',   path: '/workbench' },
}

const activeTopMenu = ref('workbench')
const activeSideMenu = ref('')
const defaultOpenKeys = ref<string[]>([])

// ── 数据发现菜单(按 资源/资产/要素 三分法重构)───────
const discoveryMenus = [
  // 顶层入口
  { key: 'discovery/overview', title: '数据总览' },
  { key: 'discovery/search', title: '数据搜索' },
  { key: 'discovery/favorites', title: '我的关注' },

  // 数据资源(原始数据来源,排除「外部数据」「征信查询」,后者属于数据要素)
  { key: 'discovery-group-resource', title: '📥 数据资源', children: [
    { key: 'discovery/data-resources', title: '业务系统' },
    { key: 'discovery/data-resources/files', title: '文件导入' },
    { key: 'discovery/data-resources/logs', title: '日志数据' },
    { key: 'discovery/data-resources/realtime', title: '实时接入' },
  ]},

  // 数据资产(治理后) — 这里都是「平台层面」的资产:
  // 指南(新人入门) / 总览(大盘) / 目录(资产台账) / 地图(全量数据)
  // 客户 360 已移出,属于「数据探索」侧的分析视图
  { key: 'discovery-group-assets', title: '🏛️ 数据资产', children: [
    { key: 'discovery/asset-guide', title: '资产指南' },
    { key: 'discovery/asset-overview', title: '资产总览' },
    { key: 'discovery/asset-catalog', title: '资产目录' },
    { key: 'discovery/data-map', title: '数据地图' },
  ]},

  // 数据要素(高价值业务形态 — 指标 / 变量 / 特征 / 外数 4 个核心入口)
  // 其它能力(征信查询 / 统一指标 / 指标看板 / 地铁图)已并入相应字典页或工作台快捷入口
  { key: 'discovery-group-element', title: '✨ 数据要素', children: [
    { key: 'discovery/indicator-dict', title: '指标字典' },
    { key: 'discovery/variable-dict', title: '变量字典' },
    { key: 'discovery/feature-dict', title: '特征字典' },
    { key: 'discovery/external', title: '外部数据' },
  ]},

  // 运营工具(实际是数据治理 + 监管 + API,跨三大类)
  { key: 'discovery-group-ops', title: '🛠 治理运营', children: [
    { key: 'discovery/lineage', title: '全链路血缘' },
    { key: 'discovery/impact-analysis', title: '变更影响分析' },
    { key: 'discovery/batch-registration', title: '批量注册' },
    { key: 'discovery/regulatory-config', title: '监管报表' },
    { key: 'discovery/api-market', title: 'API 市场' },
  ]},
]

// ── 数据管理菜单(去掉前导 /,与 router path 一致)───────
const managementMenus = [
  { key: 'management-group-home', title: '首页', children: [
    { key: 'management', title: '数据管理' },
  ]},
  { key: 'management-group-fav', title: '我的', children: [
    { key: 'management/favorites', title: '我的收藏' },
    { key: 'management/notifications', title: '通知中心' },
  ]},
  { key: 'management-group-std', title: '标准与建模', children: [
    { key: 'management/data-standard/standards', title: '数据标准' },
    { key: 'management/business-concept', title: '业务概念' },
    { key: 'management/metadata/modeling', title: '元数据建模' },
    { key: 'management/data-models', title: '数据模型' },
  ]},
  { key: 'management-group-asset', title: '资产管理', children: [
    { key: 'management/asset-management/asset-tags', title: '资产标签' },
    { key: 'management/asset-management/tag-group', title: '标签分组' },
  ]},
  { key: 'management-group-service', title: '服务', children: [
    { key: 'management/service', title: '数据服务' },
    { key: 'management/service/api-wizard', title: 'API 上架' },
  ]},
  { key: 'management-group-perm', title: '权限', children: [
    { key: 'management/permission/data-permission/apply', title: '字段权限申请' },
    { key: 'management/user-groups', title: '用户组管理' },
  ]},
]

// ── 数据探索菜单(去掉前导 /,与 router path 一致)───────
// 数据探索 = 面向业务的「分析视图」:客户 360 / 客群 / 标签 / 事件 / 工作流 / 看板
// 数据发现 = 平台级「资产管理」:总览 / 资源 / 资产 / 要素 / 治理
const explorationMenus = [
  { key: 'exploration', title: '数据探索' },
  { key: 'exploration/customer360', title: '客户 360' },
  { key: 'exploration/workflows', title: '分析工作流' },
]

// ── 工作台菜单(快速入口 + 我的)────────────
const workbenchMenus = [
  { key: 'workbench-group-quick', title: '快速入口', children: [
    { key: 'discovery', title: '数据发现' },
    { key: 'exploration/customer360', title: '客户 360' },
    { key: 'discovery/asset-catalog', title: '资产目录' },
    { key: 'management/data-standard/standards', title: '数据标准' },
  ]},
  { key: 'workbench-group-mine', title: '我的', children: [
    { key: 'management/favorites', title: '我的收藏' },
    { key: 'management/notifications', title: '通知中心' },
  ]},
]

// ── 菜单切换 ─────────────────────────────────
const allMenus: Record<string, any[]> = {
  discovery: discoveryMenus,
  management: managementMenus,
  exploration: explorationMenus,
  workbench: workbenchMenus,
}

const topMenuDefaultPath: Record<string, string> = {
  discovery: '/discovery',
  management: '/management',
  exploration: '/exploration',
  workbench: '/workbench',
}

const currentSideMenus = computed(() => allMenus[activeTopMenu.value] || [])

// 按角色过滤侧边栏菜单(2026-08-05 「数据发现侧边栏缺失」修复版)
//
// 设计原则:
//  - 公共入口模块(数据发现 discovery、工作台 workbench)不对角色过滤,
//    因为它们是平台基础能力,所有用户都需要浏览数据资产 — 否则低权限角色
//    直接看不到任何菜单项,体验割裂且无法自助探索
//  - 数据管理 management、数据探索 exploration 模块保留按 shortcuts 过滤
//    (这两个模块权限敏感)
//  - admin 直接放行,其它角色走规则引擎
//  - 组 key(`*-group-*`)只作容器,完全由其子项决定是否显示
//  - `splitKey` 把原始 key 加入候选,确保每个菜单至少有这一次匹配机会
const PUBLIC_TOP_MODULES = new Set(['discovery', 'workbench'])

const currentSideMenusByRole = computed(() => {
  const roleDef = roleStore.currentRoleDef
  // 1. 公共模块不过滤,直接返回
  if (PUBLIC_TOP_MODULES.has(activeTopMenu.value)) {
    return currentSideMenus.value
  }
  if (!roleDef) return currentSideMenus.value
  // admin 看全部
  if (roleDef.role === 'admin') return currentSideMenus.value
  const shortcuts = roleDef.shortcuts || []
  if (shortcuts.length === 0) return currentSideMenus.value

  const allowedSet = new Set<string>(shortcuts)
  // 共用菜单始终显示(收藏/通知/工作台/3 大模块入口)
  const alwaysOn = new Set(['favorites', 'notifications', 'workbench', 'discovery', 'management', 'exploration'])

  // 拆分菜单 key 为路径段,同时生成 xxx-yyy 这种中划线命名形式,
  // 兼容 shortcuts 中各种命名风格
  const splitKey = (k: string) => {
    const parts = k.split('/').filter(Boolean)
    const expanded: string[] = [k, ...parts]
    for (let i = 0; i < parts.length - 1; i++) {
      expanded.push(`${parts[i]}-${parts[i + 1]}`)
    }
    return expanded
  }
  // 判断菜单项是否在角色允许范围内
  const isAllowed = (k: string) => {
    if (alwaysOn.has(k)) return true
    // 组 key(`*-group-*`)不参与 shortcuts,只作容器
    if (/-group-/.test(k)) return true
    const parts = splitKey(k)
    return parts.some(p => allowedSet.has(p))
  }

  // 递归过滤:子项在 allowed 范围才显示,组下无子项则整组隐藏
  const filterItem = (item: any): any | null => {
    if (Array.isArray(item.children)) {
      const newChildren = item.children.map(filterItem).filter(Boolean)
      if (newChildren.length === 0) return null
      return { ...item, children: newChildren }
    }
    if (isAllowed(item.key)) return item
    return null
  }

  return currentSideMenus.value
    .map(filterItem)
    .filter(Boolean)
})

function updateMenuState(path: string) {
  // 1. 顶部主模块(route.path 不带前导 /,topMenuMap 的 key 也不带前导 /)
  for (const [prefix, info] of Object.entries(topMenuMap)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      activeTopMenu.value = info.key
      break
    }
  }
  // 2. 侧边栏选中
  activeSideMenu.value = path
  defaultOpenKeys.value = currentSideMenusByRole.value
    .filter(m => m.children?.some(c =>
      path === c.key || path.startsWith(c.key + '/')
    ))
    .map(m => m.key)
}

function handleTopMenuClick(key: string) {
  activeTopMenu.value = key
  const target = topMenuDefaultPath[key] || '/'
  const path = target.startsWith('/') ? target.substring(1) : target
  router.push(path || 'workbench')
}

function handleSideMenuClick(key: string) {
  if (!key) return
  // ⛳ 断点 F: 侧栏菜单点击的入口
  // eslint-disable-next-line no-console
  console.debug('[handleSideMenuClick] key =', JSON.stringify(key))
  // 优先按路由名跳转(更稳定,不需要 path 字符串手动拼接相对路径)
  // 这样避免 vue-router 4 在相对路径解析时出现 "No match found" 警告
  const named = NAME_BY_PATH[key]
  if (named) {
    // eslint-disable-next-line no-console
    console.debug('[handleSideMenuClick] push by name =', named)
    router.push({ name: named })
    return
  }
  // 没找到映射则退回字符串路径(原行为兼容)
  const path = key.startsWith('/') ? key.substring(1) : key
  router.push(path)
}

/**
 * 菜单 key → 路由 name 映射
 * 集中维护,避免散落的 push 字符串
 */
const NAME_BY_PATH: Record<string, string> = {
  // —— 顶层入口 ——
  'discovery/overview': 'discovery-overview',
  'discovery/search': 'search',
  'discovery/favorites': 'discovery-favorites',

  // —— 数据资源 ——
  'discovery/data-resources': 'data-resources',
  'discovery/data-resources/files': 'dr-files',
  'discovery/data-resources/logs': 'dr-logs',
  'discovery/data-resources/realtime': 'dr-realtime',

  // —— 数据资产 ——
  'discovery/asset-guide': 'asset-guide',
  'discovery/asset-overview': 'asset-overview',
  'discovery/asset-catalog': 'asset-catalog',
  'discovery/data-map': 'data-map',

  // —— 数据要素(精简到 4 个核心入口,与 discoveryMenus 保持一致)——
  'discovery/indicator-dict': 'indicator-dict',
  'discovery/variable-dict': 'variable-dict',
  'discovery/feature-dict': 'feature-dict',
  'discovery/external': 'external',
  'discovery/metrics-map': 'metrics-map',
  'discovery/variable-map': 'variable-map',
  'discovery/feature-map': 'feature-map',

  // —— 治理运营 ——
  'discovery/lineage': 'lineage',
  'discovery/impact-analysis': 'impact-analysis',
  'discovery/batch-registration': 'batch-registration',
  'discovery/regulatory-config': 'regulatory-config',
  'discovery/api-market': 'api-market',

  // —— 数据管理 ——
  'management': 'management',
  'management/favorites': 'favorites',
  'management/notifications': 'notifications',
  'management/business-concept': 'business-concept',
  'management/data-standard/standards': 'data-standard',
  'management/metadata/modeling': 'metadata-modeling',
  'management/service': 'service',
  'management/service/api-wizard': 'api-wizard',
  'management/asset-management/asset-tags': 'asset-tags',
  'management/asset-management/tag-group': 'tag-group',
  'management/permission/data-permission/apply': 'permission-apply',
  'management/data-models': 'data-models',
  'management/user-groups': 'user-groups',

  // —— 数据探索 ——
  'exploration': 'exploration',
  'exploration/customer360': 'Customer360',
  'exploration/workflows': 'workflows',

  // —— 工作台 ——
  'workbench': 'workbench'
}

// ── 跨 App 跳转 ──────────────────────────────
function goToApp(app: 'workbench' | 'mkt') {
  if (app === 'mkt') {
    // 跳到 mkt 子应用(端口 5177)
    window.location.href = 'http://localhost:5177/mkt/'
  } else {
    router.push('workbench')
  }
}

function goToNotifications() {
  router.push('management/notifications')
}

function goToProfile() {
  Message.info('个人信息(待实现)')
}

watch(() => route.path, (path) => {
  updateMenuState(path)
}, { immediate: true })

onMounted(() => {
  updateMenuState(route.path)
})
</script>

<style scoped>
.dca-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 24px;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  white-space: nowrap;
}

.app-switcher {
  font-size: 12px;
  color: #165dff;
}

.top-menu {
  flex: 1;
  border-bottom: none !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.body-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.main-sider {
  height: 100%;
  border-right: 1px solid var(--color-border);
  background: #fff;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  background: var(--color-fill-2);
  overflow: auto;
  padding: 16px;
  height: 100%;
}

.content-wrapper {
  background: #fff;
  min-height: 100%;
  padding: 0;
  border-radius: 4px;
}
</style>