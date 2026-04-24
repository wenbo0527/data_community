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
  },
  // 文档管理
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('./pages/docs/index.vue'),
    meta: { title: '文档管理' }
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

export default router
