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
      }

    ,{
      path: 'statistics',
      name: 'dataStatistics',
      meta: { title: '数据统计' },
      children: [
        {
          path: 'logs',
          name: 'couponLogs',
          component: () => import('../pages/marketing/coupon/record/index.vue'),
          meta: { title: '权益日志'   }
          },
          {
            path: 'inventory',
            name: 'inventory',
            component: () => import('../pages/marketing/coupon/inventory/index.vue'),
            meta: { title: '库存查询' }
          }        ]      },    
      {
        path: 'global',
        name: 'globalManagement',
        meta: { title: '全局管理' },
        children: [
          {
            path: 'rules',
            name: 'globalRules',
            component: () => import('../pages/marketing/coupon/rules/index.vue'),
            meta: { title: '全局规则' }
          }        ]      },    
    {
      path: 'coupon/create',
      name: 'MarketingCouponCreate',
      component: () => import('../pages/marketing/coupon/template/create.vue')
    },
    {
      path: 'tasks',
      name: 'marketing-tasks',
      component: () => import('../pages/marketing/tasks/index.vue'),
      meta: { title: '营销任务' }
    },
    {
      path: 'tasks/create',
      name: 'marketing-tasks-create',
      component: () => import('../pages/marketing/tasks/create.vue'),
      meta: { title: '创建营销任务' }
    },
    {
      path: 'tasks/editor',
      name: 'marketing-tasks-editor',
      component: () => import('../pages/marketing/tasks/task-editor.vue'),
      meta: { title: '任务管理' }
    }
    ]
  }
]