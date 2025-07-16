import { createRouter, createWebHistory } from 'vue-router'
import marketingRoutes from './marketing'
import managementRoutes from './management'
import explorationRoutes from './exploration'
import { ROUTE_NAMES, ROUTE_PATHS, ROUTE_GUARD_CONFIG } from './constants'
import { checkRoutePermission, getBreadcrumb } from './utils'
import { businessMessage, warning, error } from '../utils/message'
import { useUserStore } from '../store/modules/user'

const router = createRouter({
  history: createWebHistory('/'), routes: [
    ...managementRoutes,
      {
      path: ROUTE_PATHS.LOGIN,
      name: ROUTE_NAMES.LOGIN,
      component: () => import('../pages/login/index.vue'),
      meta: {
        title: '登录',
        layout: 'blank',
        hidden: true
      }
    },
    {
      path: ROUTE_PATHS.HOME,
      name: ROUTE_NAMES.HOME,
      component: () => import('../pages/login/home.vue'),
      meta: {
        title: '首页',
        icon: 'icon-home'
      }
    },
    {
      path: `${ROUTE_PATHS.DISCOVERY.TABLE_DETAIL}/:tableName`,
      name: ROUTE_NAMES.DISCOVERY.TABLE_DETAIL,
      component: () => import('../pages/discovery/data-map/TableDetailPage.vue'),
      meta: {
        title: '表详情',
        hidden: true
      }
    },
    {
      path: ROUTE_PATHS.TOUCH.ROOT,
      children: [
        {
          path: '',
          name: ROUTE_NAMES.TOUCH.INDEX,
          component: () => import('../pages/touch/index.vue'),
          meta: {
            title: '触达首页'
          }
        },
        {
          path: 'channel/blacklist',
          name: ROUTE_NAMES.TOUCH.CHANNEL_BLACKLIST,
          component: () => import('../pages/touch/channel/blacklist.vue'),
          meta: {
            title: '渠道黑名单'
          }
        },
        {
          path: 'manual-sms',
          name: ROUTE_NAMES.TOUCH.MANUAL_SMS,
          component: () => import('../pages/touch/manual-sms/index.vue'),
          meta: {
            title: '手动短信'
          }
        },
        {
          path: 'manual-sms/list',
          name: ROUTE_NAMES.TOUCH.MANUAL_SMS_LIST,
          component: () => import('../pages/touch/manual-sms/list.vue'),
          meta: {
            title: '手动短信列表'
          }
        },
        {
          path: 'policy/template',
          name: ROUTE_NAMES.TOUCH.POLICY_TEMPLATE,
          component: () => import('../pages/touch/policy/template/index.vue'),
          meta: {
            title: '策略模板'
          }
        },
        {
          path: 'query',
          name: 'TouchQuery',
          component: () => import('../pages/touch/query/index.vue'),
          meta: {
            title: '触达查询'
          }
        }
      ]
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
          path: 'unified-metrics',
          name: 'UnifiedMetrics',
          meta: { title: '指标中心' },
          component: () => import('../pages/discovery/unified-metrics/index.vue')
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
        {          path: 'asset-management/batch-asset-management',          name: 'BatchAssetManagement',          meta: { title: '资产批量管理' },          component: () => import('../pages/discovery/asset-management/batch-asset-management/index.vue')        },
        {          path: 'asset-management/external-purchase-register',          name: 'ExternalPurchaseRegister',          meta: { title: '外部数据采购登记' },          component: () => import('../pages/discovery/asset-management/external-purchase-register/index.vue')        }
      ]
    },
    {
      path: '/exploration/customer-center/tag-system/:tagId',
      name: 'TagDetail',
      component: () => import('@/pages/exploration/customer-center/tag-system/tag-detail.vue'),
      meta: {
        title: '标签详情',
        requiresAuth: true
      }
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
        ...explorationRoutes
      ]
    },
    {
      path: ROUTE_PATHS.RISK.ROOT,
      name: ROUTE_NAMES.RISK.ROOT,
      redirect: ROUTE_PATHS.RISK.INDEX,
      children: [
        {
          path: 'index',
          name: ROUTE_NAMES.RISK.INDEX,
          component: () => import('../pages/risk/index.vue'),
          meta: {
            title: '数字风险',
            icon: 'icon-risk'
          }
        }
      ]
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
      path: '/test',
      name: 'Test',
      redirect: '/test/taskflow',
      meta: {
        title: '测试页面',
        icon: 'icon-bug',
        layout: 'blank'
      },
      children: [
        {
          path: 'taskflow',
          name: 'TaskFlowTest',
          component: () => import('../pages/test/TaskFlowTest.vue'),
          meta: {
            title: 'TaskFlow测试',
            description: 'TaskFlow组件功能测试页面',
            layout: 'blank'
          }
        }
      ]
    },
    {
      path: '/',
      redirect: '/home'
    }
  ]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  try {
    const userStore = useUserStore()
    
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 数字社区`
    }
    
    // 白名单路由直接通过
    if (ROUTE_GUARD_CONFIG.whiteList.includes(to.path)) {
      next()
      return
    }
    
    // 检查用户登录状态
    if (!userStore.userInfo?.token) {
      warning('请先登录')
      next({
        path: ROUTE_GUARD_CONFIG.loginPath,
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查路由权限
    if (!checkRoutePermission(to, userStore.userInfo)) {
      error('您没有访问该页面的权限')
      next({ path: ROUTE_GUARD_CONFIG.defaultRedirect })
      return
    }
    
    next()
  } catch (error) {
    console.error('Route guard error:', error)
    error('页面访问异常')
    next({ path: ROUTE_GUARD_CONFIG.defaultRedirect })
  }
})

// 全局后置守卫
router.afterEach((to, from) => {
  try {
    // 设置面包屑
    const breadcrumb = getBreadcrumb(to.name, to)
    if (breadcrumb.length > 0) {
      // 可以将面包屑信息存储到 store 中供组件使用
      console.log('Breadcrumb:', breadcrumb)
    }
    
    // 页面访问统计
    console.log(`Navigation: ${from.path} -> ${to.path}`)
  } catch (error) {
    console.error('After route error:', error)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  error('页面加载失败，请刷新重试')
})

// 默认重定向
router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next('/home')
  } else {
    next()
  }
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