/**
 * data-community-app 路由
 * 数据社区子应用 - 数据发现 + 数据管理 + 数据探索
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dca/workbench'
  },
  // ===== 统一工作台(三模块整合入口) =====
  {
    path: '/workbench',
    name: 'workbench',
    component: () => import('../pages/workbench/index.vue'),
    meta: { title: '数据社区工作台' }
  },
  // ===== 数据发现 =====
  {
    path: '/discovery',
    name: 'discovery',
    component: () => import('../pages/discovery/index.vue'),
    meta: { title: '数据发现' }
  },
  {
    path: '/discovery/data-map',
    name: 'data-map',
    component: () => import('../pages/discovery/data-map/index.vue'),
    meta: { title: '数据地图' }
  },
  {
    path: '/discovery/customer360',
    name: 'customer360',
    component: () => import('../pages/discovery/customer360/index.vue'),
    meta: { title: '客户 360' }
  },
  // ===== 数据管理 =====
  {
    path: '/management',
    name: 'management',
    component: () => import('../pages/management/index.vue'),
    meta: { title: '数据管理' }
  },
  {
    path: '/management/favorites',
    name: 'favorites',
    component: () => import('../pages/management/favorites/index.vue'),
    meta: { title: '我的收藏' }
  },
  {
    path: '/management/asset-management/asset-tags',
    name: 'asset-tags',
    component: () => import('../pages/management/asset-management/asset-tags/index.vue'),
    meta: { title: '资产标签管理' }
  },
  {
    path: '/management/permission/data-permission/apply',
    name: 'permission-apply',
    component: () => import('../pages/management/permission/data-permission/apply.vue'),
    meta: { title: '字段权限申请' }
  },
  // ===== 数据探索 =====
  {
    path: '/exploration',
    name: 'exploration',
    component: () => import('../pages/exploration/index.vue'),
    meta: { title: '数据探索' }
  },
  // ===== 无访问权限 =====
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../components/common/UnauthorizedPage.vue'),
    meta: { title: '无访问权限' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/dca/'),
  routes
})

// 路由守卫 - P0 角色机制
import { useRoleStore } from '../stores/role'
import { Message } from '@arco-design/web-vue'

router.beforeEach((to, from, next) => {
  const meta = to.meta as { allowedRoles?: string[]; requireAuth?: boolean }

  if (!meta?.allowedRoles && !meta?.requireAuth) {
    next()
    return
  }

  const roleStore = useRoleStore()
  const currentRole = roleStore.currentRole

  if (!meta.allowedRoles || meta.allowedRoles.length === 0) {
    next()
    return
  }

  if (meta.allowedRoles.includes(currentRole) || meta.allowedRoles.includes('*')) {
    next()
    return
  }

  Message.warning(`当前角色(${roleStore.currentRoleDef.label})无权访问该页面`)
  next({
    path: '/dca/unauthorized',
    query: { from: to.fullPath, requiredRole: meta.allowedRoles.join(',') }
  })
})

router.isReady().then(() => {
  console.log('[DCA Router] 路由就绪:', router.currentRoute.value.fullPath)
})

export default router