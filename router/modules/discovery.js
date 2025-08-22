// Discovery模块路由配置

const discoveryRoutes = [
  {
    path: '/discovery',
    name: 'discovery',
    redirect: '/discovery/asset-overview',
    children: [
      {
        path: 'asset-overview',
        name: 'assetOverview',
        component: () => import('@/pages/discovery/asset-overview/index.vue'),
        meta: {
          title: '资产总览',
          requiresAuth: true
        }
      },
      {
        path: 'asset-management',
        name: 'assetManagement',
        children: [
          {
            path: 'table-management',
            name: 'tableManagement',
            component: () => import('@/pages/discovery/asset-management/table-management/index.vue'),
            meta: {
              title: '表管理',
              requiresAuth: true
            }
          },
          {
            path: 'field-management',
            name: 'fieldManagement',
            component: () => import('@/pages/discovery/asset-management/field-management/index.vue'),
            meta: {
              title: '字段管理',
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: 'customer360',
        name: 'customer360',
        component: () => import('@/pages/discovery/customer360/index.vue'),
        meta: {
          title: '客户360',
          requiresAuth: true
        }
      },
      {
        path: 'customer360/detail/:userId',
        name: 'customer360Detail',
        component: () => import('@/pages/discovery/customer360/detail.vue'),
        meta: {
          title: '客户360详情',
          requiresAuth: true
        },
        props: true
      }
    ]
  }
];

export default discoveryRoutes;