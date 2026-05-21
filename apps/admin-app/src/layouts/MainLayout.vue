<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">管理后台</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="permission">权限管理</a-menu-item>
        <a-menu-item key="notifications">通知管理</a-menu-item>
        <a-menu-item key="content">内容管理</a-menu-item>
        <a-menu-item key="portal">门户管理</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout class="body-layout">
      <a-layout-sider class="main-sider" :width="220" collapsible breakpoint="xl">
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

console.log('[Admin-MainLayout] route:', route.path)

const activeTopMenu = ref('permission')
const activeSideMenu = ref('')
const openKeys = ref(['permission'])

// ========== 权限管理 ==========
const permissionMenus = [
  { key: '/permission', title: '权限首页' },
  { key: '/permission/user-management', title: '员工列表' },
  { key: '/permission/role-management', title: '角色列表' },
  { key: '/permission/app-permission', title: '应用权限' },
  { key: '/permission/data-permission', title: '数据权限' },
  { key: '/permission/business-module', title: '业务模块权限' }
]

// ========== 通知管理 ==========
const notificationsMenus = [
  { key: '/notifications/list', title: '通知列表' },
  { key: '/notifications/categories', title: '分类管理' },
  { key: '/notifications/create', title: '新建通知' }
]

// ========== 内容管理 ==========
const contentMenus = [
  { key: '/content', title: '内容管理' }
]

// ========== 门户管理 ==========
const portalMenus = [
  { key: '/portal', title: '门户管理' }
]

const menuMap: Record<string, any[]> = {
  permission: permissionMenus,
  notifications: notificationsMenus,
  content: contentMenus,
  portal: portalMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || permissionMenus
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
  if (path.includes('permission')) {
    activeTopMenu.value = 'permission'
  } else if (path.includes('notifications')) {
    activeTopMenu.value = 'notifications'
  } else if (path.includes('content')) {
    activeTopMenu.value = 'content'
  } else if (path.includes('portal')) {
    activeTopMenu.value = 'portal'
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
  width: 180px;
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