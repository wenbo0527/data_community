import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/dex/') : '/dex/'

console.log('[DEX] routerBase:', routerBase)

/**
 * 探索域路由配置 - PRD定义版本
 * 仅包含：客户360全景能力、指标看板、统一分析工作台
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'DexIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据探索域' }
  },
  // 客户360 - PRD: 客户360全景能力
  {
    path: '/customer360',
    name: 'Customer360',
    component: () => import('./pages/customer360/index.vue'),
    meta: { title: '客户360' }
  },
  {
    path: '/customer360/detail/:userId?',
    name: 'Customer360Detail',
    component: () => import('./pages/customer360/detail.vue'),
    meta: { title: '客户详情' }
  },
  // 指标看板 - PRD: 指标看板
  {
    path: '/indicator-dashboard',
    name: 'IndicatorDashboard',
    component: () => import('./pages/indicator-dashboard/index.vue'),
    meta: { title: '指标看板' }
  },
  // 分析工作台 - PRD: 统一分析工作台
  {
    path: '/analytics-workbench',
    name: 'AnalyticsWorkbench',
    component: () => import('./pages/index.vue'),  // TODO: 后续创建独立页面
    meta: { title: '分析工作台' }
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
