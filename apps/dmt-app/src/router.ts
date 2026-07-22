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
    path: 'metadata',
    name: 'Metadata',
    component: () => import('./pages/metadata/index.vue'),
    meta: { title: '元数据' }
  },
  {
    // 兼容 /dmt/metadata/modeling 直接访问 — 重定向到元数据首页
    path: 'metadata/modeling',
    redirect: '/metadata'
  },
  {
    // 兼容 /dmt/metadata/query 直接访问 — 重定向到元数据首页
    path: 'metadata/query',
    redirect: '/metadata'
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
    path: 'asset-management/listing-management/asset-management',
    name: 'AssetListingOverview',
    component: () => import('./pages/asset-management/listing-management/asset-management/sources.vue'),
    meta: { title: '数据资产上下架' }
  },
  {
    path: 'asset-management/listing-management/asset-management/system/:systemId',
    name: 'AssetListingSystem',
    component: () => import('./pages/asset-management/listing-management/asset-management/system-tables.vue'),
    meta: { title: '系统资产列表' }
  },
  {
    path: 'asset-management/listing-management/asset-management/detail/:name',
    name: 'AssetListingDetail',
    component: () => import('./pages/asset-management/listing-management/asset-management/detail.vue'),
    meta: { title: '资产详情' }
  },
  {
    path: 'asset-management/listing-management/data-source',
    name: 'DataSourceListingOverview',
    component: () => import('./pages/asset-management/listing-management/data-source/business-system.vue'),
    meta: { title: '数据资源上下架' }
  },
  {
    path: 'asset-management/listing-management/data-source/business-system',
    name: 'DataSourceBusinessSystem',
    component: () => import('./pages/asset-management/listing-management/data-source/sources.vue'),
    meta: { title: '业务系统' }
  },
  {
    path: 'asset-management/listing-management/data-source/system/:systemId',
    name: 'DataSourceListingSystem',
    component: () => import('./pages/asset-management/listing-management/asset-management/system-tables.vue'),
    meta: { title: '系统资源列表' }
  },
  {
    // 旧路径（表管理）已迁移到「数据资源上下架」入口，保留 redirect 兼容老链接
    path: 'asset-management/listing-management/table-management/:subPath(.*)*',
    name: 'TableManagementLegacyRedirect',
    redirect: (to: any) => ({
      path: `/asset-management/listing-management/data-source${to.params.subPath ? '/' + (Array.isArray(to.params.subPath) ? to.params.subPath.join('/') : to.params.subPath) : ''}`
    }),
    meta: { title: '表管理（已迁移）' }
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
  },
  // ============ 数据分级分类（PRD v1.0-rc.2）============
  // ============ 数据分级分类（PRD v1.0-rc.2，挂在数据管理下）============
  // matrix / tasks 已移入下方 ClassifyEntry 的 children 子路由
  {
    path: 'metadata/classify-api-docs',
    name: 'ClassifyApiDocs',
    component: () => import('./pages/metadata/classify-api-docs.vue'),
    meta: { title: '分级分类 API 文档' }
  },
  {
    path: 'metadata/classify',
    name: 'ClassifyEntry',
    component: () => import('./pages/metadata/classify/index.vue'),
    meta: { title: '数据分级分类' },
    redirect: '/metadata/classify/sources',
    children: [
      {
        path: 'sources',
        name: 'ClassifySources',
        component: () => import('./pages/metadata/classify/sources.vue'),
        meta: { title: '数据源' }
      },
      {
        path: 'tables/:systemId',
        name: 'ClassifyTables',
        component: () => import('./pages/metadata/classify/tables.vue'),
        meta: { title: '表列表' }
      },
      {
        path: 'table/:systemId/:schema/:tableName',
        name: 'ClassifyTableDetail',
        component: () => import('./pages/metadata/classify/table-detail.vue'),
        meta: { title: '表详情' }
      },
      {
        path: 'matrix',
        name: 'ClassifyMatrix',
        component: () => import('./pages/metadata/classify-matrix.vue'),
        meta: { title: '数据安全分级矩阵表' }
      },
      {
        path: 'tasks',
        name: 'ClassifyTasks',
        component: () => import('./pages/metadata/classify-tasks.vue'),
        meta: { title: '分级分类任务' }
      }
    ]
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
