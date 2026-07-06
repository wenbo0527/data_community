import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import MainLayout from './layouts/MainLayout.vue'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/dmt/') : '/dmt/'

console.log('[DMT] routerBase:', routerBase)

/**
 * 管理域路由配置
 * 包含业务概念、数据标准、元数据管理、系统配置等功能
 */
const childRoutes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/business-concept'
  },
  {
    path: 'business-concept',
    name: 'BusinessConcept',
    component: () => import('./pages/business-concept/index.vue'),
    meta: { title: '业务概念' }
  },
  {
    path: 'data-standard',
    name: 'DataStandard',
    component: () => import('./pages/data-standard/index.vue'),
    meta: { title: '数据标准' }
  },
  {
    path: 'data-standard/standards',
    name: 'DataStandardStandards',
    component: () => import('./pages/data-standard/standards/index.vue'),
    meta: { title: '数据标准管理' }
  },
  {
    path: 'data-standard/standards/detail/:id',
    name: 'DataStandardStandardsDetail',
    component: () => import('./pages/data-standard/standards/detail.vue'),
    meta: { title: '标准详情' }
  },
  {
    path: 'data-standard/standards/edit/:id',
    name: 'DataStandardStandardsEdit',
    component: () => import('./pages/data-standard/standards/edit.vue'),
    meta: { title: '编辑标准' }
  },
  {
    path: 'data-standard/domains',
    name: 'DataStandardDomains',
    component: () => import('./pages/data-standard/domains/index.vue'),
    meta: { title: '技术数据域管理' }
  },
  {
    path: 'data-standard/domains/detail/:id',
    name: 'DataStandardDomainDetail',
    component: () => import('./pages/data-standard/domains/detail.vue'),
    meta: { title: '技术数据域详情' }
  },
  {
    path: 'data-standard/domains/edit/:id',
    name: 'DataStandardDomainEdit',
    component: () => import('./pages/data-standard/domains/edit.vue'),
    meta: { title: '编辑技术数据域' }
  },
  {
    path: 'data-standard/codes',
    name: 'DataStandardCodes',
    component: () => import('./pages/data-standard/codes/index.vue'),
    meta: { title: '标准代码管理' }
  },
  {
    path: 'data-standard/words',
    name: 'DataStandardWords',
    component: () => import('./pages/data-standard/words/index.vue'),
    meta: { title: '标准单词管理' }
  },
  {
    path: 'data-standard/audit',
    name: 'DataStandardAudit',
    component: () => import('./pages/data-standard/audit/index.vue'),
    meta: { title: '标准稽核管理' }
  },
  {
    path: 'metadata',
    name: 'Metadata',
    component: () => import('./pages/metadata/index.vue'),
    meta: { title: '元数据' }
  },
  {
    path: 'notifications',
    name: 'Notifications',
    component: () => import('./pages/notifications/index.vue'),
    meta: { title: '通知管理' }
  },
  {
    path: 'user-groups',
    name: 'UserGroups',
    component: () => import('./pages/user-groups/index.vue'),
    meta: { title: '用户组管理' }
  },
  {
    path: 'data-models',
    name: 'DataModels',
    component: () => import('./pages/data-models/index.vue'),
    meta: { title: '数据模型' },
    children: [
      {
        path: '',
        name: 'DataModelsList',
        component: () => import('./pages/data-models/DataModelsList.vue'),
        meta: { title: '模型列表' }
      },
      {
        path: 'detail/:id',
        name: 'DataModelsDetail',
        component: () => import('./pages/data-models/DataModelsDetail.vue'),
        meta: { title: '模型详情' }
      },
      {
        path: 'create',
        name: 'DataModelsCreate',
        component: () => import('./pages/data-models/DataModelsForm.vue'),
        meta: { title: '创建模型' }
      },
      {
        path: 'edit/:id',
        name: 'DataModelsEdit',
        component: () => import('./pages/data-models/DataModelsForm.vue'),
        meta: { title: '编辑模型' }
      }
    ]
  },
  {
    path: 'accompany',
    name: 'Accompany',
    component: () => import('./pages/accompany/index.vue'),
    meta: { title: '陪跑计划' }
  },
  {
    path: 'accompany/create',
    name: 'AccompanyCreate',
    component: () => import('./pages/accompany/create.vue'),
    meta: { title: '创建陪跑计划' }
  },
  {
    path: 'accompany/result',
    name: 'AccompanyResult',
    component: () => import('./pages/accompany/result.vue'),
    meta: { title: '陪跑结果' }
  },
  {
    path: 'asset-management/basic-management/tag-management',
    name: 'TagManagement',
    component: () => import('./pages/asset-management/basic-management/tag-management/index.vue'),
    meta: { title: '标签管理' }
  },
  {
    path: 'asset-management/basic-management/metadata-collection',
    name: 'MetadataCollection',
    component: () => import('./pages/asset-management/basic-management/metadata-collection/index.vue'),
    meta: { title: '元数据采集' }
  },
  {
    path: 'asset-management/listing-management/table-management',
    name: 'TableManagement',
    component: () => import('./pages/asset-management/listing-management/table-management/index.vue'),
    meta: { title: '表管理' }
  },
  {
    path: 'asset-management/listing-management/external-data-management',
    name: 'ExternalDataManagement',
    redirect: '/risk/variable-hub/external-data/lifecycle',
    meta: { title: '外部数据管理（已迁到 risk-app）' }
  },
  {
    path: 'asset-management/listing-management/metric-management',
    name: 'MetricManagement',
    component: () => import('./pages/asset-management/listing-management/metric-management/index.vue'),
    meta: { title: '指标管理' }
  },
  {
    path: 'service',
    name: 'ServiceManagement',
    component: () => import('./pages/service/index.vue'),
    meta: { title: '服务管理' }
  },
  {
    path: 'service/stats',
    name: 'ServiceStats',
    component: () => import('./pages/service/ServiceStats.vue'),
    meta: { title: '服务统计' }
  },
  {
    path: 'service/monitor',
    name: 'ServiceMonitor',
    component: () => import('./pages/service/ServiceMonitor.vue'),
    meta: { title: '服务监控' }
  },
  {
    path: 'service/backtrack',
    name: 'Backtrack',
    component: () => import('./pages/service/backtrack.vue'),
    meta: { title: '全量变量回溯申请' }
  },
  {
    path: 'service/fund-usage-query',
    name: 'FundUsageQuery',
    component: () => import('./pages/service/fund-usage-query/index.vue'),
    meta: { title: '客户资金用途外数查询' }
  },
  {
    path: 'service/api-management',
    name: 'ApiManagement',
    component: () => import('./pages/service/api-management/index.vue'),
    meta: { title: 'API管理' }
  },
  {
    path: 'service/api-management/create',
    name: 'ApiManagementCreate',
    component: () => import('./pages/service/api-management/Wizard.vue'),
    meta: { title: '新建API' }
  },
  {
    path: 'service/api-management/:id/edit',
    name: 'ApiManagementEdit',
    component: () => import('./pages/service/api-management/Wizard.vue'),
    meta: { title: '编辑API' }
  },
  {
    path: 'service/detail-data-query',
    name: 'DetailDataQuery',
    component: () => import('./pages/service/detail-data-query.vue'),
    meta: { title: '明细数据查询服务' }
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: childRoutes
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
