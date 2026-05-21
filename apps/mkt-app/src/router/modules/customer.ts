/**
 * 客群中心路由模块
 * 路由前缀: /customer
 */
import type { RouteRecordRaw } from 'vue-router'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/customer',
    name: 'Customer',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群中心' }
  },
  {
    path: '/customer/tag-system',
    name: 'TagSystem',
    component: () => import('@/pages/customer/tag-system/index.vue'),
    meta: { title: '标签系统' }
  },
  {
    path: '/customer/tag-table',
    name: 'TagTable',
    component: () => import('@/pages/customer/tag-system/table-management.vue'),
    meta: { title: '标签表管理' }
  },
  {
    path: '/customer/list',
    name: 'CustomerList',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群列表' }
  },
  {
    path: '/customer/selector',
    name: 'CustomerSelector',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群圈选' }
  },
  {
    path: '/customer/portrait',
    name: 'CustomerPortrait',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客户画像' }
  },
  {
    path: '/customer/idmap',
    name: 'CustomerIdmap',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: 'ID映射' }
  },
  {
    path: '/customer/delete-approval',
    name: 'CustomerDeleteApproval',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '删除审批' }
  },
  {
    path: '/customer/lifecycle/rules',
    name: 'CustomerLifecycleRules',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期规则' }
  },
  {
    path: '/customer/lifecycle/analysis',
    name: 'CustomerLifecycleAnalysis',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期分析' }
  },
  {
    path: '/customer/lifecycle/monitor',
    name: 'CustomerLifecycleMonitor',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期监控' }
  }
]
