import { createRouter, createWebHistory } from 'vue-router'
import marketingRoutes from './marketing'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login/index.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../pages/login/home.vue'),
      props: true
    },
    {
      path: '/discovery',
      name: 'discovery',
      redirect: '/discovery/external',
      children: [
        {
          path: 'external',
          name: 'external',
          component: () => import('../pages/discovery/external/index.vue')
        },
        {
          path: 'external/detail/:id',
          name: 'externalDetail',
          component: () => import('../pages/discovery/external/detail.vue')
        },
        {
          path: 'credit',
          name: 'credit',
          component: () => import('../pages/discovery/credit/index.vue')
        },
        {
          path: 'credit/detail/:id',
          name: 'creditDetail',
          component: () => import('../pages/discovery/credit/detail.vue')
        }
      ]
    },
    {
      path: '/management',
      name: 'management',
      redirect: '/management/service',
      children: [
        {
          path: 'service',
          name: 'dataService',
          component: () => import('../pages/management/index.vue')
        },
        {
          path: 'accompany',
          name: 'accompany',
          component: () => import('../pages/management/accompany/index.vue')
        },
        {
          path: 'accompany/create',
          name: 'accompanyCreate',
          component: () => import('../pages/management/accompany/create.vue')
        },
        {
          path: 'permission',
          name: 'permission',
          component: () => import('../pages/management/permission/index.vue')
        }
      ]
    },
    {
      path: '/exploration',
      name: 'exploration',
      redirect: '/exploration/index',
      children: [
        {
          path: 'index',
          name: 'explorationIndex',
          component: () => import('../pages/exploration/index.vue')
        }
      ]
    },
    {
      path: '/risk',
      name: 'risk',
      redirect: '/risk/index'
    },
    {
      path: '/digital-marketing',
      name: 'digitalMarketing',
      component: () => import('../pages/marketing/index.vue')
    },
    marketingRoutes,
    {
      path: '/',
      redirect: '/home'
    }
  ]
})

export default router