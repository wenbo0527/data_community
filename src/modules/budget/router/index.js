export const budgetRoutes = [
  {
    path: '/budget',
    component: () => import('@/modules/budget/layouts/BudgetLayout.vue'),
    children: [
      { path: '', redirect: '/budget/overview' },
      { path: 'overview', name: 'BudgetOverviewModule', component: () => import('@/modules/budget/pages/Overview.vue'), meta: { title: '预算总览' } },
      { path: 'list', name: 'BudgetListModule', component: () => import('@/modules/budget/pages/List.vue'), meta: { title: '预算列表' } },
      { path: 'create', name: 'BudgetCreateModule', component: () => import('@/modules/budget/pages/Create.vue'), meta: { title: '新建预算' } },
      { path: 'edit/:id', name: 'BudgetEditModule', component: () => import('@/modules/budget/pages/Edit.vue'), meta: { title: '编辑预算' }, props: true },
      { path: 'detail/:id', name: 'BudgetDetailModule', component: () => import('@/modules/budget/pages/Detail.vue'), meta: { title: '预算详情' }, props: true },
      { path: 'monitor', name: 'BudgetMonitorModule', component: () => import('@/modules/budget/pages/Monitor.vue'), meta: { title: '预算监控' } },
      { path: 'contracts', name: 'BudgetContractsModule', component: () => import('@/modules/budget/pages/Contracts.vue'), meta: { title: '合同管理' } },
      { path: 'settlement', name: 'BudgetSettlementModule', component: () => import('@/modules/budget/pages/Settlement.vue'), meta: { title: '结算管理' } }
    ]
  }
]
