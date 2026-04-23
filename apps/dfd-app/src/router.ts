import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/dfd/') : '/dfd/'

console.log('[DFD] routerBase:', routerBase)

/**
 * 数据发现域路由配置
 * 
 * PRD 定义的功能：
 * 1. 数据资产运营工具（资产血缘分析、变更影响分析）
 * 2. 数据资产字典（资产目录列表、资产收藏）
 * 3. 数据要素字典（特征字典列表、变量字典列表、指标字典列表）
 * 4. 数据资源字典（资源列表）
 * 5. 统一搜索
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'DfdIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据发现域' }
  },
  
  // ========== 数据资产运营工具 ==========
  // 资产血缘分析
  {
    path: '/lineage',
    name: 'Lineage',
    component: () => import('./pages/lineage/index.vue'),
    meta: { title: '资产血缘分析' }
  },
  // 变更影响分析
  {
    path: '/impact-analysis',
    name: 'ImpactAnalysis',
    component: () => import('./pages/impact-analysis/index.vue'),
    meta: { title: '变更影响分析' }
  },
  
  // ========== 数据资产字典 ==========
  // 资产目录列表
  {
    path: '/asset-catalog',
    name: 'AssetCatalog',
    component: () => import('./pages/asset-catalog/index.vue'),
    meta: { title: '资产目录列表' }
  },
  // 资产收藏
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('./pages/favorites/index.vue'),
    meta: { title: '资产收藏' }
  },
  
  // ========== 数据要素字典 ==========
  // 特征字典列表
  {
    path: '/feature-dict',
    name: 'FeatureDict',
    component: () => import('./pages/feature-dict/index.vue'),
    meta: { title: '特征字典列表' }
  },
  // 变量字典列表
  {
    path: '/variable-dict',
    name: 'VariableDict',
    component: () => import('./pages/variable-dict/index.vue'),
    meta: { title: '变量字典列表' }
  },
  // 指标字典列表
  {
    path: '/indicator-dict',
    name: 'IndicatorDict',
    component: () => import('./pages/indicator-dict/index.vue'),
    meta: { title: '指标字典列表' }
  },
  
  // ========== 数据资源字典 ==========
  // 资源列表
  {
    path: '/data-resources',
    name: 'DataResources',
    component: () => import('./pages/data-resources/index.vue'),
    meta: { title: '资源列表' }
  },
  
  // ========== 统一搜索 ==========
  {
    path: '/search',
    name: 'Search',
    component: () => import('./pages/search/index.vue'),
    meta: { title: '统一搜索' }
  },

  // ========== 客户360 ==========
  {
    path: '/customer360',
    name: 'Customer360',
    component: () => import('./pages/customer360/index.vue'),
    meta: { title: '客户360' }
  },
  {
    path: '/customer360/detail',
    name: 'Customer360Detail',
    component: () => import('./pages/customer360/detail.vue'),
    meta: { title: '客户360详情' }
  },

  // ========== 征信 ==========
  {
    path: '/credit',
    name: 'Credit',
    component: () => import('./pages/credit/index.vue'),
    meta: { title: '征信' }
  },
  {
    path: '/credit/detail',
    name: 'CreditDetail',
    component: () => import('./pages/credit/detail.vue'),
    meta: { title: '征信详情' }
  },

  // ========== 外部数据 ==========
  {
    path: '/external',
    name: 'External',
    component: () => import('./pages/external/index.vue'),
    meta: { title: '外部数据' }
  },
  {
    path: '/external/detail',
    name: 'ExternalDetail',
    component: () => import('./pages/external/detail.vue'),
    meta: { title: '外部数据详情' }
  },

  // ========== 指标地图 ==========
  {
    path: '/metrics-map',
    name: 'MetricsMap',
    component: () => import('./pages/metrics-map/index.vue'),
    meta: { title: '指标地图' }
  },
  {
    path: '/metrics-map/detail',
    name: 'MetricsMapDetail',
    component: () => import('./pages/metrics-map/detail.vue'),
    meta: { title: '指标详情' }
  },

  // ========== API市场 ==========
  {
    path: '/api-market',
    name: 'ApiMarket',
    component: () => import('./pages/api-market/index.vue'),
    meta: { title: 'API市场' }
  },

  // ========== 统一指标 ==========
  {
    path: '/unified-metrics',
    name: 'UnifiedMetrics',
    component: () => import('./pages/unified-metrics/index.vue'),
    meta: { title: '统一指标' }
  },

  // ========== 其他 DFD 功能 ==========
  // 资产总览
  {
    path: '/asset-overview',
    name: 'AssetOverview',
    component: () => import('./pages/asset-overview/index.vue'),
    meta: { title: '资产总览' }
  },
  // 资产管理
  {
    path: '/asset-management',
    name: 'AssetManagement',
    component: () => import('./pages/asset-management/index.vue'),
    meta: { title: '资产管理' }
  },
  // 数据地图
  {
    path: '/data-map',
    name: 'DataMap',
    component: () => import('./pages/data-map/index.vue'),
    meta: { title: '数据地图' }
  },
  // 特征地图
  {
    path: '/feature-map',
    name: 'FeatureMap',
    component: () => import('./pages/feature-map/index.vue'),
    meta: { title: '特征地图' }
  },
  // 数据发现
  {
    path: '/discovery',
    name: 'Discovery',
    component: () => import('./pages/discovery/index.vue'),
    meta: { title: '数据发现' }
  },
  // 资产指南
  {
    path: '/asset-guide',
    name: 'AssetGuide',
    component: () => import('./pages/asset-guide/index.vue'),
    meta: { title: '资产指南' }
  }
]

export default routes
