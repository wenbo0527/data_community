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
    path: '/data-map',
    name: 'DataMap',
    component: () => import('./pages/data-map/index.vue'),
    meta: { title: '数据地图' }
  },

  {
    path: '/api-market',
    name: 'ApiMarket',
    component: () => import('./pages/api-market/index.vue'),
    meta: { title: 'API市场' }
  },
  {
    path: '/customer360',
    name: 'Customer360',
    component: () => import('./pages/customer360/index.vue'),
    meta: { title: '客户画像' }
  },
  {
    path: '/credit',
    name: 'Credit',
    component: () => import('./pages/credit/index.vue'),
    meta: { title: '信用评估' }
  },
  {
    path: '/alert',
    name: 'Alert',
    component: () => import('./pages/alert/index.vue'),
    meta: { title: '告警中心' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('./pages/search/index.vue'),
    meta: { title: '全局搜索' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('./pages/tasks/index.vue'),
    meta: { title: '任务中心' }
  },
  {
    path: '/feature-map',
    name: 'FeatureMap',
    component: () => import('./pages/feature-map/index.vue'),
    meta: { title: '特征地图' }
  },
  {
    path: '/impact-analysis',
    name: 'ImpactAnalysis',
    component: () => import('./pages/impact-analysis/index.vue'),
    meta: { title: '影响分析' }
  },
  {
    path: '/lineage',
    name: 'Lineage',
    component: () => import('./pages/lineage/index.vue'),
    meta: { title: '血缘关系' }
  },
  {
    path: '/batch-registration',
    name: 'BatchRegistration',
    component: () => import('./pages/batch-registration/index.vue'),
    meta: { title: '批量注册' }
  },
  {
    path: '/asset-overview',
    name: 'AssetOverview',
    component: () => import('./pages/asset-overview/index.vue'),
    meta: { title: '资产总览' }
  },
  {
    path: '/asset-management',
    name: 'AssetManagement',
    component: () => import('./pages/asset-management/index.vue'),
    meta: { title: '资产管理' }
  },
  {
    path: '/external',
    name: 'External',
    component: () => import('./pages/external/index.vue'),
    meta: { title: '外部数据' }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('./pages/favorites/index.vue'),
    meta: { title: '我的收藏' }
  },
  {
    path: '/global',
    name: 'Global',
    component: () => import('./pages/global/index.vue'),
    meta: { title: '全局配置' }
  },
  {
    path: '/metrics-map',
    name: 'MetricsMap',
    component: () => import('./pages/metrics-map/index.vue'),
    meta: { title: '指标地图' }
  },
  {
    path: '/regulatory-config',
    name: 'RegulatoryConfig',
    component: () => import('./pages/regulatory-config/index.vue'),
    meta: { title: '合规配置' }
  },
  {
    path: '/unified-metrics',
    name: 'UnifiedMetrics',
    component: () => import('./pages/unified-metrics/index.vue'),
    meta: { title: '统一指标' }
  },
  {
    path: '/asset-guide',
    name: 'AssetGuide',
    component: () => import('./pages/asset-guide/index.vue'),
    meta: { title: '资产指南' }
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
