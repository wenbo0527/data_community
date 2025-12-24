export default [
  {
    path: '/management/permission',
    name: 'permission',
    component: () => import('@/views/management/permission/index.vue'),
    children: [
      {
        path: '',
        name: 'permission-apply',
        component: () => import('@/views/management/permission/PermissionApply.vue'),
        meta: {
          title: '权限申请',
          breadcrumb: ['管理', '权限管理', '权限申请']
        }
      },
      {
        path: 'batch-apply',
        name: 'permission-batch-apply',
        component: () => import('@/views/management/permission/BatchPermissionApply.vue'),
        meta: {
          title: '批量权限申请',
          breadcrumb: ['管理', '权限管理', '批量权限申请']
        }
      },
      {
        path: 'approval',
        name: 'permission-approval',
        component: () => import('@/views/management/permission/PermissionApproval.vue'),
        meta: {
          title: '审批管理',
          breadcrumb: ['管理', '权限管理', '审批管理']
        }
      },
      {
        path: 'progress',
        name: 'permission-progress',
        component: () => import('@/views/management/permission/PermissionProgress.vue'),
        meta: {
          title: '申请进度',
          breadcrumb: ['管理', '权限管理', '申请进度']
        }
      },
      {
        path: 'management',
        name: 'permission-management',
        component: () => import('@/views/management/permission/PermissionManagement.vue'),
        meta: {
          title: '权限管理',
          breadcrumb: ['管理', '权限管理', '权限管理']
        }
      }
    ]
  }
];