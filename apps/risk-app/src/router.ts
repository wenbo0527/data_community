import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// Qiankun 环境下使用 qiankun 的 basename
// 独立运行时始终使用 '/risk/' 作为 base，因为静态文件部署在 /risk/ 路径下
const routerBase = qiankunWindow.__POWERED_BY_QIANKUN__ ? (qiankunWindow.ROUTER_BASE || '/risk/') : '/risk/'

console.log('[Risk] routerBase:', routerBase)

/**
 * MainLayout 包裹层 — 为独立运行（iframe 直接加载 risk-app）提供完整导航
 * 所有子路由都作为 MainLayout 的 children，这样它们都在 MainLayout 内渲染，
 * 继承顶部 Tab 栏和左侧菜单。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./layout/MainLayout.vue'),
    children: [
      // ========== 首页重定向 ==========
      { path: '/', redirect: '/external-data/lifecycle' },
      {
        path: '/index',
        name: 'RiskIndex',
        component: () => import('./pages/index.vue'),
        meta: { title: '数字风险' }
      },

      // ========== 外数生命周期 ==========
      {
        path: '/external-data',
        name: 'ExternalDataRoot',
        redirect: '/external-data/lifecycle'
      },
      {
        path: '/external-data/lifecycle',
        name: 'RiskExternalDataLifecycle',
        component: () => import('./modules/external-data/pages/Lifecycle.vue'),
        meta: { title: '外数生命周期' }
      },
      {
        path: '/external-data/lifecycle/:id',
        name: 'RiskExternalDataLifecycleDetail',
        component: () => import('./modules/external-data/pages/Lifecycle.vue'),
        meta: { title: '外数生命周期详情' },
        props: true
      },
      {
        path: '/external-data/evaluation',
        name: 'RiskExternalDataEvaluation',
        component: () => import('./modules/external-data/pages/Evaluation.vue'),
        meta: { title: '外数评估' }
      },
      {
        path: '/external-data/evaluation/:id',
        name: 'RiskExternalDataEvaluationDetail',
        component: () => import('./modules/external-data/pages/EvaluationDetail.vue'),
        meta: { title: '评估详情' },
        props: true
      },
      {
        path: '/external-data/archive',
        name: 'RiskExternalDataArchive',
        component: () => import('./modules/external-data/pages/Archive.vue'),
        meta: { title: '外数档案' }
      },
      {
        path: '/external-data/archive/:id',
        name: 'RiskExternalDataArchiveDetail',
        component: () => import('./modules/external-data/pages/ArchiveDetail.vue'),
        meta: { title: '档案详情' },
        props: true
      },
      {
        path: '/external-data/service',
        name: 'RiskExternalDataService',
        component: () => import('./modules/external-data/pages/Service.vue'),
        meta: { title: '外数数据服务' }
      },
      {
        path: '/external-data/service-create',
        name: 'RiskExternalDataServiceCreate',
        component: () => import('./modules/external-data/pages/Service.vue'),
        meta: { title: '外数服务创建（新）' }
      },
      {
        path: '/external-data/service-scene',
        name: 'RiskExternalDataServiceScene',
        component: () => import('./modules/external-data/pages/ServiceScene.vue'),
        meta: { title: '服务场景入口' }
      },
      {
        path: '/external-data/sample-preparation',
        name: 'RiskExternalDataSamplePreparation',
        component: () => import('./modules/external-data/pages/SamplePreparation.vue'),
        meta: { title: '样本表准备' }
      },
      {
        path: '/external-data/sample-preparation/create',
        name: 'RiskExternalDataSamplePreparationCreate',
        component: () => import('./modules/external-data/pages/SamplePreparationCreate.vue'),
        meta: { title: '新建样本表' }
      },
      {
        path: '/external-data/sample-preparation/edit/:id',
        name: 'RiskExternalDataSamplePreparationEdit',
        component: () => import('./modules/external-data/pages/SamplePreparationCreate.vue'),
        meta: { title: '编辑样本表' },
        props: true
      },
      {
        path: '/external-data/validation-template',
        name: 'RiskExternalDataValidationTemplate',
        component: () => import('./modules/external-data/pages/ServiceValidationTemplate.vue'),
        meta: { title: '服务校验模版管理' }
      },
      {
        path: '/external-data/online-call-application',
        name: 'RiskExternalDataOnlineCallApplication',
        component: () => import('./modules/external-data/pages/OnlineCallApplication.vue'),
        meta: { title: '外数线上调用服务申请' }
      },

      // ========== 预算管理 ==========
      {
        path: '/budget',
        name: 'RiskBudgetRoot',
        redirect: '/budget/overview'
      },
      {
        path: '/budget/overview',
        name: 'BudgetOverview',
        component: () => import('./modules/budget/pages/Overview.vue'),
        meta: { title: '预算总览' }
      },
      {
        path: '/budget/monitor',
        name: 'RiskBudgetMonitorPage',
        component: () => import('./modules/budget/pages/Monitor.vue'),
        meta: { title: '预算监控' }
      },
      {
        path: '/budget/contracts',
        name: 'RiskBudgetContracts',
        component: () => import('./modules/budget/pages/Contracts.vue'),
        meta: { title: '合同管理' }
      },
      {
        path: '/budget/contracts/:id',
        name: 'RiskBudgetContractDetail',
        component: () => import('./modules/budget/pages/ContractDetail.vue'),
        meta: { title: '合同详情' },
        props: true
      },
      {
        path: '/budget/contracts/create',
        name: 'RiskBudgetContractCreate',
        component: () => import('./modules/budget/pages/ContractCreate.vue'),
        meta: { title: '新建合同' }
      },
      {
        path: '/budget/settlement',
        name: 'RiskBudgetSettlement',
        component: () => import('./modules/budget/pages/Settlement.vue'),
        meta: { title: '结算管理' }
      },
      {
        path: '/budget/settlement/task/new',
        name: 'RiskBudgetSettlementTaskNew',
        component: () => import('./modules/budget/pages/TaskPage.vue'),
        meta: { title: '创建结算任务' }
      },
      {
        path: '/budget/settlement/task/:id',
        name: 'RiskBudgetSettlementTask',
        component: () => import('./modules/budget/pages/TaskPage.vue'),
        meta: { title: '结算任务' },
        props: true
      },
      {
        path: '/budget/accounting',
        name: 'RiskBudgetAccounting',
        component: () => import('./modules/budget/pages/Accounting.vue'),
        meta: { title: '核算流程' }
      },
      {
        path: '/budget/list',
        name: 'RiskBudgetList',
        component: () => import('./modules/budget/pages/List.vue'),
        meta: { title: '预算列表' }
      },
      {
        path: '/budget/create',
        name: 'RiskBudgetCreate',
        component: () => import('./modules/budget/pages/Create.vue'),
        meta: { title: '新建预算' }
      },
      {
        path: '/budget/edit/:id',
        name: 'RiskBudgetEdit',
        component: () => import('./modules/budget/pages/Edit.vue'),
        meta: { title: '编辑预算' },
        props: true
      },
      {
        path: '/budget/detail/:id',
        name: 'RiskBudgetDetail',
        component: () => import('./modules/budget/pages/Detail.vue'),
        meta: { title: '预算详情' },
        props: true
      },

      // ========== 离线模型分析（作为 MainLayout 的子路由）==========
      // redirect 根路径到 feature-center
      {
        path: '/model-offline-analysis',
        redirect: '/model-offline-analysis/feature-center'
      },
      // 功能演示
      {
        path: '/model-offline-analysis/demo',
        name: 'RiskOfflineModelDemo',
        component: () => import('./modules/offline-model/pages/demo.vue'),
        meta: { title: '功能演示', icon: 'icon-play-circle' }
      },
      // 测试页面
      {
        path: '/model-offline-analysis/test',
        name: 'RiskOfflineModelTest',
        component: () => import('./modules/offline-model/pages/test.vue'),
        meta: { title: '测试页面', icon: 'icon-bug' }
      },
      // 特征中心
      {
        path: '/model-offline-analysis/feature-center',
        name: 'RiskFeatureCenter',
        component: () => import('./modules/offline-model/pages/featureCenter/index.vue'),
        meta: { title: '特征中心', icon: 'icon-apps' }
      },
      {
        path: '/model-offline-analysis/feature-center/detail/:id',
        name: 'RiskFeatureCenterDetail',
        component: () => import('./modules/offline-model/pages/featureCenter/detail.vue'),
        meta: { title: '特征详情' },
        props: true
      },
      {
        path: '/model-offline-analysis/feature-center/edit/:id',
        name: 'RiskFeatureCenterEdit',
        component: () => import('./modules/offline-model/pages/featureCenter/edit.vue'),
        meta: { title: '编辑特征' },
        props: true
      },
      {
        path: '/model-offline-analysis/feature-center/create',
        name: 'RiskFeatureCenterCreate',
        component: () => import('./modules/offline-model/pages/featureCenter/create.vue'),
        meta: { title: '新建特征' }
      },
      // 模型注册
      {
        path: '/model-offline-analysis/model-register',
        name: 'RiskModelRegister',
        component: () => import('./modules/offline-model/pages/modelRegister/index.vue'),
        meta: { title: '模型注册', icon: 'icon-upload' }
      },
      {
        path: '/model-offline-analysis/model-register/create',
        name: 'RiskModelRegisterCreate',
        component: () => import('./modules/offline-model/pages/modelRegister/create.vue'),
        meta: { title: '新建模型' }
      },
      {
        path: '/model-offline-analysis/model-register/edit/:id',
        name: 'RiskModelRegisterEdit',
        component: () => import('./modules/offline-model/pages/modelRegister/edit.vue'),
        meta: { title: '编辑模型' },
        props: true
      },
      {
        path: '/model-offline-analysis/model-register/detail/:id',
        name: 'RiskModelRegisterDetail',
        component: () => import('./modules/offline-model/pages/modelRegister/detail.vue'),
        meta: { title: '模型详情' },
        props: true
      },
      // 模型回溯
      {
        path: '/model-offline-analysis/model-backtrack',
        name: 'RiskModelBacktrack',
        component: () => import('./modules/offline-model/pages/modelBacktrack/index.vue'),
        meta: { title: '模型回溯', icon: 'icon-history' }
      },
      {
        path: '/model-offline-analysis/model-backtrack/create',
        name: 'RiskModelBacktrackCreate',
        component: () => import('./modules/offline-model/pages/modelBacktrack/create.vue'),
        meta: { title: '新建回溯' }
      },
      {
        path: '/model-offline-analysis/model-backtrack/detail/:id',
        name: 'RiskModelBacktrackDetail',
        component: () => import('./modules/offline-model/pages/modelBacktrack/detail.vue'),
        meta: { title: '回溯详情' },
        props: true
      },
      // 任务管理
      {
        path: '/model-offline-analysis/task-management',
        name: 'RiskTaskManagement',
        component: () => import('./modules/offline-model/pages/taskManagement/index.vue'),
        meta: { title: '任务管理', icon: 'icon-calendar-clock' }
      },
      {
        path: '/model-offline-analysis/task-management/detail/:id',
        name: 'RiskTaskManagementDetail',
        component: () => import('./modules/offline-model/pages/taskManagement/detail.vue'),
        meta: { title: '任务详情' },
        props: true
      },
      // 模型评估
      {
        path: '/model-offline-analysis/model-evaluation',
        name: 'RiskModelEvaluation',
        component: () => import('./modules/offline-model/pages/modelEvaluation/index.vue'),
        meta: { title: '模型评估', icon: 'icon-chart-line' }
      }
    ]
  }
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
