export default [
  {
    path: '/exploration',
    name: 'exploration',
    component: () => import('@/pages/exploration/index.vue'),
    children: [
      {
        path: 'index',
        name: 'explorationIndex',
        component: () => import('@/pages/exploration/index.vue')
      },
      {
        path: 'external-monitor',
        name: 'external-data-monitor',
        component: () => import('@/pages/exploration/external-data-monitor.vue')
      },
      {
        path: 'budget-management',
        name: 'budgetManagement',
        component: () => import('@/pages/exploration/budget-management.vue')
      },
      {
        path: 'external-data-evaluation/list',
        name: 'externalDataEvaluationList',
        component: () => import('@/pages/exploration/ExternalDataEvaluationList.vue')
      },
      {
        path: 'external-data-evaluation/create',
        name: 'createExternalDataEvaluation',
        component: () => import('@/pages/exploration/CreateExternalDataEvaluationPage.vue')
      },
      {
        path: 'external-data-evaluation/detail/:id',
        name: 'externalDataEvaluationDetail',
        component: () => import('@/pages/exploration/ExternalDataEvaluationDetail.vue')
      },
      {
        path: 'external-data-evaluation/edit/:id',
        name: 'externalDataEvaluationEdit',
        component: () => import('@/pages/exploration/ExternalDataEvaluationEdit.vue')
      },
      {
        path: 'external-data-evaluation/progress',
        name: 'externalDataEvaluationProgress',
        component: () => import('@/pages/exploration/TaskProgressPage.vue')
      }
    ]
  }
];
