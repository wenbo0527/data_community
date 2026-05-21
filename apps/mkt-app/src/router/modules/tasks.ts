/**
 * 任务中心路由模块
 * 路由前缀: /tasks
 */
import type { RouteRecordRaw } from 'vue-router'

export const tasksRoutes: RouteRecordRaw[] = [
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/pages/tasks/index.vue'),
    meta: { title: '任务中心' }
  },
  {
    path: '/marketing/tasks',
    name: 'MarketingTasks',
    component: () => import('@/pages/marketing/tasks/index.vue'),
    meta: { title: '营销任务' }
  }
]
