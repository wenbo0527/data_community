/**
 * mkt-app 路由入口
 * 模块化路由配置
 * v1.2.9 修复：删除冗余 global.ts 路由 (marketing.ts 已含 /marketing/global/rules)
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 路由模块
import { benefitRoutes } from './router/modules/benefit'
import { marketingRoutes } from './router/modules/marketing'
import { reachRoutes } from './router/modules/reach'
import { customerRoutes } from './router/modules/customer'
import { callRoutes } from './router/modules/call'
import { canvasRoutes } from './router/modules/canvas'
import { alertRoutes } from './router/modules/alert'
import { tasksRoutes } from './router/modules/tasks'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/mkt/') : '/mkt/'

console.log('[MKT] routerBase:', routerBase)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'MktIndex',
        component: () => import('./pages/index.vue'),
        meta: { title: '营销域' }
      },
      ...benefitRoutes,
      ...reachRoutes,
      ...customerRoutes,
      ...callRoutes,
      ...canvasRoutes,
      ...alertRoutes,
      ...tasksRoutes,
      ...marketingRoutes,
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(routerBase),
  routes
})

/**
 * 路由守卫 - 容错处理
 *
 * 处理一些历史/重复的 URL 形式,避免白页:
 * 1. /customer/customer/... → 重定向到 /customer/...(去重双 customer)
 * 2. 以 '/' 开头的绝对路径 → 去掉前导 '/',让 vue-router 自动加 base
 */
router.beforeEach((to, from, next) => {
  let path = to.path

  // 容错 1: 去重双 customer
  // 例: customer/customer/virtual-events → customer/virtual-events
  if (path.startsWith('customer/customer/')) {
    path = path.replace(/^customer\/customer/, 'customer')
  }

  // 容错 2: 以 '/' 开头(绝对路径) → 去掉前导 '/'
  // vue-router 4 + hash mode + base='/mkt/' 时,
  // 绝对路径会跳过 base,实际跳到根域
  if (path.startsWith('/') && path !== '/') {
    path = path.substring(1)
  }

  if (path !== to.path) {
    next({ path, replace: true })
    return
  }

  next()
})

export default router
