import { createRouter, createWebHistory } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import marketingRoutes from './marketing'
import managementRoutes from './management'

const router = createRouter({
  history: createWebHistory('/'), routes: [
    ...managementRoutes,
      {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login/index.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../pages/login/home.vue')
    },
    {
      path: '/discovery/data-map/table/:tableName',
      name: 'TableDetail',
      component: () => import('@/pages/discovery/data-map/TableDetailPage.vue')
    },
    {
      path: '/touch',
      name: 'Touch',
      component: () => import('../components/layout/TouchLayout.vue'),
      children: [
        {
          path: '',
          name: 'TouchIndex',
          component: () => import('../pages/touch/index.vue')
        },
        {
          path: 'channel/blacklist',
          name: 'ChannelBlacklist',
          component: () => import('../pages/touch/channel/blacklist.vue')
        },
        {
          path: 'manual-sms',
          name: 'ManualSMS',
          component: () => import('../pages/touch/manual-sms/index.vue')
        },
        {
          path: 'policy/template',
          name: 'PolicyTemplate',
          component: () => import('../pages/touch/policy/template/index.vue'),
          meta: { title: '策略模板' }
        },
        {
          path: 'channel',
          name: 'ChannelManagement',
          component: () => import('../pages/touch/channel/index.vue'),
          children: [
            {
              path: 'blacklist',
              name: 'ChannelBlacklist',
              component: () => import('../pages/touch/channel/blacklist.vue')
            }
          ]
        },

        { path: 'query', name: 'TouchQuery', component: () => import('../pages/touch/query/index.vue') },
        { path: 'manual-sms', name: 'ManualSMS', component: () => import('../pages/touch/manual-sms/index.vue'), meta: { title: '短信手工下发' } }
      ],
      props: true
    },
    {
      path: '/discovery',
      name: 'discovery',
      redirect: '/discovery/external',
      children: [
        {
          path: 'customer360',
          name: 'Customer360',
          component: () => import('../pages/discovery/customer360/index.vue'),
          children: [
            {
              path: ':userId',
name: 'Customer360Detail',
component: () => import('../pages/discovery/customer360/detail.vue'),
props: true,
beforeEnter: (to) => {
  if (!/^\d+$/.test(to.params.userId)) {
    return '/discovery/customer360';
  }
}
            }
          ]
        },
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
          path: 'data-map/table-list',
          name: 'TableList',
          component: () => import('../pages/discovery/data-map/TableList.vue')
        },
        {
          path: 'credit/detail/:id',
          name: 'creditDetail',
          component: () => import('../pages/discovery/credit/detail.vue')
        },
        {
          path: 'metrics-map',
          name: 'metricsMap',
          component: () => import('../pages/discovery/metrics-map/index.vue')
        },
        {
          path: 'data-map',
          name: 'dataMap',
          meta: { title: '数据搜索' },
          component: () => import('../pages/discovery/data-map/index.vue')
        },
        {
          path: 'data-map/collection/:id',
          name: 'CollectionDetail',
          component: () => import('../pages/discovery/data-map/CollectionDetail.vue')
        },
        {
          path: 'asset-overview',
          name: 'AssetOverview',
          meta: { title: '资产总览' },
          component: () => import('../pages/discovery/asset-overview/index.vue')
        },
        {
          path: 'search',
          name: 'AggregatedSearch',
          meta: { title: '聚合搜索' },
          component: () => import('../pages/discovery/search/index.vue')
        },
        {
          path: 'asset-management/table-management',
          name: 'TableManagement',
          meta: { title: '表管理' },
          component: () => import('../pages/discovery/asset-management/table-management/index.vue')
        },
        {
          path: 'asset-management/external-data-management',
          name: 'ExternalDataManagement',
          meta: { title: '外数管理' },
          component: () => import('../pages/discovery/asset-management/external-data-management/index.vue')
        },
        {
          path: 'asset-management/metric-management',
          name: 'MetricManagement',
          meta: { title: '指标管理' },
          component: () => import('../pages/discovery/asset-management/metric-management/index.vue')
        },
        {
          path: 'asset-management/batch-asset-management',
          name: 'BatchAssetManagement',
          meta: { title: '资产批量管理' },
          component: () => import('../pages/discovery/asset-management/batch-asset-management/index.vue')
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
        },
        {
          path: 'external-monitor',
          name: 'external-data-monitor',
          component: () => import('../pages/exploration/external-data-monitor.vue')
        },
        {
          path: 'budget-management',
          name: 'budgetManagement',
          component: () => import('../pages/exploration/budget-management.vue')
        },
        {
          path: 'external-data-evaluation',
          name: 'externalDataEvaluation',
          component: () => import('../pages/exploration/external-data-evaluation.vue')
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
    ...marketingRoutes,
    {
      path: '/external-data-v1',
      name: 'ExternalDataV1',
      redirect: '/external-data-v1/list',
      children: [
        {
          path: 'list',
          name: 'ExternalDataV1List',
          component: () => import('../pages/external-data-v1/index.vue')
        },
        {
          path: 'detail/:id',
          name: 'ExternalDataV1Detail',
          component: () => import('../pages/external-data-v1/detail.vue')
        }
      ]
    },
    {
      path: '/',
      redirect: '/home'
    }
  ]
})

router.beforeEach((to, from) => {
  console.log('路由跳转:', from.path, '=>', to.path)
  console.log('路由参数:', to.params)
  console.log('路由元信息:', to.meta)
})

// 打印完整路由结构
router.getRoutes().forEach(route => {
  console.log('Registered route:', {
    path: route.path,
    name: route.name,
    children: route.children?.map(child => ({
      path: child.path,
      name: child.name
    }))
  });
});

export default router