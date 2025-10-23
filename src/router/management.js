export default [{
  path: '/management',
  children: [
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
      path: 'service/fund-usage-query',
      name: 'fund-usage-query',
      component: () => import('../pages/management/service/fund-usage-query/index.vue'),
      meta: { title: '客户资金用途外数查询' }
    },
    {
      path: 'service/detail-data-query',
      name: 'detail-data-query',
      component: () => import('../pages/management/service/detail-data-query.vue'),
      meta: { title: '明细数据查询服务' }
    },
    {
      path: 'data-models',
      name: 'data-models',
      component: () => import('../pages/management/data-models/index.vue'),
      meta: { title: '数据查询&管理模型' },
      children: [
        {
          path: '',
          name: 'data-models-list',
          component: () => import('../pages/management/data-models/DataModelsList.vue'),
          meta: { title: '数据模型列表' }
        },
        {
          path: 'create',
          name: 'data-models-create',
          component: () => import('../pages/management/data-models/DataModelsForm.vue'),
          meta: { title: '新增数据模型' }
        },
        {
          path: ':id/edit',
          name: 'data-models-edit',
          component: () => import('../pages/management/data-models/DataModelsForm.vue'),
          meta: { title: '编辑数据模型' },
          props: true
        },
        {
          path: ':id',
          name: 'data-models-detail',
          component: () => import('../pages/management/data-models/DataModelsDetail.vue'),
          meta: { title: '数据模型详情' },
          props: true
        }
      ]
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
