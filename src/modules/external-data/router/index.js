export const externalDataRoutes = [
  {
    path: '/external-data',
    component: () => import('@/modules/external-data/layouts/ExternalDataLayout.vue'),
    children: [
      { path: '', redirect: '/external-data/archive' },
      { path: 'archive', name: 'ExternalDataArchive', component: () => import('@/modules/external-data/pages/Archive.vue'), meta: { title: '外数档案管理' } },
      { path: 'lifecycle', name: 'ExternalDataLifecycle', component: () => import('@/modules/external-data/pages/Lifecycle.vue'), meta: { title: '外数生命周期' } },
      { path: 'service', name: 'ExternalDataService', component: () => import('@/modules/external-data/pages/Service.vue'), meta: { title: '外数数据服务' } },
      { path: 'evaluation', name: 'ExternalDataEvaluation', component: () => import('@/modules/external-data/pages/Evaluation.vue'), meta: { title: '外数评估中心' } },
      { path: 'monitor', name: 'ExternalDataMonitor', component: () => import('@/modules/external-data/pages/Monitor.vue'), meta: { title: '外数监控中心' } },
      { path: 'supplier-management', name: 'ExternalSupplierManagement', component: () => import('@/modules/external-data/pages/SupplierManagement.vue'), meta: { title: '供应商管理' } },
      { path: 'supplier-pricing', name: 'ExternalSupplierPricing', component: () => import('@/modules/external-data/pages/SupplierPricing.vue'), meta: { title: '供应商定价档案' } }
    ]
  }
]
