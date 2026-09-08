export default {
  path: '/variable-management',
  name: 'VariableManagement',
  component: () => import('@/layouts/basic-layout.vue'),
  redirect: '/variable-management/list',
  meta: {
    title: '变量管理',
    icon: 'icon-storage',
    order: 2
  },
  children: [
    {
      path: 'list',
      name: 'VariableList',
      component: () => import('@/pages/variable-management/index.vue'),
      meta: {
        title: '变量列表',
        icon: 'icon-list',
        requireAuth: true
      }
    },
    {
      path: 'detail/:id',
      name: 'VariableDetail',
      component: () => import('@/pages/variable-management/detail.vue'),
      meta: {
        title: '变量详情',
        icon: 'icon-detail',
        requireAuth: true,
        hideInMenu: true
      }
    },
    {
      path: 'map',
      name: 'VariableMap',
      component: () => import('@/pages/variable-map/index.vue'),
      meta: {
        title: '变量地图',
        icon: 'icon-relation',
        requireAuth: true
      }
    }
  ]
}