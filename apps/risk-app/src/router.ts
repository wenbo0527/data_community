import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import offlineModelRoutes from './modules/offline-model/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./layout/MainLayout.vue'),
    children: [
      { path: '', redirect: '/external-data/lifecycle' },
      {
        path: 'index',
        name: 'RiskIndex',
        component: () => import('./pages/index.vue'),
        meta: { title: '数字风险' }
      },
      {
        path: 'external-data',
        name: 'ExternalDataRoot',
        redirect: '/external-data/lifecycle',
        children: [
          {
            path: 'lifecycle',
            name: 'RiskExternalDataLifecycle',
            component: () => import('./modules/external-data/pages/Lifecycle.vue'),
            meta: { title: '外数生命周期' }
          },
          {
            path: 'lifecycle/:id',
            name: 'RiskExternalDataLifecycleDetail',
            component: () => import('./modules/external-data/pages/Lifecycle.vue'),
            meta: { title: '外数生命周期详情' },
            props: true
          },
          {
            path: 'evaluation',
            name: 'RiskExternalDataEvaluation',
            component: () => import('./modules/external-data/pages/Evaluation.vue'),
            meta: { title: '外数评估' }
          },
          {
            path: 'evaluation/:id',
            name: 'RiskExternalDataEvaluationDetail',
            component: () => import('./modules/external-data/pages/EvaluationDetail.vue'),
            meta: { title: '评估详情' },
            props: true
          },
          {
            path: 'archive',
            name: 'RiskExternalDataArchive',
            component: () => import('./modules/external-data/pages/Archive.vue'),
            meta: { title: '外数档案' }
          },
          {
            path: 'archive/:id',
            name: 'RiskExternalDataArchiveDetail',
            component: () => import('./modules/external-data/pages/ArchiveDetail.vue'),
            meta: { title: '档案详情' },
            props: true
          },
          {
            path: 'service',
            name: 'RiskExternalDataService',
            component: () => import('./modules/external-data/pages/Service.vue'),
            meta: { title: '外数数据服务' }
          }
        ]
      },
      {
        path: 'budget',
        name: 'RiskBudgetRoot',
        redirect: '/budget/overview',
        children: [
          {
            path: 'overview',
            name: 'BudgetOverview',
            component: () => import('./modules/budget/pages/Overview.vue'),
            meta: { title: '预算总览' }
          },
          {
            path: 'monitor',
            name: 'RiskBudgetMonitorPage',
            component: () => import('./modules/budget/pages/Monitor.vue'),
            meta: { title: '预算监控' }
          },
          {
            path: 'contracts',
            name: 'RiskBudgetContracts',
            component: () => import('./modules/budget/pages/Contracts.vue'),
            meta: { title: '合同管理' }
          },
          {
            path: 'contracts/:id',
            name: 'RiskBudgetContractDetail',
            component: () => import('./modules/budget/pages/ContractDetail.vue'),
            meta: { title: '合同详情' },
            props: true
          },
          {
            path: 'contracts/create',
            name: 'RiskBudgetContractCreate',
            component: () => import('./modules/budget/pages/ContractCreate.vue'),
            meta: { title: '新建合同' }
          },
          {
            path: 'settlement',
            name: 'RiskBudgetSettlement',
            component: () => import('./modules/budget/pages/Settlement.vue'),
            meta: { title: '结算管理' }
          },
          {
            path: 'settlement/task/new',
            name: 'RiskBudgetSettlementTaskNew',
            component: () => import('./modules/budget/pages/TaskPage.vue'),
            meta: { title: '创建结算任务' }
          },
          {
            path: 'settlement/task/:id',
            name: 'RiskBudgetSettlementTask',
            component: () => import('./modules/budget/pages/TaskPage.vue'),
            meta: { title: '结算任务' },
            props: true
          },
          {
            path: 'accounting',
            name: 'RiskBudgetAccounting',
            component: () => import('./modules/budget/pages/Accounting.vue'),
            meta: { title: '核算流程' }
          },
          {
            path: 'list',
            name: 'RiskBudgetList',
            component: () => import('./modules/budget/pages/List.vue'),
            meta: { title: '预算列表' }
          },
          {
            path: 'create',
            name: 'RiskBudgetCreate',
            component: () => import('./modules/budget/pages/Create.vue'),
            meta: { title: '新建预算' }
          },
          {
            path: 'edit/:id',
            name: 'RiskBudgetEdit',
            component: () => import('./modules/budget/pages/Edit.vue'),
            meta: { title: '编辑预算' },
            props: true
          },
          {
            path: 'detail/:id',
            name: 'RiskBudgetDetail',
            component: () => import('./modules/budget/pages/Detail.vue'),
            meta: { title: '预算详情' },
            props: true
          }
        ]
      },
      ...offlineModelRoutes
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 数字风险`
  }
  next()
})

export default router
