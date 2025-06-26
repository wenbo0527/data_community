export default [
  {
    path: '/management',
    name: 'management',
    component: () => import('@/views/management/index.vue'),
    children: [
      {
        path: 'service',
        name: 'management-service',  // Update the name to match the navigation target
        component: () => import('@/views/management/service/index.vue')
      },
      {
        path: 'service/fund-usage-query',
        name: 'fund-usage-query',
        component: () => import('@/pages/management/service/fund-usage-query/index.vue')
      }
    ]
  }
];
