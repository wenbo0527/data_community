export default [{  path: '/management',  children: [
    {
      path: 'service',
      name: 'management-service',
      component: () => import('../pages/management/service/index.vue'),
      meta: { title: '服务管理' }
    },
    {
      path: 'service/backtrack',
      name: 'management-service-backtrack',
      component: () => import('../pages/management/service/backtrack.vue'),
      meta: { title: '全量变量回溯申请' }
    },
    {
      path: 'accompany',
      name: 'management-accompany',
      component: () => import('../pages/management/accompany/index.vue'),
      meta: { title: '陪伴管理' },
      children: [
        {
          path: 'create',
          name: 'management-accompany-create',
          component: () => import('../pages/management/accompany/create.vue')
        },
        {
          path: 'result',
          name: 'management-accompany-result',
          component: () => import('../pages/management/accompany/result.vue')
        }
      ]
    }
  ]
}]
