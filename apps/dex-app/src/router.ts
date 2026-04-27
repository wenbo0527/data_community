import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/dex/') : '/dex/'

console.log('[DEX] routerBase:', routerBase)

/**
 * 探索域路由配置
 * 
 * 注意：所有功能已迁移到 dfd-app (/dfd/)
 * 本路由配置仅作透明转发
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'DexIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据探索域' }
  },
  // 客户360 - 已迁移到 dfd-app
  {
    path: '/customer360',
    redirect: '/dfd/customer360'
  },
  {
    path: '/customer360/detail/:userId?',
    redirect: '/dfd/customer360/detail'
  },
  // 指标看板 - 已迁移到 dfd-app
  {
    path: '/indicator-dashboard',
    redirect: '/dfd/indicator-dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
