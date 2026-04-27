/**
 * mkt-app 路由入口
 * 模块化路由配置
 * 
 * 模块划分：
 * - benefit: 权益中心
 * - reach: 触达系统
 * - customer: 客群中心
 * - call: 人工电销工作台
 * - canvas: 营销画布
 * - alert: 预警中心
 * - tasks: 任务中心
 */
import { createRouter, createWebHistory } from 'vue-router'
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

// 合并所有路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MktIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '营销域' }
  },
  ...benefitRoutes,    // 权益中心
  ...reachRoutes,       // 触达系统
  ...customerRoutes,   // 客群中心
  ...callRoutes,       // 人工电销工作台
  ...canvasRoutes,     // 营销画布
  ...alertRoutes,      // 预警中心
  ...tasksRoutes,      // 任务中心
  ...marketingRoutes   // 营销中心（包含子路由）
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
