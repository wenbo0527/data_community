/**
 * 预警中心路由模块
 * 路由前缀: /alert
 */
import type { RouteRecordRaw } from 'vue-router'

export const alertRoutes: RouteRecordRaw[] = [
  {
    path: '/alert',
    name: 'Alert',
    component: () => import('@/pages/alert/index.vue'),
    meta: { title: '预警中心' }
  },
  {
    path: '/marketing/alert',
    name: 'MarketingAlert',
    redirect: '/marketing/alert/management',
    meta: { title: '预警中心' }
  },
  {
    path: '/marketing/alert/management',
    name: 'AlertMgmt',
    component: () => import('@/pages/marketing/alert/management/index.vue'),
    meta: { title: '预警管理' }
  },
  {
    path: '/marketing/alert/rules',
    name: 'AlertRules',
    component: () => import('@/pages/marketing/alert/rules/index.vue'),
    meta: { title: '预警规则' }
  },
  {
    path: '/marketing/alert/rules/create',
    name: 'AlertRulesCreate',
    component: () => import('@/pages/marketing/alert/rules/create.vue'),
    meta: { title: '创建预警规则' }
  },
  {
    path: '/marketing/alert/history',
    name: 'AlertHistory',
    component: () => import('@/pages/marketing/alert/history/index.vue'),
    meta: { title: '预警历史' }
  }
]
