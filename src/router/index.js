import { createRouter, createWebHistory } from 'vue-router'
import marketingRoutes from './marketing'
import managementRoutes from './management'
import explorationRoutes from './exploration'
import notificationRoutes from './notification'
import { ROUTE_NAMES, ROUTE_PATHS, ROUTE_GUARD_CONFIG } from './constants'
import { checkRoutePermission, getBreadcrumb } from './utils'
import { warning, error } from '../utils/message'
import { useUserStore } from '../store/modules/user'
import { loadComponent } from '../utils/componentLoader'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    ...managementRoutes,
    ...notificationRoutes,
    {
      path: '/external-data-archive',
      name: 'ExternalDataArchive',
      component: () => import('../pages/external-data-archive/index.vue'),
      meta: { title: '外数档案管理' }
    },
    {
      path: '/external-data-lifecycle',
      name: 'ExternalDataLifecycle',
      component: () => import('../pages/external-data-lifecycle/index.vue'),
      meta: { title: '外数生命周期' }
    },
    {
      path: '/external-data-service',
      name: 'ExternalDataService',
      component: () => import('../pages/external-data-service/index.vue'),
      meta: { title: '外数数据服务' }
    },
    {
      path: '/external-data-evaluation',
      name: 'ExternalDataEvaluation',
      component: () => import('../pages/external-data-evaluation/index.vue'),
      meta: { title: '外数评估中心' }
    },
    // 顶层别名路由（与探索模块复用组件），用于外数中心完整还原
    {
      path: '/external-data-monitor',
      name: 'ExternalDataMonitorTop',
      component: () => import('../pages/exploration/external-data-analysis/external-data-monitor.vue'),
      meta: { title: '外数监控中心' }
    },
    {
      path: '/external-data-budget-management',
      name: 'ExternalDataBudgetTop',
      component: () => import('../pages/exploration/external-data-analysis/budget-management.vue'),
      meta: { title: '外数预算管理' }
    },
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
    // 社区资源路由
    {
      path: '/community',
      name: 'Community',
      component: () => import('../pages/community/index.vue'),
      meta: {
        title: '社区资源'
      }
    },
    {
      path: '/community/policy',
      name: 'CommunityPolicy',
      component: () => import('../pages/community/policy.vue'),
      meta: {
        title: '政策制度'
      }
    },
    {
      path: '/community/cases',
      name: 'CommunityCases',
      component: () => import('../pages/community/cases.vue'),
      meta: {
        title: '实践案例'
      }
    },
    {
      path: '/community/guide',
      name: 'CommunityGuide',
      component: () => import('../pages/community/guide.vue'),
      meta: {
        title: '操作指南'
      }
    },
    {
      path: '/community/news',
      name: 'CommunityNews',
      component: () => import('../pages/community/news.vue'),
      meta: {
        title: '社区动态'
      }
    },
    // 通知管理路由
    {
      path: '/notification',
      name: 'NotificationRoot',
      redirect: '/notification/list'
    },
    {
      path: '/notification/list',
      name: 'NotificationList',
      component: () => import('../pages/notification/NotificationList.vue'),
      meta: {
        title: '通知管理'
      }
    },
    {
      path: '/notification/create',
      name: 'NotificationCreate',
      component: () => import('../pages/notification/NotificationForm.vue'),
      meta: {
        title: '新增内容'
      }
    },
    {
      path: '/notification/edit/:id',
      name: 'NotificationEdit',
      component: () => import('../pages/notification/NotificationForm.vue'),
      meta: {
        title: '编辑内容'
      }
    },
    {
      path: '/notification/detail/:id',
      name: 'NotificationDetail',
      component: () => import('../pages/notification/NotificationDetail.vue'),
      meta: {
        title: '通知详情'
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
          meta: {
            title: '客户360',
            requiresAuth: true
          }
        },
        {
          path: 'customer360/detail/:userId',
          name: 'Customer360Detail',
          component: () => import('../pages/discovery/customer360/detail.vue'),
          meta: {
            title: '客户360详情',
            requiresAuth: true
          },
          props: true,
          beforeEnter: (to) => {
            if (!/^\d+$/.test(to.params.userId)) {
              return '/discovery/customer360';
            }
          }
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
          path: 'metrics-map/detail/:id',
          name: 'MetricsMapDetail',
          component: () => import('../pages/discovery/metrics-map/detail.vue'),
          meta: {
            title: '指标详情',
            hidden: true
          }
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
          name: 'UnifiedSearch',
          meta: { title: '统一搜索' },
          component: () => import('../pages/discovery/search/index.vue')
        },
        {
          path: 'asset-management/table-management',
          name: 'TableManagement',
          meta: { title: '表管理' },
          component: () => import('../pages/discovery/asset-management/table-management/index.vue')
        },
        {
          path: 'asset-management/table-management/register',
          name: 'TableRegister',
          meta: { title: '注册表单' },
          component: () => import('../pages/discovery/asset-management/table-management/RegisterTableForm.vue')
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
          path: 'asset-management/metric-management/create/edit',
          name: 'MetricCreate',
          meta: { title: '新建指标' },
          component: () => import('../pages/discovery/asset-management/metric-management/MetricDetail.vue')
        },
        {
          path: 'asset-management/metric-management/:id/edit',
          name: 'MetricEdit',
          meta: { title: '编辑指标' },
          component: () => import('../pages/discovery/asset-management/metric-management/MetricDetail.vue'),
          props: true
        },
        {
          path: 'asset-management/metric-management/:id/:mode?',
          name: 'MetricDetail',
          meta: { title: '指标详情' },
          component: () => import('../pages/discovery/asset-management/metric-management/MetricDetail.vue'),
          props: true
        },
        {
          path: 'asset-management/batch-asset-management',
          name: 'BatchAssetManagement',
          meta: { title: '资产批量管理' },
          component: () => import('../pages/discovery/asset-management/batch-asset-management/index.vue')
        },
        {
          path: 'asset-management/external-purchase-register',
          name: 'ExternalPurchaseRegister',
          meta: { title: '外部数据采购登记' },
          component: () => import('../pages/discovery/asset-management/external-purchase-register/index.vue')
        }
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
        },
        {
          path: 'budget-overview',
          name: 'BudgetOverview',
          component: () => import('../pages/budget/BudgetOverview.vue'),
          meta: {
            title: '预算总览'
          }
        },
        {
          path: 'external-data/lifecycle',
          name: 'RiskExternalDataLifecycle',
          component: () => import('../pages/risk/external-data-lifecycle/index.vue'),
          meta: { title: '外数生命周期' }
        },
        {
          path: 'external-data/monitor',
          name: 'RiskExternalDataMonitor',
          component: () => import('../pages/exploration/external-data-analysis/external-data-monitor.vue'),
          meta: { title: '外部数据监控' }
        },
        {
          path: 'external-data/evaluation',
          name: 'RiskExternalDataEvaluation',
          component: () => import('../pages/external-data-evaluation/index.vue'),
          meta: { title: '外部数据评估' }
        },
        {
          path: 'external-data/archive',
          name: 'RiskExternalDataArchive',
          component: () => import('../pages/external-data-archive/index.vue'),
          meta: { title: '外数档案管理' }
        },
        {
          path: 'external-data/service',
          name: 'RiskExternalDataService',
          component: () => import('../pages/external-data-service/index.vue'),
          meta: { title: '外数数据服务' }
        },
        {
          path: 'external-data/budget-management',
          name: 'RiskBudgetManagement',
          component: () => import('../pages/exploration/external-data-analysis/budget-management.vue'),
          meta: { title: '预算管理' }
        }
      ]
    },
    {
      path: '/budget',
      name: 'Budget',
      redirect: '/budget/index',
      children: [
        {
          path: 'index',
          name: 'BudgetIndex',
          component: () => import('../pages/budget/index.vue'),
          meta: { title: '预算管理中心' }
        },
        {
          path: 'list',
          name: 'BudgetList',
          component: () => import('../pages/budget/BudgetList.vue'),
          meta: { title: '预算列表' }
        },
        {
          path: 'create',
          name: 'BudgetCreate',
          component: () => import('../pages/budget/BudgetCreate.vue'),
          meta: { title: '新建预算' }
        },
        {
          path: 'edit/:id',
          name: 'BudgetEdit',
          component: () => import('../pages/budget/BudgetEdit.vue'),
          meta: { title: '编辑预算' }
        },
        {
          path: 'detail/:id',
          name: 'BudgetDetail',
          component: () => import('../pages/budget/BudgetDetail.vue'),
          meta: { title: '预算详情' },
          props: true
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
      redirect: '/test/canvas-validation',
      meta: {
        title: '测试页面',
        icon: 'icon-bug',
        layout: 'blank'
      },
      children: [
        {
          path: 'canvas-validation',
          name: 'CanvasValidationTest',
          component: () => import('../pages/test/CanvasValidationTest.vue'),
          meta: {
            title: '画布校验测试',
            description: '画布数据校验功能测试页面',
            layout: 'blank'
          }
        },
        {
          path: 'button-test',
          name: 'ButtonTest',
          component: () => import('../pages/test/button-test.vue'),
          meta: {
            title: '按钮测试',
            description: 'audience-create页面按钮显示测试',
            layout: 'blank'
          }
        },
        {
          path: 'canvas',
          name: 'TestCanvas',
          component: () => import('../pages/test-canvas.vue'),
          meta: {
            title: 'TaskFlowCanvas测试',
            description: 'TaskFlowCanvas组件功能测试页面',
            layout: 'blank'
          }
        },
        {
          path: 'preview-system',
          name: 'TestPreviewSystem',
          component: () => import('../pages/test-preview-system.vue'),
          meta: {
            title: '预览线系统测试',
            description: 'window.previewLineSystem全局实例测试页面',
            layout: 'blank'
          }
        },
        {
          path: 'preview-line',
          name: 'PreviewLineTest',
          component: () => import('../pages/preview-line-test.vue'),
          meta: {
            title: '预览线功能测试',
            description: '预览线功能完整性测试页面',
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

// 增强的全局前置守卫
router.beforeEach(async (to, from, next) => {
  console.log(`🚀 [路由导航] ${from.path || '/'} → ${to.path}`)
  
  try {
    const userStore = useUserStore()
    
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 数字社区`
      console.log(`📄 [页面标题] ${to.meta.title}`)
    }
    
    // 白名单路由直接通过
    if (ROUTE_GUARD_CONFIG.whiteList.includes(to.path)) {
      console.log('✅ [路由导航] 白名单路由，直接通过')
      next()
      return
    }
    
    // 检查用户登录状态
    if (!userStore.userInfo?.token) {
      console.log('🔒 [权限检查] 用户未登录，重定向到登录页')
      warning('请先登录')
      next({
        path: ROUTE_GUARD_CONFIG.loginPath,
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查路由权限
    if (!checkRoutePermission(to, userStore.userInfo)) {
      console.warn('⚠️ [权限检查] 权限不足，无法访问该页面')
      console.error('您没有访问该页面的权限')
      next({ path: ROUTE_GUARD_CONFIG.defaultRedirect })
      return
    }
    
    // 添加组件加载监控
    console.log('🔍 Component loading monitor:', {
      route: to.path,
      name: to.name,
      component: to.matched[to.matched.length - 1]?.components?.default?.toString?.() || 'Unknown'
    })
    
    console.log('✅ [路由导航] 权限检查通过')
    next()
  } catch (err) {
    console.group('❌ [路由守卫错误]')
    console.error('错误详情:', err)
    console.error('目标路由:', to)
    console.error('来源路由:', from)
    console.error('错误类型:', err.name)
    console.error('是否语法错误:', err.name === 'SyntaxError')
    console.error('是否保留字错误:', err.message && err.message.includes('reserved word'))
    console.groupEnd()
    console.error('页面访问异常')
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
  } catch (err) {
    console.error('After route error:', err)
  }
})

// 增强的路由错误处理
router.onError((routerError) => {
  console.group('🚨 [路由错误详情]')
  console.error('错误类型:', routerError.name)
  console.error('错误消息:', routerError.message)
  console.error('错误堆栈:', routerError.stack)
  
  // 检查是否是语法错误
  if (routerError.name === 'SyntaxError') {
    console.error('🔍 语法错误详情:')
    console.error('- 错误位置:', routerError.fileName || '未知文件')
    console.error('- 行号:', routerError.lineNumber || '未知行号')
    console.error('- 列号:', routerError.columnNumber || '未知列号')
  }
  
  // 检查是否是组件加载错误
  if (routerError.message && routerError.message.includes('import')) {
    console.error('🔍 组件导入错误，可能的原因:')
    console.error('- 组件文件不存在')
    console.error('- 组件文件存在语法错误')
    console.error('- 组件导出格式不正确')
  }
  
  console.groupEnd()
  
  // 使用正确的 error 函数调用
  error(`页面加载失败: ${routerError.message || '未知错误'}，请刷新重试`)
})

// 默认重定向逻辑已在主beforeEach中处理

// 打印完整路由结构
router.getRoutes().forEach((route) => {
  console.log('Registered route:', {
    path: route.path,
    name: route.name,
    children: route.children?.map((child) => ({
      path: child.path,
      name: child.name
    }))
  })
})

export default router