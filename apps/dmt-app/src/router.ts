import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/dmt/') : '/dmt/'

console.log('[DMT] routerBase:', routerBase)

/**
 * 管理域路由配置
 * 包含业务概念、数据标准、元数据管理、系统配置等功能
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'DmtIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '管理域' }
  },
  // 业务概念
  {
    path: '/business-concept',
    name: 'BusinessConcept',
    component: () => import('./pages/business-concept/index.vue'),
    meta: { title: '业务概念' }
  },
  // 数据标准
  {
    path: '/data-standard',
    name: 'DataStandard',
    component: () => import('./pages/data-standard/index.vue'),
    meta: { title: '数据标准' }
  },
  // 元数据
  {
    path: '/metadata',
    name: 'Metadata',
    component: () => import('./pages/metadata/index.vue'),
    meta: { title: '元数据' }

  // 通知管理
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('./pages/notifications/index.vue'),
    meta: { title: '通知管理' }
  },
  // 用户组管理
  {
    path: '/user-groups',
    name: 'UserGroups',
    component: () => import('./pages/user-groups/index.vue'),
    meta: { title: '用户组管理' }
  },
  // 变量管理
  {
    path: '/variable-management',
    name: 'VariableManagement',
    component: () => import('./pages/variable-management/index.vue'),
    meta: { title: '变量管理' }
  },
  // 变量地图
  {
    path: '/variable-map',
    name: 'VariableMap',
    component: () => import('./pages/variable-map/index.vue'),
    meta: { title: '变量地图' }
  },
  // 数据模型
  {
    path: '/data-models',
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
  // 陪跑计划
  {
    path: '/accompany',
    name: 'Accompany',
    component: () => import('./pages/accompany/index.vue'),
    meta: { title: '陪跑计划' }
  },
  {
    path: '/accompany/create',
    name: 'AccompanyCreate',
    component: () => import('./pages/accompany/create.vue'),
    meta: { title: '创建陪跑计划' }
  },
  {
    path: '/accompany/result',
    name: 'AccompanyResult',
    component: () => import('./pages/accompany/result.vue'),
    meta: { title: '陪跑结果' }
  },
  // ===== 资产管理层 =====
  // 基础管理 - 标签管理
  {
    path: '/asset-management/basic-management/tag-management',
    name: 'TagManagement',
    component: () => import('./pages/asset-management/basic-management/tag-management/index.vue'),
    meta: { title: '标签管理' }
  },
  // 基础管理 - 元数据采集
  {
    path: '/asset-management/basic-management/metadata-collection',
    name: 'MetadataCollection',
    component: () => import('./pages/asset-management/basic-management/metadata-collection/index.vue'),
    meta: { title: '元数据采集' }
  },
  // 清单管理 - 表管理
  {
    path: '/asset-management/listing-management/table-management',
    name: 'TableManagement',
    component: () => import('./pages/asset-management/listing-management/table-management/index.vue'),
    meta: { title: '表管理' }
  },
  // 清单管理 - 外数管理
  {
    path: '/asset-management/listing-management/external-data-management',
    name: 'ExternalDataManagement',
    component: () => import('./pages/asset-management/listing-management/external-data-management/index.vue'),
    meta: { title: '外部数据管理' }
  },
  // 清单管理 - 指标管理
  {
    path: '/asset-management/listing-management/metric-management',
    name: 'MetricManagement',
    component: () => import('./pages/asset-management/listing-management/metric-management/index.vue'),
    meta: { title: '指标管理' }
  },
  // 清单管理 - 变量注册
  {
    path: '/asset-management/listing-management/variable-management',
    name: 'AssetVariableManagement',
    component: () => import('./pages/asset-management/listing-management/variable-management/index.vue'),
    meta: { title: '变量注册' }
  },
  // ===== 数据服务 =====
  // 服务管理
  {
    path: '/service',
    name: 'ServiceManagement',
    component: () => import('./pages/service/index.vue'),
    meta: { title: '服务管理' }
  },
  // 全量变量回溯
  {
    path: '/service/backtrack',
    name: 'Backtrack',
    component: () => import('./pages/service/backtrack.vue'),
    meta: { title: '全量变量回溯申请' }
  },
  // 客户资金用途查询
  {
    path: '/service/fund-usage-query',
    name: 'FundUsageQuery',
    component: () => import('./pages/service/fund-usage-query/index.vue'),
    meta: { title: '客户资金用途外数查询' }
  },
  // API管理
  {
    path: '/service/api-management',
    name: 'ApiManagement',
    component: () => import('./pages/service/api-management/index.vue'),
    meta: { title: 'API管理' }
  },
  // 新建API
  {
    path: '/service/api-management/create',
    name: 'ApiManagementCreate',
    component: () => import('./pages/service/api-management/Wizard.vue'),
    meta: { title: '新建API' }
  },
  // 编辑API
  {
    path: '/service/api-management/:id/edit',
    name: 'ApiManagementEdit',
    component: () => import('./pages/service/api-management/Wizard.vue'),
    meta: { title: '编辑API' }
  },
  // 明细数据查询
  {
    path: '/service/detail-data-query',
    name: 'DetailDataQuery',
    component: () => import('./pages/service/detail-data-query.vue'),
    meta: { title: '明细数据查询服务' }
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
