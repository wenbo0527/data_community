export default [
  {
    path: '/marketing',
    component: () => import('@/views/marketing/index.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'couponDashboard',
        component: () => import('@/views/marketing/dashboard/index.vue')
      },
      {
        path: 'benefit',
        name: 'benefitConfig',
        component: () => import('@/views/marketing/benefit/index.vue'),
        children: [
          {
            path: 'template',
            name: 'template',
            component: () => import('@/views/marketing/benefit/template/index.vue')
          },
          {
            path: 'management',
            name: 'management',
            component: () => import('@/views/marketing/benefit/management/index.vue')
          },
          {
            path: 'package',
            name: 'package',
            component: () => import('@/views/marketing/benefit/package/index.vue')
          },
          {
            path: 'statistics',
            name: 'dataStatistics',
            component: () => import('@/views/marketing/benefit/statistics/index.vue'),
            children: [
              {
                path: 'logs',
                name: 'couponLogs',
                component: () => import('@/views/marketing/benefit/statistics/logs/index.vue')
              },
              {
                path: 'inventory',
                name: 'inventory',
                component: () => import('@/views/marketing/benefit/statistics/inventory/index.vue')
              }
            ]
          },
          {
            path: 'global',
            name: 'globalManagement',
            component: () => import('@/views/marketing/benefit/global/index.vue'),
            children: [
              {
                path: 'rules',
                name: 'globalRules',
                component: () => import('@/views/marketing/benefit/global/rules/index.vue')
              }
            ]
          }
        ]
      }
    ]
  }
];
