/**
 * 权益中心路由模块
 * 路由前缀: /benefit
 */
import type { RouteRecordRaw } from 'vue-router'

export const benefitRoutes: RouteRecordRaw[] = [
  {
    path: '/benefit',
    name: 'Benefit',
    component: () => import('@/pages/benefit/index.vue'),
    meta: { title: '权益中心' }
  },
  {
    path: '/benefit/dashboard',
    name: 'BenefitDashboard',
    component: () => import('@/pages/coupon/index.vue'),
    meta: { title: '权益首页' }
  },
  {
    path: '/benefit/template',
    name: 'BenefitTemplate',
    component: () => import('@/pages/coupon/template/index.vue'),
    meta: { title: '券模板管理' }
  },
  {
    path: '/benefit/management',
    name: 'BenefitManagement',
    component: () => import('@/pages/coupon/management/index.vue'),
    meta: { title: '券管理' }
  },
  {
    path: '/benefit/package',
    name: 'BenefitPackage',
    component: () => import('@/pages/coupon/package/index.vue'),
    meta: { title: '券包管理' }
  },
  {
    path: '/benefit/inventory',
    name: 'BenefitInventory',
    component: () => import('@/pages/coupon/inventory/index.vue'),
    meta: { title: '券库存管理' }
  },
  {
    path: '/benefit/statistics',
    name: 'BenefitStatistics',
    component: () => import('@/pages/coupon/statistics/index.vue'),
    meta: { title: '权益统计' }
  },
  {
    path: '/benefit/logs',
    name: 'BenefitLogs',
    component: () => import('@/pages/coupon/record/index.vue'),
    meta: { title: '权益日志' }
  }
]
