/**
 * 客群中心路由模块
 * 路由前缀: /customer
 */
import type { RouteRecordRaw } from 'vue-router'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: 'customer',
    name: 'Customer',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群中心' }
  },
  {
    path: 'customer/tag-system',
    name: 'TagSystem',
    component: () => import('@/pages/customer/tag-system/index.vue'),
    meta: { title: '标签系统' }
  },
  {
    path: 'customer/tag-management',
    name: 'TagManagement',
    component: () => import('@/pages/customer/tag-system/tag-management.vue'),
    meta: { title: '标签管理' }
  },
  {
    path: 'customer/tag-create',
    name: 'TagCreate',
    component: () => import('@/pages/customer/tag-system/tag-create.vue'),
    meta: { title: '创建标签' }
  },
  {
    path: 'customer/attribute-management',
    name: 'AttributeManagement',
    component: () => import('@/pages/customer/tag-system/attribute-management.vue'),
    meta: { title: '属性管理' }
  },
  {
    path: 'customer/event-center',
    name: 'EventCenter',
    component: () => import('@/pages/customer/event-center/index.vue'),
    meta: { title: '事件首页' }
  },
  // TASK-20260715-BF00A0E1 (文博 14:15 拍板 · 方案 A)
  // 修 https://118.196.79.130:8443/mkt/#/exploration/customer-center/event-center/event-create 空白
  // event-management.vue L259 + L263 引用此 URL, 但 router 缺失导致空白页
  // PM 边界: 不改 event-management.vue 引用路径, 保持 URL 一致
  {
    path: '/exploration/customer-center/event-center/event-create',
    name: 'EventCreate',
    component: () => import('@/pages/customer/event-center/event-create.vue'),
    meta: { title: '事件新建' }
  },
  {
    path: 'customer/event-management',
    name: 'EventManagement',
    component: () => import('@/pages/customer/event-center/event-management.vue'),
    meta: { title: '事件管理' }
  },
  {
    path: 'customer/virtual-events',
    name: 'VirtualEvents',
    component: () => import('@/pages/customer/event-center/virtual-events.vue'),
    meta: { title: '虚拟事件' }
  },
  {
    path: 'customer/sample-stats',
    name: 'SampleStats',
    component: () => import('@/pages/customer/event-center/sample-stats.vue'),
    meta: { title: '样本统计' }
  },
  {
    path: 'customer/kafka-datasource',
    name: 'KafkaDatasource',
    component: () => import('@/pages/customer/event-center/kafka-datasource.vue'),
    meta: { title: 'Kafka数据源' }
  },
  {
    path: 'customer/tag-table',
    name: 'TagTable',
    component: () => import('@/pages/customer/tag-system/table-management.vue'),
    meta: { title: '标签表管理' }
  },
  {
    path: 'customer/list',
    name: 'CustomerList',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群列表' }
  },
  {
    path: 'customer/selector',
    name: 'CustomerSelector',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客群圈选' }
  },
  {
    path: 'customer/portrait',
    name: 'CustomerPortrait',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '客户画像' }
  },
  {
    path: 'customer/idmap',
    name: 'CustomerIdmap',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: 'ID映射' }
  },
  {
    path: 'customer/delete-approval',
    name: 'CustomerDeleteApproval',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '删除审批' }
  },
  {
    path: 'customer/lifecycle/rules',
    name: 'CustomerLifecycleRules',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期规则' }
  },
  {
    path: 'customer/lifecycle/analysis',
    name: 'CustomerLifecycleAnalysis',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期分析' }
  },
  {
    path: 'customer/lifecycle/monitor',
    name: 'CustomerLifecycleMonitor',
    component: () => import('@/pages/customer/index.vue'),
    meta: { title: '生命周期监控' }
  }
]
