/**
 * risk-app 微应用注册配置
 * 本文件定义 risk-app 的菜单、路由等信息，供主应用 Shell 自动发现并加载
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'risk-app',
    version: '1.0.0',
    description: '风险管理子应用（预算管理、外数生命周期、陪跑计划）'
  },
  basePath: '/risk',
  entry: 'http://localhost:5176',
  menu: [
    {
      key: 'risk-index',
      label: '工作台',
      icon: 'icon-dashboard',
      path: '/risk',
      order: 1
    },
    {
      key: 'risk-external-data',
      label: '外数生命周期',
      icon: 'icon-data-user',
      path: '/risk/external-data/lifecycle',
      order: 2,
      children: [
        { key: 'risk-external-data-lifecycle', label: '生命周期', path: '/risk/external-data/lifecycle' },
        { key: 'risk-external-data-evaluation', label: '外数评估', path: '/risk/external-data/evaluation' },
        { key: 'risk-external-data-archive', label: '外数档案', path: '/risk/external-data/archive' },
        { key: 'risk-external-data-service', label: '数据服务', path: '/risk/external-data/service' },
        { key: 'risk-external-data-sample', label: '样本表准备', path: '/risk/external-data/sample-preparation' }
      ]
    },
    {
      key: 'risk-budget',
      label: '预算管理',
      icon: 'icon-money',
      path: '/risk/budget/overview',
      order: 3,
      children: [
        { key: 'risk-budget-overview', label: '预算总览', path: '/risk/budget/overview' },
        { key: 'risk-budget-monitor', label: '预算监控', path: '/risk/budget/monitor' },
        { key: 'risk-budget-contracts', label: '合同管理', path: '/risk/budget/contracts' },
        { key: 'risk-budget-settlement', label: '结算管理', path: '/risk/budget/settlement' },
        { key: 'risk-budget-list', label: '预算列表', path: '/risk/budget/list' }
      ]
    },
    {
      key: 'risk-accompany',
      label: '陪跑计划',
      icon: 'icon-user',
      path: '/risk/accompany',
      order: 4,
      children: [
        { key: 'risk-accompany-list', label: '陪跑计划', path: '/risk/accompany' },
        { key: 'risk-accompany-create', label: '创建陪跑', path: '/risk/accompany/create' },
        { key: 'risk-accompany-result', label: '陪跑结果', path: '/risk/accompany/result' }
      ]
    }
  ],
  routes: [
    {
      path: '/',
      redirect: '/risk'
    },
    {
      path: 'index',
      name: 'RiskIndex',
      component: './pages/index.vue',
      meta: { title: '数字风险' }
    },
    // 外数生命周期
    {
      path: 'external-data/lifecycle',
      name: 'RiskExternalDataLifecycle',
      component: './modules/external-data/pages/Lifecycle.vue',
      meta: { title: '外数生命周期' }
    },
    {
      path: 'external-data/evaluation',
      name: 'RiskExternalDataEvaluation',
      component: './modules/external-data/pages/Evaluation.vue',
      meta: { title: '外数评估' }
    },
    {
      path: 'external-data/archive',
      name: 'RiskExternalDataArchive',
      component: './modules/external-data/pages/Archive.vue',
      meta: { title: '外数档案' }
    },
    {
      path: 'external-data/service',
      name: 'RiskExternalDataService',
      component: './modules/external-data/pages/Service.vue',
      meta: { title: '外数数据服务' }
    },
    {
      path: 'external-data/sample-preparation',
      name: 'RiskExternalDataSamplePreparation',
      component: './modules/external-data/pages/SamplePreparation.vue',
      meta: { title: '样本表准备' }
    },
    // 预算管理
    {
      path: 'budget/overview',
      name: 'BudgetOverview',
      component: './modules/budget/pages/Overview.vue',
      meta: { title: '预算总览' }
    },
    {
      path: 'budget/monitor',
      name: 'RiskBudgetMonitorPage',
      component: './modules/budget/pages/Monitor.vue',
      meta: { title: '预算监控' }
    },
    {
      path: 'budget/contracts',
      name: 'RiskBudgetContracts',
      component: './modules/budget/pages/Contracts.vue',
      meta: { title: '合同管理' }
    },
    {
      path: 'budget/settlement',
      name: 'RiskBudgetSettlement',
      component: './modules/budget/pages/Settlement.vue',
      meta: { title: '结算管理' }
    },
    {
      path: 'budget/list',
      name: 'RiskBudgetList',
      component: './modules/budget/pages/List.vue',
      meta: { title: '预算列表' }
    },
    {
      path: 'budget/create',
      name: 'RiskBudgetCreate',
      component: './modules/budget/pages/Create.vue',
      meta: { title: '新建预算' }
    },
    {
      path: 'budget/detail/:id',
      name: 'RiskBudgetDetail',
      component: './modules/budget/pages/Detail.vue',
      meta: { title: '预算详情' }
    },
    // 陪跑计划
    {
      path: 'accompany',
      name: 'RiskAccompany',
      component: './modules/accompany/pages/index.vue',
      meta: { title: '陪跑计划' }
    },
    {
      path: 'accompany/create',
      name: 'RiskAccompanyCreate',
      component: './modules/accompany/pages/create.vue',
      meta: { title: '创建陪跑' }
    },
    {
      path: 'accompany/result',
      name: 'RiskAccompanyResult',
      component: './modules/accompany/pages/result.vue',
      meta: { title: '陪跑结果' }
    }
  ],
  lifecycle: {
    mount: () => {
      console.log('[risk-app] Mounted')
    },
    unmount: () => {
      console.log('[risk-app] Unmounted')
    }
  }
}

export default registry
