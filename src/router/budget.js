/**
 * 预算管理路由配置
 */

import { ROUTE_NAMES, ROUTE_PATHS, ROUTE_META } from './constants.ts'

// 预算管理路由配置
const budgetRoutes = [
  {
    path: ROUTE_PATHS.BUDGET.ROOT,
    name: ROUTE_NAMES.BUDGET.ROOT,
    component: () => import('@/pages/budget/index.vue'),
    meta: {
      title: '预算管理',
      icon: 'icon-money',
      permission: ROUTE_META.PERMISSIONS.USER,
      layout: ROUTE_META.LAYOUTS.DEFAULT,
      pageType: ROUTE_META.PAGE_TYPES.DASHBOARD
    },
    redirect: ROUTE_PATHS.BUDGET.OVERVIEW,
    children: [
      // 预算总览
      {
        path: ROUTE_PATHS.BUDGET.OVERVIEW,
        name: ROUTE_NAMES.BUDGET.OVERVIEW,
        component: () => import('@/pages/budget/BudgetOverview.vue'),
        meta: {
          title: '预算总览',
          icon: 'icon-dashboard',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.LIST
        }
      },
      
      // 新建预算
      {
        path: ROUTE_PATHS.BUDGET.CREATE,
        name: ROUTE_NAMES.BUDGET.CREATE,
        component: () => import('@/pages/budget/BudgetCreate.vue'),
        meta: {
          title: '新建预算',
          icon: 'icon-plus',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.FORM
        }
      },
      
      // 预算详情
      {
        path: ROUTE_PATHS.BUDGET.DETAIL,
        name: ROUTE_NAMES.BUDGET.DETAIL,
        component: () => import('@/pages/budget/BudgetDetail.vue'),
        meta: {
          title: '预算详情',
          icon: 'icon-eye',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.DETAIL
        }
      },
      
      // 编辑预算
      {
        path: ROUTE_PATHS.BUDGET.EDIT,
        name: ROUTE_NAMES.BUDGET.EDIT,
        component: () => import('@/pages/budget/BudgetEdit.vue'),
        meta: {
          title: '编辑预算',
          icon: 'icon-edit',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.FORM
        }
      },
      
      // 预算分配
      {
        path: ROUTE_PATHS.BUDGET.ALLOCATION,
        name: ROUTE_NAMES.BUDGET.ALLOCATION,
        component: () => import('@/pages/budget/BudgetAllocation.vue'),
        meta: {
          title: '预算分配',
          icon: 'icon-branch',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.DASHBOARD
        }
      },
      
      // 预算监控
      {
        path: ROUTE_PATHS.BUDGET.MONITOR,
        name: ROUTE_NAMES.BUDGET.MONITOR,
        component: () => import('@/pages/budget/BudgetMonitor.vue'),
        meta: {
          title: '预算监控',
          icon: 'icon-monitor',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.DASHBOARD
        }
      },
      
      // 预算预警
      {
        path: ROUTE_PATHS.BUDGET.ALERTS,
        name: ROUTE_NAMES.BUDGET.ALERTS,
        component: () => import('@/pages/budget/BudgetAlerts.vue'),
        meta: {
          title: '预算预警',
          icon: 'icon-warning',
          permission: ROUTE_META.PERMISSIONS.USER,
          layout: ROUTE_META.LAYOUTS.DEFAULT,
          pageType: ROUTE_META.PAGE_TYPES.LIST
        }
      }
    ]
  }
]

export default budgetRoutes