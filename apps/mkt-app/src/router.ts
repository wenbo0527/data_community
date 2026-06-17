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

export default router
