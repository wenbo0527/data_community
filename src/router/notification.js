export default [
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/notifications',
    meta: {
      title: '管理后台',
      requiresAuth: true,
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'notifications',
        name: 'NotificationManagement',
        redirect: '/admin/notifications/list',
        meta: {
          title: '通知管理',
          icon: 'icon-notification'
        },
        children: [
          {
            path: 'list',
            name: 'NotificationList',
            component: () => import('../pages/admin/notifications/index.vue'),
            meta: {
              title: '通知列表',
              keepAlive: true
            }
          },
          {
            path: 'create',
            name: 'NotificationCreate',
            component: () => import('../pages/admin/notifications/create.vue'),
            meta: {
              title: '新建通知',
              activeMenu: '/admin/notifications/list'
            }
          },
          {
            path: 'edit/:id',
            name: 'NotificationEdit',
            component: () => import('../pages/admin/notifications/edit.vue'),
            meta: {
              title: '编辑通知',
              activeMenu: '/admin/notifications/list',
              hidden: true
            },
            props: true
          },
          {
            path: 'detail/:id',
            name: 'NotificationDetail',
            component: () => import('../pages/admin/notifications/detail.vue'),
            meta: {
              title: '通知详情',
              activeMenu: '/admin/notifications/list',
              hidden: true
            },
            props: true
          },
          {
            path: 'categories',
            name: 'NotificationCategories',
            component: () => import('../pages/admin/notifications/categories.vue'),
            meta: {
              title: '分类管理'
            }
          }
        ]
      }
    ]
  }
]