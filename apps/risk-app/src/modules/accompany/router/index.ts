import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/accompany',
    name: 'RiskAccompanyRoot',
    redirect: 'accompany'
  },
  {
    path: '/accompany',
    name: 'RiskAccompany',
    component: () => import('../pages/Layout.vue'),
    meta: {
      title: '陪跑计划',
      icon: 'icon-user'
    },
    children: [
      {
        path: '',
        name: 'RiskAccompanyList',
        component: () => import('../pages/index.vue'),
        meta: {
          title: '陪跑计划',
          icon: 'icon-user'
        }
      },
      {
        path: '/create',
        name: 'RiskAccompanyCreate',
        component: () => import('../pages/create.vue'),
        meta: {
          title: '创建陪跑'
        }
      },
      {
        path: '/result',
        name: 'RiskAccompanyResult',
        component: () => import('../pages/result.vue'),
        meta: {
          title: '陪跑结果'
        }
      }
    ]
  }
]

export default routes
