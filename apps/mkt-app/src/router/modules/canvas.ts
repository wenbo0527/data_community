/**
 * 营销画布路由模块
 * 路由前缀: /canvas
 */
import type { RouteRecordRaw } from 'vue-router'

export const canvasRoutes: RouteRecordRaw[] = [
  {
    path: '/canvas',
    name: 'Canvas',
    component: () => import('@/pages/canvas/index.vue'),
    meta: { title: '营销画布' }
  }
]
