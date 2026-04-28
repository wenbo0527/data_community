import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 数据发现域路由配置
 *
 * Shell 路由映射规则：
 *   Shell url: /dfd/{feature}  → dfd-app base: /dfd/  →  dfd-app 路由: /{feature}
 *
 * PRD 子路径映射（Shell menus key → dfd-app URL）：
 *   /dfd/data-map                → /data-map
 *   /dfd/data-resources          → /discovery/data-resources (5-tab 聚合页)
 *   /dfd/data-resources/system-data   → /discovery/data-resources?type=business
 *   /dfd/data-resources/external-data→ /discovery/data-resources?type=external
 *   /dfd/data-resources/file-import  → /discovery/data-resources?type=file
 *   /dfd/data-resources/log-data    → /discovery/data-resources?type=log
 *   /dfd/data-resources/real-time-data→ /discovery/data-resources?type=realtime
 *   /dfd/asset-catalog           → /discovery/asset-catalog
 *   /dfd/data-map/table-list     → /discovery/asset-catalog
 *   /dfd/metrics-map             → /discovery/metrics-map
 *   /dfd/variable-map            → /discovery/variable-map
 *   /dfd/feature-map             → /discovery/feature-map
 *   /dfd/api-market              → /discovery/api-market
 *   /dfd/lineage                 → /discovery/lineage
 *   /dfd/impact-analysis         → /discovery/impact-analysis
 *   /dfd/favorites               → /discovery/favorites
 *   /dfd/search                  → /discovery/search
 *   /dfd/indicator-dict          → /discovery/indicator-dict
 *   /dfd/variable-dict           → /discovery/variable-dict
 *   /dfd/feature-dict            → /discovery/feature-dict
 *   /dfd/indicator-dashboard     → /discovery/indicator-dashboard
 *   /dfd/unified-metrics         → /discovery/unified-metrics
 */
const routes: RouteRecordRaw[] = [
  // ========== 独立页面（无嵌套布局）==========
  {
    path: '/',
    name: 'DfdIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数据发现域' }
  },

  // ========== Discovery 嵌套路由（左侧内部菜单）==========
  {
    path: '/discovery',
    component: () => import('./components/DiscoveryLayout.vue'),
    children: [
      // 默认 → 数据地图
      { path: '', redirect: '/discovery/data-map' },

      // --- 数据地图 ---
      {
        path: 'data-map',
        name: 'DiscoveryDataMap',
        component: () => import('./pages/data-map/index.vue'),
        meta: { title: '数据地图' }
      },

      // --- 资产目录 ---
      {
        path: 'asset-catalog',
        name: 'AssetCatalog',
        component: () => import('./pages/asset-catalog/index.vue'),
        meta: { title: '资产目录' }
      },
      {
        path: 'data-map/table-list',
        redirect: '/discovery/asset-catalog'
      },

      // --- 数据资源发现（5种子类型）---
      // 通用聚合页：接收 ?type= 参数决定默认激活的 tab
      {
        path: 'data-resources',
        name: 'DiscoveryDataResources',
        component: () => import('./pages/data-resources/index.vue'),
        meta: { title: '数据资源发现' }
      },
      // 5 个子路径别名 → 都路由到 data-resources
      {
        path: 'data-resources/system-data',
        redirect: '/discovery/data-resources'
      },
      {
        path: 'data-resources/external-data',
        redirect: '/discovery/data-resources'
      },
      {
        path: 'data-resources/file-import',
        redirect: '/discovery/data-resources'
      },
      {
        path: 'data-resources/log-data',
        redirect: '/discovery/data-resources'
      },
      {
        path: 'data-resources/real-time-data',
        redirect: '/discovery/data-resources'
      },

      // --- 数据要素发现 ---
      {
        path: 'metrics-map',
        name: 'MetricsMap',
        component: () => import('./pages/metrics-map/index.vue'),
        meta: { title: '指标地图' }
      },
      {
        path: 'variable-map',
        name: 'VariableMap',
        component: () => import('./pages/variable-map/index.vue'),
        meta: { title: '变量地图' }
      },
      {
        path: 'feature-map',
        name: 'FeatureMap',
        component: () => import('./pages/feature-map/index.vue'),
        meta: { title: '特征地图' }
      },
      {
        path: 'api-market',
        name: 'ApiMarket',
        component: () => import('./pages/api-market/index.vue'),
        meta: { title: '其他' }
      },

      // --- 数据资产运营工具 ---
      {
        path: 'lineage',
        name: 'Lineage',
        component: () => import('./pages/lineage/index.vue'),
        meta: { title: '全链路血缘' }
      },
      {
        path: 'impact-analysis',
        name: 'ImpactAnalysis',
        component: () => import('./pages/impact-analysis/index.vue'),
        meta: { title: '变更影响分析' }
      },

      // --- 资产收藏 ---
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('./pages/favorites/index.vue'),
        meta: { title: '资产收藏' }
      },

      // --- 统一搜索 ---
      {
        path: 'search',
        name: 'Search',
        component: () => import('./pages/search/index.vue'),
        meta: { title: '统一搜索' }
      },

      // --- 指标字典 ---
      {
        path: 'indicator-dict',
        name: 'IndicatorDict',
        component: () => import('./pages/indicator-dict/index.vue'),
        meta: { title: '指标字典' }
      },

      // --- 变量字典 ---
      {
        path: 'variable-dict',
        name: 'VariableDict',
        component: () => import('./pages/variable-dict/index.vue'),
        meta: { title: '变量字典' }
      },

      // --- 特征字典 ---
      {
        path: 'feature-dict',
        name: 'FeatureDict',
        component: () => import('./pages/feature-dict/index.vue'),
        meta: { title: '特征字典' }
      },

      // --- 指标看板 ---
      {
        path: 'indicator-dashboard',
        name: 'IndicatorDashboard',
        component: () => import('./pages/indicator-dashboard/index.vue'),
        meta: { title: '指标看板' }
      },

      // --- 统一指标 ---
      {
        path: 'unified-metrics',
        name: 'UnifiedMetrics',
        component: () => import('./pages/unified-metrics/index.vue'),
        meta: { title: '统一指标' }
      },

      // --- 资产总览 ---
      {
        path: 'asset-overview',
        name: 'AssetOverview',
        component: () => import('./pages/asset-overview/index.vue'),
        meta: { title: '资产总览' }
      },

      // --- 资产管理 ---
      {
        path: 'asset-management',
        name: 'AssetManagement',
        component: () => import('./pages/asset-management/index.vue'),
        meta: { title: '资产管理' }
      },

      // --- 客户360 ---
      {
        path: 'customer360',
        name: 'Customer360',
        component: () => import('./pages/customer360/index.vue'),
        meta: { title: '客户360' }
      },
      {
        path: 'customer360/detail',
        name: 'Customer360Detail',
        component: () => import('./pages/customer360/detail.vue'),
        meta: { title: '客户360详情' }
      },

      // --- 征信 ---
      {
        path: 'credit',
        name: 'Credit',
        component: () => import('./pages/credit/index.vue'),
        meta: { title: '征信' }
      },
      {
        path: 'credit/detail',
        name: 'CreditDetail',
        component: () => import('./pages/credit/detail.vue'),
        meta: { title: '征信详情' }
      },

      // --- 外部数据 ---
      {
        path: 'external',
        name: 'External',
        component: () => import('./pages/external/index.vue'),
        meta: { title: '外部数据' }
      },
      {
        path: 'external/detail',
        name: 'ExternalDetail',
        component: () => import('./pages/external/detail.vue'),
        meta: { title: '外部数据详情' }
      },

      // --- 指标地图详情 ---
      {
        path: 'metrics-map/detail',
        name: 'MetricsMapDetail',
        component: () => import('./pages/metrics-map/detail.vue'),
        meta: { title: '指标详情' }
      },

      // --- 批量注册 ---
      {
        path: 'batch-registration',
        name: 'BatchRegistration',
        component: () => import('./pages/batch-registration/index.vue'),
        meta: { title: '批量注册指标' }
      },

      // --- 监管配置 ---
      {
        path: 'regulatory-config',
        name: 'RegulatoryConfig',
        component: () => import('./pages/regulatory-config/index.vue'),
        meta: { title: '监管报表配置' }
      }
    ]
  },

  // ========== 扁平路由别名（兼容直接 URL 访问和 Shell iframe）==========
  // 这些路径与 Shell menus 的 url 字段对应，格式：/dfd/{feature} → base 剥离后 /{feature}
  {
    path: '/data-map',
    name: 'DataMapFlat',
    component: () => import('./pages/data-map/index.vue'),
    meta: { title: '数据地图' }
  },
  {
    path: '/asset-catalog',
    name: 'AssetCatalogFlat',
    component: () => import('./pages/asset-catalog/index.vue'),
    meta: { title: '资产目录' }
  },
  {
    path: '/data-resources',
    name: 'DataResourcesFlat',
    component: () => import('./pages/data-resources/index.vue'),
    meta: { title: '数据资源' }
  },
  {
    path: '/feature-dict',
    name: 'FeatureDictFlat',
    component: () => import('./pages/feature-dict/index.vue'),
    meta: { title: '特征字典' }
  },
  {
    path: '/variable-dict',
    name: 'VariableDictFlat',
    component: () => import('./pages/variable-dict/index.vue'),
    meta: { title: '变量字典' }
  },
  {
    path: '/indicator-dict',
    name: 'IndicatorDictFlat',
    component: () => import('./pages/indicator-dict/index.vue'),
    meta: { title: '指标字典' }
  },
  {
    path: '/metrics-map',
    name: 'MetricsMapFlat',
    component: () => import('./pages/metrics-map/index.vue'),
    meta: { title: '指标地图' }
  },
  {
    path: '/feature-map',
    name: 'FeatureMapFlat',
    component: () => import('./pages/feature-map/index.vue'),
    meta: { title: '特征地图' }
  },
  {
    path: '/api-market',
    name: 'ApiMarketFlat',
    component: () => import('./pages/api-market/index.vue'),
    meta: { title: 'API市场' }
  },
  {
    path: '/lineage',
    name: 'LineageFlat',
    component: () => import('./pages/lineage/index.vue'),
    meta: { title: '全链路血缘' }
  },
  {
    path: '/impact-analysis',
    name: 'ImpactAnalysisFlat',
    component: () => import('./pages/impact-analysis/index.vue'),
    meta: { title: '变更影响分析' }
  },
  {
    path: '/favorites',
    name: 'FavoritesFlat',
    component: () => import('./pages/favorites/index.vue'),
    meta: { title: '资产收藏' }
  },
  {
    path: '/search',
    name: 'SearchFlat',
    component: () => import('./pages/search/index.vue'),
    meta: { title: '统一搜索' }
  },
  {
    path: '/indicator-dashboard',
    name: 'IndicatorDashboardFlat',
    component: () => import('./pages/indicator-dashboard/index.vue'),
    meta: { title: '指标看板' }
  },
  {
    path: '/unified-metrics',
    name: 'UnifiedMetricsFlat',
    component: () => import('./pages/unified-metrics/index.vue'),
    meta: { title: '统一指标' }
  },
  {
    path: '/discovery',
    name: 'DiscoveryFlat',
    component: () => import('./pages/discovery/index.vue'),
    meta: { title: '数据发现' }
  }
]

export default routes
