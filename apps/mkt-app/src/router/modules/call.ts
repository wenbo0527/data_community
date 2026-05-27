/**
 * 人工电销工作台路由模块
 * 路由前缀: /call
 */
import type { RouteRecordRaw } from 'vue-router'

export const callRoutes: RouteRecordRaw[] = [
  {
    path: 'call',
    name: 'Call',
    component: () => import('@/pages/call/index.vue'),
    meta: { title: '数据看板' }
  },
  {
    path: 'call/task',
    name: 'CallTask',
    component: () => import('@/pages/call/task.vue'),
    meta: { title: '任务列表' }
  },
  {
    path: 'call/list',
    name: 'CallList',
    component: () => import('@/pages/call/list.vue'),
    meta: { title: '名单管理' }
  },
  {
    path: 'call/record',
    name: 'CallRecord',
    component: () => import('@/pages/call/record.vue'),
    meta: { title: '通话记录' }
  },
  {
    path: 'call/agent',
    name: 'CallAgent',
    component: () => import('@/pages/call/agent.vue'),
    meta: { title: '坐席管理' }
  },
  {
    path: 'call/team',
    name: 'CallTeam',
    component: () => import('@/pages/call/team.vue'),
    meta: { title: '班组管理' }
  },
  {
    path: 'call/settings',
    name: 'CallSettings',
    component: () => import('@/pages/call/settings.vue'),
    meta: { title: '系统设置' }
  }
]