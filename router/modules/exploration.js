export default [
  {
    path: '/exploration',
    name: 'exploration',
    component: () => import('@/views/exploration/index.vue'),
    children: [
      {
        path: 'index',
        name: 'explorationIndex',
        component: () => import('@/views/exploration/index/index.vue')
      },
      {
        path: 'external-monitor',
        name: 'external-data-monitor',
        component: () => import('@/views/exploration/external-monitor/index.vue')
      },
      {
        path: 'budget-management',
        name: 'budgetManagement',
        component: () => import('@/views/exploration/budget-management/index.vue')
      },
      {
        path: 'external-data-evaluation',
        name: 'externalDataEvaluation',
        component: () => import('@/views/exploration/external-data-evaluation/index.vue')
      }
    ]
  }
];
