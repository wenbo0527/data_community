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
            name: 'AdminNotificationList',
            component: () => import('../pages/admin/notifications/index.vue'),
            meta: {
              title: '通知列表',
              keepAlive: true
            }
          },
          {
            path: 'create',
            name: 'AdminNotificationCreate',
            component: () => import('../pages/notification/NotificationForm.vue'),
            meta: {
              title: '新建通知',
              activeMenu: '/admin/notifications/list',
              hidden: true
            }
          },
          {
            path: 'edit/:id',
            name: 'AdminNotificationEdit',
            component: () => import('../pages/notification/NotificationForm.vue'),
            meta: {
              title: '编辑通知',
              activeMenu: '/admin/notifications/list',
              hidden: true
            },
            props: true
          },
          {
            path: 'detail/:id',
            name: 'AdminNotificationDetail',
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
            name: 'AdminNotificationCategories',
            component: () => import('../pages/admin/notifications/categories.vue'),
            meta: {
              title: '分类管理'
            }
          },
          {
            path: 'user-groups',
            name: 'AdminUserGroups',
            component: () => import('../pages/admin/user-groups/index.vue'),
            meta: {
              title: '用户组管理'
            }
          }
        ]
      },
      {
        path: 'docs',
        name: 'DocManagement',
        redirect: '/admin/docs/list',
        meta: {
          title: '文档管理',
          icon: 'icon-file'
        },
        children: [
          {
            path: 'list',
            name: 'AdminDocList',
            component: () => import('../pages/admin/docs/index.vue'),
            meta: { title: '文档列表' }
          },
          {
            path: 'create',
            name: 'AdminDocCreate',
            component: () => import('../pages/admin/docs/edit.vue'),
            meta: { title: '新建文档', activeMenu: '/admin/docs/list' }
          },
          {
            path: 'edit/:slug',
            name: 'AdminDocEdit',
            component: () => import('../pages/admin/docs/edit.vue'),
            meta: { title: '编辑文档', activeMenu: '/admin/docs/list' },
            props: true
          }
        ]
      }
    ]
  }
]