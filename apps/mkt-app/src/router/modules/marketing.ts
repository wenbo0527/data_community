/**
 * 营销中心路由模块
 * 路由前缀: /marketing
 */
import type { RouteRecordRaw } from 'vue-router'

export const marketingRoutes: RouteRecordRaw[] = [
  {
    path: '/marketing',
    name: 'Marketing',
    component: () => import('@/pages/marketing/index.vue'),
    meta: { title: '营销中心' },
    children: [
      {
        path: 'dashboard',
        name: 'CouponDashboard',
        component: () => import('@/pages/coupon/index.vue'),
        meta: { title: '权益首页' }
      },
      {
        path: 'benefit/template',
        name: 'Template',
        component: () => import('@/pages/coupon/template/index.vue'),
        meta: { title: '模板管理' }
      },
      {
        path: 'benefit/management',
        name: 'Management',
        component: () => import('@/pages/coupon/management/index.vue'),
        meta: { title: '券管理' }
      },
      {
        path: 'benefit/package',
        name: 'Package',
        component: () => import('@/pages/coupon/package/index.vue'),
        meta: { title: '券包管理' }
      },
      {
        path: 'statistics/logs',
        name: 'CouponLogs',
        component: () => import('@/pages/coupon/record/index.vue'),
        meta: { title: '权益日志' }
      },
      {
        path: 'statistics/inventory',
        name: 'Inventory',
        component: () => import('@/pages/coupon/inventory/index.vue'),
        meta: { title: '库存查询' }
      },
      {
        path: 'global/rules',
        name: 'Rules',
        component: () => import('@/pages/coupon/rules/index.vue'),
        meta: { title: '规则配置' }
      },
      {
        path: 'alert',
        name: 'Alert',
        redirect: '/marketing/alert/management',
        meta: { title: '预警中心' }
      },
      {
        path: 'alert/management',
        name: 'AlertMgmt',
        component: () => import('@/pages/marketing/alert/management/index.vue'),
        meta: { title: '预警管理' }
      },
      {
        path: 'alert/rules',
        name: 'AlertRules',
        component: () => import('@/pages/marketing/alert/rules/index.vue'),
        meta: { title: '预警规则' }
      },
      {
        path: 'alert/rules/create',
        name: 'AlertRulesCreate',
        component: () => import('@/pages/marketing/alert/rules/create.vue'),
        meta: { title: '创建预警规则' }
      },
      {
        path: 'alert/history',
        name: 'AlertHistory',
        component: () => import('@/pages/marketing/alert/history/index.vue'),
        meta: { title: '预警历史' }
      },
      {
        path: 'tasks',
        name: 'MarketingTasks',
        component: () => import('@/pages/marketing/tasks/index.vue'),
        meta: { title: '营销任务' }
      },
      {
        path: 'tasks/horizontal',
        name: 'HorizontalCanvas',
        component: () => import('@/pages/canvas/index.vue'),
        meta: { title: '横向画布' }
      }
    ]
  },
  {
    path: '/marketing/global',
    name: 'GlobalManagement',
    component: () => import('@/pages/global/index.vue'),
    meta: { title: '全局管理' },
    children: [
      {
        path: '',
        redirect: '/marketing/global/rules'
      },
      {
        path: 'rules',
        name: 'GlobalRules',
        component: () => import('@/pages/global/rules/index.vue'),
        meta: { title: '规则配置' }
      }
    ]
  }
]
