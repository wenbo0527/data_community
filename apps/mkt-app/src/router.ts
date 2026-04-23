import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/mkt/') : '/mkt/'

console.log('[MKT] routerBase:', routerBase)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MktIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '营销域' }
  },
  {
    path: '/benefit',
    name: 'Benefit',
    component: () => import('./pages/benefit/index.vue'),
    meta: { title: '权益中心' }
  },
  {
    path: '/benefit/dashboard',
    name: 'BenefitDashboard',
    component: () => import('./pages/coupon/index.vue'),
    meta: { title: '权益首页' }
  },
  {
    path: '/benefit/template',
    name: 'BenefitTemplate',
    component: () => import('./pages/coupon/template/index.vue'),
    meta: { title: '券模板管理' }
  },
  {
    path: '/benefit/management',
    name: 'BenefitManagement',
    component: () => import('./pages/coupon/management/index.vue'),
    meta: { title: '券管理' }
  },
  {
    path: '/benefit/package',
    name: 'BenefitPackage',
    component: () => import('./pages/coupon/package/index.vue'),
    meta: { title: '券包管理' }
  },
  {
    path: '/benefit/inventory',
    name: 'BenefitInventory',
    component: () => import('./pages/coupon/inventory/index.vue'),
    meta: { title: '券库存管理' }
  },
  {
    path: '/benefit/statistics',
    name: 'BenefitStatistics',
    component: () => import('./pages/coupon/statistics/index.vue'),
    meta: { title: '权益统计' }
  },
  {
    path: '/benefit/logs',
    name: 'BenefitLogs',
    component: () => import('./pages/coupon/record/index.vue'),
    meta: { title: '权益日志' }
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: () => import('./pages/marketing/index.vue'),
    meta: { title: '营销中心' },
    children: [
      {
        path: 'dashboard',
        name: 'CouponDashboard',
        component: () => import('./pages/coupon/index.vue'),
        meta: { title: '权益首页' }
      },
      {
        path: 'benefit/template',
        name: 'Template',
        component: () => import('./pages/coupon/template/index.vue'),
        meta: { title: '模板管理' }
      },
      {
        path: 'benefit/management',
        name: 'Management',
        component: () => import('./pages/coupon/management/index.vue'),
        meta: { title: '券管理' }
      },
      {
        path: 'benefit/package',
        name: 'Package',
        component: () => import('./pages/coupon/package/index.vue'),
        meta: { title: '券包管理' }
      },
      {
        path: 'statistics/logs',
        name: 'CouponLogs',
        component: () => import('./pages/coupon/record/index.vue'),
        meta: { title: '权益日志' }
      },
      {
        path: 'statistics/inventory',
        name: 'Inventory',
        component: () => import('./pages/coupon/inventory/index.vue'),
        meta: { title: '库存查询' }
      },
      {
        path: 'global/rules',
        name: 'Rules',
        component: () => import('./pages/coupon/rules/index.vue'),
        meta: { title: '规则配置' }
      },
      {
        path: 'alert/management',
        name: 'AlertMgmt',
        component: () => import('./pages/marketing/alert/index.vue'),
        meta: { title: '告警管理' }
      },
      {
        path: 'tasks',
        name: 'MarketingTasks',
        component: () => import('./pages/marketing/tasks/index.vue'),
        meta: { title: '营销任务' }
      },
      {
        path: 'tasks/horizontal',
        name: 'HorizontalCanvas',
        component: () => import('./pages/canvas/index.vue'),
        meta: { title: '横向画布' }
      }
    ]
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: () => import('./pages/canvas/index.vue'),
    meta: { title: '横向画布' }
  },
  {
    path: '/alert',
    name: 'Alert',
    component: () => import('./pages/alert/index.vue'),
    meta: { title: '告警中心' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('./pages/tasks/index.vue'),
    meta: { title: '任务中心' }
  },
  {
    path: '/touch',
    name: 'Touch',
    component: () => import('./pages/touch/index.vue'),
    meta: { title: '触达系统' }
  },
  {
    path: '/touch/policy/overview',
    name: 'TouchPolicyOverview',
    component: () => import('./pages/touch/policy/overview.vue'),
    meta: { title: '策略数据概览' }
  },
  {
    path: '/touch/query',
    name: 'TouchQuery',
    component: () => import('./pages/touch/query/index.vue'),
    meta: { title: '触达查询' }
  },
  {
    path: '/touch/channel',
    name: 'TouchChannel',
    component: () => import('./pages/touch/channel/index.vue'),
    meta: { title: '渠道管理' }
  },
  {
    path: '/touch/manual-sms',
    name: 'TouchManualSms',
    component: () => import('./pages/touch/manual-sms/list.vue'),
    meta: { title: '手动短信' }
  },
  {
    path: '/touch/system',
    name: 'TouchSystem',
    component: () => import('./pages/touch/system/index.vue'),
    meta: { title: '系统概览' }
  },
  {
    path: '/call',
    name: 'Call',
    component: () => import('./pages/call/index.vue'),
    meta: { title: '人工电销' }
  },
  {
    path: '/customer',
    name: 'Customer',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '客群中心' }
  },
  {
    path: '/customer/tag-system',
    name: 'TagSystem',
    component: () => import('./pages/customer/tag-system/index.vue'),
    meta: { title: '标签系统' }
  },
  {
    path: '/customer/tag-table',
    name: 'TagTable',
    component: () => import('./pages/customer/tag-system/table-management.vue'),
    meta: { title: '标签表管理' }
  },
  {
    path: '/customer/list',
    name: 'CustomerList',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '客群列表' }
  },
  {
    path: '/customer/selector',
    name: 'CustomerSelector',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '客群圈选' }
  },
  {
    path: '/customer/portrait',
    name: 'CustomerPortrait',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '客户画像' }
  },
  {
    path: '/customer/idmap',
    name: 'CustomerIdmap',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: 'ID映射' }
  },
  {
    path: '/customer/delete-approval',
    name: 'CustomerDeleteApproval',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '删除审批' }
  },
  {
    path: '/customer/lifecycle/rules',
    name: 'CustomerLifecycleRules',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '生命周期规则' }
  },
  {
    path: '/customer/lifecycle/analysis',
    name: 'CustomerLifecycleAnalysis',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '生命周期分析' }
  },
  {
    path: '/customer/lifecycle/monitor',
    name: 'CustomerLifecycleMonitor',
    component: () => import('./pages/customer/index.vue'),
    meta: { title: '生命周期监控' }
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
