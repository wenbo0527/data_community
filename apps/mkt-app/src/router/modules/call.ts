/**
 * 人工电销工作台路由模块
 * 路由前缀: /call
 */
import type { RouteRecordRaw } from 'vue-router'

export const callRoutes: RouteRecordRaw[] = [
  {
    path: '/call',
    name: 'Call',
    component: () => import('@/pages/call/index.vue'),
    meta: { title: '人工电销' }
  }
]
