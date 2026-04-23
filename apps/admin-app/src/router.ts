import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/admin/') : '/admin/'

console.log('[Admin] routerBase:', routerBase)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'AdminIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '通用域' }
  },
  {
    path: '/permission',
    name: 'Permission',
    component: () => import('./pages/permission/index.vue'),
    meta: { title: '权限管理' },
    children: [
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('./pages/permission/user-management/index.vue'),
        meta: { title: '员工列表' }
      },
      {
        path: 'role-management',
        name: 'RoleManagement',
        component: () => import('./pages/permission/role-management/index.vue'),
        meta: { title: '角色列表' }
      },
      {
        path: 'app-permission',
        name: 'AppPermission',
        component: () => import('./pages/permission/app-permission/index.vue'),
        meta: { title: '应用权限' }
      },
      {
        path: 'data-permission',
        name: 'DataPermission',
        component: () => import('./pages/permission/data-permission/index.vue'),
        meta: { title: '数据权限' }
      },
      {
        path: 'business-module',
        name: 'BusinessModule',
        component: () => import('./pages/permission/business-module/index.vue'),
        meta: { title: '业务模块权限' }
      }
    ]
  },
  {
    path: '/notice',
    name: 'Notice',
    component: () => import('./pages/notice/index.vue'),
    meta: { title: '通知管理' }
  },
  {
    path: '/content',
    name: 'Content',
    component: () => import('./pages/content/index.vue'),
    meta: { title: '内容管理' }
  },
  {
    path: '/portal',
    name: 'Portal',
    component: () => import('./pages/portal/index.vue'),
    meta: { title: '门户管理' }
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
