/**
 * 构建专用路由 - 仅客户360，避免探索域其他页面的跨 import 导致构建失败
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'DexIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据探索域' }
  },
  {
    path: '/customer360',
    name: 'Customer360',
    component: () => import('./pages/customer360/index.vue'),
    meta: { title: '客户360' }
  },
  {
    // 短路径：/customer360/:userId → 详情页
    path: '/customer360/:userId(\\d+)',
    name: 'Customer360DetailShort',
    component: () => import('./pages/customer360/detail.vue'),
    meta: { title: '客户详情' }
  },
  {
    path: '/customer360/detail/:userId?',
    name: 'Customer360Detail',
    component: () => import('./pages/customer360/detail.vue'),
    meta: { title: '客户详情' }
  }
]

const router = createRouter({
  history: createWebHistory('/dex/'),
  routes
})

export default router
