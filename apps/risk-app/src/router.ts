import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import offlineModelRoutes from './modules/offline-model/router'

// Qiankun 环境下使用 qiankun 的 basename
// 独立运行时始终使用 '/risk/' 作为 base，因为静态文件部署在 /risk/ 路径下
const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/risk/') : '/risk/'

console.log('[Risk] routerBase:', routerBase)

/**
 * 修复：移除 MainLayout 嵌套，扁平化为顶层路由
 * 背景：risk-app 作为 Qiankun 子应用嵌入 portal-shell，portal-shell 的 SubAppPage
 * 已提供容器（Header/Sider/面包屑），再套 MainLayout 会导致双层导航。
 * 修复后：所有页面作为纯内容组件直接渲染，由 portal-shell 提供统一导航框架。
 */
const routes: RouteRecordRaw[] = [
  // 首页重定向
  { path: '/', redirect: '/external-data/lifecycle' },
  {
    path: '/index',
    name: 'RiskIndex',
    component: () => import('./pages/index.vue'),
    meta: { title: '数字风险' }
  },

  // ========== 外数生命周期 ==========
  {
    path: 'external-data',
    name: 'ExternalDataRoot',
    redirect: '/external-data/lifecycle'
  },
  {
    path: 'external-data/lifecycle',
    name: 'RiskExternalDataLifecycle',
    component: () => import('./modules/external-data/pages/Lifecycle.vue'),
    meta: { title: '外数生命周期' }
  },
  {
    path: 'external-data/lifecycle/:id',
    name: 'RiskExternalDataLifecycleDetail',
    component: () => import('./modules/external-data/pages/Lifecycle.vue'),
    meta: { title: '外数生命周期详情' },
    props: true
  },
  {
    path: 'external-data/evaluation',
    name: 'RiskExternalDataEvaluation',
    component: () => import('./modules/external-data/pages/Evaluation.vue'),
    meta: { title: '外数评估' }
  },
  {
    path: 'external-data/evaluation/:id',
    name: 'RiskExternalDataEvaluationDetail',
    component: () => import('./modules/external-data/pages/EvaluationDetail.vue'),
    meta: { title: '评估详情' },
    props: true
  },
  {
    path: 'external-data/archive',
    name: 'RiskExternalDataArchive',
    component: () => import('./modules/external-data/pages/Archive.vue'),
    meta: { title: '外数档案' }
  },
  {
    path: 'external-data/archive/:id',
    name: 'RiskExternalDataArchiveDetail',
    component: () => import('./modules/external-data/pages/ArchiveDetail.vue'),
    meta: { title: '档案详情' },
    props: true
  },
  {
    path: 'external-data/service',
    name: 'RiskExternalDataService',
    component: () => import('./modules/external-data/pages/Service.vue'),
    meta: { title: '外数数据服务' }
  },
  {
    path: 'external-data/service-create',
    name: 'RiskExternalDataServiceCreate',
    component: () => import('./modules/external-data/pages/Service.vue'),
    meta: { title: '外数服务创建（新）' }
  },
  {
    path: 'external-data/service-scene',
    name: 'RiskExternalDataServiceScene',
    component: () => import('./modules/external-data/pages/ServiceScene.vue'),
    meta: { title: '服务场景入口' }
  },
  {
    path: 'external-data/sample-preparation',
    name: 'RiskExternalDataSamplePreparation',
    component: () => import('./modules/external-data/pages/SamplePreparation.vue'),
    meta: { title: '样本表准备' }
  },
  {
    path: 'external-data/sample-preparation/create',
    name: 'RiskExternalDataSamplePreparationCreate',
    component: () => import('./modules/external-data/pages/SamplePreparationCreate.vue'),
    meta: { title: '新建样本表' }
  },
  {
    path: 'external-data/sample-preparation/edit/:id',
    name: 'RiskExternalDataSamplePreparationEdit',
    component: () => import('./modules/external-data/pages/SamplePreparationCreate.vue'),
    meta: { title: '编辑样本表' },
    props: true
  },
  {
    path: 'external-data/validation-template',
    name: 'RiskExternalDataValidationTemplate',
    component: () => import('./modules/external-data/pages/ServiceValidationTemplate.vue'),
    meta: { title: '服务校验模版管理' }
  },
  {
    path: 'external-data/online-call-application',
    name: 'RiskExternalDataOnlineCallApplication',
    component: () => import('./modules/external-data/pages/OnlineCallApplication.vue'),
    meta: { title: '外数线上调用服务申请' }
  },

  // ========== 预算管理 ==========
  {
    path: 'budget',
    name: 'RiskBudgetRoot',
    redirect: '/budget/overview'
  },
  {
    path: 'budget/overview',
    name: 'BudgetOverview',
    component: () => import('./modules/budget/pages/Overview.vue'),
    meta: { title: '预算总览' }
  },
  {
    path: 'budget/monitor',
    name: 'RiskBudgetMonitorPage',
    component: () => import('./modules/budget/pages/Monitor.vue'),
    meta: { title: '预算监控' }
  },
  {
    path: 'budget/contracts',
    name: 'RiskBudgetContracts',
    component: () => import('./modules/budget/pages/Contracts.vue'),
    meta: { title: '合同管理' }
  },
  {
    path: 'budget/contracts/:id',
    name: 'RiskBudgetContractDetail',
    component: () => import('./modules/budget/pages/ContractDetail.vue'),
    meta: { title: '合同详情' },
    props: true
  },
  {
    path: 'budget/contracts/create',
    name: 'RiskBudgetContractCreate',
    component: () => import('./modules/budget/pages/ContractCreate.vue'),
    meta: { title: '新建合同' }
  },
  {
    path: 'budget/settlement',
    name: 'RiskBudgetSettlement',
    component: () => import('./modules/budget/pages/Settlement.vue'),
    meta: { title: '结算管理' }
  },
  {
    path: 'budget/settlement/task/new',
    name: 'RiskBudgetSettlementTaskNew',
    component: () => import('./modules/budget/pages/TaskPage.vue'),
    meta: { title: '创建结算任务' }
  },
  {
    path: 'budget/settlement/task/:id',
    name: 'RiskBudgetSettlementTask',
    component: () => import('./modules/budget/pages/TaskPage.vue'),
    meta: { title: '结算任务' },
    props: true
  },
  {
    path: 'budget/accounting',
    name: 'RiskBudgetAccounting',
    component: () => import('./modules/budget/pages/Accounting.vue'),
    meta: { title: '核算流程' }
  },
  {
    path: 'budget/list',
    name: 'RiskBudgetList',
    component: () => import('./modules/budget/pages/List.vue'),
    meta: { title: '预算列表' }
  },
  {
    path: 'budget/create',
    name: 'RiskBudgetCreate',
    component: () => import('./modules/budget/pages/Create.vue'),
    meta: { title: '新建预算' }
  },
  {
    path: 'budget/edit/:id',
    name: 'RiskBudgetEdit',
    component: () => import('./modules/budget/pages/Edit.vue'),
    meta: { title: '编辑预算' },
    props: true
  },
  {
    path: 'budget/detail/:id',
    name: 'RiskBudgetDetail',
    component: () => import('./modules/budget/pages/Detail.vue'),
    meta: { title: '预算详情' },
    props: true
  },

  // ========== 离线模型（已有自己的 Layout，保留原结构）==========
  ...offlineModelRoutes
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 数字风险`
  }
  next()
})

export default router
