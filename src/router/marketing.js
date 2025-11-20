import { loadComponent } from '../utils/componentLoader'

export default [
  {
    path: '/marketing',
    redirect: '/marketing/dashboard', // 添加重定向到默认页面
    children: [
      {
        path: 'dashboard',
        name: 'couponDashboard',
        component: () => import('../pages/marketing/coupon/statistics/index.vue'),
        meta: { title: '权益首页' }
      },
      {
        path: 'benefit',
        name: 'benefitConfig',
        meta: { title: '权益配置' },
        children: [
          {
            path: 'template',
            name: 'template',
            component: () => import('../pages/marketing/coupon/template/index.vue'),
            meta: { title: '券模版管理' }
          },
          {
            path: 'management',
            name: 'management',
            component: () => import('../pages/marketing/coupon/management/index.vue'),
            meta: { title: '券管理' }
          },
          {
            path: 'package',
            name: 'package',
            component: () => import('../pages/marketing/coupon/package/index.vue'),
            meta: { title: '券包管理' }
          }
        ]
      },
      {
        path: 'statistics',
        name: 'dataStatistics',
        meta: { title: '数据统计' },
        children: [
          {
            path: 'logs',
            name: 'couponLogs',
            component: () => import('../pages/marketing/coupon/record/index.vue'),
            meta: { title: '权益日志' }
          },
          {
            path: 'inventory',
            name: 'inventory',
            component: () => import('../pages/marketing/coupon/inventory/index.vue'),
            meta: { title: '库存查询' }
          }
        ]
      },    
      {
        path: 'global',
        name: 'MarketingGlobal',
        component: () => import('../pages/marketing/global/index.vue'),
        children: [
          {
            path: 'rules',
            name: 'MarketingGlobalRules',
            component: () => import('../pages/marketing/global/rules/index.vue')
          },
          {
            path: 'alert',
            name: 'MarketingGlobalAlert',
            component: () => import('../pages/marketing/alert/rules/index.vue'),
            meta: { title: '预警配置' }
          }
        ]
      },
      {
        path: 'alert',
        name: 'MarketingAlert',
        children: [
          {
            path: 'rules',
            name: 'MarketingAlertRules',
            component: () => import('../pages/marketing/alert/rules/index.vue')
          },
          {
            path: 'history',
            name: 'MarketingAlertHistory',
            component: () => import('../pages/marketing/alert/history/index.vue')
          },
          {
            path: 'management',
            name: 'MarketingAlertManagement',
            component: () => import('../pages/marketing/alert/management/index.vue'),
            meta: { title: '预警管理' }
          }
        ]
      },
      {
        path: 'coupon/create',
        name: 'MarketingCouponCreate',
        component: () => import('../pages/marketing/coupon/template/create.vue')
      },
      // 批量创建券库存相关路由
      {
        path: 'benefit/management/batch-create',
        name: 'batchCreateInventory',
        component: () => import('../pages/marketing/coupon/inventory/batch-create.vue'),
        meta: { title: '批量创建券库存' }
      },
      {
        path: 'benefit/management/approval',
        name: 'approvalManagement',
        component: () => import('../pages/marketing/coupon/inventory/approval.vue'),
        meta: { title: '审批管理' }
      },
      {
        path: 'benefit/management/history',
        name: 'batchCreateHistory',
        component: () => import('../pages/marketing/coupon/inventory/history.vue'),
        meta: { title: '批量创建历史' }
      },
      {
        path: 'coupon/management/detail',
        name: 'couponManagementDetail',
        component: () => import('../pages/marketing/coupon/management/detail.vue'),
        meta: { title: '券库存详情' }
      },
      {
        path: 'tasks',
        name: 'marketing-tasks',
        component: () => loadComponent('../pages/marketing/tasks/index.vue', 'MarketingTasks'),
        meta: { title: '营销任务' }
      },
      {
        path: 'tasks/horizontal',
        name: 'marketing-tasks-horizontal',
        component: () => loadComponent('../pages/marketing/tasks/horizontal/index.vue', 'MarketingTasksHorizontal'),
        meta: { title: '营销任务（横版原型）' }
      },
      {
        path: 'tasks/create',
        name: 'marketing-tasks-create',
        component: () => loadComponent('../pages/marketing/tasks/create.vue', 'MarketingTasksCreate'),
        meta: { title: '创建营销任务' }
      },
      {
        path: 'tasks/editor',
        name: 'marketing-tasks-editor',
        component: () => loadComponent('../pages/marketing/tasks/task-editor.vue', 'MarketingTasksEditor'),
        meta: { title: '任务管理' }
      }
    ]
  }
]